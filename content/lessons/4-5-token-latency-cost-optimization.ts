import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.5",
  slug: "4-5-token-latency-cost-optimization",
  domain: 4,
  objective:
    "Optimize token usage, latency, and cost-performance trade-offs",
  title: "Optimizing Tokens, Latency and Cost",
  summary:
    "Cost and latency are driven by different parts of the same request, so the same optimization rarely helps both. The exam expects you to set a quality floor first, account for tokens by stage, and then pick the lever that targets the constraint you actually have.",

  body: [
    {
      kind: "prose",
      md: "Optimization begins with an accounting exercise, not an idea. Break a single request into the segments that consume tokens — system prompt, tool definitions, few-shot examples, retrieved context, conversation history, and the generated output — and measure each one on real traffic. Teams routinely discover that a tool schema nobody has pruned in six months, or a conversation history that is replayed in full on every turn, outweighs everything they were about to tune.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Input and output tokens behave differently. Input is processed in a single parallel pass, so a long prompt costs money but adds comparatively little time. Output is produced one token at a time, so generation length is the dominant term in end-to-end latency. **To cut cost, attack the input. To cut latency, attack the output.** Confusing the two is why prompt-shortening projects so often fail to move the latency graph.",
    },

    { kind: "heading", text: "The levers" },
    {
      kind: "table",
      caption: "Match the lever to the constraint; most levers move one axis, not both",
      headers: ["Lever", "Helps", "Cost of using it", "Precondition"],
      rows: [
        [
          "Prompt caching",
          "Input cost and time to first token on repeated prefixes",
          "Discipline in prompt ordering",
          "A long, byte-stable prefix placed before anything variable",
        ],
        [
          "Model routing or cascade",
          "Average cost across a mixed workload",
          "Routing logic, plus the escalated calls themselves",
          "A reliable difficulty signal and a defined escalation path",
        ],
        [
          "Context trimming and reranking",
          "Input cost, and often accuracy as well",
          "Risk of dropping the needed passage",
          "Retrieval quality good enough to pass fewer chunks",
        ],
        [
          "Tighter output contract",
          "Latency and output cost together",
          "Less explanatory text for downstream humans",
          "A downstream consumer that does not need prose",
        ],
        [
          "Streaming",
          "Perceived responsiveness only",
          "Client complexity",
          "An interactive surface that can render partial output",
        ],
        [
          "Asynchronous batch processing",
          "Unit cost on bulk work",
          "Turnaround measured in minutes or hours",
          "A workload with no user waiting on it",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Prompt caching is an ordering problem before it is a configuration problem.** A cache hit requires the prefix to be identical, so anything variable — a timestamp, a user id, today's retrieved chunks — must sit after the stable content, not woven through it. A prompt that interleaves a per-request variable into the middle of a long system preamble gets no reuse at all, and the fix is to reorder rather than to shorten.\n\n**Routing is only cheaper end to end.** A cascade that sends everything to a small model first and escalates on failure pays twice for every escalated request, so the saving depends entirely on the escalation rate and on the routing signal being cheap to compute. Measure the blended cost per successfully completed task, never the headline rate of the small model.\n\n**Parallelism converts a sum into a maximum.** Independent subtasks — classify, extract, and check policy on the same document — issued concurrently finish in the time of the slowest rather than the total of all three. This is the highest-leverage latency change available when a pipeline was written as a chain out of habit rather than dependency.",
    },
    {
      kind: "example",
      title: "Practical example: a document assistant that costs too much",
      scenario:
        "A document assistant costs roughly three times its budget. The team's first instinct is to move every request to the smallest available model.",
      walkthrough:
        "1. **Account for tokens by stage.** Per request: 1,100 system prompt, 4,300 tool definitions for eleven tools, 9,000 retrieved context across twelve chunks, 2,000 replayed history, 600 output. Input, not output, is the bill.\n2. **Set the quality floor before touching anything.** The regression suite defines the minimum acceptable score; any optimization that drops below it is rejected regardless of savings.\n3. **Take the free wins first.** Four tools are never called and are removed. Reranking lets twelve chunks become four with no measured accuracy loss. History older than six turns is summarized.\n4. **Reorder for caching.** The system prompt and tool definitions are moved ahead of the per-request content so the stable prefix is cacheable across turns.\n5. **Route what is left.** Classification and routing steps move to a small fast model; synthesis stays where it was. Blended cost is measured per successful task, including escalations.",
      takeaway:
        "The unconditional model downgrade was the only option that would have breached the quality floor, and it was also the one the team tried first. Accounting reveals cheaper wins that cost nothing in quality.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Reduce the maximum output token limit* is offered as a cost lever. Generation is billed on tokens actually produced, so lowering a cap that is never reached saves nothing — and lowering one that is reached truncates answers mid-sentence, which turns a cost problem into a correctness problem. Shorten output by changing the requested format, not by clipping it.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q501",
        "D4-q502",
        "D4-q503",
        "D4-q504",
        "D4-q505",
        "D4-q506",
        "D4-q507",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Quality floor",
      definition:
        "The minimum acceptable score on the regression suite, fixed before optimization begins. Turns \"make it cheaper\" into a constrained problem with a defensible answer.",
    },
    {
      term: "Stable prefix",
      definition:
        "The leading, byte-identical portion of a prompt that can be cached across requests. Preserved by placing all variable content after it.",
    },
    {
      term: "Model cascade",
      definition:
        "Serving most traffic with a small model and escalating hard cases to a larger one. Economical only when the escalation rate is low and the routing signal is cheap.",
    },
    {
      term: "Blended cost per task",
      definition:
        "Total spend across all attempts, escalations and retries divided by successfully completed tasks. The only cost figure that survives a routing change.",
    },
    {
      term: "Perceived latency",
      definition:
        "What the user experiences, governed by time to first token in a streaming interface even when total completion time is unchanged.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Streaming responses reduces the system's latency.",
      why: "Streaming changes when the first token becomes visible, not how long generation takes; total completion time is unchanged and a batch consumer downstream sees no improvement whatsoever.",
      instead:
        "Use streaming to improve perceived responsiveness, and shorten generated output to improve actual completion time.",
    },
    {
      id: "t2",
      trap: "Shortening the system prompt is the most effective way to reduce end-to-end latency.",
      why: "Input tokens are processed in one parallel pass while output tokens are generated sequentially, so trimming a long preamble mostly reduces cost and moves the latency curve far less than teams expect.",
      instead:
        "Target generated length, parallelize independent steps, and treat prompt trimming as a cost lever.",
    },
    {
      id: "t3",
      trap: "Prompt caching applies automatically to any content that repeats across requests.",
      why: "Reuse depends on an identical leading prefix, so a variable such as a timestamp or user id placed early in the prompt invalidates everything after it and yields no reuse at all.",
      instead:
        "Order the prompt static-first and keep every per-request value behind the cacheable segment.",
    },
    {
      id: "t4",
      trap: "Moving all traffic to the smallest available model is the safest way to hit a cost target.",
      why: "Cost falls immediately while quality degrades on the hardest cases, and the retries, escalations and human handoffs that follow are usually invisible in the model bill that the change was judged against.",
      instead:
        "Fix a quality floor on the regression suite first, then route by difficulty and measure blended cost per successful task.",
    },
    {
      id: "t5",
      trap: "A lower maximum-output-token setting reduces spend on every request.",
      why: "Billing follows tokens actually generated rather than the configured ceiling, so a cap above typical output changes nothing and a cap below it truncates answers and creates rework.",
      instead:
        "Request a more compact output format, and keep the cap as a runaway-generation safeguard.",
    },
  ],

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

  relatedLessons: ["4.1", "2.5"],
} satisfies Lesson;
