import "server-only";

import type { Lesson } from "@/content/schema";
import { AUTHORED } from "@/content/lessons/registry";

/**
 * `import "server-only"` is load-bearing: the sidebar and dashboard need lesson
 * TITLES, which they get from content/domains.ts. If a client component ever
 * reached for lesson BODIES instead, the bundler would ship all 38 to every
 * page. This turns that mistake into a build error.
 *
 * Until a slug appears in the registry, its page renders from the blueprint
 * objective alone and is clearly marked as not yet written — the route,
 * navigation and progress tracking all work regardless.
 */
export function getLessonContent(slug: string): Lesson | null {
  return AUTHORED[slug] ?? null;
}

export function authoredSlugs(): string[] {
  return Object.keys(AUTHORED);
}

export function authoredCount(): number {
  return Object.keys(AUTHORED).length;
}
