"use client";

import { useHydrated } from "@/lib/storage/store";
import { useDomainProgress } from "@/lib/storage/hooks";
import { ProgressRing } from "@/components/progress/ProgressRing";
import type { DomainNumber } from "@/content/schema";

/**
 * Client wrapper: reads the store and hands ProgressRing a plain number, so the
 * SVG geometry stays in a Server Component and out of the client bundle.
 */
export function DomainRing({
  domainId,
  size = 40,
}: {
  domainId: DomainNumber;
  size?: number;
}) {
  const hydrated = useHydrated();
  const { done, total, pct } = useDomainProgress(domainId);

  if (!hydrated) {
    return (
      <span
        aria-busy="true"
        className="inline-block shrink-0 animate-pulse rounded-full bg-surface-2"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className="relative inline-flex shrink-0" title={`${done} of ${total} lessons`}>
      <ProgressRing value={pct} size={size} label={`${done} of ${total} lessons complete`} />
      <span className="tnum absolute inset-0 flex items-center justify-center text-[10px] text-fg-muted">
        {done}
      </span>
    </span>
  );
}
