"use client";

import { useAppState, mutate } from "@/lib/storage/store";
import {
  ALL_LESSON_SLUGS,
  LESSON_SLUGS_BY_DOMAIN,
  TOTAL_LESSONS,
} from "@/lib/curriculum";
import type { DomainNumber } from "@/content/schema";
import type { AppState } from "@/lib/storage/schema";

/**
 * Selector hooks over the store.
 *
 * Every denominator comes from the blueprint, never from Object.keys(state).
 * A renamed slug leaves an orphan in storage; counting orphans would report
 * 39/38 and a progress bar over 100%. Orphans are left in place deliberately —
 * garbage-collecting them would make a typo in a content edit permanently
 * destroy real progress.
 */

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

function countDone(state: AppState, slugs: string[]): number {
  let n = 0;
  for (const slug of slugs) {
    if (state.lessons[slug]?.completedAt) n++;
  }
  return n;
}

function toProgress(done: number, total: number): Progress {
  return {
    done,
    total,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

export function useLessonComplete(slug: string): boolean {
  return Boolean(useAppState().lessons[slug]?.completedAt);
}

export function useDomainProgress(domainId: DomainNumber): Progress {
  const state = useAppState();
  const slugs = LESSON_SLUGS_BY_DOMAIN[domainId] ?? [];
  return toProgress(countDone(state, slugs), slugs.length);
}

export function useOverallProgress(): Progress {
  const state = useAppState();
  return toProgress(countDone(state, ALL_LESSON_SLUGS), TOTAL_LESSONS);
}

export function setLessonComplete(slug: string, complete: boolean): void {
  mutate((s) => ({
    ...s,
    lessons: {
      ...s.lessons,
      [slug]: {
        completedAt: complete ? Date.now() : null,
        viewedAt: s.lessons[slug]?.viewedAt ?? Date.now(),
      },
    },
  }));
}

export function toggleLessonComplete(slug: string): void {
  mutate((s) => {
    const wasComplete = Boolean(s.lessons[slug]?.completedAt);
    return {
      ...s,
      lessons: {
        ...s.lessons,
        [slug]: {
          completedAt: wasComplete ? null : Date.now(),
          viewedAt: s.lessons[slug]?.viewedAt ?? Date.now(),
        },
      },
    };
  });
}
