import { render, screen, fireEvent } from "@testing-library/react";
import { EmployeeDirectoryFilterBar } from "@/features/employees/EmployeeDirectoryFilterBar";
import { projectExisting } from "@/test/fixtures";

const defaultProps = {
  country: "",
  gender: "",
  projectId: "",
  countryOptions: ["United States"],
  genderOptions: ["Female"],
  projects: [projectExisting],
  optionsLoading: false,
  filtersActive: false,
  onCountryChange: jest.fn(),
  onGenderChange: jest.fn(),
  onProjectIdChange: jest.fn(),
  onClear: jest.fn(),
};

describe("EmployeeDirectoryFilterBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filter selects and clear control", () => {
    render(<EmployeeDirectoryFilterBar {...defaultProps} />);
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.getByLabelText("Gender")).toBeInTheDocument();
    expect(screen.getByLabelText("Project")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("disables clear when filters are not active", () => {
    render(<EmployeeDirectoryFilterBar {...defaultProps} filtersActive={false} />);
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeDisabled();
  });

  it("enables clear and calls onClear when filters are active", () => {
    render(<EmployeeDirectoryFilterBar {...defaultProps} filtersActive />);
    const clearBtn = screen.getByRole("button", { name: "Clear filters" });
    expect(clearBtn).not.toBeDisabled();
    fireEvent.click(clearBtn);
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it("disables selects while options are loading", () => {
    render(<EmployeeDirectoryFilterBar {...defaultProps} optionsLoading />);
    expect(screen.getByLabelText("Country")).toBeDisabled();
    expect(screen.getByLabelText("Gender")).toBeDisabled();
    expect(screen.getByLabelText("Project")).toBeDisabled();
  });
});
