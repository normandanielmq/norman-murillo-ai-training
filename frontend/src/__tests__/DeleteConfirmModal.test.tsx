import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConfirmModal } from "@/features/employees/DeleteConfirmModal";
import { deleteConfirmModalDefaultProps } from "@/test/fixtures";

describe("DeleteConfirmModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders employee name in the message", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} />);
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Delete Employee\?/ })).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Delete is clicked", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/ }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape is pressed", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("displays error when provided", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} error="Something went wrong." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
  });

  it("shows Deleting… on Delete button when loading", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} loading />);
    expect(screen.getByRole("button", { name: /Deleting…/ })).toBeInTheDocument();
  });

  it("disables both buttons when loading", () => {
    const props = deleteConfirmModalDefaultProps();
    render(<DeleteConfirmModal {...props} loading />);
    expect(screen.getByRole("button", { name: /Cancel/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Deleting…/ })).toBeDisabled();
  });
});
