import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  /** Main subtitle (sentence case). */
  description?: string;
  /** Small uppercase line under the title (e.g. projects coordinator line). */
  eyebrow?: string;
  titleAs?: "h1" | "h2";
  /** `lg` = main portal pages (3xl); `md` = section pages (2xl). */
  size?: "lg" | "md";
  /** `row` = single row; `responsive` = stack on small screens. */
  layout?: "row" | "responsive";
  actions?: ReactNode;
};

const TITLE_CLASS: Record<NonNullable<PageHeaderProps["size"]>, string> = {
  lg: "text-3xl font-bold tracking-tight text-gray-900",
  md: "text-2xl font-bold text-gray-900",
};

const LAYOUT_CLASS: Record<NonNullable<PageHeaderProps["layout"]>, string> = {
  row: "flex items-start justify-between",
  responsive: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
};

/**
 * Standard page title + optional eyebrow/description + right-side actions.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  titleAs = "h1",
  size = "lg",
  layout = "responsive",
  actions,
}: PageHeaderProps) {
  const Heading = titleAs;
  return (
    <div className={LAYOUT_CLASS[layout]}>
      <div>
        <Heading className={TITLE_CLASS[size]}>{title}</Heading>
        {eyebrow ? (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">{eyebrow}</p>
        ) : null}
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
