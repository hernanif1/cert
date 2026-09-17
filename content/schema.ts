/**
 * The content contract.
 *
 * All 38 lessons and 263 questions are authored as typed TS objects and
 * declared with `satisfies`, which makes `tsc --noEmit` a free, hard schema
 * gate. That is the whole reason this is TypeScript rather than MDX or JSON:
 * MDX enforces nothing, and JSON is miserable to author 1000 words of prose in.
 *
 * Use `satisfies Lesson`, never `: Lesson` — `satisfies` type-checks while
 * preserving literal types, so ids stay narrow for route generation.
 */

export const SCHEMA_VERSION = 1 as const;

export type DomainNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** "3.5" — domain and objective, matching the exam guide's numbering. */
export type ObjectiveId = `${DomainNumber}.${number}`;

/** "D3-q014". IMMUTABLE once shipped: drill state is keyed by this. */
export type QuestionId = `D${DomainNumber}-q${string}`;

/* ─────────────────────────────── Blueprint ─────────────────────────────── */

export interface Objective {
  id: ObjectiveId;
  /**
   * VERBATIM from exam guide §6. The validator does string-equality between
   * this and the lesson that claims it — the anti-drift anchor that stops a
   * lesson quietly wandering off its objective.
   */
  text: string;
  /** Human-facing lesson title. Free to be friendlier than `text`. */
  title: string;
  slug: string;
  /** Drill-pool items authored for this objective. Floor of 4. */
  drillTarget: number;
}

export interface Domain {
  id: DomainNumber;
  code: `D${DomainNumber}`;
  slug: string;
  title: string;
  /** Fraction, not percent. Must sum to exactly 1 across all domains. */
  weight: number;
  /** Items this domain contributes to a 63-item mock form. Sums to 63. */
  mockItemCount: number;
  blurb: string;
  objectives: Objective[];
}

/* ────────────────────────────── Lesson body ────────────────────────────── */

export type CalloutVariant =
  | "key-concept"
  | "exam-distractor"
  | "pitfall"
  | "note";

/**
 * A discriminated union so BlockRenderer can switch with a `never`
 * exhaustiveness check: add a block kind and the build fails until it renders.
 *
 * Prose is markdown, rendered to HTML at BUILD TIME inside Server Components,
 * so the markdown parser never reaches the client bundle.
 */
export type LessonBlock =
  | { kind: "prose"; md: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | {
      kind: "callout";
      variant: CalloutVariant;
      title?: string;
      md: string;
    }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] }
  | {
      kind: "code";
      lang: "text" | "json" | "python" | "ts" | "bash";
      code: string;
    }
  | {
      kind: "example";
      title: string;
      scenario: string;
      walkthrough: string;
      takeaway: string;
    }
  | { kind: "practice"; questionId: QuestionId };

export interface ExamTrap {
  /** Stable within the lesson: "t1". */
  id: string;
  /** The tempting but wrong statement. */
  trap: string;
  /** Why it is wrong. Validator requires >= 60 chars. */
  why: string;
  /** What is correct instead. Strongly encouraged. */
  instead?: string;
}

export interface Source {
  label: string;
  url: string;
  kind: "exam-guide" | "anthropic-docs" | "anthropic-blog" | "external";
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Lesson {
  schemaVersion: typeof SCHEMA_VERSION;
  id: ObjectiveId;
  slug: string;
  domain: DomainNumber;
  /** Must string-equal the objective text in domains.ts. */
  objective: string;
  title: string;
  /** Two sentences. Used on cards and as the meta description. */
  summary: string;
  body: LessonBlock[];
  keyTerms?: KeyTerm[];
  traps: ExamTrap[];
  /** 1–2 drill-pool questions featured inline on the lesson page. */
  practiceQuestionIds: QuestionId[];
  sources: Source[];
  relatedLessons?: ObjectiveId[];
}

/* ──────────────────────────────── Questions ────────────────────────────── */

export type ChoiceId = "A" | "B" | "C" | "D" | "E" | "F";

export interface Choice {
  id: ChoiceId;
  text: string;
  /**
   * Required on every INCORRECT choice (validator: >= 40 chars). Per-distractor
   * rationale is the single biggest quality lever, and it mirrors how the exam
   * guide's own answer key explains its items.
   */
  rationale?: string;
}

interface QuestionBase {
  schemaVersion: typeof SCHEMA_VERSION;
  id: QuestionId;
  domain: DomainNumber;
  objective: ObjectiveId;
  /** Scenario plus the question. Inline markdown; no fenced code blocks. */
  stem: string;
  choices: Choice[];
  /** Ties the key back to the objective. Validator: >= 120 chars. */
  explanation: string;
  difficulty: 1 | 2 | 3;
  cognitiveLevel: "recall" | "application" | "analysis";
  /** "drill" is the practice pool; "reserved" is Mock Form A. */
  pool: "drill" | "reserved";
  tags?: string[];
  sourceRef?: string;
  /** Tombstone. Never delete a shipped question — drill state is keyed by id. */
  retired?: true;
}

export interface SingleAnswerQuestion extends QuestionBase {
  type: "single";
  correct: ChoiceId;
}

export interface MultiAnswerQuestion extends QuestionBase {
  type: "multi";
  correct: ChoiceId[];
  /** Must equal correct.length. The "Select TWO." line is generated from it. */
  selectCount: 2 | 3;
}

export type Question = SingleAnswerQuestion | MultiAnswerQuestion;

/** How many responses an item asks for — always derived, never authored twice. */
export function selectCountOf(q: Question): number {
  return q.type === "multi" ? q.selectCount : 1;
}

export function correctIdsOf(q: Question): ChoiceId[] {
  return q.type === "multi" ? q.correct : [q.correct];
}
