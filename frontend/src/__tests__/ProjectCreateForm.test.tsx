import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import * as useProjects from "@/hooks/useProjects";
import { ProjectCreateForm } from "@/features/projects/ProjectCreateForm";
import { employeeJaneDoe } from "@/test/fixtures";

jest.mock("@/hooks/useProjects", () => ({
  ...jest.requireActual<typeof import("@/hooks/useProjects")>("@/hooks/useProjects"),
  useCreateProject: jest.fn(),
  fetchAllEmployees: jest.fn(),
  assignEmployeeToProjectApi: jest.fn(),
}));

describe("ProjectCreateForm", () => {
  const mockPush = jest.fn();
  const createProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });
    createProject.mockResolvedValue({
      ok: true,
      project: {
        id: 42,
        name: "New Project",
        description: "",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    });
    jest.mocked(useProjects.useCreateProject).mockReturnValue({ createProject });
    jest
      .mocked(useProjects.fetchAllEmployees)
      .mockResolvedValue([employeeJaneDoe, { ...employeeJaneDoe, id: 2, name: "John Smith" }]);
    jest.mocked(useProjects.assignEmployeeToProjectApi).mockResolvedValue({ ok: true });
  });

  it("renders name and description fields", async () => {
    render(<ProjectCreateForm />);
    expect(screen.getByLabelText(/Project Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Description/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee to add/)).toBeInTheDocument();
    });
  });

  it("submits create and navigates on success", async () => {
    render(<ProjectCreateForm />);
    await waitFor(() => expect(screen.getByLabelText(/Employee to add/)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Project Name/), {
      target: { value: "Infrastructure" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Project/ }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        name: "Infrastructure",
        description: "",
      });
      expect(useProjects.assignEmployeeToProjectApi).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/projects");
    });
  });
});
