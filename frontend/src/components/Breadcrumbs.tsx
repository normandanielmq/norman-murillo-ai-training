"use client";

import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-5 text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-gray-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center">
            {i > 0 && (
              <span className="mx-2 text-gray-300 select-none" aria-hidden>
                &gt;
              </span>
            )}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="transition-colors hover:text-violet-700">
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  i === items.length - 1 ? "font-semibold text-violet-700" : undefined
                }
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
