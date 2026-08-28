"""HR assistant chat backed by Gemini + SQLite context."""

from __future__ import annotations

import os
import sqlite3
from typing import Annotated, Any, Dict, List, Literal, Optional, Union

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

from ..chat_service import ChatGeminiError, generate_reply
from ..database import connect

router = APIRouter(prefix="/internal", tags=["chat"])


def get_db() -> sqlite3.Connection:
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()


Db = Annotated[sqlite3.Connection, Depends(get_db)]


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=32000)


class ChatBody(BaseModel):
    """Send either `messages` (full thread, last turn must be user) or legacy single `message`."""

    message: Optional[str] = Field(None, max_length=8000)
    messages: Optional[List[ChatTurn]] = None

    @model_validator(mode="after")
    def validate_payload(self) -> "ChatBody":
        if self.messages is not None and len(self.messages) > 0:
            if self.messages[-1].role != "user":
                raise ValueError("Last message in messages must have role user.")
            return self
        if self.message is not None and self.message.strip():
            return self
        raise ValueError("Provide a non-empty message or a messages array whose last item is from the user.")


@router.post("/chat", response_model=None)
def chat_assistant(db: Db, body: ChatBody) -> Union[Dict[str, Any], JSONResponse]:
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return JSONResponse(
            {
                "error": "Gemini API key is not configured.",
                "details": [
                    "Set GEMINI_API_KEY in the environment for the FastAPI process "
                    "(for example in backend/.env and load it before uvicorn, or export it in the shell)."
                ],
            },
            status_code=503,
        )

    if body.messages is not None and len(body.messages) > 0:
        conversation = [{"role": t.role, "content": t.content.strip()} for t in body.messages]
    else:
        conversation = [{"role": "user", "content": body.message.strip()}]

    try:
        reply, agent_trace, intent = generate_reply(db, conversation, api_key)
        return {"reply": reply, "agentTrace": agent_trace, "intent": intent}
    except ChatGeminiError as exc:
        return JSONResponse(
            {"error": "Assistant could not produce an answer.", "details": [str(exc)]},
            status_code=502,
        )
