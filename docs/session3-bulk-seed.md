# Session 3 — bulk employee seed (local load testing)

The **FastAPI backend** (`backend/`) uses **SQLite on disk**. On backend startup it seeds the canonical list (see `backend/app/seed_data.py`) plus optional **generated** rows for testing pagination, sorting, and filters on the Employee Directory. Matching metadata for tests still lives under `frontend/src/lib/seed-employees.ts` / `bulk-seed-generate.ts`.

## How to enable

Set **`SEED_BULK_COUNT`** to a positive integer before starting the **backend** (max **1000** extra rows).

**macOS / Linux:**

```bash
cd backend && SEED_BULK_COUNT=150 python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or use root scripts: run **`npm run dev:backend`** with `SEED_BULK_COUNT` exported in your shell first.

Ensure the Next.js app (`npm run dev`) can reach the backend (`BACKEND_URL`, default `http://127.0.0.1:8000`).

## Implementation

- **Generator (TS reference / tests):** `frontend/src/lib/bulk-seed-generate.ts` — builds valid `SeedEmployee` rows (no huge JSON in source).
- **Runtime:** `backend/app/seed_data.py` inserts bulk rows when the DB is seeded on startup, **after** the static seed list (same semantics as before; DB now lives in Python).
- **Tests:** `frontend/src/lib/bulk-seed-generate.test.ts` — uniqueness and `validateEmployeeInput` for generated rows.

**Jest** does **not** apply `SEED_BULK_COUNT` against a live SQLite file; tests stay deterministic with mocks and fixtures.
