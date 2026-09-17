import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.2",
  slug: "6-2-communicating-decisions",
  domain: 6,
  objective: "Communicate architectural decisions and trade-offs",
  title: "Communicating Decisions and Trade-offs",
  summary:
    "A decision that is not written down with its alternatives and its consequences gets relitigated every quarter. The exam tests whether you can state a trade-off in numbers from your own workload, shape it for the audience in the room, and name the condition that would make you reverse it.",

  body: [
    {
      kind: "prose",
      md: "Architects lose decisions they were right about because they present the analysis instead of the decision. The fix is structural: lead with what was decided and what it costs, record what was rejected, and say in advance what would change your mind.\n\nThis matters more for AI systems than for ordinary software, because the trade-offs are unfamiliar to the people funding them. Accuracy, latency and cost are coupled through model choice and retrieval depth — a deeper retrieval pass buys grounding and spends latency, a stronger model buys resolution rate and spends money per task. Someone who has only ever bought seats does not expect a quality dial that is also a spend dial.",
    },

    { kind: "heading", text: "Write the decision down once" },
    {
      kind: "prose",
      md: "An **architecture decision record** (ADR) is a short document capturing one decision at the moment it is taken. An **RFC** comes before the decision to gather input; the ADR records the outcome and the reasoning that produced it. An ADR is immutable: when the design changes, you write a new record that marks the old one superseded, because the value of the log is that it shows what was believed at the time and why.",
    },
    {
      kind: "code",
      lang: "text",
      code: "ADR-014: Route intake classification to Haiku 4.5\n\nStatus:   Accepted 2026-03-04 — supersedes ADR-009\nContext:  38k tickets/month. p95 budget 2.5 s end to end. Intake\n          classification is 5 labels over short text.\nDecision: Haiku 4.5 classifies intake; low-confidence cases escalate\n          to Opus 5 with the full thread.\nOptions:  (a) Opus 5 for all traffic — rejected: +0.9 s p95 and ~6x\n              cost per resolved ticket for +1.4 pts accuracy on our set\n          (b) Single Haiku 4.5 pass, no escalation — rejected: 2.1% of\n              cases misrouted to a customer-visible path\nAccepted risk: ~7% of tickets take the slower escalation path.\nRevisit when: escalation exceeds 12% for two consecutive weeks, or\n              p95 exceeds 2.5 s, or intake volume doubles.",
    },

    { kind: "heading", text: "Shape the message for the audience" },
    {
      kind: "table",
      caption: "Same decision, four renderings",
      headers: ["Audience", "What they need", "What to leave out", "Failure if you get it wrong"],
      rows: [
        [
          "Executive sponsor",
          "The decision, cost per unit of work against today's baseline, the risk accepted, the date",
          "Model names, chunking, prompt structure",
          "Funding is pulled mid-build over a bill nobody was warned about",
        ],
        [
          "Engineering team",
          "Interfaces, budgets per stage, what is fixed and what they may choose",
          "The business justification narrative",
          "Implementers quietly re-decide the constraints you fixed",
        ],
        [
          "Security and compliance",
          "Data flow, retention, trust boundaries, where untrusted text enters",
          "Accuracy tuning detail",
          "A late veto after the design is frozen and the budget is spent",
        ],
        [
          "Operations and end users",
          "What it will not do, and how to escalate when it is wrong",
          "Architecture",
          "Misplaced trust, then abandonment after the first confident wrong answer",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**Quantify or do not claim.** *Opus 5 is more capable* is not a trade-off. *On our 300-case set, Opus 5 resolves 84% of tickets unaided versus 71% for Haiku 4.5, at roughly six times the cost per resolved ticket and 900 ms more at p95* is one — and it is measured on your workload, not borrowed from a benchmark that ran somebody else's task.\n\n**Never imply a guarantee the system cannot make.** Identical inputs can produce different outputs, and a model upgrade can shift behavior that a prompt was tuned around. Write commitments as rates measured over a stated sample and window, and be explicit about which behaviors are bounded by guardrails and gates rather than by the model's cooperation.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Every recommendation should carry a **reversal condition**: the observable that would make this decision wrong. It converts an opinion into a monitored threshold, moves the disagreement from taste to evidence, and gives a skeptical sponsor something better than trust — a tripwire they can check themselves.",
    },

    {
      kind: "example",
      title: "Practical example: defending a two-model design",
      scenario:
        "A CFO reads that the support assistant uses two models and asks why the team cannot just use the best one. The design classifies intake with Haiku 4.5 and escalates ambiguous cases to Opus 5.",
      walkthrough:
        "1. **Open with the number the CFO owns.** Cost per resolved ticket for both designs, computed on last month's real traffic including retries and human handoffs.\n2. **Name what is given up.** Routing misclassifies about 2% of cases that the single-model design would have handled; those land in an escalation queue rather than in front of a customer.\n3. **Show the alternative was priced, not dismissed.** Opus 5 everywhere was measured: it buys 1.4 accuracy points for roughly six times the unit cost.\n4. **State the reversal condition.** If escalation passes 12% for two weeks, routing has stopped paying for itself and the design is revisited.\n5. **Record it.** The conversation becomes ADR-014, so the next time the question is asked the answer is a link rather than another meeting.",
      takeaway:
        "The CFO never needed to understand routing. They needed the cost delta, the risk being accepted on their behalf, and the condition under which the team would change its mind.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "A thorough technical walkthrough for an executive audience is written to look rigorous, and it is usually the distractor. The decision disappears into the analysis and the sponsor cannot act on it. Depth belongs in the ADR that the five-slide summary links to, not in the room where approval is being asked for.",
    },

    { kind: "practice", questionId: "D6-q201" },
  ],

  keyTerms: [
    {
      term: "Architecture decision record (ADR)",
      definition:
        "A short, immutable record of one decision: context, the decision, the alternatives rejected and why, and the consequences accepted. Superseded by a new record rather than edited.",
    },
    {
      term: "RFC",
      definition:
        "A proposal circulated for comment before a decision is made. The ADR is what the RFC resolves into once the choice is taken.",
    },
    {
      term: "Reversal condition",
      definition:
        "The measurable observable that would invalidate a decision, recorded alongside it. Turns a contested judgment into a monitored threshold.",
    },
    {
      term: "Accepted risk",
      definition:
        "The consequence a decision knowingly takes on, stated in the record so that nobody later discovers it as a surprise defect.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "An ADR should be updated as the system evolves so it always describes current behavior.",
      why: "Editing a decision record destroys the only thing it is for — the reasoning available at the time — and leaves no trace of why the earlier choice was made or what changed to invalidate it.",
      instead:
        "Write a new ADR and mark the old one superseded, leaving the original text intact.",
    },
    {
      id: "t2",
      trap: "Presenting the full evaluation and every option considered demonstrates rigor to an executive audience.",
      why: "Executives need the decision, its cost and the risk accepted in order to approve or object; burying that in the analysis path spends the meeting and often produces no decision at all.",
      instead:
        "Lead with the decision, its cost per unit of work and the reversal condition; link the detail.",
    },
    {
      id: "t3",
      trap: "Because model behavior is variable, it is safer not to put numbers on a trade-off.",
      why: "Refusing to quantify hands the decision to whoever is most confident in the room, and variability is handled by reporting rates over a stated sample and window rather than by staying vague.",
      instead:
        "Measure the candidates on your own case set and report accuracy, cost per completed task and p95 latency together.",
    },
    {
      id: "t4",
      trap: "A decision is communicated once the team has agreed on it in the design review.",
      why: "Verbal agreement leaves no record of the alternatives or the accepted risk, so the same debate reopens whenever a new stakeholder arrives or the system misbehaves in a way nobody warned about.",
      instead:
        "Close every design review by writing the ADR, including what was rejected and the revisit trigger.",
    },
    {
      id: "t5",
      trap: "When stakeholders ask for the best possible quality, recommending the most capable model is the safe answer.",
      why: "It silently commits the business to a cost and latency profile they never evaluated, and it skips the comparison that would show whether the capability gap actually changes any outcome they care about.",
      instead:
        "Present the measured gain per unit of cost and latency, and let the sponsor accept the trade explicitly.",
    },
  ],

  practiceQuestionIds: ["D6-q201", "D6-q203"],

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

  relatedLessons: ["6.4", "6.5"],
} satisfies Lesson;
