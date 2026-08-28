This is a [Next.js](https://nextjs.org) HR Portal training project.

## Repository layout

| Path | Contents |
|------|----------|
| **`frontend/`** | Next.js app (App Router, `src/`, tests, ESLint, Jest) |
| **`backend/`** | FastAPI + SQLite API used by the frontend repositories |
| **`docs/`** | Project documentation |

Install dependencies and run scripts from the **repository root** (npm workspaces).

## Getting Started

From the repo root:

```bash
npm install
npm run setup:backend   # once: creates backend/.venv and installs uvicorn + FastAPI
```

Run **backend and frontend together** (recommended):

```bash
npm run dev:all
```

This starts FastAPI first and waits until **http://127.0.0.1:8000/health** responds before launching Next.js, so the UI does not hit `ECONNREFUSED` during startup.

Or use two terminals: `npm run dev:backend` (FastAPI on **:8000**) and `npm run dev` (Next.js on **:3000**). `dev:backend` uses **`backend/.venv`** (run `npm run setup:backend` if you see `No module named uvicorn`).

Open [http://localhost:3000](http://localhost:3000).

### Commands (root)

- `npm run setup:backend` — create `backend/.venv` and `pip install -r backend/requirements.txt`
- `npm run dev:all` — FastAPI + Next.js in one process (via `concurrently`)
- `npm run dev` — Next.js dev server (`frontend` workspace)
- `npm run dev:fast` — Next without `SEED_BULK_COUNT` in env (same workspace)
- `npm run dev:backend` — uvicorn for `backend/`
- `npm run build` / `npm start` / `npm test` / `npm run lint` — operate on **`frontend/`**

---

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load [Geist](https://vercel.com/font).

## Deploy on Vercel

Point the Vercel project **root directory** to **`frontend/`** (or deploy only that folder). Configure `BACKEND_URL` for your deployed API.
