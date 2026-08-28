import {
  backendDeleteStatus,
  backendGetJson,
  backendGetJsonOrNull,
  backendPatchJsonOrNull,
  backendPostJson,
} from "./backend-fetch";
import type { CreateProjectDto, Project, ProjectWithTeam } from "./project-types";
import type { Employee } from "./employee-types";

export async function listProjects(): Promise<Project[]> {
  return backendGetJson<Project[]>("/internal/repo/projects");
}

export async function listProjectsWithTeamPreview(): Promise<ProjectWithTeam[]> {
  return backendGetJson<ProjectWithTeam[]>("/internal/repo/projects/with-team-preview");
}

export async function getProjectById(id: number): Promise<Project | null> {
  return backendGetJsonOrNull<Project>(`/internal/repo/projects/by-id/${id}`);
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  return backendPostJson<Project>("/internal/repo/projects", dto);
}

export async function updateProject(
  id: number,
  dto: Partial<CreateProjectDto>
): Promise<Project | null> {
  return backendPatchJsonOrNull<Project>(`/internal/repo/projects/${id}`, dto);
}

export async function deleteProjectById(id: number): Promise<boolean> {
  return backendDeleteStatus(`/internal/repo/projects/${id}`);
}

export async function assignmentExists(employeeId: number, projectId: number): Promise<boolean> {
  const q = new URLSearchParams({
    employeeId: String(employeeId),
    projectId: String(projectId),
  });
  const body = await backendGetJson<{ exists: boolean }>(
    `/internal/repo/assignments/exists?${q.toString()}`
  );
  return body.exists;
}

export async function assignEmployeeToProject(
  employeeId: number,
  projectId: number,
  startDate?: string | null
): Promise<{ ok: true } | { error: string }> {
  return backendPostJson<{ ok: true } | { error: string }>("/internal/repo/assignments", {
    employeeId,
    projectId,
    startDate: startDate ?? null,
  });
}

export async function unassignEmployeeFromProject(
  employeeId: number,
  projectId: number
): Promise<boolean> {
  return backendDeleteStatus(`/internal/repo/assignments/${employeeId}/${projectId}`);
}

export async function listProjectIdsForEmployee(employeeId: number): Promise<number[]> {
  return backendGetJson<number[]>(`/internal/repo/employees/${employeeId}/project-ids`);
}

export async function listEmployeeIdsForProject(projectId: number): Promise<number[]> {
  return backendGetJson<number[]>(`/internal/repo/projects/${projectId}/employee-ids`);
}

export async function listProjectsForEmployee(employeeId: number): Promise<Project[]> {
  return backendGetJson<Project[]>(`/internal/repo/employees/${employeeId}/projects-full`);
}

export async function listEmployeesForProject(projectId: number): Promise<Employee[]> {
  return backendGetJson<Employee[]>(`/internal/repo/projects/${projectId}/employees-full`);
}
