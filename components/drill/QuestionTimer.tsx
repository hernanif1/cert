"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Per-item pacing countdown for drill. Like ExamTimer it is an ISOLATED LEAF
 * so the once-a-second tick re-renders this element and nothing else.
 *
 * Truth is `budgetMs - (now - startedAt)`; the timeout only drives display.
 * `stoppedAt` freezes the clock at the moment the answer was checked, so the
 * number left on screen is the time the item actually took. Below zero it
 * keeps counting into the negative — knowing *how far* over pace an item ran
 * is the useful part — rather than stopping at 00:00.
 */
export function QuestionTimer({
  startedAt,
  stoppedAt,
  budgetMs,
  title,
}: {
  startedAt: number;
  stoppedAt: number | null;
  budgetMs: number;
  title?: string;
}) {
  // Only the wall clock is state; "remaining" is derived from it so a frozen
  // timer needs no effect at all.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (stoppedAt !== null) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      // Re-sync to the wall clock so we do not drift past the second boundary.
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [startedAt, stoppedAt]);

  // `now` can lag a freshly restarted clock by one paint; never show > budget.
  const at = stoppedAt ?? Math.max(now, startedAt);
  const remaining = budgetMs - (at - startedAt);
  const over = remaining < 0;
  const low = !over && remaining <= budgetMs / 4;

  return (
    <time
      aria-live="off"
      title={title}
      className={cn(
        "tnum font-mono",
        over ? "text-danger" : low ? "text-warning" : "",
        stoppedAt !== null && "opacity-70",
      )}
    >
      {format(remaining)}
    </time>
  );
}

export function format(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const total = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}
