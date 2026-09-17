import type { Lesson } from "@/content/schema";

/**
 * Authored lesson bodies, keyed by slug.
 *
 * This module carries no `server-only` marker so build tooling — the content
 * validator in particular — can import it in a plain Node context. Application
 * code must go through ./index.ts, which adds that marker and is what stops a
 * client component pulling all 38 lesson bodies into its bundle.
 *
 * Lessons are added here as they are authored (Phase 7).
 */
export const AUTHORED: Record<string, Lesson> = {};
