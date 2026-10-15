import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXAM } from "@/content/exam-facts";
import { getDomainFor, weightPercent } from "@/lib/curriculum";
import { getDict, type Locale } from "@/lib/i18n";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { LessonCheck } from "@/components/progress/LessonCheck";
import { DomainRing } from "@/components/progress/DomainRing";
import { DomainBadge, Icon } from "@/components/ui/Icon";

export function domainMetadata(slug: string, locale: Locale): Metadata {
  const d = getDomainFor(slug, locale);
  if (!d) return {};
  return {
    title: `${d.title} (${weightPercent(d.weight)})`,
    description: d.blurb,
  };
}

export function DomainView({ domain, locale }: { domain: string; locale: Locale }) {
  const d = getDomainFor(domain, locale);
  if (!d) notFound();
  const t = getDict(locale);

  return (
    <main data-domain={d.id} className="max-w-[60rem]">
      <LocaleLink
        href="/learn"
        className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
      >
        <Icon name="arrow-left" size={14} />
        {t.domain.back}
      </LocaleLink>

      <div className="mt-7 flex items-center gap-4">
        <DomainBadge domainId={d.id} size={52} draw />
        <div className="min-w-0 flex-1">
          <p className="tnum text-[11px] font-semibold uppercase tracking-[0.08em] text-domain">
            {t.lesson.domain(d.id)} · {weightPercent(d.weight)}
          </p>
        </div>
        <DomainRing domainId={d.id} size={48} />
      </div>
      <h1 className="mt-5 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
        {d.title}
      </h1>

      <p className="mt-5 max-w-2xl text-reading text-fg-muted">{d.blurb}</p>
      <p className="tnum mt-3 text-xs text-fg-muted">
        {t.domain.meta(d.objectives.length, d.mockItemCount, EXAM.itemCount)}
      </p>

      <div className="mt-14 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl">{t.domain.taskStatements}</h2>
        <LocaleLink
          href="/learn/drill"
          className="link inline-flex items-center gap-1.5 text-sm"
        >
          {t.domain.drill}
          <Icon name="arrow-right" size={14} />
        </LocaleLink>
      </div>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {d.objectives.map((o) => (
          <li key={o.slug}>
            <LocaleLink
              href={`/learn/${d.slug}/${o.slug}`}
              className="group -mx-3 flex gap-4 rounded-xl px-3 py-5 transition-colors hover:bg-domain-soft"
            >
              <span className="flex shrink-0 items-center gap-2.5 self-start pt-1">
                <LessonCheck slug={o.slug} />
                <span className="tnum w-7 text-sm font-semibold text-domain">
                  {o.id}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-snug">
                  {o.title}
                </span>
                <span className="mt-1.5 block text-aux text-fg-muted">
                  {o.text}
                </span>
              </span>
              <Icon
                name="arrow-right"
                size={16}
                className="mt-1.5 hidden text-fg-muted sm:block"
              />
            </LocaleLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
