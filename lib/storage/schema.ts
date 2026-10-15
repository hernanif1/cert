import { CURRENT_SCHEMA_VERSION } from "@/lib/storage/keys";
import type { DomainNumber, QuestionId } from "@/content/schema";
import type { Theme } from "@/lib/theme-types";

/**
 * The single durable state object (key `ccarp:v1`).
 *
 * Everything is keyed by STABLE SLUG or question id, never by array index:
 * inserting a lesson into a domain would silently shift every completion
 * recorded after it. Denominators are always computed from the blueprint
 * (lib/curriculum.ts), never from Object.keys() here — a renamed slug leaves
 * an orphan behind, and counting orphans reports 39/38.
 */

/** Leitner card. Short keys keep writes small and diffs quiet. */
export interface CardState {
  /** Box 0-6. 0 = new, 4 = the mastery threshold. */
  b: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Due date, epoch ms. Absolute, never a relative offset. */
  due: number;
  /** Total reps. */
  r: number;
  /** Total correct. */
  c: number;
  /** Lapses. 4 => leech, 8 => suspended. */
  l: number;
  /** Consecutive-correct streak. */
  st: number;
  /** Last answered, epoch ms. */
  last: number;
  /** Leech flag. */
  fl?: 1;
  /** Suspended flag. */
  sp?: 1;
  /** Bookmarked. */
  bm?: 1;
  /** Known: retired by the learner (rated Easy). Never scheduled again, but
   *  unlike `sp` it still counts as mastered. */
  kn?: 1;
  /** Last self-rating from drill: easy / medium / hard. */
  ez?: "e" | "m" | "h";
}

export interface MockAttempt {
  id: string;
  seed: number;
  startedAt: number;
  submittedAt: number;
  durationMs: number;
  timedOut: boolean;
  /** 0..63 */
  raw: number;
  total: number;
  /** 100..1000, estimated — see lib/exam/scoring.ts */
  scaled: number;
  passed: boolean;
  byDomain: Record<DomainNumber, { correct: number; total: number }>;
  /** Parallel arrays: ~1KB per attempt, enough for "you missed this again". */
  questionIds: QuestionId[];
  correctness: boolean[];
}

export interface LessonProgress {
  completedAt: number | null;
  viewedAt: number;
}

export interface AppState {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  lessons: Record<string, LessonProgress>;
  /**
   * Pre-exam self-assessment ticks: checklist item id → checkedAt (epoch ms).
   *
   * A set, not a map of nullables like `lessons`: unticking DELETES the key.
   * Lesson progress keeps a null so `viewedAt` survives an untick; a checklist
   * item has nothing else to remember, so keeping `{id: null}` around would
   * only grow the blob. Denominators come from lib/checklist.ts.
   */
  checklist: Record<string, number>;
  drill: {
    cards: Record<string, CardState>;
    /** Resets when `date` (YYYY-MM-DD, local) rolls over. */
    daily: { date: string; newIntroduced: number; reviewsDone: number };
    settings: { newPerDay: number; sessionSize: number };
    streak: { current: number; longest: number; lastStudyDate: string };
  };
  /** FIFO, capped at 20. Summaries only — never full question text. */
  examHistory: MockAttempt[];
  settings: {
    theme: Theme;
    revealAnswersInPractice: boolean;
  };
  /** Set when stored state came from a NEWER build; writes are suppressed. */
  readOnly?: true;
}

export const MAX_EXAM_HISTORY = 20;
export const DEFAULT_NEW_PER_DAY = 15;
export const DEFAULT_SESSION_SIZE = 20;

/**
 * Frozen MODULE CONSTANT, not a factory.
 *
 * useSyncExternalStore calls getServerSnapshot during SSR and hydration; if it
 * returned a fresh object each call, React would see a new reference every
 * render and loop forever. Identity stability is load-bearing.
 */
export const EMPTY_STATE: AppState = Object.freeze({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  createdAt: 0,
  updatedAt: 0,
  lessons: {},
  checklist: {},
  drill: {
    cards: {},
    daily: { date: "", newIntroduced: 0, reviewsDone: 0 },
    settings: {
      newPerDay: DEFAULT_NEW_PER_DAY,
      sessionSize: DEFAULT_SESSION_SIZE,
    },
    streak: { current: 0, longest: 0, lastStudyDate: "" },
  },
  examHistory: [],
  settings: { theme: "system", revealAnswersInPractice: true },
}) as AppState;

/** Local calendar day as YYYY-MM-DD. Streaks and daily caps are calendar-based. */
export function localDayKey(at: number = Date.now()): string {
  const d = new Date(at);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
