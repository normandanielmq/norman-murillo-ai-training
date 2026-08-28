import { render } from "@testing-library/react";
import { SparkleMark } from "@/features/layout/SparkleMark";

describe("SparkleMark", () => {
  it("renders decorative mark with aria-hidden", () => {
    const { container } = render(<SparkleMark />);
    const mark = container.firstChild as HTMLElement;
    expect(mark).toHaveAttribute("aria-hidden");
    expect(mark).toHaveTextContent("✦");
  });

  it("merges className", () => {
    const { container } = render(<SparkleMark className="scale-110" />);
    expect(container.firstChild).toHaveClass("scale-110");
  });
});
