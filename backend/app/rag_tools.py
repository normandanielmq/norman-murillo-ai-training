"""RAG pipeline: load HR Policy PDFs, chunk, vectorize, and search with ChromaDB.

Kept separate from vacation/HR CRUD tools to maintain a clean separation of concerns.
Embeddings use ChromaDB's built-in sentence-transformers model (all-MiniLM-L6-v2 via ONNX)
so no extra API key or network call is required for vectorization.
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Any

from google.generativeai.types import FunctionDeclaration
from langchain_core.embeddings import Embeddings

logger = logging.getLogger(__name__)

DOCS_DIR = Path(__file__).resolve().parent.parent / "session-7-mock-docs"

_lock = threading.Lock()
_vector_store: Any = None  # langchain_chroma.Chroma, built lazily


class _ChromaDefaultEmbeddings(Embeddings):
    """LangChain-compatible wrapper around ChromaDB's built-in DefaultEmbeddingFunction.

    Uses all-MiniLM-L6-v2 (ONNX) locally — no API key or network call required.
    """

    def __init__(self) -> None:
        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

        self._fn = DefaultEmbeddingFunction()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[float(x) for x in v] for v in self._fn(texts)]

    def embed_query(self, text: str) -> list[float]:
        return [float(x) for x in self._fn([text])[0]]


def _build_vector_store() -> Any:
    """Load all HR Policy PDFs, chunk them, embed with ChromaDB's default embeddings, and store in-memory.

    Uses ChromaDB's built-in sentence-transformers embedding function (all-MiniLM-L6-v2 via ONNX)
    so no additional API key or network call is required for vectorization.
    """
    from langchain_chroma import Chroma
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    embeddings = _ChromaDefaultEmbeddings()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    pdf_paths = sorted(DOCS_DIR.glob("*.pdf"))
    if not pdf_paths:
        raise RuntimeError(f"No PDF files found in {DOCS_DIR}. Check that session-7-mock-docs/ exists.")

    all_docs = []
    for pdf_path in pdf_paths:
        try:
            loader = PyPDFLoader(str(pdf_path))
            pages = loader.load()
            chunks = splitter.split_documents(pages)
            all_docs.extend(chunks)
            logger.info("RAG: loaded %d chunks from %s", len(chunks), pdf_path.name)
        except Exception as exc:
            logger.warning("RAG: skipping %s — could not load: %s", pdf_path.name, exc)

    if not all_docs:
        raise RuntimeError("No document chunks were produced from the HR Policy PDFs.")

    logger.info("RAG: building in-memory ChromaDB with %d total chunks…", len(all_docs))
    store = Chroma.from_documents(all_docs, embeddings)
    logger.info("RAG: vector store ready.")
    return store


def get_vector_store() -> Any:
    """Return the module-level ChromaDB singleton, building it on first call (thread-safe)."""
    global _vector_store
    if _vector_store is not None:
        return _vector_store
    with _lock:
        if _vector_store is None:
            _vector_store = _build_vector_store()
    return _vector_store


def search_hr_policy(query: str, k: int = 4) -> dict[str, Any]:
    """Semantic similarity search over all HR Policy PDFs.

    Returns the top-k most relevant document chunks ranked by relevance.
    """
    if not query or not query.strip():
        return {"error": "query must not be empty.", "results": []}

    try:
        store = get_vector_store()
    except RuntimeError as exc:
        return {"error": str(exc), "results": []}

    try:
        docs = store.similarity_search(query.strip(), k=k)
    except Exception as exc:
        logger.error("RAG search failed: %s", exc)
        return {"error": f"Vector search error: {exc}", "results": []}

    results = []
    for doc in docs:
        source_path = doc.metadata.get("source", "")
        source_name = Path(source_path).name if source_path else "unknown"
        results.append(
            {
                "content": doc.page_content,
                "source": source_name,
                "page": doc.metadata.get("page", 0),
            }
        )

    return {"results": results, "query": query, "total": len(results)}


def rag_function_declaration() -> FunctionDeclaration:
    """Gemini FunctionDeclaration for the semantic HR policy search tool."""
    return FunctionDeclaration(
        name="search_hr_policy",
        description=(
            "Search the HR company policy documents using semantic similarity. "
            "Use this tool whenever a user asks about company policies, rules, or guidelines — "
            "including topics like remote work, PTO / vacation accrual, dress code, "
            "benefits, maternity/paternity leave, health & safety, discipline, "
            "union relations, profit sharing, disability insurance, or any other HR policy. "
            "Returns relevant excerpts from the official policy PDFs."
        ),
        parameters={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "The policy question or topic to search for, e.g. "
                        "'What is the remote work policy?' or 'How many vacation days do USA employees get?'"
                    ),
                },
            },
            "required": ["query"],
        },
    )
