import {
  backendDeleteStatus,
  backendGetJson,
  backendGetJsonOrNull,
  backendPatchJsonOrNull,
  backendPostJson,
} from "./backend-fetch";
import type {
  CreateEmployeeDto,
  Employee,
  ListEmployeesPagedParams,
  ListEmployeesResult,
} from "./employee-types";

export async function list(): Promise<Employee[]> {
  return backendGetJson<Employee[]>("/internal/repo/employees");
}

function buildPagedQuery(params: ListEmployeesPagedParams): string {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("pageSize", String(params.pageSize));
  q.set("sortBy", params.sortBy);
  q.set("sortOrder", params.sortOrder);
  if (params.country !== undefined && params.country !== "") q.set("country", params.country);
  if (params.gender !== undefined && params.gender !== "") q.set("gender", params.gender);
  if (params.projectId != null) q.set("projectId", String(params.projectId));
  return q.toString();
}

export async function listPaged(params: ListEmployeesPagedParams): Promise<ListEmployeesResult> {
  const qs = buildPagedQuery(params);
  return backendGetJson<ListEmployeesResult>(`/internal/repo/employees/paged?${qs}`);
}

export async function getById(id: number): Promise<Employee | null> {
  return backendGetJsonOrNull<Employee>(`/internal/repo/employees/by-id/${id}`);
}

export async function create(
  dto: CreateEmployeeDto
): Promise<{ employee: Employee } | { error: string }> {
  return backendPostJson<{ employee: Employee } | { error: string }>("/internal/repo/employees", dto);
}

export async function update(
  id: number,
  dto: Partial<CreateEmployeeDto>
): Promise<{ employee: Employee } | { error: string } | null> {
  return backendPatchJsonOrNull<{ employee: Employee } | { error: string }>(
    `/internal/repo/employees/${id}`,
    dto
  );
}

export async function deleteById(id: number): Promise<boolean> {
  return backendDeleteStatus(`/internal/repo/employees/${id}`);
}
