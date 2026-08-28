"""Employee CRUD and paged listing."""

from __future__ import annotations

import sqlite3
from typing import Any


def employee_row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "nationalId": row["national_id"],
        "phone": row["phone"],
        "country": row["country"],
        "gender": row["gender"],
        "dateOfBirth": row["date_of_birth"],
        "officialTitle": row["official_title"],
        "hireDate": row["hire_date"],
        "createdAt": row["created_at"],
    }


def list_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        "SELECT * FROM employees ORDER BY id ASC",
    ).fetchall()
    return [employee_row_to_dict(r) for r in rows]


_SORT_COLUMNS = {
    "id": "id",
    "name": "name",
    "email": "email",
    "nationalId": "national_id",
    "country": "country",
    "gender": "gender",
    "hireDate": "hire_date",
    "officialTitle": "official_title",
    "dateOfBirth": "date_of_birth",
}


def list_paged(
    conn: sqlite3.Connection,
    *,
    page: int,
    page_size: int,
    country: str | None,
    gender: str | None,
    project_id: int | None,
    sort_by: str,
    sort_order: str,
) -> dict[str, Any]:
    conditions: list[str] = []
    params: list[Any] = []

    if country:
        conditions.append("country = ?")
        params.append(country)
    if gender:
        conditions.append("gender = ?")
        params.append(gender)

    project_filter_empty = False
    if project_id is not None:
        member_rows = conn.execute(
            "SELECT employee_id FROM employee_projects WHERE project_id = ?",
            (project_id,),
        ).fetchall()
        ids = [r[0] for r in member_rows]
        if len(ids) == 0:
            project_filter_empty = True
        else:
            placeholders = ",".join("?" * len(ids))
            conditions.append(f"id IN ({placeholders})")
            params.extend(ids)

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    if project_filter_empty:
        return {
            "employees": [],
            "total": 0,
            "page": page,
            "pageSize": page_size,
        }

    sort_col = _SORT_COLUMNS.get(sort_by, "name")
    order_kw = "DESC" if sort_order == "desc" else "ASC"

    count_row = conn.execute(
        f"SELECT COUNT(*) FROM employees {where_clause}",
        params,
    ).fetchone()
    total = int(count_row[0]) if count_row else 0

    offset = (page - 1) * page_size
    rows = conn.execute(
        f"""
        SELECT * FROM employees
        {where_clause}
        ORDER BY {sort_col} {order_kw}, id ASC
        LIMIT ? OFFSET ?
        """,
        [*params, page_size, offset],
    ).fetchall()

    base = [employee_row_to_dict(r) for r in rows]
    employees = attach_project_names(conn, base)
    return {
        "employees": employees,
        "total": total,
        "page": page,
        "pageSize": page_size,
    }


def attach_project_names(
    conn: sqlite3.Connection,
    employees: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not employees:
        return []
    ids = [e["id"] for e in employees]
    placeholders = ",".join("?" * len(ids))
    rows = conn.execute(
        f"""
        SELECT ep.employee_id AS employee_id, p.name AS project_name
        FROM employee_projects ep
        INNER JOIN projects p ON p.id = ep.project_id
        WHERE ep.employee_id IN ({placeholders})
        """,
        ids,
    ).fetchall()

    by_employee: dict[int, set[str]] = {}
    for r in rows:
        eid = r["employee_id"]
        name = r["project_name"]
        if eid not in by_employee:
            by_employee[eid] = set()
        by_employee[eid].add(name)

    out: list[dict[str, Any]] = []
    for e in employees:
        names = by_employee.get(e["id"])
        project_names = ", ".join(sorted(names)) if names else ""
        out.append({**e, "projectNames": project_names})
    return out


def get_by_id(conn: sqlite3.Connection, id_: int) -> dict[str, Any] | None:
    row = conn.execute("SELECT * FROM employees WHERE id = ?", (id_,)).fetchone()
    return employee_row_to_dict(row) if row else None


def exists_by_national_id_and_country(
    conn: sqlite3.Connection,
    national_id: str,
    country: str,
    exclude_id: int | None,
) -> bool:
    if exclude_id is not None:
        row = conn.execute(
            """
            SELECT id FROM employees
            WHERE national_id = ? AND country = ? AND id != ?
            """,
            (national_id, country, exclude_id),
        ).fetchone()
    else:
        row = conn.execute(
            "SELECT id FROM employees WHERE national_id = ? AND country = ?",
            (national_id, country),
        ).fetchone()
    return row is not None


def create(
    conn: sqlite3.Connection,
    dto: dict[str, Any],
) -> dict[str, Any] | dict[str, str]:
    if exists_by_national_id_and_country(conn, dto["nationalId"], dto["country"], None):
        return {"error": "Duplicate National ID in the same country."}

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    cur = conn.execute(
        """
        INSERT INTO employees (
          name, email, national_id, phone, country, gender,
          date_of_birth, official_title, hire_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            dto["name"],
            dto["email"],
            dto["nationalId"],
            dto["phone"],
            dto["country"],
            dto["gender"],
            dto["dateOfBirth"],
            dto["officialTitle"],
            dto["hireDate"],
            now,
        ),
    )
    conn.commit()
    new_id = int(cur.lastrowid)
    emp = get_by_id(conn, new_id)
    assert emp is not None
    return {"employee": emp}


def update(
    conn: sqlite3.Connection,
    id_: int,
    dto: dict[str, Any],
) -> dict[str, Any] | dict[str, str] | None:
    existing = get_by_id(conn, id_)
    if existing is None:
        return None

    national_id = dto.get("nationalId", existing["nationalId"])
    country = dto.get("country", existing["country"])
    if exists_by_national_id_and_country(conn, national_id, country, id_):
        return {"error": "Duplicate National ID in the same country."}

    merged = {
        "name": dto.get("name", existing["name"]),
        "email": dto.get("email", existing["email"]),
        "nationalId": national_id,
        "phone": dto.get("phone", existing["phone"]),
        "country": country,
        "gender": dto.get("gender", existing["gender"]),
        "dateOfBirth": dto.get("dateOfBirth", existing["dateOfBirth"]),
        "officialTitle": dto.get("officialTitle", existing["officialTitle"]),
        "hireDate": dto.get("hireDate", existing["hireDate"]),
    }

    conn.execute(
        """
        UPDATE employees SET
          name = ?, email = ?, national_id = ?, phone = ?, country = ?,
          gender = ?, date_of_birth = ?, official_title = ?, hire_date = ?
        WHERE id = ?
        """,
        (
            merged["name"],
            merged["email"],
            merged["nationalId"],
            merged["phone"],
            merged["country"],
            merged["gender"],
            merged["dateOfBirth"],
            merged["officialTitle"],
            merged["hireDate"],
            id_,
        ),
    )
    conn.commit()
    return {"employee": get_by_id(conn, id_)}


def delete_by_id(conn: sqlite3.Connection, id_: int) -> bool:
    conn.execute("DELETE FROM employee_projects WHERE employee_id = ?", (id_,))
    cur = conn.execute("DELETE FROM employees WHERE id = ?", (id_,))
    conn.commit()
    return cur.rowcount > 0
