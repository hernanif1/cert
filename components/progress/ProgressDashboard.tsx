"use client";

import Link from "next/link";
import { DOMAINS } from "@/content/domains";
import { EXAM } from "@/content/exam-facts";
import { drillPool, drillPoolByDomain } from "@/content/questions";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { useOverallProgress } from "@/lib/storage/hooks";
import { computeReadiness } from "@/lib/exam/readiness";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { StatTile } from "@/components/progress/StatTile";
import { DataControls } from "@/components/progress/DataControls";
import { weightPercent } from "@/lib/curriculum";

const MASTERY_BOX = 4;

function Skeleton({ className }: { className: string }) {
  return <span className={`inline-block animate-pulse rounded bg-surface-2 ${className}`} />;
}

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const state = useAppState();
  const overall = useOverallProgress();
  const readiness = computeReadiness(state);

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
    { label: "Lessons", c: readiness.lessons },
    { label: "Drill", c: readiness.drill },
    { label: "Mock", c: readiness.mock },
  ];

  return (
    <main>
      <p className="text-sm font-medium text-accent">Study Tools</p>
      <h1 className="mt-2 font-display text-4xl">Progress Dashboard</h1>

      {/* Readiness */}
      <section className="mt-8 rounded-card border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <ProgressRing
              value={hydrated ? readiness.score : 0}
              size={104}
              stroke={7}
              label={`Exam readiness ${readiness.score} of 100`}
            />
            <span className="tnum absolute inset-0 flex items-center justify-center font-display text-3xl">
              {hydrated ? readiness.score : "—"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-fg-muted">
              Exam readiness
            </p>
            <p className="font-display text-2xl">
              {hydrated ? readiness.label : <Skeleton className="h-7 w-48 align-middle" />}
            </p>
            <p className="tnum mt-1 text-sm text-fg-muted">
              {hydrated ? (
                <>
                  Lessons {readiness.lessons.earned}/{readiness.lessons.max} ·
                  Drill {readiness.drill.earned}/{readiness.drill.max} · Mock{" "}
                  {readiness.mock.earned}/{readiness.mock.max}
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
              <ProgressBar value={hydrated ? c.pct : 0} label={`${label} component`} />
            </div>
          ))}
        </div>

        {hydrated && readiness.gateReason && (
          <p className="mt-5 rounded-md border-l-2 border-warning/50 bg-warning/[0.07] px-4 py-3 text-sm leading-relaxed">
            {readiness.gateReason}
          </p>
        )}

        {hydrated && readiness.mockLocked && (
          <p className="mt-5 rounded-md border-l-2 border-accent/40 bg-accent-soft px-4 py-3 text-sm leading-relaxed">
            Take a mock exam to unlock {readiness.mock.max} points.{" "}
            <Link href="/mock-exam" className="font-medium text-accent underline underline-offset-2">
              Start one →
            </Link>
          </p>
        )}
      </section>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
        <StatTile
          label="Lessons"
          value={hydrated ? `${overall.done}/${overall.total}` : "—"}
          hint={hydrated ? `${overall.pct}% complete` : undefined}
          busy={!hydrated}
        />
        <StatTile
          label="Mock attempts"
          value={hydrated ? state.examHistory.length : "—"}
          hint={best !== null ? `best ${best}` : `pass at ${EXAM.passScaled}`}
          busy={!hydrated}
        />
        <StatTile
          label="Drill seen"
          value={hydrated ? `${seen}/${pool.length}` : "—"}
          busy={!hydrated}
        />
        <StatTile
          label="Day streak"
          value={hydrated ? state.drill.streak.current : "—"}
          hint={
            hydrated && state.drill.streak.longest > 0
              ? `longest ${state.drill.streak.longest}`
              : undefined
          }
          busy={!hydrated}
        />
      </div>

      {/* Drill summary */}
      <section className="mt-6 rounded-card border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg">Drill</h2>
          <Link
            href="/learn/drill"
            className="text-sm text-accent underline underline-offset-2"
          >
            Open drill mode →
          </Link>
        </div>
        <dl className="tnum mt-3 flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">Seen</dt>
            <dd className="font-display text-xl">{hydrated ? seen : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">Mastered</dt>
            <dd className="font-display text-xl">{hydrated ? mastered : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">Due today</dt>
            <dd className="font-display text-xl">{hydrated ? dueToday : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-fg-muted">Leeches</dt>
            <dd className="font-display text-xl">{hydrated ? leeches : "—"}</dd>
          </div>
        </dl>
        {pool.length === 0 && (
          <p className="mt-3 text-xs text-fg-muted">
            The question bank is still being authored.
          </p>
        )}
      </section>

      {/* Per-domain */}
      <section className="mt-6">
        <h2 className="font-display text-lg">By domain</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {DOMAINS.map((d) => {
            const slugs = d.objectives.map((o) => o.slug);
            const done = slugs.filter((s) => state.lessons[s]?.completedAt).length;
            const pct = Math.round((done / slugs.length) * 100);
            const dPool = drillPoolByDomain(d.id);
            const dMastered = dPool.filter((q) => {
              const c = state.drill.cards[q.id];
              return c && c.b >= MASTERY_BOX && !c.fl && !c.sp;
            }).length;

            return (
              <li key={d.slug} className="flex items-center gap-4 py-3">
                <ProgressRing
                  value={hydrated ? pct : 0}
                  size={34}
                  label={`${d.title} ${pct}% of lessons complete`}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/learn/${d.slug}`}
                    className="text-sm font-medium transition-colors hover:text-accent"
                  >
                    {d.code} {d.title}
                  </Link>
                  <p className="tnum mt-0.5 text-xs text-fg-muted">
                    {hydrated ? `${done}/${slugs.length}` : `—/${slugs.length}`}{" "}
                    lessons · {weightPercent(d.weight)} of the exam
                    {dPool.length > 0 && (
                      <>
                        {" "}· {hydrated ? dMastered : "—"}/{dPool.length} drill
                        mastered
                      </>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <DataControls />

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-fg-muted">
        Readiness weights lessons at {readiness.lessons.max}, drill at{" "}
        {readiness.drill.max} and mock performance at {readiness.mock.max}. A
        lesson counts once it is marked complete and you have answered at least
        one question on its objective — clicking through {overall.total} lessons
        should not, on its own, say you are ready.
      </p>
    </main>
  );
}
