"""Vacation / time-off rows (Session 6)."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from typing import Any


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": int(row["id"]),
        "employeeId": int(row["employee_id"]),
        "startDate": row["start_date"],
        "endDate": row["end_date"],
        "createdAt": row["created_at"],
    }


def list_for_employees(conn: sqlite3.Connection, employee_ids: list[int]) -> list[dict[str, Any]]:
    if not employee_ids:
        return []
    placeholders = ",".join("?" * len(employee_ids))
    rows = conn.execute(
        f"""
        SELECT * FROM vacation_requests
        WHERE employee_id IN ({placeholders})
        ORDER BY start_date ASC, id ASC
        """,
        employee_ids,
    ).fetchall()
    return [row_to_dict(r) for r in rows]


def employee_has_overlapping_vacation(
    conn: sqlite3.Connection,
    employee_id: int,
    start_date: str,
    end_date: str,
    *,
    exclude_request_id: int | None = None,
) -> bool:
    """True if an existing vacation row overlaps [start_date, end_date] inclusive (ISO dates)."""
    q = """
        SELECT 1 FROM vacation_requests
        WHERE employee_id = ?
          AND NOT (end_date < ? OR start_date > ?)
        """
    params: list[Any] = [employee_id, start_date, end_date]
    if exclude_request_id is not None:
        q += " AND id != ?"
        params.append(exclude_request_id)
    row = conn.execute(q, params).fetchone()
    return row is not None


def insert_vacation(
    conn: sqlite3.Connection,
    employee_id: int,
    start_date: str,
    end_date: str,
) -> int:
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    cur = conn.execute(
        """
        INSERT INTO vacation_requests (employee_id, start_date, end_date, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (employee_id, start_date, end_date, now),
    )
    conn.commit()
    return int(cur.lastrowid)
