import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorCallout } from "@/components/ErrorCallout";

describe("ErrorCallout", () => {
  it("renders message in a region with role alert", () => {
    render(<ErrorCallout message="Failed to load." />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Failed to load.");
  });

  it("does not render retry when onRetry is omitted", () => {
    render(<ErrorCallout message="Error" />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });

  it("renders default retry label and calls onRetry when clicked", () => {
    const onRetry = jest.fn();
    render(<ErrorCallout message="Network error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("uses custom retry label when provided", () => {
    render(
      <ErrorCallout message="Oops" onRetry={() => {}} retryLabel="Reload" />
    );
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("applies rounded and padding variants to the container", () => {
    const { rerender } = render(
      <ErrorCallout message="x" rounded="lg" padding="default" />
    );
    let alert = screen.getByRole("alert");
    expect(alert).toHaveClass("rounded-lg", "p-4");

    rerender(<ErrorCallout message="x" rounded="xl" padding="compact" />);
    alert = screen.getByRole("alert");
    expect(alert).toHaveClass("rounded-xl", "p-3");
  });

  it("merges extra className onto the container", () => {
    render(<ErrorCallout message="x" className="mt-4" />);
    expect(screen.getByRole("alert")).toHaveClass("mt-4");
  });
});
