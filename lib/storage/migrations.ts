import { CURRENT_SCHEMA_VERSION } from "@/lib/storage/keys";
import {
  DEFAULT_NEW_PER_DAY,
  DEFAULT_SESSION_SIZE,
  EMPTY_STATE,
  MAX_EXAM_HISTORY,
  type AppState,
  type CardState,
} from "@/lib/storage/schema";

/**
 * Migrate by REPAIR, not reject.
 *
 * Refusing to load slightly-malformed state throws away somebody's real study
 * progress over a stray field. `repair` coerces field by field against
 * EMPTY_STATE and drops only what it cannot understand. This is also why there
 * is no Zod here: its ergonomics push toward reject-on-failure, and a
 * hand-rolled repair is both smaller and better behaved for saved progress.
 */

type Migration = (s: Record<string, unknown>) => Record<string, unknown>;

/**
 * Version N migrates to N+1. Empty today (we ship at v1); each future schema
 * break appends one entry rather than rewriting the reader.
 */
const LADDER: Record<number, Migration> = {};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

function repairCard(raw: unknown): CardState | null {
  const c = obj(raw);
  const b = num(c.b, -1);
  if (b < 0 || b > 6) return null; // not a card we understand
  return {
    b: Math.round(b) as CardState["b"],
    due: num(c.due, 0),
    r: Math.max(0, num(c.r, 0)),
    c: Math.max(0, num(c.c, 0)),
    l: Math.max(0, num(c.l, 0)),
    st: Math.max(0, num(c.st, 0)),
    last: num(c.last, 0),
    ...(c.fl === 1 ? { fl: 1 as const } : {}),
    ...(c.sp === 1 ? { sp: 1 as const } : {}),
    ...(c.bm === 1 ? { bm: 1 as const } : {}),
  };
}

export function repair(raw: unknown): AppState {
  const s = obj(raw);
  const drill = obj(s.drill);
  const settings = obj(s.settings);

  const lessons: AppState["lessons"] = {};
  for (const [slug, v] of Object.entries(obj(s.lessons))) {
    const l = obj(v);
    const completedAt = l.completedAt;
    lessons[slug] = {
      completedAt:
        typeof completedAt === "number" && Number.isFinite(completedAt)
          ? completedAt
          : null,
      viewedAt: num(l.viewedAt, 0),
    };
  }

  const cards: Record<string, CardState> = {};
  for (const [id, v] of Object.entries(obj(drill.cards))) {
    const card = repairCard(v);
    if (card) cards[id] = card;
  }

  const daily = obj(drill.daily);
  const streak = obj(drill.streak);
  const drillSettings = obj(drill.settings);

  const examHistory = Array.isArray(s.examHistory)
    ? (s.examHistory.filter(
        (a) => typeof a === "object" && a !== null && "id" in a,
      ) as AppState["examHistory"])
    : [];

  const theme = settings.theme;

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: num(s.createdAt, Date.now()),
    updatedAt: num(s.updatedAt, 0),
    lessons,
    drill: {
      cards,
      daily: {
        date: str(daily.date, ""),
        newIntroduced: Math.max(0, num(daily.newIntroduced, 0)),
        reviewsDone: Math.max(0, num(daily.reviewsDone, 0)),
      },
      settings: {
        newPerDay: num(drillSettings.newPerDay, DEFAULT_NEW_PER_DAY),
        sessionSize: num(drillSettings.sessionSize, DEFAULT_SESSION_SIZE),
      },
      streak: {
        current: Math.max(0, num(streak.current, 0)),
        longest: Math.max(0, num(streak.longest, 0)),
        lastStudyDate: str(streak.lastStudyDate, ""),
      },
    },
    examHistory: examHistory.slice(-MAX_EXAM_HISTORY),
    settings: {
      theme:
        theme === "light" || theme === "dark" || theme === "system"
          ? theme
          : EMPTY_STATE.settings.theme,
      revealAnswersInPractice: bool(settings.revealAnswersInPractice, true),
    },
  };
}

export function migrate(raw: unknown): AppState {
  const s = obj(raw);
  const stored = num(s.schemaVersion, CURRENT_SCHEMA_VERSION);

  /**
   * Stored state is NEWER than this build — a stale cached bundle, which is
   * routine on a CDN. Load it read-only and never write back: silently
   * downgrading is how you destroy data you cannot recover.
   */
  if (stored > CURRENT_SCHEMA_VERSION) {
    return { ...repair(s), readOnly: true };
  }

  let cur: Record<string, unknown> = s;
  let version = stored;
  let guard = 0;
  while (version < CURRENT_SCHEMA_VERSION && guard++ < 50) {
    const step = LADDER[version];
    if (!step) break; // gap in the ladder: fall through to repair
    cur = step(cur);
    version = num(cur.schemaVersion, version + 1);
  }

  return repair(cur);
}
