# Project Context — HR System Employee Directory (Session 1)

Use this document in AI prompts to keep implementation aligned with scope and business rules.

---

## Tech stack

- **Framework**: Next.js (App Router), TypeScript — app in **`frontend/`**
- **Database**: SQLite via **FastAPI** in **`backend/`** (file-backed; see `backend/app/database.py`)
- **Styling**: Tailwind CSS
- **Testing**: Jest in **`frontend/`** (next/jest) — unit tests for services and UI

## Backend architecture

Routes define the entry point only. Routes call **services** (`.service.ts`), which hold business logic. Services call **repositories** (`.repository.ts`), which are the only layer that interacts with the database. See `docs/architecture.md` for details.

---

## Scope constraint

**Keep the implementation simple. Do not add extra features, authentication, or complex styling beyond the requested scope.**

---

## Employee domain

### Model fields

| Field         | Type   | Notes                                |
|---------------|--------|--------------------------------------|
| id            | number | Primary key, auto-generated          |
| name          | string | Full name                            |
| email         | string | Valid email format                   |
| nationalId    | string | Unique per country (business rule)   |
| phone         | string | Must include country code            |
| country       | string |                                      |
| gender        | string | Male, Female, Other                  |
| dateOfBirth   | string | Valid date                           |
| officialTitle | string | Job title                            |
| hireDate      | string | Valid date                           |
| createdAt     | string | Optional                             |

### Business rules (backend must enforce)

1. **Duplicate National ID**: Return 400 if the same National ID already exists for the same Country.
2. **Phone**: Return 400 if the phone number does not include a country code (e.g. +1, +44).
3. **Email**: Return 400 if the email format is invalid.
4. **Dates**: Return 400 if Date of Birth or Hire Date are invalid.

### API contract (REST)

- **Base path**: `/api/employees`
- **GET /api/employees** — List all employees.
- **GET /api/employees/[id]** — Get one; 404 if not found.
- **POST /api/employees** — Create; 201 + entity or 400 with validation errors.
- **PUT /api/employees/[id]** — Update; 200 + entity or 400/404.
- **DELETE /api/employees/[id]** — Delete; 204 or 404.

Error responses (e.g. 400) must use a consistent JSON body (e.g. `{ "error": "...", "details": [] }`) so the UI can show friendly validation messages.

---

## UI reference

- Employee Directory: grid with columns (Name with avatar, National ID, Title, Hire Date, Country, Gender, Email, Actions). Edit and Delete icons per row; Delete opens a confirmation modal.
- Add/Edit Employee: form with Full Name, Email, National ID, Hire Date, Job Title (dropdown), Country, Gender (radios). Cancel and Save Employee (or Update) buttons.
- Design follows the provided Figma/images; replicate layout and key elements with Tailwind.

---

## Session 2 — Projects & many-to-many

- **Spec:** `docs/session2-projects.md` — Project CRUD, `employee_projects` junction, API shapes.
- **Security:** `docs/security-review-session2.md`.
- **Definition of done:** `docs/definition-of-done-session2.md`.
- Employees can be assigned to multiple projects and vice versa; duplicate pairs are rejected (400). UI: assign from **Employees** grid (link icon) and **Projects** grid (link icon).

---

## Prompting tips

- Reference this file when asking the AI to implement or change features.
- Prefer incremental prompts: one endpoint, one form, one component at a time.
- Explicitly state what not to do (e.g. "Do not add authentication") when needed.
