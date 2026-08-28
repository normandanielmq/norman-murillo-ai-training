import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectDeleteConfirmModal } from "@/features/projects/ProjectDeleteConfirmModal";

describe("ProjectDeleteConfirmModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows project name and actions", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <ProjectDeleteConfirmModal
        projectName="Alpha"
        onConfirm={onConfirm}
        onCancel={onCancel}
        loading={false}
      />
    );
    expect(screen.getByRole("heading", { name: /Delete Project\?/ })).toBeInTheDocument();
    expect(screen.getByText(/Alpha/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: /^Delete$/ }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows error in text variant when provided", () => {
    render(
      <ProjectDeleteConfirmModal
        projectName="Beta"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        loading={false}
        error="Could not delete."
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not delete.");
  });

  it("calls onCancel when Escape is pressed", () => {
    const onCancel = jest.fn();
    render(
      <ProjectDeleteConfirmModal
        projectName="Gamma"
        onConfirm={jest.fn()}
        onCancel={onCancel}
        loading={false}
      />
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows deleting state on primary button when loading", () => {
    render(
      <ProjectDeleteConfirmModal
        projectName="Delta"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        loading
      />
    );
    expect(screen.getByRole("button", { name: /Deleting…/ })).toBeInTheDocument();
  });
});
