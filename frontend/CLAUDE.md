# Frontend conventions (Next.js app)

Applies when working in `frontend/src/**`. Repo-wide rules in the root `CLAUDE.md` also apply.

## UI folder layout

- `frontend/src/components/` — **app-wide, reusable** UI only (forms, modal shells, buttons, layout primitives).
- `frontend/src/features/<feature>/` — feature-specific UI (e.g. `employees`, `projects`, `layout` for sidebar/shell).
- Shared SVG icons used by multiple features: `frontend/src/components/icons/` (e.g. `SortArrowUpIcon`, `PencilIcon`). Icons tied to one feature live next to it (`features/employees/icons/`).

## Components

- **One component per file.** Extract modals, icons, and small UI pieces into their own files under the right feature or `components/` (e.g. `features/employees/DeleteConfirmModal.tsx`). Pages and layouts only import and compose.
- PascalCase file and component name (`EmployeeForm.tsx` → `export function EmployeeForm`). Props type named `Props` or `ComponentNameProps`.
- **Props typing**: no inline object types on the parameter list. Declare a named `interface` (or `type` for unions/intersections) and use `Readonly<...>` on the props parameter: `function X(props: Readonly<XProps>)` or `function X({ a, b }: Readonly<XProps>)`. Applies to layouts, pages' client components, and shared UI.
- **Control flow**: prefer early returns for loading / error / empty branches over long ternary chains or nesting. Keep shared layout (page shell + `PageHeader`) in the parent; extract a small local function or non-exported child component in the same file to avoid duplicating wrappers.

## Data and requests

- No `fetch` or data-loading `useEffect` inside components. All API calls and loading state live in **custom hooks** (`useEmployees`, `useCreateEmployee`, `useDeleteEmployee`). Components only consume hook return values and callbacks.
- Hooks are named `useXxx`, return loading/error state and callbacks; mutations return `Promise<{ ok: boolean; error?: string; details?: string[] }>` when applicable.

## Shared UI to reuse

- `FormField` + `INPUT_CLASS` from `@/components/FormField` for labels and input styling. `SelectField` for labeled `<select>`.
- `PageHeader` for title + description/eyebrow + optional actions. `ErrorCallout` for inline load/API errors with optional "Try again".
- Table constants (`TH_CLASS`, `TD_CLASS`) when repeating cell classes.
- `Button` from `@/components/Button` for repeated buttons (`variant`: primary, secondary, outline, danger, neutral, soft, ghost, link; `size`: sm, md). `ModalCancelPrimaryButtons` uses `Button` for Cancel and primary actions unless `cancelClassName` is set.

## Forms and errors

- For required fields, use `FormField` with `required` and set `aria-required="true"` on the input/select.
- Show API validation errors in the UI — a list under the form with `role="alert"`, using the `details` array from the API error body when present.

## Design / UX pass (user-facing `*.tsx`)

- **Usability**: clear hierarchy, obvious primary actions, patterns consistent with existing modals/forms/tables.
- **Accessibility**: semantic structure, focus order, labels and `aria-*` (required fields, error regions with `role="alert"`).
- **Visual consistency**: reuse the shared classes/components above; spacing and typography match the rest of the portal.
- Favor presentation and interaction clarity; don't rewrite the data layer or business rules unless inseparable from an accessibility/flow fix.

## Testing

- **Runner**: Jest in `frontend/`; component tests use `@testing-library/react` and `@testing-library/jest-dom`.
- `next/link` and `next/navigation` are mocked via `frontend/jest.config.js` `moduleNameMapper` (`frontend/src/__mocks__/next-link.tsx`, `next-navigation.ts`). Don't add inline `jest.mock("next/...")` unless a single test needs it.
- Prefer `screen.getByRole`, `getByLabelText`, `getByText`; fire events with `fireEvent`. Test behavior, not implementation.

### Test fixtures

- Reusable sample entities and props go in `frontend/src/test/fixtures/` (one file per domain: `employee.ts`, `project.ts`). Re-export from `frontend/src/test/fixtures/index.ts`. Import with `@/` alias (`import { employeeJaneDoe } from "@/test/fixtures"`).
- Prefer named exports of stable objects (`employeeJaneDoe`, `createEmployeeDtoTestUser`) over copy-pasting literals across tests.
- Factories (`deleteConfirmModalDefaultProps()`, `listEmployeesResultOneJane()`) are for fresh `jest.fn()` instances or small variations — use when tests must not share mutable mock state.
- Keep repository integration DTOs distinct from UI fixtures when they must avoid collisions with seed data (e.g. unique national IDs in `employee.repository.test.ts`).
- Do **not** import fixtures from production `frontend/src/app` or `frontend/src/lib` code — fixtures are test-only.
- Repository tests still use `createFreshTestDb()` / `setTestDb()` per the root guide; fixtures supply values, not DB setup.
- After changing a fixture, run `npm test` and fix any tests that depended on the old literal.
