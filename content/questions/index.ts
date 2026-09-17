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
 * Authored in Phase 7.
 */
export const QUESTIONS: Question[] = [];

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
