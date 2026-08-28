/** Decorative “more” control to match dashboard mockup (no actions). */
export function DashboardMoreButton() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400" aria-hidden>
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </span>
  );
}
