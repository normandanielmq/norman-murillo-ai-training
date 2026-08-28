import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/PageHeader";

describe("PageHeader", () => {
  it("renders title as h1 by default with large title class", () => {
    render(<PageHeader title="Project Management" />);
    const heading = screen.getByRole("heading", { level: 1, name: "Project Management" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("text-3xl", "font-bold", "tracking-tight");
  });

  it("renders title as h2 when titleAs is h2", () => {
    render(<PageHeader title="Employee Directory" titleAs="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "Employee Directory" })).toBeInTheDocument();
  });

  it("uses md size classes when size is md", () => {
    render(<PageHeader title="Section" size="md" />);
    expect(screen.getByRole("heading", { name: "Section" })).toHaveClass("text-2xl");
  });

  it("renders description when provided", () => {
    render(
      <PageHeader title="Directory" description="Manage and view all personnel records" />
    );
    expect(screen.getByText("Manage and view all personnel records")).toBeInTheDocument();
  });

  it("renders eyebrow when provided", () => {
    render(<PageHeader title="Projects" eyebrow="Coordinator view • Granular control" />);
    expect(screen.getByText("Coordinator view • Granular control")).toBeInTheDocument();
  });

  it("renders actions in the document", () => {
    render(
      <PageHeader
        title="Employees"
        actions={
          <button type="button">
            Add Employee
          </button>
        }
      />
    );
    expect(screen.getByRole("button", { name: "Add Employee" })).toBeInTheDocument();
  });
});
