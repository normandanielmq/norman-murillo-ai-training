import { backendGetJson } from "./backend-fetch";
import type {
  DashboardCountryCountRow,
  DashboardProjectGenderRawRow,
  DashboardProjectHeadcountRow,
} from "./dashboard-types";

export async function aggregateEmployeesByCountry(): Promise<DashboardCountryCountRow[]> {
  return backendGetJson<DashboardCountryCountRow[]>("/internal/repo/dashboard/aggregate-by-country");
}

export async function countAllEmployees(): Promise<number> {
  const body = await backendGetJson<{ count: number }>(
    "/internal/repo/dashboard/count-all-employees"
  );
  return body.count;
}

export async function countEmployeesOnAtLeastOneProject(): Promise<number> {
  const body = await backendGetJson<{ count: number }>(
    "/internal/repo/dashboard/count-on-at-least-one-project"
  );
  return body.count;
}

export async function aggregateHeadcountByProject(): Promise<DashboardProjectHeadcountRow[]> {
  return backendGetJson<DashboardProjectHeadcountRow[]>(
    "/internal/repo/dashboard/headcount-by-project"
  );
}

export async function aggregateGenderCountsByProjectRaw(): Promise<DashboardProjectGenderRawRow[]> {
  return backendGetJson<DashboardProjectGenderRawRow[]>(
    "/internal/repo/dashboard/gender-by-project-raw"
  );
}
