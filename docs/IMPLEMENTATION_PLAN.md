# Full-Stack Employee CRUD — Implementation Plan (Session 1)

This plan implements the **HR System Employee Directory** per the training alignment: Next.js + in-memory SQLite3 + Tailwind CSS, with native Next.js/Jest unit tests and UI matching the provided designs.

---

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm installed
- Git repo initialized (e.g. `[attendee-name]-ai-training`)
- Blank project folder open in Cursor (or your IDE)

---

## Phase 1: Project scaffold

**Note:** Create the project context document (Phase 1, Step 1.4) *after* the Next.js app is created. Running `create-next-app` in the current folder can overwrite existing files; keeping the context in `docs/` and creating it after setup avoids conflicts.

### Step 1.1 — Create Next.js app

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

- Use **TypeScript**, **Tailwind CSS**, **ESLint**, **App Router**, and **`src/`** directory.
- When asked for import alias, you can accept default (`@/*`) or set as needed.

### Step 1.2 — Verify Tailwind

- Confirm `tailwind.config.ts` (or `.js`) and `src/app/globals.css` with Tailwind directives exist.
- Run `npm run dev` and confirm the app loads.

### Step 1.3 — Install SQLite (in-memory) and test runner

**In-memory SQLite options:**

- **better-sqlite3** (recommended): native module, supports `:memory:` database. Use in API routes only (Node.js).
- **sql.js**: WebAssembly, works in browser and Node; good if you need true in-memory without native deps.

Install (example with better-sqlite3):

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

**Testing:**

- Next.js 15+ can use **Jest** with `next/jest` or the experimental **Vitest** support. If the project has no test runner yet:

```bash
npm install -D jest @types/jest ts-node jest-environment-node @testing-library/react @testing-library/jest-dom
```

- Alternatively use **Vitest** if your training material prefers it:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Configure the chosen runner (e.g. `jest.config.js` with `next/jest` or `vitest.config.ts`) so tests run under Node for API/DB code.

### Step 1.4 — Create project context document (after Next.js is in place)

Create **`docs/project_context.md`** so the AI has a single source of truth. Include:

- **Tech stack**: Next.js (App Router), in-memory SQLite3, Tailwind CSS, Jest (or chosen test runner).
- **Employee domain**: fields, business rules, API contract summary (or link to `docs/schema.md`).
- **Constraint**: *"Keep the implementation simple. Do not add extra features, authentication, or complex styling beyond the requested scope."*

Use this file in prompts so the AI stays aligned. A template is provided in `docs/project_context.md`; create or copy it **after** running create-next-app so the Next.js setup does not overwrite your folder.

---

## Phase 2: Spec first — data model and API contract

**Do this before implementing API or UI.**

### Step 2.1 — Employee schema (align with training doc)

Define the **Employee** model to match the training document and UI:

| Field         | Type     | Notes                                      |
|---------------|----------|--------------------------------------------|
| id            | integer  | Primary key, auto-generated                 |
| name          | string   | Full name                                  |
| email         | string   | Valid email format                          |
| nationalId    | string   | Unique per country (business rule)         |
| phone         | string   | Must include country code (business rule)  |
| country       | string   |                                            |
| gender        | string   | e.g. Male, Female, Other                    |
| dateOfBirth   | string   | Valid date (ISO or agreed format)          |
| officialTitle | string   | Job title                                  |
| hireDate      | string   | Valid date                                 |
| createdAt     | string   | Optional, for auditing                      |

Store this in a **schema document** (e.g. `docs/schema.md`) or in `docs/project_context.md`.

### Step 2.2 — Business rules (backend must enforce)

1. **Duplicate National ID**: Reject (e.g. 400) if the same National ID exists for the same Country.
2. **Phone**: Reject if phone number does not include a country code (e.g. +1, +44).
3. **Email**: Reject if format is invalid.
4. **Dates**: Reject if Date of Birth or Hire Date are invalid.

Document these in the same spec and in API error responses.

### Step 2.3 — API contract (REST)

- **Base path**: `/api/employees`
- **GET /api/employees** — Read all; response: array of employees.
- **GET /api/employees/[id]** — Read one; 404 if not found.
- **POST /api/employees** — Create; body: employee DTO; 201 + entity or 400 with validation errors.
- **PUT /api/employees/[id]** — Update; body: employee DTO; 200 + entity or 400/404.
- **DELETE /api/employees/[id]** — Delete; 204 or 404.

Use a **DTO** (e.g. `CreateEmployeeDto`, `UpdateEmployeeDto`) and document request/response shapes and error payload (e.g. `{ "error": "...", "details": [] }`).

---

## Phase 3: Backend — database and API

### Step 3.1 — In-memory SQLite setup

- Create a **DB utility** (e.g. `src/lib/db.ts`) that:
  - Opens a **`:memory:`** database when the process runs.
  - Runs a **migration/schema** that creates the `employees` table matching the schema above.
- Ensure the same in-memory DB instance is used across API route handlers (e.g. singleton or request-scoped in Next.js server context).

Note: In development with hot reload, in-memory DB may reset on file changes; that’s acceptable for Session 1.

### Step 3.2 — Repository / data access layer

- Implement a small **EmployeeRepository** (or equivalent) in `src/lib/` that:
  - **list()**: return all employees.
  - **getById(id)**: return one or null.
  - **create(dto)**: insert and return created row (with id).
  - **update(id, dto)**: update and return row or null.
  - **delete(id)**: delete and return success boolean.
- Add **business-rule checks** inside create/update (or in a separate validation layer):
  - Duplicate (nationalId + country).
  - Phone has country code.
  - Email and date format validation.

Return clear error types/codes so API routes can map to 400 and message.

### Step 3.3 — Validation layer

- Implement **validators** for:
  - Email format.
  - Date format (e.g. ISO or mm/dd/yyyy as per UI).
  - Phone with country code (e.g. regex or library).
- Validators should be used by the repository or by API route handlers before calling repository.

### Step 3.4 — API route handlers (App Router)

- **GET** `src/app/api/employees/route.ts` — list all.
- **POST** `src/app/api/employees/route.ts` — create; validate body, apply business rules, return 201 or 400.
- **GET** `src/app/api/employees/[id]/route.ts` — get one; 404 if not found.
- **PUT** `src/app/api/employees/[id]/route.ts` — update; validate and enforce business rules; 200 or 400/404.
- **DELETE** `src/app/api/employees/[id]/route.ts` — delete; 204 or 404.

Ensure all 400 responses return a **consistent JSON body** (e.g. `{ "error": "...", "details": [] }`) for the UI to show friendly messages.

---

## Phase 4: Frontend — layout and pages

### Step 4.1 — Layout and navigation (match UI)

- **Root layout** (`src/app/layout.ts.tsx`): shell with header (“HR Systems - Workshop Session 1” or “HR Portal”) and sidebar.
- **Sidebar**: “HR Portal” / “Foundation Layer”; nav items: **Dashboard** (inactive), **Employees** (active on directory page). Use icons (e.g. grid, people) and purple highlight for active item.
- Use Tailwind for header, sidebar, and main content area; keep styling minimal and aligned with the provided UI.

### Step 4.2 — Employee Directory page (list + actions)

- **Route**: e.g. `src/app/(portal)/employees/page.tsx` or `src/app/employees/page.tsx`.
- **Title**: “Employee Directory”; subtitle: “Manage and view all personnel records”.
- **Primary button**: “+ Add Employee” (purple), linking to add-employee page or opening add form/modal.
- **Table**: columns — NAME (avatar with initials + name), NATIONAL ID, TITLE, HIRE DATE, COUNTRY, GENDER, EMAIL (link), ACTIONS (Edit icon, Delete icon).
- **Edit**: navigates to edit page or opens edit form/modal with pre-filled data.
- **Delete**: opens a **confirmation modal** (“Delete Employee?”, message that action is irreversible), with **Cancel** and **Delete** (red) buttons; on confirm, call DELETE API and refresh list.

### Step 4.3 — Add Employee page/form (match second image)

- **Route**: e.g. `src/app/employees/new/page.tsx` or a modal.
- **Title**: “Add New Employee”; subtitle: “Session 1: Workshop Foundation - Enter the details of the new hire below.”
- **Form fields** (two-column layout where appropriate):
  - Full Name, Email Address
  - National ID, Hire Date (e.g. date input or mm/dd/yyyy)
  - Job Title (dropdown: “Select Title” + options), Country
  - Gender (radio: Male, Female, Other)
- **Buttons**: “Cancel” (secondary), “Save Employee” (primary purple). On submit: POST to `/api/employees`; on 400, show validation messages in the UI; on success, redirect to directory or close modal and refresh.

### Step 4.4 — Edit Employee

- **Route**: e.g. `src/app/employees/[id]/edit/page.tsx` or reuse the same form in a modal with `id`.
- Same fields as Add; pre-fill from GET `/api/employees/[id]`. On submit: PUT `/api/employees/[id]`; handle 400 (show errors) and 404.

### Step 4.5 — Error handling (full-stack loop)

- In **API**: return 400 with body like `{ "error": "Validation failed", "details": ["Phone must include country code", ...] }`.
- In **frontend**: on fetch response 4xx, read JSON and display **friendly messages** (e.g. under form or in a toast/banner). No silent failures.

---

## Phase 5: Unit tests

### Step 5.1 — Scope (per training)

- Tests must cover **core backend business rules and validations**.
- Use **Next.js native testing** if available (e.g. same Jest/Vitest setup used for the project); otherwise **Jest** with `next/jest` for consistency.

### Step 5.2 — What to test

1. **Validation**: email format, date format, phone with country code — invalid inputs rejected.
2. **Duplicate National ID**: create/update rejected when same nationalId + country exists.
3. **CRUD**: create returns 201 and correct body; get by id returns 404 for missing id; update and delete behave as specified.

Prefer testing the **repository + validation** or **API route handlers** (calling the in-memory DB) so business rules are covered. Keep tests fast and isolated (e.g. fresh in-memory DB per test or per suite).

### Step 5.3 — Run and green

- Add script in `package.json`: `"test": "jest"` (or `vitest`).
- Ensure **all tests pass** before considering Session 1 done.

---

## Phase 6: Security and review

### Step 6.1 — Security check

- Ask the AI (or do a quick review) for: **secure coding practices**, **input sanitization**, **SQL injection** (use parameterized queries only), **XSS** (React escaping, safe insertion of messages). No auth required per scope.

### Step 6.2 — Cleanup and componentization

- Refactor large components into smaller ones (e.g. `EmployeeTable`, `EmployeeForm`, `DeleteConfirmModal`).
- Remove unused code and keep styling within the requested scope.

---

## Phase 7: Definition of done (checklist)

- [x] Next.js app created with TypeScript, Tailwind, App Router, `src/` dir.
- [x] In-memory SQLite3 integrated; schema created; same DB used in API.
- [x] Employee schema and API contract documented (spec first).
- [x] REST API: GET all, GET one, POST, PUT, DELETE with correct status codes and error body.
- [x] Business rules enforced in backend: duplicate nationalId+country, phone country code, email format, date format.
- [x] UI: directory grid with avatar, columns, Edit and Delete icons; delete confirmation modal.
- [x] UI: Add Employee form (and Edit) matching the provided layout; Cancel and Save/Update.
- [x] 400 errors from API shown as clear, friendly validation messages in the UI.
- [x] Unit tests for backend business rules and validations; all tests pass.
- [x] Security review (parameterized queries, input handling, no unnecessary features).
- [x] Code componentized and scope kept simple (no auth, no extra features).

See `docs/definition-of-done.md` for verification notes.

---

## Suggested order of implementation

1. **Install Next.js** (Step 1.1) and Tailwind (1.2).
2. **Install SQLite and test runner** (Step 1.3).
3. **Create project context** in `docs/project_context.md` (Step 1.4).
4. **Write schema and API contract** (Phase 2).
5. **Implement DB + repository + validation** (Phase 3.1–3.3).
6. **Implement API routes** (Phase 3.4).
7. **Add unit tests** for validation and business rules (Phase 5); keep them green as you go.
8. **Build layout and sidebar** (Phase 4.1).
9. **Build directory page and table** (Phase 4.2).
10. **Build Add/Edit form and Delete modal** (Phase 4.3–4.5).
11. **Wire error handling** (Phase 4.5).
12. **Security review and cleanup** (Phase 6).
13. **Final run-through of Definition of Done** (Phase 7).

Use the **context document** and **spec** in every AI prompt so the model stays aligned with business rules, API contract, and scope. Prefer **incremental prompts** (e.g. one endpoint, one form, one component) rather than “build the whole app” in one go.
