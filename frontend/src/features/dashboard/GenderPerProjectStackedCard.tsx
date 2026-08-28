"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardInsightsDto } from "@/lib/dashboard-types";
import {
  DASHBOARD_GENDER_FEMALE,
  DASHBOARD_GENDER_MALE,
  DASHBOARD_GENDER_OTHER,
} from "./chart-tokens";
import { DashboardInsightCard } from "./DashboardInsightCard";

type Props = Pick<DashboardInsightsDto, "genderByProject">;

/** Stacked segments as % of each project’s team so every bar has the same total height (100%). */
function genderRowToChartRow(row: {
  projectId: number;
  projectName: string;
  male: number;
  female: number;
  other: number;
}) {
  const label =
    row.projectName.length > 18 ? `${row.projectName.slice(0, 16)}…` : row.projectName;
  const total = row.male + row.female + row.other;
  if (total === 0) {
    return {
      ...row,
      label,
      malePct: 0,
      femalePct: 0,
      otherPct: 0,
    };
  }
  const malePct = Math.round((row.male / total) * 1000) / 10;
  const femalePct = Math.round((row.female / total) * 1000) / 10;
  const otherPct = Math.round((100 - malePct - femalePct) * 10) / 10;
  return {
    ...row,
    label,
    malePct,
    femalePct,
    otherPct,
  };
}

export function GenderPerProjectStackedCard({ genderByProject }: Props) {
  const data = genderByProject.map(genderRowToChartRow);

  const summary = genderByProject
    .map((r) => {
      const t = r.male + r.female + r.other;
      if (t === 0) {
        return `${r.projectName}: no assignees`;
      }
      const mp = Math.round((r.male / t) * 1000) / 10;
      const fp = Math.round((r.female / t) * 1000) / 10;
      const op = Math.round((100 - mp - fp) * 10) / 10;
      return `${r.projectName}: male ${r.male} (${mp}%), female ${r.female} (${fp}%), other ${r.other} (${op}%)`;
    })
    .join(". ");

  return (
    <DashboardInsightCard
      title="Gender Distribution per Project"
      screenReaderSummary={summary || "No project gender data."}
      headerRight={
        <ul className="flex flex-wrap items-center justify-end gap-4 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DASHBOARD_GENDER_MALE }} aria-hidden />
            Male
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DASHBOARD_GENDER_FEMALE }} aria-hidden />
            Female
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DASHBOARD_GENDER_OTHER }} aria-hidden />
            Other
          </li>
        </ul>
      }
    >
      {data.length === 0 ? (
        <p className="text-sm text-gray-500">No projects to display.</p>
      ) : (
        <div className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
              barCategoryGap="18%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={56}
              />
              <YAxis type="number" domain={[0, 100]} hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(value: number, name: string, item) => {
                  const payload = item.payload as {
                    male: number;
                    female: number;
                    other: number;
                  };
                  const count =
                    name === "Male" ? payload.male : name === "Female" ? payload.female : payload.other;
                  return [`${count} (${value}%)`, name];
                }}
                labelFormatter={(_, items) => {
                  const p = items[0]?.payload as { projectName?: string } | undefined;
                  return p?.projectName ?? "";
                }}
              />
              <Bar dataKey="malePct" stackId="g" name="Male" fill={DASHBOARD_GENDER_MALE} />
              <Bar dataKey="femalePct" stackId="g" name="Female" fill={DASHBOARD_GENDER_FEMALE} />
              <Bar
                dataKey="otherPct"
                stackId="g"
                name="Other"
                fill={DASHBOARD_GENDER_OTHER}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardInsightCard>
  );
}
