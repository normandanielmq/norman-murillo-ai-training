"use client";

import { useCallback, useEffect, useState } from "react";
import type { Employee } from "@/lib/employee-types";
import type { Project } from "@/lib/project-types";
import {
  fetchAllEmployees,
  fetchAllProjects,
  fetchEmployeesForProject,
  fetchProjectsForEmployee,
  assignEmployeeToProjectApi,
  unassignEmployeeFromProjectApi,
} from "@/hooks/useProjects";
import { ModalShell } from "@/components/ModalShell";
import { ModalError } from "@/components/ModalError";
import { ModalCancelPrimaryButtons } from "@/components/ModalFooter";

const CHECKBOX_CLASS =
  "h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500";

type AssignmentLinkModalProps =
  | {
      variant: "employeeProjects";
      employee: Employee;
      onClose: () => void;
      onSaved?: () => void;
    }
  | {
      variant: "projectEmployees";
      project: Project;
      onClose: () => void;
      onSaved?: () => void;
    };

export function AssignmentLinkModal(props: Readonly<AssignmentLinkModalProps>) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [initialIds, setInitialIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (props.variant === "employeeProjects") {
        const { employee } = props;
        const [all, assigned] = await Promise.all([
          fetchAllProjects(),
          fetchProjectsForEmployee(employee.id),
        ]);
        setAllProjects(all);
        setAllEmployees([]);
        const ids = new Set(assigned.map((p) => p.id));
        setSelectedIds(new Set(ids));
        setInitialIds(new Set(ids));
      } else {
        const { project } = props;
        const [all, assigned] = await Promise.all([
          fetchAllEmployees(),
          fetchEmployeesForProject(project.id),
        ]);
        setAllEmployees(all);
        setAllProjects([]);
        const ids = new Set(assigned.map((e) => e.id));
        setSelectedIds(new Set(ids));
        setInitialIds(new Set(ids));
      }
    } catch {
      setError(
        props.variant === "employeeProjects"
          ? "Failed to load projects."
          : "Failed to load employees."
      );
    } finally {
      setLoading(false);
    }
  }, [
    props.variant,
    props.variant === "employeeProjects" ? props.employee.id : props.project.id,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const toAdd = [...selectedIds].filter((id) => !initialIds.has(id));
    const toRemove = [...initialIds].filter((id) => !selectedIds.has(id));
    try {
      if (props.variant === "employeeProjects") {
        const { employee } = props;
        for (const projectId of toAdd) {
          const r = await assignEmployeeToProjectApi(projectId, employee.id);
          if (!r.ok) {
            setError(r.details?.join(" ") ?? r.error);
            setSaving(false);
            return;
          }
        }
        for (const projectId of toRemove) {
          const r = await unassignEmployeeFromProjectApi(projectId, employee.id);
          if (!r.ok) {
            setError(r.details?.join(" ") ?? r.error);
            setSaving(false);
            return;
          }
        }
      } else {
        const { project } = props;
        for (const employeeId of toAdd) {
          const r = await assignEmployeeToProjectApi(project.id, employeeId);
          if (!r.ok) {
            setError(r.details?.join(" ") ?? r.error);
            setSaving(false);
            return;
          }
        }
        for (const employeeId of toRemove) {
          const r = await unassignEmployeeFromProjectApi(project.id, employeeId);
          if (!r.ok) {
            setError(r.details?.join(" ") ?? r.error);
            setSaving(false);
            return;
          }
        }
      }
      props.onSaved?.();
      props.onClose();
    } catch {
      setError("Failed to save assignments.");
    } finally {
      setSaving(false);
    }
  };

  const titleId =
    props.variant === "employeeProjects" ? "emp-proj-title" : "proj-emp-title";

  return (
    <ModalShell titleId={titleId} onBackdropRequestClose={props.onClose} blockBackdropClose={saving}>
      {props.variant === "employeeProjects" ? (
        <>
          <h3 id={titleId} className="text-lg font-semibold text-gray-900">
            Assign projects — {props.employee.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">Select the projects this employee works on.</p>
        </>
      ) : (
        <>
          <h3 id={titleId} className="text-lg font-semibold text-gray-900">
            Assign employees — {props.project.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">Select employees for this project.</p>
        </>
      )}
      {error ? <ModalError>{error}</ModalError> : null}
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Loading…</p>
      ) : props.variant === "employeeProjects" ? (
        allProjects.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No projects yet. Create a project first.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {allProjects.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggle(p.id)}
                    disabled={saving}
                    className={`mt-1 ${CHECKBOX_CLASS}`}
                  />
                  <span>
                    <span className="font-medium text-gray-900">{p.name}</span>
                    {p.description ? (
                      <span className="mt-0.5 block text-xs text-gray-500 line-clamp-2">{p.description}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )
      ) : allEmployees.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No employees in the directory.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {allEmployees.map((e) => (
            <li key={e.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 p-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedIds.has(e.id)}
                  onChange={() => toggle(e.id)}
                  disabled={saving}
                  className={CHECKBOX_CLASS}
                />
                <span className="font-medium text-gray-900">{e.name}</span>
                <span className="text-xs text-gray-500">{e.officialTitle}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <ModalCancelPrimaryButtons
        onCancel={props.onClose}
        onPrimary={handleSave}
        primaryLabel="Save"
        primaryPendingLabel="Saving…"
        pending={saving}
        cancelDisabled={saving}
        primaryDisabled={saving || loading}
        withTopBorder
        cancelVariant="outline"
      />
    </ModalShell>
  );
}
