"""Seed fixtures aligned with src/lib/seed-employees.ts and seed-projects.ts."""

from __future__ import annotations

import os
import sqlite3
from datetime import date, timedelta

SEED_EMPLOYEES: list[dict[str, str]] = [
    {
        "name": "Johnathan Doe",
        "email": "j.doe@hrsystems.com",
        "nationalId": "482-99-1022",
        "phone": "+1 555-201-3344",
        "country": "United States",
        "gender": "Male",
        "dateOfBirth": "1985-03-14",
        "officialTitle": "Senior Systems Architect",
        "hireDate": "2021-01-12",
    },
    {
        "name": "Alice Smith",
        "email": "a.smith@hrsystems.com",
        "nationalId": "931-44-8821",
        "phone": "+44 20 7946 0958",
        "country": "United Kingdom",
        "gender": "Female",
        "dateOfBirth": "1990-07-22",
        "officialTitle": "Principal Designer",
        "hireDate": "2022-03-22",
    },
    {
        "name": "Robert Chen",
        "email": "r.chen@hrsystems.com",
        "nationalId": "221-88-3341",
        "phone": "+1 416-555-0192",
        "country": "Canada",
        "gender": "Male",
        "dateOfBirth": "1988-11-05",
        "officialTitle": "Frontend Lead",
        "hireDate": "2023-11-05",
    },
    {
        "name": "Maria García",
        "email": "m.garcia@hrsystems.com",
        "nationalId": "556-12-7744",
        "phone": "+34 912 345 678",
        "country": "Spain",
        "gender": "Female",
        "dateOfBirth": "1982-06-15",
        "officialTitle": "HR Operations Manager",
        "hireDate": "2020-06-15",
    },
    {
        "name": "James Okonkwo",
        "email": "j.okonkwo@hrsystems.com",
        "nationalId": "778-33-0099",
        "phone": "+234 801 234 5678",
        "country": "Nigeria",
        "gender": "Male",
        "dateOfBirth": "1992-09-01",
        "officialTitle": "Backend Engineer",
        "hireDate": "2022-09-01",
    },
    {
        "name": "Yuki Tanaka",
        "email": "y.tanaka@hrsystems.com",
        "nationalId": "112-67-5543",
        "phone": "+81 3-1234-5678",
        "country": "Japan",
        "gender": "Female",
        "dateOfBirth": "1991-04-20",
        "officialTitle": "Product Manager",
        "hireDate": "2021-04-20",
    },
]

SEED_PROJECTS: list[dict[str, str]] = [
    {
        "name": "HR Portal 2.0",
        "description": (
            "Self-service HR redesign: time off, org chart, and policy docs. "
            "Phased rollout starting Q2."
        ),
    },
    {
        "name": "Engineering onboarding platform",
        "description": (
            "Central hub for new hires—checklists, repo access templates, and mentor pairing."
        ),
    },
    {
        "name": "Compliance & audit tooling",
        "description": (
            "Internal tools to track attestations, export audit trails, and schedule reviews."
        ),
    },
    {"name": "Project Alpha", "description": "Pilot initiative for cross-functional workflow automation."},
    {"name": "Beta Launch", "description": "Staged rollout of the customer-facing analytics dashboard."},
    {"name": "Data lake migration", "description": "Move historical HR extracts to the new warehouse schema."},
    {"name": "Mobile field app", "description": "Offline-capable inspections and time capture for remote teams."},
    {"name": "Security hardening 2025", "description": "SSO upgrades, secrets rotation, and dependency baselines."},
    {"name": "Payroll integration EU", "description": "Connect regional payroll providers for multi-country payouts."},
    {"name": "Learning hub refresh", "description": "Replace legacy LMS shell with searchable curricula and badges."},
    {"name": "Vendor risk registry", "description": "Single source of truth for third-party assessments and renewals."},
    {"name": "Accessibility audit backlog", "description": "WCAG remediation tickets grouped by product surface."},
    {"name": "Internal API gateway", "description": "Rate limits, keys, and observability for service-to-service calls."},
    {"name": "Green office initiative", "description": "Track emissions, travel policy, and office energy retrofits."},
    {"name": "Incident response playbooks", "description": "Runbooks and comms templates for Sev1 and Sev2 events."},
]

SEED_EMPLOYEE_PROJECT_LINKS: list[dict[str, int]] = [
    {"employeeId": 1, "projectId": 1},
    {"employeeId": 2, "projectId": 1},
    {"employeeId": 3, "projectId": 1},
    {"employeeId": 3, "projectId": 2},
    {"employeeId": 5, "projectId": 2},
    {"employeeId": 6, "projectId": 2},
    {"employeeId": 1, "projectId": 3},
    {"employeeId": 4, "projectId": 3},
    {"employeeId": 1, "projectId": 4},
    {"employeeId": 2, "projectId": 4},
    {"employeeId": 1, "projectId": 6},
    {"employeeId": 2, "projectId": 6},
    {"employeeId": 3, "projectId": 6},
    {"employeeId": 4, "projectId": 6},
    {"employeeId": 5, "projectId": 6},
    {"employeeId": 6, "projectId": 6},
    {"employeeId": 1, "projectId": 7},
    {"employeeId": 2, "projectId": 7},
    {"employeeId": 3, "projectId": 7},
    {"employeeId": 4, "projectId": 8},
    {"employeeId": 5, "projectId": 9},
    {"employeeId": 6, "projectId": 10},
    {"employeeId": 2, "projectId": 11},
    {"employeeId": 3, "projectId": 11},
    {"employeeId": 1, "projectId": 12},
    {"employeeId": 5, "projectId": 12},
]

COUNTRIES = [
    "United States",
    "Canada",
    "United Kingdom",
    "Spain",
    "Japan",
    "Nigeria",
]
GENDERS = ["Male", "Female", "Other"]
TITLES = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Backend Engineer",
    "HR Operations Manager",
    "Frontend Lead",
    "Principal Designer",
    "Senior Systems Architect",
]
MAX_BULK = 1000


def _iso_from_day_index(day_index: int) -> str:
    base = date(1970, 1, 1) + timedelta(days=day_index)
    return base.isoformat()


def parse_bulk_seed_count() -> int:
    raw = os.environ.get("SEED_BULK_COUNT")
    if raw is None or raw == "":
        return 0
    try:
        n = int(raw)
    except ValueError:
        return 0
    return max(0, min(n, MAX_BULK))


def generate_bulk_employee_rows(count: int) -> list[dict[str, str]]:
    n = max(0, min(count, MAX_BULK))
    out: list[dict[str, str]] = []
    for i in range(1, n + 1):
        country = COUNTRIES[(i - 1) % len(COUNTRIES)]
        dob = _iso_from_day_index(3650 + i)
        hire = _iso_from_day_index(8000 + i * 2)
        out.append(
            {
                "name": f"Bulk Employee {i}",
                "email": f"bulk.employee.{i}@example.test",
                "nationalId": f"BULK-{str(i).zfill(8)}",
                "phone": f"+1 555-{str(200 + (i % 700)).zfill(3)}-{str(10000 + i)[-4:]}",
                "country": country,
                "gender": GENDERS[(i - 1) % len(GENDERS)],
                "dateOfBirth": dob,
                "officialTitle": TITLES[(i - 1) % len(TITLES)],
                "hireDate": hire,
            }
        )
    return out


def generate_bulk_employee_project_links(bulk_count: int, base_employee_count: int) -> list[dict[str, int]]:
    links: list[dict[str, int]] = []
    num_projects = len(SEED_PROJECTS)
    for i in range(1, bulk_count + 1):
        employee_id = base_employee_count + i
        if employee_id % 10 >= 7:
            continue
        project_id = ((employee_id - 1) % num_projects) + 1
        links.append({"employeeId": employee_id, "projectId": project_id})
    return links


def seed_if_empty(conn: sqlite3.Connection) -> None:
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    bulk_n = parse_bulk_seed_count()

    cur = conn.execute("SELECT COUNT(*) FROM employees")
    if cur.fetchone()[0] == 0:
        for e in SEED_EMPLOYEES:
            conn.execute(
                """
                INSERT INTO employees (
                  name, email, national_id, phone, country, gender,
                  date_of_birth, official_title, hire_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    e["name"],
                    e["email"],
                    e["nationalId"],
                    e["phone"],
                    e["country"],
                    e["gender"],
                    e["dateOfBirth"],
                    e["officialTitle"],
                    e["hireDate"],
                    now,
                ),
            )

        for e in generate_bulk_employee_rows(bulk_n):
            conn.execute(
                """
                INSERT INTO employees (
                  name, email, national_id, phone, country, gender,
                  date_of_birth, official_title, hire_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    e["name"],
                    e["email"],
                    e["nationalId"],
                    e["phone"],
                    e["country"],
                    e["gender"],
                    e["dateOfBirth"],
                    e["officialTitle"],
                    e["hireDate"],
                    now,
                ),
            )

    existing_projects = conn.execute("SELECT COUNT(*) FROM projects").fetchone()[0]
    if existing_projects == 0:
        for p in SEED_PROJECTS:
            conn.execute(
                "INSERT INTO projects (name, description, created_at) VALUES (?, ?, ?)",
                (p["name"], p["description"], now),
            )
        for link in SEED_EMPLOYEE_PROJECT_LINKS:
            conn.execute(
                "INSERT INTO employee_projects (employee_id, project_id) VALUES (?, ?)",
                (link["employeeId"], link["projectId"]),
            )
        base = len(SEED_EMPLOYEES)
        if bulk_n > 0:
            for link in generate_bulk_employee_project_links(bulk_n, base):
                conn.execute(
                    "INSERT INTO employee_projects (employee_id, project_id) VALUES (?, ?)",
                    (link["employeeId"], link["projectId"]),
                )

    conn.commit()
