import { fireEvent, render, screen } from "@testing-library/react";
import { SelectField } from "@/components/SelectField";

const basicOptions = [
  { value: "", label: "Choose…" },
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("SelectField", () => {
  it("renders label associated with the select", () => {
    render(
      <SelectField
        label="Country"
        id="country-select"
        value=""
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const select = screen.getByLabelText("Country");
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute("id", "country-select");
  });

  it("renders all options", () => {
    render(
      <SelectField label="Pick" id="pick" value="" onChange={() => {}} options={basicOptions} />
    );
    expect(screen.getByRole("option", { name: "Choose…" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
  });

  it("calls onChange with the selected value", () => {
    const onChange = jest.fn();
    render(
      <SelectField label="Pick" id="pick" value="" onChange={onChange} options={basicOptions} />
    );
    fireEvent.change(screen.getByLabelText("Pick"), { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("marks required in the label and sets aria-required on the select", () => {
    render(
      <SelectField
        label="Role"
        id="role"
        required
        value=""
        onChange={() => {}}
        options={basicOptions}
      />
    );
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/)).toHaveAttribute("aria-required", "true");
  });

  it("disables the select when disabled is true", () => {
    render(
      <SelectField
        label="Pick"
        id="pick"
        value=""
        disabled
        onChange={() => {}}
        options={basicOptions}
      />
    );
    expect(screen.getByLabelText("Pick")).toBeDisabled();
  });

  it("uses sr-only label when hideLabel is true", () => {
    const { container } = render(
      <SelectField
        label="Hidden label"
        id="hidden-select"
        hideLabel
        value=""
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const label = container.querySelector("label[for='hidden-select']");
    expect(label).toHaveClass("sr-only");
  });

  it("applies wrapper className to the FormField container", () => {
    const { container } = render(
      <SelectField
        label="X"
        id="x"
        className="max-w-xs"
        value=""
        onChange={() => {}}
        options={basicOptions}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("max-w-xs");
  });
});
