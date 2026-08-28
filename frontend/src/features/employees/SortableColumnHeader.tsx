"use client";

import type { EmployeeListSortColumn } from "@/lib/employee-types";
import { Button } from "@/components/Button";
import { SortArrowDownIcon } from "@/components/icons/SortArrowDownIcon";
import { SortArrowUpIcon } from "@/components/icons/SortArrowUpIcon";
import { EMPLOYEE_TABLE_TH_CLASS } from "@/features/employees/table-classes";

const BTN_CLASS =
  "group inline-flex w-full min-w-0 items-center gap-0.5 text-left font-medium uppercase tracking-wider text-gray-500 hover:text-gray-900";

type Props = {
  label: string;
  column: EmployeeListSortColumn;
  sortBy: EmployeeListSortColumn;
  sortOrder: "asc" | "desc";
  onSort: (column: EmployeeListSortColumn) => void;
};

export function SortableColumnHeader({ label, column, sortBy, sortOrder, onSort }: Props) {
  const active = sortBy === column;
  return (
    <th
      scope="col"
      className={EMPLOYEE_TABLE_TH_CLASS}
      aria-sort={active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
    >
      <Button
        type="button"
        variant="ghost"
        onClick={() => onSort(column)}
        className={`${BTN_CLASS} w-full min-w-0 justify-start p-0 hover:bg-transparent`}
      >
        <span>{label}</span>
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-violet-600"
          aria-hidden
        >
          {active ? (
            sortOrder === "asc" ? (
              <SortArrowUpIcon />
            ) : (
              <SortArrowDownIcon />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
        </span>
      </Button>
    </th>
  );
}
