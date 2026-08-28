import type { ReactNode } from "react";

type ModalErrorProps = {
  children: ReactNode;
  /** Assign-style bordered banner vs delete-style plain text */
  variant?: "banner" | "text";
  className?: string;
};

export function ModalError({ children, variant = "banner", className = "" }: ModalErrorProps) {
  if (variant === "text") {
    return (
      <p className={`mt-2 text-sm text-red-600 ${className}`.trim()} role="alert">
        {children}
      </p>
    );
  }
  return (
    <p
      className={`mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800 ${className}`.trim()}
      role="alert"
    >
      {children}
    </p>
  );
}
