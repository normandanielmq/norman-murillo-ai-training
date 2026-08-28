"use client";

import { Button } from "@/components/Button";

export type ErrorCalloutProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra classes on the retry `Button` (e.g. `mt-2 font-semibold`). */
  retryClassName?: string;
  rounded?: "lg" | "xl";
  padding?: "default" | "compact";
  /** Extra classes on the outer alert container. */
  className?: string;
};

const ROUNDED: Record<NonNullable<ErrorCalloutProps["rounded"]>, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
};

const PADDING: Record<NonNullable<ErrorCalloutProps["padding"]>, string> = {
  default: "p-4",
  compact: "p-3",
};

/**
 * Inline error banner with optional “Try again” action (list load failures, etc.).
 */
export function ErrorCallout({
  message,
  onRetry,
  retryLabel = "Try again",
  retryClassName = "mt-2",
  rounded = "lg",
  padding = "default",
  className = "",
}: ErrorCalloutProps) {
  return (
    <div
      className={[
        "border border-red-200 bg-red-50",
        ROUNDED[rounded],
        PADDING[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      <p className="text-sm text-red-800">{message}</p>
      {onRetry ? (
        <Button type="button" variant="link" onClick={onRetry} className={retryClassName}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
