import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmployeeForm } from "@/features/employees/EmployeeForm";
import { employeeJaneDoe } from "@/test/fixtures";

const mockEmployee = employeeJaneDoe;

describe("EmployeeForm", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          countries: [
            { name: "United States", callingCode: "+1" },
            { name: "Canada", callingCode: "+1" },
          ],
        }),
    });
  });

  it("renders with empty fields when no initialData", async () => {
    const onSubmit = jest.fn();
    render(
      <EmployeeForm
        submitLabel="Save Employee"
        onSubmit={onSubmit}
        onSuccess={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("");
    expect(screen.getByLabelText(/Email Address/)).toHaveValue("");
    expect(screen.getByRole("button", { name: "Save Employee" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/^Country/)).toHaveValue("");
  });

  it("renders with initial data when initialData provided", async () => {
    render(
      <EmployeeForm
        initialData={mockEmployee}
        submitLabel="Update Employee"
        onSubmit={jest.fn()}
        onSuccess={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Full Name/)).toHaveValue("Jane Doe");
    expect(screen.getByLabelText(/Email Address/)).toHaveValue("jane@example.com");
    expect(screen.getByRole("button", { name: "Update Employee" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText(/^Country/)).toHaveValue("United States");
    });
  });

  it("updates field value when user types", () => {
    render(
      <EmployeeForm
        submitLabel="Save"
        onSubmit={jest.fn()}
        onSuccess={jest.fn()}
      />
    );
    const nameInput = screen.getByLabelText(/Full Name/);
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(nameInput).toHaveValue("New Name");
  });

  it("calls onSubmit with form data on submit", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    const onSuccess = jest.fn();
    render(
      <EmployeeForm
        submitLabel="Save"
        onSubmit={onSubmit}
        onSuccess={onSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email Address/), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/National ID/), { target: { value: "ID-1" } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: "+1 555" } });
    fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: "United States" } });
    fireEvent.change(screen.getByLabelText(/Job Title/), {
      target: { value: "Software Engineer" },
    });
    fireEvent.change(screen.getByLabelText(/^Date of Birth/), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Hire Date/), {
      target: { value: "2024-01-01" },
    });
    fireEvent.click(screen.getByLabelText("Female"));

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const submittedDto = onSubmit.mock.calls[0][0];
    expect(submittedDto.name).toBe("Test User");
    expect(submittedDto.email).toBe("test@example.com");
    expect(submittedDto.country).toBe("United States");
    expect(submittedDto.gender).toBe("Female");
  });

  it("calls onSuccess when submit returns ok", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    const onSuccess = jest.fn();
    render(
      <EmployeeForm
        initialData={mockEmployee}
        submitLabel="Update"
        onSubmit={onSubmit}
        onSuccess={onSuccess}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/^Country/)).toHaveValue("United States");
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("displays validation errors when submit returns not ok", async () => {
    const onSubmit = jest.fn().mockResolvedValue({
      ok: false,
      error: "Validation failed",
      details: ["Email is invalid.", "Phone required."],
    });
    render(
      <EmployeeForm
        initialData={mockEmployee}
        submitLabel="Update"
        onSubmit={onSubmit}
        onSuccess={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByLabelText(/^Country/)).toHaveValue("United States");
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Email is invalid.")).toBeInTheDocument();
    expect(screen.getByText("Phone required.")).toBeInTheDocument();
  });

  it("shows Cancel link to /employees", () => {
    render(
      <EmployeeForm
        submitLabel="Save"
        onSubmit={jest.fn()}
        onSuccess={jest.fn()}
      />
    );
    const cancel = screen.getByRole("link", { name: /Cancel/ });
    expect(cancel).toHaveAttribute("href", "/employees");
  });
});
