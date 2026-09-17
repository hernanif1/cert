import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.4",
  slug: "6-4-documenting-architectures",
  domain: 6,
  objective: "Document architectures and provide implementation guidance",
  title: "Documenting Architectures",
  summary:
    "Documentation is the interface between an architecture and the team that has to build and run it, and for AI systems the load-bearing documents are the ones teams skip: the prompt and config contract, the eval plan, and the failure runbook. The exam tests what you write down, where it lives, and what keeps it from going stale.",

  body: [
    {
      kind: "prose",
      md: "A design that exists only in the architect's head is a dependency on the architect. The deliverable set for an AI system is short and specific, and every item on it exists because something concrete breaks without it.",
    },
    {
      kind: "table",
      caption: "The documentation set, and what forces each update",
      headers: ["Document", "Question it answers", "Update trigger"],
      rows: [
        [
          "Architecture overview",
          "What calls what, where untrusted input enters, where regulated data rests",
          "A new tool, data source or integration",
        ],
        [
          "ADR log",
          "Why the design is the way it is, and what was rejected",
          "Never edited — a new record supersedes an old one",
        ],
        [
          "Prompt and config contract",
          "What the model is told, under which version and parameters",
          "Any prompt, tool or retrieval change",
        ],
        [
          "Evaluation plan and golden set",
          "How anyone knows a change is an improvement",
          "A new failure mode or accepted defect",
        ],
        [
          "Runbook",
          "What to do when it breaks, and who to wake",
          "A new failure mode reaches production",
        ],
        [
          "Implementation guidance",
          "What implementers must not change, and why",
          "Interfaces or constraints change",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Prompts are source code.** They belong in the repository, under review, versioned, and referenced by id in configuration and in every trace. A prompt pasted into a design document or a wiki page forks the moment someone edits the running system, and the first symptom is an evaluation result nobody can reproduce.\n\n**Pin everything that varies.** Record the exact model id, not *Claude*. Record sampling parameters, tool definitions, retrieval depth and index version, and the guardrails in force. A system whose configuration exists only inside a running deployment cannot be reviewed, rebuilt or rolled back.",
    },
    {
      kind: "code",
      lang: "json",
      code: '{\n  "stage": "intake-classification",\n  "model": "claude-haiku-4-5",\n  "prompt_id": "intake-classify@v7",\n  "max_tokens": 512,\n  "tools": ["lookup_account"],\n  "retrieval": { "index": "policies-2026q1", "top_k": 8, "filters": ["region"] },\n  "escalation": { "model": "claude-opus-5", "when": "confidence < 0.7" },\n  "eval_suite": "evals/intake/v7",\n  "owner": "platform-support"\n}',
    },

    { kind: "heading", text: "Guidance that carries its reasons" },
    {
      kind: "prose",
      md: "Implementation guidance is not a description of the system; it is a list of what the implementer may and may not decide. Mark each item **fixed** or **open**, and give the reason for every fixed item — an unexplained constraint gets optimized away by a well-meaning engineer in month three. *Retrieval filters on region before similarity — required by the data residency agreement* survives a refactor. *Filter by region* does not.\n\nThen document the unhappy paths, because that is where the demo never went: what happens on a tool timeout, on an empty retrieval result, on a guardrail trip, on a model deprecation notice. Most AI incident reviews end at a branch nobody wrote down because it never came up in a demo.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "A diagram of an AI system earns its place by showing **trust boundaries**, not boxes. Mark where untrusted text enters — user input, retrieved documents, tool results — because that is where prompt injection arrives; mark which components can take actions with real consequences; and mark where regulated data is stored and for how long. A component diagram without those three annotations cannot be security-reviewed.",
    },

    {
      kind: "example",
      title: "Practical example: a handoff that failed review",
      scenario:
        "An architect hands a completed design to an implementation partner: a forty-page document, a diagram and a prompt appendix. Six weeks later the built system retrieves without the region filter, and its accuracy numbers cannot be reproduced.",
      walkthrough:
        "1. **The prompt appendix was a copy.** The partner edited theirs; the repository version never moved. Fix: prompts live in the repo, referenced by id, and the appendix is deleted rather than kept in sync.\n2. **The region filter was listed with no reason.** It read like an optimization, so it was dropped when it complicated a query. Fix: mark it fixed and state the residency obligation next to it.\n3. **The eval suite was described, not delivered.** There was no runnable command and no path to the golden set. Fix: handoff is not complete until the partner reproduces the baseline numbers themselves.\n4. **Nothing recorded which model version produced the numbers.** Fix: pin the model id and prompt version in configuration, and emit both in every trace.",
      takeaway:
        "Every gap here was a documentation gap, not a competence gap. Written guidance either carries the artifact and the reason, or it gets re-decided by whoever is holding the keyboard.",
    },
    {
      kind: "callout",
      variant: "pitfall",
      md: "A document with no owner and no update trigger is on a timer. Attach both: a named owner, and the event that forces a revision — adding a tool or data source, changing a model, finding a new failure mode. Calendar-based review rounds find drift months after it happened and are the first thing canceled in a busy quarter.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Documentation items reliably offer *generate the documentation from the code* and *write the full specification before implementation starts*. Both sound rigorous. The first yields an accurate description of what exists while discarding every reason it exists — precisely the part a future maintainer cannot reconstruct. The second fixes decisions before the evaluation evidence that should drive them has been gathered.",
    },
    { kind: "practice", questionId: "D6-q401" },
  ],

  keyTerms: [
    {
      term: "Prompt contract",
      definition:
        "The versioned prompt in the repository, referenced by id from configuration and traces, so that any output can be traced back to the exact instructions that produced it.",
    },
    {
      term: "Fixed versus open",
      definition:
        "An explicit marking on every element of implementation guidance saying whether the implementer may choose differently. Fixed items carry the reason that makes them fixed.",
    },
    {
      term: "Trust boundary",
      definition:
        "A line in the architecture where untrusted content — user input, retrieved documents, tool results — reaches a component that can act. What a security reviewer looks for first.",
    },
    {
      term: "Runbook",
      definition:
        "Operator-facing instructions for known failure modes: timeouts, empty retrieval, guardrail trips, degraded upstreams, rollback steps.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A complete, detailed architecture document is the deliverable that finishes a handoff.",
      why: "A document proves the design was described, not that anyone else can run it; the receiving team still cannot reproduce a baseline or ship a change without the eval suite, the golden set and pinned configuration.",
      instead:
        "Treat handoff as complete only when the receiving team reproduces your numbers and deploys a change unaided.",
    },
    {
      id: "t2",
      trap: "Prompts belong in the design document so stakeholders can review the exact wording.",
      why: "Two editable copies of a prompt guarantee divergence, and once the document and the deployment disagree there is no way to tell which text produced any recorded evaluation result.",
      instead:
        "Keep prompts in version control, reference them by id, and let the document link rather than quote.",
    },
    {
      id: "t3",
      trap: "Recording the model family and the prompt is enough to describe what the system runs.",
      why: "Behavior also depends on the exact model version, sampling parameters, tool definitions, retrieval depth and index version, and none of that can be reconstructed after the fact from a deployment.",
      instead:
        "Pin model id, prompt version, tools, retrieval configuration and guardrails in checked-in configuration.",
    },
    {
      id: "t4",
      trap: "Failure paths should be documented after launch, once real failure modes are known.",
      why: "The tool timeout, the empty retrieval result and the guardrail trip are all predictable before launch, and the first incident is the worst possible time to decide what the system should do about them.",
      instead:
        "Specify fallback behavior for each known failure mode as part of the design, then extend the runbook as production teaches you more.",
    },
  ],

  practiceQuestionIds: ["D6-q401", "D6-q402"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["6.2", "6.5"],
} satisfies Lesson;
