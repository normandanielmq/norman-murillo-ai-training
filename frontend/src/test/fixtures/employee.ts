import type { CreateEmployeeDto, Employee, EmployeeListItem } from "@/lib/employee-types";

/** Canonical `Employee` row for unit/component tests (Jane Doe). */
export const employeeJaneDoe: Employee = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  nationalId: "123-45-6789",
  phone: "+1 555-000-0000",
  country: "United States",
  gender: "Female",
  dateOfBirth: "1990-01-15",
  officialTitle: "Software Engineer",
  hireDate: "2024-01-01",
  createdAt: "2024-01-01T00:00:00.000Z",
};

/** Valid create payload aligned with `employeeJaneDoe`. */
export const createEmployeeDtoJaneDoe: CreateEmployeeDto = {
  name: employeeJaneDoe.name,
  email: employeeJaneDoe.email,
  nationalId: employeeJaneDoe.nationalId,
  phone: employeeJaneDoe.phone,
  country: employeeJaneDoe.country,
  gender: employeeJaneDoe.gender,
  dateOfBirth: employeeJaneDoe.dateOfBirth,
  officialTitle: employeeJaneDoe.officialTitle,
  hireDate: employeeJaneDoe.hireDate,
};

/** Directory row with sample `projectNames`. */
export const employeeListItemJaneDoe: EmployeeListItem = {
  ...employeeJaneDoe,
  projectNames: "Apollo, Banking App",
};

export const employeeListItemJaneDoeNoProjects: EmployeeListItem = {
  ...employeeJaneDoe,
  projectNames: "",
};

/** Second row for multi-row table tests. */
export const employeeListItemJohnSmith: EmployeeListItem = {
  ...employeeJaneDoe,
  id: 2,
  name: "John Smith",
  projectNames: "",
};

/**
 * Distinct user for repository integration tests (avoids collisions with seed
 * national IDs / countries).
 */
export const createEmployeeDtoTestUser: CreateEmployeeDto = {
  name: "Test User",
  email: "test@example.com",
  nationalId: "999-99-9999",
  phone: "+1 555-111-2222",
  country: "United States",
  gender: "Male",
  dateOfBirth: "1995-05-05",
  officialTitle: "Tester",
  hireDate: "2024-06-01",
};
