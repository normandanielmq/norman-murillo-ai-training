import type { ReactNode } from "react";

type FormFooterProps = {
  children: ReactNode;
};

/** Bordered action row for form cancel + submit (e.g. Employee / Project forms). */
export function FormFooter({ children }: FormFooterProps) {
  return <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">{children}</div>;
}
