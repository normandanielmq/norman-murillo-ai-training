import { render, screen } from "@testing-library/react";
import { FormCard } from "@/components/FormCard";

describe("FormCard", () => {
  it("renders children", () => {
    render(
      <FormCard>
        <p>Panel content</p>
      </FormCard>
    );
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("merges optional className", () => {
    const { container } = render(
      <FormCard className="max-w-md">
        <span>Inner</span>
      </FormCard>
    );
    expect(container.firstChild).toHaveClass("max-w-md");
  });
});
