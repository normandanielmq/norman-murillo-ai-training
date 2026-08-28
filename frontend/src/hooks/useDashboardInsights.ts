"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardInsightsDto } from "@/lib/dashboard-types";
import { fetchJsonResult } from "@/lib/client-fetch-json";

export type UseDashboardInsightsState = {
  data: DashboardInsightsDto | null;
  loading: boolean;
  error: string | null;
  details: string[];
  reload: () => void;
};

function isInsightsPayload(data: unknown): data is DashboardInsightsDto {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const cov = d.projectAssignmentCoverage;
  if (!cov || typeof cov !== "object") return false;
  const c = cov as Record<string, unknown>;
  return (
    typeof d.totalEmployees === "number" &&
    typeof d.totalEmployeesLabel === "string" &&
    Array.isArray(d.employeesByCountry) &&
    Array.isArray(d.employeesPerProject) &&
    Array.isArray(d.genderByProject) &&
    typeof c.onAtLeastOneProject === "number" &&
    typeof c.onNoProject === "number" &&
    typeof c.percentOnProject === "number"
  );
}

/**
 * Loads `GET /api/dashboard/insights` for executive dashboard charts.
 */
export function useDashboardInsights(): UseDashboardInsightsState {
  const [data, setData] = useState<DashboardInsightsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDetails([]);
    const result = await fetchJsonResult("/api/dashboard/insights");
    if (!result.ok) {
      setData(null);
      setError(
        result.status === 0
          ? "Could not load dashboard insights."
          : result.error || "Could not load dashboard insights."
      );
      setDetails(result.details);
      setLoading(false);
      return;
    }
    if (!isInsightsPayload(result.data)) {
      setData(null);
      setError("Invalid dashboard response.");
      setDetails([]);
      setLoading(false);
      return;
    }
    setData(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, details, reload: load };
}
