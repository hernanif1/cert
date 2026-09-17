import type { CardState } from "@/lib/storage/schema";

/**
 * Leech-aware Leitner, 6 boxes.
 *
 * Not SM-2 or FSRS. Their ease-factor machinery schedules cards months out,
 * and a certification is crammed in two to six weeks — an algorithm that puts
 * a card 84 days away is actively wrong here. A capped ladder is deterministic,
 * fits in one screen, and can be explained in the UI, which is what makes
 * people trust a scheduler rather than fight it.
 */

/**
 * Box 0 is "never answered". Box 1 is RELEARNING — same session, reached only
 * by getting a card wrong. A new card answered correctly therefore goes
 * straight to box 2 (one day) rather than passing through box 1, which is what
 * `Math.max(1, card.b) + 1` below encodes.
 */
export const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14, 30] as const;

/**
 * Box 4 is "Mastered": three consecutive corrects across at least four elapsed
 * days. Setting the bar at box 5 would make Exam Ready mathematically
 * unreachable for anyone prepping in under a month.
 */
export const MASTERY_BOX = 4;

export const LEECH_LAPSES = 4;
export const SUSPEND_LAPSES = 8;

export const MAX_BOX = 6;

export function startOfLocalDay(at: number): number {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfLocalDay(at: number = Date.now()): number {
  const d = new Date(at);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function newCard(): CardState {
  return { b: 0, due: 0, r: 0, c: 0, l: 0, st: 0, last: 0 };
}

export function isDue(card: CardState, at: number = Date.now()): boolean {
  return !card.sp && card.due <= endOfLocalDay(at);
}

export function isMastered(card: CardState): boolean {
  return card.b >= MASTERY_BOX && !card.fl && !card.sp;
}

export function isLeech(card: CardState): boolean {
  return Boolean(card.fl) && !card.sp;
}

export function accuracy(card: CardState): number {
  return card.r === 0 ? 0 : card.c / card.r;
}

export interface GradeResult {
  card: CardState;
  /** For the UI: "Box 3 → Box 4 · next review in 7 days". */
  fromBox: number;
  toBox: number;
  intervalDays: number;
  becameLeech: boolean;
  becameSuspended: boolean;
}

/**
 * Apply an answer.
 *
 * `cram` is the guard that matters most here. Cram mode must never touch box or
 * due: it is the single most common bug in homebrew SRS apps, where a user
 * crams the night before an exam and silently pushes their entire deck out
 * thirty days. In cram we count the rep and nothing else.
 */
export function grade(
  card: CardState,
  correct: boolean,
  options: { cram?: boolean; now?: number } = {},
): GradeResult {
  const now = options.now ?? Date.now();
  const fromBox = card.b;

  if (options.cram) {
    return {
      card: {
        ...card,
        r: card.r + 1,
        c: card.c + (correct ? 1 : 0),
        last: now,
      },
      fromBox,
      toBox: fromBox,
      intervalDays: INTERVAL_DAYS[fromBox],
      becameLeech: false,
      becameSuspended: false,
    };
  }

  if (!correct) {
    const lapses = card.l + 1;
    const becameLeech = lapses >= LEECH_LAPSES && !card.fl;
    const becameSuspended = lapses >= SUSPEND_LAPSES && !card.sp;
    return {
      card: {
        ...card,
        // Graceful demote, not reset-to-zero: losing a card you had at box 5
        // all the way back to new is punitive and wrecks pacing.
        b: Math.max(1, card.b - 2) as CardState["b"],
        due: now,
        r: card.r + 1,
        l: lapses,
        st: 0,
        last: now,
        ...(lapses >= LEECH_LAPSES ? { fl: 1 as const } : {}),
        ...(lapses >= SUSPEND_LAPSES ? { sp: 1 as const } : {}),
      },
      fromBox,
      toBox: Math.max(1, card.b - 2),
      intervalDays: 0,
      becameLeech,
      becameSuspended,
    };
  }

  // max(1, b) skips box 1 for new cards: box 1 means relearning, not "seen once".
  const toBox = Math.min(MAX_BOX, Math.max(1, card.b) + 1) as CardState["b"];
  const days = INTERVAL_DAYS[toBox];

  return {
    card: {
      ...card,
      b: toBox,
      // Day-aligned so studying at 11:45pm versus 12:15am does not shift the
      // whole schedule by a day.
      due: days === 0 ? now : startOfLocalDay(now + days * 86_400_000),
      r: card.r + 1,
      c: card.c + 1,
      st: card.st + 1,
      last: now,
    },
    fromBox,
    toBox,
    intervalDays: days,
    becameLeech: false,
    becameSuspended: false,
  };
}

export function describeInterval(days: number): string {
  if (days <= 0) return "again this session";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
