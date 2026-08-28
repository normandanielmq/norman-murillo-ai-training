"""Code-level guardrails for vacation booking (Session 6). LLM cannot bypass these checks."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import date, timedelta
from .repositories import employee_repo, project_repo, vacation_repo


@dataclass(frozen=True)
class VacationGuardrailResult:
    ok: bool
    reasons: list[str]


def _daterange_inclusive(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def _parse_iso(d: str) -> date | None:
    raw = (d or "").strip()
    if not raw:
        return None
    try:
        return date.fromisoformat(raw[:10])
    except ValueError:
        return None


def _weekend_violation(start: date, end: date) -> bool:
    """True if any day in the inclusive range is Saturday or Sunday."""
    for d in _daterange_inclusive(start, end):
        if d.weekday() >= 5:
            return True
    return False


def _capacity_ok_for_project(
    conn: sqlite3.Connection,
    *,
    project_id: int,
    employee_id: int,
    proposed_start: date,
    proposed_end: date,
    existing_by_employee: dict[int, list[tuple[date, date]]],
) -> tuple[bool, str | None]:
    """
    Enforce >= 50% of the team still available each day (not on vacation).
    Skipped when the project has only one assigned member.
    Team availability fraction = present_count / N where present = N - absent_count.
    """
    member_ids = project_repo.list_employee_ids_for_project(conn, project_id)
    n = len(member_ids)
    if n <= 1:
        return True, None

    for d in _daterange_inclusive(proposed_start, proposed_end):
        absent: set[int] = set()

        for mid in member_ids:
            if mid == employee_id:
                absent.add(mid)
                continue
            for vr_start, vr_end in existing_by_employee.get(mid, []):
                if vr_start <= d <= vr_end:
                    absent.add(mid)
                    break

        present = n - len(absent)
        # Need present/N >= 0.5  <=>  2 * present >= n
        if 2 * present < n:
            pname_row = conn.execute(
                "SELECT name FROM projects WHERE id = ?", (project_id,)
            ).fetchone()
            pname = pname_row["name"] if pname_row else str(project_id)
            frac = present / n if n else 0.0
            return False, (
                f"Project “{pname}” would drop below 50% capacity on {d.isoformat()} "
                f"(approximately {frac:.0%} available with this request and existing time off)."
            )

    return True, None


def validate_time_off_request(
    conn: sqlite3.Connection,
    employee_id: int,
    start_iso: str,
    end_iso: str,
) -> VacationGuardrailResult:
    """
    Validates a proposed booking (weekends, overlaps, project capacity).
    Used by both check_vacation_eligibility and book_time_off.
    """
    reasons: list[str] = []

    if employee_repo.get_by_id(conn, employee_id) is None:
        return VacationGuardrailResult(False, [f"No employee found with id {employee_id}."])

    start_d = _parse_iso(start_iso)
    end_d = _parse_iso(end_iso)
    if start_d is None or end_d is None:
        return VacationGuardrailResult(False, ["startDate and endDate must be ISO dates (YYYY-MM-DD)."])
    if start_d > end_d:
        return VacationGuardrailResult(False, ["startDate cannot be after endDate."])

    if _weekend_violation(start_d, end_d):
        reasons.append(
            "Time off cannot include a Saturday or Sunday. Choose weekdays only."
        )

    if vacation_repo.employee_has_overlapping_vacation(conn, employee_id, start_iso[:10], end_iso[:10]):
        reasons.append("This employee already has overlapping time off in that period.")

    project_ids = project_repo.list_project_ids_for_employee(conn, employee_id)

    # Build vacation ranges per employee for all members of relevant projects (for capacity).
    relevant_ids: set[int] = {employee_id}
    for pid in project_ids:
        for mid in project_repo.list_employee_ids_for_project(conn, pid):
            relevant_ids.add(mid)

    rows = vacation_repo.list_for_employees(conn, sorted(relevant_ids))
    existing_by_employee: dict[int, list[tuple[date, date]]] = {}
    for row in rows:
        eid = int(row["employeeId"])
        rs = _parse_iso(row["startDate"])
        re = _parse_iso(row["endDate"])
        if rs is None or re is None:
            continue
        existing_by_employee.setdefault(eid, []).append((rs, re))

    for pid in project_ids:
        ok, msg = _capacity_ok_for_project(
            conn,
            project_id=pid,
            employee_id=employee_id,
            proposed_start=start_d,
            proposed_end=end_d,
            existing_by_employee=existing_by_employee,
        )
        if not ok and msg:
            reasons.append(msg)

    if reasons:
        return VacationGuardrailResult(False, reasons)
    return VacationGuardrailResult(True, [])
