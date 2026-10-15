import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q501",
    domain: 4,
    objective: "4.5",
    stem: "An interactive assistant has a p95 total response time of 11 seconds against a 6-second target. Each request carries roughly 14,000 tokens of static instructions and tool schemas, and produces about 1,200 tokens of prose. The team plans to halve the prompt to 7,000 tokens to hit the latency target. What is the most likely outcome?",
    choices: [
      {
        id: "A",
        text: "Latency will roughly halve, since the prompt is by far the larger token count.",
        rationale:
          "Input is processed in a single parallel pass, so halving it does not halve end-to-end time the way this proportional reasoning assumes.",
      },
      {
        id: "B",
        text: "Latency will be unchanged and cost will increase.",
        rationale:
          "Cutting input tokens lowers cost rather than raising it; the flaw in the plan concerns latency, not spend.",
      },
      {
        id: "C",
        text: "Cost will fall meaningfully but latency will barely move, because sequential generation of the 1,200-token answer dominates the total.",
      },
      {
        id: "D",
        text: "Cost and latency will both fall in proportion to the token reduction.",
        rationale:
          "Cost scales with token counts while latency is dominated by sequential output generation, so the two do not move together.",
      },
    ],
    explanation:
      "Input tokens are consumed in one parallel forward pass and mostly cost money; output tokens are produced one at a time and mostly cost time. Halving a large static prompt is therefore a strong cost lever and a weak latency lever, and the team's target requires attacking generated length, parallelism, or both.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["optimization", "latency", "tokens"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q502",
    domain: 4,
    objective: "4.5",
    stem: "A support assistant assembles each request as: a header line containing the current date and the user's account id, then a 6,000-token policy preamble and tool schemas, then the user's message. Prompt caching is enabled, but the team observes almost no cache reuse. What explains this?",
    choices: [
      {
        id: "A",
        text: "The variable header sits at the very start, so the prefix differs on every request and nothing after it can be reused; moving it below the static content restores reuse.",
      },
      {
        id: "B",
        text: "Six thousand tokens is below the size at which caching becomes worthwhile.",
        rationale:
          "Even where a minimum size applies, the observed problem is that the prefix is different on every single request, which defeats reuse at any size.",
      },
      {
        id: "C",
        text: "The user's message differs every time, which invalidates the whole prompt.",
        rationale:
          "Variable content placed after the static segment does not affect the cacheability of the prefix that precedes it.",
      },
      {
        id: "D",
        text: "Tool schemas are structured definitions rather than prose and are therefore not cacheable.",
        rationale:
          "Caching operates on the token prefix and is indifferent to whether that content is prose or structured definitions.",
      },
    ],
    explanation:
      "Cache reuse depends on an identical leading prefix. A per-request value placed early invalidates everything that follows it, so the long static preamble is re-processed every time. The fix is ordering rather than shortening: put all stable content first and every variable behind it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["optimization", "caching", "cost"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q503",
    domain: 4,
    objective: "4.5",
    stem: "A team proposes a cascade: a small model answers every request, and a larger model is called whenever the small model's answer fails a validation check. They project a 70% cost reduction based on the small model's list price. Which two factors most determine whether that saving actually materializes?",
    choices: [
      {
        id: "A",
        text: "The context window size of the larger model.",
        rationale:
          "Window size constrains what fits into a single request; it has no bearing on how often the cascade escalates or what escalation costs.",
      },
      {
        id: "B",
        text: "The escalation rate, since every escalated request pays for both models.",
      },
      {
        id: "C",
        text: "The cost and reliability of the validation check that decides when to escalate.",
      },
      {
        id: "D",
        text: "Whether the two models share the same tokenizer.",
        rationale:
          "Tokenizer differences shift token counts marginally and are not what decides whether a cascade saves money overall.",
      },
      {
        id: "E",
        text: "The p50 latency of the small model measured in isolation.",
        rationale:
          "Median latency of one leg says nothing about blended cost, and the cascade's latency risk sits on the escalated path anyway.",
      },
    ],
    explanation:
      "A cascade is cheaper only end to end. Escalated requests pay twice, so the blended cost per successfully completed task depends directly on escalation rate, and an unreliable or expensive routing signal either escalates too often or lets bad answers through. The small model's headline rate is not the number that governs the outcome.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["optimization", "routing", "cost"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "C"],
  },
  {
    schemaVersion: 1,
    id: "D4-q504",
    domain: 4,
    objective: "4.5",
    stem: "A contract pipeline runs four steps in sequence on every document: classify the contract type (0.9s), extract the parties (2.4s), extract the dates (2.1s), and check the document against a clause playbook (3.2s). Only the playbook check depends on the extracted parties. The p95 end-to-end time is 9.4 seconds against a 6-second target. Which change yields the largest improvement for the least risk?",
    choices: [
      {
        id: "A",
        text: "Move all four steps to a smaller, faster model.",
        rationale:
          "This trades quality on every step for speed, when the pipeline's own structure is where most of the wasted time is sitting.",
      },
      {
        id: "B",
        text: "Merge all four steps into a single prompt so only one call is made.",
        rationale:
          "One combined call still generates all of that output sequentially, and it couples four independently testable steps into a single failure surface.",
      },
      {
        id: "C",
        text: "Cache the classification step, since document types repeat frequently.",
        rationale:
          "Classification is the shortest step at 0.9 seconds, so eliminating it entirely still leaves the pipeline well above target.",
      },
      {
        id: "D",
        text: "Run classification and both extractions concurrently, then the playbook check, turning a sum into a maximum plus one dependent step.",
      },
    ],
    explanation:
      "Three of the four steps have no dependency on one another, so issuing them concurrently replaces 0.9 + 2.4 + 2.1 with roughly 2.4 seconds, leaving about 5.6 seconds end to end. Converting an accidental chain into a parallel fan-out is usually the highest-leverage latency change available and costs nothing in output quality.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["optimization", "latency", "parallelism"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q505",
    domain: 4,
    objective: "4.5",
    stem: "A nightly job re-summarizes 400,000 archived support tickets. No user is waiting on the result; it simply has to be complete by 7 a.m. The team wants to reduce what the job costs. Which option best fits this workload?",
    choices: [
      {
        id: "A",
        text: "Stream the responses so results appear progressively as they are produced.",
        rationale:
          "Streaming improves perceived responsiveness for a user who is waiting, and there is no such user in this workload.",
      },
      {
        id: "B",
        text: "Submit the work through asynchronous batch processing, trading turnaround time for a lower unit rate.",
      },
      {
        id: "C",
        text: "Lower the maximum output token setting on every request.",
        rationale:
          "Billing follows tokens actually generated, so an unreached cap saves nothing and a low one truncates summaries mid-sentence.",
      },
      {
        id: "D",
        text: "Raise request concurrency so the job finishes several hours earlier.",
        rationale:
          "Finishing sooner does not change what the work costs, and the existing deadline is already being met comfortably.",
      },
    ],
    explanation:
      "Batch processing is the canonical answer for bulk work with no interactive consumer: it exchanges latency, which this workload does not value, for a materially lower unit rate. The other options optimize axes the job does not care about, or reduce a cap rather than the output actually generated.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["optimization", "cost", "batch"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q506",
    domain: 4,
    objective: "4.5",
    stem: "An assistant's answers average 700 output tokens and the team wants to cut generation cost. An engineer proposes lowering the maximum output token limit from 4,000 to 1,000, arguing that this caps what each request can cost. What is the accurate assessment?",
    choices: [
      {
        id: "A",
        text: "The cap changes almost nothing, because generation is billed on tokens actually produced; it would only truncate the minority of answers that legitimately run long.",
      },
      {
        id: "B",
        text: "Correct, and the saving will be roughly proportional to the reduction in the limit.",
        rationale:
          "That assumes billing follows the ceiling rather than the output, so the arithmetic describes a pricing model that is not in use.",
      },
      {
        id: "C",
        text: "Correct for cost, but it will raise latency because the model plans its response against the available budget.",
        rationale:
          "The premise is the problem rather than the side effect: there is no saving to trade latency for, since unproduced tokens were never billed.",
      },
      {
        id: "D",
        text: "The cap helps only if paired with a chain-of-thought instruction, so reasoning fits inside the smaller budget.",
        rationale:
          "Adding reasoning increases output tokens, which moves cost in the wrong direction while making truncation more likely.",
      },
    ],
    explanation:
      "A maximum output limit is a safety valve against runaway generation, not a cost lever, because nothing is charged for tokens the model never emits. Reducing generation cost means making answers genuinely shorter through instruction, format and task design, which is a change to what is produced rather than to what is permitted.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["optimization", "cost", "output-tokens"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q507",
    domain: 4,
    objective: "4.5",
    stem: "A document assistant costs more per task than budgeted. Its quality floor is 92% field-level accuracy, and it currently scores 93%. Four levers are proposed. Which TWO can be adopted without risking the floor?",
    choices: [
      {
        id: "A",
        text: "Caching the 8,000-token instruction prefix that is byte-identical on every request.",
      },
      {
        id: "B",
        text: "Downgrading every request unconditionally to the next model tier down.",
        rationale:
          "An unconditional downgrade moves quality on every request with only one point of headroom, which is the change most likely to breach the floor.",
      },
      {
        id: "C",
        text: "Batching the overnight portion of the workload, where no user is waiting for a result.",
      },
      {
        id: "D",
        text: "Trimming the few-shot examples from six to two to shorten the prompt.",
        rationale:
          "The examples are there because they lifted accuracy, so removing them spends the one point of headroom on a saving the prefix cache already offers.",
      },
      {
        id: "E",
        text: "Reducing retrieved chunks from eight to two to cut input tokens.",
        rationale:
          "Halving the evidence available to the model is an accuracy change dressed as a token change, and the margin will not absorb it.",
      },
    ],
    explanation:
      "Every lever has a precondition, and the binding one here is a single point above the floor. Caching and batching change how the same work is paid for without altering what the model sees or produces, while every option that shortens the prompt or lowers the tier buys its saving out of accuracy the system cannot spare.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["optimization", "quality-floor", "levers"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
] satisfies Question[];
