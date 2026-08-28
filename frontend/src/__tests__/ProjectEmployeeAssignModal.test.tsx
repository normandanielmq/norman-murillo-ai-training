import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as useProjects from "@/hooks/useProjects";
import { ProjectEmployeeAssignModal } from "@/features/projects/ProjectEmployeeAssignModal";
import { employeeJaneDoe } from "@/test/fixtures";
import { projectExisting } from "@/test/fixtures";

jest.mock("@/hooks/useProjects", () => ({
  ...jest.requireActual<typeof import("@/hooks/useProjects")>("@/hooks/useProjects"),
  fetchAllEmployees: jest.fn(),
  fetchEmployeesForProject: jest.fn(),
  assignEmployeeToProjectApi: jest.fn(),
  unassignEmployeeFromProjectApi: jest.fn(),
}));

describe("ProjectEmployeeAssignModal", () => {
  const onClose = jest.fn();
  const onSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useProjects.fetchAllEmployees).mockResolvedValue([employeeJaneDoe]);
    jest.mocked(useProjects.fetchEmployeesForProject).mockResolvedValue([]);
    jest.mocked(useProjects.assignEmployeeToProjectApi).mockResolvedValue({ ok: true });
    jest.mocked(useProjects.unassignEmployeeFromProjectApi).mockResolvedValue({ ok: true });
  });

  it("loads and lists employees", async () => {
    render(<ProjectEmployeeAssignModal project={projectExisting} onClose={onClose} onSaved={onSaved} />);
    await waitFor(() => {
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /Assign employees — Existing project/ })).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<ProjectEmployeeAssignModal project={projectExisting} onClose={onClose} />);
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("saves and closes on success", async () => {
    render(<ProjectEmployeeAssignModal project={projectExisting} onClose={onClose} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shows load error when fetch fails", async () => {
    jest.mocked(useProjects.fetchAllEmployees).mockRejectedValue(new Error("network"));
    render(<ProjectEmployeeAssignModal project={projectExisting} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to load employees.");
    });
  });
});
