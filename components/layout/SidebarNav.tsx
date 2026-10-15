"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { domainsFor, domainNumberLabel } from "@/lib/curriculum";
import { stripLocale } from "@/lib/i18n";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon, DOMAIN_ICON, type IconName } from "@/components/ui/Icon";
import { LessonCheck } from "@/components/progress/LessonCheck";
import { cn } from "@/lib/cn";
import {
  ChecklistCounter,
  DomainLessonCounter,
  OverallLessonCounter,
} from "@/components/progress/LessonCounter";

/**
 * Client component because it needs usePathname for active state. It imports
 * curriculum metadata only (a few KB) — never content/lessons, which is
 * server-only for exactly this reason.
 *
 * Each domain is a link PLUS a disclosure button for its lessons. The domain
 * being read opens by itself; any other can be peeked into without leaving the
 * page. Lesson lists are conditionally rendered, so a closed domain adds no
 * links to the document.
 */

function NavLink({
  href,
  children,
  active,
  icon,
  className,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  icon?: IconName;
  className?: string;
}) {
  return (
    <LocaleLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </LocaleLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1.5 pt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted/70 first:pt-1">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useDict();
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  // trailingSlash:true means pathnames arrive as "/learn/3-integration/".
  const path = stripLocale(pathname).replace(/\/+$/, "") || "/";

  // Domains the reader opened or closed by hand. The active domain is open
  // unless explicitly closed; everything else is closed unless opened.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <nav
      aria-label={t.nav.curriculum}
      className="text-sm"
      onClick={(e) => {
        // Only a followed link dismisses the mobile drawer — not a chevron.
        if ((e.target as HTMLElement).closest("a")) onNavigate?.();
      }}
    >
      <SectionLabel>{t.nav.curriculum}</SectionLabel>
      <NavLink href="/learn" active={path === "/learn"} icon="grid">
        <span className="flex-1">{t.nav.overview}</span>
        <OverallLessonCounter />
      </NavLink>

      <ul className="mt-0.5 space-y-0.5">
        {domainsFor(locale).map((d) => {
          const href = `/learn/${d.slug}`;
          // startsWith so a lesson keeps its parent domain highlighted.
          const active = path === href || path.startsWith(`${href}/`);
          const open = toggled[d.slug] ?? active;
          return (
            <li key={d.slug} data-domain={d.id}>
              <div
                className={cn(
                  "group/row flex items-stretch rounded-lg transition-colors",
                  active ? "bg-domain-soft" : "hover:bg-surface-2",
                )}
              >
                <LocaleLink
                  href={href}
                  aria-current={path === href ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-1 transition-colors",
                    active ? "font-medium text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <Icon
                    name={DOMAIN_ICON[d.id]}
                    size={16}
                    className={cn("text-domain", !active && "opacity-80")}
                  />
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className="tnum mr-1.5 text-[11px] text-fg-muted/70">
                      {domainNumberLabel(d.id)}
                    </span>
                    {d.title}
                  </span>
                  <DomainLessonCounter domainId={d.id} />
                </LocaleLink>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={(open ? t.nav.hideLessons : t.nav.showLessons)(d.title)}
                  onClick={() =>
                    setToggled((s) => ({ ...s, [d.slug]: !open }))
                  }
                  className="flex w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-fg"
                >
                  <Icon name="chevron-right" size={14} />
                </button>
              </div>

              {open && (
                <ul className="anim-fade relative my-1 ml-[1.15rem] border-l border-border pl-2">
                  {d.objectives.map((o) => {
                    const lessonHref = `${href}/${o.slug}`;
                    const here = path === lessonHref;
                    return (
                      <li key={o.slug}>
                        <LocaleLink
                          href={lessonHref}
                          aria-current={here ? "page" : undefined}
                          className={cn(
                            "relative flex items-start gap-2 rounded-md py-1.5 pl-2 pr-1.5 text-[0.8125rem] leading-snug transition-colors",
                            here
                              ? "font-medium text-fg before:absolute before:-left-[calc(0.5rem+1px)] before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-domain"
                              : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                          )}
                        >
                          <span className="mt-px">
                            <LessonCheck slug={o.slug} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="tnum mr-1.5 text-[11px] font-semibold text-domain">
                              {o.id}
                            </span>
                            {o.title}
                          </span>
                        </LocaleLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <SectionLabel>{t.nav.practice}</SectionLabel>
      <NavLink href="/mock-exam" active={path.startsWith("/mock-exam")} icon="target">
        {t.nav.mockExam}
      </NavLink>

      <SectionLabel>{t.nav.studyTools}</SectionLabel>
      <NavLink href="/learn/progress" active={path === "/learn/progress"} icon="chart">
        {t.nav.progress}
      </NavLink>
      <NavLink href="/learn/drill" active={path === "/learn/drill"} icon="zap">
        {t.nav.drill}
      </NavLink>
      <NavLink
        href="/learn/checklist"
        active={path === "/learn/checklist"}
        icon="list"
      >
        <span className="flex-1">{t.nav.checklist}</span>
        <ChecklistCounter />
      </NavLink>
      <NavLink href="/learn/flagged" active={path === "/learn/flagged"} icon="flag">
        {t.nav.flagged}
      </NavLink>
    </nav>
  );
}
