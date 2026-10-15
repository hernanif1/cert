"use client";

import { useRef, useState } from "react";
import type { ChoiceId, Question, QuestionId } from "@/content/schema";
import {
  QuestionCard,
  isAnswerComplete,
  isAnswerCorrect,
} from "@/components/question/QuestionCard";
import { recordAnswer } from "@/lib/drill/record";
import type { GradeResult } from "@/lib/drill/leitner";
import { cn } from "@/lib/cn";
import { useDict } from "@/lib/i18n/client";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";
import { SubHeading } from "@/components/content/SectionHeading";

/**
 * The lesson-page consumer of QuestionCard: one item per concept the lesson
 * teaches, walked through in order. Owns its selection in local state —
 * nothing here needs to survive a refresh.
 *
 * Answering DOES advance each question's Leitner card: reading a lesson seeds
 * your drill deck, so the first drill session is not cold.
 *
 * Deliberately has NO keyboard shortcuts, unlike DrillRunner. This lives
 * halfway down a page someone is reading, where capturing Space would take
 * away scrolling.
 */
export function PracticeScenario({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ChoiceId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [log, setLog] = useState<{ id: QuestionId; correct: boolean }[]>([]);
  const t = useDict().practice;

  /**
   * One Leitner write per question per mount. Without this, "Start over" would
   * re-grade cards the reader has already answered and skew the schedule for
   * questions they simply wanted to re-read.
   */
  const recorded = useRef(new Set<QuestionId>());

  const question = questions[index];
  const done = index >= questions.length;
  const right = log.filter((l) => l.correct).length;

  const when = (days: number) =>
    days <= 0 ? t.interval.again : days === 1 ? t.interval.tomorrow : t.interval.inDays(days);

  function check() {
    if (!question || !isAnswerComplete(question, selected)) return;
    const correct = isAnswerCorrect(question, selected);
    setRevealed(true);
    if (!recorded.current.has(question.id)) {
      recorded.current.add(question.id);
      setResult(recordAnswer(question.id, correct));
    }
    setLog((prev) => [
      ...prev.filter((l) => l.id !== question.id),
      { id: question.id, correct },
    ]);
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
    setResult(null);
  }

  function restart() {
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setResult(null);
    setLog([]);
  }

  return (
    <section className="mt-14">
      <SubHeading className="mt-0 flex items-center gap-2.5">
        <Icon name="target" size={20} className="text-domain" />
        {t.title}
      </SubHeading>
      {t.englishNote && (
        <p className="mt-1 text-[0.8125rem] text-fg-muted">{t.englishNote}</p>
      )}

      {done ? (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <p className="tnum font-display text-2xl">
            {t.score(right, questions.length)}
            {questions.length > 0 &&
              ` · ${Math.round((right / questions.length) * 100)}%`}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium transition-colors hover:border-accent"
            >
              {t.restart}
            </button>
            <LocaleLink
              href="/learn/drill"
              className="link inline-flex items-center gap-1 text-xs"
            >
              {t.drillDomain}
              <Icon name="arrow-right" size={13} />
            </LocaleLink>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <QuestionCard
            question={question}
            selected={selected}
            onSelect={setSelected}
            revealed={revealed}
            index={index}
            total={questions.length}
            footer={
              revealed ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
                  >
                    {index === questions.length - 1 ? t.seeResult : t.next}
                  </button>
                  {result && (
                    <p className="tnum text-xs text-fg-muted">
                      {t.boxMove(result.fromBox, result.toBox, when(result.intervalDays))}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={check}
                  disabled={!isAnswerComplete(question, selected)}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.check}
                </button>
              )
            }
          />
        </div>
      )}

      {/* Indicator only: an answered dot is not a way back, so a reader cannot
          skip ahead to an item they have not attempted. Wraps at 390px. */}
      <ol
        aria-label={t.progressAria}
        className="mt-4 flex flex-wrap items-center gap-1.5"
      >
        {questions.map((q, i) => {
          const entry = log.find((l) => l.id === q.id);
          const state = entry
            ? entry.correct
              ? "correct"
              : "incorrect"
            : "pending";
          return (
            <li
              key={q.id}
              aria-label={t.questionState(i + 1, t.state[state])}
              className={cn(
                "size-2 rounded-full transition-colors",
                state === "correct" && "bg-success",
                state === "incorrect" && "bg-danger",
                state === "pending" && (i === index ? "bg-domain" : "bg-border"),
              )}
            />
          );
        })}
      </ol>
    </section>
  );
}
