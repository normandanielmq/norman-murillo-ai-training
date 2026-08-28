export interface ProjectsIconProps {
  className?: string;
}

export function ProjectsIcon({ className }: ProjectsIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 14.15v4.225c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-4.225m18.75 0a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25v4.425a2.25 2.25 0 01-2.25 2.25H3.75m18 0h-1.5m-15 0H3.75m0 0h-.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h18.75c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h2.25z"
      />
    </svg>
  );
}
