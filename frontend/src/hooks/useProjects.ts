"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type {
  Project,
  ProjectWithTeam,
  CreateProjectDto,
  UpdateProjectDto,
} from "@/lib/project-types";
import type { Employee } from "@/lib/employee-types";
import { parseApiErrorPayload } from "@/lib/api-error-payload";
import { parseJsonSafe } from "@/lib/parse-json-response";

export type ProjectMutationResult =
  | { ok: true; project?: Project }
  | { ok: false; error: string; details?: string[] };

function toMutationResult(
  res: Response,
  data: unknown,
  fallbackError: string
): ProjectMutationResult {
  if (res.ok) {
    const p = data as Project | undefined;
    return p && typeof p.id === "number" ? { ok: true, project: p } : { ok: true };
  }
  const { error, details } = parseApiErrorPayload(data, fallbackError);
  return { ok: false, error, details };
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      const data = await parseJsonSafe(res);
      if (res.ok) {
        setProjects(Array.isArray(data) ? (data as ProjectWithTeam[]) : []);
      } else {
        setError((data as { error?: string })?.error ?? "Failed to load projects.");
      }
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, error, loadProjects };
}

type ProjectFetchSnapshot = {
  id: string;
  project: Project | null;
  error: string | null;
};

type ProjectFetchParsed =
  | { kind: "notfound" }
  | { kind: "ok"; data: Project };

export function useProject(id: string | null) {
  const latestIdRef = useRef<string | null>(id);
  useLayoutEffect(() => {
    latestIdRef.current = id;
  }, [id]);

  const [snapshot, setSnapshot] = useState<ProjectFetchSnapshot | null>(null);

  useEffect(() => {
    if (id == null) return;
    const myId = id;
    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`/api/projects/${myId}`, {
          signal: controller.signal,
        });
        if (latestIdRef.current !== myId) return;

        let parsed: ProjectFetchParsed;
        if (res.status === 404) {
          parsed = { kind: "notfound" };
        } else if (!res.ok) {
          throw new Error("Failed to load");
        } else {
          const data = (await res.json()) as Project;
          parsed = { kind: "ok", data };
        }

        if (latestIdRef.current !== myId) return;
        if (parsed.kind === "notfound") {
          setSnapshot({ id: myId, project: null, error: null });
        } else {
          setSnapshot({ id: myId, project: parsed.data, error: null });
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : "";
        if (latestIdRef.current !== myId || name === "AbortError") return;
        setSnapshot({ id: myId, project: null, error: "Failed to load project." });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [id]);

  const inSync = id != null && snapshot != null && snapshot.id === id;
  const project =
    id == null ? undefined : inSync ? snapshot.project : undefined;
  const error = inSync ? snapshot.error : null;
  const loading = id != null && !inSync && error == null;

  return { project, loading, error };
}

export function useCreateProject() {
  const createProject = useCallback(async (dto: CreateProjectDto): Promise<ProjectMutationResult> => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(dto),
    });
    const data = await parseJsonSafe(res);
    return toMutationResult(res, data, "Request failed");
  }, []);
  return { createProject };
}

export function useUpdateProject(id: string | null) {
  const updateProject = useCallback(
    async (dto: UpdateProjectDto): Promise<ProjectMutationResult> => {
      if (id == null) return { ok: false, error: "No id", details: [] };
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(dto),
      });
      const data = await parseJsonSafe(res);
      return toMutationResult(res, data, "Request failed");
    },
    [id]
  );
  return { updateProject };
}

export function useDeleteProject(onDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = useCallback(
    async (projectId: number): Promise<ProjectMutationResult> => {
      setDeleting(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        const data = await parseJsonSafe(res);
        const result = toMutationResult(res, data, "Failed to delete project.");
        if (!result.ok) setError(result.error);
        else onDeleted?.();
        return result;
      } catch {
        const err = "Failed to delete project.";
        setError(err);
        return { ok: false, error: err, details: [] };
      } finally {
        setDeleting(false);
      }
    },
    [onDeleted]
  );

  return { deleteProject, deleting, error, clearError: () => setError(null) };
}

export async function assignEmployeeToProjectApi(
  projectId: number,
  employeeId: number,
  options?: { startDate?: string | null }
): Promise<ProjectMutationResult> {
  const payload: { employeeId: number; startDate?: string } = { employeeId };
  if (options?.startDate) payload.startDate = options.startDate;
  const res = await fetch(`/api/projects/${projectId}/employees`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  return toMutationResult(res, data, "Assignment failed.");
}

export async function unassignEmployeeFromProjectApi(
  projectId: number,
  employeeId: number
): Promise<ProjectMutationResult> {
  const res = await fetch(`/api/projects/${projectId}/employees/${employeeId}`, {
    method: "DELETE",
  });
  const data = await parseJsonSafe(res);
  if (res.ok) return { ok: true };
  return toMutationResult(res, data, "Unassign failed.");
}

export async function fetchAllProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  const data = await parseJsonSafe(res);
  if (!res.ok) return [];
  const arr = Array.isArray(data) ? (data as ProjectWithTeam[]) : [];
  return arr.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
  }));
}

export async function fetchProjectsForEmployee(employeeId: number): Promise<Project[]> {
  const res = await fetch(`/api/employees/${employeeId}/projects`);
  const data = (await parseJsonSafe(res)) as { projects?: Project[] };
  if (!res.ok) return [];
  return data.projects ?? [];
}

const EMPLOYEE_LIST_MAX_PAGE_SIZE = 1000;

export async function fetchAllEmployees(): Promise<Employee[]> {
  const res = await fetch(
    `/api/employees?page=1&pageSize=${EMPLOYEE_LIST_MAX_PAGE_SIZE}`
  );
  const data = await parseJsonSafe(res);
  if (!res.ok) return [];
  const body = data as { employees?: Employee[] };
  return Array.isArray(body.employees) ? body.employees : [];
}

export async function fetchEmployeesForProject(projectId: number): Promise<Employee[]> {
  const res = await fetch(`/api/projects/${projectId}/employees`);
  const data = (await parseJsonSafe(res)) as { employees?: Employee[] };
  if (!res.ok) return [];
  return data.employees ?? [];
}
