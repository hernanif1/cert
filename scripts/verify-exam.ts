/**
 * Mock-exam machinery, verified against a synthetic 263-item bank so it can be
 * proven correct before the real content is authored.
 */
import { DOMAINS } from "../content/domains";
import { EXAM } from "../content/exam-facts";
import { BLUEPRINT, BLUEPRINT_TOTAL } from "../lib/exam/blueprint";
import { sampleForm, makeRng, shuffle, type Bank } from "../lib/exam/sampler";
import { gradeAttempt, type ActiveAttempt } from "../lib/exam/attempt";
import { EMPTY_STATE, type AppState, type MockAttempt } from "../lib/storage/schema";
import { newCard } from "../lib/drill/leitner";
import type { DomainNumber, Question, QuestionId } from "../content/schema";

let failures = 0;
function check(name: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : "FAIL  "} ${name}${detail ? ` — ${detail}` : ""}`);
}

/* Synthetic bank matching the real allocation: 200 drill + 63 reserved. */
function makeQuestion(
  domain: DomainNumber,
  objective: string,
  n: number,
  pool: "drill" | "reserved",
): Question {
  const id = `D${domain}-q${String(n).padStart(3, "0")}${pool === "reserved" ? "r" : ""}` as QuestionId;
  return {
    schemaVersion: 1,
    id,
    domain,
    objective: objective as Question["objective"],
    stem: `Synthetic item ${id}`,
    choices: [
      { id: "A", text: "a" },
      { id: "B", text: "b", rationale: "x".repeat(40) },
      { id: "C", text: "c", rationale: "x".repeat(40) },
      { id: "D", text: "d", rationale: "x".repeat(40) },
    ],
    explanation: "y".repeat(120),
    difficulty: 2,
    cognitiveLevel: "application",
    pool,
    type: "single",
    correct: "A",
  };
}

const bank: Bank = { reserved: [], drill: [] };
let counter = 0;
for (const d of DOMAINS) {
  for (const o of d.objectives) {
    for (let i = 0; i < o.drillTarget; i++) {
      bank.drill.push(makeQuestion(d.id, o.id, ++counter, "drill"));
    }
  }
  for (let i = 0; i < d.mockItemCount; i++) {
    bank.reserved.push(makeQuestion(d.id, d.objectives[0].id, ++counter, "reserved"));
  }
}
const byId = new Map(
  [...bank.drill, ...bank.reserved].map((q) => [q.id as string, q]),
);
const lookup = (id: string) => byId.get(id);

check("synthetic drill pool is 200", bank.drill.length === 200, String(bank.drill.length));
check("synthetic reserved form is 63", bank.reserved.length === 63, String(bank.reserved.length));
check("blueprint sums to the item count", BLUEPRINT_TOTAL === EXAM.itemCount, String(BLUEPRINT_TOTAL));

/* Attempt 1 = Form A */
const first = sampleForm(EMPTY_STATE, 1234, bank);
check("first attempt uses Form A", first.isFormA);
check("Form A is all 63 reserved items", first.questionIds.length === 63);
check(
  "Form A contains no drill-pool item",
  first.questionIds.every((id) => bank.reserved.some((q) => q.id === id)),
);
check(
  "Form A has no duplicates",
  new Set(first.questionIds).size === first.questionIds.length,
);

/* Determinism */
check(
  "the same seed reproduces the same form",
  sampleForm(EMPTY_STATE, 999, bank).questionIds.join() ===
    sampleForm(EMPTY_STATE, 999, bank).questionIds.join(),
);
check(
  "different seeds give different orderings",
  sampleForm(EMPTY_STATE, 1, bank).questionIds.join() !==
    sampleForm(EMPTY_STATE, 2, bank).questionIds.join(),
);

/* Attempt 2+ honours the blueprint */
function attemptRecord(ids: string[]): MockAttempt {
  const byDomain = {} as MockAttempt["byDomain"];
  for (const d of DOMAINS) byDomain[d.id] = { correct: 0, total: d.mockItemCount };
  return {
    id: "prev", seed: 1, startedAt: 1, submittedAt: Date.now(), durationMs: 1,
    timedOut: false, raw: 30, total: 63, scaled: 600, passed: false,
    byDomain, questionIds: ids as QuestionId[], correctness: ids.map(() => false),
  };
}

const withHistory: AppState = {
  ...EMPTY_STATE,
  examHistory: [attemptRecord(first.questionIds)],
};
const second = sampleForm(withHistory, 4242, bank);
check("second attempt is not Form A", !second.isFormA);
check("second form is 63 items", second.questionIds.length === 63, String(second.questionIds.length));
check("second form has no duplicates",
  new Set(second.questionIds).size === second.questionIds.length);

const perDomain: Record<number, number> = {};
for (const id of second.questionIds) {
  const q = lookup(id)!;
  perDomain[q.domain] = (perDomain[q.domain] ?? 0) + 1;
}
const blueprintOk = DOMAINS.every((d) => perDomain[d.id] === BLUEPRINT[d.id]);
check(
  "second form matches the blueprint exactly (11/8/12/10/9/9/4)",
  blueprintOk,
  DOMAINS.map((d) => `${d.code}:${perDomain[d.id] ?? 0}`).join(" "),
);

/* Freshness: items from the last attempt should be rarer than unseen ones. */
let repeats = 0;
const previous = new Set(first.questionIds);
for (let seed = 0; seed < 40; seed++) {
  const f = sampleForm(withHistory, seed, bank);
  repeats += f.questionIds.filter((id) => previous.has(id)).length;
}
const repeatRate = repeats / (40 * 63);
check(
  "recently-seen items are suppressed, not banned",
  repeatRate > 0 && repeatRate < 0.35,
  `${Math.round(repeatRate * 100)}% repeat rate across 40 forms`,
);

/* Among cards you have already SEEN, weak ones are preferred. Unseen items
 * still outrank both — novelty first, then weakness. */
const domain = bank.drill[0].domain;
const inDomain = bank.drill.filter((q) => q.domain === domain);
const weakId = inDomain[0].id;
const seenId = inDomain[1].id;
const unseenId = inDomain[2].id;

const weakState: AppState = {
  ...withHistory,
  drill: {
    ...EMPTY_STATE.drill,
    cards: {
      // weak: low box, lapsing
      [weakId]: { ...newCard(), b: 1, r: 4, c: 1, l: 2 },
      // seen and solid
      [seenId]: { ...newCard(), b: 5, r: 6, c: 6 },
    },
  },
};

const RUNS = 400;
let weakHits = 0;
let seenHits = 0;
let unseenHits = 0;
for (let seed = 0; seed < RUNS; seed++) {
  const ids = new Set(sampleForm(weakState, seed, bank).questionIds);
  if (ids.has(weakId)) weakHits++;
  if (ids.has(seenId)) seenHits++;
  if (ids.has(unseenId)) unseenHits++;
}
check(
  "a weak card is surfaced more than a well-known one",
  weakHits > seenHits,
  `weak ${weakHits} vs solid ${seenHits} of ${RUNS}`,
);
check(
  "an unseen card still outranks both — novelty first",
  unseenHits > weakHits,
  `unseen ${unseenHits} vs weak ${weakHits} of ${RUNS}`,
);

/* Grading */
function activeFrom(ids: string[], answerAll: number): ActiveAttempt {
  const answers: ActiveAttempt["answers"] = {};
  ids.slice(0, answerAll).forEach((id) => (answers[id] = ["A"]));
  return {
    id: "t1", seed: 1, startedAt: Date.now() - 60_000,
    deadlineAt: Date.now() + 60_000, questionIds: ids,
    answers, flagged: [], cursor: 0, isFormA: true,
  };
}

const allRight = gradeAttempt(activeFrom(first.questionIds, 63), false, lookup);
check("all correct grades 63/63", allRight.raw === 63, String(allRight.raw));
check("all correct scores the maximum", allRight.scaled === EXAM.scaleMax);
check("all correct passes", allRight.passed);

const none = gradeAttempt(activeFrom(first.questionIds, 0), false, lookup);
check("unanswered items are scored incorrect", none.raw === 0);
check("a blank paper does not pass", !none.passed);

const boundary = gradeAttempt(activeFrom(first.questionIds, 45), false, lookup);
check("45 correct passes", boundary.passed, String(boundary.scaled));
const belowBoundary = gradeAttempt(activeFrom(first.questionIds, 44), false, lookup);
check("44 correct fails", !belowBoundary.passed, String(belowBoundary.scaled));

const totals = DOMAINS.every(
  (d) => allRight.byDomain[d.id]?.total === BLUEPRINT[d.id],
);
check("per-domain totals match the blueprint", totals,
  DOMAINS.map((d) => `${d.code}:${allRight.byDomain[d.id]?.total}`).join(" "));
check(
  "per-domain correct sums to the raw score",
  Object.values(allRight.byDomain).reduce((a, b) => a + b.correct, 0) === allRight.raw,
);
check("timed-out attempts are marked",
  gradeAttempt(activeFrom(first.questionIds, 10), true, lookup).timedOut);
check("correctness array is parallel to question ids",
  allRight.correctness.length === allRight.questionIds.length);

/* Shuffle sanity */
const rng = makeRng(7);
const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = shuffle(original, rng);
check("shuffle preserves every element",
  [...shuffled].sort((a, b) => a - b).join() === original.join());
check("shuffle does not mutate its input", original.join() === "1,2,3,4,5,6,7,8,9,10");

console.log(failures === 0 ? "\nall exam checks passed" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
