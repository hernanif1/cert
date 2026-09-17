"use client";

import { useHydrated } from "@/lib/storage/store";
import { useLessonComplete, toggleLessonComplete } from "@/lib/storage/hooks";
import { cn } from "@/lib/cn";

export function MarkComplete({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const complete = useLessonComplete(slug);

  // Reserve the exact button box before hydration. Rendering the real
  // "Mark complete" state early would flip to "Completed" and jump.
  if (!hydrated) {
    return (
      <span
        aria-busy="true"
        className="inline-block h-[30px] w-[130px] animate-pulse rounded-md bg-surface-2"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleLessonComplete(slug)}
      aria-pressed={complete}
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
        complete
          ? "border-success/40 bg-success/10 text-success"
          : "border-border text-fg-muted hover:border-accent hover:text-fg",
      )}
    >
      <span aria-hidden="true">{complete ? "✓" : "○"}</span>
      {complete ? "Completed" : "Mark complete"}
    </button>
  );
}
