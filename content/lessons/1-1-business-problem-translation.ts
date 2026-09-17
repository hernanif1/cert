import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.1",
  slug: "1-1-business-problem-translation",
  domain: 1,
  objective: "Translate business problems into Claude-based AI solutions",
  title: "Translating Business Problems",
  summary:
    "Translation turns a stated business outcome into a task-level specification with a measurable success criterion and an explicit error budget. Most AI projects that fail were mistranslated at this step rather than badly engineered afterwards.",

  body: [
    {
      kind: "prose",
      md: "A sponsor never arrives with an AI problem. They arrive with a cost, a delay, a backlog or a risk — *claims take eleven days to settle*, *analysts spend two days a week reading filings* — and the architect's first job is to convert that into something a system can be built against and, more importantly, measured against.\n\nA translation is complete when four artifacts exist. Design work that starts before all four are written down is guesswork:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**The outcome and its metric.** The number the business will actually check in six months. *Faster claims* is not a metric; *median settlement under three days* is.",
        "**The task.** The specific unit of work the system performs, scoped small enough that one output is one decision. Departments are not tasks and job titles are not tasks.",
        "**The success criterion.** What a good output looks like, written concretely enough that two reviewers grading the same output would agree. This becomes the evaluation set.",
        "**The error budget.** What a wrong output costs, who catches it, and how much wrongness the surrounding process can absorb before the business stops trusting the system.",
      ],
    },

    { kind: "heading", text: "Scope to the task, not the job" },
    {
      kind: "prose",
      md: "*Automate underwriting* is a budget line, not a specification. Underwriting is a dozen distinct activities — pulling documents, extracting fields, checking them against a rule set, pricing risk, writing a rationale, signing off — and they differ enormously in how well they suit a language model and in what a mistake costs.\n\nDecompose the job until you find tasks with three properties: the input is available in machine-readable form, the judgment involved is documented somewhere the model can be given, and a wrong answer is caught by something. Those tasks are where a Claude-based solution earns its keep. The rest of the job stays where it is, and that is a successful outcome rather than a partial one.",
    },

    { kind: "heading", text: "Is it a Claude-shaped problem?" },
    {
      kind: "prose",
      md: "Not every expensive process is a language problem. The fit test is about the shape of the work, not its cost.\n\n**Good fit:** unstructured or semi-structured language in, a judgment a competent person could make from written criteria, enough volume that consistency matters, and a downstream step that can absorb or catch an error.\n\n**Poor fit:** arithmetic that must be exact, a lookup an existing API already answers deterministically, a rule set small and stable enough to express as code, or a decision nobody is willing to review. The last one matters most — an unreviewable decision with no error budget is a governance problem before it is an architecture problem.",
    },
    {
      kind: "table",
      caption: "How a sponsor's framing constrains the architecture",
      headers: [
        "What the sponsor says",
        "What it actually constrains",
        "Design consequence",
      ],
      rows: [
        [
          "Cut claim cycle time from eleven days to three",
          "Throughput and queue time, not per-request speed",
          "Asynchronous batch processing is acceptable; parallel decomposition beats a faster model",
        ],
        [
          "A valid claim must never be auto-denied",
          "An asymmetric error cost",
          "Tune for recall, route low-confidence cases to a reviewer, never let the system issue a denial",
        ],
        [
          "Analysts should stop reading filings end to end",
          "Hours returned to a named group",
          "Augment the analyst with extraction and summary; leave the judgment with the person",
        ],
        [
          "Support answers must appear within two seconds",
          "A hard per-request latency commitment",
          "Smaller model tier, prompt caching, and a retrieval budget fixed at design time",
        ],
        [
          "We have to defend the decision to an auditor",
          "Explainability and evidence, not accuracy alone",
          "Emit citations and store inputs, outputs and versions as a durable record",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "A success criterion that cannot be evaluated is not a success criterion. Before committing to an architecture, write twenty representative inputs and the output you would accept for each. If the team cannot agree on those twenty, the problem is still mistranslated, and no model choice will rescue it.",
    },

    {
      kind: "example",
      title: "Practical example: 'we want AI for claims'",
      scenario:
        "A regional insurer asks for an AI system to handle motor claims, with a stated goal of cutting handling cost by 40%. Claims arrive as email with photo and PDF attachments, an adjuster reviews them against policy terms, and roughly 60% are routine.",
      walkthrough:
        "1. **Find the metric.** Handling cost is adjuster hours per claim, which points at adjuster time rather than at the claims system.\n2. **Decompose the job.** Six activities. Adjusters report that intake — reading the email, extracting fields, checking attachments for completeness — takes 45 of the 70 minutes.\n3. **Test the fit.** Intake is unstructured language and images in, structured fields out, against documented completeness rules. Strong fit. Liability apportionment is contested judgment with legal exposure. Poor fit.\n4. **Set the error budget.** A missed attachment is caught by the adjuster at review and costs minutes. A wrong liability call costs a lawsuit. The two budgets are nothing alike, which is why the tasks cannot share one design.\n5. **Scope the build.** Extraction and completeness checking, with the adjuster confirming a pre-filled form. Liability stays human.",
      takeaway:
        "The deliverable is narrower than the request and moves the metric further, because it targets where the hours actually go and keeps the unreviewable decision with a person.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Distractors in this objective start from technology rather than from the problem: *prototype with the most capable model and iterate*, *index the whole archive first*, *replace the process end to end*. All of them skip the metric, the task and the error budget. The keyed answer names a measurable outcome and a bounded task.",
    },

    { kind: "practice", questionId: "D1-q101" },
  ],

  keyTerms: [
    {
      term: "Task scoping",
      definition:
        "Narrowing a business request until one system output corresponds to one decision, so the work can be specified, evaluated and bounded.",
    },
    {
      term: "Success criterion",
      definition:
        "A concrete statement of what an acceptable output looks like, written so two independent reviewers would grade the same output the same way.",
    },
    {
      term: "Error budget",
      definition:
        "How much and what kind of wrongness the surrounding process can absorb, including who catches an error and what it costs when nobody does.",
    },
    {
      term: "Human decision boundary",
      definition:
        "The line between judgments the system may make and judgments a person must make, fixed by the cost of being wrong rather than by model capability.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "The business goal can serve directly as the system's success criterion.",
      why: "A goal such as a 40% cost reduction is measured on a process over months, while a success criterion has to be checkable on a single output today, which is what makes an evaluation set possible at all.",
      instead:
        "Derive a per-output criterion from the goal and keep the goal as the outcome metric you report against.",
    },
    {
      id: "t2",
      trap: "An expensive process is by definition a good candidate for a Claude-based solution.",
      why: "Cost tells you the process matters, but it says nothing about whether the work is language-shaped, whether the judgment is documented anywhere, or whether a wrong answer would be caught downstream.",
      instead:
        "Apply the fit test to the task, then size the opportunity by where the hours actually accumulate.",
    },
    {
      id: "t3",
      trap: "Automating the whole job is more valuable than automating part of it.",
      why: "Value comes from the hours the design actually moves, and a narrow task with a real error budget ships while a whole-job rewrite stalls on the one activity nobody will let a system decide.",
      instead:
        "Carve out the tasks that pass the fit test and leave the contested judgment with a person on purpose.",
    },
    {
      id: "t4",
      trap: "Accuracy is the right primary metric for any classification-shaped business problem.",
      why: "Accuracy weighs every error the same, while most business processes have sharply asymmetric costs — a few minutes of review versus a released fraudulent transaction — so an accurate system can still be the wrong one.",
      instead:
        "Translate the asymmetry into the metric, usually as recall subject to a ceiling on review volume.",
    },
  ],

  practiceQuestionIds: ["D1-q101", "D1-q104"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.6"],
} satisfies Lesson;
