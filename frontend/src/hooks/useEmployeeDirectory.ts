"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { EmployeeListItem, EmployeeListSortColumn } from "@/lib/employee-types";
import type { Project } from "@/lib/project-types";
import { fetchAllProjects } from "@/hooks/useProjects";
import { parseJsonSafe } from "@/lib/parse-json-response";

const LIST_MAX = 1000;

function buildEmployeesQuery(params: {
  page: number;
  pageSize: number;
  country: string;
  gender: string;
  projectId: string;
  sortBy: EmployeeListSortColumn;
  sortOrder: "asc" | "desc";
}): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  sp.set("sortBy", params.sortBy);
  sp.set("sortOrder", params.sortOrder);
  if (params.country.trim()) sp.set("country", params.country.trim());
  if (params.gender.trim()) sp.set("gender", params.gender.trim());
  if (params.projectId.trim()) sp.set("projectId", params.projectId.trim());
  return sp.toString();
}

type DirectorySortState = {
  sortBy: EmployeeListSortColumn;
  sortOrder: "asc" | "desc";
};

/** Default matches `DEFAULT_SORT_BY` in `employee.service`; single object so toggling same column updates order atomically. */
const INITIAL_SORT: DirectorySortState = { sortBy: "name", sortOrder: "asc" };

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(20);
  const [sort, setSort] = useState<DirectorySortState>(INITIAL_SORT);
  const { sortBy, sortOrder } = sort;
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [projectId, setProjectId] = useState("");

  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const filtersActive = useMemo(
    () => Boolean(country.trim() || gender.trim() || projectId.trim()),
    [country, gender, projectId]
  );

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = buildEmployeesQuery({
        page,
        pageSize,
        country,
        gender,
        projectId,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/employees?${q}`);
      const data = await parseJsonSafe(res);
      if (res.ok) {
        const body = data as {
          employees?: EmployeeListItem[];
          total?: number;
          page?: number;
          pageSize?: number;
        };
        if (body.employees && Array.isArray(body.employees)) {
          setEmployees(body.employees);
          setTotal(body.total ?? body.employees.length);
        } else {
          setEmployees([]);
          setTotal(0);
        }
      } else {
        setError((data as { error?: string })?.error ?? "Failed to load employees.");
      }
    } catch {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, country, gender, projectId, sortBy, sortOrder]);

  /** If current page is past the last page (e.g. after filter), jump to last valid page. */
  useEffect(() => {
    if (total === 0) return;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [total, pageSize, page]);

  useEffect(() => {
    setPage(1);
  }, [country, gender, projectId]);

  const loadFilterOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [res, projectList] = await Promise.all([
        fetch(`/api/employees?page=1&pageSize=${LIST_MAX}`),
        fetchAllProjects(),
      ]);
      const data = await parseJsonSafe(res);
      setProjects(projectList);
      if (res.ok) {
        const body = data as { employees?: EmployeeListItem[] };
        const list = body.employees ?? [];
        const countries = [...new Set(list.map((e) => e.country))].sort((a, b) =>
          a.localeCompare(b)
        );
        const genders = [...new Set(list.map((e) => e.gender))].sort((a, b) =>
          a.localeCompare(b)
        );
        setCountryOptions(countries);
        setGenderOptions(genders);
      } else {
        setCountryOptions([]);
        setGenderOptions([]);
      }
    } catch {
      setCountryOptions([]);
      setGenderOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPage(1);
  }, []);

  const toggleSort = useCallback((column: EmployeeListSortColumn) => {
    setSort((prev) => {
      if (prev.sortBy === column) {
        return {
          sortBy: column,
          sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
        };
      }
      return { sortBy: column, sortOrder: "asc" };
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setCountry("");
    setGender("");
    setProjectId("");
    setPage(1);
  }, []);

  return {
    employees,
    total,
    page,
    pageSize,
    sortBy,
    sortOrder,
    loading,
    optionsLoading,
    error,
    loadEmployees,
    setPage,
    setPageSize,
    toggleSort,
    country,
    setCountry,
    gender,
    setGender,
    projectId,
    setProjectId,
    countryOptions,
    genderOptions,
    projects,
    filtersActive,
    clearFilters,
  };
}
