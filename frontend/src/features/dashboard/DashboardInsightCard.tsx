import type { ReactNode } from "react";
import { PORTAL_ELEVATED_PANEL_CLASS } from "@/lib/portal-layout-classes";

type Props = {
  title: string;
  /** Screen-reader summary of chart data (replaces decorative chart for AT). */
  screenReaderSummary: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** White elevated panel with title row (dashboard mockup). */
export function DashboardInsightCard({ title, screenReaderSummary, headerRight, children, className = "" }: Props) {
  return (
    <section
      className={`${PORTAL_ELEVATED_PANEL_CLASS} p-6 ${className}`.trim()}
      aria-labelledby={`${dashId(title)}-heading`}
    >
      <p id={`${dashId(title)}-sr`} className="sr-only">
        {screenReaderSummary}
      </p>
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 id={`${dashId(title)}-heading`} className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        {headerRight ?? null}
      </div>
      <div aria-describedby={`${dashId(title)}-sr`}>{children}</div>
    </section>
  );
}

function dashId(title: string): string {
  return `dash-${title.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "")}`;
}
