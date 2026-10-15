import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.3",
  slug: "7-3-debugging-operational-issues",
  domain: 7,
  objective: "Support debugging and operational issue resolution",
  title: "Debugging and Operational Support",
  summary:
    "When a Claude-based system misbehaves in production, the first job is restoring service and the second is finding out why — in that order. This objective is about the operational craft: capturing enough to reproduce a non-deterministic failure, reading a trace across stages, triaging by blast radius, rolling back, and turning the incident into something the system remembers.",

  body: [
    {
      kind: "prose",
      md: "Diagnosing *why the model produced that output* is a separate skill, covered under Domain 4. This lesson is about everything around it: the report from a colleague, the trace spanning five services, the rollback, and the postmortem.\n\nThe governing rule is that **mitigation and diagnosis are different jobs with different clocks**. Users are failing right now; root cause can take a day. Restore service first — revert the deploy, disable the flag, pin the previous prompt version — and investigate from captured evidence afterward. A rollback does not destroy the investigation; the logs, traces and captured requests are still there.",
    },

    { kind: "heading", text: "Reproducing a non-deterministic failure" },
    {
      kind: "prose",
      md: "\"I tried it and it worked\" is not evidence. Sampling makes output a distribution, so one successful replay tells you almost nothing about a failure that occurs one time in twenty. Reproduction means replaying the captured request repeatedly, measuring the failure rate, and comparing that rate before and after a change.\n\nReplay is only possible if the request was captured, which makes this a design decision rather than an incident-time one. A reproducible request carries, at minimum:",
    },
    {
      kind: "list",
      items: [
        "A **request identifier** that appears in every log line and every downstream span for that request.",
        "The **versions of everything that shapes behavior**: prompt template version, model identifier, tool and MCP server versions, retrieval index version.",
        "The **full input and output**, including tool calls and their results, subject to whatever redaction policy applies.",
        "The **retrieved context** — document identifiers at least, so you can tell whether the model saw the right material.",
        "**Timing per stage**, so a latency complaint can be attributed to a stage rather than to the system as a whole.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "A correlation identifier threaded through every stage is what converts \"the assistant is broken\" into \"the vector store's p99 went to eight seconds at 14:02.\" Without it, an LLM system is a single opaque box, and every investigation restarts from the user's description.",
    },

    { kind: "heading", text: "Triage, rollback and the postmortem" },
    {
      kind: "prose",
      md: "Triage ranks by blast radius and reversibility, not by how interesting the bug is. How many users, how bad for each, is it getting worse, and can it be undone? Those answers set severity, and severity drives escalation. Establishing early whether the fault is yours or upstream saves hours of investigating code that never changed.\n\nRollback requires that everything capable of changing behavior is versioned and revertible. In an LLM system that list is longer than in a conventional service: prompts, model selection, tool definitions and the retrieval index all change behavior without a code deploy. A prompt edit shipped outside the release process is the most common cause of an unexplained regression, precisely because nothing in the change log shows it.",
    },
    {
      kind: "table",
      caption: "Signal to first check",
      headers: ["What the signal looks like", "Check first", "Usual location"],
      rows: [
        [
          "Starts at a sharp timestamp with no deploy of yours",
          "Provider status, dependency health, overnight pipeline runs",
          "Outside your application",
        ],
        [
          "Starts immediately after a release",
          "Diff the release and roll it back before diagnosing",
          "The change",
        ],
        [
          "Intermittent, roughly one request in twenty",
          "Replay the captured request many times; look at timeouts and retries",
          "Sampling variance or a flaky dependency",
        ],
        [
          "Only one tenant or one cohort",
          "Their data, their permissions, their retrieval scope",
          "Per-tenant configuration or content",
        ],
        [
          "Latency up, output quality unchanged",
          "Per-stage timings in the trace, plus queueing",
          "One stage, rarely the model itself",
        ],
      ],
    },
    {
      kind: "prose",
      md: "The postmortem is blameless for a practical reason rather than a sentimental one: naming an individual suppresses the reporting that makes the next incident visible. Build the timeline from the trace rather than from memory, and require that each action item changes the system. \"Be more careful when editing prompts\" is not an action item; adding the failing case to the regression suite, gating prompt changes behind code review, and adding the alert that would have caught it twenty minutes earlier all are.\n\nSupporting other developers runs on the same rails: ask for the request identifier before the description, reproduce before theorizing, and write the runbook entry so the next person does not repeat the investigation.",
    },

    {
      kind: "example",
      title: "Practical example: tool calls failing after an upgrade",
      scenario:
        "An internal coding assistant starts failing about 15% of requests that touch the issue tracker. The error surfaces to users as a generic apology. A developer reports it as \"the assistant is hallucinating ticket numbers.\" No application deploy has gone out in four days.",
      walkthrough:
        "1. **Mitigate first.** Traffic to the affected workflow is routed around the integration and users get a clear message. The clock on the user impact stops before anyone diagnoses anything.\n2. **Get an identifier, not an adjective.** The reported request id leads to a trace showing the issue-tracker MCP call returning a schema error, after which the model improvised a plausible ticket number. The user-visible symptom was downstream of the real fault.\n3. **Correlate with the timeline.** Failures begin at 09:14, matching a minor version bump of that MCP server deployed by another team — a behavior-changing component outside the application's own release process.\n4. **Roll back the actual change.** The server is pinned to the previous version and the failure rate returns to zero. Root cause analysis continues against the captured traces, not against production.\n5. **Close the loop.** The postmortem's actions are systemic: MCP server versions are pinned and upgraded deliberately, a tool-call error-rate alert is added, and the schema error case becomes a regression test so the assistant fails loudly instead of inventing a ticket number.",
      takeaway:
        "The reported symptom pointed at the model and the fault was in a dependency upgrade nobody had recorded as a change. The trace and the correlation id made that visible in minutes; the rollback restored service before the cause was understood.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "In incident scenarios, options that begin with root-cause analysis — add logging, reproduce locally, review the prompt — are seductive because they sound rigorous. While an outage is live, the keyed answer restores service first. Investigation follows from captured evidence.",
    },

    {
      kind: "practice",
      questionIds: [
        "D7-q301",
        "D7-q302",
        "D7-q303",
        "D7-q304",
        "D7-q305",
        "D7-q306",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Correlation identifier",
      definition:
        "A request id carried through every log line and span for a single user interaction, which is what makes a failure traceable across retrieval, model call, tools and downstream services.",
    },
    {
      term: "Mitigation before diagnosis",
      definition:
        "Restoring service — rollback, flag disable, version pin — before investigating cause. The two activities have different urgency and a rollback preserves the evidence.",
    },
    {
      term: "Replay reproduction",
      definition:
        "Re-running a captured request many times to measure a failure rate, since sampling makes a single successful attempt meaningless as evidence about an intermittent fault.",
    },
    {
      term: "Blameless postmortem",
      definition:
        "An incident review that fixes the system that allowed the error rather than identifying a person, because blame suppresses the reporting that keeps incidents visible.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "An intermittent failure that does not reproduce on a manual retry is not reproducible.",
      why: "Sampling makes model output a distribution rather than a fixed value, so one successful replay is entirely consistent with a fault that occurs in one request out of twenty.",
      instead:
        "Replay the captured request many times and compare failure rates, treating the rate itself as the thing you are reproducing.",
    },
    {
      id: "t2",
      trap: "Rolling back before the cause is understood just hides the problem.",
      why: "Mitigation and diagnosis have different clocks — users keep failing while an investigation runs — and a rollback leaves the logs, traces and captured requests fully intact for analysis.",
      instead:
        "Restore service first, then diagnose from captured evidence in a non-production setting.",
    },
    {
      id: "t3",
      trap: "Prompt and model configuration are content, so they do not need to ship through the release process.",
      why: "Both change production behavior as completely as a code change does, and because neither appears in the deployment log, a regression caused by one is invisible to everybody investigating the incident.",
      instead:
        "Version prompts, model selection, tool definitions and index builds, and require the same review and revert path as code.",
    },
    {
      id: "t4",
      trap: "A good postmortem identifies who made the mistake so the same person does not repeat it.",
      why: "Attaching blame discourages the reporting that surfaces incidents early, and almost every failure is a system that permitted an ordinary human error to reach production unchecked.",
      instead:
        "Keep the review blameless and require each action item to change the system — a gate, an alert, or a regression test.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 7",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["4.4", "4.6", "7.2"],
} satisfies Lesson;
