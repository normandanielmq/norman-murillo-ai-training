# Session 2 — Projects & Employee ↔ Project assignments

## Domain

### Project

| Field       | Type   | Notes                          |
|------------|--------|--------------------------------|
| id         | int    | PK, auto-increment             |
| name       | string | Required                       |
| description| string | Required (may be empty string) |
| createdAt  | string | ISO timestamp                  |

### Junction: `employee_projects`

- `employee_id` — FK to `employees.id`
- `project_id` — FK to `projects.id`
- **Primary key** `(employee_id, project_id)` — enforces no duplicate assignment at DB level.

### Delete behavior

- **Delete project**: Remove all `employee_projects` rows for that project, then delete the project.
- **Delete employee**: Remove all `employee_projects` rows for that employee, then delete the employee (handled in `employee.repository` if we add cascade there; otherwise junction orphaned — **we add cleanup in employee delete**).

Implemented: `employee.repository.deleteById` deletes matching `employee_projects` rows first, then the employee. `project.repository.deleteProjectById` deletes junction rows for that project first, then the project. SQLite FKs also use `ON DELETE CASCADE` as a safety net.

## API

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/api/projects` | — | `Project[]` |
| POST | `/api/projects` | `{ name, description }` | 201 + `Project` |
| GET | `/api/projects/[id]` | — | `Project` or 404 |
| PUT | `/api/projects/[id]` | partial DTO | `Project` or 400/404 |
| DELETE | `/api/projects/[id]` | — | 204 or 404 |
| GET | `/api/projects/[id]/employees` | — | `{ employees: Employee[] }` (ids linked) |
| POST | `/api/projects/[id]/employees` | `{ employeeId: number }` | 201 or 400 (duplicate, not found) |
| DELETE | `/api/projects/[id]/employees/[employeeId]` | — | 204 or 404 |
| GET | `/api/employees/[id]/projects` | — | `{ projects: Project[] }` |

Assignment duplicate: API returns **400** with `{ error, details }` when the pair already exists.

## UI

- **Projects** nav item → `/projects` grid (CRUD actions, assign employees).
- **Employees** grid: action to open modal → toggle project membership; show API errors in modal.

## Security notes

See `docs/security-review-session2.md` after implementation.
