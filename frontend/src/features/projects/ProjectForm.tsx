"use client";

import { useState } from "react";
import Link from "next/link";
import type { CreateProjectDto, Project } from "@/lib/project-types";
import { FormField, INPUT_CLASS } from "@/components/FormField";
import { FormErrorList } from "@/components/FormErrorList";
import { FormFooter } from "@/components/FormFooter";
import { Button } from "@/components/Button";

const emptyDto: CreateProjectDto = {
  name: "",
  description: "",
};

type Props = {
  initialData?: Project | null;
  submitLabel: string;
  onSubmit: (dto: CreateProjectDto) => Promise<{ ok: boolean; error?: string; details?: string[] }>;
  onSuccess: () => void;
};

export function ProjectForm({ initialData, submitLabel, onSubmit, onSuccess }: Props) {
  const [form, setForm] = useState<CreateProjectDto>(() =>
    initialData
      ? { name: initialData.name, description: initialData.description }
      : { ...emptyDto }
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof CreateProjectDto, value: string) => {
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

      <FormField label="Project Name" id="projectName" required>
        <input
          id="projectName"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Infrastructure Overhaul"
          className={INPUT_CLASS}
          aria-required="true"
        />
      </FormField>

      <div>
        <label
          htmlFor="projectDescription"
          className="mb-2 block text-sm font-semibold text-gray-900"
        >
          Project Description
          <span className="ml-1 text-xs font-normal text-gray-500">(optional — can be empty)</span>
        </label>
        <textarea
          id="projectDescription"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          placeholder="Describe the project goals and scope…"
          className={INPUT_CLASS}
        />
      </div>

      <FormFooter>
        <Link
          href="/projects"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={submitting}
          className="px-5 py-2.5 font-semibold shadow-sm"
        >
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </FormFooter>
    </form>
  );
}
