import type { ReactNode } from "react";
import { SidebarShell } from "@/components/layout/SidebarShell";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
      <SidebarShell />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
