"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CreateEmployeeDto, Employee } from "@/lib/employee-types";
import { FormField, INPUT_CLASS } from "@/components/FormField";
import { SelectField } from "@/components/SelectField";
import { FormErrorList } from "@/components/FormErrorList";
import { FormFooter } from "@/components/FormFooter";
import { Button } from "@/components/Button";
import { useCountries } from "@/hooks/useCountries";
import { mergePhoneWithCallingCode } from "@/lib/phone-calling-code";

const JOB_TITLE_OPTIONS = [
  "Select Title",
  "Senior Systems Architect",
  "Principal Designer",
  "Frontend Lead",
  "Backend Engineer",
  "HR Operations Manager",
  "Product Manager",
  "Software Engineer",
  "UX Designer",
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const emptyDto: CreateEmployeeDto = {
  name: "",
  email: "",
  nationalId: "",
  phone: "",
  country: "",
  gender: "",
  dateOfBirth: "",
  officialTitle: "",
  hireDate: "",
};

type Props = {
  initialData?: Employee | null;
  submitLabel: string;
  onSubmit: (dto: CreateEmployeeDto) => Promise<{ ok: boolean; error?: string; details?: string[] }>;
  onSuccess: () => void;
};

export function EmployeeForm({ initialData, submitLabel, onSubmit, onSuccess }: Props) {
  const { countries, loading: countriesLoading, error: countriesError, reload: reloadCountries } = useCountries();

  const [form, setForm] = useState<CreateEmployeeDto>(() =>
    initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          nationalId: initialData.nationalId,
          phone: initialData.phone,
          country: initialData.country,
          gender: initialData.gender,
          dateOfBirth: initialData.dateOfBirth,
          officialTitle: initialData.officialTitle,
          hireDate: initialData.hireDate,
        }
      : { ...emptyDto }
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const countryCodeByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of countries) {
      m.set(c.name, c.callingCode);
    }
    return m;
  }, [countries]);

  const countryOptions = useMemo(() => {
    const empty = { value: "", label: "Select country" };
    const opts = countries.map((c) => ({ value: c.name, label: c.name }));
    if (form.country && !countries.some((c) => c.name === form.country)) {
      return [empty, { value: form.country, label: `${form.country} (saved)` }, ...opts];
    }
    return [empty, ...opts];
  }, [countries, form.country]);

  const handleCountryChange = (value: string) => {
    setForm((prev) => {
      if (!value) {
        return { ...prev, country: "" };
      }
      const code = countryCodeByName.get(value);
      if (code) {
        return {
          ...prev,
          country: value,
          phone: mergePhoneWithCallingCode(prev.phone, code),
        };
      }
      return { ...prev, country: value };
    });
    setErrors([]);
  };

  const update = (field: keyof CreateEmployeeDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      const result = await onSubmit(form);
      if (result.ok) {
        onSuccess();
      } else {
        setErrors(result.details ?? (result.error ? [result.error] : []));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormErrorList messages={errors} />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Full Name" id="name" required>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. John Doe"
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
        <FormField label="Email Address" id="email" required>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="john.doe@company.com"
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
        <FormField label="National ID" id="nationalId" required>
          <input
            id="nationalId"
            type="text"
            value={form.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            placeholder="ID Number"
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
        <FormField label="Hire Date" id="hireDate" required>
          <input
            id="hireDate"
            type="date"
            value={form.hireDate}
            onChange={(e) => update("hireDate", e.target.value)}
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
        <SelectField
          label="Job Title"
          id="officialTitle"
          required
          value={form.officialTitle}
          onChange={(v) => update("officialTitle", v)}
          options={JOB_TITLE_OPTIONS.map((opt) => ({
            value: opt === "Select Title" ? "" : opt,
            label: opt,
          }))}
        />
        {countriesLoading ? (
          <FormField label="Country" id="country" required>
            <select
              id="country"
              disabled
              className={INPUT_CLASS}
              value=""
              aria-busy="true"
              aria-label="Loading country list"
            >
              <option value="">Loading countries…</option>
            </select>
          </FormField>
        ) : countriesError || countries.length === 0 ? (
          <div className="space-y-2">
            <FormField label="Country" id="country" required>
              <input
                id="country"
                type="text"
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                placeholder="e.g. United States"
                className={INPUT_CLASS}
                aria-required="true"
              />
            </FormField>
            {countriesError ? (
              <p className="text-sm text-amber-800" role="status">
                {countriesError}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="inline p-0 align-baseline"
                  onClick={() => void reloadCountries()}
                >
                  Retry
                </Button>
              </p>
            ) : null}
          </div>
        ) : (
          <SelectField
            label="Country"
            id="country"
            required
            value={form.country}
            onChange={handleCountryChange}
            options={countryOptions}
          />
        )}
        <FormField label="Phone" id="phone" required>
          <input
            id="phone"
            type="text"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="Fills with country code when you pick a country above"
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
        <FormField label="Date of Birth" id="dateOfBirth" required>
          <input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            className={INPUT_CLASS}
            aria-required="true"
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-gray-700">
          Gender<span className="ml-0.5 text-red-500" aria-hidden>*</span>
        </legend>
        <div className="flex gap-6">
          {GENDER_OPTIONS.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="gender"
                value={opt}
                checked={form.gender === opt}
                onChange={(e) => update("gender", e.target.value)}
                className="h-4 w-4 border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormFooter>
        <Link
          href="/employees"
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Link>
        <Button type="submit" variant="primary" size="md" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </FormFooter>
    </form>
  );
}
