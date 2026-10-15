import "server-only";

import type { Lesson } from "@/content/schema";
import { AUTHORED } from "@/content/lessons/registry";
import { getLessonContentPtBr } from "@/content/i18n/pt-br/lessons";
import type { Locale } from "@/lib/i18n/config";

/**
 * `import "server-only"` is load-bearing: the sidebar and dashboard need lesson
 * TITLES, which they get from content/domains.ts. If a client component ever
 * reached for lesson BODIES instead, the bundler would ship all 38 to every
 * page. This turns that mistake into a build error.
 *
 * Until a slug appears in the registry, its page renders from the blueprint
 * objective alone and is clearly marked as not yet written — the route,
 * navigation and progress tracking all work regardless.
 *
 * A locale without a translation for this slug falls back to English rather
 * than to the "not yet written" state: untranslated beats unavailable.
 */
export function getLessonContent(
  slug: string,
  locale: Locale = "en",
): Lesson | null {
  const translated = locale === "pt-br" ? getLessonContentPtBr(slug) : null;
  return translated ?? AUTHORED[slug] ?? null;
}

export function authoredSlugs(): string[] {
  return Object.keys(AUTHORED);
}

export function authoredCount(): number {
  return Object.keys(AUTHORED).length;
}
