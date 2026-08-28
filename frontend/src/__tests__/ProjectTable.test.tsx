import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectTable } from "@/features/projects/ProjectTable";
import { projectWithTeamAlpha } from "@/test/fixtures";

const mockProject = projectWithTeamAlpha;

describe("ProjectTable", () => {
  it("shows loading state", () => {
    render(<ProjectTable projects={[]} loading onDeleteClick={jest.fn()} />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty state when not loading", () => {
    render(<ProjectTable projects={[]} loading={false} onDeleteClick={jest.fn()} />);
    expect(screen.getByText("No projects yet.")).toBeInTheDocument();
  });

  it("renders project name and calls delete handler", () => {
    const onDeleteClick = jest.fn();
    render(
      <ProjectTable projects={[mockProject]} loading={false} onDeleteClick={onDeleteClick} />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("2 members")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Delete Alpha/ }));
    expect(onDeleteClick).toHaveBeenCalledWith(mockProject);
  });

  it("has edit link to project edit route", () => {
    render(<ProjectTable projects={[mockProject]} loading={false} onDeleteClick={jest.fn()} />);
    const edit = screen.getByRole("link", { name: /Edit Alpha/ });
    expect(edit).toHaveAttribute("href", "/projects/7/edit");
  });
});
