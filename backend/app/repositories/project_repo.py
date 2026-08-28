"""Projects and employee–project assignments."""

from __future__ import annotations

import sqlite3
from typing import Any

from .employee_repo import employee_row_to_dict


def project_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "createdAt": row["created_at"],
    }


def find_project_id_by_name(conn: sqlite3.Connection, name: str) -> int | None:
    """Case-insensitive substring match; returns the first matching project id or None."""
    needle = name.strip().lower()
    rows = conn.execute("SELECT id, name FROM projects ORDER BY id ASC").fetchall()
    # Prefer exact match first, then substring.
    for row in rows:
        if row["name"].lower() == needle:
            return int(row["id"])
    for row in rows:
        if needle in row["name"].lower():
            return int(row["id"])
    return None


def list_projects(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute("SELECT * FROM projects ORDER BY id ASC").fetchall()
    return [project_row_to_dict(r) for r in rows]


def list_projects_with_team_preview(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    projects = list_projects(conn)
    result: list[dict[str, Any]] = []
    for p in projects:
        employees = list_employees_for_project(conn, p["id"])
        team_preview = [{"id": e["id"], "name": e["name"], "email": e["email"]} for e in employees[:3]]
        result.append(
            {
                **p,
                "memberCount": len(employees),
                "teamPreview": team_preview,
            }
        )
    return result


def get_project_by_id(conn: sqlite3.Connection, id_: int) -> dict[str, Any] | None:
    row = conn.execute("SELECT * FROM projects WHERE id = ?", (id_,)).fetchone()
    return project_row_to_dict(row) if row else None


def create_project(conn: sqlite3.Connection, dto: dict[str, Any]) -> dict[str, Any]:
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    cur = conn.execute(
        "INSERT INTO projects (name, description, created_at) VALUES (?, ?, ?)",
        (dto["name"], dto["description"], now),
    )
    conn.commit()
    new_id = int(cur.lastrowid)
    return get_project_by_id(conn, new_id)  # type: ignore[return-value]


def update_project(
    conn: sqlite3.Connection,
    id_: int,
    dto: dict[str, Any],
) -> dict[str, Any] | None:
    existing = get_project_by_id(conn, id_)
    if existing is None:
        return None
    conn.execute(
        "UPDATE projects SET name = ?, description = ? WHERE id = ?",
        (
            dto.get("name", existing["name"]),
            dto.get("description", existing["description"]),
            id_,
        ),
    )
    conn.commit()
    return get_project_by_id(conn, id_)


def delete_project_by_id(conn: sqlite3.Connection, id_: int) -> bool:
    conn.execute("DELETE FROM employee_projects WHERE project_id = ?", (id_,))
    cur = conn.execute("DELETE FROM projects WHERE id = ?", (id_,))
    conn.commit()
    return cur.rowcount > 0


def assignment_exists(conn: sqlite3.Connection, employee_id: int, project_id: int) -> bool:
    row = conn.execute(
        """
        SELECT 1 FROM employee_projects
        WHERE employee_id = ? AND project_id = ?
        """,
        (employee_id, project_id),
    ).fetchone()
    return row is not None


def assign_employee_to_project(
    conn: sqlite3.Connection,
    employee_id: int,
    project_id: int,
    start_date: str | None,
) -> dict[str, Any]:
    if assignment_exists(conn, employee_id, project_id):
        return {"error": "This employee is already assigned to this project."}
    sd = start_date.strip() if start_date and start_date.strip() else None
    try:
        conn.execute(
            """
            INSERT INTO employee_projects (employee_id, project_id, start_date)
            VALUES (?, ?, ?)
            """,
            (employee_id, project_id, sd),
        )
        conn.commit()
        return {"ok": True}
    except sqlite3.IntegrityError:
        return {"error": "This employee is already assigned to this project."}


def unassign_employee_from_project(
    conn: sqlite3.Connection,
    employee_id: int,
    project_id: int,
) -> bool:
    cur = conn.execute(
        """
        DELETE FROM employee_projects
        WHERE employee_id = ? AND project_id = ?
        """,
        (employee_id, project_id),
    )
    conn.commit()
    return cur.rowcount > 0


def list_project_ids_for_employee(conn: sqlite3.Connection, employee_id: int) -> list[int]:
    rows = conn.execute(
        "SELECT project_id FROM employee_projects WHERE employee_id = ? ORDER BY project_id",
        (employee_id,),
    ).fetchall()
    return [r[0] for r in rows]


def list_employee_ids_for_project(conn: sqlite3.Connection, project_id: int) -> list[int]:
    rows = conn.execute(
        "SELECT employee_id FROM employee_projects WHERE project_id = ? ORDER BY employee_id",
        (project_id,),
    ).fetchall()
    return [r[0] for r in rows]


def list_projects_for_employee(conn: sqlite3.Connection, employee_id: int) -> list[dict[str, Any]]:
    ids = list_project_ids_for_employee(conn, employee_id)
    if not ids:
        return []
    placeholders = ",".join("?" * len(ids))
    rows = conn.execute(
        f"SELECT * FROM projects WHERE id IN ({placeholders}) ORDER BY id ASC",
        ids,
    ).fetchall()
    return [project_row_to_dict(r) for r in rows]


def list_employees_for_project(conn: sqlite3.Connection, project_id: int) -> list[dict[str, Any]]:
    ids = list_employee_ids_for_project(conn, project_id)
    if not ids:
        return []
    placeholders = ",".join("?" * len(ids))
    rows = conn.execute(
        f"SELECT * FROM employees WHERE id IN ({placeholders}) ORDER BY id ASC",
        ids,
    ).fetchall()
    return [employee_row_to_dict(r) for r in rows]
