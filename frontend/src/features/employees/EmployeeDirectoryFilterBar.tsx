"use client";

import { SelectField } from "@/components/SelectField";
import { Button } from "@/components/Button";
import { FunnelXIcon } from "@/features/employees/icons/FunnelXIcon";
import type { Project } from "@/lib/project-types";

const BAR_CLASS =
  "flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:flex-row sm:items-end sm:justify-between";

export type EmployeeDirectoryFilterBarProps = {
  country: string;
  gender: string;
  projectId: string;
  countryOptions: string[];
  genderOptions: string[];
  projects: Project[];
  optionsLoading: boolean;
  filtersActive: boolean;
  onCountryChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onProjectIdChange: (value: string) => void;
  onClear: () => void;
};

export function EmployeeDirectoryFilterBar({
  country,
  gender,
  projectId,
  countryOptions,
  genderOptions,
  projects,
  optionsLoading,
  filtersActive,
  onCountryChange,
  onGenderChange,
  onProjectIdChange,
  onClear,
}: EmployeeDirectoryFilterBarProps) {
  const countrySelectOptions = [
    { value: "", label: "Filter by Country" },
    ...countryOptions.map((c) => ({ value: c, label: c })),
  ];
  const genderSelectOptions = [
    { value: "", label: "Filter by Gender" },
    ...genderOptions.map((g) => ({ value: g, label: g })),
  ];
  const projectSelectOptions = [
    { value: "", label: "Filter by Project" },
    ...projects.map((p) => ({ value: String(p.id), label: p.name })),
  ];
  return (
    <div className={BAR_CLASS}>
      <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField
          label="Country"
          id="filter-country"
          value={country}
          disabled={optionsLoading}
          onChange={onCountryChange}
          options={countrySelectOptions}
        />
        <SelectField
          label="Gender"
          id="filter-gender"
          value={gender}
          disabled={optionsLoading}
          onChange={onGenderChange}
          options={genderSelectOptions}
        />
        <SelectField
          label="Project"
          id="filter-project"
          value={projectId}
          disabled={optionsLoading}
          onChange={onProjectIdChange}
          options={projectSelectOptions}
        />
      </div>
      <div className="flex shrink-0 justify-end sm:pb-0.5">
        <Button
          type="button"
          variant="neutral"
          size="sm"
          onClick={onClear}
          disabled={!filtersActive}
          className="gap-2 bg-gray-50 hover:bg-gray-100"
          title="Clear filters"
          aria-label="Clear filters"
        >
          <FunnelXIcon className="h-5 w-5 text-gray-500" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </div>
  );
}
