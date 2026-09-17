import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.1",
  slug: "2-1-model-selection",
  domain: 2,
  objective: "Select appropriate Claude models based on trade-offs",
  title: "Model Selection and Trade-offs",
  summary:
    "Model selection is a three-way trade among capability, latency and cost, and the exam tests the method rather than the roster. Set a quality floor from the cost of being wrong, then pick the cheapest, fastest model that clears it on your own evaluation set.",

  body: [
    {
      kind: "prose",
      md: "The current lineup is the Claude 5 family — **Opus 5**, **Sonnet 5** and **Fable 5.1** — alongside **Haiku 4.5**. Names and price points move; the reasoning does not, which is why exam items describe a workload and ask you to justify a choice rather than asking which model scores highest on a benchmark.\n\nThree properties are in tension, and improving one usually costs you another:",
    },
    {
      kind: "list",
      items: [
        "**Capability** — how reliably the model holds a long chain of reasoning together, handles ambiguity, and recovers from its own mistakes across many tool calls.",
        "**Latency** — how long a user waits. Time-to-first-token governs perceived responsiveness; total time governs throughput.",
        "**Cost** — price per token multiplied by tokens multiplied by attempts. The last factor is the one architects forget.",
      ],
    },
    {
      kind: "prose",
      md: "The method that answers almost every selection question has two steps. First, derive a **quality floor** from the consequence of a wrong answer: a misrouted support ticket is recoverable, an incorrect medication interaction is not. Second, take the cheapest and fastest model that clears that floor *on a representative evaluation set of your own traffic*. Published benchmarks tell you nothing about your prompt, your data or your edge cases.",
    },

    { kind: "heading", text: "Reading the workload" },
    {
      kind: "prose",
      md: "The shape of the workload tells you which of the three properties is actually binding. Only one of them usually is.",
    },
    {
      kind: "table",
      caption: "What the workload constrains, and which way that pushes the choice",
      headers: ["Workload", "Binding constraint", "Which way to lean"],
      rows: [
        [
          "High-volume classification or extraction against a fixed schema",
          "Cost per request; errors are cheap to catch downstream",
          "The smallest model that clears the floor, plus schema validation on the output",
        ],
        [
          "Interactive assistant in a product surface",
          "Perceived latency, especially time-to-first-token",
          "A mid-tier model with streaming and a cached prefix, before considering a downgrade",
        ],
        [
          "Long-horizon agentic work with many sequential tool calls",
          "Compounding error — every step inherits the previous step's mistakes",
          "The most capable model; a small per-step error rate is fatal over thirty steps",
        ],
        [
          "Offline batch enrichment of a backlog",
          "Nothing; no user is waiting",
          "Capability, because latency is effectively free in this mode",
        ],
        [
          "High-stakes decision behind mandatory human review",
          "Reviewer time, not raw model accuracy",
          "A mid-tier model plus review, rather than the top model running unattended",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "A smaller model is not automatically cheaper. It often needs a longer prompt, more few-shot examples, a verification pass, or a retry after a malformed response. Total cost is *tokens × rate × attempts*, and a model that succeeds on the first try at a higher rate can beat one that fails a fifth of the time.",
    },

    { kind: "heading", text: "Tiering instead of choosing once" },
    {
      kind: "prose",
      md: "Most production traffic is routine and a small fraction is genuinely hard, so a single model choice over-serves the easy majority or under-serves the difficult tail. The standard answer is to **route**: handle the bulk with a fast, inexpensive model and escalate to a more capable one on a defined trigger — low classifier confidence, a failed schema validation, an explicit user request for depth, or a case type known to be hard.\n\nCost is then driven by the volume-weighted mix, not by the headline rate of the strongest model in the system. A router that sends 90% of traffic to a small model and 10% to a large one costs far closer to the small model than to the large one, while the hard cases still get the capability they need. The price of this pattern is a second failure surface — the routing decision itself — which needs its own evaluation.\n\nSeparately, where a model supports spending more reasoning effort before answering, that is a dial within a model rather than a change of model: it buys accuracy on hard, multi-step problems and pays for it in latency and output tokens. Reach for it before assuming you need a bigger model.",
    },

    {
      kind: "example",
      title: "Practical example: triaging 40,000 support tickets a day",
      scenario:
        "A support platform classifies incoming tickets into one of twelve queues and drafts a first reply. The team prototyped on the most capable model, quality is excellent, and finance has now flagged the monthly spend. The product owner asks whether to move everything to the smallest available model.",
      walkthrough:
        "1. **Set the floor from consequence.** Misrouting is recoverable in one human click; a wrong drafted reply that an agent sends is not. Those are two different floors, so they are two different decisions.\n2. **Measure, do not assume.** Run 500 labeled tickets through each candidate. The small model matches on routing and degrades noticeably on drafting.\n3. **Split the path.** Route with the small model. Draft with the mid-tier model.\n4. **Add an escalation trigger.** Tickets the router scores as low-confidence, and anything flagged as a complaint, go to the more capable model.\n5. **Re-baseline.** The evaluation set is re-run against the new configuration before rollout, because prompts tuned against one model are not guaranteed to transfer.",
      takeaway:
        "The question was never which single model to use. Decomposing the workload exposed two sub-tasks with different quality floors, and the volume-weighted mix delivered most of the savings without touching the part of the system where being wrong is expensive.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Use the most capable model everywhere* and *use the cheapest model everywhere* will both appear, and both are wrong for the same reason: they answer without reference to the cost of being wrong. The keyed option almost always establishes a quality bar first, measures candidates against it, and only then picks.",
    },

    { kind: "practice", questionId: "D2-q101" },
  ],

  keyTerms: [
    {
      term: "Quality floor",
      definition:
        "The minimum acceptable performance for a task, derived from what a wrong answer costs. It is set before any model is evaluated, and it is what turns model choice into a decidable question.",
    },
    {
      term: "Model routing",
      definition:
        "Directing each request to a model tier based on a signal such as confidence, task type or validation failure, so that cost tracks the volume-weighted mix rather than the hardest case.",
    },
    {
      term: "Escalation trigger",
      definition:
        "The defined condition under which a request is retried on a more capable model — low confidence, failed output validation, or a case class known to be difficult.",
    },
    {
      term: "Compounding error",
      definition:
        "In multi-step agentic work, the way a small per-step failure rate multiplies across steps, which is why long tool-using chains justify a more capable model than single-turn tasks do.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Benchmark scores are the right basis for choosing between models.",
      why: "Public benchmarks measure aggregate ability on generic tasks, and the only question that matters is whether a candidate clears your quality floor on your prompts, your data and your edge cases.",
      instead:
        "Evaluate candidates against a representative sample of your own traffic with the prompt you actually intend to ship.",
    },
    {
      id: "t2",
      trap: "A smaller model is always the cheaper option.",
      why: "Smaller models frequently need longer prompts, more examples, verification passes and retries, and total spend is tokens times rate times attempts rather than rate alone.",
      instead:
        "Compare end-to-end cost per successfully completed task, including retries and any validation the cheaper path requires.",
    },
    {
      id: "t3",
      trap: "The only way to reduce latency is to move to a smaller model.",
      why: "Output length, streaming, caching a stable prefix and parallelizing independent sub-calls all move wall-clock time materially without changing model or giving up any capability.",
      instead:
        "Exhaust the structural latency levers first; treat a downgrade as the option that costs quality.",
    },
    {
      id: "t4",
      trap: "Swapping models is safe because the API call is identical.",
      why: "Prompts are tuned against a specific model's behavior, so verbosity, format adherence and edge-case handling can all shift even when the request body is unchanged and nothing errors.",
      instead:
        "Treat every model change as a release: re-run the evaluation suite and compare against the recorded baseline before rollout.",
    },
  ],

  practiceQuestionIds: ["D2-q101", "D2-q104"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 2",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
