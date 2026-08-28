import * as employeeRepository from "./employee.repository";
import { validateEmployeeInput } from "./validators";
import type {
  CreateEmployeeDto,
  Employee,
  EmployeeListSortColumn,
  ListEmployeesPagedParams,
  ListEmployeesResult,
  UpdateEmployeeDto,
} from "./employee-types";
import type { EmployeeInput } from "./validators";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 1000;
const DEFAULT_SORT_BY: EmployeeListSortColumn = "name";
const DEFAULT_SORT_ORDER: "asc" | "desc" = "asc";

const SORT_WHITELIST = new Set<EmployeeListSortColumn>([
  "id",
  "name",
  "email",
  "nationalId",
  "country",
  "gender",
  "hireDate",
  "officialTitle",
  "dateOfBirth",
]);

export async function list(): Promise<Employee[]> {
  return employeeRepository.list();
}

export type ListEmployeesFromQueryResult =
  | { success: true; result: ListEmployeesResult }
  | { success: false; error: string; details: string[] };

/** Parse GET /api/employees query string; validate; run paged list with filters. */
export async function listEmployeesFromQuery(
  searchParams: URLSearchParams
): Promise<ListEmployeesFromQueryResult> {
  const parsed = parseListEmployeesQueryParams(searchParams);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, details: parsed.details };
  }
  const result = await employeeRepository.listPaged(parsed.params);
  return { success: true, result };
}

function parseListEmployeesQueryParams(
  searchParams: URLSearchParams
):
  | { ok: true; params: ListEmployeesPagedParams }
  | { ok: false; error: string; details: string[] } {
  const details: string[] = [];

  const pageRaw = searchParams.get("page");
  const page =
    pageRaw === null || pageRaw === ""
      ? DEFAULT_PAGE
      : Number.parseInt(pageRaw, 10);
  if (!Number.isFinite(page) || page < 1 || !Number.isInteger(page)) {
    details.push("page must be a positive integer.");
  }

  const pageSizeRaw = searchParams.get("pageSize");
  const pageSize =
    pageSizeRaw === null || pageSizeRaw === ""
      ? DEFAULT_PAGE_SIZE
      : Number.parseInt(pageSizeRaw, 10);
  if (!Number.isFinite(pageSize) || pageSize < 1 || !Number.isInteger(pageSize)) {
    details.push("pageSize must be a positive integer.");
  } else if (pageSize > MAX_PAGE_SIZE) {
    details.push(`pageSize must be at most ${MAX_PAGE_SIZE}.`);
  }

  const sortByRaw = searchParams.get("sortBy");
  let sortBy: EmployeeListSortColumn = DEFAULT_SORT_BY;
  if (sortByRaw !== null && sortByRaw !== "") {
    if (!SORT_WHITELIST.has(sortByRaw as EmployeeListSortColumn)) {
      details.push("sortBy is not a supported column.");
    } else {
      sortBy = sortByRaw as EmployeeListSortColumn;
    }
  }

  const sortOrderRaw = searchParams.get("sortOrder");
  let sortOrder: "asc" | "desc" = DEFAULT_SORT_ORDER;
  if (sortOrderRaw !== null && sortOrderRaw !== "") {
    if (sortOrderRaw !== "asc" && sortOrderRaw !== "desc") {
      details.push('sortOrder must be "asc" or "desc".');
    } else {
      sortOrder = sortOrderRaw;
    }
  }

  const countryRaw = searchParams.get("country");
  const country =
    countryRaw === null || countryRaw.trim() === "" ? undefined : countryRaw.trim();

  const genderRaw = searchParams.get("gender");
  const gender =
    genderRaw === null || genderRaw.trim() === "" ? undefined : genderRaw.trim();

  const projectIdRaw = searchParams.get("projectId");
  let projectId: number | undefined;
  if (projectIdRaw === null || projectIdRaw === "") {
    projectId = undefined;
  } else {
    const n = Number.parseInt(projectIdRaw, 10);
    if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) {
      details.push("projectId must be a positive integer.");
    } else {
      projectId = n;
    }
  }

  if (details.length > 0) {
    return {
      ok: false,
      error: "Invalid query parameters.",
      details,
    };
  }

  return {
    ok: true,
    params: {
      page,
      pageSize,
      country,
      gender,
      projectId,
      sortBy,
      sortOrder,
    },
  };
}

export async function getById(id: number): Promise<Employee | null> {
  return employeeRepository.getById(id);
}

export type CreateResult =
  | { success: true; employee: Employee }
  | { success: false; error: string; details: string[] };

export async function create(input: EmployeeInput | CreateEmployeeDto): Promise<CreateResult> {
  const validation = validateEmployeeInput(input, false);
  if (!validation.valid) {
    return {
      success: false,
      error: "Validation failed.",
      details: validation.errors,
    };
  }
  const dto = input as CreateEmployeeDto;
  const result = await employeeRepository.create(dto);
  if ("error" in result) {
    return { success: false, error: result.error, details: [result.error] };
  }
  return { success: true, employee: result.employee };
}

export type UpdateResult =
  | { success: true; employee: Employee }
  | { success: false; error: string; details: string[] }
  | null;

export async function update(id: number, input: UpdateEmployeeDto): Promise<UpdateResult> {
  const validation = validateEmployeeInput(input, true);
  if (!validation.valid) {
    return {
      success: false,
      error: "Validation failed.",
      details: validation.errors,
    };
  }
  const result = await employeeRepository.update(id, input);
  if (result === null) return null;
  if ("error" in result) {
    return { success: false, error: result.error, details: [result.error] };
  }
  return { success: true, employee: result.employee };
}

export async function deleteById(id: number): Promise<boolean> {
  return employeeRepository.deleteById(id);
}
