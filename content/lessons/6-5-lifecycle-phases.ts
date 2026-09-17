import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.5",
  slug: "6-5-lifecycle-phases",
  domain: 6,
  objective:
    "Support lifecycle phases (discovery, design, handoff, monitoring, iteration)",
  title: "Supporting the Lifecycle",
  summary:
    "AI projects rarely fail at the model; they fail at the seams — a proof of concept that dazzled on ten examples, a handoff that left the receiving team unable to run an eval, a model upgrade shipped as a free win. The exam tests the architect's deliverable and exit criterion at each phase.",

  body: [
    {
      kind: "prose",
      md: "The phases are discovery, design, handoff, monitoring and iteration. Treat each as a gate with an exit criterion, or the project advances on enthusiasm and stalls somewhere between a successful demo and a system anyone trusts.",
    },
    {
      kind: "table",
      caption: "What the architect owes each phase, and what it takes to leave it",
      headers: ["Phase", "Architect's deliverable", "Exit criterion", "Common failure"],
      rows: [
        [
          "Discovery",
          "Measurable success criteria, real samples, ground-truth owner, non-goals",
          "A criterion a specific number could fail",
          "Requirements that cannot be falsified",
        ],
        [
          "Design",
          "Architecture, ADRs, eval plan, latency and cost budgets per stage",
          "A baseline eval run on real inputs",
          "A design that has never met the real input distribution",
        ],
        [
          "Handoff",
          "Runnable evals, pinned configuration, guidance, runbook",
          "The receiving team reproduces the baseline unaided",
          "A document drop mistaken for a handoff",
        ],
        [
          "Monitoring",
          "Trace schema, dashboards, alerts, review cadence",
          "A failing case can be explained end to end in minutes",
          "Logs that record outputs but not prompt version or retrieved context",
        ],
        [
          "Iteration",
          "Regression gate, growing golden set, change log",
          "Every change re-runs evals before release",
          "Prompt edits shipped straight to production",
        ],
      ],
    },

    { kind: "heading", text: "A proof of concept is not a pilot" },
    {
      kind: "prose",
      md: "A demo on ten curated examples establishes that the shape of the solution is plausible. It establishes nothing about the tail. Three things change on the way to production, and the exam expects you to name them:",
    },
    {
      kind: "list",
      items: [
        "**Distribution.** Real traffic is longer, messier, partly in other languages, occasionally adversarial, and full of cases the demo set never contained.",
        "**Accountability.** In a demo a wrong answer is a talking point. In production it reaches a customer, and somebody has to notice it, escalate it and correct it.",
        "**Economics.** Ten examples cost nothing. Ten thousand a day, with retrieval, retries and multi-turn sessions, is a budget line that finance will ask about.",
      ],
    },
    {
      kind: "prose",
      md: "The pilot exists to buy that information cheaply: real traffic, real users, a bounded blast radius, the existing manual process still running behind it, and a human in the loop on the expensive class. Expanding from pilot to full traffic is then a per-segment decision gated on measured evidence, not a single switch.\n\nThe monitoring deliverable is not a dashboard, it is a **trace schema**. A trace that records the output alone cannot explain the output. Record per request: prompt version, model id, retrieved document ids, tool calls and their results, token counts, latency by stage, guardrail decisions, and the final outcome including whether a human intervened. That is the difference between a two-hour investigation and a two-week one.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Treat a **model upgrade as a change, not an upgrade.** A newer model is a different distribution of behavior: prompts tuned around an older model's quirks can regress, output formatting shifts, and latency and cost both move — often in the direction your SLA cares about. Pin model ids in configuration, run the eval suite against the candidate before any traffic moves, and roll it out behind the same gate as any other change.",
    },

    {
      kind: "example",
      title: "Practical example: the pilot that saved the project",
      scenario:
        "A document-intake assistant scores 94% on the team's 40-case development set. The sponsor wants the manual review queue switched off at launch. The architect proposes a four-week pilot on 10% of live traffic instead, queue intact.",
      walkthrough:
        "1. **The real distribution arrives.** Live accuracy is 78%. The development set contained no scanned faxes and nothing over sixty pages.\n2. **Attribute the gap before fixing it.** Two-thirds of the errors are parsing, not reasoning — the scan path drops table structure. The remaining third is one genuinely ambiguous field.\n3. **Fix the cause that is actually causing it.** A better parse for scanned documents; the ambiguous field routed to a reviewer rather than guessed at.\n4. **Grow the eval set from reality.** Every pilot failure becomes a case. The set goes from 40 to 260 and stops flattering the system.\n5. **Gate the rollout.** The queue is switched off per document type, each one when its measured accuracy holds above threshold for two consecutive weeks.",
      takeaway:
        "None of this was visible without live traffic, and all of it would have been visible to customers if the queue had been switched off at launch.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Options that scale a successful pilot to full traffic at once, or that reach for a newer model to close a quality gap, are written to sound decisive. The keyed option almost always gates on measured evidence instead: expand segment by segment as each meets its threshold, and evaluate a model change before it ships rather than after users report the regression.",
    },

    { kind: "practice", questionId: "D6-q501" },
  ],

  keyTerms: [
    {
      term: "Exit criterion",
      definition:
        "The observable condition that must hold before a project leaves a lifecycle phase. Without one, phases blur and unfinished work is carried forward invisibly.",
    },
    {
      term: "Pilot",
      definition:
        "A bounded run on real traffic with the existing process still in place. Buys the distribution, accountability and cost information a proof of concept cannot.",
    },
    {
      term: "Trace schema",
      definition:
        "The fields recorded for every request — prompt version, model id, retrieved ids, tool calls, tokens, staged latency, outcome — that make a production failure explainable after the fact.",
    },
    {
      term: "Regression gate",
      definition:
        "The rule that no prompt, retrieval or model change reaches production without re-running the evaluation suite, which is what stops a fix for one complaint from breaking another capability.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A proof of concept that performs well on the team's examples has de-risked production.",
      why: "Curated examples are drawn from what the team imagined rather than from live traffic, so they under-represent length, noise, ambiguity and adversarial input, which is exactly where production accuracy is decided.",
      instead:
        "Move to a bounded pilot on real traffic with the manual path still running, and rebuild the eval set from what it finds.",
    },
    {
      id: "t2",
      trap: "Handoff is complete once the implementation team has the architecture document and the design review is closed.",
      why: "Possession of a document is not capability: until the receiving team can reproduce the baseline evaluation and ship a prompt change through their own pipeline, the architect is still a hidden dependency.",
      instead:
        "Make reproduction of the baseline by the receiving team the exit criterion for handoff.",
    },
    {
      id: "t3",
      trap: "Monitoring an AI system means tracking latency, error rate and cost, as with any service.",
      why: "Those three tell you that something degraded but never why, because the cause is almost always in the prompt version, the retrieved context or a tool result, and none of that is reconstructable afterward if it was not recorded.",
      instead:
        "Record prompt version, model id, retrieved document ids, tool calls and outcome on every request.",
    },
    {
      id: "t4",
      trap: "A newer model can be adopted without re-running evaluation, since capability improves with each release.",
      why: "A different model is a different behavior distribution: prompts tuned to an older model's quirks can regress, formatting can shift, and latency and cost move in ways an existing SLA may not tolerate.",
      instead:
        "Run the eval suite against the candidate model first, then roll forward behind the normal change gate.",
    },
    {
      id: "t5",
      trap: "Once the system is in production the architect's involvement ends and iteration belongs to engineering.",
      why: "Iteration is where the architecture actually gets decided — thresholds move, stages are added, budgets are spent — and unowned drift in those choices is how a design quietly becomes something nobody would have approved.",
      instead:
        "Stay accountable for the regression gate, the budgets and the review cadence through the iteration phase.",
    },
  ],

  practiceQuestionIds: ["D6-q501", "D6-q503"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["6.1", "6.4"],
} satisfies Lesson;
