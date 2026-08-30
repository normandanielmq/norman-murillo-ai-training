# HR Portal — Project Guide

Monorepo for an HR portal training project.

- **`frontend/`** — Next.js app (`frontend/src/`), also hosts the API routes (`frontend/src/app/api/**/route.ts`).
- **`backend/`** — FastAPI + SQLite (the datastore).
- **`docs/`** — all documentation, at the repo root.

See also `frontend/CLAUDE.md` for frontend-scoped conventions (components, hooks, tests).

## Documentation and structure

- Put all `.md` files under `docs/` (e.g. `docs/schema.md`). Do not add `.md` to the repo root or elsewhere unless asked.
- In the Next.js app, import with the `@/` alias (`@/lib/...`, `@/components/...`, `@/features/...`, `@/hooks/...`).

## Backend architecture (Next.js API layer)

Three layers only: **Route → Service → Repository → Database.**

- **Routes** (`frontend/src/app/api/**/route.ts`): parse request (params, body), call the service, return the response. No business logic, no DB access, no validation.
- **Services** (`frontend/src/lib/*.service.ts`): all business logic. Call validators and repositories only. Return structured results (`{ success, employee }` or `{ success: false, error, details }`). Never touch the database directly.
- **Repositories** (`frontend/src/lib/*.repository.ts`): HTTP clients to the Python backend. CRUD and queries only; no business rules.
- **API error shape**: always `{ error: string, details: string[] }`. In routes use helpers from `@/lib/api-response.ts`: `parseId`, `parseJsonBody`, `badRequest`, `notFound`.
- **Validation** lives in the service (or validators the service calls). Routes never validate — they call the service and map results to HTTP.

### Naming

- Files: services `*.service.ts`, repositories `*.repository.ts`. Validators in `validators.ts`; API response helpers in `api-response.ts`. Client-side fetch helpers `parseJsonSafe` / `parseApiErrorPayload` in `@/lib/parse-json-response` and `@/lib/api-error-payload`.
- Services and repositories use **named exports** (`export function list()`). No default exports from these layers.
- Parse route-param IDs with `parseId(id)`; invalid ID → `badRequest("Invalid employee ID.", [])`.

## Data layer

- **Database**: SQLite on disk in `backend/` (FastAPI). Schema and seeding: `backend/app/database.py`, `backend/app/seed_data.py`; queries: `backend/app/repositories/`.
- Frontend repositories call the backend over HTTP (`BACKEND_URL`, default `http://127.0.0.1:8000`). No Drizzle or direct DB access in the Next.js app.
- Bulk seed (dev only): optional `SEED_BULK_COUNT` on the Python backend process; see `docs/session3-bulk-seed.md`.

## Validation rules

- Add validator functions in `validators.ts`; call them from the service.
- Validators return `{ valid: false, errors: string[] }`. The service returns `{ success: false, error: "Validation failed.", details: validation.errors }` for the route to map to 400.
- Keep date rules sensible: date of birth not in future, hire date not in future, date of birth before hire date.

## Workflow

Work in phases within a single session. Conventions in this file and `frontend/CLAUDE.md` always apply.

- **Non-trivial work** (new features, multi-file changes, refactors, ambiguous requirements): produce a **short plan first** — ordered steps, files touched, edge cases and error states, open questions if blocked — then implement. Skip the plan only when the user says to implement immediately or the change is a single obvious fix.
- **Plan-only requests** ("plan", "approach", "no code yet"): research the repo and `docs/`, mirror existing patterns, output the plan. Do **not** edit files, create files, or scaffold unless the user asks to implement in the same message.
- **Implementing / fixing / refactoring**: obey the layer rules above. Prefer straightforward linear control flow, small-to-medium functions, explicit data flow — avoid clever abstractions and indirection. Match neighboring code (imports, naming, error helpers). No unrelated drive-by changes. Update or add tests when logic or UX contracts change. When behavior depends on a library/framework detail, verify against current docs rather than stale assumptions.
- **UI changes**: see the design guidance in `frontend/CLAUDE.md`.
- Prefer explicit, informative failures: structured service results, API `{ error, details }`, UI lists rendering `details` with `role="alert"`.

## Agent skills

### Issue tracker

Issues and specs are tracked in this repo's GitHub Issues (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical triage vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
