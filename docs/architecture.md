# Backend architecture

The backend follows a three-layer structure. Respect this separation in all new and refactored code.

---

## Layers

### 1. Routes (entry point only)

- **Where**: Next.js API route handlers (e.g. `frontend/src/app/api/**/route.ts`).
- **Responsibility**: Define the HTTP entry point only.
  - Parse the request (URL params, query, body).
  - Call the appropriate **service** method.
  - Map service result to HTTP response (status code, JSON body).
- **Do not**: Put business logic, validation, or database access in routes.

### 2. Services (business logic)

- **Naming**: File suffix **`.service.ts`** (e.g. `employee.service.ts`).
- **Responsibility**: All business logic.
  - Input validation (or delegate to validators).
  - Enforce business rules (e.g. duplicate national ID per country).
  - Orchestrate calls to **repositories** and optionally other services.
  - Return domain results or structured errors for the route to translate to HTTP.
- **Do not**: Access the database directly; use repositories only.

### 3. Repositories (data access only)

- **Naming**: File suffix **`.repository.ts`** (e.g. `employee.repository.ts`).
- **Responsibility**: The **only** layer that interacts with the database.
  - CRUD and queries.
  - Map between database rows and domain/API shapes (e.g. snake_case ↔ camelCase).
- **Do not**: Implement business rules or validation; keep only data access.

---

## Flow

```
HTTP Request → Route → Service → Repository → Database
                ↑         ↑           ↑
           entry point  business   data access
                        logic      only
```

---

## Summary

| Layer       | Suffix           | Role              | Touches DB? |
|------------|-------------------|-------------------|-------------|
| Route      | (route.ts)        | Entry point only  | No          |
| Service    | `.service.ts`     | Business logic    | No          |
| Repository | `.repository.ts`  | Data access       | Yes         |

See `docs/project_context.md` for domain and API contract.
