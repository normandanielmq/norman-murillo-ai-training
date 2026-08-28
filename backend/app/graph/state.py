"""Shared LangGraph state object for the HR multi-agent pipeline."""

from __future__ import annotations

from typing_extensions import TypedDict

Intent = str  # "vacation" | "policy" | "general_hr"


class HRGraphState(TypedDict):
    """State that flows through every node in the HR StateGraph.

    Fields
    ------
    messages:
        Full conversation history as ``{"role": str, "content": str}`` dicts.
        Set once before the graph is invoked; nodes read but do not modify it.
    intent:
        Classified intent set by the Router Node.
        One of: ``"vacation"``, ``"policy"``, ``"general_hr"``.
    entities:
        Pre-extracted entities from the deterministic Agent-1 step (employee /
        project names resolved against the DB). Passed as context to worker nodes.
    api_key:
        Gemini API key forwarded from the request context.
    db_path:
        Absolute path to the SQLite database file. Worker nodes open their own
        connection from this path (LangGraph state must be serializable).
    reply:
        Final natural-language answer produced by the worker node.
    agent_trace:
        Ordered list of human-readable step labels collected during execution
        (e.g. ``[{"tool": "book_time_off", "label": "Recording time off…"}]``).
    """

    messages: list[dict]
    intent: Intent
    entities: dict
    api_key: str
    db_path: str
    reply: str
    agent_trace: list[dict]
