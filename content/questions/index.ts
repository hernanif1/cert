import type {
  DomainNumber,
  ObjectiveId,
  Question,
  QuestionId,
} from "@/content/schema";

/**
 * The question bank: one central pool, referenced by id.
 *
 * Questions deliberately do NOT live inside lesson files. A lesson's Practice
 * Scenario is a render of `practiceQuestionIds[0]`, so an item has exactly one
 * identity and exactly one drill card. Colocating would give the same question
 * two identities and make its review history ambiguous.
 *
 * `pool: "drill"` is the 200-item practice pool; `pool: "reserved"` is the
 * 63-item Mock Form A, which drill never touches until a first mock is taken.
 *
 * Question ids are IMMUTABLE once shipped — drill state is keyed by them. A bad
 * question gets `retired: true`, never deletion or renumbering.
 *
 * Authored in Phase 7. The three items below are transcribed from the exam
 * guide's own §8 sample questions — the only calibrated data we have on real
 * item style, so they anchor the voice of everything written after them.
 */
import { questions as d2_5 } from "@/content/questions/d2/2-5";
import { questions as d3_1 } from "@/content/questions/d3/3-1";
import { questions as d3_5 } from "@/content/questions/d3/3-5";
import { questions as d4_4 } from "@/content/questions/d4/4-4";

export const QUESTIONS: Question[] = [...d2_5, ...d3_1, ...d3_5, ...d4_4];

const BY_ID = new Map<string, Question>(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: QuestionId): Question | undefined {
  return BY_ID.get(id);
}

export function questionsByObjective(objective: ObjectiveId): Question[] {
  return QUESTIONS.filter((q) => q.objective === objective && !q.retired);
}

export function drillPool(): Question[] {
  return QUESTIONS.filter((q) => q.pool === "drill" && !q.retired);
}

export function drillPoolByDomain(domain: DomainNumber): Question[] {
  return drillPool().filter((q) => q.domain === domain);
}

export function reservedForm(): Question[] {
  return QUESTIONS.filter((q) => q.pool === "reserved" && !q.retired);
}

/** Objective ids that have at least one live question. */
export const OBJECTIVES_WITH_QUESTIONS: Set<string> = new Set(
  QUESTIONS.filter((q) => !q.retired).map((q) => q.objective),
);
