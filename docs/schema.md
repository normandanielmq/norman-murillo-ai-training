# Database schema — HR System Employee Directory

Schema for the SQLite database owned by the **FastAPI backend** (`backend/`). The Next.js app in **`frontend/`** does not open the DB directly; it calls the backend over HTTP.

---

## Table: `employees`

| Column         | SQLite type | Nullable | Description |
|----------------|-------------|----------|-------------|
| id             | INTEGER     | NOT NULL | Primary key, auto-increment |
| name           | TEXT        | NOT NULL | Full name |
| email          | TEXT        | NOT NULL | Valid email (format enforced in app) |
| national_id    | TEXT        | NOT NULL | National ID; unique per country (see constraint) |
| phone          | TEXT        | NOT NULL | Must include country code (enforced in app) |
| country        | TEXT        | NOT NULL | Country |
| gender         | TEXT        | NOT NULL | One of: Male, Female, Other |
| date_of_birth  | TEXT        | NOT NULL | Date, ISO 8601 (YYYY-MM-DD) |
| official_title | TEXT        | NOT NULL | Job title |
| hire_date      | TEXT        | NOT NULL | Date, ISO 8601 (YYYY-MM-DD) |
| created_at     | TEXT        | NOT NULL | ISO 8601 datetime; set on insert |

### Constraints

- **PRIMARY KEY**: `id` (auto-increment).
- **UNIQUE**: `(national_id, country)` — enforces “one National ID per Country” at the database level. The API must still validate and return 400 with a clear message on conflict.

### Indexes

- **Unique index** on `(national_id, country)` — created via the UNIQUE constraint; use for fast duplicate checks on create/update.

---

## DDL (create table)

```sql
CREATE TABLE IF NOT EXISTS employees (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  national_id    TEXT NOT NULL,
  phone          TEXT NOT NULL,
  country        TEXT NOT NULL,
  gender         TEXT NOT NULL,
  date_of_birth  TEXT NOT NULL,
  official_title TEXT NOT NULL,
  hire_date      TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  UNIQUE(national_id, country)
);
```

---

## Column mapping (API ↔ DB)

| API / domain field | DB column     |
|--------------------|---------------|
| id                 | id            |
| name               | name          |
| email              | email         |
| nationalId         | national_id   |
| phone              | phone         |
| country            | country       |
| gender             | gender        |
| dateOfBirth        | date_of_birth |
| officialTitle      | official_title|
| hireDate           | hire_date     |
| createdAt          | created_at    |

Use camelCase in JSON (API and frontend); use snake_case in SQL and when reading/writing rows in Node.

---

## Validation (application layer)

The schema does not enforce:

- **Email format** — validate in the API and return 400 if invalid.
- **Phone country code** — validate in the API (e.g. must start with `+` and digits) and return 400 if missing/invalid.
- **Date format** — validate that `date_of_birth` and `hire_date` are valid dates (e.g. ISO 8601) and return 400 if invalid.

See business rules in `docs/project_context.md`.

---

## Table: `projects`

| Column       | SQLite type | Nullable | Description |
|-------------|-------------|----------|-------------|
| id          | INTEGER     | NOT NULL | Primary key, auto-increment |
| name        | TEXT        | NOT NULL | Project name |
| description | TEXT        | NOT NULL | May be empty string |
| created_at  | TEXT        | NOT NULL | ISO 8601 datetime on insert |

Session 2 spec: `docs/session2-projects.md`.

---

## Table: `employee_projects` (junction)

| Column       | SQLite type | Nullable | Description |
|-------------|-------------|----------|-------------|
| employee_id | INTEGER     | NOT NULL | FK → `employees.id` |
| project_id  | INTEGER     | NOT NULL | FK → `projects.id` |
| start_date  | TEXT        | NULL     | Optional assignment start date (ISO `YYYY-MM-DD`) |

- **PRIMARY KEY** `(employee_id, project_id)` — no duplicate assignment pairs.
- **ON DELETE CASCADE** on both FKs — deleting an employee or project removes related junction rows (repositories also delete junction rows explicitly before entity delete; see Session 2 spec).

```sql
CREATE TABLE IF NOT EXISTS employee_projects (
  employee_id    INTEGER NOT NULL,
  project_id     INTEGER NOT NULL,
  start_date     TEXT,
  PRIMARY KEY (employee_id, project_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

```sql
CREATE TABLE IF NOT EXISTS projects (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL,
  created_at     TEXT NOT NULL
);
```
