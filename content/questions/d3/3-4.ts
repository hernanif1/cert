import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q401",
    domain: 3,
    objective: "3.4",
    stem: "A contract-extraction service processes 50,000 documents a day. Its dashboards track request rate, p50 and p95 latency, HTTP error rate and token spend, all stable for a month. A customer then reports that one extracted field has been wrong for three weeks. Which instrumentation gap does this reveal?",
    choices: [
      {
        id: "A",
        text: "Latency percentiles are aggregated over too short a window to show a slow regression.",
        rationale:
          "The regression is in output correctness, which would not appear in a latency series regardless of the aggregation window.",
      },
      {
        id: "B",
        text: "Token spend should be attributed per customer rather than tracked in aggregate.",
        rationale:
          "Per-tenant cost attribution is useful for other reasons, but a spend breakdown would not surface a field extracted with the wrong value.",
      },
      {
        id: "C",
        text: "Nothing in the pipeline scores output correctness, so a wrong extraction is indistinguishable from a right one.",
      },
      {
        id: "D",
        text: "The error-rate metric should count 4xx responses alongside 5xx.",
        rationale:
          "Both classes describe transport failures, and these requests completed successfully with well-formed responses.",
      },
    ],
    explanation:
      "The dominant LLM failure mode returns HTTP 200 at normal latency. Only a quality signal — a deterministic schema or validity check, a sampled rubric score, or user feedback — can detect it, which is why operational dashboards alone can stay green through weeks of degraded output.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["observability", "silent-failure", "quality-signals"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q402",
    domain: 3,
    objective: "3.4",
    stem: "An agent platform logs full prompts and completions for all 2 million daily requests into a searchable store with 90-day retention. Legal raises a privacy concern and SRE reports that the store is the platform's largest infrastructure line item. An engineer proposes retaining a uniform 1% random sample instead. What is the strongest objection to that proposal?",
    choices: [
      {
        id: "A",
        text: "A 1% sample will not reduce cost enough to matter.",
        rationale:
          "A hundredfold reduction in retained payloads is a very large saving, so cost is not where this proposal is weak.",
      },
      {
        id: "B",
        text: "Uniform sampling discards almost every failure, which are precisely the traces engineers need during an incident.",
      },
      {
        id: "C",
        text: "Sampling makes latency percentiles statistically unreliable.",
        rationale:
          "Latency metrics are computed from per-request measurements that remain in place; payload retention does not affect them.",
      },
      {
        id: "D",
        text: "Legal's concern applies equally to a 1% sample, so the change accomplishes nothing.",
        rationale:
          "Reducing retained personal data by two orders of magnitude materially changes the exposure, even though redaction is still required.",
      },
      {
        id: "E",
        text: "Ninety-day retention is the real problem and should be extended to a full year.",
        rationale:
          "Longer retention would worsen both the cost and the privacy concerns that triggered the review in the first place.",
      },
    ],
    explanation:
      "Failures are rare by definition, so a uniform sample spends its entire budget on ordinary successful traffic and keeps almost none of the traces an on-call engineer will search for. Tail-based sampling — retain every error, refusal and negative-feedback session plus a small slice of successes — achieves the same cost and privacy reduction while preserving diagnostic value.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["observability", "sampling", "retention"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q403",
    domain: 3,
    objective: "3.4",
    stem: "A multi-agent research system shows a sharp rise in cost per completed task. Every model call is logged with its own identifier, latency and token counts, but the orchestrator's delegations are not recorded and nothing links a call to the task that caused it. An engineer can see that total calls per day doubled and cannot determine why. Which instrumentation change makes this diagnosable?",
    choices: [
      {
        id: "A",
        text: "Add a per-call cost field so the most expensive calls can be ranked.",
        rationale:
          "Ranking individual calls shows where money went but not which task or delegation chain produced them, which is the missing link.",
      },
      {
        id: "B",
        text: "Extend log retention so more history is available for comparison.",
        rationale:
          "More of the same unlinked records does not expose the relationship between calls that this analysis depends on.",
      },
      {
        id: "C",
        text: "Sample full prompts and completions so engineers can read what the agents were doing.",
        rationale:
          "Reading payloads may suggest hypotheses, but with no call graph there is still no way to attribute the extra volume to a cause.",
      },
      {
        id: "D",
        text: "Propagate one trace identifier through every delegation so all calls belonging to a task form a correlated tree.",
      },
    ],
    explanation:
      "A multi-step agent run is only interpretable as a tree. Without a shared trace id, per-call records cannot tell you whether volume doubled because more tasks arrived, because each task now spawns more subagents, or because one subagent is looping. Correlation is the prerequisite for every other analysis here.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["observability", "tracing", "multi-agent"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q404",
    domain: 3,
    objective: "3.4",
    stem: "A team is defining alerts for a production retrieval-augmented assistant serving 30 tenants. They already alert on p95 latency and 5xx rate. Which three additional signals are most likely to catch a quality regression before customers report one? (Select THREE.)",
    choices: [
      {
        id: "A",
        text: "Share of answers produced with no retrieved source.",
      },
      {
        id: "B",
        text: "Tool error rate broken out by individual tool name.",
      },
      {
        id: "C",
        text: "Average response length in characters.",
        rationale:
          "Length drifts for many benign reasons and correlates weakly with correctness, so it produces noise rather than early warning.",
      },
      {
        id: "D",
        text: "Mean number of agent turns per completed task.",
      },
      {
        id: "E",
        text: "Unique users per day.",
        rationale:
          "An adoption metric that moves with seasonality and marketing, entirely independently of whether answers are getting worse.",
      },
      {
        id: "F",
        text: "Cached-token share of input tokens.",
        rationale:
          "A useful cost and time-to-first-token signal, but a caching change affects spend and latency rather than the correctness of answers.",
      },
    ],
    explanation:
      "Leading indicators of quality regression are behavioral, not operational. A rise in answers citing no source points at ingestion or index failure, a jump in per-tool errors points at a changed downstream API or expired scope, and more turns per task is the usual first sign of looping or a prompt regression. Volume and length metrics track demand and style, not correctness.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["observability", "alerting", "leading-indicators"],
    type: "multi",
    selectCount: 3,
    correct: ["A", "B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D3-q405",
    domain: 3,
    objective: "3.4",
    stem: "During an incident review, a team finds it cannot correlate a three-week quality regression to any particular deployment. Traces currently record only the model name and a timestamp. Which addition would most improve their ability to attribute the next regression to a specific change?",
    choices: [
      {
        id: "A",
        text: "Prompt template version, retrieval index build, and tool schema versions.",
      },
      {
        id: "B",
        text: "The full text of the system prompt on every request.",
        rationale:
          "This captures the same information at enormous volume and cost, and still requires diffing payloads to notice that anything changed.",
      },
      {
        id: "C",
        text: "The geographic region each request was served from.",
        rationale:
          "Useful for latency analysis, but prompt, index and tool deployments in this system are not region-specific.",
      },
      {
        id: "D",
        text: "The character count of the user's message.",
        rationale:
          "An input-shape statistic that says nothing about which version of the system's own configuration handled the request.",
      },
    ],
    explanation:
      "Model name is only one of several things that change independently and can each cause a regression. Stamping prompt version, index build and tool schema version on every trace turns a multi-day archaeology exercise into a correlation between a metric shift and a specific deploy.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["observability", "versioning", "metadata"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
