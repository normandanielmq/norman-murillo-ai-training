import { render, screen } from "@testing-library/react";
import { ModalError } from "@/components/ModalError";

describe("ModalError", () => {
  it("renders banner variant with alert role by default", () => {
    render(<ModalError>Something failed.</ModalError>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Something failed.");
    expect(alert).toHaveClass("border-red-200");
  });

  it("renders text variant without banner styling", () => {
    render(
      <ModalError variant="text" className="extra">
        Plain error
      </ModalError>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Plain error");
    expect(alert).toHaveClass("extra");
    expect(alert).not.toHaveClass("border-red-200");
  });
});
