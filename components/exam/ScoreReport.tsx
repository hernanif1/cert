"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EXAM } from "@/content/exam-facts";
import { DOMAINS } from "@/content/domains";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { domainResults, minimumCorrectToPass } from "@/lib/exam/scoring";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { weightPercent } from "@/lib/curriculum";

export function ScoreReport() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const state = useAppState();
  const id = params.get("a");

  if (!hydrated) return <p className="text-sm text-fg-muted">Loading…</p>;

  // Read from history by id, so the results page survives a refresh.
  const attempt =
    state.examHistory.find((a) => a.id === id) ??
    state.examHistory[state.examHistory.length - 1];

  if (!attempt) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl">No attempt to report</h1>
        <Link
          href="/mock-exam"
          className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
        >
          Take a mock exam
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
      <p className="text-sm font-medium text-accent">Mock exam result</p>
      <h1
        className={`mt-2 font-display text-5xl ${attempt.passed ? "text-success" : "text-danger"}`}
      >
        {attempt.passed ? "Pass" : "Fail"}
      </h1>

      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <div className="flex items-baseline gap-3">
          <span className="tnum font-display text-5xl">{attempt.scaled}</span>
          <span className="text-sm text-fg-muted">
            estimated scaled score · cut at {EXAM.passScaled}
          </span>
        </div>

        <div className="relative mt-4">
          <ProgressBar
            value={scorePct}
            tone={attempt.passed ? "success" : "danger"}
            label={`Scaled score ${attempt.scaled}`}
          />
          <span
            aria-hidden="true"
            className="absolute -top-1 h-4 w-px bg-fg"
            style={{ left: `${cutPct}%` }}
          />
        </div>

        <p className="tnum mt-4 text-sm text-fg-muted">
          {attempt.raw} of {attempt.total} correct · you needed {needed} ·{" "}
          {minutes} min used
          {attempt.timedOut && " · time expired"}
        </p>

        {!attempt.passed && weakest && weakest.percent < 100 && (
          <p className="mt-3 text-sm leading-relaxed">
            Your largest gap was {weakest.code} {weakest.title} at{" "}
            {weakest.percent}% on {weakest.itemsPresented} items — that is{" "}
            {weightPercent(weakest.blueprintWeight)} of the exam.
          </p>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">By domain</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Weakest first. Domain percentages are diagnostic — the real exam bases
          pass or fail on the total scaled score alone.
        </p>
        <ul className="mt-4 space-y-4">
          {results.map((r) => {
            const domain = DOMAINS.find((d) => d.id === r.domain);
            return (
              <li key={r.domain}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    href={`/learn/${domain?.slug ?? ""}`}
                    className="font-medium transition-colors hover:text-accent"
                  >
                    {r.code} {r.title}
                  </Link>
                  <span className="tnum shrink-0 text-fg-muted">
                    {r.correct}/{r.itemsPresented} · {r.percent}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    value={r.percent}
                    tone={r.percent >= 70 ? "success" : r.percent >= 50 ? "accent" : "danger"}
                    label={`${r.title} ${r.percent}%`}
                  />
                </div>
                <p className="tnum mt-1 text-[11px] text-fg-muted">
                  {weightPercent(r.blueprintWeight)} of the exam
                  {r.lowConfidence &&
                    ` · only ${r.itemsPresented} items, so treat this percentage as indicative only`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/mock-exam"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Take another
        </Link>
        <Link
          href="/learn/drill"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          Drill your weak areas
        </Link>
        <Link
          href="/learn/progress"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent"
        >
          Progress dashboard
        </Link>
      </div>

      {/* Persistent, not a dismissible toast. This is the one genuine integrity
          risk in the project and it belongs on the results page. */}
      <p className="mt-10 border-t border-border pt-5 text-xs leading-relaxed text-fg-muted">
        <strong className="font-semibold text-fg">
          This score is an estimate, not a Pearson VUE score.
        </strong>{" "}
        The real exam is equated with item-response-theory difficulty parameters
        we do not have, and its guide describes the blueprint weights as the
        proportion of <em>scored</em> items — implying unscored pretest items we
        cannot model, so we score all {attempt.total}. Our scale assumes the
        minimally qualified candidate answers 70% correctly and anchors the{" "}
        {EXAM.passScaled} cut there. A {attempt.scaled} here is not a{" "}
        {attempt.scaled} there. What it is good for is tracking your own
        trajectory across attempts.
      </p>
    </div>
  );
}
