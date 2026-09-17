import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D6-q101",
    domain: 6,
    objective: "6.1",
    stem: "A logistics operations director opens a kickoff meeting by asking for “an AI that reads our shipping exception emails and tells the team what to do about each one.” She has brought three example emails she wrote herself for the meeting. What should the architect do first?",
    choices: [
      {
        id: "A",
        text: "Draft a system prompt and test it against her three examples to establish feasibility quickly.",
        rationale:
          "Three emails written for a meeting are not the production distribution, and a prompt that handles them creates an expectation nothing has been measured against.",
      },
      {
        id: "B",
        text: "Estimate volume and latency needs so a model can be selected before the next session.",
        rationale:
          "Model selection is a design activity, and volume alone does not tell you whether the task is well defined or whether the emails even contain the information needed to act.",
      },
      {
        id: "C",
        text: "Request fifty real exception emails from last month, including ones that were handled badly, and ask who decides what the right action was.",
      },
      {
        id: "D",
        text: "Propose a two-week proof of concept so the team has something concrete to react to.",
        rationale:
          "A prototype built before success criteria exist can only be demonstrated, never evaluated, and it moves the conversation away from defining what correct means.",
      },
    ],
    explanation:
      "Discovery needs real inputs and an owner for the definition of correct. Real emails expose the length, language and messiness the design must survive, and naming who adjudicates a disputed action is what makes a golden set, and therefore any later accuracy claim, possible at all.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["discovery", "requirements"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q102",
    domain: 6,
    objective: "6.1",
    stem: "In a discovery workshop for a clinical-coding assistant, two senior coders independently label the same thirty charts. They agree on twenty-two. The sponsor wants to move straight to design with a 95% accuracy target. What is the most important implication of the labeling exercise?",
    choices: [
      {
        id: "A",
        text: "The labeling rule must be written and the disagreements adjudicated before any accuracy target means anything.",
      },
      {
        id: "B",
        text: "The target should be lowered to roughly 73% to match the observed agreement between coders.",
        rationale:
          "Copying the disagreement rate into a target encodes the ambiguity rather than resolving it, and it commits the project to a number derived from an undefined label.",
      },
      {
        id: "C",
        text: "A more capable model should be selected so the system can exceed human-level agreement.",
        rationale:
          "No model can outperform a standard that does not exist; without an agreed label there is nothing for a stronger model to be measured against.",
      },
      {
        id: "D",
        text: "The thirty-chart sample is too small, so several hundred more charts should be labeled before deciding.",
        rationale:
          "More charts labeled under the same undefined rule produce more disagreement, not more clarity; sample size is not the binding constraint here.",
      },
    ],
    explanation:
      "Expert disagreement on a quarter of cases means the task definition is missing, not that the model or the sample is inadequate. Until the organization decides what the correct code is in the disputed cases, no golden set exists, so a 95% target cannot be met, missed or even computed.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["discovery", "ground-truth"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q103",
    domain: 6,
    objective: "6.1",
    stem: "A discovery call for an internal legal-research assistant produces a one-page requirement: “answers questions about our contracts, 95% accurate, live in Q3.” Which TWO additions would do the most to make that requirement actionable?",
    choices: [
      {
        id: "A",
        text: "A named person who adjudicates whether a given answer is correct.",
      },
      {
        id: "B",
        text: "A decision on the embedding model and chunking strategy for the contract corpus.",
        rationale:
          "These are design choices that follow from the requirement; fixing them now commits the architecture before anyone can say what a correct answer is.",
      },
      {
        id: "C",
        text: "The population the 95% is measured over, such as a fixed set of representative questions with agreed answers.",
      },
      {
        id: "D",
        text: "A projected monthly API budget signed off by finance.",
        rationale:
          "Budget planning matters, but a spend figure says nothing about whether an answer was right; the requirement stays unfalsifiable with or without it.",
      },
      {
        id: "E",
        text: "Written confirmation from the sponsor that the Q3 date has some flexibility.",
        rationale:
          "Schedule flexibility changes what happens when the requirement is missed; it does not make the requirement measurable in the first place.",
      },
    ],
    explanation:
      "An accuracy figure is only meaningful with a denominator and an adjudicator: which cases it is measured over, and who decides correctness when the answer is contested. Those two turn an aspiration into something a specific evaluation run can pass or fail, which is what the rest of the design depends on.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["discovery", "success-criteria"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D6-q104",
    domain: 6,
    objective: "6.1",
    stem: "During discovery for a supplier-facing assistant that should answer parts-availability questions, the architect learns that live stock levels sit in a third-party system with no API, and that the only accessible data is a nightly export that is frequently out of date by the time suppliers ask. A data-sharing agreement would take months. What is the correct discovery outcome?",
    choices: [
      {
        id: "A",
        text: "Design retrieval over the nightly export and note the staleness in the interface.",
        rationale:
          "A disclaimer does not make a stale answer useful to a supplier deciding whether to order, and it hides a feasibility constraint inside the user experience.",
      },
      {
        id: "B",
        text: "Select a model with a large context window so the entire nightly export can be passed in each request.",
        rationale:
          "Context size does not make stale data current, and passing a full export on every request raises cost and latency without touching the actual problem.",
      },
      {
        id: "C",
        text: "Add a tool that calls the live system and request the necessary access during the design phase.",
        rationale:
          "The integration is the right shape, but discovery's job is to surface that scope and schedule now depend on a months-long agreement rather than to assume the access will arrive.",
      },
      {
        id: "D",
        text: "Report that the data required to answer the primary question is not reliably available, and scope the project to the question classes the export can actually answer.",
      },
    ],
    explanation:
      "If a competent human could not answer the question from the data the system can reach, no model choice fixes it. The discovery deliverable is the finding itself plus a scope the available data supports, so the sponsor can decide whether to fund the data work before anyone builds against a source that cannot carry the use case.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["discovery", "feasibility", "data-access"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q105",
    domain: 6,
    objective: "6.1",
    stem: "A sponsor has budgeted a document-analysis assistant the way the company buys SaaS: four hundred users at a fixed price per user per month. Discovery reveals that typical inputs are thirty-page PDFs and that a user works through several follow-up turns per document. What should the architect establish before any budget is agreed?",
    choices: [
      {
        id: "A",
        text: "A per-seat price ceiling, so the finance team has a familiar number to plan against.",
        rationale:
          "A seat price makes the forecast comfortable rather than accurate; it hides the token drivers that determine what the system actually costs to run.",
      },
      {
        id: "B",
        text: "Request volume, typical input and output length, and how many turns a task takes, and model spend per completed task from those.",
      },
      {
        id: "C",
        text: "The cheapest model capable of the task, so the budget is minimized from the start.",
        rationale:
          "Choosing on unit price before the workload is quantified can raise total spend, since a weaker model that needs retries or escalation costs more per completed task.",
      },
      {
        id: "D",
        text: "A hard monthly cap enforced by rate limiting so the budget cannot be exceeded.",
        rationale:
          "A cap protects the invoice by degrading the service when it binds, and it still leaves everyone ignorant of what the workload genuinely costs.",
      },
    ],
    explanation:
      "Spend on an LLM system tracks tokens, not seats: input length, output length, retrieval depth, retries and turns per task. Adding users multiplies cases but does not change the cost of a case, so the forecast has to be built from measured workload characteristics captured during discovery.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["discovery", "cost"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q106",
    domain: 6,
    objective: "6.1",
    stem: "An architect is preparing the discovery agenda for a fraud-review assistant that will pre-screen transactions before a human analyst sees them. Which question most directly determines where a human review gate belongs in the design?",
    choices: [
      {
        id: "A",
        text: "What does a missed fraudulent transaction cost compared with a legitimate transaction that gets wrongly flagged?",
      },
      {
        id: "B",
        text: "How many transactions does the review team process in a typical day?",
        rationale:
          "Volume sizes the system and informs cost, but it says nothing about which kind of mistake the business can afford to absorb.",
      },
      {
        id: "C",
        text: "Which Claude model does the team expect the system to use?",
        rationale:
          "Model choice is a design decision that should follow from the requirements, and it does not locate where human judgment is needed.",
      },
      {
        id: "D",
        text: "How long does an analyst currently spend reviewing a single transaction?",
        rationale:
          "This establishes part of the baseline and the efficiency case, but it does not reveal the relative cost of the two error types.",
      },
    ],
    explanation:
      "Review gates exist to absorb the expensive error. Until you know the cost ratio between a false negative and a false positive, you cannot decide which outputs need human confirmation, where confidence thresholds belong, or which class deserves a stricter accuracy target than the rest.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["discovery", "error-cost"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
