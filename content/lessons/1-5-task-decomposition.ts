import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.5",
  slug: "1-5-task-decomposition",
  domain: 1,
  objective: "Apply decomposition techniques for complex problem solving",
  title: "Decomposition Techniques",
  summary:
    "A seam between subtasks earns its cost when it buys a clearer instruction, a narrower context, an independent check, or a cheaper model tier. Seams that buy none of those add latency and multiply error, which is why over-decomposition is as real a failure as no decomposition at all.",

  body: [
    {
      kind: "prose",
      md: "Decomposition sits underneath every pattern in this domain. A workflow is a decomposition with code holding the seams; a multi-agent system is a decomposition with isolated contexts at the seams. The architectural question is always the same — where do you cut, and why there?\n\nA seam is justified when it buys at least one of four things:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**A clearer instruction.** A step that does one thing can be told exactly what to do, in a prompt short enough to reason about.",
        "**A narrower context.** A step that needs three fields should not be handed the whole document.",
        "**An independent check.** If the artifact crossing the seam can be validated, a failure is caught where it happened and attributed to one step.",
        "**A cheaper tier.** Extraction and classification rarely need the capability that final reasoning does, and a seam is what lets them run on a smaller model.",
      ],
    },
    {
      kind: "prose",
      md: "A seam that buys none of those is pure overhead: another call, another round trip, another place to be wrong.",
    },

    { kind: "heading", text: "The techniques" },
    {
      kind: "table",
      caption: "Decomposition techniques and the task shape each suits",
      headers: ["Technique", "Cut along", "Typical use"],
      rows: [
        [
          "Sequential chaining",
          "Stages of one pipeline",
          "Extract, then validate, then reason, then write",
        ],
        [
          "Map and reduce",
          "Independent items",
          "One check applied across thousands of documents, then aggregated",
        ],
        [
          "Sectioning",
          "Independent parts of a single item",
          "Long contracts split by section and compared pair by pair",
        ],
        [
          "Extract, then reason",
          "Evidence versus judgment",
          "Pull the facts as structured data, then reason over the structure",
        ],
        [
          "Generate, then critique",
          "Production versus evaluation",
          "Draft, score against a rubric, revise within an iteration cap",
        ],
        [
          "Routing",
          "Classes of input",
          "Request types that need different prompts, tools or policies",
        ],
      ],
    },

    { kind: "heading", text: "What over-decomposition costs" },
    {
      kind: "prose",
      md: "Two costs grow with the number of steps, and both are easy to miss in design review.\n\n**Latency accumulates.** Nine sequential calls is nine round trips, and no step can begin before the previous one finishes. A chain whose individual steps are all fast can still miss a two-second budget by a wide margin.\n\n**Error compounds.** If six sequential steps are each 95% correct and each consumes the previous step's output, the end-to-end result is roughly 74% — the product of the terms, not their average. That is why verification points matter more than step count: a seam with a check stops the multiplication, and a seam without one extends it.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Cut where you can check. The value of a seam is dominated by whether the artifact crossing it can be validated before the next step runs. Seams chosen for tidiness — one prompt per concept — add multiplication without adding detection.",
    },

    {
      kind: "example",
      title: "Practical example: a nine-step assistant that got slower",
      scenario:
        "A team decomposed a customer-facing assistant into nine chained calls so that each prompt would be small and easy to maintain. Every step evaluates well in isolation. The 95th-percentile latency is fourteen seconds, and session abandonment has doubled since the change shipped.",
      walkthrough:
        "1. **Audit each seam.** Ask what it buys. Four of the nine exist only because someone wanted a tidy prompt per concept.\n2. **Check for verification.** Only three seams validate anything. The other six are pure multiplication of error.\n3. **Check for tier benefit.** Two steps — classification and field extraction — genuinely run on a smaller model. Those seams pay for themselves.\n4. **Merge.** The four decorative seams collapse into their neighbors, removing four round trips from the path.\n5. **Re-measure.** Five calls, the same three checks, the same two tier savings, and the 95th percentile under six seconds.",
      takeaway:
        "Nothing was wrong with any individual step, which is why step-level evaluation never found the problem. The defect was in the number of seams, not in what happened between them.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When a stem reports high per-step accuracy and disappointing end-to-end results, *one of the step evaluations must be measured wrong* is the trap. Independent steps multiply, so the numbers usually reconcile exactly. The keyed answer adds verification at the seams or removes seams, rather than doubting the measurement.",
    },

    { kind: "practice", questionId: "D1-q501" },
  ],

  keyTerms: [
    {
      term: "Seam",
      definition:
        "The boundary between two subtasks, where an artifact is handed on. Its value is set by what it buys — a check, a narrower context, a clearer prompt, or a cheaper tier.",
    },
    {
      term: "Error compounding",
      definition:
        "The multiplication of per-step accuracies along a chain, so six independent 95% steps yield roughly 74% end to end unless a seam interrupts the product with a check.",
    },
    {
      term: "Map and reduce",
      definition:
        "Applying the same operation independently across many items, then aggregating the results in a separate step. The default shape for high-volume, item-independent work.",
    },
    {
      term: "Extract, then reason",
      definition:
        "Cutting between evidence gathering and judgment, so facts are pulled into a validated structure before any decision is made over them.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Decomposing further is generally safer, because each step becomes easier for the model.",
      why: "Every extra sequential step multiplies another accuracy term into the end-to-end result and adds a round trip, so a chain of easy steps can score worse and run slower than a smaller number of harder ones.",
      instead:
        "Add a seam only where it buys a check, a narrower context, a clearer instruction, or a cheaper tier.",
    },
    {
      id: "t2",
      trap: "Decomposition is a technique that applies specifically to agentic systems.",
      why: "Every architecture in this domain is a decomposition — workflows hold the seams in code and multi-agent systems hold them at context boundaries — so the question is never whether to decompose but where the cuts belong.",
      instead:
        "Treat seam placement as a design decision you make in any pattern, including a single augmented call.",
    },
    {
      id: "t3",
      trap: "Every step in a chain should use the same model tier so behavior stays consistent.",
      why: "One of the main returns on a seam is the freedom to run classification or extraction on a smaller model while reserving capability for the step that actually exercises judgment, and a uniform tier discards that return entirely.",
      instead:
        "Size each step to its own difficulty and let the seam be where the tier changes.",
    },
    {
      id: "t4",
      trap: "A chain is adequately verified by evaluating each step in isolation.",
      why: "Step-level scores say nothing about how errors propagate across seams, and a chain whose every step passes can still fail end to end because each step consumed a slightly wrong input from the one before it.",
      instead:
        "Evaluate end to end as well, and validate the artifacts that actually cross seams.",
    },
  ],

  practiceQuestionIds: ["D1-q501", "D1-q504"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["1.3", "1.4"],
} satisfies Lesson;
