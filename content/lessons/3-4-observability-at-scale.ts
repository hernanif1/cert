import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.4",
  slug: "3-4-observability-at-scale",
  domain: 3,
  objective:
    "Analyze observability challenges and select monitoring strategies at scale",
  title: "Observability at Scale",
  summary:
    "LLM systems fail silently: a wrong answer returns HTTP 200 and looks exactly like a right one. Monitoring them at scale means instrumenting quality, cost and tool behavior, not just uptime and error rates.",

  body: [
    {
      kind: "prose",
      md: "Traditional observability assumes failures announce themselves — an exception, a 500, a timeout. An LLM system's most important failure mode does none of that. A hallucinated policy number, a tool called with the wrong argument, a retrieval that returned nothing useful: all of them complete successfully, quickly, and with a confident tone.\n\nThat gap is the objective. You are expected to select instrumentation that surfaces quality and behavior problems, and to make it affordable and safe at production volume.",
    },

    { kind: "heading", text: "Three layers, three questions" },
    {
      kind: "list",
      items: [
        "**Operational.** Is it up and fast? Latency percentiles, error rates, timeouts, rate limiting, token throughput. Conventional tooling handles this well.",
        "**Behavioral.** What is the system actually doing? Traces spanning every model call, tool invocation and retrieval, correlated under one id so a multi-step run reads as a single story.",
        "**Qualitative.** Are the answers good? Sampled scoring, user feedback signals, refusal and escalation rates, task completion. Nothing in the transport layer can tell you this.",
      ],
    },
    {
      kind: "prose",
      md: "Most production incidents in agent systems are diagnosed in the behavioral layer and only detected in the qualitative one. A design that instruments the operational layer alone will show a healthy dashboard through a week of degraded answers.",
    },

    { kind: "heading", text: "What to capture on every request" },
    {
      kind: "code",
      lang: "json",
      code: `{\n  "trace_id": "t-9f2c...",\n  "user_id_hash": "u-4471",\n  "tenant": "acme",\n  "model": "claude-sonnet-5",\n  "prompt_version": "triage@2026-03-11",\n  "tool_calls": [\n    { "name": "search_tickets", "latency_ms": 180, "status": "ok", "result_count": 7 },\n    { "name": "post_reply", "latency_ms": 240, "status": "error", "code": "403" }\n  ],\n  "retrieval": { "index": "kb-v4", "top_k": 5, "doc_ids": ["kb-991", "kb-1042"] },\n  "tokens": { "input": 8210, "cached": 7400, "output": 412 },\n  "latency_ms": { "ttft": 640, "total": 2310 },\n  "outcome": { "stop_reason": "end_turn", "user_feedback": null }\n}`,
    },
    {
      kind: "prose",
      md: "Note what is *not* there: the prompt text and the completion. Those are the expensive, sensitive part. Store identifiers, versions, counts and timings on every request, and keep full payloads only for a sample and for errors.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Sample intelligently, not uniformly.** Keep 100% of failures, tool errors, refusals and low-feedback sessions, plus a small percentage of successes for baseline comparison. Uniform low-rate sampling saves the same money but throws away exactly the traces you will need at 2 a.m., because failures are rare by definition.",
    },

    { kind: "heading", text: "Signals that move before users complain" },
    {
      kind: "table",
      caption: "Leading indicators worth alerting on",
      headers: ["Signal", "What a shift usually means"],
      rows: [
        [
          "Retrieval hit rate, or share of answers citing no source",
          "Index drift, a failed ingestion job, or a query distribution shift",
        ],
        [
          "Tool error rate by tool name",
          "A downstream API changed, or credentials or scopes expired",
        ],
        [
          "Mean turns per completed task",
          "The agent is looping or re-planning; often the first sign of a prompt regression",
        ],
        [
          "Refusal and escalation rate",
          "Guardrails firing on legitimate traffic, or genuinely novel inputs",
        ],
        [
          "Cached-token share of input",
          "A prefix changed and caching quietly stopped applying, raising cost and latency",
        ],
        [
          "Cost per completed task by tenant",
          "Context growth, retry storms, or one customer driving pathological usage",
        ],
      ],
    },

    {
      kind: "example",
      title: "Practical example: the week the dashboards stayed green",
      scenario:
        "A document-processing agent runs at roughly 400,000 requests per day. Operational dashboards show p95 latency flat and a 0.3% error rate. After eight days, an account manager escalates that extraction quality collapsed. There is no alert, no incident, and no trace older than 24 hours because logging retention was tuned for cost.",
      walkthrough:
        "1. **Reconstruct what changed.** Prompt version and model version were not recorded per request, so correlating the regression to a deploy takes two days of git archaeology.\n2. **Find the cause.** A connector update altered how PDFs were parsed; tables arrived as unlabeled text. The model dutifully extracted nonsense, and every request returned 200.\n3. **Instrument the missing layer.** Add an LLM-judge score on a 1% sample, plus a schema-validity check on every extraction — a cheap deterministic signal that would have fired on day one.\n4. **Fix retention asymmetrically.** Full traces for 30 days on sampled and failed requests; metadata for everything.\n5. **Alert on distribution, not thresholds.** Extraction field-fill rate dropping 20% week over week is the alert that catches the next one.",
      takeaway:
        "Nothing in the operational layer could have detected this. The detectable signals were a cheap deterministic validity check and a sampled quality score, and the diagnosis needed version metadata that was never recorded.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Logging full prompts and completions for every request looks thorough and creates three problems at once: storage cost that scales with traffic, a retention obligation over user data you may not be permitted to keep, and a haystack nobody searches. Redact, sample, and record structure instead.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add more latency and error-rate dashboards* and *extend log retention* are the reflexive operational answers, and on this objective they are usually distractors: both scale up instrumentation that is already blind to the failure being described. Look for the option that adds a **new kind** of signal — a correctness check, a sampled quality score, a correlating trace id, or version metadata.",
    },

    { kind: "practice", questionId: "D3-q401" },
  ],

  keyTerms: [
    {
      term: "Trace",
      definition:
        "The full record of one request as a tree of spans — model calls, tool invocations, retrievals — correlated by a single id so a multi-step agent run can be replayed end to end.",
    },
    {
      term: "Silent failure",
      definition:
        "An incorrect result returned as a successful response. The dominant LLM failure mode and the reason transport-layer monitoring is insufficient.",
    },
    {
      term: "Tail-based sampling",
      definition:
        "Deciding whether to retain a trace after the outcome is known, so every failure is kept while successes are sampled at a low rate.",
    },
    {
      term: "Online evaluation",
      definition:
        "Scoring a sample of live production traffic — by rubric, LLM judge, or deterministic validity check — to detect quality regressions that operational metrics cannot see.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Healthy latency and error-rate dashboards mean the system is working.",
      why: "An incorrect answer is returned as a successful response with normal timing, so operational metrics are blind to the failure mode that matters most in an LLM system.",
      instead:
        "Add quality instrumentation — sampled scoring, deterministic output validation, and user feedback signals — alongside operational monitoring.",
    },
    {
      id: "t2",
      trap: "Log every prompt and completion in full so any incident can be investigated later.",
      why: "Full payload logging scales storage cost linearly with traffic, creates a retention and privacy obligation over user data, and produces a volume nobody can actually search during an incident.",
      instead:
        "Record structured metadata on every request and retain full payloads only for errors and a small sample.",
    },
    {
      id: "t3",
      trap: "Sampling 1% of requests uniformly gives an adequate view of production.",
      why: "Failures are rare, so uniform sampling captures almost none of them while spending the same budget on ordinary successful traffic that nobody needs to inspect.",
      instead:
        "Retain all errors, refusals and negative-feedback sessions, and sample successes at a low rate for baseline comparison.",
    },
    {
      id: "t4",
      trap: "One representative failing trace is enough to diagnose an agent regression.",
      why: "Model outputs are non-deterministic, so a single trace cannot distinguish an unlucky sample from a systematic shift, and the same input may succeed on the next attempt.",
      instead:
        "Diagnose from aggregates — rates, distributions and week-over-week comparisons — and use individual traces to explain a trend you have already established.",
    },
    {
      id: "t5",
      trap: "Recording the model name is sufficient version metadata for debugging.",
      why: "Prompt templates, tool schemas, retrieval index builds and connector versions all change independently of the model and are frequently the actual cause of a regression.",
      instead:
        "Stamp every trace with prompt version, index build and tool versions so a quality shift can be correlated to a specific deployment.",
    },
  ],

  practiceQuestionIds: ["D3-q401", "D3-q403"],

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
