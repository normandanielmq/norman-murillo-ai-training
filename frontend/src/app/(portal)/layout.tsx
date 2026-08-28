import type { ReactNode } from "react";
import { Sidebar } from "@/features/layout/Sidebar";
import { PortalFooter } from "@/features/layout/PortalFooter";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: Readonly<PortalLayoutProps>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FB]">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-auto px-6 py-8 sm:px-10">{children}</main>
          <PortalFooter />
        </div>
      </div>
    </div>
  );
}
