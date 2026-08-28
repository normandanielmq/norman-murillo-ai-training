"use client";

type FormFieldProps = {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
  /** Override label visibility/style (e.g. `sr-only` for icon-only rows). */
  labelClassName?: string;
  /** Classes on the outer wrapper (e.g. `inline-block` in flex toolbars). */
  className?: string;
};

const DEFAULT_LABEL_CLASS = "mb-1 block text-sm font-medium text-gray-700";

export function FormField({ label, id, required, children, labelClassName, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClassName ?? DEFAULT_LABEL_CLASS}>
        {label}
        {required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
      </label>
      {children}
    </div>
  );
}

export const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500";
