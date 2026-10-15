import type { DomainNumber, ObjectiveId } from "@/content/schema";

/**
 * The pre-exam self-assessment checklist.
 *
 * These are CLAIMS, not completions: the reader ticks a box because they can
 * actually do the thing, which is why nothing here feeds the readiness score
 * (lib/exam/readiness.ts). Ticking a box you have not earned should cost you
 * nothing but honesty.
 *
 * `id` is the storage key and is NEVER renamed. Reworded text keeps its tick;
 * a renamed id silently loses it. That is the same rule lesson slugs follow.
 *
 * `objective` points at the lesson that covers the item, so every row can link
 * to the prose behind it. Items with no lesson (exam-day preparation) carry
 * `null`, and may name a site destination instead — a key, not a href, so the
 * link's LABEL comes from the same nav dictionary the sidebar uses and is
 * translated once.
 */

export interface ChecklistItem {
  /** Stable storage key. Never rename — see the note above. */
  id: string;
  /** English statement, first person. The exam-guide wording is not normative
   *  here; this is the reader's own "can I do this" list. */
  text: string;
  /** Objective whose lesson covers it, or null when no lesson does. */
  objective: ObjectiveId | null;
  /** Where an item WITHOUT a lesson points, if anywhere. */
  link?: "mock-exam";
}

export interface ChecklistGroup {
  /** A domain number, or "prep" for the exam-day items that span all seven. */
  domain: DomainNumber | "prep";
  items: ChecklistItem[];
}

/** Item order inside a group is the reader's own order, not the blueprint's. */
export const CHECKLIST: ChecklistGroup[] = [
  {
    domain: 1,
    items: [
      {
        id: "d1-pattern-choice",
        text: "I can choose between augmented LLM, workflow, and agentic patterns from a scenario description",
        objective: "1.3",
      },
      {
        id: "d1-multi-agent",
        text: "I know when multi-agent decomposition is justified and when a single agent wins",
        objective: "1.4",
      },
      {
        id: "d1-value-pillars",
        text: "I can anchor an architecture recommendation to efficiency, cost, or performance SLA pillars",
        objective: "1.6",
      },
    ],
  },
  {
    domain: 2,
    items: [
      {
        id: "d2-model-tier",
        text: "I can pick a model tier from capability, cost, and latency requirements",
        objective: "2.1",
      },
      {
        id: "d2-prompt-caching",
        text: "I know when prompt caching pays off and the three classic cache-breaking mistakes",
        objective: "2.5",
      },
      {
        id: "d2-prompt-technique",
        text: "I can choose between zero-shot, few-shot, and chain-of-thought for a given task",
        objective: "2.3",
      },
    ],
  },
  {
    domain: 3,
    items: [
      {
        id: "d3-integration-mechanism",
        text: "I can select MCP, direct API, or agent-to-agent integration from a scenario",
        objective: "3.7",
      },
      {
        // Spans 3.1 (capability bloat) and 3.8 (the contrast itself); 3.8 is
        // where the two are put side by side.
        id: "d3-capability-bloat",
        text: "I can spot capability bloat and explain progressive discovery vs monolithic context",
        objective: "3.8",
      },
      {
        id: "d3-per-user-auth",
        text: "I know why per-user authorization beats a shared service account",
        objective: "3.2",
      },
      {
        id: "d3-chunking",
        text: "I can reason through chunk size trade-offs and know when to add re-ranking",
        objective: "3.5",
      },
      {
        id: "d3-retrieval-quality",
        text: "I fix retrieval quality instead of stuffing more context",
        objective: "3.6",
      },
    ],
  },
  {
    domain: 4,
    items: [
      {
        id: "d4-metrics-failure-modes",
        text: "I can match evaluation metrics to failure modes",
        objective: "4.1",
      },
      {
        id: "d4-eval-dataset",
        text: "I can design an eval dataset that mirrors production and stays held out",
        objective: "4.2",
      },
      {
        id: "d4-grader-split",
        text: "I know how code graders, LLM-as-judge, and human review divide the testing work",
        objective: "4.2",
      },
      {
        id: "d4-ab-test",
        text: "I can run a clean A/B test: one variable, predefined metric, sufficient sample",
        objective: "4.3",
      },
      {
        id: "d4-diagnose",
        text: "I can diagnose hallucination vs retrieval failure vs model mismatch from symptoms",
        objective: "4.4",
      },
    ],
  },
  {
    domain: 5,
    items: [
      {
        id: "d5-guardrail-layers",
        text: "I can list the five guardrail layers in order",
        objective: "5.1",
      },
      {
        id: "d5-hitl-placement",
        text: "I know the human-in-the-loop placement rules for irreversible and regulated actions",
        objective: "5.3",
      },
      {
        id: "d5-compliance-regimes",
        text: "I can distinguish GDPR, HIPAA, and FedRAMP in one line each",
        objective: "5.4",
      },
    ],
  },
  {
    domain: 6,
    items: [
      {
        id: "d6-lifecycle-phases",
        text: "I can name the lifecycle phases in order and the outputs of discovery",
        objective: "6.5",
      },
      {
        id: "d6-adr",
        text: "I know what goes into an architecture decision record",
        objective: "6.4",
      },
    ],
  },
  {
    domain: 7,
    items: [
      {
        id: "d7-team-config",
        text: "I know why team standards live in version-controlled project config for Claude Code",
        objective: "7.1",
      },
    ],
  },
  {
    domain: "prep",
    items: [
      {
        // No single page lists the trap patterns — they are called out lesson by
        // lesson — so this row deliberately carries no link.
        id: "prep-trap-patterns",
        text: "I have reviewed all nine trap-answer patterns",
        objective: null,
      },
      {
        id: "prep-timed-mocks",
        text: "I have completed at least two full-length timed practice tests",
        objective: null,
        link: "mock-exam",
      },
    ],
  },
];
