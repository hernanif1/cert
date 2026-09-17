"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChoiceId, Question } from "@/content/schema";
import {
  QuestionCard,
  isAnswerComplete,
  isAnswerCorrect,
} from "@/components/question/QuestionCard";
import { recordAnswer } from "@/lib/drill/record";
import { describeInterval, type GradeResult } from "@/lib/drill/leitner";

/**
 * The lesson-page consumer of QuestionCard. Owns its selection in local state —
 * nothing here needs to survive a refresh.
 *
 * Answering DOES advance the question's Leitner card: reading a lesson seeds
 * your drill deck, so the first drill session is not cold.
 */
export function PracticeScenario({ question }: { question: Question }) {
  const [selected, setSelected] = useState<ChoiceId[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);

  function check() {
    if (!isAnswerComplete(question, selected)) return;
    setRevealed(true);
    setResult(recordAnswer(question.id, isAnswerCorrect(question, selected)));
  }

  function retry() {
    setSelected([]);
    setRevealed(false);
    setResult(null);
  }

  return (
    <section className="my-8">
      <h3 className="font-display text-xl">Practice Scenario</h3>
      <div className="mt-3">
        <QuestionCard
          question={question}
          selected={selected}
          onSelect={setSelected}
          revealed={revealed}
          footer={
            revealed ? (
              <div className="flex flex-wrap items-center gap-3">
                {result && (
                  <p className="tnum text-xs text-fg-muted">
                    Box {result.fromBox} → {result.toBox} · next review{" "}
                    {describeInterval(result.intervalDays)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
                >
                  Try again
                </button>
                <Link
                  href="/learn/drill"
                  className="text-xs text-accent underline underline-offset-2"
                >
                  Drill this domain →
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={check}
                disabled={!isAnswerComplete(question, selected)}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check answer
              </button>
            )
          }
        />
      </div>
    </section>
  );
}
