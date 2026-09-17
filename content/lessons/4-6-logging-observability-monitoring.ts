import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.6",
  slug: "4-6-logging-observability-monitoring",
  domain: 4,
  objective:
    "Monitor system performance using logging and observability tools",
  title: "Logging and Performance Monitoring",
  summary:
    "LLM systems fail silently: the call succeeds, the text is fluent, and the answers have quietly stopped being good. Monitoring one is therefore about carrying a continuous quality signal alongside the operational ones, and about logging enough per request that a regression can be attributed to a change.",

  body: [
    {
      kind: "prose",
      md: "Conventional monitoring assumes failures announce themselves — a non-200, a stack trace, a timeout. An LLM system returns 200 with a plausible paragraph while its accuracy falls by fifteen points, and no operational dashboard notices. That single property shapes everything here: the monitoring design has to manufacture the signal that the system will not emit on its own.",
    },

    { kind: "heading", text: "What every request should carry" },
    {
      kind: "prose",
      md: "A log line is only useful if it lets someone later ask *what was different about the failing requests*. That means recording the identity of the configuration, not just the outcome:",
    },
    {
      kind: "list",
      items: [
        "**Version identity** — model id and version, prompt template version, retrieval index version, tool schema version. Without these, a regression cannot be attributed to a deploy.",
        "**Token accounting** — input, cached input and output counts, so cost and prompt growth are visible per request rather than only on an invoice.",
        "**A latency breakdown** — time to first token, total completion, and time spent in retrieval and in each tool call, so a slow request points at a component.",
        "**Behavioral outcome** — stop reason, tool calls attempted and their results, refusals, and parse failures on structured output.",
        "**Downstream signal** — whether a human accepted, edited, or escalated the result. This is the cheapest proxy for quality you will ever get.",
        "**Redaction state** — what was scrubbed and under which policy, with a retention window, since prompts and completions routinely contain regulated content.",
      ],
    },

    { kind: "heading", text: "Manufacturing a quality signal" },
    {
      kind: "table",
      caption: "Three complementary quality signals, ordered by how quickly they react",
      headers: ["Signal", "How it works", "Reacts to", "Blind spot"],
      rows: [
        [
          "Proxy metrics",
          "Counters that need no labels: escalation rate, retry rate, edit distance, refusal rate, parse-failure rate",
          "Within minutes, on real traffic",
          "Tells you something moved, not what is wrong",
        ],
        [
          "Sampled online eval",
          "A small percentage of live responses graded by the calibrated judge",
          "Within hours, on the real input mix",
          "Confounds a change in traffic with a change in the system",
        ],
        [
          "Scheduled canary set",
          "A frozen golden set replayed against production on a schedule",
          "On each scheduled run",
          "Cannot see inputs the set does not contain",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "The canary set and sampled online eval answer different questions, which is why mature systems run both. Because canary inputs never change, any movement in its score is attributable to the system. Because sampled traffic inputs change constantly, its score moves when users change too — and that difference is itself the diagnosis. Canary flat while sampled score drops means the traffic shifted; both dropping means the system did.",
    },
    {
      kind: "prose",
      md: "**Monitor the inputs, not only the outputs.** Query length distribution, topic or intent mix, language, and the share of requests where retrieval returns nothing are all cheap to track and all explain quality movements that would otherwise look inexplicable. A new product launch, a new market, or a support macro sending users a different phrasing changes the input distribution overnight; the model did not get worse, the job did.\n\n**Alert on symptoms users feel, and give every alert an owner and an action.** A page for a metric that nobody can act on trains the team to dismiss pages, which is a worse failure than the one being monitored. Use fixed thresholds where an SLA exists, relative thresholds against a trailing baseline where the level drifts legitimately, and reserve paging for user-visible breakage — error-rate spikes, p95 past the SLO, a cost-per-day cliff, a refusal-rate jump. Slow quality decay belongs on a review, not a pager.",
    },
    {
      kind: "example",
      title: "Practical example: catching a silent regression",
      scenario:
        "A knowledge assistant's operational dashboards are entirely green for three weeks. Then account managers report that answers have felt vague for a while and they cannot say when it started.",
      walkthrough:
        "1. **Look for a proxy that moved.** Human edit rate on drafted replies rose from 18% to 34% across the period. Nothing else on the operational board moved at all.\n2. **Separate system from traffic.** The canary set, replayed nightly, dropped four points on the same date; sampled online eval dropped six. Both moved, so this is the system.\n3. **Line it up against the change log.** Dashboards are annotated with deploys. The drop coincides with an index rebuild, not with a prompt or model change.\n4. **Confirm with per-request detail.** Requests after that date show a higher share of empty retrieval results and lower retrieved-chunk counts — the rebuild dropped a document set.\n5. **Close the loop.** Failing cases become permanent eval items, and edit rate plus canary score are added to the alerting review so three weeks cannot pass silently again.",
      takeaway:
        "Nothing errored, so nothing alerted. The regression was found by a labeled-free proxy metric and attributed by a frozen canary set plus deploy annotations.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add uptime and error-rate alerting* and *collect user thumbs-up and thumbs-down* both read as responsible answers. Neither detects a silent quality regression: the first never fires, and explicit feedback is sparse, heavily biased toward the annoyed, and arrives long after the damage. The keyed option establishes a continuous, sampled quality measurement.",
    },

    { kind: "practice", questionId: "D4-q601" },
  ],

  keyTerms: [
    {
      term: "Silent failure",
      definition:
        "A degradation that produces no error: the request succeeds, the output is well-formed, and only its correctness or usefulness has fallen. The defining monitoring challenge for LLM systems.",
    },
    {
      term: "Canary eval set",
      definition:
        "A frozen golden set replayed against production on a schedule. Because its inputs never change, any score movement is attributable to the system rather than to traffic.",
    },
    {
      term: "Proxy quality metric",
      definition:
        "An unlabeled production counter that correlates with quality — edit rate, escalation rate, retry rate, refusal rate — and therefore reacts immediately and for free.",
    },
    {
      term: "Input drift",
      definition:
        "A change in the distribution of incoming requests: new topics, new phrasing, new languages. Often the real explanation for an output-quality drop.",
    },
    {
      term: "Deploy annotation",
      definition:
        "Marking releases, prompt-version changes and index rebuilds directly on the dashboards, so a metric step can be lined up against what changed.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Error rate, throughput and uptime dashboards are sufficient to monitor an LLM system in production.",
      why: "A quality regression returns successful responses with well-formed content, so it never registers on availability or error metrics and can persist for weeks while every operational panel stays green.",
      instead:
        "Carry a continuous quality signal — proxy counters, sampled online eval, and a scheduled canary set — beside the operational ones.",
    },
    {
      id: "t2",
      trap: "Thumbs-up and thumbs-down feedback is the primary production quality metric.",
      why: "Explicit ratings are submitted by a tiny and self-selecting share of users, skewed toward the annoyed, and they arrive well after the affected sessions, so the series is too sparse and too lagged to detect a regression.",
      instead:
        "Treat explicit feedback as a qualitative input, and rely on implicit proxies plus sampled grading for the trend.",
    },
    {
      id: "t3",
      trap: "A drop in output quality means the model or the prompt has degraded.",
      why: "Nothing about the system needs to have changed for its measured quality to fall — a new product, market or phrasing shifts the input distribution, and the system is simply being asked a different question than before.",
      instead:
        "Track the input distribution alongside output quality, and compare a fixed canary set against sampled live traffic to tell them apart.",
    },
    {
      id: "t4",
      trap: "Set alerts on every monitored metric so nothing can be missed.",
      why: "Alerting on metrics with no owner and no defined response produces a stream of notifications the team learns to dismiss, which reliably buries the few alerts that represent genuine user-visible breakage.",
      instead:
        "Page only on symptoms users feel, with an owner and a runbook, and route slow decay to a scheduled review.",
    },
    {
      id: "t5",
      trap: "Grading a sample of live traffic is enough to detect a regression, so a fixed evaluation set is redundant in production.",
      why: "Sampled live scores move whenever the traffic mix moves, so a decline is ambiguous between the system getting worse and the questions getting harder, and that ambiguity is exactly what stalls an investigation.",
      instead:
        "Run a frozen canary set on a schedule so at least one series has constant inputs and unambiguous movement.",
    },
  ],

  practiceQuestionIds: ["D4-q601", "D4-q604"],

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

  relatedLessons: ["4.2", "3.4"],
} satisfies Lesson;
