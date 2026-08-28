"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { Employee } from "@/lib/employee-types";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FormCard } from "@/components/FormCard";
import { Button } from "@/components/Button";
import { ErrorCallout } from "@/components/ErrorCallout";
import {
  assignEmployeeToProjectApi,
  fetchAllEmployees,
  fetchEmployeesForProject,
  useProject,
} from "@/hooks/useProjects";

export default function AssignProjectEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { project, loading: projectLoading, error: projectError } = useProject(id);

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [pickId, setPickId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const emps = await fetchAllEmployees();
      if (!cancelled) setAllEmployees(emps);
      if (!cancelled) setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    (async () => {
      const onProject = await fetchEmployeesForProject(project.id);
      if (!cancelled) setAssignedIds(new Set(onProject.map((e) => e.id)));
    })();
    return () => {
      cancelled = true;
    };
  }, [project]);

  const selectable = allEmployees.filter((e) => !assignedIds.has(e.id));

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const employeeId = parseInt(pickId, 10);
    if (!project || !Number.isInteger(employeeId) || employeeId < 1) {
      setError("Select an employee.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await assignEmployeeToProjectApi(project.id, employeeId, {
        startDate: startDate.trim() || undefined,
      });
      if (!r.ok) {
        setError(r.details?.join(" ") ?? r.error);
        return;
      }
      router.push("/projects");
    } finally {
      setSubmitting(false);
    }
  };

  if (projectError) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-red-600">{projectError}</p>
        <Link href="/projects" className="mt-3 inline-block text-sm font-medium text-violet-700 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (projectLoading || !project) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center text-gray-500">
        {projectLoading ? "Loading…" : "Project not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${project.id}/edit` },
          { label: "Assign Employee" },
        ]}
      />
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Assign New Employee</h1>
      <p className="mt-2 text-sm text-gray-500">Select an employee and set their project start date.</p>

      <FormCard className="mt-8">
        <form onSubmit={handleAssign} className="space-y-8">
          <div>
            <label htmlFor="assign-emp" className="mb-2 block text-sm font-semibold text-gray-900">
              Employee Name
            </label>
            <div className="relative">
              <select
                id="assign-emp"
                value={pickId}
                onChange={(e) => {
                  setPickId(e.target.value);
                  setError(null);
                }}
                disabled={submitting || loadingData || selectable.length === 0}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">Select an employee</option>
                {selectable.map((emp) => (
                  <option key={emp.id} value={String(emp.id)}>
                    {emp.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                ▾
              </span>
            </div>
            {selectable.length === 0 && !loadingData ? (
              <p className="mt-2 text-xs text-gray-500">All employees are already assigned to this project.</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="assign-start" className="mb-2 block text-sm font-semibold text-gray-900">
              Start Date
            </label>
            <div className="relative">
              <input
                id="assign-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-4 text-sm text-gray-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {error ? <ErrorCallout message={error} padding="compact" /> : null}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting || !pickId}
              className="px-5 py-2.5 font-semibold shadow-sm"
            >
              {submitting ? "Assigning…" : "Assign to Project"}
            </Button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
