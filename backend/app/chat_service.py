"""Gemini-backed replies via HR tools (queries + guarded vacation writes)."""

from __future__ import annotations

import os
import re
import sqlite3
from typing import Any

from google.generativeai import protos

from .prompts import HR_ASSISTANT_PROMPT

_SYSTEM_INSTRUCTION = HR_ASSISTANT_PROMPT


class ChatGeminiError(Exception):
    """Raised when the model returns nothing usable or the SDK errors."""


_TOOL_TRACE_LABELS: dict[str, str] = {
    "check_vacation_eligibility": "Checking vacation eligibility…",
    "book_time_off": "Recording time off…",
    "hr_get_dashboard_summary": "Gathering dashboard statistics…",
    "hr_list_projects": "Loading projects…",
    "hr_search_employees": "Searching employees…",
    "hr_get_employee_details": "Loading employee details…",
    "hr_list_employees_on_project": "Checking project team…",
    "hr_list_projects_for_employee": "Loading assigned projects…",
    "hr_get_gender_counts_by_project": "Loading gender breakdown…",
    "search_hr_policy": "Searching HR policy documents…",
    "mcp_read_file": "Reading file via MCP filesystem…",
    "mcp_list_directory": "Listing documents via MCP filesystem…",
}


_MAX_HISTORY_TURNS = 40


def _finish_hint(response: Any) -> str:
    """Return a debug hint like ' (finish_reason=STOP)' from a response."""
    if getattr(response, "candidates", None):
        fr = getattr(response.candidates[0], "finish_reason", None)
        if fr is not None:
            name = getattr(fr, "name", str(fr))
            return f" (finish_reason={name})"
    return ""


def _extract_text(response: Any) -> str:
    """Pull the first readable text from a Gemini response; raise ChatGeminiError if none."""
    try:
        text = getattr(response, "text", None)
        if text and str(text).strip():
            return str(text).strip()
    except Exception:
        pass
    parts: list[str] = []
    if getattr(response, "candidates", None):
        content = getattr(response.candidates[0], "content", None)
        if content is not None:
            for part in getattr(content, "parts", []) or []:
                # Use SDK-style proto membership check to skip non-text parts.
                if "text" in part and getattr(part, "text", None):
                    parts.append(str(part.text))
    joined = "\n".join(parts).strip()
    if joined:
        return joined
    raise ChatGeminiError(
        "The model did not return readable text (blocked, empty, or non-text-only response)."
        + _finish_hint(response)
    )


def _conversation_to_contents(conversation: list[dict[str, str]]) -> list[Any]:
    """Build Gemini Content list from UI turns (user | assistant -> model)."""
    if not conversation:
        raise ChatGeminiError("Conversation is empty.")
    if conversation[-1].get("role") != "user":
        raise ChatGeminiError("Last message in conversation must be from the user.")
    last_text = (conversation[-1].get("content") or "").strip()
    if not last_text:
        raise ChatGeminiError("Last user message is empty.")

    trimmed = conversation[-_MAX_HISTORY_TURNS:]
    contents: list[Any] = []
    for msg in trimmed:
        role = msg.get("role", "")
        text = (msg.get("content") or "").strip()
        if not text:
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append(protos.Content(role=gemini_role, parts=[protos.Part(text=text)]))
    if not contents:
        raise ChatGeminiError("Conversation has no messages to send.")
    if getattr(contents[-1], "role", None) != "user":
        raise ChatGeminiError("Last message in conversation must be from the user.")
    return contents


# ---------------------------------------------------------------------------
# Agent 1 — Python DB-aware entity extractor (no LLM call)
# ---------------------------------------------------------------------------

def _extract_entities_from_db(
    conn: sqlite3.Connection,
    user_message: str,
) -> dict[str, Any]:
    """Deterministic entity resolver: match user message against live DB records.

    Priority order:
      1. Explicit numeric ID patterns  → resolves project by id
      2. Project name substring match  → resolves project by name (longest match wins)
      3. ISO date patterns             → startDate / endDate
      4. Employee id patterns

    Returns an empty dict when nothing is found, causing the conversation to pass
    through unchanged (graceful no-op).
    """
    from .repositories import project_repo

    entities: dict[str, Any] = {}
    msg_lower = user_message.lower()

    # 1. Explicit project ID: "(ID: 11)", "project id 11", "project 11", "id: 11"
    id_match = (
        re.search(r"\(id[:\s]+(\d+)\)", msg_lower)
        or re.search(r"\bproject(?:\s+id)?\s+(\d+)\b", msg_lower)
        or re.search(r"\bid[:\s]+(\d+)\b", msg_lower)
    )
    if id_match:
        pid = int(id_match.group(1))
        entities["projectId"] = pid
        project = project_repo.get_project_by_id(conn, pid)
        if project:
            entities["projectName"] = project["name"]
        return entities

    # 2. Project name match against DB — longest name wins to avoid false-positives.
    projects = project_repo.list_projects(conn)
    for project in sorted(projects, key=lambda p: len(p["name"]), reverse=True):
        if project["name"].lower() in msg_lower:
            entities["projectId"] = project["id"]
            entities["projectName"] = project["name"]
            return entities

    # 3. ISO date patterns (YYYY-MM-DD); first = startDate, second = endDate.
    dates = re.findall(r"\b(\d{4}-\d{2}-\d{2})\b", user_message)
    if dates:
        entities["startDate"] = dates[0]
    if len(dates) >= 2:
        entities["endDate"] = dates[1]

    # 4. Explicit employee ID: "employee id 7", "employee 7", "emp id: 7"
    emp_match = re.search(r"\bemployee(?:\s+id)?\s+(\d+)\b", msg_lower) or re.search(
        r"\bemp(?:loyee)?[:\s]+(\d+)\b", msg_lower
    )
    if emp_match:
        entities["employeeId"] = int(emp_match.group(1))

    return entities


def _inject_entity_context(
    conversation: list[dict[str, str]],
    entities: dict[str, Any],
) -> list[dict[str, str]]:
    """Bridge: append a directive to the last user turn with the extracted entities.

    When a project is identified (projectId or projectName), the annotation is
    formatted as [REQUIRED: Call <tool> with <params>] — a mandatory directive that
    Agent 2's system instruction treats as a forced tool call.

    For non-project entities (dates, employeeId) a softer [Context: ...] hint is used
    since the tool routing is less deterministic.

    Returns a new list; the original conversation is not mutated.
    """
    if not entities:
        return conversation

    project_parts: list[str] = []
    if "projectId" in entities:
        project_parts.append(f"projectId={entities['projectId']}")
    if "projectName" in entities:
        project_parts.append(f'projectName="{entities["projectName"]}"')

    other_parts: list[str] = []
    if "employeeId" in entities:
        other_parts.append(f"employeeId={entities['employeeId']}")
    if "startDate" in entities:
        other_parts.append(f"startDate={entities['startDate']}")
    if "endDate" in entities:
        other_parts.append(f"endDate={entities['endDate']}")

    lines: list[str] = []
    if project_parts:
        lines.append(
            "[REQUIRED: Call hr_list_employees_on_project with "
            + ", ".join(project_parts)
            + "]"
        )
    if other_parts:
        lines.append("[Context: " + ", ".join(other_parts) + "]")

    if not lines:
        return conversation

    annotation = "\n".join(lines)
    result = list(conversation)
    for i in range(len(result) - 1, -1, -1):
        if result[i].get("role") == "user":
            result[i] = {**result[i], "content": result[i]["content"] + "\n" + annotation}
            break
    return result


# ---------------------------------------------------------------------------
# Agent 2 helpers (text/function-call extraction + arg backfilling)
# ---------------------------------------------------------------------------

def _function_calls_from_response(response: Any) -> list[Any]:
    if not getattr(response, "candidates", None):
        return []
    cand = response.candidates[0]
    content = getattr(cand, "content", None)
    if content is None:
        return []
    # Use "in" (proto-plus membership) to reliably detect the function_call oneof.
    return [p.function_call for p in (getattr(content, "parts", None) or []) if "function_call" in p]


def _backfill_args(
    tool_name: str,
    args: dict[str, Any],
    entities: dict[str, Any],
    last_user_msg: str = "",
) -> dict[str, Any]:
    """Fill in missing tool arguments using entities extracted by Agent 1.

    Gemini (especially thinking models like 2.5-flash) reliably picks the right
    tool but sometimes sends empty args. Since Agent 1 already did deterministic
    DB-based extraction, we can safely backfill here without any hallucination risk.

    For search_hr_policy, if no query was provided, the user's own message is the
    best possible query — backfilling it avoids a wasted round-trip.
    """
    if tool_name == "search_hr_policy" and not args.get("query") and last_user_msg:
        return {**args, "query": last_user_msg}

    if not entities:
        return args

    result = dict(args)

    if tool_name in ("hr_list_employees_on_project", "hr_search_employees"):
        if not result.get("projectId") and not result.get("projectName"):
            if entities.get("projectId"):
                result["projectId"] = entities["projectId"]
            if entities.get("projectName"):
                result["projectName"] = entities["projectName"]

    if tool_name in (
        "hr_get_employee_details",
        "hr_list_projects_for_employee",
        "check_vacation_eligibility",
        "book_time_off",
    ):
        if not result.get("employeeId") and entities.get("employeeId"):
            result["employeeId"] = entities["employeeId"]

    if tool_name in ("check_vacation_eligibility", "book_time_off"):
        if not result.get("startDate") and entities.get("startDate"):
            result["startDate"] = entities["startDate"]
        if not result.get("endDate") and entities.get("endDate"):
            result["endDate"] = entities["endDate"]

    return result


def _dbg(label: str, value: Any = None) -> None:
    """Print a debug line to stdout; visible in the uvicorn console."""
    sep = "─" * 60
    if value is None:
        print(f"\n[CHAT DEBUG] {label}")
    else:
        import pprint
        formatted = pprint.pformat(value, width=100, compact=True)
        print(f"\n[CHAT DEBUG] {label}\n{sep}\n{formatted}\n{sep}")


def generate_reply(
    conn: sqlite3.Connection,
    conversation: list[dict[str, str]],
    api_key: str,
) -> tuple[str, list[dict], str]:
    """Orchestrate the HR multi-agent LangGraph pipeline and return (reply, tool trace, intent).

    Flow
    ----
    1. Agent 1 (deterministic Python): entity extraction + context injection.
    2. LangGraph StateGraph:
       a. Router Node  — Gemini classifies intent (vacation | policy | general_hr).
       b. Worker Node  — Gemini tool-use loop scoped to the classified intent domain.
    """
    from .graph.graph import get_graph
    from .database import DEFAULT_DB_PATH

    # --- Agent 1: Python DB-aware entity extractor (no LLM call) ---
    last_user_msg = next(
        (m.get("content", "") for m in reversed(conversation) if m.get("role") == "user"),
        "",
    )
    _dbg("AGENT 1 INPUT  — last user message", last_user_msg)

    entities = _extract_entities_from_db(conn, last_user_msg)
    _dbg("AGENT 1 OUTPUT — extracted entities", entities)

    conversation = _inject_entity_context(conversation, entities)
    injected_msg = next(
        (m.get("content", "") for m in reversed(conversation) if m.get("role") == "user"),
        "",
    )
    _dbg("AGENT 1 OUTPUT — injected user message", injected_msg)

    # --- LangGraph: Router → Worker ---
    db_path = str(getattr(conn, "database", None) or DEFAULT_DB_PATH)
    _dbg(f"LANGGRAPH START — db_path={db_path}  history_turns={len(conversation)}")

    initial_state = {
        "messages": conversation,
        "intent": "",
        "entities": entities,
        "api_key": api_key,
        "db_path": db_path,
        "reply": "",
        "agent_trace": [],
    }

    graph = get_graph()
    result = graph.invoke(initial_state)

    reply = result.get("reply", "")
    trace = result.get("agent_trace", [])
    intent = result.get("intent", "")

    if not reply:
        raise ChatGeminiError("LangGraph pipeline returned an empty reply.")

    _dbg(f"LANGGRAPH DONE — intent={intent}  reply_len={len(reply)}")
    return reply, trace, intent


def _truncate_tool_result(result: dict[str, Any]) -> dict[str, Any]:
    """Shorten large list fields in tool results so debug output stays readable."""
    out = {}
    for k, v in result.items():
        if isinstance(v, list) and len(v) > 5:
            out[k] = v[:5] + [f"… ({len(v)} total)"]
        else:
            out[k] = v
    return out
