import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.3",
  slug: "6-3-feedback-loops-slas",
  domain: 6,
  objective:
    "Manage stakeholder feedback loops and expectation alignment (including SLAs)",
  title: "Feedback Loops and SLAs",
  summary:
    "An SLA commits you to something measurable, and the architect's job is making sure that something is not “correct answers”. The exam tests whether you separate indicator from objective from agreement, attach a population and a window to every target, and turn complaints into permanent test cases.",

  body: [
    {
      kind: "prose",
      md: "Three terms get used interchangeably and must not be. An **SLI** is the indicator — the quantity actually measured. An **SLO** is the internal objective, set tighter than what you promised so there is margin to notice and fix degradation. An **SLA** is the external commitment, with a consequence attached: credits, penalties, a right to terminate.\n\nA non-deterministic system can still carry a real SLA, provided the commitment is written on quantities that are stable under sampling. Individual outputs vary; rates over a fixed population do not.",
    },

    {
      kind: "callout",
      variant: "key-concept",
      md: "An **SLI** is what you measure, an **SLO** is the internal target, and an **SLA** is the external promise with a consequence attached. Set the SLO tighter than the SLA on purpose: that gap is the margin that lets you notice degradation and fix it before it becomes a credit note.",
    },
    { kind: "heading", text: "What you can and cannot commit to" },
    {
      kind: "table",
      caption: "Rewriting an unenforceable promise into an enforceable one",
      headers: ["Commitment", "Workable?", "How to write it"],
      rows: [
        [
          "Availability",
          "Yes",
          "99.9% of requests return a non-error response, measured server-side, monthly",
        ],
        [
          "Latency",
          "Yes, as a percentile",
          "p95 end-to-end under 4 s, measured server-side, monthly, excluding client network time",
        ],
        [
          "Accuracy on a closed task",
          "Yes, with a denominator",
          "At least 97% field-level exact match on the 500-case golden set, re-run each release",
        ],
        [
          "Quality of open-ended generation",
          "No",
          "Commit instead to a review process and a defect triage time",
        ],
        [
          "“The assistant will never say anything wrong”",
          "No",
          "Commit to guardrail coverage, escalation paths and a human gate on the high-cost class",
        ],
        [
          "Cost",
          "Yes, as a budget with an alert",
          "Cost per resolved case under a stated figure, with a spend alert at 80% of monthly budget",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Notice what makes the accuracy row workable: a **population** (the golden set), a **method** (field-level exact match) and a **window** (each release). A number missing any of the three is unfalsifiable, and the first dispute about it will be settled by whoever is more senior rather than by evidence.\n\nLatency targets are not free to choose. A p95 commitment constrains model choice and retrieval depth at the same time, because adding a re-ranking pass or escalating to a larger model spends the very budget the SLA committed. Write the budget as a decomposition — retrieval, generation, tool calls, guardrails — so the cost of a new stage is visible before somebody adds it.\n\nCost belongs in the conversation early because it behaves unlike anything the stakeholder has bought before. Spend tracks tokens: input length, output length, retrieval depth, retries and turns per task. Adding users multiplies cases; it does not change the cost of a case. A successful quarter raises the bill, and a sponsor who has not been told that will read growth as a defect.",
    },
    {
      kind: "callout",
      variant: "pitfall",
      md: "*We need 99% accuracy* is the most common unexamined requirement in AI projects. Ask three questions before agreeing: 99% of what population, judged by whom, over what window? The requirement usually dissolves into something both achievable and more useful — a very high bar on the one class where a mistake is expensive, with a human gate behind it, and a much lower bar everywhere else.",
    },

    { kind: "heading", text: "Feedback loops that change the system" },
    {
      kind: "prose",
      md: "A loop that ends in a dashboard is decoration. It is closed only when a stakeholder complaint can become a test case. Three channels are worth building:",
    },
    {
      kind: "list",
      items: [
        "**In-product signal with a reason code.** A bare thumbs-down is unattributable. Forcing a choice — *wrong facts / missed my question / too slow / refused a reasonable request* — separates a retrieval failure from a latency failure before anyone opens a trace.",
        "**Escalation and handoff transcripts.** Every case a human took over is a labeled failure you already own, at no extra cost.",
        "**A standing sampled review.** A fixed cadence where a domain expert scores a sample of outputs, successes included. It catches the slow drift that nobody bothers to report.",
      ],
    },
    {
      kind: "prose",
      md: "Then the rule that makes the loop matter: **every accepted defect becomes a permanent evaluation case.** A fix that does not enter the golden set is a fix you will ship the regression of again, and the stakeholder who reported it will be the one who notices.",
    },

    {
      kind: "example",
      title: "Practical example: renegotiating an accuracy SLA",
      scenario:
        "Procurement wants a contract clause stating that the contract-review assistant is 99% accurate. The team's own evaluation shows 92% field-level accuracy across eleven extracted fields, with errors concentrated in two of them on non-standard templates.",
      walkthrough:
        "1. **Decompose the number.** Per-field accuracy runs from 99.4% down to 81%. One aggregate figure hid both the safe fields and the dangerous ones.\n2. **Attach consequence to each field.** Liability cap and termination date carry real legal exposure; the other nine are conveniences that a reviewer corrects in seconds.\n3. **Rewrite the commitment.** At least 99% on the two high-consequence fields, achieved by routing low-confidence extractions to a human; at least 90% on the rest; both measured on a 400-contract golden set refreshed quarterly.\n4. **Commit to process where you cannot commit to output.** A defect reported by the business is triaged within two business days and added to the golden set.\n5. **Name the exclusion.** Templates outside the agreed corpus are out of scope until they are sampled, labeled and added.",
      takeaway:
        "The stakeholder's real requirement was never a number; it was that one specific expensive mistake does not happen. Meeting that was cheaper, faster and more honest than chasing 99% across the board.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Accepting the stakeholder's figure and then engineering toward it reads as responsive and cooperative, which is exactly why it is offered. The keyed option interrogates the metric first — population, method, window and the cost of the error — because a target nobody can falsify can be neither met nor missed, and it will be disputed the first time a customer disagrees about a single answer.",
    },

    { kind: "practice", questionId: "D6-q301" },
  ],

  keyTerms: [
    {
      term: "SLI / SLO / SLA",
      definition:
        "The measured indicator, the internal target set with headroom, and the external commitment that carries a consequence. Conflating them is how teams end up contractually bound to their own stretch goal.",
    },
    {
      term: "Denominator",
      definition:
        "The population a rate is measured over. An accuracy figure without one — which cases, judged by whom, in what window — cannot be verified or disputed on evidence.",
    },
    {
      term: "Reason code",
      definition:
        "A required category attached to negative feedback, mapping a complaint to the component it implicates so aggregate signal becomes actionable.",
    },
    {
      term: "Golden set",
      definition:
        "The fixed, labeled case set that accuracy commitments are measured against and that every accepted defect is added to.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A non-deterministic system cannot carry a meaningful SLA, so accuracy should be left out of the contract.",
      why: "Availability, latency percentiles and accuracy on a fixed labeled set are all stable under sampling even when individual outputs vary, so refusing to commit gives away a negotiation you could have won.",
      instead:
        "Commit to rates over a stated population, method and window, and to process guarantees where output cannot be guaranteed.",
    },
    {
      id: "t2",
      trap: "Collecting thumbs-up and thumbs-down ratings gives the team a working feedback loop.",
      why: "An unqualified negative rating cannot be attributed to retrieval, reasoning, latency or an unwanted refusal, so a rising rate tells you something is wrong without telling anyone what to fix.",
      instead:
        "Require a reason code, route each code to the component it implicates, and promote confirmed defects into the eval set.",
    },
    {
      id: "t3",
      trap: "A per-seat price protects the business from runaway spend as adoption grows.",
      why: "Cost tracks tokens rather than users, so long inputs, deep retrieval, retries and multi-turn sessions move the bill independently of headcount, and a seat price simply moves the risk onto whoever sells it.",
      instead:
        "Forecast and commit on cost per successfully completed case, with budget alerts on the actual token drivers.",
    },
    {
      id: "t4",
      trap: "A reported defect is closed once the fix is deployed and the stakeholder confirms the case now works.",
      why: "Nothing in the system prevents a later prompt change, retrieval change or model upgrade from reintroducing exactly that behavior, and the same stakeholder will find it again with less patience.",
      instead:
        "Add every accepted defect to the golden set so the regression suite blocks it permanently.",
    },
  ],

  practiceQuestionIds: ["D6-q301", "D6-q303"],

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

  relatedLessons: ["6.1", "6.5"],
} satisfies Lesson;
