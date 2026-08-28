"use client";

import { Button } from "@/components/Button";

export type EmployeeDirectoryPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export function EmployeeDirectoryPagination({
  page,
  pageSize,
  total,
  disabled,
  onPageChange,
  onPageSizeChange,
}: EmployeeDirectoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <p className="tabular-nums">
        {total === 0 ? (
          <>No results</>
        ) : (
          <>
            Showing <span className="font-medium text-gray-900">{from}</span>–
            <span className="font-medium text-gray-900">{to}</span> of{" "}
            <span className="font-medium text-gray-900">{total}</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-gray-500">Rows per page</span>
          <select
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number.parseInt(e.target.value, 10))}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
            size="sm"
            disabled={disabled || safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="tabular-nums text-gray-500">
            Page {safePage} of {totalPages}
          </span>
          <Button
            variant="neutral"
            size="sm"
            disabled={disabled || safePage >= totalPages || total === 0}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
