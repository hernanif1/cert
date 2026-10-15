"use client";

import { EXAM } from "@/content/exam-facts";
import { drillPool, drillPoolByDomain } from "@/content/questions";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { useOverallProgress } from "@/lib/storage/hooks";
import { computeReadiness } from "@/lib/exam/readiness";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { StatTile } from "@/components/progress/StatTile";
import { DataControls } from "@/components/progress/DataControls";
import { domainsFor, weightPercent } from "@/lib/curriculum";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";

const MASTERY_BOX = 4;

function Skeleton({ className }: { className: string }) {
  return <span className={`inline-block animate-pulse rounded bg-surface-2 ${className}`} />;
}

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const state = useAppState();
  const overall = useOverallProgress();
  const readiness = computeReadiness(state);
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.progress;

  const cards = Object.values(state.drill.cards);
  const pool = drillPool();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const seen = cards.filter((c) => c.r > 0).length;
  const mastered = cards.filter(
    (c) => c.b >= MASTERY_BOX && !c.fl && !c.sp,
  ).length;
  const dueToday = cards.filter(
    (c) => !c.sp && c.due <= endOfDay.getTime(),
  ).length;
  const leeches = cards.filter((c) => c.fl && !c.sp).length;

  const best = state.examHistory.reduce<number | null>(
    (a, b) => (a === null || b.scaled > a ? b.scaled : a),
    null,
  );

  const components = [
    { label: t.lessons, c: readiness.lessons },
    { label: t.drill, c: readiness.drill },
    { label: t.mock, c: readiness.mock },
  ];

  return (
    <main>
      <p className="text-sm font-medium text-accent">{dict.tools.eyebrowTools}</p>
      <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
        {t.title}
      </h1>

      {/* Readiness */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <ProgressRing
              value={hydrated ? readiness.score : 0}
              size={104}
              stroke={7}
              label={t.readinessAria(readiness.score)}
            />
            <span className="tnum absolute inset-0 flex items-center justify-center font-display text-3xl">
              {hydrated ? readiness.score : "—"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-fg-muted">
              {t.readiness}
            </p>
            <p className="font-display text-2xl">
              {hydrated ? t.labels[readiness.label] : <Skeleton className="h-7 w-48 align-middle" />}
            </p>
            <p className="tnum mt-1 text-sm text-fg-muted">
              {hydrated ? (
                <>
                  {t.lessons} {readiness.lessons.earned}/{readiness.lessons.max} ·{" "}
                  {t.drill} {readiness.drill.earned}/{readiness.drill.max} ·{" "}
                  {t.mock} {readiness.mock.earned}/{readiness.mock.max}
                </>
              ) : (
                <Skeleton className="h-4 w-64 align-middle" />
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {components.map(({ label, c }) => (
            <div key={label}>
              <div className="tnum mb-1 flex justify-between text-xs">
                <span className="font-medium">{label}</span>
                <span className="text-fg-muted">
                  {hydrated ? `${c.earned} / ${c.max}` : "—"}
                </span>
              </div>
              <ProgressBar value={hydrated ? c.pct : 0} label={t.component(label)} />
            </div>
          ))}
        </div>

        {hydrated && readiness.gate && (
          <p className="mt-5 rounded-md border-l-2 border-warning/50 bg-warning/[0.07] px-4 py-3 text-sm leading-relaxed">
            {t.gate(readiness.gate)}
          </p>
        )}

        {hydrated && readiness.mockLocked && (
          <p className="mt-5 rounded-md border-l-2 border-accent/40 bg-accent-soft px-4 py-3 text-sm leading-relaxed">
            {t.unlock(readiness.mock.max)}{" "}
            <Link href="/mock-exam" className="link inline-flex items-center gap-1 font-medium">
              {t.startOne}
              <Icon name="arrow-right" size={13} />
            </Link>
          </p>
        )}
      </section>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
        <StatTile
          label={t.lessons}
          value={hydrated ? `${overall.done}/${overall.total}` : "—"}
          hint={hydrated ? t.pctComplete(overall.pct) : undefined}
          busy={!hydrated}
        />
        <StatTile
          label={t.mockAttempts}
          value={hydrated ? state.examHistory.length : "—"}
          hint={best !== null ? t.best(best) : t.passAt(EXAM.passScaled)}
          busy={!hydrated}
        />
        <StatTile
          label={t.drillSeen}
          value={hydrated ? `${seen}/${pool.length}` : "—"}
          busy={!hydrated}
        />
        <StatTile
          label={t.dayStreak}
          value={hydrated ? state.drill.streak.current : "—"}
          hint={
            hydrated && state.drill.streak.longest > 0
              ? t.longest(state.drill.streak.longest)
              : undefined
          }
          busy={!hydrated}
        />
      </div>

      {/* Drill summary */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg">{t.drill}</h2>
          <Link
            href="/learn/drill"
            className="link inline-flex items-center gap-1 text-sm"
          >
            {t.openDrill}
            <Icon name="arrow-right" size={13} />
          </Link>
        </div>
        <dl className="tnum mt-3 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">{t.seen}</dt>
            <dd className="font-display text-xl">{hydrated ? seen : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">{t.mastered}</dt>
            <dd className="font-display text-xl">{hydrated ? mastered : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">{t.dueToday}</dt>
            <dd className="font-display text-xl">{hydrated ? dueToday : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">{t.leeches}</dt>
            <dd className="font-display text-xl">{hydrated ? leeches : "—"}</dd>
          </div>
        </dl>
        {pool.length === 0 && (
          <p className="mt-3 text-xs text-fg-muted">
            {t.bankPending}
          </p>
        )}
      </section>

      {/* Per-domain */}
      <section className="mt-6">
        <h2 className="font-display text-lg">{t.byDomain}</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {domainsFor(locale).map((d) => {
            const slugs = d.objectives.map((o) => o.slug);
            const done = slugs.filter((s) => state.lessons[s]?.completedAt).length;
            const pct = Math.round((done / slugs.length) * 100);
            const dPool = drillPoolByDomain(d.id);
            const dMastered = dPool.filter((q) => {
              const c = state.drill.cards[q.id];
              return c && c.b >= MASTERY_BOX && !c.fl && !c.sp;
            }).length;

            return (
              <li key={d.slug} data-domain={d.id} className="flex items-center gap-4 py-3">
                <ProgressRing
                  value={hydrated ? pct : 0}
                  size={34}
                  label={t.domainAria(d.title, pct)}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/learn/${d.slug}`}
                    className="text-sm font-medium transition-colors hover:text-domain"
                  >
                    <span className="tnum mr-1.5 text-domain">{d.code}</span>
                    {d.title}
                  </Link>
                  <p className="tnum mt-0.5 text-xs text-fg-muted">
                    {t.domainLine(hydrated ? String(done) : "—", slugs.length, weightPercent(d.weight))}
                    {dPool.length > 0 &&
                      ` · ${t.drillMastered(hydrated ? String(dMastered) : "—", dPool.length)}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <DataControls />

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-fg-muted">
        {t.footnote(readiness.lessons.max, readiness.drill.max, readiness.mock.max, overall.total)}
      </p>
    </main>
  );
}
