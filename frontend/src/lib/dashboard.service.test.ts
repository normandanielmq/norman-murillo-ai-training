import {
  formatCompactEmployeeTotal,
  genderChartBucket,
  getInsights,
} from "./dashboard.service";
import * as dashboardRepository from "./dashboard.repository";

jest.mock("./dashboard.repository");

const mockDashboardRepo = dashboardRepository as jest.Mocked<typeof dashboardRepository>;

describe("dashboard.service helpers", () => {
  it("genderChartBucket maps Male/Female and buckets unknown", () => {
    expect(genderChartBucket("Male")).toBe("male");
    expect(genderChartBucket("female")).toBe("female");
    expect(genderChartBucket("Non-binary")).toBe("other");
  });

  it("formatCompactEmployeeTotal formats thousands", () => {
    expect(formatCompactEmployeeTotal(0)).toBe("0");
    expect(formatCompactEmployeeTotal(999)).toBe("999");
    expect(formatCompactEmployeeTotal(1200)).toBe("1.2k");
    expect(formatCompactEmployeeTotal(10000)).toBe("10k");
  });
});

describe("getInsights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDashboardRepo.countAllEmployees.mockResolvedValue(6);
    mockDashboardRepo.aggregateEmployeesByCountry.mockResolvedValue([{ country: "United States", count: 6 }]);
    mockDashboardRepo.aggregateHeadcountByProject.mockResolvedValue([
      { projectId: 2, projectName: "B", count: 5 },
      { projectId: 1, projectName: "A", count: 10 },
    ]);
    mockDashboardRepo.aggregateGenderCountsByProjectRaw.mockResolvedValue([
      { projectId: 1, projectName: "A", gender: "Male", count: 6 },
      { projectId: 1, projectName: "A", gender: "Female", count: 4 },
    ]);
    mockDashboardRepo.countEmployeesOnAtLeastOneProject.mockResolvedValue(4);
  });

  it("returns sorted employees per project by headcount descending", async () => {
    const result = await getInsights();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const { employeesPerProject } = result.data;
    for (let i = 1; i < employeesPerProject.length; i++) {
      expect(employeesPerProject[i - 1]!.count).toBeGreaterThanOrEqual(employeesPerProject[i]!.count);
    }
  });

  it("returns percent rounds for country rows", async () => {
    const result = await getInsights();
    expect(result.success).toBe(true);
    if (!result.success) return;
    const sumPct = result.data.employeesByCountry.reduce((s, r) => s + r.percent, 0);
    expect(sumPct).toBeGreaterThanOrEqual(99);
    expect(sumPct).toBeLessThanOrEqual(101);
  });

  it("fails when country sum mismatches total", async () => {
    mockDashboardRepo.aggregateEmployeesByCountry.mockResolvedValue([{ country: "X", count: 1 }]);
    mockDashboardRepo.countAllEmployees.mockResolvedValue(99);

    const result = await getInsights();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("inconsistency");
    }
  });
});
