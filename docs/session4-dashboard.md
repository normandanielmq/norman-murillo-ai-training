# Session 4: Executive dashboard

## Scope

- **Route:** `GET /api/dashboard/insights` returns aggregated metrics only (counts and percentages). No employee or project row payloads.
- **UI:** `/dashboard` — Workforce Overview with panels aligned to the workshop mockup (donut by country, horizontal headcount bars per project, stacked gender bars per project), plus **project assignment coverage** (employees on ≥1 project vs. not on any project).

## Aggregation

- **Backend:** `dashboard.repository.ts` runs Drizzle `groupBy` / `count` queries against `employees`, `projects`, and `employee_projects`, including `count(distinct employee_id)` for assignment coverage.
- **Service:** `dashboard.service.ts` validates that country totals match total employee rows, normalizes gender into Male / Female / Other (`genderChartBucket`), sorts projects by headcount descending, and formats the compact total label for the donut center.

## Security review (read-only insights)

| Topic | Assessment |
| ----- | ---------- |
| **Injection** | No query parameters on the insights route; no dynamic SQL. Drizzle query builders only. |
| **Data exposure** | JSON is aggregate counts and project names only — no emails, IDs of people in chart payloads, or national IDs. |
| **Mutations** | `GET` only; no state change. |
| **Errors** | Internal inconsistency returns `500` with `{ error, details }`. Clients should not retry blindly on `500` without backoff in production. |
| **Auth / rate limit** | Workshop app is unauthenticated local demo; production would need authz, HTTPS, and optional rate limiting on read endpoints. |

## Testing

- `dashboard.repository.test.ts` — seeded DB, country sums, headcounts, gender raw sums vs links, empty project headcount.
- `dashboard.service.test.ts` — gender bucketing, compact number format, sort order, inconsistency guard.

## Chart library

- **Recharts** `2.15.3` (pinned in `frontend/package.json`).
