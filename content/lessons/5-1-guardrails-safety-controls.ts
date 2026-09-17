import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.1",
  slug: "5-1-guardrails-safety-controls",
  domain: 5,
  objective: "Implement guardrails and safety controls",
  title: "Guardrails and Safety Controls",
  summary:
    "A guardrail is a component in the request path, not a sentence in a prompt: classifiers, filters and authorization checks that run where the model gets no vote. This objective is about which layer enforces what, and what the system does when one fails or fires.",

  body: [
    {
      kind: "prose",
      md: "A guardrail is a control that runs **outside** the model. That distinction carries most of this objective. Instructions inside a prompt shape behavior and are worth writing carefully, but they are advisory: they can be out-reasoned, overridden by text hidden in retrieved content, or missed on an unlucky sample, and nothing outside the model notices. A check implemented in code around the model either runs or it does not.\n\nSo the architecture question is never *what should the prompt say*. It is *which layer enforces this, what does that layer do when it is unavailable, and what happens after it fires*.",
    },

    { kind: "heading", text: "Layered defense" },
    {
      kind: "prose",
      md: "Controls sit at distinct points in the request path, and each point catches a different class of problem. A system with controls at only one point has a single point of failure.",
    },
    {
      kind: "table",
      caption: "Where each control runs and what it cannot see",
      headers: ["Layer", "Runs", "Catches", "Blind to"],
      rows: [
        [
          "Input screening",
          "Before the model call",
          "Known-bad strings, personal data that should never be sent, recognizable jailbreak patterns",
          "Harm that only appears in the response",
        ],
        [
          "Untrusted-content handling",
          "Between retrieval and the prompt",
          "Instructions embedded in documents and tool results",
          "Content harmful only in combination",
        ],
        [
          "Output screening",
          "After generation, before delivery",
          "Disallowed content, leaked secrets, personal data, unsupported claims",
          "Side effects the turn already caused",
        ],
        [
          "Action authorization",
          "Inside the tool, before the side effect",
          "Amount limits, record ownership, destination allowlists",
          "Bad content that touches no tool",
        ],
        [
          "Monitoring and rate control",
          "Across sessions",
          "Abuse patterns, firing-rate spikes, cost anomalies",
          "A single first-time request",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Ordering matters as much as coverage.** Output screening that runs after a tool has already executed is an audit trail, not a guardrail. If an action is irreversible — money moved, mail sent, a record deleted — the check belongs *before* the side effect, inside the tool, where a failed check returns an error rather than starting a negotiation.",
    },

    { kind: "heading", text: "Blocklists and classifiers do different jobs" },
    {
      kind: "prose",
      md: "A blocklist is deterministic, cheap, auditable, and trivially bypassed by paraphrase, translation, spacing or encoding. A classifier generalizes across phrasing but costs a call, adds latency, and returns a score rather than a fact — so it has a threshold, and a false-positive against false-negative trade-off somebody must choose deliberately.\n\nUse both, for what each is good at. Deterministic rules belong on exact forms: account numbers, internal hostnames, key prefixes. Classifiers belong on intent: harassment, self-harm, unauthorized advice, an attempt to extract the system prompt. An answer that adopts one and discards the other is usually the distractor.",
    },
    {
      kind: "code",
      lang: "json",
      code: `{\n  "input": {\n    "pii_patterns": { "action": "redact_and_log" },\n    "injection_classifier": { "threshold": 0.7, "action": "strip_and_flag" }\n  },\n  "output": {\n    "secret_scan": { "action": "block" },\n    "safety_classifier": { "threshold": 0.5, "action": "block_and_queue" }\n  },\n  "tools": {\n    "issue_refund": { "max_amount": 250, "enforced_in": "tool", "approval_above": 50 },\n    "send_email": { "recipient_allowlist": "account_contacts_only" }\n  },\n  "on_guardrail_unavailable": {\n    "irreversible_actions": "fail_closed",\n    "informational_responses": "fail_open_and_page"\n  }\n}`,
    },

    { kind: "heading", text: "Fail-closed or fail-open is a per-action decision" },
    {
      kind: "prose",
      md: "Every guardrail has an unavailable state: the classifier times out, the policy service is down, the scanner throws. Decide the behavior per action severity rather than globally. Fail **closed** where the action is irreversible or the content is high-risk; fail **open**, degraded and loudly alerted, only where blocking a legitimate low-risk answer costs more than the residual risk.\n\nWhat you cannot do is leave it undecided. An undecided guardrail fails open under load, and load is the cheapest thing an adversary can manufacture.",
    },

    { kind: "heading", text: "What has to happen when a control fires" },
    {
      kind: "list",
      items: [
        "**Return a deterministic response the model did not write.** A refusal generated by the model that produced the blocked content is not a control.",
        "**Log the event** with the trace id, the rule that fired, its score and a hash of the input — not the raw content, unless retention policy permits it.",
        "**Increment a counter.** A spike in firing rate is either an attack or a regression, and both deserve an alert.",
        "**Route to review** where a false positive is expensive, so a wrongly blocked request reaches a person rather than a bin.",
        "**Tune on confirmed false positives.** A guardrail nobody tunes gets switched off within a quarter.",
      ],
    },

    {
      kind: "example",
      title: "Practical example: an assistant that quotes prices it should not",
      scenario:
        "A partner-facing sales assistant retrieves from the CRM and an internal pricing workbook. The system prompt tells it never to disclose internal discount floors. Asked persistently enough, it discloses them anyway, and has begun generating quotes below the approved floor.",
      walkthrough:
        "1. **Name the layer.** The content leaves through the response, so the enforcing layer is output screening. The prompt was doing work a prompt cannot do.\n2. **Split the detection problem.** Floor codes have an exact form, so a deterministic scan catches them. *Quoting unpublished pricing* is intent-shaped and needs a classifier.\n3. **Remove the data instead.** The partner-facing agent has no business retrieving the internal workbook: content that is never in context cannot leak.\n4. **Authorize the action.** The quote tool validates the discount against the entitlement service before writing, and rejects out-of-policy values whatever the model asked for.\n5. **Define firing behavior.** Blocked responses return a fixed message, log a scored event, increment a counter, and open a ticket for sales ops.",
      takeaway:
        "Four independent layers now have to fail together. Before the review, the weakest layer was also the only one.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add an instruction to the system prompt* appears on nearly every guardrail item and is almost never the key at this level. Prompts are one probabilistic layer; the exam is asking which control still holds when the model is wrong, confused, or being manipulated by content it was asked to read.",
    },

    { kind: "practice", questionId: "D5-q101" },
  ],

  keyTerms: [
    {
      term: "Defense in depth",
      definition:
        "Independent controls at input, retrieval, output and action layers, sized so no single failure produces the harm. Independence is the property that matters: correlated checks are one check.",
    },
    {
      term: "Input classifier",
      definition:
        "A model or rule that scores an incoming request before the main call and can redact, flag or reject it. Cheap on every request, blind to anything the model later generates.",
    },
    {
      term: "Output filter",
      definition:
        "A screen applied to the generated response before it reaches the user. It protects the reader; it cannot undo a side effect the turn already caused.",
    },
    {
      term: "Fail-closed",
      definition:
        "Denying the operation when a control cannot be evaluated. The correct default for irreversible actions, because the alternative turns any outage into an unguarded window.",
    },
    {
      term: "Blast radius",
      definition:
        "Everything a single successful manipulation can reach: records readable, actions callable, destinations writable. Containment, not detection, is what bounds it.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A carefully written system prompt is sufficient to stop an agent taking a prohibited action.",
      why: "Prompt instructions are advisory and probabilistic: they can be overridden by text hidden in a retrieved document, argued around, or missed on a single sample, and nothing outside the model detects that it happened.",
      instead:
        "Enforce prohibited operations inside the tool, where a failed check returns an error instead of an opinion.",
    },
    {
      id: "t2",
      trap: "Once a safety classifier is in place, pattern-based blocklists are obsolete.",
      why: "Classifiers return probabilities and generalize over phrasing, but they are unreliable on exact-form strings such as account numbers and key prefixes, where a deterministic rule never misses and costs almost nothing.",
      instead: "Pair them: rules for exact forms, classifiers for intent.",
    },
    {
      id: "t3",
      trap: "A guardrail that times out should let the request through, so an availability problem is not a user-facing outage.",
      why: "Failing open globally converts any load spike or dependency incident into a window with no safety controls at all, and generating load is the cheapest move available to an adversary.",
      instead:
        "Fail closed on irreversible or high-risk paths; fail open with paging only where residual risk is genuinely lower than the cost of blocking.",
    },
    {
      id: "t4",
      trap: "Screening the model's output is enough, since everything the user sees passes through it.",
      why: "Output screening runs after the turn's tool calls have executed, so it can stop the user reading about a transfer but cannot stop the transfer, the deletion or the email that already happened.",
      instead: "Authorize side effects in the tool; screen output for the reader.",
    },
    {
      id: "t5",
      trap: "Asking the model to review its own response adds a second layer of defense.",
      why: "A self-check shares the weights, the context and any injected instructions that produced the problem, so its failures correlate with the failures it is meant to catch — the one property a second layer must not have.",
      instead:
        "Use a separate classifier, or at minimum a separate call with a narrow prompt and no access to the untrusted content.",
    },
  ],

  practiceQuestionIds: ["D5-q101", "D5-q103"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["3.2", "5.2"],
} satisfies Lesson;
