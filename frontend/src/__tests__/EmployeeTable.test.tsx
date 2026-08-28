import { render, screen, fireEvent } from "@testing-library/react";
import { EmployeeTable } from "@/features/employees/EmployeeTable";
import {
  employeeListItemJaneDoe,
  employeeListItemJaneDoeNoProjects,
  employeeListItemJohnSmith,
} from "@/test/fixtures";

const mockEmployee = employeeListItemJaneDoe;

describe("EmployeeTable", () => {
  it("shows loading state", () => {
    render(
      <EmployeeTable employees={[]} loading onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty state when not loading and no employees", () => {
    render(
      <EmployeeTable employees={[]} loading={false} onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText("No employees yet.")).toBeInTheDocument();
  });

  it("renders employee name and initials", () => {
    render(
      <EmployeeTable employees={[mockEmployee]} loading={false} onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders employee data in table cells", () => {
    render(
      <EmployeeTable employees={[mockEmployee]} loading={false} onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText("123-45-6789")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("Apollo, Banking App")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "jane@example.com" })).toHaveAttribute(
      "href",
      "mailto:jane@example.com"
    );
  });

  it("shows em dash when projectNames is empty", () => {
    render(
      <EmployeeTable
        employees={[employeeListItemJaneDoeNoProjects]}
        loading={false}
        onDeleteClick={jest.fn()}
      />
    );
    expect(screen.getByRole("cell", { name: "—" })).toBeInTheDocument();
  });

  it("calls onDeleteClick with employee when Delete is clicked", () => {
    const onDeleteClick = jest.fn();
    render(
      <EmployeeTable employees={[mockEmployee]} loading={false} onDeleteClick={onDeleteClick} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Delete Jane Doe/ }));
    expect(onDeleteClick).toHaveBeenCalledWith(mockEmployee);
  });

  it("has Edit link with correct href", () => {
    render(
      <EmployeeTable employees={[mockEmployee]} loading={false} onDeleteClick={jest.fn()} />
    );
    const editLink = screen.getByRole("link", { name: /Edit Jane Doe/ });
    expect(editLink).toHaveAttribute("href", "/employees/1/edit");
  });

  it("calls onSort when a sortable column header is clicked", () => {
    const onSort = jest.fn();
    render(
      <EmployeeTable
        employees={[mockEmployee]}
        loading={false}
        onDeleteClick={jest.fn()}
        sortBy="name"
        sortOrder="asc"
        onSort={onSort}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("renders multiple employees", () => {
    render(
      <EmployeeTable
        employees={[mockEmployee, employeeListItemJohnSmith]}
        loading={false}
        onDeleteClick={jest.fn()}
      />
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("John Smith")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
  });
});
