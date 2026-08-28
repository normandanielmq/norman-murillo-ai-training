"""Shared Gemini tool-use loop and worker-node factory.

Exports
-------
run_worker_loop   — core Gemini tool-use loop called by every worker node.
make_worker_node  — factory that creates a LangGraph-compatible node callable
                    from an allowed-tool set and a display label; eliminates the
                    boilerplate that was repeated across vacation/policy/general node files.
"""

from __future__ import annotations

import os
import sqlite3
from typing import Any, Callable

import google.generativeai as genai
from google.generativeai import protos
from google.generativeai.types import FunctionDeclaration, Tool

from ..chat_tools import execute_hr_tool, function_call_args_to_dict
from ..chat_service import (
    ChatGeminiError,
    _SYSTEM_INSTRUCTION,
    _TOOL_TRACE_LABELS,
    _backfill_args,
    _conversation_to_contents,
    _extract_text,
    _function_calls_from_response,
    _inject_entity_context,
)


def run_worker_loop(
    *,
    conn: sqlite3.Connection,
    messages: list[dict],
    entities: dict,
    api_key: str,
    tools: Tool,
    node_label: str,
) -> tuple[str, list[dict]]:
    """Execute the Gemini tool-use loop for one worker node.

    Parameters
    ----------
    conn:
        Open SQLite connection for tool execution.
    messages:
        Full conversation history (already entity-annotated).
    entities:
        Pre-extracted entities from Agent 1 (for arg backfilling).
    api_key:
        Gemini API key.
    tools:
        The ``Tool`` object whose ``FunctionDeclaration`` list is scoped to
        this worker node's domain.
    node_label:
        Short name used in debug output (e.g. ``"VACATION"``).

    Returns
    -------
    reply:
        Final natural-language answer from the model.
    trace:
        List of ``{"tool": str, "label": str}`` dicts for the UI trace.
    """
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    max_rounds = int(os.environ.get("CHAT_MAX_TOOL_ROUNDS", "12"))

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=_SYSTEM_INSTRUCTION,
    )

    last_user_msg = next(
        (m.get("content", "") for m in reversed(messages) if m.get("role") == "user"),
        "",
    )

    contents = _conversation_to_contents(messages)
    trace: list[dict] = []

    print(f"\n[{node_label}] Starting tool-use loop — model={model_name}")

    try:
        response = model.generate_content(contents, tools=[tools])
    except Exception as exc:
        raise ChatGeminiError(f"Gemini request failed: {exc}") from exc

    _stall_nudge_sent = False

    for round_num in range(1, max_rounds + 1):
        print(f"[{node_label}] Round {round_num}")

        pf = getattr(response, "prompt_feedback", None)
        if pf and getattr(pf, "block_reason", None):
            raise ChatGeminiError("Prompt was blocked by safety filters.")

        if not getattr(response, "candidates", None):
            raise ChatGeminiError("Empty model response.")

        calls = _function_calls_from_response(response)
        if not calls:
            try:
                text = _extract_text(response)
                if not str(text).strip():
                    raise ChatGeminiError("Model returned an empty answer.")
                print(f"[{node_label}] Final reply ready ({len(text)} chars)")
                return text, trace
            except ChatGeminiError as exc:
                if _stall_nudge_sent:
                    raise
                _stall_nudge_sent = True
                print(f"[{node_label}] Stall detected — sending recovery nudge")
                model_content = getattr(response.candidates[0], "content", None)
                if model_content is not None:
                    contents.append(model_content)
                contents.append(
                    protos.Content(
                        role="user",
                        parts=[protos.Part(text="Please now write your final answer to the user.")],
                    )
                )
                try:
                    response = model.generate_content(contents, tools=[tools])
                except Exception as exc2:
                    raise ChatGeminiError(f"Gemini request failed: {exc2}") from exc2
                continue

        print(f"[{node_label}] Tool calls: {[fc.name for fc in calls]}")
        contents.append(response.candidates[0].content)

        fr_parts: list[protos.Part] = []
        for fc in calls:
            label = _TOOL_TRACE_LABELS.get(fc.name, "Running HR tools…")
            trace.append({"tool": fc.name, "label": label})
            args = function_call_args_to_dict(fc)
            filled_args = _backfill_args(fc.name, args, entities, last_user_msg=last_user_msg)
            result = execute_hr_tool(conn, fc.name, filled_args)
            fr_parts.append(
                protos.Part(
                    function_response=protos.FunctionResponse(name=fc.name, response=result)
                )
            )

        contents.append(protos.Content(role="user", parts=fr_parts))

        try:
            response = model.generate_content(contents, tools=[tools])
        except Exception as exc:
            raise ChatGeminiError(f"Gemini request failed: {exc}") from exc

    raise ChatGeminiError(
        f"Stopped after {max_rounds} tool rounds; try a narrower question or raise CHAT_MAX_TOOL_ROUNDS."
    )


def make_worker_node(allowed_tools: frozenset[str], node_label: str) -> Callable[[dict], dict]:
    """Return a LangGraph node function scoped to a subset of HR tools.

    Parameters
    ----------
    allowed_tools:
        Set of tool names to expose to the LLM for this node.
    node_label:
        Short uppercase label used in debug output (e.g. ``"VACATION"``).

    Returns
    -------
    A callable ``node(state) -> dict`` ready to pass to ``StateGraph.add_node``.
    The returned tool object is built and cached once when the factory is called,
    not on every graph invocation.
    """
    from ..chat_tools import hr_tool_definitions

    all_decls = hr_tool_definitions().function_declarations
    scoped: list[FunctionDeclaration] = [d for d in all_decls if d.name in allowed_tools]
    tools = Tool(function_declarations=scoped)

    def _node(state: dict) -> dict:
        db_path = state["db_path"]
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        try:
            reply, trace = run_worker_loop(
                conn=conn,
                messages=state["messages"],
                entities=state["entities"],
                api_key=state["api_key"],
                tools=tools,
                node_label=node_label,
            )
        finally:
            conn.close()
        return {"reply": reply, "agent_trace": trace}

    _node.__name__ = f"{node_label.lower()}_node"
    _node.__qualname__ = f"{node_label.lower()}_node"
    return _node
