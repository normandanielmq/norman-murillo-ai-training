"use client";

export interface SortArrowDownIconProps {
  className?: string;
}

/** Solid arrow pointing down (descending sort indicator). */
export function SortArrowDownIcon({ className = "h-4 w-4" }: SortArrowDownIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.75.75v10.638L14.71 9.22a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
        clipRule="evenodd"
      />
    </svg>
  );
}
