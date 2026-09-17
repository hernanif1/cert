import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.1",
  slug: "4-1-evaluation-metrics",
  domain: 4,
  objective:
    "Define evaluation metrics (accuracy, latency, cost, safety, security)",
  title: "Defining Evaluation Metrics",
  summary:
    "An LLM system is only as improvable as the metrics defined for it, and \"accuracy\" on its own is not a metric. The exam expects a concrete measure, a measurement method and an actionable threshold for each of five families: accuracy, latency, cost, safety and security.",

  body: [
    {
      kind: "prose",
      md: "Before a system can be improved it has to be measured, and before it can be measured somebody has to decide what *good* means as a number. That decision belongs to the architect, because every metric encodes a commitment: a latency target is a user-experience promise, a cost ceiling is a unit-economics promise, and a safety threshold is a risk posture the business has agreed to hold.\n\nA usable metric definition has three parts, and dropping any one of them leaves a number that cannot settle an argument:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**The measure** — what is counted, on what unit. *Accuracy* is not a measure; *percentage of extracted invoice totals matching the ledger exactly* is.",
        "**The method** — how the value is produced: a deterministic assertion in code, a model grading against a rubric, a human reviewer, or a production counter.",
        "**The threshold** — the number at which a decision changes. A metric with no threshold produces a dashboard nobody acts on.",
      ],
    },

    { kind: "heading", text: "The five families" },
    {
      kind: "table",
      caption: "Each family answers a different question and is measured in a different place",
      headers: ["Family", "Question it answers", "Typical measure", "Where measured"],
      rows: [
        [
          "Accuracy",
          "Is the output right for this task?",
          "Exact match, field-level F1, groundedness rate, rubric score",
          "Offline, against a labeled dataset",
        ],
        [
          "Latency",
          "How long does the user wait?",
          "Time to first token and total completion time at p50/p95/p99",
          "Online, per request",
        ],
        [
          "Cost",
          "What does one unit of business value cost?",
          "Cost per successfully completed task, input and output split",
          "Online, aggregated per task",
        ],
        [
          "Safety",
          "Does the system behave acceptably?",
          "Harmful-output rate paired with false-refusal rate",
          "Adversarial set plus sampled production traffic",
        ],
        [
          "Security",
          "Can the system be made to misbehave?",
          "Injection success rate, unauthorized tool calls, leakage rate",
          "Maintained red-team suite plus guard counters",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Accuracy is task-shaped.** Classification supports exact match and per-class recall. Extraction supports field-level precision and recall. Summarization and open-ended drafting support neither and need a rubric scored by a judge or a human. A retrieval-grounded answer needs two separate numbers — *groundedness*, meaning every claim traces to retrieved context, and *relevance*, meaning the answer addresses the question — because a system can be perfectly grounded and still useless.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Report latency as a distribution, never a mean. The mean is dominated by the fast majority and hides the tail that produces every complaint and every timeout. Split it further: **time to first token** governs perceived responsiveness in a streaming interface, **total completion time** governs a batch job. Optimizing the wrong one wastes the work.",
    },
    {
      kind: "prose",
      md: "**Cost per token is an accounting fact, not a metric.** The number that supports a decision is cost per *successfully completed* task, because a cheaper model that fails one time in five and triggers a retry or a human handoff is not cheaper. Track input and output tokens separately: they price differently, cached input cheaper again, and they respond to completely different optimizations.\n\n**Safety needs a paired metric.** Harmful-output rate alone is driven to zero by a system that refuses everything, so it is always reported alongside a false-refusal rate on benign requests. The pair is what stops one being optimized at the other's expense.\n\n**Security is adversarial, so it is not sampled from normal traffic.** Injection resistance, tool-authorization violations and data leakage are measured against a deliberately hostile suite that grows every time a new attack is found. Ordinary production traffic contains almost no attacks, so a traffic-sampled security metric reads perfect right up to the day it does not.",
    },

    {
      kind: "example",
      title: "Practical example: metrics for a claims-triage assistant",
      scenario:
        "An assistant reads a submitted claim, extracts eight structured fields, classifies the claim into one of five handling paths, and drafts a note for the adjuster. The team proposes one metric: accuracy above 90%.",
      walkthrough:
        "1. **Split accuracy by output type.** Extraction gets per-field exact match against the ledger. Classification gets per-class recall, because the rare high-severity path matters far more than the common one and an overall figure would hide it. The drafted note gets a rubric scored by a judge, spot-checked by humans.\n2. **Put each threshold where a decision changes.** 90% on the high-severity class means one severe claim in ten is misrouted, which the business will not accept; that class gets 99% plus a human review gate.\n3. **Add the other four families.** p95 end-to-end under eight seconds, cost per triaged claim below the manual baseline, false-refusal under 1% on benign claims, and zero tolerance for one claim's data appearing in another's output.\n4. **Name the method for each.** Two are code assertions, one is a calibrated judge, three are production counters.",
      takeaway:
        "One number for a multi-output system is a slogan, not a metric. Decomposing it is most of the work, and the exam rewards the decomposition.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Options offering *a single overall quality score* or *average user satisfaction* as the primary accuracy metric are written to look mature. They are aggregate and lagging: when the number drops you cannot attribute the move to any component. The keyed option defines per-capability measures with explicit thresholds.",
    },

    { kind: "practice", questionId: "D4-q101" },
  ],

  keyTerms: [
    {
      term: "Groundedness",
      definition:
        "The share of claims in an output that are supported by the context supplied to the model. Measured separately from relevance, since an answer can be fully grounded and still fail to answer the question.",
    },
    {
      term: "Time to first token (TTFT)",
      definition:
        "Elapsed time from request to the first streamed output token. The metric that governs perceived responsiveness in an interactive interface, distinct from total completion time.",
    },
    {
      term: "Cost per successful task",
      definition:
        "Total spend, including retries and escalations, divided by tasks completed to an acceptable standard. The cost metric that survives a model swap; cost per token does not.",
    },
    {
      term: "False-refusal rate",
      definition:
        "The share of benign requests that the system declines. The counterweight that keeps harmful-output rate from being optimized by blanket refusal.",
    },
    {
      term: "Guardrail metric",
      definition:
        "A metric that is not the goal of a change but must not degrade because of it — latency and cost while chasing accuracy, refusal rate while chasing safety. Always written in the two-word form, because a guardrail in Domain 5 is a control in the request path rather than a measurement.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Accuracy is a single number describing how well the system performs.",
      why: "A system with several output types fails in several distinct ways, and one aggregate figure moves for reasons that cannot be attributed to any component, so it can never direct a fix.",
      instead:
        "Define one measure per capability and weight each threshold by business consequence.",
    },
    {
      id: "t2",
      trap: "Average response time is the right latency figure to commit to in an SLA.",
      why: "The mean is dominated by the fast majority and conceals the slow tail responsible for every complaint and timeout, so an SLA written on it can be comfortably met while users suffer.",
      instead:
        "Commit to percentiles, and separate time to first token from total completion time.",
    },
    {
      id: "t3",
      trap: "Cost per million tokens is the cost metric to track and optimize.",
      why: "Unit token price ignores how many attempts a task actually takes, so a cheaper model with a higher failure and retry rate can raise total spend while the tracked number falls.",
      instead:
        "Track cost per successfully completed task, with input, cached input and output broken out.",
    },
    {
      id: "t4",
      trap: "A very low rate of harmful outputs shows the safety controls are correctly tuned.",
      why: "That rate is trivially minimized by a system that refuses aggressively, so on its own it says nothing about whether legitimate requests are still being served.",
      instead:
        "Always pair it with a false-refusal rate on a benign set and tune the two together.",
    },
    {
      id: "t5",
      trap: "Security posture can be measured by monitoring production traffic for attacks.",
      why: "Genuine traffic contains almost no deliberate attacks, so the observed rate measures attacker activity rather than system resistance and looks healthy until a campaign starts.",
      instead:
        "Measure against a maintained adversarial suite that grows with every new finding.",
    },
  ],

  practiceQuestionIds: ["D4-q101", "D4-q104"],

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

  relatedLessons: ["4.2", "4.5"],
} satisfies Lesson;
