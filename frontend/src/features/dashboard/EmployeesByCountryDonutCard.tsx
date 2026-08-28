"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { DashboardInsightsDto } from "@/lib/dashboard-types";
import { DASHBOARD_DONUT_FILLS } from "./chart-tokens";
import { DashboardInsightCard } from "./DashboardInsightCard";
import { DashboardMoreButton } from "./DashboardMoreButton";

type Props = Pick<DashboardInsightsDto, "employeesByCountry" | "totalEmployeesLabel" | "totalEmployees">;

export function EmployeesByCountryDonutCard({ employeesByCountry, totalEmployeesLabel, totalEmployees }: Props) {
  const pieData = employeesByCountry.map((row) => ({
    name: row.country,
    count: row.count,
    percent: row.percent,
  }));

  const summary = [
    `Total employees: ${totalEmployees}.`,
    ...employeesByCountry.map((r) => `${r.country}: ${r.count} (${r.percent}%).`),
  ].join(" ");

  return (
    <DashboardInsightCard
      title="Employees by Country"
      screenReaderSummary={summary}
      headerRight={<DashboardMoreButton />}
    >
      {pieData.length === 0 ? (
        <p className="text-sm text-gray-500">No employees in the directory.</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative mx-auto w-full max-w-[220px] shrink-0 lg:w-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="68%"
                  outerRadius="88%"
                  paddingAngle={2}
                  dataKey="count"
                  cornerRadius={4}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={DASHBOARD_DONUT_FILLS[i % DASHBOARD_DONUT_FILLS.length]} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: "1.65rem", fontWeight: 700, fill: "#111827" }}
                >
                  {totalEmployeesLabel}
                </text>
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: "0.65rem", fontWeight: 600, fill: "#9ca3af", letterSpacing: "0.15em" }}
                >
                  GLOBAL
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="min-w-0 flex-1 space-y-2.5" aria-label="Countries">
            {employeesByCountry.map((row, i) => (
              <li key={row.country} className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: DASHBOARD_DONUT_FILLS[i % DASHBOARD_DONUT_FILLS.length],
                  }}
                  aria-hidden
                />
                <span className="font-medium text-gray-900">{row.country}</span>
                <span className="ml-auto tabular-nums text-gray-500">{row.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardInsightCard>
  );
}
