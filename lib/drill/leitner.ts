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
  return !card.sp && !card.kn && card.due <= endOfLocalDay(at);
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

/**
 * Self-rated ease of a CORRECT answer, given after the reveal.
 *   easy    — RETIRES the card: top box, marked known, never scheduled again.
 *   medium  — climbs one box but comes back TOMORROW, whatever the box.
 *   hard    — drops one box and comes back in the NEXT ROUND (due now).
 * Left undefined (lesson practice, mock review) the plain Leitner ladder runs.
 * A wrong answer is a lapse whatever the rating says.
 */
export type Ease = "easy" | "medium" | "hard";

export interface GradeResult {
  card: CardState;
  /** For the UI: "Box 3 → Box 4 · next review in 7 days". */
  fromBox: number;
  toBox: number;
  intervalDays: number;
  becameLeech: boolean;
  becameSuspended: boolean;
  /** Rated Easy while correct: the card left the deck for good. */
  retired: boolean;
}

/**
 * Apply an answer.
 *
 * `cram` is the guard that matters most here. Cram mode must never touch box or
 * due: it is the single most common bug in homebrew SRS apps, where a user
 * crams the night before an exam and silently pushes their entire deck out
 * thirty days. In cram we count the rep and nothing else.
 */
const EASE_KEY: Record<Ease, NonNullable<CardState["ez"]>> = { easy: "e", medium: "m", hard: "h" };
const EASE_OF_KEY: Record<NonNullable<CardState["ez"]>, Ease> = { e: "easy", m: "medium", h: "hard" };

/** The learner's last self-rating, if the drill has ever graded this card. */
export function easeOf(card: CardState | undefined): Ease | undefined {
  return card?.ez ? EASE_OF_KEY[card.ez] : undefined;
}

export function grade(
  card: CardState,
  correct: boolean,
  options: { cram?: boolean; now?: number; ease?: Ease } = {},
): GradeResult {
  const result = gradeSchedule(card, correct, options);
  // The rating is remembered on every path, cram included: it is metadata
  // about the learner, not about the schedule.
  if (options.ease) result.card = { ...result.card, ez: EASE_KEY[options.ease] };
  return result;
}

function gradeSchedule(
  card: CardState,
  correct: boolean,
  options: { cram?: boolean; now?: number; ease?: Ease },
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
      retired: false,
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
      retired: false,
    };
  }

  if (options.ease === "easy") {
    // "I know this cold": retire it. Top box so every mastery count and the
    // readiness score treat it as learned, `kn` so no mode ever deals it
    // again, and the leech flag cleared since the learner just overruled it.
    const { fl: _fl, ...rest } = card;
    void _fl;
    return {
      card: {
        ...rest,
        b: MAX_BOX,
        due: startOfLocalDay(now + INTERVAL_DAYS[MAX_BOX] * 86_400_000),
        r: card.r + 1,
        c: card.c + 1,
        st: card.st + 1,
        last: now,
        kn: 1,
      },
      fromBox,
      toBox: MAX_BOX,
      intervalDays: INTERVAL_DAYS[MAX_BOX],
      becameLeech: false,
      becameSuspended: false,
      retired: true,
    };
  }

  if (options.ease === "hard") {
    // Right, but shaky: one rung down and straight back into the next round.
    const toBox = Math.max(1, card.b - 1) as CardState["b"];
    return {
      card: { ...card, b: toBox, due: now, r: card.r + 1, c: card.c + 1, st: 0, last: now },
      fromBox,
      toBox,
      intervalDays: 0,
      becameLeech: false,
      becameSuspended: false,
      retired: false,
    };
  }

  // max(1, b) skips box 1 for new cards: box 1 means relearning, not "seen once".
  const toBox = Math.min(MAX_BOX, Math.max(1, card.b) + 1) as CardState["b"];
  // Medium is a flat "see it again tomorrow"; only the unrated ladder spaces out.
  const days = options.ease === "medium" ? 1 : INTERVAL_DAYS[toBox];

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
    retired: false,
  };
}

export function describeInterval(days: number): string {
  if (days <= 0) return "again this session";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
