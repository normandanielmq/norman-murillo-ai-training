"use client";

import { FormField, INPUT_CLASS } from "@/components/FormField";

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = {
  label: string;
  id: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  /** When true, label is visually hidden but kept for screen readers. */
  hideLabel?: boolean;
  /** Extra classes merged onto `<select>` (after `INPUT_CLASS`). */
  selectClassName?: string;
  /** Classes on the `FormField` wrapper. */
  className?: string;
  /** Optional native `aria-label` on the select (use when label is redundant or hidden). */
  "aria-label"?: string;
};

/**
 * Label + `<select>` using shared `INPUT_CLASS` styling.
 */
export function SelectField({
  label,
  id,
  required,
  value,
  onChange,
  options,
  disabled,
  hideLabel,
  selectClassName,
  className,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const selectClasses = [INPUT_CLASS, selectClassName].filter(Boolean).join(" ");
  return (
    <FormField
      label={label}
      id={id}
      required={required}
      labelClassName={hideLabel ? "sr-only" : undefined}
      className={className}
    >
      <select
        id={id}
        value={value}
        disabled={disabled}
        className={selectClasses}
        aria-label={ariaLabel}
        aria-required={required ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt, i) => (
          <option key={`${i}-${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
