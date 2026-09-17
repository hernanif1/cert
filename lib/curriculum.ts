import { DOMAINS } from "@/content/domains";
import type { Domain, DomainNumber, Objective, ObjectiveId } from "@/content/schema";

/**
 * Derived indexes over the blueprint, built once at module load.
 *
 * content/domains.ts holds only metadata — no lesson prose — so this module is
 * safe to import from client components. Lesson BODIES live in
 * content/lessons/index.ts, which is marked `server-only` precisely so that a
 * client component importing it is a build error rather than a silent 300KB
 * bundle regression.
 */

export interface LessonRef extends Objective {
  domainId: DomainNumber;
  domainSlug: string;
  domainTitle: string;
  domainCode: `D${DomainNumber}`;
  /** "/learn/3-integration/3-5-rag-pipeline-design" */
  href: string;
}

/**
 * Flat, ordered list of all 38 lessons. Flat is the point: prev/next becomes an
 * array index instead of a nested walk, so the last lesson of domain 1 links
 * straight into the first of domain 2 for a linear study path.
 */
export const LESSON_ORDER: LessonRef[] = DOMAINS.flatMap((d) =>
  d.objectives.map((o) => ({
    ...o,
    domainId: d.id,
    domainSlug: d.slug,
    domainTitle: d.title,
    domainCode: d.code,
    href: `/learn/${d.slug}/${o.slug}`,
  })),
);

export const TOTAL_LESSONS = LESSON_ORDER.length;

const BY_LESSON_SLUG = new Map(LESSON_ORDER.map((l) => [l.slug, l]));
const LESSON_INDEX = new Map(LESSON_ORDER.map((l, i) => [l.slug, i]));
const BY_DOMAIN_SLUG = new Map(DOMAINS.map((d) => [d.slug, d]));
const BY_OBJECTIVE_ID = new Map(LESSON_ORDER.map((l) => [l.id, l]));

export function getDomain(slug: string): Domain | undefined {
  return BY_DOMAIN_SLUG.get(slug);
}

export function getLesson(slug: string): LessonRef | undefined {
  return BY_LESSON_SLUG.get(slug);
}

export function getLessonByObjective(id: ObjectiveId): LessonRef | undefined {
  return BY_OBJECTIVE_ID.get(id);
}

/** Previous/next across domain boundaries. */
export function neighbours(slug: string): {
  prev: LessonRef | null;
  next: LessonRef | null;
} {
  const i = LESSON_INDEX.get(slug);
  if (i === undefined) return { prev: null, next: null };
  return {
    prev: LESSON_ORDER[i - 1] ?? null,
    next: LESSON_ORDER[i + 1] ?? null,
  };
}

/**
 * Lesson slugs grouped by domain. Progress denominators MUST come from here
 * and never from Object.keys(storedProgress): a renamed slug would otherwise
 * leave an orphan behind and report 39/38.
 */
export const LESSON_SLUGS_BY_DOMAIN: Record<DomainNumber, string[]> =
  DOMAINS.reduce(
    (acc, d) => {
      acc[d.id] = d.objectives.map((o) => o.slug);
      return acc;
    },
    {} as Record<DomainNumber, string[]>,
  );

export const ALL_LESSON_SLUGS: string[] = LESSON_ORDER.map((l) => l.slug);

export function domainHref(d: Domain): string {
  return `/learn/${d.slug}`;
}

/** "01".."07" — the reference site's zero-padded domain numbering. */
export function domainNumberLabel(id: DomainNumber): string {
  return String(id).padStart(2, "0");
}

export function weightPercent(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}
