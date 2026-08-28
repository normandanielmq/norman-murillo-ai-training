"""Dashboard aggregates."""

from __future__ import annotations

import sqlite3
from typing import Any


def aggregate_employees_by_country(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT country, COUNT(*) AS c FROM employees GROUP BY country
        """
    ).fetchall()
    return [{"country": r["country"], "count": int(r["c"])} for r in rows]


def count_all_employees(conn: sqlite3.Connection) -> int:
    row = conn.execute("SELECT COUNT(*) FROM employees").fetchone()
    return int(row[0]) if row else 0


def count_employees_on_at_least_one_project(conn: sqlite3.Connection) -> int:
    row = conn.execute(
        "SELECT COUNT(DISTINCT employee_id) AS c FROM employee_projects"
    ).fetchone()
    return int(row["c"]) if row is not None else 0


def aggregate_headcount_by_project(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    project_rows = conn.execute("SELECT id, name FROM projects").fetchall()
    count_rows = conn.execute(
        """
        SELECT project_id, COUNT(*) AS c
        FROM employee_projects
        GROUP BY project_id
        """
    ).fetchall()
    by_project = {int(r["project_id"]): int(r["c"]) for r in count_rows}
    out = [
        {
            "projectId": int(r["id"]),
            "projectName": r["name"],
            "count": by_project.get(int(r["id"]), 0),
        }
        for r in project_rows
    ]
    out.sort(key=lambda x: x["projectId"])
    return out


def aggregate_gender_counts_by_project_raw(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
          ep.project_id AS project_id,
          p.name AS project_name,
          e.gender AS gender,
          COUNT(*) AS c
        FROM employee_projects ep
        INNER JOIN employees e ON e.id = ep.employee_id
        INNER JOIN projects p ON p.id = ep.project_id
        GROUP BY ep.project_id, p.name, e.gender
        """
    ).fetchall()
    return [
        {
            "projectId": int(r["project_id"]),
            "projectName": r["project_name"],
            "gender": r["gender"],
            "count": int(r["c"]),
        }
        for r in rows
    ]
