"use client";

import { cn } from "@/lib/cn";

/**
 * Answered and flagged are ORTHOGONAL states, so they get independent visual
 * channels — a fill for answered, a corner dot for flagged — and never colour
 * alone. The accessible name spells both out.
 */
export function QuestionNavigator({
  questionIds,
  answers,
  flagged,
  cursor,
  onJump,
}: {
  questionIds: string[];
  answers: Record<string, unknown[]>;
  flagged: string[];
  cursor: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      <ul className="grid grid-cols-9 gap-1.5">
        {questionIds.map((id, i) => {
          const answered = (answers[id]?.length ?? 0) > 0;
          const isFlagged = flagged.includes(id);
          const current = i === cursor;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={current ? "true" : undefined}
                aria-label={`Question ${i + 1}, ${answered ? "answered" : "unanswered"}${isFlagged ? ", flagged for review" : ""}`}
                className={cn(
                  "tnum relative flex aspect-square w-full items-center justify-center rounded border text-[11px] transition-colors",
                  answered
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border text-fg-muted hover:border-accent",
                  current && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
                )}
              >
                {i + 1}
                {isFlagged && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-warning ring-1 ring-bg"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-accent" />
          answered
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-warning" />
          flagged
        </span>
      </p>
    </div>
  );
}
