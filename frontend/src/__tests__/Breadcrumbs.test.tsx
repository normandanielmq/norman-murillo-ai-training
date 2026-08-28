import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders breadcrumb navigation with accessible label", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Employees" },
        ]}
      />
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Employees")).toBeInTheDocument();
  });

  it("renders last item as current page without link", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: "Edit", href: "/projects/1" },
          { label: "Details" },
        ]}
      />
    );
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Details" })).not.toBeInTheDocument();
  });
});
