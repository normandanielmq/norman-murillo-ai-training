import { render, screen } from "@testing-library/react";
import { PortalFooter } from "@/features/layout/PortalFooter";

describe("PortalFooter", () => {
  it("renders footer branding", () => {
    render(<PortalFooter />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("HR System v2.4");
    expect(screen.getByText(/Secure Management Portal/)).toBeInTheDocument();
  });
});
