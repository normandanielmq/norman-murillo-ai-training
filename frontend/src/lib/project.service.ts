import * as projectRepository from "./project.repository";
import * as employeeRepository from "./employee.repository";
import { validateProjectInput } from "./validators";
import type { CreateProjectDto, Project, UpdateProjectDto } from "./project-types";
import type { ProjectInput } from "./validators";
import type { Employee } from "./employee-types";

export async function listProjects(): Promise<Project[]> {
  return projectRepository.listProjects();
}

export async function listProjectsWithTeam() {
  return projectRepository.listProjectsWithTeamPreview();
}

export async function getProjectById(id: number): Promise<Project | null> {
  return projectRepository.getProjectById(id);
}

export type ProjectCreateResult =
  | { success: true; project: Project }
  | { success: false; error: string; details: string[] };

export async function create(input: ProjectInput | CreateProjectDto): Promise<ProjectCreateResult> {
  const validation = validateProjectInput(input, false);
  if (!validation.valid) {
    return {
      success: false,
      error: "Validation failed.",
      details: validation.errors,
    };
  }
  const dto = input as CreateProjectDto;
  const project = await projectRepository.createProject(dto);
  return { success: true, project };
}

export type ProjectUpdateResult =
  | { success: true; project: Project }
  | { success: false; error: string; details: string[] }
  | null;

export async function update(id: number, input: UpdateProjectDto): Promise<ProjectUpdateResult> {
  const validation = validateProjectInput(input, true);
  if (!validation.valid) {
    return {
      success: false,
      error: "Validation failed.",
      details: validation.errors,
    };
  }
  const project = await projectRepository.updateProject(id, input);
  if (!project) return null;
  return { success: true, project };
}

export async function deleteById(id: number): Promise<boolean> {
  return projectRepository.deleteProjectById(id);
}

export type AssignResult =
  | { success: true }
  | { success: false; error: string; details: string[] };

export async function assignEmployeeToProject(
  projectId: number,
  employeeId: number,
  options?: { startDate?: string | null }
): Promise<AssignResult> {
  if (!Number.isInteger(employeeId) || employeeId < 1) {
    return { success: false, error: "Invalid employee ID.", details: ["Invalid employee ID."] };
  }
  if (!Number.isInteger(projectId) || projectId < 1) {
    return { success: false, error: "Invalid project ID.", details: ["Invalid project ID."] };
  }
  if (!(await employeeRepository.getById(employeeId))) {
    return { success: false, error: "Employee not found.", details: ["Employee not found."] };
  }
  if (!(await projectRepository.getProjectById(projectId))) {
    return { success: false, error: "Project not found.", details: ["Project not found."] };
  }
  const sd = options?.startDate;
  if (sd != null && sd !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(sd)) {
    return {
      success: false,
      error: "Invalid start date.",
      details: ["Use ISO format YYYY-MM-DD."],
    };
  }
  const result = await projectRepository.assignEmployeeToProject(employeeId, projectId, sd || null);
  if ("error" in result) {
    return { success: false, error: result.error, details: [result.error] };
  }
  return { success: true };
}

export async function unassignEmployeeFromProject(
  projectId: number,
  employeeId: number
): Promise<boolean> {
  return projectRepository.unassignEmployeeFromProject(employeeId, projectId);
}

export async function listEmployeesForProject(projectId: number): Promise<Employee[]> {
  return projectRepository.listEmployeesForProject(projectId);
}

export async function listProjectsForEmployee(employeeId: number): Promise<Project[]> {
  return projectRepository.listProjectsForEmployee(employeeId);
}
