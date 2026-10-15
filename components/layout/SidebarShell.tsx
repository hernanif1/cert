import { SidebarNav } from "@/components/layout/SidebarNav";

/** The desktop rail. Below lg the same nav lives in the top bar's drawer
 *  (MobileNav), so it is reachable from every page, not just /learn. */
export function SidebarShell() {
  return (
    <aside data-focus-hide className="hidden w-[17.5rem] shrink-0 self-start lg:sticky lg:top-14 lg:block lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:py-6 lg:pr-4">
      <SidebarNav />
    </aside>
  );
}
