"use client";

import { useCallback, useEffect, useState } from "react";
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
import { useDict, useLocale } from "@/lib/i18n/client";
import { HTML_LANG, localizeHref } from "@/lib/i18n";
import { LocaleLink as Link } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";

export function ExamRunner() {
  const router = useRouter();
  const hydrated = useHydrated();
  const loaded = useAttemptLoaded();
  const state = useAppState();
  const attempt = useActiveAttempt();
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.exam;

  const finish = useCallback(
    (timedOut: boolean) => {
      const id = submitAttempt(timedOut);
      if (id) router.push(localizeHref(`/mock-exam/results/?a=${id}`, locale));
    },
    [router, locale],
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
    return <p className="text-sm text-fg-muted">{dict.tools.loading}</p>;
  }

  /* No attempt in flight — start screen */
  if (!attempt) {
    const bankReady = QUESTIONS.length > 0;
    return (
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-accent">{dict.tools.eyebrowPractice}</p>
        <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
          {t.title}
        </h1>
        <p className="mt-5 text-reading text-fg-muted">
          {t.intro(EXAM.itemCount, EXAM.minutes, EXAM.scaleMin, EXAM.scaleMax, EXAM.passScaled)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          {[
            [t.facts.items, EXAM.itemCount],
            [t.facts.minutes, EXAM.minutes],
            [t.facts.pass, EXAM.passScaled],
            [t.facts.attempts, state.examHistory.length],
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
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          <Icon name="target" size={16} />
          {t.start}
        </button>

        <BankWarning />

        {state.examHistory.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-lg">{t.past}</h2>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {[...state.examHistory].reverse().map((a) => (
                <li key={a.id} className="flex items-center gap-4 py-3 text-sm">
                  <span
                    className={`tnum font-display text-xl ${a.passed ? "text-success" : "text-danger"}`}
                  >
                    {a.scaled}
                  </span>
                  <span className="tnum flex-1 text-fg-muted">
                    {t.correct(a.raw, a.total)} ·{" "}
                    {new Date(a.submittedAt).toLocaleDateString(HTML_LANG[locale])}
                    {a.timedOut && ` · ${t.timedOut}`}
                  </span>
                  <Link
                    href={`/mock-exam/results/?a=${a.id}`}
                    className="link"
                  >
                    {t.report}
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
        <h1 className="font-display text-3xl">{t.inProgress}</h1>
        <p className="mt-3 text-fg-muted">
          {t.orphaned}
        </p>
        <button
          type="button"
          onClick={abandonAttempt}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm"
        >
          {t.discard}
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
            {t.timeRemaining}
          </span>
          <ExamTimer
            deadlineAt={attempt.deadlineAt}
            onExpire={() => finish(true)}
          />
          <span className="tnum ml-auto text-xs text-fg-muted">
            {t.answered(answered, attempt.questionIds.length)}
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            <Icon name="arrow-left" size={14} />
            {t.previous}
          </button>
          <button
            type="button"
            onClick={() => goTo(attempt.cursor + 1)}
            disabled={attempt.cursor === attempt.questionIds.length - 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
          >
            {t.next}
            <Icon name="arrow-right" size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="ml-auto rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            {t.submitExam}
          </button>
        </div>

        <p className="mt-3 text-[11px] text-fg-muted">
          {t.keys}
        </p>

        {confirmSubmit && (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-medium">{t.submitQuestion}</p>
            <p className="tnum mt-1 text-sm text-fg-muted">
              {t.submitSummary(answered, unanswered, attempt.flagged.length)}
            </p>
            {unanswered > 0 && (
              <p className="mt-2 text-sm text-danger">
                {t.unansweredWarning}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => finish(false)}
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg"
              >
                {t.submit}
              </button>
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="rounded-lg border border-border px-4 py-1.5 text-sm"
              >
                {t.keepWorking}
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
            ? t.formA
            : t.seenBefore(seen, attempt.questionIds.length)}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm(t.abandonConfirm)) {
              abandonAttempt();
            }
          }}
          className="mt-4 text-xs text-fg-muted underline underline-offset-2 hover:text-danger"
        >
          {t.abandon}
        </button>
      </aside>
    </div>
  );
}

function BankWarning() {
  const t = useDict().tools.exam;
  if (QUESTIONS.length > 0) return null;
  return (
    <p className="mt-4 rounded-2xl border border-dashed border-border p-4 text-sm text-fg-muted">
      {t.bankPending}
    </p>
  );
}
