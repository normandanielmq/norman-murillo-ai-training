import * as employeeRepository from "./employee.repository";
import * as projectRepository from "./project.repository";
import * as projectService from "./project.service";

jest.mock("./project.repository");
jest.mock("./employee.repository");

const mockProjectRepo = projectRepository as jest.Mocked<typeof projectRepository>;
const mockEmployeeRepo = employeeRepository as jest.Mocked<typeof employeeRepository>;

describe("project.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("returns success and project when input is valid", async () => {
      mockProjectRepo.createProject.mockResolvedValue({
        id: 1,
        name: "Alpha",
        description: "",
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      const result = await projectService.create({ name: "Alpha", description: "" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.project.name).toBe("Alpha");
        expect(result.project.description).toBe("");
      }
    });

    it("returns validation failure when name is empty", async () => {
      const result = await projectService.create({ name: "  ", description: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Validation failed.");
        expect(result.details).toContain("Project name is required.");
      }
    });
  });

  describe("update", () => {
    it("returns null when project does not exist", async () => {
      mockProjectRepo.updateProject.mockResolvedValue(null);

      expect(await projectService.update(99_999, { name: "X" })).toBeNull();
    });

    it("returns success with updated project when id exists", async () => {
      mockProjectRepo.updateProject.mockResolvedValue({
        id: 3,
        name: "New",
        description: "d",
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      const result = await projectService.update(3, { name: "New" });
      expect(result).not.toBeNull();
      if (result && result.success) {
        expect(result.project.name).toBe("New");
        expect(result.project.description).toBe("d");
      }
    });
  });

  describe("deleteById", () => {
    it("returns true when a project was removed", async () => {
      mockProjectRepo.deleteProjectById.mockResolvedValue(true);

      expect(await projectService.deleteById(1)).toBe(true);
    });

    it("returns false when id does not exist", async () => {
      mockProjectRepo.deleteProjectById.mockResolvedValue(false);

      expect(await projectService.deleteById(12_345)).toBe(false);
    });
  });

  describe("assignEmployeeToProject", () => {
    it("returns failure when duplicate assignment", async () => {
      mockEmployeeRepo.getById.mockResolvedValue({
        id: 1,
        name: "E",
        email: "e@x.com",
        nationalId: "1",
        phone: "+1 555-000-0000",
        country: "United States",
        gender: "Male",
        dateOfBirth: "1990-01-01",
        officialTitle: "T",
        hireDate: "2020-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.getProjectById.mockResolvedValue({
        id: 10,
        name: "SVC",
        description: "s",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.assignEmployeeToProject.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({
        error: "This employee is already assigned to this project.",
      });

      expect((await projectService.assignEmployeeToProject(10, 1)).success).toBe(true);
      const dup = await projectService.assignEmployeeToProject(10, 1);
      expect(dup.success).toBe(false);
      if (!dup.success) {
        expect(dup.details[0]).toContain("already assigned");
      }
    });

    it("returns failure for invalid employee id", async () => {
      mockProjectRepo.getProjectById.mockResolvedValue({
        id: 1,
        name: "P",
        description: "p",
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      const r = await projectService.assignEmployeeToProject(1, 0);
      expect(r.success).toBe(false);
      if (!r.success) expect(r.details[0]).toContain("Invalid employee ID");
    });

    it("returns failure when employee does not exist", async () => {
      mockEmployeeRepo.getById.mockResolvedValue(null);
      mockProjectRepo.getProjectById.mockResolvedValue({
        id: 1,
        name: "P",
        description: "p",
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      const r = await projectService.assignEmployeeToProject(1, 99_999);
      expect(r.success).toBe(false);
      if (!r.success) expect(r.details[0]).toContain("Employee not found");
    });

    it("returns failure when project does not exist", async () => {
      mockEmployeeRepo.getById.mockResolvedValue({
        id: 1,
        name: "E",
        email: "e@x.com",
        nationalId: "1",
        phone: "+1 555-000-0000",
        country: "United States",
        gender: "Male",
        dateOfBirth: "1990-01-01",
        officialTitle: "T",
        hireDate: "2020-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.getProjectById.mockResolvedValue(null);

      const r = await projectService.assignEmployeeToProject(99_999, 1);
      expect(r.success).toBe(false);
      if (!r.success) expect(r.details[0]).toContain("Project not found");
    });

    it("returns failure when startDate is not ISO YYYY-MM-DD", async () => {
      mockEmployeeRepo.getById.mockResolvedValue({
        id: 1,
        name: "E",
        email: "e@x.com",
        nationalId: "1",
        phone: "+1 555-000-0000",
        country: "United States",
        gender: "Male",
        dateOfBirth: "1990-01-01",
        officialTitle: "T",
        hireDate: "2020-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.getProjectById.mockResolvedValue({
        id: 1,
        name: "P",
        description: "p",
        createdAt: "2025-01-01T00:00:00.000Z",
      });

      const r = await projectService.assignEmployeeToProject(1, 1, { startDate: "01/02/2025" });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.details[0]).toContain("YYYY-MM-DD");
    });

    it("accepts valid optional startDate", async () => {
      mockEmployeeRepo.getById.mockResolvedValue({
        id: 1,
        name: "E",
        email: "e@x.com",
        nationalId: "1",
        phone: "+1 555-000-0000",
        country: "United States",
        gender: "Male",
        dateOfBirth: "1990-01-01",
        officialTitle: "T",
        hireDate: "2020-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.getProjectById.mockResolvedValue({
        id: 1,
        name: "P",
        description: "p",
        createdAt: "2025-01-01T00:00:00.000Z",
      });
      mockProjectRepo.assignEmployeeToProject.mockResolvedValue({ ok: true });

      const r = await projectService.assignEmployeeToProject(1, 1, { startDate: "2025-06-15" });
      expect(r.success).toBe(true);
    });
  });

  describe("list helpers", () => {
    it("listEmployeesForProject returns employees from repository", async () => {
      mockProjectRepo.listEmployeesForProject.mockResolvedValue([
        {
          id: 1,
          name: "A",
          email: "a@x.com",
          nationalId: "1",
          phone: "+1 555-000-0001",
          country: "United States",
          gender: "Male",
          dateOfBirth: "1990-01-01",
          officialTitle: "T",
          hireDate: "2020-01-01",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          name: "B",
          email: "b@x.com",
          nationalId: "2",
          phone: "+1 555-000-0002",
          country: "United States",
          gender: "Female",
          dateOfBirth: "1991-01-01",
          officialTitle: "T",
          hireDate: "2020-01-01",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ]);

      const employees = await projectService.listEmployeesForProject(9);
      expect(employees.map((e) => e.id).sort()).toEqual([1, 2]);
    });

    it("listProjectsForEmployee returns linked projects", async () => {
      mockProjectRepo.listProjectsForEmployee.mockResolvedValue([
        {
          id: 5,
          name: "A",
          description: "a",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ]);

      const projects = await projectService.listProjectsForEmployee(1);
      expect(projects.some((p) => p.id === 5)).toBe(true);
    });
  });
});
