"""FastAPI entry: HR Portal SQLite backend."""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from .database import connect

load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=True)
from .rag_tools import get_vector_store
from .routers.chat import router as chat_router
from .routers.internal_repo import router as internal_repo_router
from .seed_data import seed_if_empty

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = connect()
    try:
        seed_if_empty(conn)
    finally:
        conn.close()

    # Eagerly build the RAG vector store so the first chat request isn't slow.
    # Uses local ONNX embeddings — no API key required for this step.
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, get_vector_store)
        logger.info("RAG vector store initialized successfully.")
    except Exception as exc:
        logger.warning("RAG vector store could not be initialized at startup: %s", exc)

    yield


app = FastAPI(title="HR Portal Backend", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(internal_repo_router)
app.include_router(chat_router)
