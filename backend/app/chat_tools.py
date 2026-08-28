"""Gemini function-calling tools: HR queries, guarded vacation writes, RAG policy search, and MCP filesystem."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from google.generativeai.types import FunctionDeclaration, Tool
from google.protobuf.json_format import MessageToDict

from .mcp_tools import call_mcp_filesystem, mcp_function_declarations
from .rag_tools import rag_function_declaration, search_hr_policy
from .repositories import dashboard_repo, employee_repo, project_repo, vacation_repo
from .vacation_guardrails import validate_time_off_request

_MCP_DOCS_DIR = Path(__file__).resolve().parent.parent / "session-7-mock-docs"

# --- Result shaping ---

_SENSITIVE_KEYS = frozenset({"nationalId"})


def _employee_public(d: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in d.items() if k not in _SENSITIVE_KEYS}


def _employees_public(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [_employee_public(e) for e in rows]


_MAX_SEARCH_PAGE_SIZE = 50


def _vacation_iso_date(raw: Any) -> str:
    return str(raw or "").strip()[:10]


def _coerce_int_arg(args: dict[str, Any], *keys: str) -> int | None:
    """Parse first present key as int (Gemini may send floats or alternate key names)."""
    for key in keys:
        if key not in args or args[key] is None:
            continue
        raw = args[key]
        if isinstance(raw, bool):
            continue
        try:
            return int(round(float(raw)))
        except (TypeError, ValueError):
            continue
    return None


def function_call_args_to_dict(fc: Any) -> dict[str, Any]:
    """Normalize Gemini FunctionCall.args (Struct or dict) to a plain dict."""
    raw = getattr(fc, "args", None)
    if raw is None:
        return {}
    if isinstance(raw, dict):
        return raw
    try:
        return MessageToDict(raw)
    except Exception:
        return {}


def execute_hr_tool(conn: sqlite3.Connection, name: str, raw_args: dict[str, Any]) -> dict[str, Any]:
    """Run the named tool with coerced arguments; always returns JSON-serializable dict."""
    args = dict(raw_args)

    try:
        if name == "hr_get_dashboard_summary":
            return _tool_dashboard_summary(conn)

        if name == "hr_list_projects":
            return {"projects": project_repo.list_projects(conn)}

        if name == "hr_search_employees":
            page = max(1, int(args.get("page", 1) or 1))
            page_size = min(_MAX_SEARCH_PAGE_SIZE, max(1, int(args.get("pageSize", 20) or 20)))
            country = args.get("country") or None
            if country is not None:
                country = str(country).strip() or None
            gender = args.get("gender") or None
            if gender is not None:
                gender = str(gender).strip() or None
            project_id = _coerce_int_arg(args, "projectId", "project_id")
            sort_by = str(args.get("sortBy", "name") or "name")
            sort_order = str(args.get("sortOrder", "asc") or "asc").lower()
            if sort_order not in ("asc", "desc"):
                sort_order = "asc"

            result = employee_repo.list_paged(
                conn,
                page=page,
                page_size=page_size,
                country=country,
                gender=gender,
                project_id=project_id,
                sort_by=sort_by,
                sort_order=sort_order,
            )
            emps = result.get("employees") or []
            total = int(result.get("total") or 0)
            shown_so_far = (page - 1) * page_size + len(emps)
            return {
                "employees": _employees_public(emps),
                "total": total,
                "page": result.get("page", page),
                "pageSize": result.get("pageSize", page_size),
                "morePagesAvailable": shown_so_far < total,
            }

        if name == "hr_get_employee_details":
            eid = _coerce_int_arg(args, "employeeId", "employee_id")
            if eid is None:
                return {"error": "Missing employeeId.", "hint": "Pass employeeId as an integer."}
            row = employee_repo.get_by_id(conn, eid)
            if row is None:
                return {"found": False, "error": f"No employee with id {eid}."}
            return {"found": True, "employee": _employee_public(row)}

        if name == "hr_list_employees_on_project":
            pid = _coerce_int_arg(args, "projectId", "project_id")
            if pid is None:
                # Fall back to projectName lookup so the model can pass the name it already has.
                pname = str(args.get("projectName") or "").strip()
                if pname:
                    pid = project_repo.find_project_id_by_name(conn, pname)
                    if pid is None:
                        return {
                            "error": f"No project found matching name '{pname}'.",
                            "hint": "Call hr_list_projects to see valid project names and ids.",
                        }
                else:
                    return {
                        "error": "Missing projectId or projectName.",
                        "hint": (
                            "Pass projectId (integer) or projectName (the project's name string). "
                            "Both are visible in hr_list_projects results."
                        ),
                    }
            rows = project_repo.list_employees_for_project(conn, pid)
            return {"employees": _employees_public(rows)}

        if name == "hr_list_projects_for_employee":
            eid = _coerce_int_arg(args, "employeeId", "employee_id")
            if eid is None:
                return {"error": "Missing employeeId.", "hint": "Pass employeeId as an integer."}
            rows = project_repo.list_projects_for_employee(conn, eid)
            return {"projects": rows}

        if name == "hr_get_gender_counts_by_project":
            pid = args.get("projectId")
            rows = dashboard_repo.aggregate_gender_counts_by_project_raw(conn)
            if pid is not None:
                pid_i = int(pid)
                rows = [r for r in rows if int(r.get("projectId", -1)) == pid_i]
            return {"breakdown": rows}

        if name == "check_vacation_eligibility":
            eid = _coerce_int_arg(args, "employeeId", "employee_id")
            if eid is None:
                return {"error": "Missing employeeId.", "hint": "Pass employeeId as an integer."}
            start = _vacation_iso_date(args.get("startDate"))
            end = _vacation_iso_date(args.get("endDate"))
            vr = validate_time_off_request(conn, eid, start, end)
            return {"eligible": vr.ok, "reasons": vr.reasons}

        if name == "book_time_off":
            eid = _coerce_int_arg(args, "employeeId", "employee_id")
            if eid is None:
                return {"error": "Missing employeeId.", "hint": "Pass employeeId as an integer."}
            start = _vacation_iso_date(args.get("startDate"))
            end = _vacation_iso_date(args.get("endDate"))
            vr = validate_time_off_request(conn, eid, start, end)
            if not vr.ok:
                return {"ok": False, "reasons": vr.reasons}
            booking_id = vacation_repo.insert_vacation(conn, eid, start, end)
            return {"ok": True, "bookingId": booking_id}

        if name == "search_hr_policy":
            query = str(args.get("query") or "").strip()
            if not query:
                return {"error": "Missing 'query' argument for search_hr_policy."}
            return search_hr_policy(query)

        if name == "mcp_list_directory":
            return call_mcp_filesystem("list_directory", {"path": str(_MCP_DOCS_DIR)})

        if name == "mcp_read_file":
            path = str(args.get("path") or "").strip()
            if not path:
                return {"error": "Missing 'path' argument for mcp_read_file."}
            return call_mcp_filesystem("read_file", {"path": path})

        return {"error": f"Unknown tool: {name}"}
    except KeyError as exc:
        return {"error": f"Missing required argument: {exc.args[0]}"}
    except (TypeError, ValueError) as exc:
        return {"error": f"Invalid arguments: {exc}"}


def _tool_dashboard_summary(conn: sqlite3.Connection) -> dict[str, Any]:
    return {
        "totalEmployees": dashboard_repo.count_all_employees(conn),
        "employeesByCountry": dashboard_repo.aggregate_employees_by_country(conn),
        "headcountByProject": dashboard_repo.aggregate_headcount_by_project(conn),
        "employeesOnAtLeastOneProject": dashboard_repo.count_employees_on_at_least_one_project(
            conn
        ),
    }


def hr_tool_definitions() -> Tool:
    """Declarations exposed to Gemini (HR reads + guarded vacation writes + RAG policy search + MCP filesystem)."""
    return Tool(
        function_declarations=[
            rag_function_declaration(),
            *mcp_function_declarations(),
            FunctionDeclaration(
                name="hr_get_dashboard_summary",
                description=(
                    "Returns organization-wide headline stats: total employee count, counts by "
                    "country, headcount per project, and how many employees are assigned to at "
                    "least one project. Use for questions like totals, distributions, or "
                    "dashboard-style summaries."
                ),
                parameters={
                    "type": "object",
                    "properties": {},
                },
            ),
            FunctionDeclaration(
                name="hr_list_projects",
                description="Lists all HR projects with id, name, and description.",
                parameters={"type": "object", "properties": {}},
            ),
            FunctionDeclaration(
                name="hr_search_employees",
                description=(
                    "Search and page through employees with optional filters. Supports filtering "
                    "by country, gender, or membership on a specific project_id. Results are "
                    "paginated; use page and pageSize for next pages. Maximum pageSize is 50."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "country": {
                            "type": "string",
                            "description": "Exact country label as stored (optional).",
                        },
                        "gender": {"type": "string", "description": "Exact gender label (optional)."},
                        "projectId": {
                            "type": "integer",
                            "description": "If set, only employees assigned to this project.",
                        },
                        "page": {"type": "integer", "description": "1-based page index (default 1)."},
                        "pageSize": {
                            "type": "integer",
                            "description": "Rows per page (default 20, max 50).",
                        },
                        "sortBy": {
                            "type": "string",
                            "description": (
                                "One of: id, name, email, country, gender, hireDate, officialTitle, "
                                "dateOfBirth (default name)."
                            ),
                        },
                        "sortOrder": {"type": "string", "description": "asc or desc (default asc)."},
                    },
                },
            ),
            FunctionDeclaration(
                name="hr_get_employee_details",
                description=(
                    "Load one employee by numeric employeeId (internal id). Omits sensitive "
                    "national identifier from the payload."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "employeeId": {"type": "integer", "description": "Employee primary key."},
                    },
                    "required": ["employeeId"],
                },
            ),
            FunctionDeclaration(
                name="hr_list_employees_on_project",
                description=(
                    "Lists every employee assigned to one project. "
                    "Pass EITHER projectId (the integer id) OR projectName (the project's name "
                    "string). Both are returned by hr_list_projects. "
                    "Prefer projectName when you already have the project's name from the "
                    "conversation; use projectId when you have the integer. "
                    "Never call this tool with both fields empty."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "projectId": {
                            "type": "integer",
                            "description": "Numeric project id (use this if you know the integer id).",
                        },
                        "projectName": {
                            "type": "string",
                            "description": (
                                "Project name string (use this if you know the name but not the id). "
                                "Case-insensitive partial match is supported."
                            ),
                        },
                    },
                },
            ),
            FunctionDeclaration(
                name="hr_list_projects_for_employee",
                description="Lists all projects assigned to a given employeeId.",
                parameters={
                    "type": "object",
                    "properties": {
                        "employeeId": {"type": "integer", "description": "Employee primary key."},
                    },
                    "required": ["employeeId"],
                },
            ),
            FunctionDeclaration(
                name="hr_get_gender_counts_by_project",
                description=(
                    "Gender breakdown counts per project. Optionally pass projectId to restrict "
                    "to one project."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "projectId": {
                            "type": "integer",
                            "description": "If omitted, returns all projects.",
                        },
                    },
                },
            ),
            FunctionDeclaration(
                name="check_vacation_eligibility",
                description=(
                    "Checks whether an employee may book time off for an inclusive date range "
                    "(ISO YYYY-MM-DD). Enforces no weekends and project staffing (>=50% team "
                    "available on each day for multi-person projects). Does not write data."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "employeeId": {"type": "integer"},
                        "startDate": {"type": "string", "description": "Start date YYYY-MM-DD."},
                        "endDate": {"type": "string", "description": "End date YYYY-MM-DD inclusive."},
                    },
                    "required": ["employeeId", "startDate", "endDate"],
                },
            ),
            FunctionDeclaration(
                name="book_time_off",
                description=(
                    "Books approved time off by inserting a vacation record when all guardrails "
                    "pass (same rules as check_vacation_eligibility). Call check first if unsure."
                ),
                parameters={
                    "type": "object",
                    "properties": {
                        "employeeId": {"type": "integer"},
                        "startDate": {"type": "string", "description": "Start date YYYY-MM-DD."},
                        "endDate": {"type": "string", "description": "End date YYYY-MM-DD inclusive."},
                    },
                    "required": ["employeeId", "startDate", "endDate"],
                },
            ),
        ]
    )


HR_TOOLS = hr_tool_definitions()
