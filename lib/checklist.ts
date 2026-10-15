import { CHECKLIST, type ChecklistGroup, type ChecklistItem } from "@/content/checklist";
import { CHECKLIST_PT_BR } from "@/content/i18n/pt-br/checklist";
import { lessonOrderFor, type LessonRef } from "@/lib/curriculum";
import type { DomainNumber } from "@/content/schema";
import type { Locale } from "@/lib/i18n/config";

/**
 * Resolved, locale-aware view of content/checklist.ts — the same shape
 * lib/curriculum.ts exposes for the blueprint: structure comes from the English
 * source, a locale only swaps the human-facing text.
 *
 * `TOTAL_CHECKS` is the ONLY denominator the UI may use. Counting
 * Object.keys(state.checklist) instead would let a retired id report 25/24, the
 * same way a renamed lesson slug would report 39/38.
 */

export interface ResolvedChecklistItem extends ChecklistItem {
  /** The lesson covering it, when one does. */
  lesson: LessonRef | null;
  /** Where the row links, locale-free; null when it links nowhere. */
  href: string | null;
}

/** Destinations an item may name when no lesson covers it. */
const LINKS: Record<NonNullable<ChecklistItem["link"]>, string> = {
  "mock-exam": "/mock-exam",
};

export interface ResolvedChecklistGroup {
  domain: DomainNumber | "prep";
  items: ResolvedChecklistItem[];
}

export const TOTAL_CHECKS: number = CHECKLIST.reduce(
  (n, g) => n + g.items.length,
  0,
);

/** Every id in the blueprint, for filtering orphans out of a COUNT (never out
 *  of storage — see lib/storage/migrations.ts on why orphans are kept). */
export const CHECKLIST_IDS: string[] = CHECKLIST.flatMap((g) =>
  g.items.map((i) => i.id),
);

function resolve(groups: ChecklistGroup[], locale: Locale): ResolvedChecklistGroup[] {
  const byObjective = new Map(lessonOrderFor(locale).map((l) => [l.id, l]));
  const translated = locale === "pt-br" ? CHECKLIST_PT_BR : null;

  return groups.map((g) => ({
    domain: g.domain,
    items: g.items.map((item) => {
      const lesson = item.objective ? byObjective.get(item.objective) ?? null : null;
      return {
        ...item,
        // An untranslated id falls back to English rather than rendering blank.
        text: translated?.[item.id] ?? item.text,
        lesson,
        href: lesson?.href ?? (item.link ? LINKS[item.link] : null),
      };
    }),
  }));
}

const BY_LOCALE: Record<Locale, ResolvedChecklistGroup[]> = {
  en: resolve(CHECKLIST, "en"),
  "pt-br": resolve(CHECKLIST, "pt-br"),
};

export function checklistFor(locale: Locale): ResolvedChecklistGroup[] {
  return BY_LOCALE[locale];
}

/** Item ids belonging to one group, for its own "3 of 5" counter. */
export function groupIds(group: ResolvedChecklistGroup): string[] {
  return group.items.map((i) => i.id);
}
