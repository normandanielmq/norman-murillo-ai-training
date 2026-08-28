"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon } from "@/features/layout/icons/DashboardIcon";
import { EmployeesIcon } from "@/features/layout/icons/EmployeesIcon";
import { ChatIcon } from "@/features/layout/icons/ChatIcon";
import { ProjectsIcon } from "@/features/layout/icons/ProjectsIcon";
import { SparkleMark } from "@/features/layout/SparkleMark";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/employees", label: "Employees", icon: EmployeesIcon },
  { href: "/projects", label: "Projects", icon: ProjectsIcon },
  { href: "/chat", label: "Assistant", icon: ChatIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white px-4 py-8">
      <div className="mb-10 flex items-center gap-3 px-2">
        <SparkleMark />
        <div>
          <h2 className="text-base font-bold tracking-tight text-gray-900">HR Executive</h2>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-violet-100 text-violet-800"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? "text-violet-700" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
