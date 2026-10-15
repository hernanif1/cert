"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { domainsFor, domainNumberLabel, weightPercent } from "@/lib/curriculum";
import { stripLocale } from "@/lib/i18n";
import { useDict, useLocale } from "@/lib/i18n/client";
import { useDisclosure } from "@/components/ui/useDisclosure";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { DomainBadge, Icon } from "@/components/ui/Icon";
import { LessonCheck } from "@/components/progress/LessonCheck";
import { DomainLessonCounter } from "@/components/progress/LessonCounter";
import { cn } from "@/lib/cn";

/**
 * The top-bar curriculum menu: domains on the left, the hovered or focused
 * domain's lessons as a submenu on the right — any of the 38 lessons is two
 * movements away from anywhere on the site.
 *
 * Navigation uses the DISCLOSURE pattern (a button that reveals plain links),
 * not role="menu": these are links, and link semantics — open in new tab,
 * copy address, visited state — are worth more here than menu semantics.
 * ← / → hop between the two columns; ↑ / ↓ move within one.
 */
export function CurriculumMenu() {
  const t = useDict();
  const locale = useLocale();
  const domains = domainsFor(locale);
  const path = stripLocale(usePathname() ?? "/").replace(/\/+$/, "") || "/";
  const { open, setOpen, close, rootRef, triggerRef } = useDisclosure();
  const panelId = useId();

  const currentIndex = domains.findIndex(
    (d) => path === `/learn/${d.slug}` || path.startsWith(`/learn/${d.slug}/`),
  );
  const inCurriculum = path === "/learn" || currentIndex >= 0;
  const [active, setActive] = useState(0);
  const domain = domains[active] ?? domains[0];

  const leftRef = useRef<HTMLUListElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  function toggle() {
    // Open on the domain being read, so the submenu starts where you are.
    if (!open) setActive(Math.max(0, currentIndex));
    setOpen(!open);
  }

  function links(root: HTMLElement | null): HTMLElement[] {
    return Array.from(root?.querySelectorAll<HTMLElement>("a") ?? []);
  }

  function onKeyDown(e: KeyboardEvent) {
    const el = document.activeElement as HTMLElement | null;
    const inLeft = !!el && !!leftRef.current?.contains(el);
    const inRight = !!el && !!rightRef.current?.contains(el);
    if (!inLeft && !inRight) return;

    const column = links(inLeft ? leftRef.current : rightRef.current);
    const i = column.indexOf(el!);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      column[(i + step + column.length) % column.length]?.focus();
    } else if (e.key === "ArrowRight" && inLeft) {
      e.preventDefault();
      links(rightRef.current)[0]?.focus();
    } else if (e.key === "ArrowLeft" && inRight) {
      e.preventDefault();
      links(leftRef.current)[active + 1]?.focus(); // +1 skips "Overview"
    }
  }

  return (
    <div ref={rootRef} data-domain={open ? domain.id : undefined}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggle}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[0.8125rem] font-medium transition-colors",
          open || inCurriculum ? "text-fg" : "text-fg-muted hover:text-fg",
          open && "bg-surface-2",
        )}
      >
        <Icon name="book" size={15} />
        {t.nav.curriculum}
        <Icon name="chevron-down" size={13} className="opacity-60" />
      </button>

      {open && (
        <div
          id={panelId}
          onKeyDown={onKeyDown}
          className="anim-pop absolute inset-x-0 top-full z-50 px-4 sm:px-6"
        >
          <div className="mx-auto mt-2 grid w-full max-w-[58rem] grid-cols-[minmax(0,21rem)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)]">
            {/* ── Level 1: domains ─────────────────────────────────────── */}
            <ul ref={leftRef} className="border-r border-border bg-surface-2/50 p-2">
              <li>
                <LocaleLink
                  href="/learn"
                  onClick={() => close()}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-[0.8125rem] font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-[0.6rem] border border-border">
                    <Icon name="grid" size={15} />
                  </span>
                  {t.nav.overview}
                </LocaleLink>
              </li>
              {domains.map((d, i) => (
                <li key={d.slug} data-domain={d.id}>
                  <LocaleLink
                    href={`/learn/${d.slug}`}
                    onClick={() => close()}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    aria-current={i === currentIndex ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
                      i === active ? "bg-surface shadow-[0_0_0_1px_var(--ui-border)]" : "hover:bg-surface",
                    )}
                  >
                    <DomainBadge domainId={d.id} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-medium text-fg">
                        {d.title}
                      </span>
                      <span className="tnum block text-[11px] text-fg-muted">
                        {domainNumberLabel(d.id)} · {weightPercent(d.weight)}
                      </span>
                    </span>
                    <Icon
                      name="chevron-right"
                      size={14}
                      className={cn(
                        "transition-opacity",
                        i === active ? "text-domain opacity-100" : "opacity-30",
                      )}
                    />
                  </LocaleLink>
                </li>
              ))}
            </ul>

            {/* ── Level 2: the active domain's lessons ─────────────────── */}
            <div ref={rightRef} key={domain.slug} className="anim-fade p-4">
              <div className="flex items-baseline gap-3 px-2">
                <p className="flex-1 font-display text-lg leading-snug text-fg">
                  {domain.title}
                </p>
                <DomainLessonCounter domainId={domain.id} />
              </div>
              <p className="mt-0.5 px-2 text-[11px] text-fg-muted">
                {t.nav.lessonsCount(domain.objectives.length)} ·{" "}
                {t.nav.weightOfExam(weightPercent(domain.weight))}
              </p>

              <ul className="mt-3">
                {domain.objectives.map((o) => {
                  const href = `/learn/${domain.slug}/${o.slug}`;
                  const here = path === href;
                  return (
                    <li key={o.slug}>
                      <LocaleLink
                        href={href}
                        onClick={() => close()}
                        aria-current={here ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[0.8125rem] transition-colors",
                          here
                            ? "bg-domain-soft font-medium text-fg"
                            : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                        )}
                      >
                        <LessonCheck slug={o.slug} />
                        <span className="tnum w-6 shrink-0 text-[11px] font-semibold text-domain">
                          {o.id}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{o.title}</span>
                        <Icon
                          name="arrow-right"
                          size={13}
                          className="opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60"
                        />
                      </LocaleLink>
                    </li>
                  );
                })}
              </ul>

              <LocaleLink
                href={`/learn/${domain.slug}`}
                onClick={() => close()}
                className="mt-3 inline-flex items-center gap-1.5 px-2 text-xs font-medium text-domain"
              >
                {t.nav.domainOverview}
                <Icon name="arrow-right" size={13} />
              </LocaleLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
