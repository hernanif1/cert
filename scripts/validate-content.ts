/**
 * Content validator. Wired as `prebuild`, so it runs before every build.
 *
 * tsc catches structure; this catches semantics — the things a type cannot
 * express: that weights sum to 1, that every objective has exactly one lesson,
 * that a lesson has not drifted off the objective it claims, that the question
 * bank can actually fill a 63-item mock form, and that an LLM-authored bank has
 * not quietly become B-biased.
 *
 * Errors exit 1. Warnings print and exit 0.
 */
import { DOMAINS } from "../content/domains";
import { AUTHORED } from "../content/lessons/registry";
import { QUESTIONS as BANK } from "../content/questions";
import {
  correctIdsOf,
  type ChoiceId,
  type Lesson,
  type Question,
} from "../content/schema";

const errors: string[] = [];
const warnings: string[] = [];

/**
 * Content lands in batches (Phase 7), so an INCOMPLETE bank is a normal
 * intermediate state and must not break the build. Shortfalls warn; an
 * OVERSHOOT is always an error, because writing more items than an objective
 * asks for is a real mistake rather than unfinished work.
 *
 * `npm run validate -- --strict` (used before release) turns every shortfall
 * into an error.
 */
const STRICT = process.argv.includes("--strict");
const shortfall = (where: string, msg: string) =>
  (STRICT ? errors : warnings).push(`${where}: ${msg}`);

const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);

/* The real content. Imported from the registry rather than content/lessons,
 * which is server-only and cannot load in a plain Node context. */
const LESSONS: Lesson[] = Object.values(AUTHORED);
const QUESTIONS: Question[] = BANK;

const EXPECTED_MOCK_TOTAL = 63;
const LESSON_MIN_WORDS = 750;
const LESSON_MAX_WORDS = 1300;
const MIN_TRAPS = 3;
const MAX_TRAPS = 5;

/* ───────────────────────────── Blueprint ───────────────────────────── */

function checkBlueprint(): void {
  const weight = DOMAINS.reduce((a, d) => a + d.weight, 0);
  if (Math.abs(weight - 1) > 1e-9) {
    err("blueprint", `domain weights sum to ${weight}, expected exactly 1`);
  }

  const mock = DOMAINS.reduce((a, d) => a + d.mockItemCount, 0);
  if (mock !== EXPECTED_MOCK_TOTAL) {
    err("blueprint", `mockItemCount sums to ${mock}, expected ${EXPECTED_MOCK_TOTAL}`);
  }

  const seenDomainSlug = new Set<string>();
  const seenLessonSlug = new Set<string>();
  const seenObjectiveId = new Set<string>();

  for (const d of DOMAINS) {
    if (seenDomainSlug.has(d.slug)) err("blueprint", `duplicate domain slug ${d.slug}`);
    seenDomainSlug.add(d.slug);

    if (!d.slug.startsWith(`${d.id}-`)) {
      err(d.slug, `domain slug must start with its number (${d.id}-)`);
    }
    if (d.code !== `D${d.id}`) err(d.slug, `code ${d.code} does not match id ${d.id}`);

    for (const o of d.objectives) {
      if (seenObjectiveId.has(o.id)) err("blueprint", `duplicate objective id ${o.id}`);
      seenObjectiveId.add(o.id);

      if (seenLessonSlug.has(o.slug)) err("blueprint", `duplicate lesson slug ${o.slug}`);
      seenLessonSlug.add(o.slug);

      if (!o.id.startsWith(`${d.id}.`)) {
        err(o.slug, `objective id ${o.id} does not belong to domain ${d.id}`);
      }
      // Slug must encode domain and objective: "3-5-...".
      const [dPart, oPart] = o.id.split(".");
      if (!o.slug.startsWith(`${dPart}-${oPart}-`)) {
        err(o.slug, `slug must start with "${dPart}-${oPart}-"`);
      }
      if (!/^[a-z0-9-]+$/.test(o.slug)) err(o.slug, "slug must be kebab-case");
      if (o.drillTarget < 4) {
        err(o.slug, `drillTarget ${o.drillTarget} is below the floor of 4`);
      }
      if (!o.text.trim()) err(o.slug, "objective text is empty");
    }
  }
}

/* ────────────────────────────── Lessons ────────────────────────────── */

const OBJECTIVE_TEXT = new Map(
  DOMAINS.flatMap((d) => d.objectives.map((o) => [o.id, o.text] as const)),
);
const OBJECTIVE_SLUG = new Map(
  DOMAINS.flatMap((d) => d.objectives.map((o) => [o.id, o.slug] as const)),
);

function wordCount(l: Lesson): number {
  const parts: string[] = [l.summary];
  for (const b of l.body) {
    switch (b.kind) {
      case "prose":
      case "callout":
        parts.push(b.md);
        break;
      case "heading":
        parts.push(b.text);
        break;
      case "list":
        parts.push(b.items.join(" "));
        break;
      case "table":
        parts.push(b.rows.flat().join(" "), b.headers.join(" "));
        break;
      case "example":
        parts.push(b.scenario, b.walkthrough, b.takeaway);
        break;
      // code and practice blocks are not prose and do not count
    }
  }
  for (const t of l.traps) parts.push(t.trap, t.why, t.instead ?? "");
  return parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

function checkLessons(): void {
  const bySlug = new Map<string, Lesson>();

  for (const l of LESSONS) {
    const where = l.slug;
    if (bySlug.has(l.slug)) err(where, "duplicate lesson slug");
    bySlug.set(l.slug, l);

    const expectedText = OBJECTIVE_TEXT.get(l.id);
    if (expectedText === undefined) {
      err(where, `objective ${l.id} does not exist in the blueprint`);
    } else if (l.objective !== expectedText) {
      // The anti-drift anchor.
      err(
        where,
        `objective text does not match the blueprint verbatim.\n    lesson: ${l.objective}\n    guide:  ${expectedText}`,
      );
    }
    if (OBJECTIVE_SLUG.get(l.id) !== l.slug) {
      err(where, `slug does not match the blueprint slug for ${l.id}`);
    }

    const words = wordCount(l);
    if (words < LESSON_MIN_WORDS || words > LESSON_MAX_WORDS) {
      err(where, `${words} words, expected ${LESSON_MIN_WORDS}-${LESSON_MAX_WORDS}`);
    }

    if (l.traps.length < MIN_TRAPS || l.traps.length > MAX_TRAPS) {
      err(where, `${l.traps.length} traps, expected ${MIN_TRAPS}-${MAX_TRAPS}`);
    }
    for (const t of l.traps) {
      if (t.why.length < 60) err(where, `trap ${t.id}: "why" is under 60 chars`);
    }

    if (l.sources.length === 0) err(where, "no sources");
    for (const s of l.sources) {
      if (!/^(https:\/\/|\/)/.test(s.url)) {
        err(where, `source "${s.label}" must be https or a site-relative path`);
      }
    }

    // Template-literal authoring breaks on fenced code inside prose strings.
    for (const b of l.body) {
      const text = b.kind === "prose" || b.kind === "callout" ? b.md : "";
      if (text.includes("```")) {
        err(where, "fenced code block inside prose — use a `code` block instead");
      }
    }

    if (l.practiceQuestionIds.length < 1 || l.practiceQuestionIds.length > 2) {
      err(where, `${l.practiceQuestionIds.length} practice questions, expected 1-2`);
    }
  }

  const missing = [...OBJECTIVE_SLUG.values()].filter((s) => !bySlug.has(s));
  if (missing.length > 0) {
    shortfall("lessons", `${missing.length} of ${OBJECTIVE_SLUG.size} not yet authored`);
  }
}

/* ───────────────────────────── Questions ───────────────────────────── */

function checkQuestions(): void {
  const byId = new Map<string, Question>();
  const featured = new Map<string, string>();

  for (const q of QUESTIONS) {
    const where = q.id;
    if (byId.has(q.id)) err(where, "duplicate question id");
    byId.set(q.id, q);

    if (!/^D[1-7]-q\d{3}$/.test(q.id)) err(where, "id must match D<n>-q<nnn>");
    if (!q.id.startsWith(`D${q.domain}-`)) {
      err(where, `id prefix does not match domain ${q.domain}`);
    }
    if (!q.objective.startsWith(`${q.domain}.`)) {
      err(where, `objective ${q.objective} does not belong to domain ${q.domain}`);
    }
    if (!OBJECTIVE_TEXT.has(q.objective)) {
      err(where, `objective ${q.objective} does not exist in the blueprint`);
    }

    if (q.choices.length < 4 || q.choices.length > 6) {
      err(where, `${q.choices.length} choices, expected 4-6`);
    }
    const ids = q.choices.map((c) => c.id);
    const expectedIds = "ABCDEF".slice(0, q.choices.length).split("");
    if (ids.join("") !== expectedIds.join("")) {
      err(where, `choice ids must be contiguous from A: got ${ids.join("")}`);
    }

    const correct = correctIdsOf(q);
    for (const c of correct) {
      if (!ids.includes(c)) err(where, `key ${c} is not a choice`);
    }
    if (q.type === "multi") {
      if (q.correct.length !== q.selectCount) {
        err(where, `selectCount ${q.selectCount} != ${q.correct.length} keyed answers`);
      }
      if (q.correct.length >= q.choices.length) {
        err(where, "every choice is keyed correct");
      }
      if (new Set(q.correct).size !== q.correct.length) {
        err(where, "duplicate ids in the answer key");
      }
    }

    for (const c of q.choices) {
      if (correct.includes(c.id)) continue;
      if (!c.rationale || c.rationale.length < 40) {
        err(where, `distractor ${c.id} needs a rationale of at least 40 chars`);
      }
    }
    if (q.explanation.length < 120) {
      err(where, `explanation is ${q.explanation.length} chars, expected >= 120`);
    }
  }

  // Every featured practice question must exist, be drill-pool, share the
  // lesson's objective, and be featured by at most one lesson.
  for (const l of LESSONS) {
    for (const qid of l.practiceQuestionIds) {
      const q = byId.get(qid);
      if (!q) {
        err(l.slug, `practice question ${qid} does not exist`);
        continue;
      }
      if (q.pool !== "drill") err(l.slug, `practice question ${qid} is not in the drill pool`);
      if (q.objective !== l.id) {
        err(l.slug, `practice question ${qid} targets ${q.objective}, not ${l.id}`);
      }
      const owner = featured.get(qid);
      if (owner) err(l.slug, `practice question ${qid} is also featured by ${owner}`);
      featured.set(qid, l.slug);
    }
  }

  checkCounts();
  checkAnswerBalance();
}

function checkCounts(): void {
  for (const d of DOMAINS) {
    const drill = QUESTIONS.filter((q) => q.domain === d.id && q.pool === "drill" && !q.retired);
    const reserved = QUESTIONS.filter((q) => q.domain === d.id && q.pool === "reserved" && !q.retired);
    const target = d.objectives.reduce((a, o) => a + o.drillTarget, 0);

    if (drill.length > target) {
      err(d.code, `${drill.length} drill questions, expected ${target} — overshoot`);
    } else if (drill.length < target) {
      shortfall(d.code, `${drill.length}/${target} drill questions authored`);
    }

    if (reserved.length > d.mockItemCount) {
      err(d.code, `${reserved.length} reserved questions, expected ${d.mockItemCount} — overshoot`);
    } else if (reserved.length < d.mockItemCount) {
      shortfall(d.code, `${reserved.length}/${d.mockItemCount} reserved questions authored`);
    }

    // The check that exists so /mock-exam cannot fail at runtime in front of a user.
    const available = drill.length + reserved.length;
    if (available < d.mockItemCount) {
      shortfall(d.code, `only ${available} items available, cannot fill ${d.mockItemCount} mock slots`);
    }

    for (const o of d.objectives) {
      const n = drill.filter((q) => q.objective === o.id).length;
      if (n > o.drillTarget) {
        err(o.slug, `${n} drill questions, expected ${o.drillTarget} — overshoot`);
      } else if (n < o.drillTarget) {
        shortfall(o.slug, `${n}/${o.drillTarget} drill questions authored`);
      }
    }

    const analytic = drill.filter((q) => q.cognitiveLevel !== "recall").length;
    if (drill.length > 0 && analytic / drill.length < 0.6) {
      warn(d.code, `only ${Math.round((analytic / drill.length) * 100)}% application/analysis, expected >= 60%`);
    }
  }

  if (QUESTIONS.length >= 40) {
    const multi = QUESTIONS.filter((q) => q.type === "multi").length;
    const share = multi / QUESTIONS.length;
    if (share < 0.15 || share > 0.2) {
      warn("bank", `${Math.round(share * 100)}% multi-select, expected 15-20%`);
    }
  }
}

/** LLM-authored banks are reliably B-biased. Nothing else catches this. */
function checkAnswerBalance(): void {
  const singles = QUESTIONS.filter((q) => q.type === "single");
  if (singles.length < 20) return;

  const tally = (qs: Question[], where: string) => {
    const counts: Partial<Record<ChoiceId, number>> = {};
    for (const q of qs) {
      const key = correctIdsOf(q)[0];
      counts[key] = (counts[key] ?? 0) + 1;
    }
    for (const [letter, n] of Object.entries(counts)) {
      const pct = n / qs.length;
      if (pct > 0.35) {
        err(where, `answer ${letter} is the key for ${Math.round(pct * 100)}% of single-answer items (max 35%)`);
      }
    }
  };

  tally(singles, "bank");
  for (const d of DOMAINS) {
    const qs = singles.filter((q) => q.domain === d.id);
    if (qs.length >= 20) tally(qs, d.code);
  }
}

/* ────────────────────────────── Report ─────────────────────────────── */

function report(): void {
  const rows = DOMAINS.map((d) => {
    const lessons = LESSONS.filter((l) => l.domain === d.id).length;
    const drill = QUESTIONS.filter((q) => q.domain === d.id && q.pool === "drill").length;
    const reserved = QUESTIONS.filter((q) => q.domain === d.id && q.pool === "reserved").length;
    const drillTarget = d.objectives.reduce((a, o) => a + o.drillTarget, 0);
    return {
      Domain: d.code,
      Weight: `${Math.round(d.weight * 100)}%`,
      Lessons: `${lessons}/${d.objectives.length}`,
      Drill: `${drill}/${drillTarget}`,
      Mock: `${reserved}/${d.mockItemCount}`,
    };
  });
  console.table(rows);
  console.log(
    `Totals: lessons ${LESSONS.length}/38 · questions ${QUESTIONS.length}/263`,
  );
}

function main(): void {
  checkBlueprint();
  checkLessons();
  checkQuestions();
  report();

  for (const w of warnings) console.warn(`  warn  ${w}`);
  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):`);
    for (const e of errors) console.error(`  error  ${e}`);
    process.exit(1);
  }
  const complete = LESSONS.length === 38 && QUESTIONS.length === 263;
  console.log(
    warnings.length > 0
      ? `\nvalidate-content: ok with ${warnings.length} warning(s)${STRICT ? "" : " (authoring in progress)"}`
      : `\nvalidate-content: ok${complete ? " — content complete" : ""}`,
  );
}

main();
