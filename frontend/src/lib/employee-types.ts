export interface Employee {
  id: number;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  officialTitle: string;
  hireDate: string;
  createdAt: string;
}

/** Employee row for directory / grid: includes aggregated project labels for display. */
export interface EmployeeListItem extends Employee {
  /** Comma-separated project names, sorted alphabetically; empty string if none. */
  projectNames: string;
}

/** Whitelist for server-side sort on GET /api/employees */
export type EmployeeListSortColumn =
  | "id"
  | "name"
  | "email"
  | "nationalId"
  | "country"
  | "gender"
  | "hireDate"
  | "officialTitle"
  | "dateOfBirth";

export interface ListEmployeesResult {
  employees: EmployeeListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Parsed query for paged employee list (repository + GET /api/employees). */
export interface ListEmployeesPagedParams {
  page: number;
  pageSize: number;
  country?: string;
  gender?: string;
  projectId?: number;
  sortBy: EmployeeListSortColumn;
  sortOrder: "asc" | "desc";
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  country: string;
  gender: string;
  dateOfBirth: string;
  officialTitle: string;
  hireDate: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface ApiErrorBody {
  error: string;
  details?: string[];
}
