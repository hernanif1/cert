"use client";

import { useHydrated } from "@/lib/storage/store";
import { useLessonComplete } from "@/lib/storage/hooks";
import { useDict } from "@/lib/i18n/client";
import { Icon } from "@/components/ui/Icon";

/** A completion tick in lesson listings. Reserves its box before hydration. */
export function LessonCheck({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const complete = useLessonComplete(slug);
  const label = useDict().progressUi.completedTitle;

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
      title={label}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success text-white dark:text-ink-900"
    >
      <Icon name="check" size={10} strokeWidth={3} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
