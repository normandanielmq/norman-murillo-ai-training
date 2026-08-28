import Link from "next/link";
import type { ReactNode } from "react";

const LIST_PAGE_PRIMARY_LINK_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-violet-700";

interface ListPagePrimaryLinkProps {
  href: string;
  children: ReactNode;
}

/** Primary “Add …” action in portal list pages (Employees, Projects). */
export function ListPagePrimaryLink({ href, children }: Readonly<ListPagePrimaryLinkProps>) {
  return (
    <Link href={href} className={LIST_PAGE_PRIMARY_LINK_CLASS}>
      {children}
    </Link>
  );
}
