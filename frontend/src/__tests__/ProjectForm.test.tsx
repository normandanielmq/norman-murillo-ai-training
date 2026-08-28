import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { projectExisting } from "@/test/fixtures";

const mockProject = projectExisting;

describe("ProjectForm", () => {
  it("renders empty name and description when no initialData", () => {
    render(
      <ProjectForm submitLabel="Create" onSubmit={jest.fn()} onSuccess={jest.fn()} />
    );
    expect(screen.getByLabelText(/Project Name/)).toHaveValue("");
    expect(screen.getByLabelText(/Project Description/)).toHaveValue("");
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders initial data when editing", () => {
    render(
      <ProjectForm
        initialData={mockProject}
        submitLabel="Save changes"
        onSubmit={jest.fn()}
        onSuccess={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/Project Name/)).toHaveValue("Existing project");
    expect(screen.getByLabelText(/Project Description/)).toHaveValue("Some description");
  });

  it("calls onSubmit with form values and onSuccess when ok", async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true });
    const onSuccess = jest.fn();
    render(
      <ProjectForm submitLabel="Save" onSubmit={onSubmit} onSuccess={onSuccess} />
    );
    fireEvent.change(screen.getByLabelText(/Project Name/), {
      target: { value: "New initiative" },
    });
    fireEvent.change(screen.getByLabelText(/Project Description/), {
      target: { value: "Details here" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "New initiative",
        description: "Details here",
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("shows API errors when submit returns not ok", async () => {
    const onSubmit = jest.fn().mockResolvedValue({
      ok: false,
      error: "Validation failed.",
      details: ["Project name is required."],
    });
    render(
      <ProjectForm submitLabel="Save" onSubmit={onSubmit} onSuccess={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("Project name is required.")).toBeInTheDocument();
  });

  it("Cancel links to /projects", () => {
    render(
      <ProjectForm submitLabel="Save" onSubmit={jest.fn()} onSuccess={jest.fn()} />
    );
    expect(screen.getByRole("link", { name: /Cancel/ })).toHaveAttribute("href", "/projects");
  });
});
