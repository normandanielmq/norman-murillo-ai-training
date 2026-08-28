import { render, screen } from "@testing-library/react";
import { FormErrorList } from "@/components/FormErrorList";

describe("FormErrorList", () => {
  it("renders nothing when messages is empty", () => {
    const { container } = render(<FormErrorList messages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("lists validation messages in an alert", () => {
    render(<FormErrorList messages={["Name is required.", "Email is invalid."]} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Please fix the following:");
    expect(alert).toHaveTextContent("Name is required.");
    expect(alert).toHaveTextContent("Email is invalid.");
  });
});
