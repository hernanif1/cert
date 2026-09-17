import type { DomainNumber, Question } from "@/content/schema";
import { drillPool, reservedForm } from "@/content/questions";
import { BLUEPRINT } from "@/lib/exam/blueprint";
import type { AppState, MockAttempt } from "@/lib/storage/schema";

/**
 * Deterministic PRNG (mulberry32) so an attempt can be reproduced from its
 * stored seed alone. The resolved question ids are persisted too — belt and
 * braces — but a seed means a corrupted id list is still recoverable.
 */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickWeighted<T>(
  items: { item: T; weight: number }[],
  count: number,
  rng: () => number,
): T[] {
  const pool = [...items];
  const chosen: T[] = [];
  while (chosen.length < count && pool.length > 0) {
    const total = pool.reduce((a, p) => a + p.weight, 0);
    let r = rng() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    chosen.push(pool[idx].item);
    pool.splice(idx, 1);
  }
  return chosen;
}

/**
 * How badly we want to show a question again.
 *
 * Never seen outranks everything; anything that appeared in the last two mocks
 * is heavily suppressed; weak cards get a nudge so the form surfaces what you
 * are actually bad at.
 */
function freshness(q: Question, state: AppState, recent: Set<string>): number {
  const card = state.drill.cards[q.id];
  let w = card && card.r > 0 ? 1.5 : 3.0;
  if (recent.has(q.id)) w = 0.4;
  if (card && card.b <= 2 && card.r > 0) w *= 1.3;
  return w;
}

export interface SampledForm {
  questionIds: string[];
  /** True when this is the untouched reserved Form A. */
  isFormA: boolean;
}

/**
 * Attempt 1 is Mock Form A verbatim — the 63 reserved items drill never
 * touches — so the first reading is genuinely clean and un-inflated. That is
 * the entire point of a mock. Later attempts resample the whole bank with
 * freshness weighting, because by then repeated exposure is the mechanism, not
 * a bug.
 */
/** Injectable so the sampler can be tested without the authored bank. */
export interface Bank {
  reserved: Question[];
  drill: Question[];
}

export function defaultBank(): Bank {
  return { reserved: reservedForm(), drill: drillPool() };
}

export function sampleForm(
  state: AppState,
  seed: number,
  bank: Bank = defaultBank(),
): SampledForm {
  const rng = makeRng(seed);
  const reserved = bank.reserved;

  if (state.examHistory.length === 0 && reserved.length > 0) {
    return {
      questionIds: shuffle(reserved, rng).map((q) => q.id),
      isFormA: true,
    };
  }

  const recent = new Set(
    state.examHistory.slice(-2).flatMap((a: MockAttempt) => a.questionIds),
  );
  const all = [...reserved, ...bank.drill];
  const ids: string[] = [];

  for (const [domainId, count] of Object.entries(BLUEPRINT)) {
    const d = Number(domainId) as DomainNumber;
    const candidates = all
      .filter((q) => q.domain === d)
      .map((item) => ({ item, weight: freshness(item, state, recent) }));
    ids.push(...pickWeighted(candidates, count, rng).map((q) => q.id));
  }

  return { questionIds: shuffle(ids, rng), isFormA: false };
}

/** How many of this form the user has already met in drill. */
export function previouslySeenCount(
  questionIds: string[],
  state: AppState,
): number {
  return questionIds.filter((id) => (state.drill.cards[id]?.r ?? 0) > 0).length;
}
