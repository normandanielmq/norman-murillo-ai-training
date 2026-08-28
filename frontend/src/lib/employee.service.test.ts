import * as employeeService from "./employee.service";
import * as employeeRepository from "./employee.repository";
import type { Employee } from "./employee-types";
import {
  createEmployeeDtoJaneDoe,
  employeeJaneDoe,
  emptyListEmployeesResult,
  listEmployeesResultOneJane,
} from "@/test/fixtures";

jest.mock("./employee.repository");

const mockRepository = employeeRepository as jest.Mocked<typeof employeeRepository>;

const validDto = createEmployeeDtoJaneDoe;

describe("employee.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("returns all employees from the repository", async () => {
      const employees: Employee[] = [employeeJaneDoe];
      mockRepository.list.mockResolvedValue(employees);

      const result = await employeeService.list();

      expect(mockRepository.list).toHaveBeenCalledTimes(1);
      expect(result).toEqual(employees);
    });

    it("returns an empty array when the repository has no employees", async () => {
      mockRepository.list.mockResolvedValue([]);

      const result = await employeeService.list();

      expect(mockRepository.list).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe("listEmployeesFromQuery", () => {
    beforeEach(() => {
      mockRepository.listPaged.mockResolvedValue(emptyListEmployeesResult);
    });

    it("returns validation failure when page is invalid", async () => {
      const result = await employeeService.listEmployeesFromQuery(
        new URLSearchParams("page=0")
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Invalid query parameters.");
        expect(result.details.some((d) => d.includes("page"))).toBe(true);
      }
      expect(mockRepository.listPaged).not.toHaveBeenCalled();
    });

    it("returns validation failure when sortBy is not allowed", async () => {
      const result = await employeeService.listEmployeesFromQuery(
        new URLSearchParams("sortBy=password")
      );
      expect(result.success).toBe(false);
      expect(mockRepository.listPaged).not.toHaveBeenCalled();
    });

    it("uses default sort by name ascending when sort params are omitted", async () => {
      mockRepository.listPaged.mockResolvedValue(emptyListEmployeesResult);

      const result = await employeeService.listEmployeesFromQuery(new URLSearchParams());

      expect(result.success).toBe(true);
      expect(mockRepository.listPaged).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: "name",
          sortOrder: "asc",
        })
      );
    });

    it("calls listPaged with parsed filters and sort", async () => {
      mockRepository.listPaged.mockResolvedValue(listEmployeesResultOneJane());

      const result = await employeeService.listEmployeesFromQuery(
        new URLSearchParams(
          "country=United%20Kingdom&gender=Female&projectId=2&sortBy=name&sortOrder=desc&page=2&pageSize=10"
        )
      );

      expect(result.success).toBe(true);
      expect(mockRepository.listPaged).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        country: "United Kingdom",
        gender: "Female",
        projectId: 2,
        sortBy: "name",
        sortOrder: "desc",
      });
      if (result.success) {
        expect(result.result.employees).toHaveLength(1);
      }
    });
  });

  describe("create", () => {
    it("returns success and employee when repository creates successfully", async () => {
      mockRepository.create.mockResolvedValue({ employee: employeeJaneDoe });

      const result = await employeeService.create(validDto);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(validDto);
      expect(result).toEqual({ success: true, employee: employeeJaneDoe });
    });

    it("passes the full dto as payload to the repository", async () => {
      mockRepository.create.mockResolvedValue({ employee: employeeJaneDoe });

      await employeeService.create(validDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: validDto.name,
        email: validDto.email,
        nationalId: validDto.nationalId,
        phone: validDto.phone,
        country: validDto.country,
        gender: validDto.gender,
        dateOfBirth: validDto.dateOfBirth,
        officialTitle: validDto.officialTitle,
        hireDate: validDto.hireDate,
      });
    });

    it("returns failure with error and details when repository returns duplicate national ID error", async () => {
      const repoError = "Duplicate National ID in the same country.";
      mockRepository.create.mockResolvedValue({ error: repoError });

      const result = await employeeService.create(validDto);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: false,
        error: repoError,
        details: [repoError],
      });
    });

    it("returns failure when repository returns any error", async () => {
      mockRepository.create.mockResolvedValue({ error: "Some other error." });

      const result = await employeeService.create(validDto);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Some other error.");
        expect(result.details).toEqual(["Some other error."]);
      }
    });

    it("returns validation failure when input is invalid", async () => {
      const result = await employeeService.create({
        name: "",
        email: "invalid",
        nationalId: "",
        phone: "no-country-code",
        country: "",
        gender: "",
        dateOfBirth: "",
        officialTitle: "",
        hireDate: "",
      });

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Validation failed.");
        expect(result.details.length).toBeGreaterThan(0);
      }
    });
  });
});
