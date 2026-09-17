"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DOMAINS } from "@/content/domains";
import { QUESTIONS } from "@/content/questions";
import type { ChoiceId, DomainNumber, Question } from "@/content/schema";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { recordAnswer, setBookmarked, setSuspended } from "@/lib/drill/record";
import { describeInterval, newCard, type GradeResult } from "@/lib/drill/leitner";
import {
  buildSession,
  queueStats,
  DEFAULT_FILTERS,
  type DrillFilters,
  type DrillMode,
} from "@/lib/drill/queue";
import { getLessonByObjective } from "@/lib/curriculum";
import {
  QuestionCard,
  isAnswerComplete,
  isAnswerCorrect,
} from "@/components/question/QuestionCard";
import { cn } from "@/lib/cn";

const MODES: { id: DrillMode; label: string; hint: string }[] = [
  { id: "due", label: "Due", hint: "Cards scheduled for today" },
  { id: "mixed", label: "Mixed", hint: "Due cards plus new ones" },
  { id: "new", label: "New", hint: "Never answered" },
  { id: "weak", label: "Weak areas", hint: "Low accuracy or lapsing" },
  { id: "leeches", label: "Leeches", hint: "Four or more lapses" },
  { id: "bookmarked", label: "Bookmarked", hint: "Saved for later" },
  { id: "cram", label: "Cram", hint: "Ignores scheduling; records nothing" },
];

interface SessionLog {
  questionId: string;
  correct: boolean;
  domain: DomainNumber;
}

export function DrillRunner() {
  const hydrated = useHydrated();
  const state = useAppState();

  const [filters, setFilters] = useState<DrillFilters>(DEFAULT_FILTERS);
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ChoiceId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [log, setLog] = useState<SessionLog[]>([]);

  const stats = useMemo(
    () => (hydrated ? queueStats(state, filters) : null),
    [hydrated, state, filters],
  );

  const question = queue?.[index];
  const card = question ? (state.drill.cards[question.id] ?? newCard()) : null;
  const isCram = filters.mode === "cram";

  const start = useCallback(() => {
    const built = buildSession(state, filters);
    setQueue(built);
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setResult(null);
    setLog([]);
  }, [state, filters]);

  const check = useCallback(() => {
    if (!question || revealed || !isAnswerComplete(question, selected)) return;
    const correct = isAnswerCorrect(question, selected);
    setRevealed(true);
    setResult(recordAnswer(question.id, correct, { cram: isCram }));
    setLog((l) => [...l, { questionId: question.id, correct, domain: question.domain }]);
  }, [question, revealed, selected, isCram]);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
    setResult(null);
  }, []);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!question) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;

      const key = e.key.toLowerCase();
      if (e.key === "Enter" || e.key === " ") {
        if (revealed) next();
        else check();
      } else if (e.key === "Backspace") {
        if (!revealed) setSelected([]);
      } else if (key === "b") {
        setBookmarked(question.id, !state.drill.cards[question.id]?.bm);
      } else if (key === "s") {
        setSuspended(question.id, true);
        next();
      } else if (key === "escape") {
        setIndex(queue?.length ?? 0);
      } else if (/^[1-6]$/.test(e.key)) {
        if (revealed) return;
        const choice = question.choices[Number(e.key) - 1];
        if (!choice) return;
        setSelected((cur) =>
          question.type === "multi"
            ? cur.includes(choice.id)
              ? cur.filter((c) => c !== choice.id)
              : [...cur, choice.id]
            : [choice.id],
        );
      } else return;
      e.preventDefault();
    },
    [question, revealed, check, next, state.drill.cards, queue],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!hydrated) return <p className="text-sm text-fg-muted">Loading drill…</p>;

  if (QUESTIONS.length === 0) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">Drill Mode</h1>
        <p className="mt-4 rounded-card border border-dashed border-border p-5 text-sm text-fg-muted">
          The question bank is still being authored. Drill opens as soon as
          there are questions to schedule.
        </p>
      </div>
    );
  }

  /* Session finished */
  if (queue && index >= queue.length) {
    const right = log.filter((l) => l.correct).length;
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">Session complete</h1>
        <p className="tnum mt-3 text-lg">
          {right} of {log.length} correct
          {log.length > 0 && ` · ${Math.round((right / log.length) * 100)}%`}
        </p>
        {isCram && (
          <p className="mt-2 text-sm text-fg-muted">
            Cram session — your review schedule was left untouched.
          </p>
        )}
        <p className="tnum mt-4 text-sm text-fg-muted">
          Due tomorrow: {queueStats(state, { ...filters, mode: "due" }).due}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Another session
          </button>
          <button
            type="button"
            onClick={() => setQueue(null)}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            Change filters
          </button>
          <Link
            href="/learn/progress"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            Progress
          </Link>
        </div>
      </div>
    );
  }

  /* Setup screen */
  if (!queue) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">Study Tools</p>
        <h1 className="mt-2 font-display text-4xl">Drill Mode</h1>
        <p className="mt-3 leading-relaxed text-fg-muted">
          Spaced repetition over the question bank. Cards move up a box each time
          you get them right and drop two when you do not; box 4 counts as
          mastered.
        </p>

        <dl className="tnum mt-6 flex flex-wrap gap-x-10 gap-y-3">
          {[
            ["Due today", stats?.due ?? 0],
            ["New", stats?.newCards ?? 0],
            ["Leeches", stats?.leeches ?? 0],
            ["In pool", stats?.available ?? 0],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt className="text-[11px] uppercase tracking-wide text-fg-muted">{k}</dt>
              <dd className="font-display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <fieldset className="mt-8">
          <legend className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            Mode
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, mode: m.id }))}
                aria-pressed={filters.mode === m.id}
                title={m.hint}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  filters.mode === m.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-fg-muted hover:border-accent",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-muted">
            {MODES.find((m) => m.id === filters.mode)?.hint}
          </p>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            Domains
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, domains: [] }))}
              aria-pressed={filters.domains.length === 0}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.domains.length === 0
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-fg-muted hover:border-accent",
              )}
            >
              All
            </button>
            {DOMAINS.map((d) => {
              const on = filters.domains.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      domains: on
                        ? f.domains.filter((x) => x !== d.id)
                        : [...f.domains, d.id],
                    }))
                  }
                  aria-pressed={on}
                  title={d.title}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    on
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-fg-muted hover:border-accent",
                  )}
                >
                  {d.code}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={start}
          className="mt-8 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Start session
        </button>
        <p className="mt-3 text-xs text-fg-muted">
          Keys: 1–6 select · Enter check, then next · B bookmark · S suspend ·
          Esc end session
        </p>
      </div>
    );
  }

  if (!question || !card) return null;

  const lesson = getLessonByObjective(question.objective);
  const right = log.filter((l) => l.correct).length;

  return (
    <div className="max-w-2xl">
      <div className="tnum mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border pb-3 text-xs text-fg-muted">
        <span>
          {index + 1}/{queue.length}
        </span>
        {log.length > 0 && <span>{Math.round((right / log.length) * 100)}%</span>}
        <span>Box {card.b}</span>
        {card.fl === 1 && <span className="text-danger">leech</span>}
        {isCram && <span className="text-warning">cram — nothing recorded</span>}
        <button
          type="button"
          onClick={() => setIndex(queue.length)}
          className="ml-auto underline underline-offset-2 hover:text-fg"
        >
          End session
        </button>
      </div>

      <QuestionCard
        question={question}
        selected={selected}
        onSelect={setSelected}
        revealed={revealed}
        footer={
          revealed ? (
            <div className="space-y-3">
              {result && !isCram && (
                <p className="tnum text-xs text-fg-muted">
                  Box {result.fromBox} → {result.toBox} · next review{" "}
                  {describeInterval(result.intervalDays)}
                  {result.becameLeech && " · flagged as a leech"}
                  {result.becameSuspended && " · suspended"}
                </p>
              )}
              {/* Four lapses is a comprehension gap, not a memory one — send
                  them back to the lesson rather than re-showing the card. */}
              {result?.becameLeech && lesson && (
                <p className="rounded-md border-l-2 border-danger/50 bg-danger-soft px-3 py-2 text-xs leading-relaxed">
                  You have missed this four times. That is usually a gap in the
                  material rather than in memory —{" "}
                  <Link href={lesson.href} className="font-medium underline underline-offset-2">
                    re-read lesson {lesson.id} →
                  </Link>
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={next}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                >
                  Next
                </button>
                {lesson && (
                  <Link
                    href={lesson.href}
                    className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:border-accent"
                  >
                    Lesson {lesson.id}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setBookmarked(question.id, !card.bm)}
                  className="rounded-md border border-border px-3 py-2 text-xs font-medium hover:border-accent"
                >
                  {card.bm ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuspended(question.id, true);
                    next();
                  }}
                  className="rounded-md px-3 py-2 text-xs text-fg-muted hover:text-danger"
                >
                  Suspend
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={check}
              disabled={!isAnswerComplete(question, selected)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check answer
            </button>
          )
        }
      />
    </div>
  );
}
