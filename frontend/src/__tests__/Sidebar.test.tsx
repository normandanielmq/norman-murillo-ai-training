import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/features/layout/Sidebar";

describe("Sidebar", () => {
  it("renders HR Executive branding", () => {
    render(<Sidebar />);
    expect(screen.getByText("HR Executive")).toBeInTheDocument();
  });

  it("renders Dashboard, Employees, and Projects links", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Employees/ })).toHaveAttribute("href", "/employees");
    expect(screen.getByRole("link", { name: /Projects/ })).toHaveAttribute("href", "/projects");
  });
});
