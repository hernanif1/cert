import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.3",
  slug: "4-3-ab-testing-iteration",
  domain: 4,
  objective: "Conduct A/B testing and iterative improvements",
  title: "A/B Testing and Iteration",
  summary:
    "Offline evaluation tells you whether a change is better on your dataset; an A/B test tells you whether it is better for users. The exam probes the discipline around that test — one variable, a sticky randomization unit, a pre-registered duration, and guardrail metrics that can veto a win.",

  body: [
    {
      kind: "prose",
      md: "Offline evaluation and online experimentation answer different questions and neither replaces the other. A golden dataset measures capability against cases you chose; an A/B test measures outcomes against traffic you did not choose, including the inputs nobody thought to write down. A change should clear the cheap gate before it reaches the expensive one.",
    },
    {
      kind: "table",
      caption: "Escalating exposure: each rung buys more signal at more risk",
      headers: ["Stage", "User exposure", "What it can detect", "What it cannot"],
      rows: [
        [
          "Offline eval",
          "None",
          "Quality regressions, format breaks, cost and latency deltas",
          "Anything about real user behavior or real input distribution",
        ],
        [
          "Shadow run",
          "None — the variant runs but its output is discarded",
          "Latency, cost and output divergence on genuine production inputs",
          "Whether users prefer the output, since they never see it",
        ],
        [
          "Canary",
          "A small slice, watched closely",
          "Operational breakage and guardrail violations, quickly",
          "Small effects — the sample is deliberately too small",
        ],
        [
          "A/B test",
          "Randomized split, both arms live",
          "Causal effect on user-facing outcome metrics",
          "Effects smaller than the test was powered to see",
        ],
      ],
    },

    { kind: "heading", text: "Designing the test" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Change one thing.** If the prompt, the model and the retrieval depth all move together, a win is unattributable and a loss is undiagnosable. Bundled changes are the single most common reason an experiment teaches nothing.",
        "**Pick a sticky randomization unit.** Assign by user or session, not per request. Per-request assignment shows one person both variants, which produces an incoherent experience and contaminates every user-level metric.",
        "**Name one primary metric before starting**, plus guardrails — p95 latency, cost per resolved task, escalation rate, refusal rate — that can veto a win on the primary.",
        "**Compute the sample size in advance** from the baseline rate and the smallest effect worth shipping. That number, not impatience, sets the duration, and it usually spans full weekly cycles so weekday and weekend traffic both land in both arms.",
        "**Pre-specify the segments** you will analyze. Slicing after the fact until something looks significant reliably finds noise.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Checking results continuously and stopping the moment *p* drops below 0.05 is the classic way to manufacture a false positive: with repeated looks at accumulating data, a null result will eventually cross the threshold by chance alone. Either run to the pre-registered sample size, or adopt a sequential design whose stopping rule already accounts for repeated inspection.",
    },
    {
      kind: "prose",
      md: "Statistical significance and practical significance are separate tests, and both must pass. At large traffic volumes a 0.2% improvement can be significant at any confidence level you like and still fail to justify a model that costs 40% more to run. The decision rule an architect writes down looks like *ship if the primary metric improves by at least X, no guardrail degrades beyond Y, and the result holds across the pre-specified segments*.\n\nWatch for the two effects that make early readings lie. **Novelty** inflates engagement with anything that looks different, and fades. **Learning** works the other way: users who had adapted to the old behavior perform worse at first and recover. Both argue for running the full planned duration rather than reading the first two days.",
    },
    {
      kind: "example",
      title: "Practical example: testing a rewritten support assistant prompt",
      scenario:
        "A support assistant deflects tier-one tickets. The team has rewritten its system prompt, switched to a smaller model for cost, and raised retrieved-chunk count from three to six. They want to run a one-week A/B test on 50% of traffic and ship if deflection rate improves.",
      walkthrough:
        "1. **Unbundle.** Three changes in one arm means a deflection gain could come from the prompt while the model swap quietly costs accuracy. Split into separate arms or sequential tests.\n2. **Gate offline first.** The regression suite runs against each variant. The smaller model drops eight points on the multi-step troubleshooting stratum, which kills that variant before any user sees it.\n3. **Define the decision rule.** Primary: deflection rate. Guardrails: reopened-ticket rate within 48 hours, p95 latency, CSAT, cost per resolved ticket. Deflection that rises while reopens rise is not a win, it is a deferred cost.\n4. **Power the test.** Baseline deflection 31%, smallest worthwhile effect two points; the calculation says the week is short and the split needs longer, so the duration is set by the math.\n5. **Feed the result back.** Whatever ships, the failing troubleshooting cases become permanent regression items.",
      takeaway:
        "Most A/B failures are design failures, not analysis failures. Bundling changes and letting a calendar rather than a power calculation set the duration are the two that show up on the exam.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Roll out to 100% and compare this week against last week* is offered as a pragmatic shortcut. A before-and-after comparison has no concurrent control, so seasonality, a marketing campaign or an unrelated deploy are all confounded with the change. Randomized concurrent arms exist precisely to remove that.",
    },

    { kind: "practice", questionId: "D4-q301" },
  ],

  keyTerms: [
    {
      term: "Randomization unit",
      definition:
        "The entity assigned to a variant — user, session or request. Sticky user-level assignment keeps the experience coherent and keeps user-level metrics interpretable.",
    },
    {
      term: "Guardrail metric",
      definition:
        "A metric the experiment must not damage even if the primary metric improves: latency, cost, refusal rate, escalation rate. It holds veto power over a win.",
    },
    {
      term: "Peeking",
      definition:
        "Repeatedly checking an experiment and stopping at the first significant result. Inflates the false-positive rate well beyond the nominal level unless a sequential design accounts for it.",
    },
    {
      term: "Shadow run",
      definition:
        "Executing a variant on live traffic while discarding its output. Yields real-input latency, cost and divergence data at zero user risk, but no preference signal.",
    },
    {
      term: "Minimum detectable effect",
      definition:
        "The smallest change a test is powered to distinguish from noise. Set from what is worth shipping, and it determines sample size and therefore duration.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Stop the experiment as soon as the p-value crosses 0.05 to ship the improvement sooner.",
      why: "Repeated inspection of accumulating data gives a genuinely null difference many chances to cross the threshold, so early stopping inflates the false-positive rate far above the nominal level.",
      instead:
        "Run to a pre-computed sample size, or use a sequential design whose stopping rule accounts for repeated looks.",
    },
    {
      id: "t2",
      trap: "Bundle the prompt rewrite, the model change and the retrieval tuning into one arm to save testing time.",
      why: "A bundled arm yields one aggregate number that cannot be attributed to any component, so a win hides a regression inside it and a loss gives no indication which piece to revert.",
      instead:
        "Test one variable at a time, or use a factorial design if you genuinely need interactions.",
    },
    {
      id: "t3",
      trap: "Assign variants per request so the split stays perfectly balanced.",
      why: "Per-request assignment exposes the same person to both behaviors within a single session, which produces an incoherent experience and makes every user-level outcome metric a mixture of both arms.",
      instead:
        "Hash a stable user or session identifier so assignment is sticky for the whole experiment.",
    },
    {
      id: "t4",
      trap: "A statistically significant gain on the primary metric is sufficient grounds to ship.",
      why: "Significance only says the effect is unlikely to be noise; it says nothing about whether the effect is large enough to be worth its cost, or whether a guardrail metric degraded at the same time.",
      instead:
        "Require a pre-registered effect size and clean guardrails before the result counts as a win.",
    },
    {
      id: "t5",
      trap: "Offline evaluation scores are enough to decide a rollout, so the A/B test can be skipped.",
      why: "An offline dataset only contains cases somebody thought to include, and it measures output quality rather than what users actually do with the output, which is the outcome the business is buying.",
      instead:
        "Use offline eval as the gate that prevents bad variants reaching users, then measure the outcome online.",
    },
  ],

  practiceQuestionIds: ["D4-q301", "D4-q304"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 4",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.2", "4.6"],
} satisfies Lesson;
