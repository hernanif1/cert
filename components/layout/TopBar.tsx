"use client";

import { usePathname } from "next/navigation";
import { EXAM } from "@/content/exam-facts";
import { stripLocale } from "@/lib/i18n";
import { useDict } from "@/lib/i18n/client";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageMenu } from "@/components/layout/LanguageMenu";
import { FocusToggle, FullscreenToggle } from "@/components/layout/ViewToggles";
import { CurriculumMenu } from "@/components/layout/CurriculumMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchPalette } from "@/components/layout/SearchPalette";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

function TopLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: IconName;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <LocaleLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors",
        active ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      <Icon name={icon} size={15} />
      {children}
    </LocaleLink>
  );
}

export function TopBar() {
  const t = useDict();
  const path = stripLocale(usePathname() ?? "/").replace(/\/+$/, "") || "/";

  return (
    // `sticky` makes the header the containing block for the curriculum
    // panel, which is what lets that panel span the full bar width.
    <header data-topbar className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-accent-fg"
      >
        {t.skipToContent}
      </a>
      <div className="mx-auto flex h-14 max-w-shell items-center gap-2 px-4 sm:gap-3 sm:px-6">
        {/* `contents` wrappers exist only to carry data-focus-hide: focus mode
            (globals.css) empties the bar down to the language menu and the
            two view toggles. */}
        <div data-focus-hide className="contents">
          <MobileNav />

          <LocaleLink
            href="/learn"
            className="whitespace-nowrap font-display text-base tracking-tight text-fg"
          >
            {t.brand}
          </LocaleLink>
          <span className="hidden rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-fg-muted sm:inline">
            {EXAM.code}
          </span>

          <nav aria-label={t.nav.primary} className="ml-4 hidden items-center gap-0.5 lg:flex">
            <CurriculumMenu />
            <TopLink href="/learn/drill" icon="zap" active={path === "/learn/drill"}>
              {t.nav.drill}
            </TopLink>
            <TopLink href="/learn/progress" icon="chart" active={path === "/learn/progress"}>
              {t.nav.progress}
            </TopLink>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Trigger plus its dialog. The trigger hides itself in focus mode;
              the dialog stays mounted here, outside any data-focus-hide. */}
          <SearchPalette />
          {/* The language menu leads the group so it stays put, left of the
              view toggles, when focus mode strips the rest of the bar. */}
          <div data-focus-keep className="flex items-center gap-1.5 rounded-lg sm:gap-2">
            <LanguageMenu />
            {/* From sm up: a phone's bar has no room, and no rail to hide. */}
            <div data-view-toggles className="hidden items-center gap-1.5 sm:flex sm:gap-2">
              <FullscreenToggle />
              <FocusToggle />
            </div>
          </div>
          <div data-focus-hide className="contents">
            <ThemeToggle />
            {/* Icon-only on phones: the label lives in the drawer there. */}
            <LocaleLink
              href="/mock-exam"
              aria-label={t.nav.takeMockExam}
              title={t.nav.takeMockExam}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-xs font-medium text-accent-fg transition-colors hover:bg-accent-hover sm:px-3"
            >
              <Icon name="target" size={15} />
              <span className="hidden whitespace-nowrap sm:inline">{t.nav.takeMockExam}</span>
            </LocaleLink>
          </div>
        </div>
      </div>
    </header>
  );
}
