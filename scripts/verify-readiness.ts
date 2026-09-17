/**
 * Sanity checks for the scoring and readiness math, run against synthetic
 * state. These are the numbers the whole dashboard rests on.
 */
import { DOMAINS } from "../content/domains";
import { EXAM } from "../content/exam-facts";
import { toScaledScore, passed, minimumCorrectToPass } from "../lib/exam/scoring";
import { computeReadiness } from "../lib/exam/readiness";
import { EMPTY_STATE, type AppState, type MockAttempt } from "../lib/storage/schema";
import type { DomainNumber } from "../content/schema";

let failures = 0;
function check(name: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : "FAIL  "} ${name}${detail ? ` — ${detail}` : ""}`);
}

/* Scoring */
check("0 correct floors at scale minimum", toScaledScore(0, 63) === EXAM.scaleMin);
check("all correct hits scale maximum", toScaledScore(63, 63) === EXAM.scaleMax);
check("44/63 fails", !passed(toScaledScore(44, 63)), String(toScaledScore(44, 63)));
check("45/63 passes", passed(toScaledScore(45, 63)), String(toScaledScore(45, 63)));
check("cut anchors at 70% raw", toScaledScore(70, 100) === EXAM.passScaled);
check("minimum to pass is 45", minimumCorrectToPass(63) === 45);
check(
  "random guessing (~24%) scores well below the cut",
  toScaledScore(15, 63) < 400,
  String(toScaledScore(15, 63)),
);
check(
  "monotonic across the hinge",
  [...Array(64).keys()].every((n, i, a) =>
    i === 0 ? true : toScaledScore(n, 63) >= toScaledScore(a[i - 1], 63),
  ),
);

/* Readiness */
const allSlugs = DOMAINS.flatMap((d) => d.objectives.map((o) => o.slug));

function withLessons(n: number): AppState {
  const lessons: AppState["lessons"] = {};
  for (const slug of allSlugs.slice(0, n)) {
    lessons[slug] = { completedAt: 1, viewedAt: 1 };
  }
  return { ...EMPTY_STATE, lessons };
}

function attempt(scaled: number, raw: number, weakDomain?: DomainNumber): MockAttempt {
  const byDomain = {} as MockAttempt["byDomain"];
  for (const d of DOMAINS) {
    const correct = weakDomain === d.id ? 1 : d.mockItemCount;
    byDomain[d.id] = { correct, total: d.mockItemCount };
  }
  return {
    id: `a${scaled}`, seed: 1, startedAt: 1,
    submittedAt: Date.now(), durationMs: 1000, timedOut: false,
    raw, total: 63, scaled, passed: scaled >= EXAM.passScaled,
    byDomain, questionIds: [], correctness: [],
  };
}

const empty = computeReadiness(EMPTY_STATE);
check("empty state scores 0", empty.score === 0, String(empty.score));
check("empty state is Just Beginning", empty.label === "Just Beginning");
check("empty state reports mock locked", empty.mockLocked);

const allLessons = computeReadiness(withLessons(38));
check(
  "all 38 lessons alone earns the full 25, and no more",
  allLessons.lessons.earned === 25 && allLessons.score === 25,
  `score=${allLessons.score}`,
);
check(
  "lessons alone cannot reach Exam Ready",
  allLessons.label === "Building Foundations",
  allLessons.label,
);

/* The hard gate: a high composite must not outrank a failing mock. */
const highButFailing: AppState = {
  ...withLessons(38),
  examHistory: [attempt(900, 57), attempt(910, 58), attempt(690, 42)],
};
const gated = computeReadiness(highButFailing);
check(
  "failing last mock never reaches Exam Ready",
  gated.label !== "Exam Ready",
  `${gated.label} @ ${gated.score}`,
);
check(
  "failing last mock is called out even when the cap does not bind",
  (gated.gateReason ?? "").includes("690"),
  gated.gateReason ?? "(no reason given)",
);

const lowAndFailing = computeReadiness({
  ...withLessons(4),
  examHistory: [attempt(500, 30)],
});
check(
  "a low composite with a failing mock is not nagged",
  lowAndFailing.gateReason === null,
  lowAndFailing.gateReason ?? "",
);

const weak: AppState = {
  ...withLessons(38),
  examHistory: [attempt(900, 57), attempt(905, 57), attempt(910, 58, 3)],
};
const weakGated = computeReadiness(weak);
check(
  "a domain under 60% on the last mock blocks Exam Ready",
  weakGated.label !== "Exam Ready",
  `${weakGated.label} — ${weakGated.gateReason ?? ""}`,
);

const fewLessons: AppState = {
  ...withLessons(10),
  examHistory: [attempt(950, 60), attempt(950, 60), attempt(950, 60)],
};
const lessonGated = computeReadiness(fewLessons);
check(
  "passing mocks with only 10 lessons still blocks Exam Ready",
  lessonGated.label !== "Exam Ready",
  `${lessonGated.label} — ${lessonGated.gateReason ?? ""}`,
);

const single = computeReadiness({ ...withLessons(38), examHistory: [attempt(820, 52)] });
const triple = computeReadiness({
  ...withLessons(38),
  examHistory: [attempt(820, 52), attempt(820, 52), attempt(820, 52)],
});
check(
  "a lone attempt is discounted 15% against three",
  single.mock.earned < triple.mock.earned,
  `${single.mock.earned} < ${triple.mock.earned}`,
);
check("mock component caps at its weight", triple.mock.earned === triple.mock.max,
  `${triple.mock.earned}/${triple.mock.max}`);
check(
  "a guessing-level mock earns nothing",
  computeReadiness({ ...EMPTY_STATE, examHistory: [attempt(311, 15)] }).mock.earned === 0,
);

console.log(failures === 0 ? "\nall readiness checks passed" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
