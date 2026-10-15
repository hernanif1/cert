import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.3",
  slug: "3-3-accuracy-latency-tradeoffs",
  domain: 3,
  objective:
    "Evaluate accuracy-latency trade-offs and justify configuration decisions",
  title: "Accuracy vs. Latency Trade-offs",
  summary:
    "Nearly every accuracy improvement in an LLM system is bought with time, and nearly every latency improvement is bought with accuracy. The architect's job is to price both against the cost of being wrong in this specific workflow.",

  body: [
    {
      kind: "prose",
      md: "Accuracy and latency are not independent dials. Deeper reasoning effort, verification passes, re-ranking, larger models and multi-step decomposition all raise quality by spending time. Smaller models, fewer retrieved chunks, shorter reasoning and single-pass answers give time back by accepting more error.\n\nThe exam does not want a default. It wants a justification that starts from the workflow: how bad is a wrong answer here, who catches it, and what does the user experience while waiting?",
    },

    { kind: "heading", text: "What actually costs time" },
    {
      kind: "table",
      caption: "Levers, direction of effect, and when each is justified",
      headers: ["Lever", "Effect", "Justified when"],
      rows: [
        [
          "Larger model in the Claude family",
          "Higher accuracy on hard reasoning; more time per token",
          "Task difficulty is the binding constraint, not throughput",
        ],
        [
          "Higher reasoning effort",
          "Better multi-step reasoning; latency scales with the effort level, low through max",
          "Problems genuinely require derivation, not recall or formatting",
        ],
        [
          "Verification or critic pass",
          "Catches errors; roughly doubles end-to-end time",
          "The cost of a wrong answer exceeds the cost of waiting",
        ],
        [
          "Re-ranking retrieved candidates",
          "Precision up; adds one model call before generation",
          "Recall is adequate but the right passage ranks poorly",
        ],
        [
          "More retrieved chunks",
          "Recall up to a point, then dilution; more input tokens",
          "Evaluation shows misses, not noise, as the failure mode",
        ],
        [
          "Prompt caching on a stable prefix",
          "Lower time to first token and lower cost; accuracy unchanged",
          "A large system prompt or tool set repeats across requests",
        ],
        [
          "Model cascade with escalation",
          "Fast path for easy inputs; slower tail for hard ones",
          "The input distribution is genuinely mixed and routing is reliable",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Measure the percentile the user feels, not the average. A configuration with a 900 ms median and a nine-second p99 is a different product from one that is uniformly two seconds, even though the second looks worse on a mean-latency dashboard. Interactive SLAs are written against p95 or p99 for exactly this reason.",
    },

    { kind: "heading", text: "Perceived latency is a separate variable" },
    {
      kind: "prose",
      md: "Streaming does not make a response finish sooner — total generation time is unchanged — but it moves the moment the user first sees progress, and for conversational interfaces that is most of the felt experience. Time to first token and total completion time need separate budgets.\n\nThe same reasoning distinguishes interaction modes. A synchronous chat turn lives inside a human's patience window. An asynchronous job — nightly document classification, bulk enrichment — has no such window, so accuracy-maximizing configurations that would be unacceptable in chat are simply free there.",
    },
    {
      kind: "prose",
      md: "Where the work decomposes, parallelism buys accuracy at almost no latency cost: independent tool calls issued together, or several subtasks fanned out to separate calls, complete in the time of the slowest rather than the sum. Sequential guardrail and verification stages are the opposite — each one adds its full duration to every request, including the large majority that never needed it.",
    },

    {
      kind: "example",
      title: "Practical example: a triage assistant missing its SLA",
      scenario:
        "A customer-support triage assistant classifies an incoming ticket and drafts a reply. The product SLA is a two-second p95 to first token. Current p95 is 6.4 seconds. The pipeline runs a moderation check, then retrieval, then classification at a high reasoning effort, then drafting, then a second model call that verifies the draft against policy. Classification accuracy is 94%; drafts are reviewed by an agent before sending.",
      walkthrough:
        "1. **Attribute the time.** Spans show retrieval at 300 ms, classification at 2.8 s, drafting at 1.9 s, verification at 1.2 s, moderation at 200 ms.\n2. **Ask what each stage protects.** Every draft is already read by a human before it is sent, so the verification pass is guarding an output that has a second reviewer downstream.\n3. **Cut the redundant stage.** Removing verification returns 1.2 s and costs nothing the human reviewer was not already catching.\n4. **Right-size the reasoning.** Classification into eleven known categories is pattern matching, not derivation. Dropping this stage to the lowest reasoning effort recovers most of its 2.8 s, and offline evaluation shows accuracy falling from 94% to 93%.\n5. **Move the fixed cost.** The system prompt and tool definitions are identical on every request, so caching that prefix trims time to first token again.",
      takeaway:
        "The latency was spent on accuracy the workflow did not need, because a human reviewer already provided it. Trade-offs are priced against the whole system, not against the model call in isolation.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Use the most capable model available* is offered whenever accuracy is discussed and is rarely the keyed answer on a latency-constrained item. Model capability is one lever among several, and it is the one that most directly spends the budget the scenario says is already exhausted. Look for the option that removes work the workflow does not need.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q301",
        "D3-q302",
        "D3-q303",
        "D3-q304",
        "D3-q305",
        "D3-q306",
        "D3-q307",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Time to first token",
      definition:
        "How long the user waits before any output appears. Dominated by input processing, retrieval and any pre-generation stages; improved by caching and by removing serial steps.",
    },
    {
      term: "Model cascade",
      definition:
        "Routing easy inputs to a fast model and escalating only uncertain or high-stakes cases to a more capable one, so average latency follows the easy path.",
    },
    {
      term: "Tail latency",
      definition:
        "The p95 or p99 of the latency distribution. The number an interactive SLA is written against, because averages hide the requests users complain about.",
    },
    {
      term: "Serial guardrail cost",
      definition:
        "The full duration a verification or moderation stage adds to every request, including the majority that would have passed without it.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Accuracy problems are best solved by moving to the largest available model.",
      why: "Model capability only helps when reasoning was the limiting factor; when the failure comes from bad retrieval, a vague prompt or missing context, a larger model reaches the same wrong conclusion more slowly and at higher cost.",
      instead:
        "Diagnose which stage produces the error, then spend latency only on the stage that is actually failing.",
    },
    {
      id: "t2",
      trap: "A verification pass should be added whenever accuracy matters.",
      why: "A second model call adds its full duration to every request while catching errors on only a small fraction, and it is pure waste where a human reviewer or a downstream check already inspects the same output.",
      instead:
        "Apply verification selectively — to low-confidence or high-stakes cases — and only where nothing else in the workflow already reviews the result.",
    },
    {
      id: "t3",
      trap: "Prompt caching improves answer quality by giving the model more stable context.",
      why: "Caching changes how a repeated prefix is billed and processed, not what the model sees or how it reasons, so the output distribution for an identical request is unaffected.",
      instead:
        "Treat caching as a cost and time-to-first-token optimization, and pursue accuracy through context, retrieval or reasoning changes.",
    },
    {
      id: "t4",
      trap: "Median latency is the right target when tuning an interactive system.",
      why: "The median describes the requests nobody complains about, while the slow tail is what breaks an SLA and drives users away, and tail behavior often moves in the opposite direction to the median.",
      instead:
        "Set and monitor targets on p95 or p99, and check both when evaluating a configuration change.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
