"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "neutral"
  | "soft"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex shrink-0 items-center justify-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "rounded-lg bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600",
  secondary:
    "rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
  outline:
    "rounded-lg border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
  danger:
    "rounded-lg bg-red-600 text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  neutral:
    "rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50",
  /** Light violet surface (e.g. “+ Add” on project create). */
  soft: "inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50",
  /** Icon / toolbar: pair with `className` for hover colors (violet, red, etc.). */
  ghost:
    "inline-flex items-center justify-center rounded border-0 bg-transparent p-1.5 text-gray-400 shadow-none",
  /** Text-style control (e.g. “Try again” in error alerts). */
  link: "inline border-0 bg-transparent p-0 text-sm font-medium text-red-600 shadow-none hover:underline",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Shared button styles for the HR portal. Prefer this over ad-hoc `<button className="...">`.
 * Variants: `primary`, `secondary`, `outline`, `danger`, `neutral`, `soft` (violet tint), `ghost` (icon/toolbar), `link` (text “Try again”).
 */
const VARIANTS_WITH_FIXED_PADDING: ButtonVariant[] = ["soft", "ghost", "link"];

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref
) {
  const sizeClass = VARIANTS_WITH_FIXED_PADDING.includes(variant) ? "" : SIZE[size];
  return (
    <button
      ref={ref}
      type={type}
      className={[BASE, VARIANT[variant], sizeClass, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
});
