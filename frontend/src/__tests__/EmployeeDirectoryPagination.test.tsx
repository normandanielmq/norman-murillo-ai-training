import { render, screen, fireEvent } from "@testing-library/react";
import { EmployeeDirectoryPagination } from "@/features/employees/EmployeeDirectoryPagination";

describe("EmployeeDirectoryPagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows no results when total is zero", () => {
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();
    render(
      <EmployeeDirectoryPagination
        page={1}
        pageSize={10}
        total={0}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("shows range and page summary", () => {
    render(
      <EmployeeDirectoryPagination
        page={1}
        pageSize={10}
        total={25}
        onPageChange={jest.fn()}
        onPageSizeChange={jest.fn()}
      />
    );
    expect(screen.getByText(/Showing/)).toHaveTextContent("1");
    expect(screen.getByText(/Showing/)).toHaveTextContent("10");
    expect(screen.getByText(/Showing/)).toHaveTextContent("25");
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it("calls onPageChange for previous and next", () => {
    const onPageChange = jest.fn();
    render(
      <EmployeeDirectoryPagination
        page={2}
        pageSize={10}
        total={25}
        onPageChange={onPageChange}
        onPageSizeChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous on first page", () => {
    render(
      <EmployeeDirectoryPagination
        page={1}
        pageSize={10}
        total={25}
        onPageChange={jest.fn()}
        onPageSizeChange={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("calls onPageSizeChange when rows select changes", () => {
    const onPageSizeChange = jest.fn();
    render(
      <EmployeeDirectoryPagination
        page={1}
        pageSize={10}
        total={100}
        onPageChange={jest.fn()}
        onPageSizeChange={onPageSizeChange}
      />
    );
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "20" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
