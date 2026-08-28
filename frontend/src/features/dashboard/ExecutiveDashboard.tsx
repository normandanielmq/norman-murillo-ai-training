"use client";

import type { DashboardInsightsDto } from "@/lib/dashboard-types";
import { PageHeader } from "@/components/PageHeader";
import { ErrorCallout } from "@/components/ErrorCallout";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";
import { EmployeesByCountryDonutCard } from "./EmployeesByCountryDonutCard";
import { EmployeesPerProjectBarsCard } from "./EmployeesPerProjectBarsCard";
import { GenderPerProjectStackedCard } from "./GenderPerProjectStackedCard";
import { ProjectAssignmentCoverageCard } from "./ProjectAssignmentCoverageCard";

type InsightsBodyProps = {
  loading: boolean;
  error: string | null;
  details: string[];
  data: DashboardInsightsDto | null;
  reload: () => void;
};

/** Local helper: early returns instead of loading/error/data ternaries in the parent. */
function ExecutiveDashboardInsightsBody({
  loading,
  error,
  details,
  data,
  reload,
}: InsightsBodyProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-600" role="status">
        Loading insights…
      </p>
    );
  }

  if (error) {
    const message = details.length > 0 ? `${error} ${details.join(" ")}` : error;
    return (
      <div role="alert">
        <ErrorCallout
          message={message}
          onRetry={() => void reload()}
          retryLabel="Try again"
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EmployeesByCountryDonutCard
          employeesByCountry={data.employeesByCountry}
          totalEmployeesLabel={data.totalEmployeesLabel}
          totalEmployees={data.totalEmployees}
        />
        <EmployeesPerProjectBarsCard employeesPerProject={data.employeesPerProject} />
      </div>
      <GenderPerProjectStackedCard genderByProject={data.genderByProject} />
      <ProjectAssignmentCoverageCard
        coverage={data.projectAssignmentCoverage}
        totalEmployees={data.totalEmployees}
      />
    </>
  );
}

export function ExecutiveDashboard() {
  const { data, loading, error, details, reload } = useDashboardInsights();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workforce Overview"
        description="Real-time insights across global operations and active teams."
        size="lg"
      />
      <ExecutiveDashboardInsightsBody
        loading={loading}
        error={error}
        details={details}
        data={data}
        reload={reload}
      />
    </div>
  );
}
