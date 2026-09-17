import "server-only";

import type { Lesson } from "@/content/schema";

/**
 * Registry of authored lesson bodies, keyed by lesson slug.
 *
 * `import "server-only"` is load-bearing: the sidebar and dashboard need lesson
 * TITLES, which they get from content/domains.ts. If a client component ever
 * reached for this module instead, the bundler would ship all 38 lesson bodies
 * to every page. This turns that mistake into a build error.
 *
 * Lessons are added here as they are authored (Phase 7). Until a slug appears,
 * its page renders from the blueprint objective alone and is clearly marked as
 * not yet written — the route, navigation and progress tracking all work
 * regardless, so the site is navigable end to end from Phase 1 onward.
 */
const AUTHORED: Record<string, Lesson> = {};

export function getLessonContent(slug: string): Lesson | null {
  return AUTHORED[slug] ?? null;
}

export function authoredSlugs(): string[] {
  return Object.keys(AUTHORED);
}

export function authoredCount(): number {
  return Object.keys(AUTHORED).length;
}
