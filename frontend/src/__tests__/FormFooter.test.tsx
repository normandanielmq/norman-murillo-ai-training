import { render, screen } from "@testing-library/react";
import { FormFooter } from "@/components/FormFooter";

describe("FormFooter", () => {
  it("renders children", () => {
    render(
      <FormFooter>
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
      </FormFooter>
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
