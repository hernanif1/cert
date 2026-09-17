/**
 * Drill session queue, verified against a synthetic bank.
 */
import { DOMAINS } from "../content/domains";
import { buildSession, queueStats, availableBank, isWeak, type DrillFilters } from "../lib/drill/queue";
import { EMPTY_STATE, type AppState, type CardState, type MockAttempt } from "../lib/storage/schema";
import { newCard, startOfLocalDay } from "../lib/drill/leitner";
import type { DomainNumber, Question, QuestionId } from "../content/schema";

let failures = 0;
function check(name: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : "FAIL  "} ${name}${detail ? ` — ${detail}` : ""}`);
}

/* Build a synthetic bank and patch the module the queue reads from, so the
 * queue logic can be proven before the real content exists. */
const drill: Question[] = [];
const reserved: Question[] = [];
let n = 0;
function mk(domain: DomainNumber, objective: string, pool: "drill" | "reserved"): Question {
  const id = `D${domain}-q${String(++n).padStart(3, "0")}${pool === "reserved" ? "r" : ""}` as QuestionId;
  return {
    schemaVersion: 1, id, domain, objective: objective as Question["objective"],
    stem: `S ${id}`,
    choices: [
      { id: "A", text: "a" }, { id: "B", text: "b", rationale: "x".repeat(40) },
      { id: "C", text: "c", rationale: "x".repeat(40) }, { id: "D", text: "d", rationale: "x".repeat(40) },
    ],
    explanation: "y".repeat(120), difficulty: 2, cognitiveLevel: "application",
    pool, type: "single", correct: "A",
  };
}
for (const d of DOMAINS) {
  for (const o of d.objectives) for (let i = 0; i < o.drillTarget; i++) drill.push(mk(d.id, o.id, "drill"));
  for (let i = 0; i < d.mockItemCount; i++) reserved.push(mk(d.id, d.objectives[0].id, "reserved"));
}

const BANK = { drill, reserved };

const DAY = 86_400_000;
const NOW = Date.now();
const cards = (entries: [string, Partial<CardState>][]): AppState["drill"]["cards"] =>
  Object.fromEntries(
    entries.map(([id, c]) => [id, { ...newCard(), ...c } as CardState]),
  );

const base: AppState = { ...EMPTY_STATE };

/* Form A isolation */
check(
  "before a first mock, drill sees only the 200-item pool",
  availableBank(base, BANK).length === 200,
  String(availableBank(base, BANK).length),
);
const afterMock: AppState = {
  ...base,
  examHistory: [{ id: "m1", seed: 1, startedAt: 1, submittedAt: NOW, durationMs: 1,
    timedOut: false, raw: 40, total: 63, scaled: 650, passed: false,
    byDomain: {} as MockAttempt["byDomain"], questionIds: [], correctness: [] }],
};
check(
  "after a first mock, Form A joins the drill pool",
  availableBank(afterMock, BANK).length === 263,
  String(availableBank(afterMock, BANK).length),
);

/* New-card pacing and stratification */
const mixed: DrillFilters = { mode: "mixed", domains: [] };
const fresh = buildSession(base, mixed, 20, BANK);
// A brand-new deck has nothing due, so the session is bounded by the daily
// new-card allowance (15), not by the requested session size (20).
check(
  "a fresh session is bounded by the daily new-card cap, not the session size",
  fresh.length === base.drill.settings.newPerDay,
  `${fresh.length} cards, cap ${base.drill.settings.newPerDay}`,
);
check("a fresh session is all new cards", fresh.every((q) => !base.drill.cards[q.id]));

const heavy = fresh.filter((q) => q.domain === 3).length;
const light = fresh.filter((q) => q.domain === 7).length;
check(
  "new cards are stratified by blueprint weight (D3 19% > D7 7%)",
  heavy > light,
  `D3 ${heavy} vs D7 ${light} of ${fresh.length}`,
);

const capped: AppState = {
  ...base,
  drill: { ...base.drill, daily: { date: todayKey(), newIntroduced: 15, reviewsDone: 0 } },
};
check(
  "the daily new-card cap is respected",
  buildSession(capped, mixed, 20, BANK).length === 0,
  String(buildSession(capped, mixed, 20, BANK).length),
);

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* Due mode only serves genuinely due reviews */
const dueState: AppState = {
  ...base,
  drill: {
    ...base.drill,
    cards: cards([
      [drill[0].id, { b: 2, r: 2, c: 2, due: NOW - DAY }],
      [drill[1].id, { b: 3, r: 3, c: 3, due: startOfLocalDay(NOW + 5 * DAY) }],
    ]),
  },
};
const due = buildSession(dueState, { mode: "due", domains: [] }, 20, BANK);
check("due mode serves the overdue card", due.some((q) => q.id === drill[0].id));
check("due mode skips a card scheduled for next week",
  !due.some((q) => q.id === drill[1].id));
check("due mode does not introduce new cards", due.length === 1, String(due.length));
check("queueStats counts the due card", queueStats(dueState, { mode: "due", domains: [] }, BANK).due === 1);

/* Leech capping */
const leechEntries: [string, Partial<CardState>][] = [];
for (let i = 0; i < 10; i++) {
  leechEntries.push([drill[i].id, { b: 1, r: 8, c: 2, l: 5, fl: 1, due: NOW - DAY }]);
}
for (let i = 10; i < 30; i++) {
  leechEntries.push([drill[i].id, { b: 3, r: 4, c: 4, due: NOW - DAY }]);
}
const leechy: AppState = { ...base, drill: { ...base.drill, cards: cards(leechEntries) } };
const leechSession = buildSession(leechy, { mode: "due", domains: [] }, 20, BANK);
const leechCount = leechSession.filter((q) => leechy.drill.cards[q.id]?.fl === 1).length;
check(
  "leeches are capped at a fifth of the session",
  leechCount <= 4,
  `${leechCount} of ${leechSession.length}`,
);
check("the rest of the session is real reviews", leechSession.length === 20, String(leechSession.length));

/* Suspended cards never appear */
const suspended: AppState = {
  ...base,
  drill: { ...base.drill, cards: cards([[drill[0].id, { b: 1, r: 9, c: 1, l: 9, sp: 1, due: 0 }]]) },
};
check(
  "suspended cards are excluded from every mode",
  (["due", "mixed", "weak", "leeches", "cram"] as const).every(
    (mode) => !buildSession(suspended, { mode, domains: [] }, 20, BANK).some((q) => q.id === drill[0].id),
  ),
);

/* Domain filter */
const d3Only = buildSession(base, { mode: "mixed", domains: [3] }, 20, BANK);
check("domain filter restricts the session", d3Only.every((q) => q.domain === 3), String(d3Only.length));

/* Weak detection */
const weakCard: CardState = { ...newCard(), b: 1, r: 5, c: 1, l: 2 };
check("a lapsing card is weak", isWeak(drill[0], weakCard, base, BANK));
check("a healthy card is not weak", !isWeak(drill[0], { ...newCard(), b: 5, r: 6, c: 6 } as CardState, base, BANK));

const weakObjective: AppState = {
  ...base,
  drill: {
    ...base.drill,
    cards: cards(
      drill.filter((q) => q.objective === drill[0].objective)
        .map((q) => [q.id, { b: 2, r: 4, c: 1 }] as [string, Partial<CardState>]),
    ),
  },
};
check(
  "a card inherits weakness from a failing objective",
  isWeak(drill[0], weakObjective.drill.cards[drill[0].id], weakObjective, BANK),
);

/* Bookmarked mode */
const marked: AppState = {
  ...base,
  drill: { ...base.drill, cards: cards([[drill[5].id, { bm: 1 }]]) },
};
const bookmarks = buildSession(marked, { mode: "bookmarked", domains: [] }, 20, BANK);
check("bookmarked mode serves only bookmarks",
  bookmarks.length === 1 && bookmarks[0].id === drill[5].id, String(bookmarks.length));

/* No duplicates in any session */
const bigMixed = buildSession(base, mixed, 40, BANK);
check("a session never repeats a card",
  new Set(bigMixed.map((q) => q.id)).size === bigMixed.length);

console.log(failures === 0 ? "\nall queue checks passed" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
