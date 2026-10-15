"use client";

import { useHydrated } from "@/lib/storage/store";
import { useLessonComplete, toggleLessonComplete } from "@/lib/storage/hooks";
import { useDict } from "@/lib/i18n/client";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function MarkComplete({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const complete = useLessonComplete(slug);
  const t = useDict().lesson;

  // Reserve the button box before hydration. Rendering the real "Mark
  // complete" state early would flip to "Completed" and jump.
  if (!hydrated) {
    return (
      <span
        aria-busy="true"
        className="inline-block h-9 w-[9.5rem] animate-pulse rounded-lg bg-surface-2"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleLessonComplete(slug)}
      aria-pressed={complete}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-[0.8125rem] font-medium transition-colors",
        complete
          ? "border-success/40 bg-success/10 text-success"
          : "border-border text-fg-muted hover:border-accent/60 hover:text-fg",
      )}
    >
      {/* Swapping the glyph remounts it, which replays the check's draw-in. */}
      <Icon name={complete ? "check-circle" : "circle"} size={16} />
      {complete ? t.completed : t.markComplete}
    </button>
  );
}
