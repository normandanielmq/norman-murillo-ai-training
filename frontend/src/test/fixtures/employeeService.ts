import type { EmployeeListItem } from "@/lib/employee-types";
import { employeeJaneDoe } from "./employee";

/** Empty paged list result for mocking `listPaged` in `employee.service` tests. */
export const emptyListEmployeesResult = {
  employees: [] as EmployeeListItem[],
  total: 0,
  page: 1,
  pageSize: 20,
};

/** Single-row paged result using canonical Jane + empty project labels. */
export function listEmployeesResultOneJane() {
  return {
    ...emptyListEmployeesResult,
    employees: [{ ...employeeJaneDoe, projectNames: "" }],
    total: 1,
  };
}
