import type { ReactNode } from "react";
import { PORTAL_ELEVATED_PANEL_CLASS } from "@/lib/portal-layout-classes";

/** White elevated panel used across project mockup screens. */
export function FormCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${PORTAL_ELEVATED_PANEL_CLASS} p-8 ${className}`.trim()}>{children}</div>
  );
}
