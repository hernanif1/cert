import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.2",
  slug: "5-2-risks-limitations-failure-modes",
  domain: 5,
  objective: "Identify risks, limitations, and failure modes of LLM systems",
  title: "Risks, Limitations and Failure Modes",
  summary:
    "LLM systems fail plausibly rather than loudly, and chained steps compound small per-step error rates into large end-to-end ones. This objective is about naming a failure mode precisely enough that the right control follows from it.",

  body: [
    {
      kind: "prose",
      md: "Conventional software fails loudly: a stack trace, a 500, a timeout. The characteristic LLM failure is a fluent, well-formatted, confident answer that is wrong, returned with a 200 and a healthy latency. Every risk conversation in this domain starts there, because it means the monitoring you inherited from ordinary services will report perfect health during a quality incident.\n\nThe exam rewards precision about *which* failure is happening. \"The model hallucinated\" is true of most bad outputs and actionable for none of them.",
    },

    { kind: "heading", text: "A taxonomy worth memorizing" },
    {
      kind: "table",
      caption: "Failure classes and where their control belongs",
      headers: ["Class", "Example", "Signal", "Control belongs in"],
      rows: [
        [
          "Model-intrinsic",
          "Fabricated citation, arithmetic slip, reversal under pushback",
          "Fluent and confident; varies between runs on the same input",
          "Grounding and external verification",
        ],
        [
          "Context",
          "Right answer exists, wrong chunk retrieved; key detail buried in a long window",
          "The model is faithful to bad context",
          "Retrieval and context construction",
        ],
        [
          "Orchestration",
          "A tool error swallowed and narrated as success; a loop that never terminates",
          "Failure surfaces several steps after its cause",
          "Step validation, budgets, timeouts",
        ],
        [
          "Adversarial",
          "Instructions injected through a retrieved document; system-prompt extraction",
          "Input looks legitimate; the effect shows up in actions",
          "Isolation, scoping, egress control",
        ],
        [
          "Operational drift",
          "Quality degrades after a corpus refresh or a model version change",
          "No code change; correlates with a date",
          "Version pinning and regression evals",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Two properties cut across all five. Output is **non-deterministic**, so an incident may not reproduce and exact-match tests are flaky by construction. And the model's expressed confidence is **not a probability**: hedging and assertiveness are stylistic features of generated text, so tone tells you nothing about whether a claim is grounded.",
    },

    { kind: "heading", text: "Error compounds with steps" },
    {
      kind: "prose",
      md: "The most testable arithmetic in this objective: an agent that must get *n* steps right end to end succeeds at roughly the per-step reliability raised to the power of *n*. Healthy-looking step metrics hide unusable workflows.",
    },
    {
      kind: "table",
      caption: "End-to-end success by chain length",
      headers: ["Steps", "99% per step", "95% per step", "90% per step"],
      rows: [
        ["1", "99%", "95%", "90%"],
        ["5", "95%", "77%", "59%"],
        ["10", "90%", "60%", "35%"],
        ["20", "82%", "36%", "12%"],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "This is why **shortening the chain is a safety control**. Collapsing three probabilistic steps into one deterministic code path removes their failure rates entirely, and it is usually cheaper than raising per-step accuracy. It is also why per-step accuracy is a misleading number to report to a stakeholder: quote end-to-end completion.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When a chained workflow underperforms, *use a more capable model* and *add retries* are both on the menu. Neither touches the arithmetic: retries help transient tool errors and do nothing for a step that silently returns a wrong answer, and a model at 98% per step still loses a third of twenty-step runs.",
    },

    { kind: "heading", text: "Limitations that are properties, not bugs" },
    {
      kind: "list",
      items: [
        "**Knowledge cutoff.** The model has no information about events after training and cannot reliably report where its own cutoff sits. Time-sensitive facts must be retrieved, never recalled.",
        "**No introspection.** A model's account of why it answered as it did is generated text, not a trace of the computation. Useful for debugging a prompt; worthless as an audit record.",
        "**Sycophancy.** Challenging a correct answer often flips it, so an evaluation loop in which a human pushes back repeatedly measures agreeableness rather than accuracy.",
        "**Context is not memory.** The system knows only what was placed in the window this turn; anything that must persist belongs in a store outside it.",
        "**Silent tool failure.** A tool returning an empty result with a 200 looks identical to a tool with nothing to report, and the model will narrate confidently around the gap.",
      ],
    },

    {
      kind: "example",
      title: "Practical example: a twelve-step claims agent that passes every unit test",
      scenario:
        "An agent validates a claim across twelve tool-backed steps. Each tool is measured at 96% correct in isolation and every unit test passes. In a two-week pilot, only 63% of claims complete without an operator having to redo the work.",
      walkthrough:
        "1. **Do the arithmetic.** 0.96 to the twelfth power is about 61%, so the pilot result is the expected consequence of the design, not a defect in any one step.\n2. **Find the silent step.** Traces show step three returning zero rows for ambiguous provider names, with a 200 and no error. Nothing asserted anything, so the run continued.\n3. **Assert postconditions.** Each step now declares what a valid result looks like and fails the run rather than passing a gap downstream.\n4. **Shorten the chain.** Six of the twelve steps were deterministic lookups and joins; merged into one code path, they stop contributing failure probability at all.\n5. **Checkpoint the irreversible step.** Payment authorization now requires an explicit human approval rather than inheriting the confidence of the eleven steps before it.\n6. **Report the right number.** The stakeholder metric becomes end-to-end completion with a failure breakdown, not per-step accuracy.",
      takeaway:
        "None of this was a model-quality problem. It was the ordinary consequence of chaining a probabilistic component and never measuring the chain.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Distrust the incident review that concludes *the model hallucinated*. Ask which class it was: was the context wrong, was a tool result silently empty, did an injected instruction change the plan, or did the corpus change last Tuesday? Each points at a different fix, and only one of them is about the model.",
    },

    { kind: "practice", questionId: "D5-q201" },
  ],

  keyTerms: [
    {
      term: "Silent failure",
      definition:
        "A wrong result delivered with no error signal. The default LLM failure mode, and the reason error-rate dashboards alone cannot detect a quality incident.",
    },
    {
      term: "Compounding error",
      definition:
        "The multiplication of per-step success rates across a chain, so 95% per step over ten steps yields about 60% end to end.",
    },
    {
      term: "Sycophancy",
      definition:
        "The tendency to revise an answer toward what the user appears to want when challenged, independent of whether the original answer was correct.",
    },
    {
      term: "Drift",
      definition:
        "Degradation over time with no code change, caused by shifting inputs, a refreshed corpus, or an upstream model version.",
    },
    {
      term: "Calibration",
      definition:
        "The match between stated confidence and actual correctness. Expressed confidence in generated text is not calibrated, so it cannot be used as a routing signal on its own.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Hallucination can be eliminated with a sufficiently detailed prompt or a more capable model.",
      why: "Generation samples from a distribution over tokens with no internal check against ground truth, so better prompts and models lower the rate but never reach zero, and a system needs verification rather than a prompt that finally works.",
      instead:
        "Ground claims in retrieved sources and verify the consequential ones outside the model.",
    },
    {
      id: "t2",
      trap: "A 95% per-step success rate is comfortably good enough for a ten-step workflow.",
      why: "Step failures multiply rather than average: 0.95 to the tenth power is roughly 60%, so two runs in five fail somewhere even though every step looks healthy on its own dashboard.",
      instead:
        "Measure end-to-end completion, then shorten the chain or checkpoint it.",
    },
    {
      id: "t3",
      trap: "Pinning a sampling parameter makes an LLM system reproducible, so exact-match assertions are safe.",
      why: "The current model family rejects those controls outright, and even where they exist they never guarantee identical tokens; retrieval results, tool responses and context assembly also vary independently of decoding, so the suite stays flaky while measuring the wrong property anyway.",
      instead:
        "Pin the model snapshot and index build for replay, and assert on schema validity, required properties and rubric scores.",
    },
    {
      id: "t4",
      trap: "When the model states high confidence, the answer is more likely to be correct.",
      why: "Expressed confidence is a stylistic feature of the generated text rather than a calibrated estimate, and confident phrasing accompanies fabricated citations as readily as accurate ones.",
      instead:
        "Derive confidence from external signals: retrieval scores, agreement across independent runs, validation against a system of record.",
    },
    {
      id: "t5",
      trap: "If nothing errored in the logs, the run succeeded.",
      why: "The defining LLM failure returns a 200 with fluent, well-formed, wrong content, so error-rate dashboards inherited from conventional services show perfect health throughout a quality incident.",
      instead:
        "Monitor quality signals — groundedness checks, schema validity, user corrections, abandonment — alongside error rates.",
    },
  ],

  practiceQuestionIds: ["D5-q201", "D5-q202"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.4", "5.1"],
} satisfies Lesson;
