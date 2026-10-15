import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.6",
  slug: "1-6-business-value-alignment",
  domain: 1,
  objective:
    "Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs)",
  title: "Aligning to Business Value",
  summary:
    "Five value pillars — efficiency, transformation, productivity, cost and performance SLAs — each imply a different metric and a different architecture for the same functional requirement. Naming the pillar before designing is what stops a system being judged on a number it was never built to move.",

  body: [
    {
      kind: "prose",
      md: "Two teams can build the same feature and disagree about whether it succeeded, because they are measuring different pillars. The architect's job is to name the pillar first, state the metric it implies, and let that metric drive the design.\n\nThe pillars are not interchangeable labels. They differ in what counts as success, who signs off, and what the architecture is permitted to trade away.",
    },
    {
      kind: "table",
      caption: "The value pillars and what each one does to a design",
      headers: ["Pillar", "Metric that decides", "Design consequence"],
      rows: [
        [
          "Efficiency",
          "Cost and cycle time per unit of work processed",
          "Remove steps from the process, batch and parallelize; automation is the point",
        ],
        [
          "Transformation",
          "New revenue or a capability the organization did not previously have",
          "Higher per-unit cost is acceptable; the comparison is against not doing it at all",
        ],
        [
          "Productivity",
          "Hours returned per person, output per head",
          "Keep the human in the loop and optimize the handoff; the person still decides",
        ],
        [
          "Cost",
          "Total cost of ownership, not model spend alone",
          "Tier models, cache aggressively, and count human review and rework in the total",
        ],
        [
          "Performance SLAs",
          "A percentile commitment, availability, sustained throughput",
          "Design the tail: smaller tiers on the hot path, streaming, fallbacks, bounded retrieval",
        ],
      ],
    },

    { kind: "heading", text: "The distinctions that get tested" },
    {
      kind: "prose",
      md: "**Efficiency versus productivity.** Efficiency removes work from the process; productivity hands the work back to a person who then does more with the time. An assistant that drafts and a person who approves is productivity. A step that disappears from the pipeline is efficiency. They are measured differently and signed off by different people.\n\n**Transformation versus efficiency.** Transformation is doing something the organization could not do at all — same-day custom quotes it never offered, a service in a language it never supported. Restating a transformation case as headcount savings understates it and sets the project up to be judged on a number it was not built to move.\n\n**Cost means total cost of ownership.** Model spend is one line. Retrieval infrastructure, evaluation runs, and above all human review and rework belong in the same total. A move to a cheaper tier that raises review volume can increase total cost while showing a 70% reduction on the model bill.",
    },

    { kind: "heading", text: "Service levels are about the tail" },
    {
      kind: "prose",
      md: "A performance commitment is almost always stated as a percentile — 95% of responses within a bound — and a percentile is never satisfied by an average. Designing for a latency commitment means designing the slow path: cap the retrieval budget at design time, keep verification passes off the synchronous path, stream so that time-to-first-token is what the user experiences, and define what the system returns when the budget is exceeded. A design with no defined behavior at the limit does not have a service level; it has a hope.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "The same functional requirement yields different architectures under different pillars. *Summarize support tickets* built for efficiency is a nightly batch on a small tier. Built for a latency commitment it is a streaming synchronous call with a fixed retrieval budget. Nothing about the function changed.",
    },

    {
      kind: "example",
      title: "Practical example: one feature, two pillars",
      scenario:
        "A bank asks for ticket summarization. The operations director wants to cut the cost of handling a ticket. The customer-experience director wants agents to open a ticket and see a summary immediately.",
      walkthrough:
        "1. **Name the pillars.** The first request is efficiency, measured in cost per ticket. The second is a performance commitment, measured at the 95th percentile of time to display.\n2. **Design for efficiency.** Summarize on ingestion, in batches, on a small model tier, caching the result against the ticket.\n3. **Design for the commitment.** If summaries had to be generated when a ticket is opened, the design would need a smaller tier, a fixed retrieval budget and streaming.\n4. **Notice the overlap.** Pre-computing at ingestion satisfies both: the batch is cheap and the read is a cache hit.\n5. **State the trade.** A ticket updated after summarization serves a stale summary until the next batch, which both directors accept in writing.",
      takeaway:
        "The pillars were reconcilable here, but only because they were named separately first. Had the team optimized cost alone, the latency commitment would have been discovered in production.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Choose the cheapest option* is offered constantly in this objective and keys correctly only when the stem establishes cost as the governing pillar. When the stem names a service level, a transformation goal or a productivity target, the cheapest design is the distractor.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q601",
        "D1-q602",
        "D1-q603",
        "D1-q604",
        "D1-q605",
        "D1-q606",
        "D1-q607",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Total cost of ownership",
      definition:
        "Model spend plus retrieval infrastructure, evaluation runs, and the human review and rework the design creates. The only cost figure that can be compared across designs.",
    },
    {
      term: "Transformation",
      definition:
        "Value created by enabling work the organization could not do at all, judged against not doing it rather than against the cost of the old way.",
    },
    {
      term: "Productivity",
      definition:
        "Value created by returning hours to named people who remain the decision-makers, measured per head rather than per unit of process.",
    },
    {
      term: "Percentile commitment",
      definition:
        "A service level stated at a quantile, such as 95% of responses within 1.2 seconds, which constrains the slow tail rather than the average.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Cost reduction is the default justification for any Claude-based system.",
      why: "Initiatives under the transformation and productivity pillars are justified by new capability and by hours returned, and forcing them into a savings case understates the benefit while committing the team to a number the design was never built to move.",
      instead:
        "Name the pillar the sponsor is actually buying, then report against the metric that pillar implies.",
    },
    {
      id: "t2",
      trap: "Total cost of ownership is dominated by model token spend.",
      why: "Human review, rework, evaluation runs and retrieval infrastructure routinely exceed model spend, which is exactly why a cheaper tier that lowers quality can raise the total even as the model bill falls sharply.",
      instead:
        "Price the review and rework the design creates alongside the tokens it consumes.",
    },
    {
      id: "t3",
      trap: "A latency commitment is met when average response time falls inside the bound.",
      why: "Commitments are written at a percentile precisely because averages conceal the tail, and the requests that actually breach an agreement are the slow ones an average dilutes away.",
      instead:
        "Measure and design the percentile named in the agreement, including the behavior at the limit.",
    },
    {
      id: "t4",
      trap: "Giving analysts an assistant that halves their drafting time is an efficiency gain.",
      why: "The work has not left the process — a person still reviews and signs every output — so the return is measured as hours given back per analyst, which is the productivity pillar rather than efficiency.",
      instead:
        "Ask whether a step left the process or a person got time back; that answer names the pillar.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.1"],
} satisfies Lesson;
