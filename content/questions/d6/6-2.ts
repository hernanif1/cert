import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D6-q201",
    domain: 6,
    objective: "6.2",
    stem: "An architect has ten minutes with a steering committee to get approval for a design that routes routine support tickets to a small model and escalates ambiguous ones to a larger model. The committee is the CFO, the COO and the head of customer experience. How should the architect open?",
    choices: [
      {
        id: "A",
        text: "With a walkthrough of the retrieval pipeline and prompt structure that led to the recommendation.",
        rationale:
          "A committee cannot act on pipeline detail, and spending the meeting on it typically ends with the decision deferred rather than taken.",
      },
      {
        id: "B",
        text: "With the recommendation, its cost per resolved ticket against today's baseline, the risk being accepted, and the condition that would trigger a revisit.",
      },
      {
        id: "C",
        text: "With a comparison table of the candidate models and their published benchmark scores.",
        rationale:
          "Benchmarks measure other people's tasks and do not tell this committee what the design costs them or what could go wrong with it.",
      },
      {
        id: "D",
        text: "With the full list of options considered and the evaluation process used to narrow them down.",
        rationale:
          "Showing the process demonstrates diligence but buries the decision; the committee still has to extract what they are approving and what it costs.",
      },
    ],
    explanation:
      "Executives approve decisions, risks and costs, not architectures. Leading with the decision, the unit economics against the current baseline and the accepted risk lets them act, and naming the reversal condition converts the disagreement they might have into a threshold they can watch.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["communication", "executive-audience"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q202",
    domain: 6,
    objective: "6.2",
    stem: "Two years ago the team recorded ADR-007, which chose a single-model design for an internal assistant. The system now routes between two models, and a new engineer reading ADR-007 is confused about current behavior. What should the team do with ADR-007?",
    choices: [
      {
        id: "A",
        text: "Edit ADR-007 so that it describes the routing design the system actually runs.",
        rationale:
          "Editing destroys the record of what was believed when the decision was made, which is the only thing a decision log is for.",
      },
      {
        id: "B",
        text: "Delete ADR-007, since a record that misdescribes the system is worse than no record.",
        rationale:
          "Deletion removes the reasoning that a future reader needs in order to understand why the design changed and what constraints applied at the time.",
      },
      {
        id: "C",
        text: "Leave ADR-007 untouched and treat the code as the authoritative description of current behavior.",
        rationale:
          "Code shows what the system does but never why alternatives were rejected, so the same debate reopens every time a new engineer or stakeholder arrives.",
      },
      {
        id: "D",
        text: "Write a new ADR recording the routing decision and mark ADR-007 superseded, leaving its original text intact.",
      },
    ],
    explanation:
      "Decision records are immutable and append-only. Superseding preserves the reasoning that applied at the time, shows what changed and why, and keeps the log usable as a history of the architecture rather than as an always-lagging description of the current system.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["adr", "documentation"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q203",
    domain: 6,
    objective: "6.2",
    stem: "A design document states: “We recommend Opus 5 for the drafting stage because it produces noticeably better output.” A reviewer sends it back. Which revision most strengthens the recommendation?",
    choices: [
      {
        id: "A",
        text: "Replace the claim with measured deltas on the team's own case set — rubric score, cost per completed draft and p95 latency for each candidate — plus the condition that would trigger a revisit.",
      },
      {
        id: "B",
        text: "Cite published benchmark results comparing the candidate models.",
        rationale:
          "Benchmarks are run on other people's tasks with other people's prompts, and they routinely fail to predict rank order on a specific workload.",
      },
      {
        id: "C",
        text: "Add the result of a preference test in which reviewers chose their favorite of two drafts.",
        rationale:
          "A preference sample is real evidence on quality but reports only one side of the trade-off, leaving cost and latency — the terms the decision actually turns on — unstated.",
      },
      {
        id: "D",
        text: "Note that Opus 5 is the most capable model in the Claude 5 family, so it is the safe default for a quality-sensitive stage.",
        rationale:
          "Defaulting to the most capable model commits the business to a cost and latency profile nobody evaluated, and it skips the comparison entirely.",
      },
    ],
    explanation:
      "A trade-off is only communicated when both sides are quantified on the workload in question. Quality, cost per completed unit of work and latency measured on the team's own cases let a stakeholder accept the trade explicitly, and the reversal condition tells everyone what evidence would reopen the decision.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["trade-offs", "quantification"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q204",
    domain: 6,
    objective: "6.2",
    stem: "An architect joins a company and reads the previous architect's decision log to understand why an agentic support system is built the way it is. Which TWO properties of that log determine whether it actually answers her questions?",
    choices: [
      {
        id: "A",
        text: "The records are maintained as a deck that is presented at each quarterly architecture review.",
        rationale:
          "A presentation format optimizes for the meeting rather than the reader, and review cadence says nothing about whether the reasoning was captured.",
      },
      {
        id: "B",
        text: "Each record names the alternatives that were rejected and the reason each was rejected.",
      },
      {
        id: "C",
        text: "Records are edited whenever the system changes, so the log always describes current behavior.",
        rationale:
          "Continuous editing erases the history, leaving a description of today's system and no explanation of how it got there.",
      },
      {
        id: "D",
        text: "Each record states the observable condition that would make the team revisit the decision.",
      },
      {
        id: "E",
        text: "Records include the complete evaluation output from every model that was tested.",
        rationale:
          "Raw evaluation dumps make a record long without making it clearer; the conclusion drawn from the data is what a later reader needs.",
      },
    ],
    explanation:
      "A decision log answers two questions for whoever inherits the system: why not the obvious alternative, and when should this be reconsidered. Rejected options with reasons stop the same debate recurring, and a recorded reversal condition tells the new architect whether current evidence has already invalidated the choice.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["adr", "decision-records"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D6-q205",
    domain: 6,
    objective: "6.2",
    stem: "An architect is presenting a customer-support assistant design to the company's data protection officer, who asks why the design is acceptable from her side. What should the presentation lead with?",
    choices: [
      {
        id: "A",
        text: "Accuracy results on the golden set, since answer quality is what ultimately protects customers.",
        rationale:
          "Accuracy is a product concern; it does not tell a data protection officer which personal data moves where or how long it is kept.",
      },
      {
        id: "B",
        text: "The system prompt and guardrail wording used to stop the assistant producing unsafe output.",
        rationale:
          "Prompt wording is a soft control and answers a safety question, not the data-handling question the officer is actually asking.",
      },
      {
        id: "C",
        text: "Where data flows, which fields leave the region, what is retained and for how long, and where untrusted text crosses into a component that can act.",
      },
      {
        id: "D",
        text: "The model vendor's compliance certifications and published data-handling commitments.",
        rationale:
          "Vendor attestations matter in procurement but describe the provider's practices, not what this specific system does with this organization's data.",
      },
    ],
    explanation:
      "Communication is shaped by what the audience must decide. A data protection officer signs off on data flow, retention, residency and trust boundaries, so the design is presented in those terms; accuracy and prompt detail belong in the versions of this story told to product and engineering.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["communication", "audience", "compliance"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q206",
    domain: 6,
    objective: "6.2",
    stem: "A team is still weighing two retrieval designs for a shared knowledge assistant and wants written input from three other engineering teams before committing to either. Which document is appropriate now, and what follows it?",
    choices: [
      {
        id: "A",
        text: "An ADR marked Accepted for the preferred option, revised later if the other teams object.",
        rationale:
          "Recording a decision as accepted before it is made misrepresents the state of the work and invites the record to be edited afterward.",
      },
      {
        id: "B",
        text: "An RFC circulated for comment now, followed by an ADR once the decision is taken.",
      },
      {
        id: "C",
        text: "A runbook entry describing how each option would be operated in production.",
        rationale:
          "A runbook is written for operators after a design exists; it is not a vehicle for soliciting a decision from peer teams.",
      },
      {
        id: "D",
        text: "An appendix in the architecture overview listing both options for readers to weigh.",
        rationale:
          "An appendix records that two options exist without asking anyone to respond, so no input is gathered and no decision is closed.",
      },
    ],
    explanation:
      "An RFC gathers input before a decision; an ADR records the outcome and the reasoning once it is made. Keeping them distinct means the decision log contains decisions rather than proposals, and reviewers know whether they are being consulted or informed.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["rfc", "adr"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
