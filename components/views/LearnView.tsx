import type { Metadata } from "next";
import { EXAM } from "@/content/exam-facts";
import {
  domainsFor,
  domainNumberLabel,
  TOTAL_LESSONS,
  weightPercent,
} from "@/lib/curriculum";
import { getDict, type Locale } from "@/lib/i18n";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { DomainRing } from "@/components/progress/DomainRing";
import { DomainBadge, Icon } from "@/components/ui/Icon";

export function learnMetadata(locale: Locale): Metadata {
  const t = getDict(locale).learn;
  return {
    title: t.metaTitle,
    description: t.metaDescription(
      domainsFor(locale).length,
      TOTAL_LESSONS,
      EXAM.code,
    ),
  };
}

export function LearnView({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const domains = domainsFor(locale);
  const f = t.learn.facts;
  const facts: [string, string][] = [
    [f.items, String(EXAM.itemCount)],
    [f.time, f.min(EXAM.minutes)],
    [f.pass, `${EXAM.passScaled}/${EXAM.scaleMax}`],
    [f.domains, String(domains.length)],
    [f.objectives, String(TOTAL_LESSONS)],
  ];

  return (
    <main className="max-w-[60rem]">
      <p className="text-sm font-medium text-accent">{t.learn.eyebrow}</p>
      <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
        {EXAM.credential}
      </h1>
      <p className="mt-5 max-w-2xl text-reading text-fg-muted">{t.learn.intro}</p>

      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-border py-5">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-wide text-fg-muted">
              {label}
            </dt>
            <dd className="tnum mt-0.5 font-display text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-10 space-y-4">
        {domains.map((d) => (
          <li key={d.slug} data-domain={d.id}>
            <LocaleLink
              href={`/learn/${d.slug}`}
              className="group block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-domain/60 sm:p-6"
            >
              <div className="flex items-center gap-4">
                <DomainBadge domainId={d.id} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="tnum text-[11px] font-semibold uppercase tracking-[0.08em] text-domain">
                    {t.lesson.domain(d.id)} · {weightPercent(d.weight)}
                  </p>
                  <h2 className="mt-0.5 font-display text-[1.375rem] leading-snug transition-colors group-hover:text-domain">
                    <span className="sr-only">{domainNumberLabel(d.id)} </span>
                    {d.title}
                  </h2>
                </div>
                <DomainRing domainId={d.id} />
                <Icon
                  name="arrow-right"
                  size={18}
                  className="hidden text-fg-muted sm:block"
                />
              </div>
              <p className="mt-4 max-w-3xl text-aux text-fg-muted">{d.blurb}</p>
              <p className="tnum mt-3 text-xs text-fg-muted">
                {t.learn.domainMeta(
                  d.objectives.length,
                  d.mockItemCount,
                  EXAM.itemCount,
                )}
              </p>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
