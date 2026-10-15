import { EXAM } from "@/content/exam-facts";
import { domainsFor, weightPercent } from "@/lib/curriculum";
import { getDict, type Locale } from "@/lib/i18n";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { DomainBadge, Icon } from "@/components/ui/Icon";

export function HomeView({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const f = t.home.facts;
  const facts: [string, string][] = [
    [f.items, String(EXAM.itemCount)],
    [f.timeLimit, f.minutes(EXAM.minutes)],
    [f.passingScore, f.passOf(EXAM.passScaled, EXAM.scaleMax)],
    [f.fee, `$${EXAM.feeUsd} USD`],
    [f.validity, f.months(EXAM.validityMonths)],
    [f.code, EXAM.code],
  ];

  return (
    <main className="mx-auto w-full max-w-shell flex-1 px-4 py-20 sm:px-6 sm:py-28">
      <p className="text-sm font-medium text-accent">{t.home.eyebrow}</p>
      <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.04] tracking-[-0.025em] sm:text-7xl">
        {EXAM.credential}
      </h1>
      <p className="mt-7 max-w-2xl text-lg leading-[1.75] text-fg-muted sm:text-xl sm:leading-[1.7]">
        {t.home.intro}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <LocaleLink
          href="/learn"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Icon name="book" size={17} />
          {t.home.start}
          <Icon name="arrow-right" size={16} />
        </LocaleLink>
        <LocaleLink
          href="/learn/progress"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-accent/60"
        >
          <Icon name="chart" size={17} />
          {t.home.progress}
        </LocaleLink>
      </div>

      {/* The seven domains as a colour key: the hue you meet here is the hue
          of every bullet, rule and highlight inside that domain's lessons. */}
      <ul className="mt-16 flex flex-wrap gap-2.5">
        {domainsFor(locale).map((d) => (
          <li key={d.slug} data-domain={d.id}>
            <LocaleLink
              href={`/learn/${d.slug}`}
              className="inline-flex items-center gap-2.5 rounded-full border border-border py-1.5 pl-1.5 pr-4 text-[0.8125rem] font-medium transition-colors hover:border-domain/60 hover:bg-domain-soft"
            >
              <DomainBadge domainId={d.id} size={28} className="rounded-full" />
              {d.title}
              <span className="tnum text-fg-muted">{weightPercent(d.weight)}</span>
            </LocaleLink>
          </li>
        ))}
      </ul>

      <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="bg-surface px-5 py-6">
            <dt className="text-xs uppercase tracking-wide text-fg-muted">
              {label}
            </dt>
            <dd className="tnum mt-1.5 font-display text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
