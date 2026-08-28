/** Purple app mark — matches HR System mockups. */
export function SparkleMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-base font-bold leading-none text-white shadow-sm ${className}`.trim()}
      aria-hidden
    >
      ✦
    </div>
  );
}
