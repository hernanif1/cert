"use client";

import { useHydrated } from "@/lib/storage/store";
import {
  useChecklistProgress,
  useDomainProgress,
  useOverallProgress,
} from "@/lib/storage/hooks";
import type { DomainNumber } from "@/content/schema";

/**
 * The small "3/6" counters the navigation hangs off its links.
 *
 * Counters gate their placeholder on useHydrated(), and show an em-dash rather
 * than a real zero: "0/6" would be a claim that then visibly changes to "3/6".
 * The denominator comes from the blueprint, so it is identical on both sides of
 * hydration and only the numerator is ever masked. `tnum` stops the reflow.
 */
function Counter({ done, total, hydrated }: { done: number; total: number; hydrated: boolean }) {
  return (
    <span className="tnum text-[11px] text-fg-muted/70" aria-busy={!hydrated}>
      {hydrated ? done : "—"}/{total}
    </span>
  );
}

export function DomainLessonCounter({ domainId }: { domainId: DomainNumber }) {
  const hydrated = useHydrated();
  const { done, total } = useDomainProgress(domainId);
  return <Counter done={done} total={total} hydrated={hydrated} />;
}

export function OverallLessonCounter() {
  const hydrated = useHydrated();
  const { done, total } = useOverallProgress();
  return <Counter done={done} total={total} hydrated={hydrated} />;
}

export function ChecklistCounter() {
  const hydrated = useHydrated();
  const { done, total } = useChecklistProgress();
  return <Counter done={done} total={total} hydrated={hydrated} />;
}
