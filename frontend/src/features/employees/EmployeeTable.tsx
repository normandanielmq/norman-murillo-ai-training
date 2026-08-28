"use client";

import Link from "next/link";
import type { Employee, EmployeeListItem, EmployeeListSortColumn } from "@/lib/employee-types";
import { getInitialsFromName } from "@/lib/format-name";
import { SortableColumnHeader } from "./SortableColumnHeader";
import { Button } from "@/components/Button";
import { PencilIcon } from "@/components/icons/PencilIcon";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { LinkIcon } from "@/features/employees/icons/LinkIcon";
import { EMPLOYEE_TABLE_TD_CLASS, EMPLOYEE_TABLE_TH_CLASS } from "@/features/employees/table-classes";
/** Project names can be long comma-separated lists; must wrap without overlapping the Actions column. */
const TD_PROJECT_CLASS =
  "min-w-0 max-w-[14rem] whitespace-normal break-words px-4 py-3 align-top text-sm text-gray-600 [overflow-wrap:anywhere]";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export interface EmployeeTableProps {
  employees: EmployeeListItem[];
  loading: boolean;
  onDeleteClick: (employee: Employee) => void;
  onAssignProjectsClick?: (employee: Employee) => void;
  /** Shown when not loading and the list is empty (e.g. filtered-out results). */
  emptyMessage?: string;
  /** When set, column headers become sort controls (server-side sort). */
  sortBy?: EmployeeListSortColumn;
  sortOrder?: "asc" | "desc";
  onSort?: (column: EmployeeListSortColumn) => void;
}

export function EmployeeTable({
  employees,
  loading,
  onDeleteClick,
  onAssignProjectsClick,
  emptyMessage = "No employees yet.",
  sortBy,
  sortOrder,
  onSort,
}: EmployeeTableProps) {
  const sortable = onSort != null && sortBy != null && sortOrder != null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading…</div>
      ) : employees.length === 0 ? (
        <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {sortable ? (
                <>
                  <SortableColumnHeader
                    label="Name"
                    column="name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="National ID"
                    column="nationalId"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="Title"
                    column="officialTitle"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="Hire Date"
                    column="hireDate"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="Country"
                    column="country"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="Gender"
                    column="gender"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                  <SortableColumnHeader
                    label="Email"
                    column="email"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </>
              ) : (
                <>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Name</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>National ID</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Title</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Hire Date</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Country</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Gender</th>
                  <th scope="col" className={EMPLOYEE_TABLE_TH_CLASS}>Email</th>
                </>
              )}
              <th scope="col" className={`${EMPLOYEE_TABLE_TH_CLASS} w-[14rem] max-w-[14rem]`}>
                Project
              </th>
              <th scope="col" className={`${EMPLOYEE_TABLE_TH_CLASS} text-right`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {employees.map((emp, index) => (
              <tr
                key={emp.id}
                className={index % 2 === 1 ? "bg-gray-50/70" : "bg-white"}
              >
                <td className={EMPLOYEE_TABLE_TD_CLASS}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-medium text-[#475569]">
                      {getInitialsFromName(emp.name)}
                    </div>
                    <span className="font-semibold text-gray-900">{emp.name}</span>
                  </div>
                </td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>{emp.nationalId}</td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>{emp.officialTitle}</td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>{formatDate(emp.hireDate)}</td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>{emp.country}</td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>{emp.gender}</td>
                <td className={EMPLOYEE_TABLE_TD_CLASS}>
                  <a href={`mailto:${emp.email}`} className="text-sm text-blue-600 hover:underline">
                    {emp.email}
                  </a>
                </td>
                <td className={TD_PROJECT_CLASS}>
                  {emp.projectNames.trim() ? emp.projectNames : "—"}
                </td>
                <td className={`${EMPLOYEE_TABLE_TD_CLASS} text-right`}>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/employees/${emp.id}/edit`}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                      aria-label={`Edit ${emp.name}`}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    {onAssignProjectsClick && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onAssignProjectsClick(emp)}
                        className="hover:bg-violet-50 hover:text-violet-600"
                        title="Assign to projects"
                        aria-label={`Assign ${emp.name} to projects`}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onDeleteClick(emp)}
                      className="hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                      aria-label={`Delete ${emp.name}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
