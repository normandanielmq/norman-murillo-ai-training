import { generateBulkEmployeeProjectLinks, SEED_PROJECTS } from "./seed-projects";

describe("generateBulkEmployeeProjectLinks", () => {
  it("assigns ~70% of bulk ids to a valid project (deterministic)", () => {
    const bulkCount = 100;
    const base = 6;
    const links = generateBulkEmployeeProjectLinks(bulkCount, base);
    expect(links.length).toBe(70);
    const maxProject = SEED_PROJECTS.length;
    for (const { employeeId, projectId } of links) {
      expect(employeeId).toBeGreaterThan(base);
      expect(employeeId).toBeLessThanOrEqual(base + bulkCount);
      expect(projectId).toBeGreaterThanOrEqual(1);
      expect(projectId).toBeLessThanOrEqual(maxProject);
    }
  });

  it("returns no links when bulk count is zero", () => {
    expect(generateBulkEmployeeProjectLinks(0, 6)).toEqual([]);
  });
});
