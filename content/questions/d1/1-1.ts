import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q101",
    domain: 1,
    objective: "1.1",
    stem: "A logistics company tells an architect it wants to use Claude to reduce the twelve days it currently takes to close a customer dispute. No further detail is offered. What should the architect do first?",
    choices: [
      {
        id: "A",
        text: "Benchmark several Claude models against a sample of dispute emails to establish a capability baseline.",
        rationale:
          "Benchmarking before the task is identified measures capability on work the system may never be asked to do, and produces a number nobody can act on.",
      },
      {
        id: "B",
        text: "Build a retrieval index over the dispute archive so any future design starts with grounding in place.",
        rationale:
          "Indexing is a plausible component of an eventual design, but committing to it now fixes an architecture before anyone knows which task is being automated.",
      },
      {
        id: "C",
        text: "Break the dispute process into its constituent tasks and find where the twelve days are actually spent.",
      },
      {
        id: "D",
        text: "Draft a system prompt encoding the dispute policy so the business has something concrete to react to.",
        rationale:
          "A prompt is an answer to a question that has not been asked yet; reacting to it steers the conversation toward wording rather than toward the process and its metric.",
      },
    ],
    explanation:
      "Translation begins by converting a stated outcome into a task with a metric. Cycle time is an aggregate over a multi-step process, and the twelve days may sit in waiting, in approvals, or in one reading-heavy activity. Until the architect knows which, any model, index or prompt decision is a guess about the wrong thing.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["translation", "scoping"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q102",
    domain: 1,
    objective: "1.1",
    stem: "A retail bank's fraud-operations lead asks for a system that decides whether a flagged transaction is fraudulent. Reviewing a legitimate transaction costs about four minutes of analyst time; releasing a fraudulent one costs an average of $2,100. Which success criterion best reflects a correct translation of this problem?",
    choices: [
      {
        id: "A",
        text: "Maximize recall on confirmed fraud, subject to a stated ceiling on the volume sent for analyst review.",
      },
      {
        id: "B",
        text: "Maximize overall classification accuracy on a labeled sample of previously flagged transactions.",
        rationale:
          "Accuracy weights both error types identically, so a system can score well by trading expensive missed fraud for cheap avoided reviews.",
      },
      {
        id: "C",
        text: "Minimize the number of transactions escalated to analysts while keeping fraud losses flat.",
        rationale:
          "This optimizes the four-minute error and treats the $2,100 error as a constraint to hold constant, which inverts the cost structure the business described.",
      },
      {
        id: "D",
        text: "Match the decision a senior analyst would make on at least 90% of sampled cases.",
        rationale:
          "Agreement with one reviewer is a useful diagnostic, but it inherits that analyst's own error profile and still treats a four-minute cost the same as a $2,100 one.",
      },
    ],
    explanation:
      "The two error types differ by roughly three orders of magnitude in cost, so the success criterion has to encode that asymmetry rather than average it away. Recall subject to a review-capacity ceiling states both the objective the business cares about and the operational constraint that bounds it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["translation", "success-criteria", "error-budget"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q103",
    domain: 1,
    objective: "1.1",
    stem: "A manufacturer is evaluating an assistant that would answer engineers' questions about equipment maintenance history. Which TWO characteristics most strongly indicate the task is a good fit for a Claude-based solution?",
    choices: [
      {
        id: "A",
        text: "The criteria engineers apply when judging a maintenance issue are written down in service manuals and standards.",
      },
      {
        id: "B",
        text: "The maintenance database already exposes a deterministic query API covering every field engineers ask about.",
        rationale:
          "An existing API that answers the question exactly means a language layer adds cost and a failure mode without adding judgment.",
      },
      {
        id: "C",
        text: "The company has approved a three-year budget for an enterprise AI program.",
        rationale:
          "Funding decides whether a project happens, not whether the work is language-shaped or whether its errors can be caught.",
      },
      {
        id: "D",
        text: "Engineers' questions arrive as free-text narratives mixing symptoms, part numbers and site conditions.",
      },
      {
        id: "E",
        text: "Answers must be numerically exact to four decimal places for a regulatory filing.",
        rationale:
          "Exact arithmetic is a poor fit for a language model and points toward a calculation service the model can call instead.",
      },
    ],
    explanation:
      "Fit is decided by the shape of the work: unstructured language on the way in, and a judgment a competent person could make from criteria that are already documented. Budget, an existing deterministic API and a requirement for exact arithmetic all argue about something other than whether the task is language-shaped.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["translation", "fit-assessment"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D1-q104",
    domain: 1,
    objective: "1.1",
    stem: "An architect inherits a signed business case: deploy an agent that replaces the tier-1 support team, saving eighteen roles. Discovery shows that 70% of tier-1 volume is password resets, which an existing self-service portal already handles deterministically — users simply do not know the portal exists. What is the most appropriate next action?",
    choices: [
      {
        id: "A",
        text: "Build the agent as specified, since the business case is approved and the savings are already committed.",
        rationale:
          "An approved case validates funding, not the translation; building against a mistaken problem statement commits the spend and misses the actual cost driver.",
      },
      {
        id: "B",
        text: "Build the agent and have it perform password resets directly, since that is where the volume is.",
        rationale:
          "This rebuilds a capability the portal already provides deterministically, adding model cost and a new failure mode on top of a solved problem.",
      },
      {
        id: "C",
        text: "Scope the agent to the remaining 30% of tickets and revise the savings estimate downward.",
        rationale:
          "Narrowing scope is sensible arithmetic, but it accepts the original framing and leaves the largest cost driver — discoverability — completely untouched.",
      },
      {
        id: "D",
        text: "Report that most of the volume is a discoverability problem and re-translate the request before choosing any architecture.",
      },
    ],
    explanation:
      "Translation is not finished when a business case is signed; it is finished when the task, the metric and the error budget survive contact with the process. Here the dominant driver is that users cannot find an existing deterministic tool, which no architecture choice addresses and which the architect is obliged to surface before committing to one.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["translation", "scoping", "fit-assessment"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q105",
    domain: 1,
    objective: "1.1",
    stem: "A legal department asks for a contract-review assistant that flags unacceptable indemnity clauses. During translation the architect discovers that no two reviewers agree on which clauses in a sample of twenty contracts are unacceptable. What does this most directly indicate?",
    choices: [
      {
        id: "A",
        text: "The judgment is subtle, so the design needs the most capable model tier available.",
        rationale:
          "Model capability cannot settle a disagreement about what the right answer is; a stronger model simply produces a different answer nobody can grade.",
      },
      {
        id: "B",
        text: "The success criterion does not exist yet, and building should wait until reviewers can agree on graded examples.",
      },
      {
        id: "C",
        text: "The assistant should surface both interpretations and let the reviewer choose between them.",
        rationale:
          "Surfacing alternatives may be a reasonable product decision, but it gives the team no way to tell whether the system is right, so it can never be evaluated or improved.",
      },
      {
        id: "D",
        text: "The work suits a multi-agent design with one agent per reviewer's interpretation.",
        rationale:
          "Modeling each reviewer separately multiplies cost and still leaves the team with no agreed criterion against which to judge any of the outputs.",
      },
    ],
    explanation:
      "A success criterion has to be concrete enough that two reviewers grading the same output agree. Disagreement on a twenty-item sample means the translation is incomplete, and no architectural choice can substitute for a target the organization has not defined.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["translation", "success-criteria", "evaluation"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q106",
    domain: 1,
    objective: "1.1",
    stem: "A pharmaceutical company's medical-affairs team wants Claude to help respond to unsolicited physician questions. Regulation requires every statement to be traceable to an approved source, and no response may leave the company without a licensed reviewer's sign-off. Which translation of the problem is most defensible?",
    choices: [
      {
        id: "A",
        text: "A drafting and citation-assembly task producing a reviewer-ready draft, with the sign-off gate kept as a hard architectural constraint.",
      },
      {
        id: "B",
        text: "A fully automated response pipeline with a post-hoc audit of a 5% sample of sent responses.",
        rationale:
          "Auditing after sending breaks the stated requirement that nothing leaves without sign-off; a control has to sit in the path, not downstream of it.",
      },
      {
        id: "C",
        text: "A classification task that decides which questions are safe to answer automatically and which require review.",
        rationale:
          "This reintroduces an automated send path and makes an unreviewable decision about reviewability, which is precisely the judgment the regulation reserves for a licensed person.",
      },
      {
        id: "D",
        text: "A retrieval task that returns approved source passages and leaves all drafting to the reviewer.",
        rationale:
          "This respects the constraint but returns almost none of the hours, since assembling the prose is where most of the reviewer's time actually goes.",
      },
    ],
    explanation:
      "The regulatory constraint fixes the human decision boundary before any architecture is chosen, so the task must stop short of sending. Within that boundary the valuable scope is drafting plus citation assembly, which moves the hours the reviewer spends writing while leaving the sign-off gate in the path where the rule requires it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["translation", "human-in-the-loop", "regulated"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
