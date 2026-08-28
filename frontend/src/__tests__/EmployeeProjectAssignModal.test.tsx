import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as useProjects from "@/hooks/useProjects";
import { EmployeeProjectAssignModal } from "@/features/employees/EmployeeProjectAssignModal";
import { employeeJaneDoe } from "@/test/fixtures";
import { projectExisting } from "@/test/fixtures";

jest.mock("@/hooks/useProjects", () => ({
  ...jest.requireActual<typeof import("@/hooks/useProjects")>("@/hooks/useProjects"),
  fetchAllProjects: jest.fn(),
  fetchProjectsForEmployee: jest.fn(),
  assignEmployeeToProjectApi: jest.fn(),
  unassignEmployeeFromProjectApi: jest.fn(),
}));

describe("EmployeeProjectAssignModal", () => {
  const onClose = jest.fn();
  const onSaved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useProjects.fetchAllProjects).mockResolvedValue([projectExisting]);
    jest.mocked(useProjects.fetchProjectsForEmployee).mockResolvedValue([]);
    jest.mocked(useProjects.assignEmployeeToProjectApi).mockResolvedValue({ ok: true });
    jest.mocked(useProjects.unassignEmployeeFromProjectApi).mockResolvedValue({ ok: true });
  });

  it("loads and lists projects", async () => {
    render(<EmployeeProjectAssignModal employee={employeeJaneDoe} onClose={onClose} onSaved={onSaved} />);
    await waitFor(() => {
      expect(screen.getByText("Existing project")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /Assign projects — Jane Doe/ })).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<EmployeeProjectAssignModal employee={employeeJaneDoe} onClose={onClose} />);
    await waitFor(() => expect(screen.getByText("Existing project")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no projects exist", async () => {
    jest.mocked(useProjects.fetchAllProjects).mockResolvedValue([]);
    render(<EmployeeProjectAssignModal employee={employeeJaneDoe} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByText(/No projects yet/)).toBeInTheDocument();
    });
  });

  it("shows load error when fetch fails", async () => {
    jest.mocked(useProjects.fetchAllProjects).mockRejectedValue(new Error("network"));
    render(<EmployeeProjectAssignModal employee={employeeJaneDoe} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to load projects.");
    });
  });
});
