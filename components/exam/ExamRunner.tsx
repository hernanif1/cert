"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXAM } from "@/content/exam-facts";
import { getQuestion, QUESTIONS } from "@/content/questions";
import type { ChoiceId, Question } from "@/content/schema";
import { useAppState, useHydrated } from "@/lib/storage/store";
import {
  abandonAttempt,
  answer,
  answeredCount,
  goTo,
  startAttempt,
  submitAttempt,
  toggleFlag,
  useActiveAttempt,
  useAttemptLoaded,
} from "@/lib/exam/attempt";
import { previouslySeenCount } from "@/lib/exam/sampler";
import { QuestionCard } from "@/components/question/QuestionCard";
import { ExamTimer } from "@/components/exam/ExamTimer";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";

export function ExamRunner() {
  const router = useRouter();
  const hydrated = useHydrated();
  const loaded = useAttemptLoaded();
  const state = useAppState();
  const attempt = useActiveAttempt();
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const finish = useCallback(
    (timedOut: boolean) => {
      const id = submitAttempt(timedOut);
      if (id) router.push(`/mock-exam/results/?a=${id}`);
    },
    [router],
  );

  // If the deadline has already passed when we mount — the tab was closed, the
  // laptop was shut — submit whatever was stored. Closing the lid is not a pause.
  useEffect(() => {
    if (attempt && Date.now() > attempt.deadlineAt) finish(true);
  }, [attempt, finish]);

  const question: Question | undefined = attempt
    ? getQuestion(attempt.questionIds[attempt.cursor] as Question["id"])
    : undefined;

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!attempt || !question) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;

      if (e.key === "ArrowRight") goTo(attempt.cursor + 1);
      else if (e.key === "ArrowLeft") goTo(attempt.cursor - 1);
      else if (e.key.toLowerCase() === "f") toggleFlag(question.id);
      else if (/^[1-6]$/.test(e.key)) {
        const choice = question.choices[Number(e.key) - 1];
        if (!choice) return;
        const current = attempt.answers[question.id] ?? [];
        if (question.type === "multi") {
          answer(
            question.id,
            current.includes(choice.id)
              ? current.filter((c) => c !== choice.id)
              : [...current, choice.id],
          );
        } else {
          answer(question.id, [choice.id]);
        }
      } else return;
      e.preventDefault();
    },
    [attempt, question],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!hydrated || !loaded) {
    return <p className="text-sm text-fg-muted">Loading…</p>;
  }

  /* No attempt in flight — start screen */
  if (!attempt) {
    const bankReady = QUESTIONS.length > 0;
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">Practice</p>
        <h1 className="mt-2 font-display text-4xl">Mock Exam</h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          {EXAM.itemCount} items, {EXAM.minutes} minutes, scored on an estimated{" "}
          {EXAM.scaleMin}–{EXAM.scaleMax} scale with the cut at {EXAM.passScaled}
          . The timer runs on wall-clock time: closing the tab does not pause it.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
          {[
            ["Items", EXAM.itemCount],
            ["Minutes", EXAM.minutes],
            ["Pass", EXAM.passScaled],
            ["Attempts", state.examHistory.length],
          ].map(([k, v]) => (
            <div key={String(k)} className="bg-surface px-4 py-4">
              <dt className="text-[11px] uppercase tracking-wide text-fg-muted">{k}</dt>
              <dd className="tnum mt-1 font-display text-2xl">{v}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => {
            if (!startAttempt(state)) return;
          }}
          disabled={!bankReady}
          className="mt-6 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          Start the exam
        </button>

        <BankWarning />

        {state.examHistory.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg">Past attempts</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {[...state.examHistory].reverse().map((a) => (
                <li key={a.id} className="flex items-center gap-4 py-3 text-sm">
                  <span
                    className={`tnum font-display text-xl ${a.passed ? "text-success" : "text-danger"}`}
                  >
                    {a.scaled}
                  </span>
                  <span className="tnum flex-1 text-fg-muted">
                    {a.raw}/{a.total} correct ·{" "}
                    {new Date(a.submittedAt).toLocaleDateString()}
                    {a.timedOut && " · timed out"}
                  </span>
                  <Link
                    href={`/mock-exam/results/?a=${a.id}`}
                    className="text-accent underline underline-offset-2"
                  >
                    Report
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  /* Attempt in flight but the user navigated here fresh — offer resume.
     Never resume silently: clicking "Take Mock Exam" and landing mid-exam is
     disorienting. */
  if (!question) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl">Attempt in progress</h1>
        <p className="mt-3 text-fg-muted">
          This attempt references questions that are no longer in the bank.
        </p>
        <button
          type="button"
          onClick={abandonAttempt}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm"
        >
          Discard it
        </button>
      </div>
    );
  }

  const answered = answeredCount(attempt);
  const unanswered = attempt.questionIds.length - answered;
  const selected = (attempt.answers[question.id] ?? []) as ChoiceId[];
  const seen = previouslySeenCount(attempt.questionIds, state);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <div className="mb-4 flex items-center gap-4 border-b border-border pb-3">
          <span className="text-[11px] uppercase tracking-wide text-fg-muted">
            Time remaining
          </span>
          <ExamTimer
            deadlineAt={attempt.deadlineAt}
            onExpire={() => finish(true)}
          />
          <span className="tnum ml-auto text-xs text-fg-muted">
            {answered}/{attempt.questionIds.length} answered
          </span>
        </div>

        <QuestionCard
          question={question}
          selected={selected}
          onSelect={(next) => answer(question.id, next)}
          // Never reveal during the exam.
          revealed={false}
          flagged={attempt.flagged.includes(question.id)}
          onToggleFlag={() => toggleFlag(question.id)}
          index={attempt.cursor}
          total={attempt.questionIds.length}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(attempt.cursor - 1)}
            disabled={attempt.cursor === 0}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => goTo(attempt.cursor + 1)}
            disabled={attempt.cursor === attempt.questionIds.length - 1}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next →
          </button>
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="ml-auto rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Submit exam
          </button>
        </div>

        <p className="mt-3 text-[11px] text-fg-muted">
          Keys: 1–6 select · ← → navigate · F flag
        </p>

        {confirmSubmit && (
          <div className="mt-4 rounded-card border border-border bg-surface p-4">
            <p className="text-sm font-medium">Submit for scoring?</p>
            <p className="tnum mt-1 text-sm text-fg-muted">
              {answered} answered · {unanswered} unanswered ·{" "}
              {attempt.flagged.length} flagged
            </p>
            {unanswered > 0 && (
              <p className="mt-2 text-sm text-danger">
                Unanswered items are scored as incorrect.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => finish(false)}
                className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="rounded-md border border-border px-4 py-1.5 text-sm"
              >
                Keep working
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <QuestionNavigator
          questionIds={attempt.questionIds}
          answers={attempt.answers}
          flagged={attempt.flagged}
          cursor={attempt.cursor}
          onJump={goTo}
        />
        <p className="mt-4 text-[11px] leading-relaxed text-fg-muted">
          {attempt.isFormA
            ? "Form A — none of these items appear in drill, so this is a clean reading."
            : `${seen} of ${attempt.questionIds.length} items you have seen before in drill.`}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Abandon this attempt? It will not be scored.")) {
              abandonAttempt();
            }
          }}
          className="mt-4 text-xs text-fg-muted underline underline-offset-2 hover:text-danger"
        >
          Abandon attempt
        </button>
      </aside>
    </div>
  );
}

function BankWarning() {
  if (QUESTIONS.length > 0) return null;
  return (
    <p className="mt-4 rounded-card border border-dashed border-border p-4 text-sm text-fg-muted">
      The question bank is still being authored, so an exam cannot be assembled
      yet.
    </p>
  );
}
