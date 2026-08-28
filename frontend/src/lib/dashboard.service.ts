import type { DashboardInsightsDto } from "./dashboard-types";
import * as dashboardRepository from "./dashboard.repository";

export type DashboardInsightsResult =
  | { success: true; data: DashboardInsightsDto }
  | { success: false; error: string; details: string[] };

/** Map DB gender strings to chart buckets (case-insensitive Male/Female; else Other). */
export function genderChartBucket(gender: string): "male" | "female" | "other" {
  const g = gender.trim().toLowerCase();
  if (g === "male") return "male";
  if (g === "female") return "female";
  return "other";
}

/** Compact number for donut center (e.g. 1200 -> "1.2k"). */
export function formatCompactEmployeeTotal(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    const s = Number.isInteger(rounded) ? String(Math.round(rounded)) : rounded.toFixed(1);
    return `${s}k`;
  }
  const m = n / 1_000_000;
  const rounded = Math.round(m * 10) / 10;
  const s = Number.isInteger(rounded) ? String(Math.round(rounded)) : rounded.toFixed(1);
  return `${s}M`;
}

export async function getInsights(): Promise<DashboardInsightsResult> {
  const totalFromTable = await dashboardRepository.countAllEmployees();
  const byCountry = await dashboardRepository.aggregateEmployeesByCountry();
  const sumCountries = byCountry.reduce((s, r) => s + r.count, 0);
  if (sumCountries !== totalFromTable) {
    return {
      success: false,
      error: "Dashboard data inconsistency.",
      details: ["Country aggregate total does not match employee count."],
    };
  }

  const sortedCountries = [...byCountry].sort((a, b) => a.country.localeCompare(b.country));

  const withPercent = sortedCountries.map((row) => ({
    country: row.country,
    count: row.count,
    percent: totalFromTable === 0 ? 0 : Math.round((row.count / totalFromTable) * 1000) / 10,
  }));

  const headcounts = await dashboardRepository.aggregateHeadcountByProject();
  const perProjectSorted = [...headcounts].sort(
    (a, b) => b.count - a.count || a.projectName.localeCompare(b.projectName)
  );

  const genderRaw = await dashboardRepository.aggregateGenderCountsByProjectRaw();
  const byProj = new Map<
    number,
    { projectName: string; male: number; female: number; other: number }
  >();

  for (const row of perProjectSorted) {
    byProj.set(row.projectId, {
      projectName: row.projectName,
      male: 0,
      female: 0,
      other: 0,
    });
  }

  for (const row of genderRaw) {
    const bucket = genderChartBucket(row.gender);
    let entry = byProj.get(row.projectId);
    if (!entry) {
      entry = { projectName: row.projectName, male: 0, female: 0, other: 0 };
      byProj.set(row.projectId, entry);
    }
    entry[bucket] += row.count;
  }

  const genderByProject = perProjectSorted.map((p) => {
    const g = byProj.get(p.projectId)!;
    return {
      projectId: p.projectId,
      projectName: p.projectName,
      male: g.male,
      female: g.female,
      other: g.other,
    };
  });

  const onProject = await dashboardRepository.countEmployeesOnAtLeastOneProject();
  const onNoProject = totalFromTable - onProject;
  if (onNoProject < 0) {
    return {
      success: false,
      error: "Dashboard data inconsistency.",
      details: ["Assignment coverage exceeds total employees."],
    };
  }

  const data: DashboardInsightsDto = {
    totalEmployees: totalFromTable,
    totalEmployeesLabel: formatCompactEmployeeTotal(totalFromTable),
    employeesByCountry: withPercent,
    employeesPerProject: perProjectSorted,
    genderByProject,
    projectAssignmentCoverage: {
      onAtLeastOneProject: onProject,
      onNoProject,
      percentOnProject:
        totalFromTable === 0 ? 0 : Math.round((onProject / totalFromTable) * 1000) / 10,
    },
  };

  return { success: true, data };
}
