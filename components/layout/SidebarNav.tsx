"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOMAINS } from "@/content/domains";
import { domainNumberLabel } from "@/lib/curriculum";
import { cn } from "@/lib/cn";
import {
  DomainLessonCounter,
  OverallLessonCounter,
} from "@/components/progress/LessonCounter";

/**
 * Client component because it needs usePathname for active state. It imports
 * content/domains.ts (metadata only, a few KB) — never content/lessons, which
 * is server-only for exactly this reason.
 */

function NavLink({
  href,
  children,
  active,
  className,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-wider text-fg-muted/70">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  // trailingSlash:true means pathnames arrive as "/learn/3-integration/".
  const path = pathname.replace(/\/+$/, "") || "/";

  return (
    <nav className="text-sm" onClick={onNavigate}>
      <SectionLabel>Curriculum</SectionLabel>
      <NavLink href="/learn" active={path === "/learn"}>
        <span className="flex items-baseline gap-2">
          <span className="flex-1">Overview</span>
          <OverallLessonCounter />
        </span>
      </NavLink>

      <ul className="mt-0.5 space-y-0.5">
        {DOMAINS.map((d) => {
          const href = `/learn/${d.slug}`;
          // startsWith so a lesson keeps its parent domain highlighted.
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <li key={d.slug}>
              <NavLink href={href} active={active}>
                <span className="flex items-baseline gap-2">
                  <span className="tnum text-[11px] text-fg-muted/70">
                    {domainNumberLabel(d.id)}
                  </span>
                  <span className="min-w-0 flex-1">{d.title}</span>
                  <DomainLessonCounter domainId={d.id} />
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <SectionLabel>Practice</SectionLabel>
      <NavLink href="/mock-exam" active={path.startsWith("/mock-exam")}>
        Mock Exam
      </NavLink>

      <SectionLabel>Study Tools</SectionLabel>
      <NavLink href="/learn/progress" active={path === "/learn/progress"}>
        Progress Dashboard
      </NavLink>
      <NavLink href="/learn/drill" active={path === "/learn/drill"}>
        Drill Mode
      </NavLink>
    </nav>
  );
}
