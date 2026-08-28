"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Employee } from "@/lib/employee-types";
import { FormField, INPUT_CLASS } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { FormErrorList } from "@/components/FormErrorList";
import { FormCard } from "@/components/FormCard";
import { Button } from "@/components/Button";
import { assignEmployeeToProjectApi, fetchAllEmployees, useCreateProject } from "@/hooks/useProjects";
import { TrashIcon } from "@/components/icons/TrashIcon";

function empInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProjectCreateForm() {
  const router = useRouter();
  const { createProject } = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [pickId, setPickId] = useState("");
  const [assigned, setAssigned] = useState<Employee[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetchAllEmployees()
      .then(setAllEmployees)
      .finally(() => setLoadingEmployees(false));
  }, []);

  const available = allEmployees.filter((e) => !assigned.some((a) => a.id === e.id));

  const addEmployee = () => {
    const id = parseInt(pickId, 10);
    if (!Number.isInteger(id) || id < 1) return;
    const e = allEmployees.find((x) => x.id === id);
    if (!e) return;
    if (assigned.some((a) => a.id === id)) return;
    setAssigned((prev) => [...prev, e]);
    setPickId("");
    setErrors([]);
  };

  const removeEmployee = (id: number) => {
    setAssigned((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const result = await createProject({ name, description });
      if (!result.ok) {
        setErrors(result.details ?? (result.error ? [result.error] : []));
        return;
      }
      const project = result.project;
      if (!project) {
        setErrors(["Could not read created project."]);
        return;
      }
      for (const emp of assigned) {
        const ar = await assignEmployeeToProjectApi(project.id, emp.id);
        if (!ar.ok) {
          setErrors(ar.details ?? [ar.error]);
          return;
        }
      }
      router.push("/projects");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard>
      <form onSubmit={handleSubmit} className="space-y-8">
        <FormErrorList messages={errors} />

        <FormField label="Project Name" id="createProjectName" required>
          <input
            id="createProjectName"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors([]);
            }}
            placeholder="e.g. Infrastructure Overhaul"
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>

        <div>
          <label
            htmlFor="createProjectDescription"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            Project Description
          </label>
          <textarea
            id="createProjectDescription"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors([]);
            }}
            rows={4}
            placeholder="Describe the project goals and scope…"
            className={INPUT_CLASS}
          />
        </div>

        <div className="border-t border-gray-100 pt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Assigned Employees</h3>
            <div className="flex flex-wrap items-center gap-2">
              <SelectField
                label="Employee to add"
                id="project-add-employee"
                hideLabel
                className="inline-block max-w-xs shrink-0"
                value={pickId}
                onChange={setPickId}
                disabled={loadingEmployees || submitting || available.length === 0}
                selectClassName="max-w-xs"
                options={[
                  { value: "", label: "Select an employee" },
                  ...available.map((emp) => ({ value: String(emp.id), label: emp.name })),
                ]}
              />
              <Button
                type="button"
                variant="soft"
                onClick={addEmployee}
                disabled={!pickId || submitting}
              >
                <span aria-hidden>+</span> Add Employee
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/80">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Employee name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {assigned.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-sm text-gray-400">
                      No employees assigned yet. Use &quot;+ Add Employee&quot; to build your team.
                    </td>
                  </tr>
                ) : (
                  assigned.map((emp) => (
                    <tr key={emp.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-700">
                            {empInitials(emp.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeEmployee(emp.id)}
                          disabled={submitting}
                          className="rounded-lg p-2 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${emp.name}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 text-xs italic text-gray-500">
              Assign team members to collaborate on this project.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-8">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={submitting}
            className="px-5 py-2.5 font-semibold shadow-sm"
          >
            {submitting ? "Saving…" : "Save Project"}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
