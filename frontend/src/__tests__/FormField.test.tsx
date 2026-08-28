import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/FormField";

describe("FormField", () => {
  it("renders label with correct htmlFor", () => {
    render(
      <FormField label="Full Name" id="name">
        <input id="name" type="text" />
      </FormField>
    );
    const label = screen.getByText("Full Name");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "name");
  });

  it("renders children", () => {
    render(
      <FormField label="Email" id="email">
        <input id="email" type="email" data-testid="email-input" />
      </FormField>
    );
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });
});
