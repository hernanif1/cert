import type { ReactNode } from "react";
import { SidebarShell } from "@/components/layout/SidebarShell";

/** Shared by /learn and /pt-br/learn. */
export function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-shell flex-1 px-4 sm:px-6 lg:gap-12">
      <SidebarShell />
      <div className="min-w-0 flex-1 py-8 lg:py-12">{children}</div>
    </div>
  );
}
