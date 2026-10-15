import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D7-q301",
    domain: 7,
    objective: "7.3",
    stem: "At 14:05 a customer-facing assistant starts returning errors on about a third of requests. An on-call engineer has a plausible hypothesis about a retrieval change shipped that morning and wants to add logging and redeploy so the hypothesis can be confirmed. What should happen first?",
    choices: [
      {
        id: "A",
        text: "Mitigate — roll back the most recent behavior-changing release or disable the affected path — and then investigate from the captured traces.",
      },
      {
        id: "B",
        text: "Add the logging and redeploy, since the root cause cannot be confirmed without it.",
        rationale:
          "It keeps a third of users failing while a new deploy goes out during an active incident, which also introduces a second change into the timeline.",
      },
      {
        id: "C",
        text: "Reproduce the failure in a local environment before touching anything in production.",
        rationale:
          "Local reproduction is the right second step, but performing it first leaves the outage running for as long as the investigation takes.",
      },
      {
        id: "D",
        text: "Escalate to the model provider, since a third of requests failing points to a platform incident.",
        rationale:
          "The failure began minutes after the team's own release, so the obvious suspect is the change they control; provider status is a check, not a first action.",
      },
    ],
    explanation:
      "Mitigation and diagnosis are separate jobs on different clocks. Users are failing now and root cause can take a day, so service is restored first. A rollback destroys nothing: the logs, traces and captured requests remain available for the investigation that follows.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["incident-response", "mitigation", "rollback"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D7-q302",
    domain: 7,
    objective: "7.3",
    stem: "A user reports that an assistant \"sometimes gives the wrong account balance.\" An engineer runs the same query once, gets the correct answer, and closes the ticket as not reproducible. What is wrong with that conclusion?",
    choices: [
      {
        id: "A",
        text: "Nothing is wrong: a failure that cannot be reproduced cannot be diagnosed or fixed.",
        rationale:
          "It converts a single sample into a conclusion, which is exactly how intermittent faults survive triage and keep reaching users.",
      },
      {
        id: "B",
        text: "The engineer should have run the query against the reporting user's account rather than their own.",
        rationale:
          "Worth checking, since per-tenant data and permissions are a common cause, but it does not address why one successful attempt proves nothing either way.",
      },
      {
        id: "C",
        text: "Sampling makes output a distribution, so a single success is entirely consistent with an intermittent fault; the reproduction is replaying the captured request many times and measuring the failure rate.",
      },
      {
        id: "D",
        text: "The engineer should have added logging around the balance lookup and waited for the next user report.",
        rationale:
          "Instrumentation is worth adding, but deferring the investigation to the next chance occurrence ignores a captured request that can be replayed now to establish the failure rate.",
      },
    ],
    explanation:
      "In a non-deterministic system the unit of reproduction is a rate, not an event. Replaying the captured request many times and measuring how often it fails both establishes the bug and gives the before-and-after comparison that shows whether a fix actually worked.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["reproduction", "non-determinism", "triage"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D7-q303",
    domain: 7,
    objective: "7.3",
    stem: "An assistant's answer quality drops noticeably overnight. There has been no application deploy for a week. The team spends a full day diffing application code and finds nothing that could explain it. What should they have checked first?",
    choices: [
      {
        id: "A",
        text: "Whether individual developers changed their local agent settings.",
        rationale:
          "Local developer settings affect development sessions, not the behavior of a deployed production service answering user requests.",
      },
      {
        id: "B",
        text: "The version history of everything else that changes behavior without a deploy — prompt templates, model selection, tool definitions and the retrieval index build.",
      },
      {
        id: "C",
        text: "Whether the mix of user questions shifted, changing the distribution of what is being asked.",
        rationale:
          "A traffic shift can move aggregate quality metrics, but it rarely produces a sharp overnight step change and it is not a change to the system itself.",
      },
      {
        id: "D",
        text: "Whether the dependency lockfile was updated in the most recent release.",
        rationale:
          "The most recent release was a week ago, so nothing it contained can explain a change that appeared overnight.",
      },
    ],
    explanation:
      "In an LLM system the set of things that change behavior is larger than the set of things that appear in a deployment log: prompts, model selection, tool definitions and index builds all take effect without a code release. That is why they need the same versioning and revert path as code, and why they are the first place to look when behavior moves and the code did not.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["change-management", "versioning", "debugging"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D7-q304",
    domain: 7,
    objective: "7.3",
    stem: "A postmortem is being written for a four-hour outage caused by an unreviewed prompt edit pushed directly to production. The draft's single action item reads \"the engineer will be more careful when editing prompts in future.\" What is the strongest revision?",
    choices: [
      {
        id: "A",
        text: "Name the engineer in the incident timeline so the pattern is visible if it happens again.",
        rationale:
          "Attaching blame discourages people from reporting incidents early, which costs far more over time than any deterrent effect it might have.",
      },
      {
        id: "B",
        text: "Require that prompt edits be announced in the team channel before deployment.",
        rationale:
          "An announcement is still an advisory step that depends on someone remembering, so it fails in exactly the circumstances that produced this outage.",
      },
      {
        id: "C",
        text: "Schedule prompt engineering training for the team so the edit would have been written correctly.",
        rationale:
          "The failure was an unreviewed path to production rather than a knowledge gap, so training leaves the same edit able to ship unchecked.",
      },
      {
        id: "D",
        text: "Put prompt changes through the same versioned review and revert path as code, and add the failing case to the regression evaluation suite.",
      },
    ],
    explanation:
      "A postmortem action item has to change the system rather than ask for better intentions. Routing prompt changes through review and giving them a revert path closes the path this incident took, and adding the failing case to the regression suite means the same defect is caught automatically the next time.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["postmortem", "process", "regression-testing"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D7-q305",
    domain: 7,
    objective: "7.3",
    stem: "A customer quotes a wrong answer the assistant gave them. The team can find the gateway access log entry, and separately a retrieval service log, and separately a model call record, but nothing links the three and each service timestamps independently. Reconstructing one conversation takes hours. What is the fix?",
    choices: [
      {
        id: "A",
        text: "Synchronize clocks across the services so entries can be matched by timestamp.",
        rationale:
          "Aligned clocks narrow the search window and still leave concurrent requests indistinguishable at any realistic traffic level.",
      },
      {
        id: "B",
        text: "Centralize all three logs into one searchable store with a common retention policy.",
        rationale:
          "One store makes the records easier to search and does not give them a shared key, so the correlation work is unchanged.",
      },
      {
        id: "C",
        text: "Issue a correlation identifier at the edge and thread it through every stage, so one id retrieves the whole request.",
      },
      {
        id: "D",
        text: "Increase log verbosity in the retrieval and model services so each entry carries more context.",
        rationale:
          "Richer entries describe each stage better while still leaving a human to guess which entries belong to the same conversation.",
      },
    ],
    explanation:
      "A correlation identifier is what converts \"the assistant is broken\" into a specific request whose every stage can be read in order. Without a shared key, each service's logs are individually correct and collectively unusable, and no amount of centralization or verbosity supplies the join.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["correlation-identifier", "debugging", "tracing"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D7-q306",
    domain: 7,
    objective: "7.3",
    stem: "Users report that an assistant \"got slow this month\". Traces record the total duration of each request and nothing else. The pipeline runs a guardrail classifier, a retrieval call, the model call and an output validation step. What should be added so the next complaint is answerable?",
    choices: [
      {
        id: "A",
        text: "A p99 latency alert on total request duration, so the shift is detected earlier.",
        rationale:
          "Earlier detection is worth having and still leaves the responder with one number that cannot say which stage moved.",
      },
      {
        id: "B",
        text: "Client-side timing, so the measurement includes network time the server does not see.",
        rationale:
          "End-user timing captures what the user experienced and still treats the server as a single opaque span.",
      },
      {
        id: "C",
        text: "A load test reproducing the reported slowdown in staging.",
        rationale:
          "A reproduction confirms the slowdown exists under synthetic load and does not attribute it without per-stage figures either.",
      },
      {
        id: "D",
        text: "Per-stage timing on every trace, so the guardrail, retrieval, generation and validation durations are attributable.",
      },
    ],
    explanation:
      "A latency complaint is only actionable when the total can be decomposed, because each stage has different causes and different remedies. Capturing timing per stage on every request is part of the standard trace payload precisely so that a report like this becomes a query rather than an investigation.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["debugging", "latency", "instrumentation"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
