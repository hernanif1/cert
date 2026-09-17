import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q201",
    domain: 1,
    objective: "1.2",
    stem: "A document-classification service has run in production for four months. Input validation, the model call and JSON schema enforcement on the output all work as designed, and no incidents have been raised. Product asks why classification quality has not improved since launch. What is missing from the architecture?",
    choices: [
      {
        id: "A",
        text: "A larger model tier for the classification call.",
        rationale:
          "Swapping tiers is a change, not a mechanism; without captured outcomes the team still has no way to tell whether the swap helped or hurt.",
      },
      {
        id: "B",
        text: "A retrieval layer grounding each classification in similar past examples.",
        rationale:
          "Retrieval might raise accuracy once, but it is another one-off intervention and leaves the team unable to measure whether quality is moving at all.",
      },
      {
        id: "C",
        text: "A second model pass that reviews the first model's classification before it is returned.",
        rationale:
          "A verifier can raise precision per request, yet nothing about it accumulates evidence the team could have learned from over four months.",
      },
      {
        id: "D",
        text: "A feedback loop that captures corrections linked to the input and versions that produced them, feeding an evaluation set.",
      },
    ],
    explanation:
      "Input, processing and output are all present and healthy, which is exactly why quality is static: nothing converts production behavior into evidence. The feedback stage — capture, labeling, and an evaluation set that later changes are measured against — is the only one of the four that makes improvement possible rather than accidental.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["architecture", "feedback-loops"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q202",
    domain: 1,
    objective: "1.2",
    stem: "A procurement assistant ingests supplier PDFs and emails, then calls internal tools that create purchase requisitions. In design review a security engineer points out that supplier documents are attacker-controlled content. Which change most directly addresses the exposure?",
    choices: [
      {
        id: "A",
        text: "Add instructions to the system prompt telling the model to ignore any directives found inside supplier documents.",
        rationale:
          "A prompt-level instruction sits in the same context as the injected text and competes with it; it is a mitigation, not a boundary.",
      },
      {
        id: "B",
        text: "Treat ingested document text as untrusted data — delimited and separated from instructions — and gate requisition creation behind an authorization check outside the model.",
      },
      {
        id: "C",
        text: "Run a dedicated model pass that detects prompt injection before the main call.",
        rationale:
          "Detection is worthwhile defense in depth, but a classifier that misses one injection still hands it a tool with full authority, so the authority itself has to be bounded.",
      },
      {
        id: "D",
        text: "Restrict ingestion to documents from suppliers on an approved allowlist.",
        rationale:
          "An allowlist limits who can send content but says nothing about what a careless or compromised approved supplier's document contains.",
      },
    ],
    explanation:
      "The input stage owns the trust boundary, and the boundary is structural rather than persuasive: external content is marked as data, and the authority to act is enforced outside the model. Gating requisition creation on an authorization check means a successful injection changes what the model says, not what the system does.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["architecture", "input-stage", "trust-boundary"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q203",
    domain: 1,
    objective: "1.2",
    stem: "A nightly pipeline extracts fields from invoices and writes them into an ERP system. Roughly twice a month the ERP load job aborts because an amount field arrived as prose rather than a number. The model call itself returns successfully every time. Which change belongs in the architecture?",
    choices: [
      {
        id: "A",
        text: "Ask the model to return the amount as a string and have the load job parse it with a permissive numeric parser.",
        rationale:
          "A permissive parser turns an unreadable amount into a plausible-looking wrong number, replacing a loud abort with a silent financial error and still leaving the pipeline with no output contract.",
      },
      {
        id: "B",
        text: "Move field extraction to a larger model tier to reduce the malformed-value rate.",
        rationale:
          "A stronger model lowers the rate but leaves the pipeline with no way to detect the cases that still occur, so the ERP job keeps aborting occasionally.",
      },
      {
        id: "C",
        text: "Validate the record against a schema at the output stage, with a bounded repair-or-route-to-review path for records that fail.",
      },
      {
        id: "D",
        text: "Have the ERP load job coerce non-numeric values to null and continue processing.",
        rationale:
          "This stops the crash by silently discarding data, converting a loud, visible failure into quiet corruption of a financial record.",
      },
    ],
    explanation:
      "The output stage owns the contract with downstream consumers: shape the result, validate it deterministically, and define what happens when validation fails. Schema enforcement catches the malformed field where it is produced, and a bounded repair or review path keeps a bad record out of the ledger without hiding it.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["architecture", "output-stage", "validation"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q204",
    domain: 1,
    objective: "1.2",
    stem: "A team is designing the feedback stage for a customer-email triage system that routes messages to one of nine queues. Which TWO mechanisms give the team evidence they can actually act on?",
    choices: [
      {
        id: "A",
        text: "Store every triage decision together with the exact input, prompt version and model version that produced it.",
      },
      {
        id: "B",
        text: "Publish a weekly dashboard showing an aggregate satisfaction score for the triage feature.",
        rationale:
          "An aggregate score signals that something moved but carries no link to the inputs that moved it, so no one can reproduce or fix a case.",
      },
      {
        id: "C",
        text: "Capture each occasion on which a human moves an email to a different queue, as a labeled correction against the original decision.",
      },
      {
        id: "D",
        text: "Raise logging verbosity to capture full request and response payloads at debug level.",
        rationale:
          "Volume is not evidence: unstructured debug logs with no outcome attached give the team text to read rather than a labeled set to measure against.",
      },
      {
        id: "E",
        text: "Schedule a quarterly session in which the team reads a sample of triage outputs and discusses them.",
        rationale:
          "A discussion produces opinions rather than a reusable evaluation set, and a quarterly cadence cannot detect a regression shipped last week.",
      },
    ],
    explanation:
      "A feedback loop needs capture and labels. Correlating each decision with its input and versions makes a failure reproducible, and a human re-queueing an email is a free, precisely attributable label. Dashboards, verbose logs and periodic discussions all describe production without producing anything a later change can be measured against.",
    difficulty: 3,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["architecture", "feedback-loops", "evaluation"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D1-q205",
    domain: 1,
    objective: "1.2",
    stem: "An architect reviews a claims-triage design in which a human review gate runs the morning after the decision letter has already been emailed to the claimant, so reviewers can catch errors and issue corrections. Volume is high and the measured error rate is about 2%. What is the strongest architectural objection?",
    choices: [
      {
        id: "A",
        text: "A gate placed after delivery cannot prevent what it exists to prevent; it has been converted from a control into an after-the-fact correction.",
      },
      {
        id: "B",
        text: "Reviewing every decision is too expensive at this volume and should be sampled instead.",
        rationale:
          "Sampling may well be the right cost decision, but it addresses review effort and leaves the gate sitting downstream of an irreversible action.",
      },
      {
        id: "C",
        text: "A 2% error rate is too high for a customer-facing decision and must be reduced before launch.",
        rationale:
          "An error rate is only meaningful against a stated error budget, and the structural problem here is where the gate sits rather than the rate itself.",
      },
      {
        id: "D",
        text: "Next-day review produces no feedback signal, because corrections made that late cannot be attributed to a decision.",
        rationale:
          "Reviewer corrections are in fact an excellent feedback signal and remain attributable; the objection concerns the timing of the control, not the data.",
      },
    ],
    explanation:
      "Gate placement is an output-stage decision. Once the letter is sent, the action is irreversible from the claimant's point of view, so a later review can only amend the record. A control intended to prevent an outcome has to sit in the path of the action it governs; post-delivery sampling is appropriate only where the action can be undone.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["architecture", "output-stage", "human-in-the-loop"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q206",
    domain: 1,
    objective: "1.2",
    stem: "A team sketches an end-to-end design for a meeting-notes assistant: participants upload audio, the audio is transcribed, a model summarizes the transcript, and the summary is emailed to attendees. Which element of the end-to-end model is absent from this sketch?",
    choices: [
      {
        id: "A",
        text: "Processing — no model orchestration is described.",
        rationale:
          "Transcription followed by summarization is the processing stage; it is thinly specified but it is present in the sketch.",
      },
      {
        id: "B",
        text: "Input — no ingestion mechanism is described.",
        rationale:
          "Audio upload is the ingestion mechanism, so the input stage exists even though its validation and normalization are under-specified.",
      },
      {
        id: "C",
        text: "Output — no delivery mechanism is described.",
        rationale:
          "Emailing the summary to attendees is the delivery path; what it lacks is validation, not existence.",
      },
      {
        id: "D",
        text: "Feedback loops — nothing captures whether a summary was right or how corrections are recorded.",
      },
    ],
    explanation:
      "Input, processing and output all appear in the sketch in at least rudimentary form. Nothing records whether the summaries were accurate, captures an attendee's correction, or accumulates an evaluation set, which is the stage teams most often omit and the one that determines whether the system can ever improve.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["architecture", "feedback-loops"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
