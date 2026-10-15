import type { DomainNumber, Question } from "@/content/schema";
import { DOMAINS } from "@/content/domains";
import { drillPool, reservedForm } from "@/content/questions";
import type { AppState, CardState } from "@/lib/storage/schema";
import { isDue, isLeech, newCard } from "@/lib/drill/leitner";

export type DrillMode =
  | "due"
  | "new"
  | "mixed"
  | "weak"
  | "leeches"
  | "bookmarked"
  | "cram";

export interface DrillFilters {
  mode: DrillMode;
  /** Empty means all domains. */
  domains: DomainNumber[];
  objective?: string;
  difficulty?: 1 | 2 | 3;
}

export const DEFAULT_FILTERS: DrillFilters = { mode: "due", domains: [] };

/** An objective counts as weak below this accuracy, once there is enough data. */
const WEAK_OBJECTIVE_ACCURACY = 0.7;
const WEAK_OBJECTIVE_MIN_ANSWERED = 3;
const WEAK_CARD_ACCURACY = 0.6;
const LEECH_SHARE_OF_SESSION = 0.2;
const MAX_LEECHES_PER_SESSION = 4;

function cardFor(state: AppState, q: Question): CardState {
  return state.drill.cards[q.id] ?? newCard();
}

/** Injectable so the queue can be tested without the authored bank. */
export interface DrillBank {
  drill: Question[];
  reserved: Question[];
}

export function defaultDrillBank(): DrillBank {
  return { drill: drillPool(), reserved: reservedForm() };
}

/**
 * Mock Form A is excluded from drill until a first mock has been taken, so the
 * first mock is a genuinely clean reading rather than a recall test of items
 * already drilled.
 */
export function availableBank(
  state: AppState,
  bank: DrillBank = defaultDrillBank(),
): Question[] {
  return state.examHistory.length === 0
    ? bank.drill
    : [...bank.drill, ...bank.reserved];
}

export function matchesFilters(
  q: Question,
  card: CardState,
  filters: DrillFilters,
  state: AppState,
  bank: DrillBank = defaultDrillBank(),
): boolean {
  if (filters.domains.length > 0 && !filters.domains.includes(q.domain)) return false;
  if (filters.objective && q.objective !== filters.objective) return false;
  if (filters.difficulty && q.difficulty !== filters.difficulty) return false;

  switch (filters.mode) {
    case "due":
      return card.r > 0 ? isDue(card) : false;
    case "new":
      return card.r === 0;
    case "mixed":
    case "cram":
      return !card.sp && !card.kn;
    case "leeches":
      return isLeech(card);
    case "bookmarked":
      return card.bm === 1;
    case "weak":
      return isWeak(q, card, state, bank);
  }
}

/**
 * Weak means one of two things, unioned: the whole objective is going badly,
 * or this specific card is.
 */
export function isWeak(
  q: Question,
  card: CardState,
  state: AppState,
  bank: DrillBank = defaultDrillBank(),
): boolean {
  if (card.sp || card.kn) return false;
  if (card.l >= 2) return true;
  if (card.r >= 2 && card.c / card.r < WEAK_CARD_ACCURACY) return true;

  let answered = 0;
  let correct = 0;
  for (const other of bank.drill) {
    if (other.objective !== q.objective) continue;
    const c = state.drill.cards[other.id];
    if (!c || c.r === 0) continue;
    answered += c.r;
    correct += c.c;
  }
  return (
    answered >= WEAK_OBJECTIVE_MIN_ANSWERED &&
    correct / answered < WEAK_OBJECTIVE_ACCURACY
  );
}

export interface QueueStats {
  due: number;
  newCards: number;
  leeches: number;
  suspended: number;
  /** Rated Easy and retired by the learner. */
  retired: number;
  available: number;
}

export function queueStats(
  state: AppState,
  filters: DrillFilters,
  bank: DrillBank = defaultDrillBank(),
): QueueStats {
  const pool = availableBank(state, bank).filter(
    (q) =>
      filters.domains.length === 0 || filters.domains.includes(q.domain),
  );
  let due = 0;
  let newCards = 0;
  let leeches = 0;
  let suspended = 0;
  let retired = 0;
  for (const q of pool) {
    const card = cardFor(state, q);
    if (card.sp) {
      suspended++;
      continue;
    }
    if (card.kn) {
      retired++;
      continue;
    }
    if (card.r === 0) newCards++;
    else if (isDue(card)) due++;
    if (isLeech(card)) leeches++;
  }
  return { due, newCards, leeches, suspended, retired, available: pool.length };
}

/**
 * Build a session.
 *
 * Order matters: leeches first but capped, then genuine reviews, then new cards
 * stratified by blueprint weight so a session tracks the exam's shape rather
 * than whatever happens to be alphabetically first. The leech cap exists
 * because without it three stubborn cards eat half of every session.
 */
export function buildSession(
  state: AppState,
  filters: DrillFilters,
  size: number = state.drill.settings.sessionSize,
  bank: DrillBank = defaultDrillBank(),
): Question[] {
  const pool = availableBank(state, bank);
  const eligible = pool.filter((q) =>
    matchesFilters(q, cardFor(state, q), filters, state, bank),
  );

  if (filters.mode !== "due" && filters.mode !== "mixed") {
    // Explicit modes mean "show me these" — no mixing in anything else.
    return sortByPriority(eligible, state).slice(0, size);
  }

  const queue: Question[] = [];
  const taken = new Set<string>();
  const take = (items: Question[], max: number) => {
    for (const q of items) {
      if (queue.length >= size || taken.has(q.id)) continue;
      if (max-- <= 0) break;
      queue.push(q);
      taken.add(q.id);
    }
  };

  const leechCap = Math.min(
    MAX_LEECHES_PER_SESSION,
    Math.floor(size * LEECH_SHARE_OF_SESSION),
  );
  const dueLeeches = eligible.filter((q) => {
    const c = cardFor(state, q);
    return isLeech(c) && isDue(c);
  });
  take(sortByPriority(dueLeeches, state), leechCap);

  const reviews = eligible.filter((q) => {
    const c = cardFor(state, q);
    return c.r > 0 && isDue(c) && !isLeech(c);
  });
  take(sortByPriority(reviews, state), size);

  if (filters.mode === "mixed" || queue.length < size) {
    const remainingNewToday = Math.max(
      0,
      state.drill.settings.newPerDay - todaysNewCount(state),
    );
    const fresh = stratifyByWeight(
      eligible.filter((q) => cardFor(state, q).r === 0 && !taken.has(q.id)),
      size - queue.length,
    );
    take(fresh, Math.min(remainingNewToday, size - queue.length));
  }

  return queue;
}

function todaysNewCount(state: AppState): number {
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return state.drill.daily.date === key ? state.drill.daily.newIntroduced : 0;
}

/** Most overdue first, then lowest box, then heaviest domain. */
function sortByPriority(items: Question[], state: AppState): Question[] {
  const weight = new Map(DOMAINS.map((d) => [d.id, d.weight]));
  return [...items].sort((a, b) => {
    const ca = cardFor(state, a);
    const cb = cardFor(state, b);
    if (ca.due !== cb.due) return ca.due - cb.due;
    if (ca.b !== cb.b) return ca.b - cb.b;
    return (weight.get(b.domain) ?? 0) - (weight.get(a.domain) ?? 0);
  });
}

/**
 * Introduce new cards in proportion to blueprint weight, and within a domain in
 * objective order so new material tracks the curriculum.
 */
function stratifyByWeight(items: Question[], count: number): Question[] {
  if (count <= 0) return [];
  const byDomain = new Map<DomainNumber, Question[]>();
  for (const q of items) {
    const list = byDomain.get(q.domain) ?? [];
    list.push(q);
    byDomain.set(q.domain, list);
  }
  for (const list of byDomain.values()) {
    list.sort((a, b) => a.objective.localeCompare(b.objective, undefined, { numeric: true }));
  }

  const out: Question[] = [];
  const quota = new Map<DomainNumber, number>();
  for (const d of DOMAINS) quota.set(d.id, d.weight * count);

  while (out.length < count) {
    // Pick the domain currently furthest ahead of what it has been given.
    let best: DomainNumber | null = null;
    let bestDebt = 0;
    for (const d of DOMAINS) {
      const list = byDomain.get(d.id);
      if (!list || list.length === 0) continue;
      const debt = quota.get(d.id) ?? 0;
      if (best === null || debt > bestDebt) {
        best = d.id;
        bestDebt = debt;
      }
    }
    if (best === null) break;
    out.push(byDomain.get(best)!.shift()!);
    quota.set(best, bestDebt - 1);
  }
  return out;
}
