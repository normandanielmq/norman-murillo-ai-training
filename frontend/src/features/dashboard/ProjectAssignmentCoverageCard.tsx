"use client";

import type { DashboardProjectAssignmentCoverage } from "@/lib/dashboard-types";
import { DASHBOARD_COVERAGE_NOT_ON_PROJECT, DASHBOARD_COVERAGE_ON_PROJECT } from "./chart-tokens";
import { DashboardInsightCard } from "./DashboardInsightCard";
import { DashboardMoreButton } from "./DashboardMoreButton";

type Props = {
  coverage: DashboardProjectAssignmentCoverage;
  totalEmployees: number;
};

export function ProjectAssignmentCoverageCard({ coverage, totalEmployees }: Props) {
  const { onAtLeastOneProject, onNoProject, percentOnProject } = coverage;
  const pctOn = totalEmployees === 0 ? 0 : (onAtLeastOneProject / totalEmployees) * 100;
  const pctOff = totalEmployees === 0 ? 0 : (onNoProject / totalEmployees) * 100;
  const percentNotOn =
    totalEmployees === 0 ? 0 : Math.round((onNoProject / totalEmployees) * 1000) / 10;

  const summary = [
    `Total employees: ${totalEmployees}.`,
    `${onAtLeastOneProject} on at least one project (${percentOnProject}%).`,
    `${onNoProject} not on any project (${percentNotOn}%).`,
  ].join(" ");

  return (
    <DashboardInsightCard
      title="Project assignment coverage"
      screenReaderSummary={summary}
      headerRight={<DashboardMoreButton />}
    >
      <p className="mb-4 text-sm text-gray-600">
        Share of people assigned to at least one project — useful for finding gaps before audits or
        planning staffing.
      </p>
      {totalEmployees === 0 ? (
        <p className="text-sm text-gray-500">No employees in the directory.</p>
      ) : (
        <>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-100" aria-hidden>
            {onAtLeastOneProject > 0 ? (
              <div
                className="h-full min-w-0 transition-[width] duration-500"
                style={{
                  width: `${pctOn}%`,
                  backgroundColor: DASHBOARD_COVERAGE_ON_PROJECT,
                }}
              />
            ) : null}
            {onNoProject > 0 ? (
              <div
                className="h-full min-w-0 transition-[width] duration-500"
                style={{
                  width: `${pctOff}%`,
                  backgroundColor: DASHBOARD_COVERAGE_NOT_ON_PROJECT,
                }}
              />
            ) : null}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DASHBOARD_COVERAGE_ON_PROJECT }}
                aria-hidden
              />
              <span className="font-medium text-gray-900">On a project</span>
              <span className="tabular-nums text-gray-600">
                {onAtLeastOneProject} ({percentOnProject}%)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full border border-gray-200"
                style={{ backgroundColor: DASHBOARD_COVERAGE_NOT_ON_PROJECT }}
                aria-hidden
              />
              <span className="font-medium text-gray-900">Not on any project</span>
              <span className="tabular-nums text-gray-600">
                {onNoProject} ({percentNotOn}%)
              </span>
            </li>
          </ul>
        </>
      )}
    </DashboardInsightCard>
  );
}
