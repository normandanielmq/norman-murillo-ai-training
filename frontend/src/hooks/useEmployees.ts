"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type {
  CreateEmployeeDto,
  Employee,
  EmployeeListItem,
  UpdateEmployeeDto,
} from "@/lib/employee-types";
import { parseApiErrorPayload } from "@/lib/api-error-payload";
import { parseJsonSafe } from "@/lib/parse-json-response";

export type EmployeeMutationResult =
  | { ok: true }
  | { ok: false; error: string; details?: string[] };

export type DeleteEmployeeResult = EmployeeMutationResult;

function toMutationResult(
  res: Response,
  data: unknown,
  fallbackError: string
): EmployeeMutationResult {
  if (res.ok) return { ok: true };
  const { error, details } = parseApiErrorPayload(data, fallbackError);
  return { ok: false, error, details };
}

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees");
      const data = await parseJsonSafe(res);
      if (res.ok) {
        const body = data as {
          employees?: EmployeeListItem[];
          total?: number;
          page?: number;
          pageSize?: number;
        };
        if (body.employees && Array.isArray(body.employees)) {
          setEmployees(body.employees);
          setTotal(body.total ?? body.employees.length);
          setPage(body.page ?? 1);
          setPageSize(body.pageSize ?? 20);
        } else {
          setEmployees([]);
          setTotal(0);
        }
      } else {
        setError((data as { error?: string })?.error ?? "Failed to load employees.");
      }
    } catch {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return { employees, total, page, pageSize, loading, error, loadEmployees };
}

export function useDeleteEmployee(onDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEmployee = useCallback(
    async (id: number): Promise<DeleteEmployeeResult> => {
      setDeleting(true);
      setError(null);
      try {
        const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
        const data = await parseJsonSafe(res);
        const result = toMutationResult(res, data, "Failed to delete employee.");
        if (!result.ok) setError(result.error);
        else onDeleted?.();
        return result;
      } catch {
        const result: DeleteEmployeeResult = {
          ok: false,
          error: "Failed to delete employee.",
          details: [],
        };
        setError(result.error);
        return result;
      } finally {
        setDeleting(false);
      }
    },
    [onDeleted]
  );

  return { deleteEmployee, deleting, error, clearError: () => setError(null) };
}

type EmployeeFetchSnapshot = {
  id: string;
  employee: Employee | null;
  error: string | null;
};

type EmployeeFetchParsed =
  | { kind: "notfound" }
  | { kind: "ok"; data: Employee };

export function useEmployee(id: string | null) {
  const latestIdRef = useRef<string | null>(id);
  useLayoutEffect(() => {
    latestIdRef.current = id;
  }, [id]);

  const [snapshot, setSnapshot] = useState<EmployeeFetchSnapshot | null>(null);

  useEffect(() => {
    if (id == null) return;
    const myId = id;
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch(`/api/employees/${myId}`, {
          signal: controller.signal,
        });
        if (latestIdRef.current !== myId) return;

        let parsed: EmployeeFetchParsed;
        if (res.status === 404) {
          parsed = { kind: "notfound" };
        } else if (!res.ok) {
          throw new Error("Failed to load");
        } else {
          const data = (await res.json()) as Employee;
          parsed = { kind: "ok", data };
        }

        if (latestIdRef.current !== myId) return;
        if (parsed.kind === "notfound") {
          setSnapshot({ id: myId, employee: null, error: null });
        } else {
          setSnapshot({ id: myId, employee: parsed.data, error: null });
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : "";
        if (latestIdRef.current !== myId || name === "AbortError") return;
        setSnapshot({ id: myId, employee: null, error: "Failed to load employee." });
      }
    })();
    return () => {
      controller.abort();
    };
  }, [id]);

  const inSync = id != null && snapshot != null && snapshot.id === id;
  const employee =
    id == null ? undefined : inSync ? snapshot.employee : undefined;
  const error = inSync ? snapshot.error : null;
  const loading = id != null && !inSync && error == null;

  return { employee, loading, error };
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export function useCreateEmployee() {
  const createEmployee = useCallback(async (dto: CreateEmployeeDto): Promise<EmployeeMutationResult> => {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(dto),
    });
    const data = await parseJsonSafe(res);
    return toMutationResult(res, data, "Request failed");
  }, []);
  return { createEmployee };
}

export function useUpdateEmployee(id: string | null) {
  const updateEmployee = useCallback(
    async (dto: UpdateEmployeeDto): Promise<EmployeeMutationResult> => {
      if (id == null) return { ok: false, error: "No id", details: [] };
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(dto),
      });
      const data = await parseJsonSafe(res);
      return toMutationResult(res, data, "Request failed");
    },
    [id]
  );
  return { updateEmployee };
}
