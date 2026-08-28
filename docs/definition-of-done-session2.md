# Definition of done — Session 2 (Projects & assignments)

Checklist against `docs/session2-projects.md` and `docs/project_context.md` (Session 2 bullets). Verified in code as of last update.

---

- [x] **Domain**: `projects` (id, name, description, createdAt); `employee_projects` with composite PK `(employee_id, project_id)` and FKs.
- [x] **Delete project**: Junction rows for that project removed, then project deleted (`project.repository.deleteProjectById`); CASCADE on FK as backup.
- [x] **Delete employee**: Junction rows for that employee removed, then employee deleted (`employee.repository.deleteById`); CASCADE on FK as backup.
- [x] **API** — `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/[id]`, `GET/POST /api/projects/[id]/employees`, `DELETE /api/projects/[id]/employees/[employeeId]`, `GET /api/employees/[id]/projects` with documented status codes.
- [x] **Duplicate assignment**: `POST` assignment returns **400** with `{ error, details }`.
- [x] **UI**: **Projects** nav → `/projects` grid with CRUD and assign-employees modal (`ProjectTable`, modals).
- [x] **UI**: **Employees** grid — assign-projects action (link icon) and modal; API errors shown in modal.
- [x] **Security / review**: `docs/security-review-session2.md` (validation, Drizzle/params, XSS, FK integrity).
- [x] **Tests**: Assignment duplicate and delete behavior covered (`project.repository.test.ts`, `employee.repository.test.ts`); full suite green.
- [x] **Schema doc**: `projects` and `employee_projects` described in `docs/schema.md`.

Session 1 acceptance criteria remain satisfied (`docs/definition-of-done.md`); employee flows unchanged aside from assignment UI and junction cleanup on delete.
