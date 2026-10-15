"use client";

import { useSearchParams } from "next/navigation";
import { EXAM } from "@/content/exam-facts";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { domainResults, minimumCorrectToPass } from "@/lib/exam/scoring";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { domainsFor, weightPercent } from "@/lib/curriculum";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";

export function ScoreReport() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const state = useAppState();
  const id = params.get("a");
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.result;
  const domains = domainsFor(locale);

  if (!hydrated) return <p className="text-sm text-fg-muted">{dict.tools.loading}</p>;

  // Read from history by id, so the results page survives a refresh.
  const attempt =
    state.examHistory.find((a) => a.id === id) ??
    state.examHistory[state.examHistory.length - 1];

  if (!attempt) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl">{t.none}</h1>
        <Link
          href="/mock-exam"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
        >
          {t.take}
        </Link>
      </div>
    );
  }

  const results = domainResults(attempt.byDomain).sort((a, b) => a.percent - b.percent);
  const needed = minimumCorrectToPass(attempt.total);
  const weakest = results.find((r) => r.itemsPresented > 0);
  const minutes = Math.round(attempt.durationMs / 60_000);

  // Position of the 720 cut on a 100-1000 bar.
  const cutPct =
    ((EXAM.passScaled - EXAM.scaleMin) / (EXAM.scaleMax - EXAM.scaleMin)) * 100;
  const scorePct =
    ((attempt.scaled - EXAM.scaleMin) / (EXAM.scaleMax - EXAM.scaleMin)) * 100;

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-accent">{t.eyebrow}</p>
      <h1
        className={`mt-2 font-display text-5xl ${attempt.passed ? "text-success" : "text-danger"}`}
      >
        {attempt.passed ? t.pass : t.fail}
      </h1>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-baseline gap-3">
          <span className="tnum font-display text-5xl">{attempt.scaled}</span>
          <span className="text-sm text-fg-muted">
            {t.scaledNote(EXAM.passScaled)}
          </span>
        </div>

        <div className="relative mt-4">
          <ProgressBar
            value={scorePct}
            tone={attempt.passed ? "success" : "danger"}
            label={t.scaledAria(attempt.scaled)}
          />
          <span
            aria-hidden="true"
            className="absolute -top-1 h-4 w-px bg-fg"
            style={{ left: `${cutPct}%` }}
          />
        </div>

        <p className="tnum mt-4 text-sm text-fg-muted">
          {t.summary(attempt.raw, attempt.total, needed, minutes)}
          {attempt.timedOut && ` · ${t.timeExpired}`}
        </p>

        {!attempt.passed && weakest && weakest.percent < 100 && (
          <p className="mt-3 text-sm leading-relaxed">
            {t.gap(
              `${weakest.code} ${domains.find((d) => d.id === weakest.domain)?.title ?? weakest.title}`,
              weakest.percent,
              weakest.itemsPresented,
              weightPercent(weakest.blueprintWeight),
            )}
          </p>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">{t.byDomain}</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {t.byDomainNote}
        </p>
        <ul className="mt-4 space-y-4">
          {results.map((r) => {
            const domain = domains.find((d) => d.id === r.domain);
            const title = domain?.title ?? r.title;
            return (
              <li key={r.domain} data-domain={r.domain}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    href={`/learn/${domain?.slug ?? ""}`}
                    className="font-medium transition-colors hover:text-domain"
                  >
                    <span className="tnum mr-1.5 text-domain">{r.code}</span>
                    {title}
                  </Link>
                  <span className="tnum shrink-0 text-fg-muted">
                    {r.correct}/{r.itemsPresented} · {r.percent}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    value={r.percent}
                    tone={r.percent >= 70 ? "success" : r.percent >= 50 ? "accent" : "danger"}
                    label={`${title} ${r.percent}%`}
                  />
                </div>
                <p className="tnum mt-1 text-[11px] text-fg-muted">
                  {t.ofExam(weightPercent(r.blueprintWeight))}
                  {r.lowConfidence && ` · ${t.lowConfidence(r.itemsPresented)}`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/mock-exam"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          {t.another}
        </Link>
        <Link
          href="/learn/drill"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          {t.drillWeak}
        </Link>
        <Link
          href="/learn/progress"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          {t.dashboard}
        </Link>
      </div>

      {/* Persistent, not a dismissible toast. This is the one genuine integrity
          risk in the project and it belongs on the results page. */}
      <p className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-fg-muted">
        <strong className="font-semibold text-fg">
          {t.estimateLead}
        </strong>{" "}
        {t.estimateBody(attempt.total, EXAM.passScaled, attempt.scaled)}
      </p>
    </div>
  );
}
