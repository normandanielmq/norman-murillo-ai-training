export interface EmployeesIconProps {
  className?: string;
}

export function EmployeesIcon({ className }: EmployeesIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.09 9.09 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3.99 3.99 0 00-.941 3.197m0 0A3.99 3.99 0 004.5 21.75a3.99 3.99 0 01-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 015.058 2.772m0 0a3.99 3.99 0 01.941 3.197M15 12.75a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
