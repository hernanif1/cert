"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "@/content/questions";
import type { ChoiceId, DomainNumber, Question, QuestionId } from "@/content/schema";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { recordAnswer, restoreCard, setBookmarked, setSuspended } from "@/lib/drill/record";
import type { CardState } from "@/lib/storage/schema";
import { grade, newCard, type Ease } from "@/lib/drill/leitner";
import {
  buildSession,
  queueStats,
  DEFAULT_FILTERS,
  type DrillFilters,
  type DrillMode,
} from "@/lib/drill/queue";
import { domainsFor, getLessonByObjectiveFor } from "@/lib/curriculum";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import {
  QuestionCard,
  isAnswerComplete,
  isAnswerCorrect,
} from "@/components/question/QuestionCard";
import { cn } from "@/lib/cn";
import { ShortcutOverlay } from "@/components/drill/ShortcutOverlay";
import { Icon } from "@/components/ui/Icon";
import { EXAM } from "@/content/exam-facts";
import { QuestionTimer, format as formatPace } from "@/components/drill/QuestionTimer";

/** The real exam's per-item budget: 120 minutes over 63 items ≈ 1:54. */
const PACE_MS = Math.round((EXAM.minutes * 60_000) / EXAM.itemCount);

const EASES: Ease[] = ["easy", "medium", "hard"];

const MODE_IDS: DrillMode[] = ["due", "mixed", "new", "weak", "leeches", "bookmarked", "cram"];

interface SessionLog {
  questionId: string;
  correct: boolean;
  domain: DomainNumber;
}

export function DrillRunner() {
  const hydrated = useHydrated();
  const state = useAppState();
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.drill;

  const [filters, setFilters] = useState<DrillFilters>(DEFAULT_FILTERS);
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ChoiceId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState<SessionLog[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  /* Session-scoped review flags. Bookmarks persist across sessions; a flag
     only says "come back to this one before I leave", so it lives here. */
  const [flagged, setFlagged] = useState<QuestionId[]>([]);
  /* A review pass is a sub-session over the flagged items. The main queue
     and cursor are stashed and restored when the pass ends. */
  const [stash, setStash] = useState<{ queue: Question[]; index: number } | null>(null);
  const [reviewLog, setReviewLog] = useState<SessionLog[]>([]);
  const reviewing = stash !== null;
  /* Per-item pacing clock. Restarts on every new card, freezes on check. */
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  /* Session clock: the per-item budget times the session size, never paused —
     the real exam clock does not stop while you read an explanation. */
  const [sessionStartedAt, setSessionStartedAt] = useState(() => Date.now());
  /* What the last rating did, shown above the next card. A retirement keeps
     the pre-answer card so one mis-press is reversible. */
  const [notice, setNotice] = useState<
    | { kind: "retired"; id: QuestionId; objective: string; prev: CardState }
    | { kind: "leech"; objective: string }
    | { kind: "suspended" }
    | null
  >(null);

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
    setLog([]);
    setNotice(null);
    setFlagged([]);
    setStash(null);
    setReviewLog([]);
    setStartedAt(Date.now());
    setStoppedAt(null);
    setSessionStartedAt(Date.now());
  }, [state, filters]);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
    setStartedAt(Date.now());
    setStoppedAt(null);
  }, []);

  /* Checking only reveals. Nothing is recorded until the learner rates the
     card, because the rating decides where it goes. */
  const check = useCallback(() => {
    if (!question || revealed || !isAnswerComplete(question, selected)) return;
    setRevealed(true);
    setStoppedAt(Date.now());
  }, [question, revealed, selected]);

  const rate = useCallback(
    (ease: Ease) => {
      if (!question || !revealed) return;
      const correct = isAnswerCorrect(question, selected);
      const prev = state.drill.cards[question.id] ?? newCard();
      // A review pass re-asks a card already graded this session; like cram it
      // must not move the schedule a second time.
      const graded = recordAnswer(question.id, correct, { cram: isCram || reviewing, ease });
      const entry = { questionId: question.id, correct, domain: question.domain };
      if (reviewing) setReviewLog((l) => [...l, entry]);
      else setLog((l) => [...l, entry]);
      setNotice(
        graded.retired
          ? { kind: "retired", id: question.id, objective: question.objective, prev }
          : graded.becameSuspended
            ? { kind: "suspended" }
            : graded.becameLeech
              ? { kind: "leech", objective: question.objective }
              : null,
      );
      next();
    },
    [question, revealed, selected, isCram, reviewing, state.drill.cards, next],
  );

  /* One flag, two lifetimes: it persists on the card (`bm`, the "Flagged"
     drill mode) and is also tracked for this session's review pass. */
  const toggleFlag = useCallback(
    (id: QuestionId) => {
      const on = !state.drill.cards[id]?.bm;
      setBookmarked(id, on);
      setFlagged((f) =>
        on ? (f.includes(id) ? f : [...f, id]) : f.filter((x) => x !== id),
      );
    },
    [state.drill.cards],
  );

  const startReview = useCallback(() => {
    if (!queue || reviewing || flagged.length === 0) return;
    const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
    const items = flagged.map((id) => byId.get(id)).filter((q): q is Question => !!q);
    if (items.length === 0) return;
    setStash({ queue, index });
    setQueue(items);
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setReviewLog([]);
    setStartedAt(Date.now());
    setStoppedAt(null);
  }, [queue, index, reviewing, flagged]);

  const endReview = useCallback(() => {
    if (!stash) return;
    setQueue(stash.queue);
    setIndex(stash.index);
    setStash(null);
    setSelected([]);
    setRevealed(false);
    setStartedAt(Date.now());
    setStoppedAt(null);
  }, [stash]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!question) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const key = e.key.toLowerCase();
      if (e.key === "Enter" || e.key === " ") {
        if (revealed) rate("medium");
        else check();
      } else if (key === "e" && revealed) {
        rate("easy");
      } else if (key === "h" && revealed) {
        rate("hard");
      } else if (e.key === "Backspace") {
        if (!revealed) setSelected([]);
      } else if (key === "f") {
        toggleFlag(question.id);
      } else if (key === "r") {
        startReview();
      } else if (key === "s") {
        setSuspended(question.id, true);
        next();
      } else if (e.key === "?") {
        setShowShortcuts((v) => !v);
      } else if (key === "escape") {
        if (showShortcuts) setShowShortcuts(false);
        else setIndex(queue?.length ?? 0);
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
    [question, revealed, check, rate, next, toggleFlag, startReview, queue, showShortcuts],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const MODES = MODE_IDS.map((id) => ({ id, label: t.modes[id][0], hint: t.modes[id][1] }));
  const when = (days: number) =>
    days <= 0
      ? dict.practice.interval.again
      : days === 1
        ? dict.practice.interval.tomorrow
        : dict.practice.interval.inDays(days);

  if (!hydrated) return <p className="text-sm text-fg-muted">{t.loading}</p>;

  if (QUESTIONS.length === 0) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">{t.title}</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-border p-5 text-sm text-fg-muted">
          {t.bankPending}
        </p>
      </div>
    );
  }

  const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
  const flaggedQuestions = flagged
    .map((id) => byId.get(id))
    .filter((q): q is Question => !!q);

  const flaggedList = flaggedQuestions.length > 0 && (
    <section className="mt-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        {t.flaggedTitle(flaggedQuestions.length)}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {flaggedQuestions.map((q) => {
          const l = getLessonByObjectiveFor(q.objective, locale);
          return (
            <li key={q.id} className="flex items-baseline gap-3">
              <span className="tnum shrink-0 text-xs text-fg-muted">{l?.id ?? q.objective}</span>
              <span className="min-w-0 flex-1 truncate" lang="en">{q.stem}</span>
              {l && (
                <Link href={l.href} className="shrink-0 text-xs underline underline-offset-2 hover:text-fg">
                  {t.lesson(l.id)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {!reviewing && (
        <button
          type="button"
          onClick={startReview}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-warning/50 bg-warning/10 px-4 py-2 text-sm font-medium text-warning hover:border-warning"
        >
          <Icon name="flag" size={13} />
          {t.reviewFlagged(flaggedQuestions.length)}
        </button>
      )}
    </section>
  );

  /* Review pass finished: hand back to wherever the main session was. */
  if (queue && stash && index >= queue.length) {
    const right = reviewLog.filter((l) => l.correct).length;
    const mainRemaining = stash.index < stash.queue.length;
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">{t.reviewComplete}</h1>
        <p className="tnum mt-3 text-lg">{t.reviewScore(right, reviewLog.length)}</p>
        <p className="mt-2 text-sm text-fg-muted">{t.reviewNote}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={endReview}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            {mainRemaining ? t.resumeSession : t.backToSummary}
          </button>
        </div>
        {flaggedList}
      </div>
    );
  }

  /* Session finished */
  if (queue && index >= queue.length) {
    const right = log.filter((l) => l.correct).length;
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">{t.complete}</h1>
        <p className="tnum mt-3 text-lg">
          {t.score(right, log.length)}
          {log.length > 0 && ` · ${Math.round((right / log.length) * 100)}%`}
        </p>
        {isCram && (
          <p className="mt-2 text-sm text-fg-muted">
            {t.cramNote}
          </p>
        )}
        <p className="tnum mt-4 text-sm text-fg-muted">
          {t.dueTomorrow(queueStats(state, { ...filters, mode: "due" }).due)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            {t.another}
          </button>
          <button
            type="button"
            onClick={() => setQueue(null)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            {t.changeFilters}
          </button>
          <Link
            href="/learn/progress"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            {t.progress}
          </Link>
        </div>
        {flaggedList}
      </div>
    );
  }

  /* Setup screen */
  if (!queue) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">{dict.tools.eyebrowTools}</p>
        <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
          {t.title}
        </h1>
        <p className="mt-5 text-reading text-fg-muted">
          {t.intro}
        </p>

        <dl className="tnum mt-6 flex flex-wrap gap-x-10 gap-y-3">
          {[
            [t.stats.due, stats?.due ?? 0],
            [t.stats.fresh, stats?.newCards ?? 0],
            [t.stats.leeches, stats?.leeches ?? 0],
            [t.stats.pool, stats?.available ?? 0],
            ...((stats?.retired ?? 0) > 0 ? [[t.stats.retired, stats?.retired ?? 0]] : []),
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt className="text-[11px] uppercase tracking-wide text-fg-muted">{k}</dt>
              <dd className="font-display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <fieldset className="mt-8">
          <legend className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
            {t.mode}
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
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
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
            {t.domains}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, domains: [] }))}
              aria-pressed={filters.domains.length === 0}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.domains.length === 0
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-fg-muted hover:border-accent",
              )}
            >
              {t.all}
            </button>
            {domainsFor(locale).map((d) => {
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
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
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
          className="mt-8 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          {t.start}
        </button>
        <p className="mt-3 text-xs text-fg-muted">
          {t.keys}
        </p>
      </div>
    );
  }

  if (!question || !card) return null;

  const lesson = getLessonByObjectiveFor(question.objective, locale);
  const right = log.filter((l) => l.correct).length;
  // A review pass swaps the queue; the session budget stays the main one.
  const sessionSize = (stash?.queue ?? queue).length;
  /* Pure preview of each rating's effect, so the choice is informed. */
  const previewFor = (ease: Ease) => {
    const r = grade(card, isAnswerCorrect(question, selected), { ease });
    if (r.retired) return t.retiredPreview;
    return dict.practice.boxMove(r.fromBox, r.toBox, when(r.intervalDays));
  };

  /* Lives beside the action button rather than in the header: it is the
     clock for *this* answer, and it freezes where the eye already is. */
  const itemClock = (
    <span className="inline-flex items-baseline gap-1.5 text-xs text-fg-muted">
      <span className="text-[10px] uppercase tracking-wide">{t.itemClock}</span>
      <QuestionTimer
        startedAt={startedAt}
        stoppedAt={stoppedAt}
        budgetMs={PACE_MS}
        title={t.paceHint(formatPace(PACE_MS))}
      />
    </span>
  );

  return (
    <div className="max-w-2xl">
      <div className="tnum mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border pb-3 text-xs text-fg-muted">
        <span>
          {index + 1}/{queue.length}
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-[10px] uppercase tracking-wide">{t.totalClock}</span>
          <QuestionTimer
            startedAt={sessionStartedAt}
            stoppedAt={null}
            budgetMs={PACE_MS * sessionSize}
            title={t.totalHint(formatPace(PACE_MS * sessionSize), sessionSize)}
          />
        </span>
        {log.length > 0 && <span>{Math.round((right / log.length) * 100)}%</span>}
        <span>{t.box(card.b)}</span>
        {card.fl === 1 && <span className="text-danger">{t.leech}</span>}
        {isCram && <span className="text-warning">{t.cramBadge}</span>}
        {reviewing ? (
          <span className="inline-flex items-center gap-1 text-warning">
            <Icon name="flag" size={11} />
            {t.reviewing}
          </span>
        ) : (
          flagged.length > 0 && (
            <button
              type="button"
              onClick={startReview}
              className="inline-flex items-center gap-1 text-warning underline underline-offset-2 hover:text-fg"
            >
              <Icon name="flag" size={11} />
              {t.reviewFlagged(flagged.length)}
            </button>
          )
        )}
        {/* Quiet icon buttons: the labels live in title/aria so the bar stays
            out of the way of the question. */}
        <button
          type="button"
          onClick={() => setShowShortcuts(true)}
          aria-label={t.shortcuts}
          title={`${t.shortcuts} (?)`}
          className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-fg-muted/70 transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="keyboard" size={15} />
        </button>
        <button
          type="button"
          onClick={() => setIndex(queue.length)}
          aria-label={t.end}
          title={`${t.end} (Esc)`}
          className="inline-flex size-7 items-center justify-center rounded-md text-fg-muted/70 transition-colors hover:bg-surface-2 hover:text-danger"
        >
          <Icon name="x" size={15} />
        </button>
      </div>

      <ShortcutOverlay
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {notice && (
        <p
          role="status"
          className={cn(
            "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs",
            notice.kind === "retired"
              ? "border-success/40 bg-success-soft"
              : "border-danger/40 bg-danger-soft",
          )}
        >
          {notice.kind === "retired" && (
            <>
              <span>{t.retiredNotice(notice.objective)}</span>
              <button
                type="button"
                onClick={() => {
                  restoreCard(notice.id, notice.prev);
                  setNotice(null);
                }}
                className="font-medium underline underline-offset-2 hover:text-fg"
              >
                {t.undo}
              </button>
            </>
          )}
          {notice.kind === "leech" && (() => {
            // Four lapses is a comprehension gap, not a memory one — send
            // them back to the lesson rather than re-showing the card.
            const l = getLessonByObjectiveFor(notice.objective as Question["objective"], locale);
            return (
              <span>
                {t.leechAdvice}{" "}
                {l && (
                  <Link href={l.href} className="font-medium underline underline-offset-2">
                    {t.reread(l.id)} →
                  </Link>
                )}
              </span>
            );
          })()}
          {notice.kind === "suspended" && <span>{t.becameSuspended}</span>}
        </p>
      )}

      {/* Where this item sits in the blueprint: domain, then objective in the
          exam guide's own wording, linking to the lesson that teaches it. */}
      {lesson && (
        <Link
          href={lesson.href}
          title={t.lesson(lesson.id)}
          className="group mb-4 block rounded-lg transition-colors hover:text-fg"
        >
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-fg-muted">
            <span className="rounded-md border border-border px-1.5 py-0.5 font-medium text-fg">
              {lesson.domainCode}
            </span>
            <span>{lesson.domainTitle}</span>
          </p>
          <p className="mt-1.5 flex items-baseline gap-2 text-sm leading-snug">
            <span className="tnum shrink-0 font-display text-base text-accent">{lesson.id}</span>
            <span className="min-w-0 text-fg decoration-border underline-offset-4 group-hover:underline">
              {lesson.text}
            </span>
            <Icon
              name="arrow-right"
              size={13}
              className="shrink-0 self-center text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </p>
        </Link>
      )}

      <QuestionCard
        question={question}
        selected={selected}
        onSelect={setSelected}
        revealed={revealed}
        flagged={card.bm === 1}
        onToggleFlag={() => toggleFlag(question.id)}
        footer={
          revealed ? (
            <div className="flex flex-col items-center gap-3">
              <div
                role="group"
                aria-label={t.ratePrompt}
                className="inline-flex overflow-hidden rounded-lg border border-border"
              >
                {EASES.map((ease, i) => (
                  <button
                    key={ease}
                    type="button"
                    onClick={() => rate(ease)}
                    title={t.easeHint[ease]}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors hover:bg-accent-soft hover:text-accent",
                      i > 0 && "border-l border-border",
                    )}
                  >
                    {t.ease[ease]}
                  </button>
                ))}
              </div>
              {!isCram && !reviewing && (
                <p className="tnum text-center text-[11px] leading-relaxed text-fg-muted">
                  {isAnswerCorrect(question, selected)
                    ? EASES.map((ease) => `${t.ease[ease]}: ${previewFor(ease)}`).join(" · ")
                    : `${t.wrongPreview} ${previewFor("medium")}`}
                </p>
              )}
              {itemClock}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {lesson && (
                  <Link
                    href={lesson.href}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:border-accent"
                  >
                    {t.lesson(lesson.id)}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSuspended(question.id, true);
                    next();
                  }}
                  className="rounded-lg px-3 py-2 text-xs text-fg-muted hover:text-danger"
                >
                  {t.suspend}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={check}
                disabled={!isAnswerComplete(question, selected)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {dict.practice.check}
              </button>
              {itemClock}
            </div>
          )
        }
      />
    </div>
  );
}
