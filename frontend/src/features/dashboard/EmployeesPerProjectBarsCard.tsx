"use client";

import type { DashboardInsightsDto } from "@/lib/dashboard-types";
import { DashboardInsightCard } from "./DashboardInsightCard";
import { DashboardMoreButton } from "./DashboardMoreButton";

type Props = Pick<DashboardInsightsDto, "employeesPerProject">;

export function EmployeesPerProjectBarsCard({ employeesPerProject }: Props) {
  const max = Math.max(1, ...employeesPerProject.map((r) => r.count));
  const summary = employeesPerProject
    .map((r) => `${r.projectName}: ${r.count} assigned`)
    .join(". ");

  return (
    <DashboardInsightCard
      title="Employees per Project"
      screenReaderSummary={summary || "No projects."}
      headerRight={<DashboardMoreButton />}
    >
      {employeesPerProject.length === 0 ? (
        <p className="text-sm text-gray-500">No projects yet.</p>
      ) : (
        <ul className="space-y-4" aria-label="Headcount by project">
          {employeesPerProject.map((r) => {
            const pct = (r.count / max) * 100;
            const peopleLabel = r.count === 1 ? "1 Person" : `${r.count} People`;
            return (
              <li key={r.projectId}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-gray-900">{r.projectName}</span>
                  <span className="shrink-0 tabular-nums text-gray-600">{peopleLabel}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardInsightCard>
  );
}
