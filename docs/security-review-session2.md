# Security review — Session 2 (Projects & assignments)

Date: aligned with Session 2 implementation.

## Scope

- New entities: `projects`, `employee_projects` junction.
- New API routes under `/api/projects` and `/api/employees/[id]/projects`.
- Assignment POST/DELETE endpoints.

## Findings

### SQL injection

- **Status: Low risk.** All queries use Drizzle ORM with bound parameters. No string-concatenated SQL in application code.

### Input validation

- **Projects:** Create/update validated in `project.service` via `validateProjectInput` (name required, max length; description string with max length 5000).
- **Assignments:** `employeeId` and `projectId` validated as positive integers in service and route (POST body). Optional `startDate` must be ISO `YYYY-MM-DD` when provided. Non-existent employee or project returns **404** with consistent JSON body; duplicate assignment returns **400** with message in `details`.

### XSS

- **Status: Low risk.** Project `name` and `description` are rendered through React (escaped by default). User-supplied text in tables uses truncation only; no `dangerouslySetInnerHTML`.

### Authorization / authentication

- **Out of scope** (same as Session 1). No auth; any client that can reach the app can mutate data. Document for training only.

### Data integrity

- SQLite `PRAGMA foreign_keys = ON` enabled in `db.ts`.
- Junction table uses composite primary key `(employee_id, project_id)` plus `ON DELETE CASCADE` on both FKs so deletes of employees or projects clean up assignments.

### Rate limiting & abuse

- Not implemented (in-memory demo app). Not required for Session 2 lab.

## Recommendations for production

- Add authentication and per-role authorization for project and assignment mutations.
- Add rate limiting on write endpoints.
- Consider audit logging for assignment changes.
