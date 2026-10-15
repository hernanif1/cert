import { neighboursFor, type LessonRef } from "@/lib/curriculum";
import type { Dict, Locale } from "@/lib/i18n";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Prev/next across the flat 38-lesson order, so the last lesson of a domain
 * links straight into the first of the next. The domain name is shown when the
 * neighbour crosses a boundary, and the card takes that domain's hue.
 */
export function LessonPager({
  slug,
  domainId,
  locale,
  t,
}: {
  slug: string;
  domainId: number;
  locale: Locale;
  t: Dict;
}) {
  const { prev, next } = neighboursFor(slug, locale);

  const card = (ref: LessonRef, dir: "prev" | "next") => (
    <LocaleLink
      href={ref.href}
      data-domain={ref.domainId}
      className={cn(
        "group rounded-2xl border border-border p-5 transition-colors hover:border-domain/60 hover:bg-domain-soft",
        dir === "next" && "text-right sm:col-start-2",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium text-fg-muted",
          dir === "next" && "justify-end",
        )}
      >
        {dir === "prev" && <Icon name="arrow-left" size={14} />}
        {dir === "prev" ? t.lesson.previous : t.lesson.next}
        {dir === "next" && <Icon name="arrow-right" size={14} />}
      </span>
      {ref.domainId !== domainId && (
        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-domain">
          {ref.domainTitle}
        </span>
      )}
      <span className="mt-1.5 block font-display text-lg leading-snug">
        <span className="tnum mr-1.5 font-sans text-sm font-semibold text-domain">
          {ref.id}
        </span>
        {ref.title}
      </span>
    </LocaleLink>
  );

  return (
    <nav
      aria-label={t.lesson.pager}
      className="mt-8 grid gap-3 sm:grid-cols-2"
    >
      {prev ? card(prev, "prev") : <span />}
      {next && card(next, "next")}
    </nav>
  );
}
