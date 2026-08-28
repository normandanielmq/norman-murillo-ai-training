/**
 * Dummy projects and employee–project links for the dev database.
 * `employeeId` / `projectId` are 1-based and match insert order of
 * `SEED_EMPLOYEES` and `SEED_PROJECTS` respectively.
 */

export interface SeedProject {
  name: string;
  description: string;
}

export const SEED_PROJECTS: SeedProject[] = [
  {
    name: "HR Portal 2.0",
    description:
      "Self-service HR redesign: time off, org chart, and policy docs. Phased rollout starting Q2.",
  },
  {
    name: "Engineering onboarding platform",
    description:
      "Central hub for new hires—checklists, repo access templates, and mentor pairing.",
  },
  {
    name: "Compliance & audit tooling",
    description:
      "Internal tools to track attestations, export audit trails, and schedule reviews.",
  },
  // Extra fixtures for UI pagination (5 rows per page → 3 pages)
  {
    name: "Project Alpha",
    description: "Pilot initiative for cross-functional workflow automation.",
  },
  {
    name: "Beta Launch",
    description: "Staged rollout of the customer-facing analytics dashboard.",
  },
  {
    name: "Data lake migration",
    description: "Move historical HR extracts to the new warehouse schema.",
  },
  {
    name: "Mobile field app",
    description: "Offline-capable inspections and time capture for remote teams.",
  },
  {
    name: "Security hardening 2025",
    description: "SSO upgrades, secrets rotation, and dependency baselines.",
  },
  {
    name: "Payroll integration EU",
    description: "Connect regional payroll providers for multi-country payouts.",
  },
  {
    name: "Learning hub refresh",
    description: "Replace legacy LMS shell with searchable curricula and badges.",
  },
  {
    name: "Vendor risk registry",
    description: "Single source of truth for third-party assessments and renewals.",
  },
  {
    name: "Accessibility audit backlog",
    description: "WCAG remediation tickets grouped by product surface.",
  },
  {
    name: "Internal API gateway",
    description: "Rate limits, keys, and observability for service-to-service calls.",
  },
  {
    name: "Green office initiative",
    description: "Track emissions, travel policy, and office energy retrofits.",
  },
  {
    name: "Incident response playbooks",
    description: "Runbooks and comms templates for Sev1 and Sev2 events.",
  },
];

export interface SeedEmployeeProjectLink {
  employeeId: number;
  projectId: number;
}

/** Employees linked to one or more seed projects (meaningful cross-team coverage). */
export const SEED_EMPLOYEE_PROJECT_LINKS: SeedEmployeeProjectLink[] = [
  { employeeId: 1, projectId: 1 },
  { employeeId: 2, projectId: 1 },
  { employeeId: 3, projectId: 1 },
  { employeeId: 3, projectId: 2 },
  { employeeId: 5, projectId: 2 },
  { employeeId: 6, projectId: 2 },
  { employeeId: 1, projectId: 3 },
  { employeeId: 4, projectId: 3 },
  // Pagination fixtures: varied team sizes (incl. 6 members on project 6 → avatar +3)
  { employeeId: 1, projectId: 4 },
  { employeeId: 2, projectId: 4 },
  { employeeId: 1, projectId: 6 },
  { employeeId: 2, projectId: 6 },
  { employeeId: 3, projectId: 6 },
  { employeeId: 4, projectId: 6 },
  { employeeId: 5, projectId: 6 },
  { employeeId: 6, projectId: 6 },
  { employeeId: 1, projectId: 7 },
  { employeeId: 2, projectId: 7 },
  { employeeId: 3, projectId: 7 },
  { employeeId: 4, projectId: 8 },
  { employeeId: 5, projectId: 9 },
  { employeeId: 6, projectId: 10 },
  { employeeId: 2, projectId: 11 },
  { employeeId: 3, projectId: 11 },
  { employeeId: 1, projectId: 12 },
  { employeeId: 5, projectId: 12 },
];

/**
 * When `SEED_BULK_COUNT` adds rows after `SEED_EMPLOYEES`, those employees use ids
 * `baseEmployeeCount + 1` … `baseEmployeeCount + bulkCount`. This yields deterministic
 * project links so dashboard “assignment coverage” scales with directory size.
 * ~70% get one project (spread across `SEED_PROJECTS`); ~30% stay unassigned for demo gaps.
 */
export function generateBulkEmployeeProjectLinks(
  bulkCount: number,
  baseEmployeeCount: number,
): SeedEmployeeProjectLink[] {
  const links: SeedEmployeeProjectLink[] = [];
  const numProjects = SEED_PROJECTS.length;
  for (let i = 1; i <= bulkCount; i++) {
    const employeeId = baseEmployeeCount + i;
    if (employeeId % 10 >= 7) continue;
    const projectId = ((employeeId - 1) % numProjects) + 1;
    links.push({ employeeId, projectId });
  }
  return links;
}
