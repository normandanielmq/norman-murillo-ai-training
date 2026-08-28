---
name: hr-training-session
description: >-
  Use for HR Portal (norman-murillo-ai-training): Next.js app in frontend/,
  FastAPI SQLite backend/, employee/project features, Session 3 list filters,
  hooks vs components, and Jest tests. Apply when adding or changing employees,
  projects, assignments, grids, pagination, or external API integration in this repo.
---

# HR training session — repo playbook

Use this skill together with `.cursor/rules/project-conventions.mdc`, `naming-and-patterns.mdc`, and `orchestration-workflow.mdc`. Prefer **short plan → implement** for non-trivial work.

## Backend layers (Next.js API + Python DB)

1. **Route** (`frontend/src/app/api/**/route.ts`): parse params/body/query only; call **service**; map `{ success: false }` to `badRequest` / `notFound` from `@/lib/api-response`. No business logic, no DB, no validation rules in the route.
2. **Service** (`frontend/src/lib/*.service.ts`): all business rules and validation (or call `@/lib/validators`). Return structured results, e.g. `{ success: true, … }` or `{ success: false, error, details }`.
3. **Repository** (`frontend/src/lib/*.repository.ts`): HTTP clients to the **Python backend** (`backend/app/repositories/`). No Drizzle in the frontend.

**Errors:** API body shape `{ error: string, details: string[] }`.

## Employee list API (Session 3)

`GET /api/employees` returns a **paged object**, not a bare array:

```json
{ "employees": [...], "total": 0, "page": 1, "pageSize": 20 }
```

Each row in `employees` may include **`projectNames`** (comma-separated labels) for directory UI.

**Supported query params** (optional): `page`, `pageSize` (max 1000), `country`, `gender`, `projectId`, `sortBy`, `sortOrder`. Whitelist for `sortBy` lives in `@/lib/employee.service` / `EmployeeListSortColumn` in `@/lib/employee-types`. Invalid query → **400** via `listEmployeesFromQuery`.

When extending filters or sort: update **Python** `employee_repo.list_paged`, **service** parsing/validation, **route** unchanged except if new params need documenting, then **tests** (`employee.service.test.ts`, etc.).

## Frontend

- **No** `fetch` or data-loading `useEffect` inside presentational components. Put loading, errors, and API calls in **hooks** (`useEmployees`, `useProjects`, …). Pages compose hooks + components.
- Reuse `FormField`, `INPUT_CLASS`, shared table classes where applicable.
- Show API `details[]` on validation errors with `role="alert"` where appropriate.

## Testing

- **Jest** runs in **`frontend/`** (`npm test` from repo root).
- Service tests mock repositories where appropriate; repository integration lives in **Python** (`backend/`) if added.

## Imports

Use the `@/` alias inside **`frontend/`** (e.g. `@/lib/...`, `@/components/...` for shared UI, `@/features/...` for feature screens, `@/hooks/...`).

## Session 3 reminders (when relevant)

- **Bulk seed:** optional `SEED_BULK_COUNT` (max 1000) on the **backend** process — see `docs/session3-bulk-seed.md` and `frontend/src/lib/bulk-seed-generate.ts` (generator for aligned fixture rows). No large JSON in chat or repo.
- **Grid:** pagination, sorting, multi-parameter filtering — align UI with `GET /api/employees` query params (`useEmployeeDirectory`).
- **REST Countries:** `frontend/src/lib/rest-countries.adapter.ts` (names + `idd` calling codes), `GET /api/countries`, `useCountries`; Employee country selection merges `mergePhoneWithCallingCode` into the phone field; manual country fallback skips auto-prefix. Graceful API failure without crashing.
