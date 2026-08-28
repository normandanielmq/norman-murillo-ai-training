/** Row: assignment count per country (all employees in directory). */
export type DashboardCountryCountRow = {
  country: string;
  count: number;
};

/** Row: assignment count per project; includes projects with zero assignees. */
export type DashboardProjectHeadcountRow = {
  projectId: number;
  projectName: string;
  count: number;
};

/** Raw DB gender string + count for one project slice (before Male/Female/Other bucketing). */
export type DashboardProjectGenderRawRow = {
  projectId: number;
  projectName: string;
  gender: string;
  count: number;
};

/** Employees with ≥1 project vs none — staffing completeness. */
export type DashboardProjectAssignmentCoverage = {
  onAtLeastOneProject: number;
  onNoProject: number;
  /** Percent of workforce on at least one project (one decimal). */
  percentOnProject: number;
};

/** API payload for executive dashboard charts. */
export type DashboardInsightsDto = {
  /** Sum of employees; matches directory total employee rows. */
  totalEmployees: number;
  /** Compact label for donut center, e.g. "1.2k". */
  totalEmployeesLabel: string;
  employeesByCountry: Array<{ country: string; count: number; percent: number }>;
  /** Descending by count (largest team first). */
  employeesPerProject: DashboardProjectHeadcountRow[];
  genderByProject: Array<{
    projectId: number;
    projectName: string;
    male: number;
    female: number;
    other: number;
  }>;
  projectAssignmentCoverage: DashboardProjectAssignmentCoverage;
};
