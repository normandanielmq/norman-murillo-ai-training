# Seed projects and assignments

When the app starts, if the `projects` table is empty, the in-memory database is filled with sample projects and `employee_projects` rows. Employee IDs match the order in [seed-employees.md](./seed-employees.md) (1 = Johnathan Doe, …, 6 = Yuki Tanaka).

There are **15** seed projects so the **Project Management** table can exercise **pagination** (5 rows per page → 3 pages).

## Projects

| ID | Name |
|----|------|
| 1 | HR Portal 2.0 |
| 2 | Engineering onboarding platform |
| 3 | Compliance & audit tooling |
| 4 | Project Alpha |
| 5 | Beta Launch |
| 6 | Data lake migration |
| 7 | Mobile field app |
| 8 | Security hardening 2025 |
| 9 | Payroll integration EU |
| 10 | Learning hub refresh |
| 11 | Vendor risk registry |
| 12 | Accessibility audit backlog |
| 13 | Internal API gateway |
| 14 | Green office initiative |
| 15 | Incident response playbooks |

Full descriptions live in `frontend/src/lib/seed-projects.ts`.

## Employee ↔ project links

| Employee (ID)     | Projects |
|-------------------|----------|
| 1 — Johnathan Doe | 1, 3, 4, 6, 7, 12 |
| 2 — Alice Smith   | 1, 4, 6, 7, 11 |
| 3 — Robert Chen   | 1, 2, 6, 7, 11 |
| 4 — Maria García  | 3, 6, 8 |
| 5 — James Okonkwo | 2, 6, 9, 12 |
| 6 — Yuki Tanaka   | 2, 6, 10 |

Projects **5, 13, 14, 15** have no assignments (empty team column). Project **6** has all six employees (good for **+N** avatar overflow in the grid).

Source: `frontend/src/lib/seed-projects.ts` (fixtures); runtime project seed is applied by the **`backend`** (`backend/app/seed_data.py`) when the database is initialized.
