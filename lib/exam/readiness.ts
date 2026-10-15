import { DOMAINS } from "@/content/domains";
import type { DomainNumber } from "@/content/schema";
import { EXAM } from "@/content/exam-facts";
import {
  OBJECTIVES_WITH_QUESTIONS,
  questionsByObjective,
  drillPoolByDomain,
} from "@/content/questions";
import type { AppState } from "@/lib/storage/schema";

/**
 * Exam readiness, 0-100.
 *
 * The reference site weights self-reported lesson completion at 30 points.
 * That is score inflation: thirty-eight clicks in two minutes buys 30 points
 * and makes the headline number a lie. Here lessons are worth 25 and are gated
 * on actually answering something, drill mastery is worth 35, and the mock —
 * by far the most predictive signal — is worth 40.
 *
 * Every component is domain-weighted, so finishing D3's 8 lessons counts for
 * more than D7's 3, exactly as the blueprint weights them.
 */

export const WEIGHT_LESSONS = 25;
export const WEIGHT_DRILL = 35;
export const WEIGHT_MOCK = 40;

/** Below this the mock component is zero: random guessing scores about 311. */
const MOCK_FLOOR = 400;
/** Where the mock component maxes out. Requiring a perfect 1000 would be absurd. */
const MOCK_CEILING = 820;
const MOCK_RECENCY_DAYS = 90;
/** Box 4 is the mastery threshold; boxes 5-6 add no readiness. */
const MASTERY_BOX = 4;

export type ReadinessLabel =
  | "Just Beginning"
  | "Building Foundations"
  | "Getting There"
  | "Nearly There"
  | "Exam Ready";

export interface ReadinessComponent {
  earned: number;
  max: number;
  pct: number;
}

export type ReadinessGate =
  | { kind: "no-mock"; score: number }
  | { kind: "failed-mock"; score: number; scaled: number; cut: number }
  | { kind: "weak-domain"; weak: { id: DomainNumber; pct: number }[]; min: number }
  | { kind: "lessons"; score: number; done: number; needed: number };

export interface Readiness {
  score: number;
  label: ReadinessLabel;
  lessons: ReadinessComponent;
  drill: ReadinessComponent;
  mock: ReadinessComponent;
  /** Set when the composite was capped below "Exam Ready" — explains why. */
  gateReason: string | null;
  /** The same explanation as DATA, so the UI can say it in any language. */
  gate: ReadinessGate | null;
  mockAttempts: number;
  /** Shown when the mock component is structurally unreachable. */
  mockLocked: boolean;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function component(earned: number, max: number): ReadinessComponent {
  return {
    earned: Math.round(earned * 10) / 10,
    max,
    pct: max === 0 ? 0 : Math.round((earned / max) * 100),
  };
}

/**
 * A lesson counts only if it is marked complete AND at least one question from
 * its objective has been answered. That costs the user thirty seconds and it
 * kills the click-farm failure mode. When no question exists for an objective
 * yet, the gate is waived — we cannot require answering something unwritten.
 */
export function lessonsEarned(state: AppState): number {
  let total = 0;
  for (const d of DOMAINS) {
    let done = 0;
    for (const o of d.objectives) {
      if (!state.lessons[o.slug]?.completedAt) continue;
      const gated = OBJECTIVES_WITH_QUESTIONS.has(o.id);
      if (!gated) {
        done++;
        continue;
      }
      const answered = questionsByObjective(o.id).some(
        (q) => (state.drill.cards[q.id]?.r ?? 0) > 0,
      );
      if (answered) done++;
    }
    total += d.weight * (done / d.objectives.length);
  }
  return WEIGHT_LESSONS * total;
}

/** Per-card partial credit, so progress registers from the first correct answer. */
export function cardCredit(card: {
  b: number;
  fl?: 1;
  sp?: 1;
}): number {
  if (card.sp) return 0;
  const base = Math.min(card.b, MASTERY_BOX) / MASTERY_BOX;
  return card.fl ? Math.min(0.25, base) : base;
}

export function drillEarned(state: AppState): number {
  let total = 0;
  for (const d of DOMAINS) {
    const pool = drillPoolByDomain(d.id);
    if (pool.length === 0) continue;
    let credit = 0;
    for (const q of pool) {
      const card = state.drill.cards[q.id];
      if (card) credit += cardCredit(card);
    }
    total += d.weight * (credit / pool.length);
  }
  return WEIGHT_DRILL * total;
}

export function mockEarned(state: AppState): number {
  const attempts = state.examHistory;
  if (attempts.length === 0) return 0;

  const lastThree = attempts.slice(-3);
  const best = lastThree.reduce((a, b) => (b.scaled > a.scaled ? b : a));

  const base = clamp01((best.scaled - MOCK_FLOOR) / (MOCK_CEILING - MOCK_FLOOR));
  // One mock is noisy; discount a lone attempt rather than trusting it fully.
  const attemptFactor = Math.min(1, 0.85 + 0.15 * (attempts.length - 1));
  const days = (Date.now() - best.submittedAt) / 86_400_000;
  const recencyFactor = Math.min(1, Math.max(0.6, 1 - days / MOCK_RECENCY_DAYS));

  return WEIGHT_MOCK * base * attemptFactor * recencyFactor;
}

function labelFor(score: number): ReadinessLabel {
  if (score >= 85) return "Exam Ready";
  if (score >= 70) return "Nearly There";
  if (score >= 50) return "Getting There";
  if (score >= 25) return "Building Foundations";
  return "Just Beginning";
}

const MIN_LESSONS_FOR_READY = 30;
const MIN_DOMAIN_PCT_FOR_READY = 60;
/** At or above this, the composite is making a claim worth contradicting. */
const CLAIM_THRESHOLD = 50;

const LABEL_RANK: Record<ReadinessLabel, number> = {
  "Just Beginning": 0,
  "Building Foundations": 1,
  "Getting There": 2,
  "Nearly There": 3,
  "Exam Ready": 4,
};

function cap(label: ReadinessLabel, ceiling: ReadinessLabel): ReadinessLabel {
  return LABEL_RANK[label] > LABEL_RANK[ceiling] ? ceiling : label;
}

/**
 * The hard gate.
 *
 * A readiness score that contradicts the actual pass signal is worse than no
 * readiness score at all. Two separate jobs here:
 *
 *  1. CAP the label. "Exam Ready" requires real evidence — a passing last mock,
 *     no weak domain on it, and most of the curriculum read.
 *  2. EXPLAIN, whenever the composite is making a claim the evidence does not
 *     support. This fires even when the cap does not bind: someone sitting at
 *     65 with a failing last mock is still being told something misleading, and
 *     the mock is the number that decides.
 */
function applyGate(
  score: number,
  label: ReadinessLabel,
  state: AppState,
  completedLessons: number,
): { label: ReadinessLabel; gateReason: string | null; gate: ReadinessGate | null } {
  const last = state.examHistory[state.examHistory.length - 1];

  if (!last) {
    return {
      label: cap(label, "Nearly There"),
      gateReason:
        label === "Exam Ready"
          ? `Your composite is ${score}, but you have not taken a mock exam. That is the number that decides.`
          : null,
      gate: label === "Exam Ready" ? { kind: "no-mock", score } : null,
    };
  }

  if (last.scaled < EXAM.passScaled) {
    return {
      label: cap(label, "Nearly There"),
      gateReason:
        score >= CLAIM_THRESHOLD
          ? `Your composite is ${score}, but your last mock scored ${last.scaled} — below the ${EXAM.passScaled} cut. That is the number that decides.`
          : null,
      gate:
        score >= CLAIM_THRESHOLD
          ? { kind: "failed-mock", score, scaled: last.scaled, cut: EXAM.passScaled }
          : null,
    };
  }

  const weak = Object.entries(last.byDomain)
    .map(([id, r]) => ({
      id: Number(id) as DomainNumber,
      pct: r.total === 0 ? 100 : Math.round((r.correct / r.total) * 100),
    }))
    .filter((d) => d.pct < MIN_DOMAIN_PCT_FOR_READY);

  if (weak.length > 0) {
    const names = weak.map((w) => `D${w.id} at ${w.pct}%`).join(", ");
    return {
      label: cap(label, "Nearly There"),
      gateReason:
        score >= CLAIM_THRESHOLD
          ? `Your last mock passed, but ${names} is below ${MIN_DOMAIN_PCT_FOR_READY}%. Shore that up before sitting the real exam.`
          : null,
      gate:
        score >= CLAIM_THRESHOLD
          ? { kind: "weak-domain", weak, min: MIN_DOMAIN_PCT_FOR_READY }
          : null,
    };
  }

  if (completedLessons < MIN_LESSONS_FOR_READY) {
    return {
      label: cap(label, "Nearly There"),
      gateReason:
        label === "Exam Ready"
          ? `Your composite is ${score}, but only ${completedLessons} of 38 lessons are complete (${MIN_LESSONS_FOR_READY} needed).`
          : null,
      gate:
        label === "Exam Ready"
          ? { kind: "lessons", score, done: completedLessons, needed: MIN_LESSONS_FOR_READY }
          : null,
    };
  }

  return { label, gateReason: null, gate: null };
}

export function computeReadiness(state: AppState): Readiness {
  const l = lessonsEarned(state);
  const d = drillEarned(state);
  const m = mockEarned(state);
  const score = Math.round(l + d + m);

  const completedLessons = DOMAINS.reduce(
    (n, dom) =>
      n +
      dom.objectives.filter((o) => state.lessons[o.slug]?.completedAt).length,
    0,
  );

  const { label, gateReason, gate } = applyGate(
    score,
    labelFor(score),
    state,
    completedLessons,
  );

  return {
    score,
    label,
    lessons: component(l, WEIGHT_LESSONS),
    drill: component(d, WEIGHT_DRILL),
    mock: component(m, WEIGHT_MOCK),
    gateReason,
    gate,
    mockAttempts: state.examHistory.length,
    mockLocked: state.examHistory.length === 0,
  };
}
