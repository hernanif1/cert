"use client";

import type { ChoiceId, Question } from "@/content/schema";
import { correctIdsOf, selectCountOf } from "@/content/schema";
import { cn } from "@/lib/cn";
import { useDict } from "@/lib/i18n/client";
import { Icon } from "@/components/ui/Icon";

/**
 * One card, three consumers — lesson practice, drill, and the mock exam.
 *
 * It is FULLY CONTROLLED and holds no state of its own: it renders, it does not
 * decide. That is what makes the exam possible, where selections must survive
 * unmounting (navigate to Q40 and back) and a page refresh. A card owning
 * useState could not do that, and the three consumers would have to fork.
 *
 *   PracticeScenario  local useState          reveal after Submit
 *   DrillRunner       drill reducer           reveal after Submit, feeds Leitner
 *   ExamRunner        persisted attempt       never reveals until submission
 */

export interface QuestionCardProps {
  question: Question;
  /** Always an array, even for single-answer items. */
  selected: ChoiceId[];
  onSelect: (next: ChoiceId[]) => void;
  revealed: boolean;
  disabled?: boolean;
  flagged?: boolean;
  onToggleFlag?: () => void;
  index?: number;
  total?: number;
  /** Renders the stem as plain text; content is first-party markdown-lite. */
  footer?: React.ReactNode;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  revealed,
  disabled,
  flagged,
  onToggleFlag,
  index,
  total,
  footer,
}: QuestionCardProps) {
  const multi = question.type === "multi";
  const needed = selectCountOf(question);
  const correct = correctIdsOf(question);
  const t = useDict().question;

  function toggle(id: ChoiceId) {
    if (disabled || revealed) return;
    if (!multi) {
      onSelect([id]);
      return;
    }
    onSelect(
      selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id],
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {index !== undefined && total !== undefined && (
            <p className="tnum text-[11px] uppercase tracking-wide text-fg-muted">
              {t.counter(index + 1, total)}
            </p>
          )}
          {/* Items stay in English in every locale: the real exam is in English. */}
          <p className="mt-1 text-reading" lang="en">
            {question.stem}
          </p>
          {/* Generated from the answer key, so it can never desync from it. */}
          {multi && (
            <p className="mt-2 text-aux font-medium">
              {t.select(t.numberWord[needed] ?? String(needed))}
            </p>
          )}
        </div>
        {onToggleFlag && (
          <button
            type="button"
            onClick={onToggleFlag}
            aria-pressed={flagged}
            aria-label={flagged ? t.unflagAria : t.flagAria}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-colors",
              flagged
                ? "border-warning/50 bg-warning/10 text-warning"
                : "border-border text-fg-muted hover:border-accent",
            )}
          >
            <Icon name="flag" size={13} />
            {flagged ? t.flagged : t.flag}
          </button>
        )}
      </div>

      <ul
        className="mt-5 space-y-2.5"
        lang="en"
        role={multi ? "group" : "radiogroup"}
        aria-label={t.choices}
      >
        {question.choices.map((choice) => {
          const isSelected = selected.includes(choice.id);
          const isCorrect = correct.includes(choice.id);

          const state = !revealed
            ? "idle"
            : isCorrect && isSelected
              ? "correct-selected"
              : isCorrect
                ? "correct-missed"
                : isSelected
                  ? "incorrect-selected"
                  : "neutral";

          return (
            <li key={choice.id}>
              <button
                type="button"
                role={multi ? "checkbox" : "radio"}
                aria-checked={isSelected}
                disabled={disabled || revealed}
                onClick={() => toggle(choice.id)}
                className={cn(
                  "flex w-full gap-3 rounded-xl border p-3.5 text-left text-aux transition-colors",
                  state === "idle" &&
                    (isSelected
                      ? "border-accent bg-accent-soft"
                      : "border-border hover:border-accent/60"),
                  state === "correct-selected" &&
                    "border-success bg-success-soft",
                  state === "correct-missed" && "border-success/60",
                  state === "incorrect-selected" && "border-danger bg-danger-soft",
                  state === "neutral" && "border-border opacity-60",
                  (disabled || revealed) && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "tnum flex size-6 shrink-0 items-center justify-center rounded border text-xs font-medium",
                    isSelected || (revealed && isCorrect)
                      ? "border-current"
                      : "border-border text-fg-muted",
                    state === "correct-selected" || state === "correct-missed"
                      ? "text-success"
                      : state === "incorrect-selected"
                        ? "text-danger"
                        : isSelected
                          ? "text-accent"
                          : "",
                  )}
                  aria-hidden="true"
                >
                  {revealed && isCorrect ? (
                    <Icon name="check" size={13} strokeWidth={2.4} />
                  ) : revealed && isSelected ? (
                    <Icon name="x" size={13} strokeWidth={2.4} />
                  ) : (
                    choice.id
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block leading-relaxed">{choice.text}</span>

                  {/* Per-distractor rationale: only for wrong answers the user
                      actually picked, so the reveal explains their mistake
                      rather than dumping every rationale at once. */}
                  {revealed && state === "incorrect-selected" && choice.rationale && (
                    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-fg-muted">
                      {choice.rationale}
                    </span>
                  )}
                  {revealed && state === "correct-missed" && (
                    <span className="mt-1.5 block text-[0.8125rem] font-medium text-success">
                      {t.missed}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className="mt-4 rounded-md border-l-2 border-accent/50 bg-accent-soft px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            {isAnswerCorrect(question, selected) ? t.correct : t.notQuite}
          </p>
          <p className="mt-2 text-aux" lang="en">
            {question.explanation}
          </p>
        </div>
      )}

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}

/**
 * Multi-select is scored ALL-OR-NOTHING (exact set match), matching standard
 * certification practice. Partial credit would make our estimated scaled score
 * diverge from a real one in a way we cannot calibrate.
 */
export function isAnswerCorrect(question: Question, selected: ChoiceId[]): boolean {
  const correct = correctIdsOf(question);
  if (selected.length !== correct.length) return false;
  const chosen = new Set(selected);
  return correct.every((c) => chosen.has(c));
}

/** True once the user has picked exactly as many answers as the item asks for. */
export function isAnswerComplete(question: Question, selected: ChoiceId[]): boolean {
  return selected.length === selectCountOf(question);
}
