"use client";

import { useHydrated } from "@/lib/storage/store";
import { useLessonComplete } from "@/lib/storage/hooks";

/** A completion tick in lesson listings. Reserves its box before hydration. */
export function LessonCheck({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const complete = useLessonComplete(slug);

  if (!hydrated) {
    return <span aria-busy="true" className="inline-block size-4 shrink-0" />;
  }
  if (!complete) {
    return (
      <span
        aria-hidden="true"
        className="inline-block size-4 shrink-0 rounded-full border border-border"
      />
    );
  }
  return (
    <span
      title="Completed"
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success text-[10px] text-white"
    >
      <span aria-hidden="true">✓</span>
      <span className="sr-only">Completed</span>
    </span>
  );
}
