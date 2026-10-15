import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q501",
    domain: 1,
    objective: "1.5",
    stem: "An architect decomposes a regulatory filing task into six sequential steps, each of which passes its own evaluation at roughly 95%. End-to-end acceptance in staging is about 74%, and the team believes something must be instrumented incorrectly. What best explains the gap?",
    choices: [
      {
        id: "A",
        text: "One of the six step evaluations is measured incorrectly, since 95% per step should produce roughly 95% overall.",
        rationale:
          "Per-step scores do not carry through when each step consumes the previous step's output, so no measurement error is needed to explain the drop.",
      },
      {
        id: "B",
        text: "Errors compound along a chain: six independent 95% steps yield roughly 74% end to end, so the decomposition needs verification points.",
      },
      {
        id: "C",
        text: "The steps are too coarse, and splitting them further would raise the end-to-end figure.",
        rationale:
          "More steps multiply more terms together and push the end-to-end figure lower still, unless each new seam adds a check.",
      },
      {
        id: "D",
        text: "The evaluation set is unrepresentative of staging traffic.",
        rationale:
          "A distribution gap is always worth checking, but the observed number is exactly what six independent 95% steps predict without one.",
      },
    ],
    explanation:
      "Accuracies multiply along a chain rather than averaging, and 0.95 to the sixth power is close to 0.735. The gap is the expected behavior of an unverified decomposition, and the remedy is to place validation on the artifacts crossing seams so the product is interrupted rather than extended.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["decomposition", "error-compounding"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q502",
    domain: 1,
    objective: "1.5",
    stem: "An architect is deciding where to cut a complex document-processing task into subtasks. Which TWO properties make a given boundary a good place to split?",
    choices: [
      {
        id: "A",
        text: "Each side of the boundary can be evaluated on its own, so a failure is attributable to one step.",
      },
      {
        id: "B",
        text: "The artifact crossing the boundary has a defined shape that can be validated before the next step runs.",
      },
      {
        id: "C",
        text: "Both sides can share one prompt template, which reduces maintenance.",
        rationale:
          "Template reuse is a convenience, and a seam chosen for prompt tidiness often cuts straight through a judgment that should have stayed whole.",
      },
      {
        id: "D",
        text: "Splitting at that point produces the largest possible number of subtasks.",
        rationale:
          "Maximizing subtask count multiplies latency, cost and compounding error without adding any verification value.",
      },
      {
        id: "E",
        text: "Both sides require the same model tier, keeping behavior consistent across the chain.",
        rationale:
          "Matching tiers is not a reason to split — one of the main returns on a seam is precisely that a simpler step can run on a cheaper model.",
      },
    ],
    explanation:
      "A seam earns its cost by making failure detectable and attributable. Independent evaluability localizes a defect to one step, and a validatable interface artifact stops a bad intermediate result from propagating. Prompt tidiness, maximal fan-out and tier uniformity all add seams without adding detection.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["decomposition", "seams", "verification"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D1-q503",
    domain: 1,
    objective: "1.5",
    stem: "A team builds a feature that compares two 80-page supplier contracts and reports material differences. The single-prompt version reliably catches differences near the start and end of each document but misses clauses in the middle. Which decomposition addresses this most directly?",
    choices: [
      {
        id: "A",
        text: "Summarize both contracts first, then compare the two summaries.",
        rationale:
          "Summarizing before comparison discards exactly the clause-level detail the comparison depends on, trading one form of omission for another.",
      },
      {
        id: "B",
        text: "Split by contract: one call per document to extract its terms, then a third call to compare the two extractions.",
        rationale:
          "This halves the input per call but still asks a single call to cover an entire 80-page document, so mid-document clauses remain at risk.",
      },
      {
        id: "C",
        text: "Raise the maximum output tokens so the model has room to discuss every clause it found.",
        rationale:
          "Output budget does not change what the model attended to in the input; the omission happens on the way in, not on the way out.",
      },
      {
        id: "D",
        text: "Split by section: extract the corresponding clauses from both contracts section by section, then reason over each aligned pair.",
      },
    ],
    explanation:
      "Sectioning cuts a single large item along its own internal structure so that every part gets dedicated attention. Aligning corresponding sections from both contracts also narrows each comparison call to the material it actually needs, which is what removes the dependence on where a clause happens to sit in the document.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["decomposition", "sectioning"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q504",
    domain: 1,
    objective: "1.5",
    stem: "A conversational assistant was decomposed into nine chained calls so that each prompt would be short and easy to maintain. Every step scores well in isolation, but 95th-percentile latency is now fourteen seconds and session abandonment has doubled. What should the architect do first?",
    choices: [
      {
        id: "A",
        text: "Audit the seams and merge the steps that no longer buy a check, a narrower context or a cheaper tier.",
      },
      {
        id: "B",
        text: "Run all nine steps in parallel to collapse the latency.",
        rationale:
          "The steps are chained because each consumes the previous step's output, so parallelizing them is not available without changing what they compute.",
      },
      {
        id: "C",
        text: "Move every step to the fastest available model tier.",
        rationale:
          "A uniformly cheaper tier shaves per-call time but leaves nine round trips in the path and risks the step-level accuracy the team currently has.",
      },
      {
        id: "D",
        text: "Stream partial output so the wait feels shorter to the user.",
        rationale:
          "Perceived latency helps, but with nine sequential calls there is nothing meaningful to stream until late in the chain, so the wait remains real.",
      },
    ],
    explanation:
      "Seams are justified by what they buy: a verification point, a narrower context, a clearer instruction, or a cheaper model tier. Seams added purely for prompt tidiness contribute a round trip and another accuracy term while buying none of those, so removing them is the change that addresses the cause rather than the symptom.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["decomposition", "over-decomposition", "latency"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q505",
    domain: 1,
    objective: "1.5",
    stem: "A compliance team must check 4,000 call transcripts against the same thirty-point checklist and produce both a per-transcript record and one aggregate report. Every transcript gets all thirty checks in the same order, nothing about a transcript changes which checks run, and transcripts are independent of one another. Which decomposition fits the work?",
    choices: [
      {
        id: "A",
        text: "A single agent that works through all 4,000 transcripts in one long-running session and writes the report at the end.",
        rationale:
          "No session can hold 4,000 transcripts, and an agent looping over them serializes work that is completely independent.",
      },
      {
        id: "B",
        text: "A chain in which each transcript's result is passed as context into the check on the next transcript.",
        rationale:
          "Chaining independent items invents a dependency, accumulates irrelevant context, and lets a single bad result cascade through everything after it.",
      },
      {
        id: "C",
        text: "A map step that checks each transcript independently and in parallel, followed by a reduce step that aggregates the per-transcript results.",
      },
      {
        id: "D",
        text: "A routing step that sends each transcript to one of thirty specialized checkers based on its dominant topic.",
        rationale:
          "Routing selects one path per input, but every transcript needs all thirty checks, so a thirty-way route would skip twenty-nine of them.",
      },
    ],
    explanation:
      "Independent items with a shared operation and a required aggregate is the defining shape for map and reduce. The map step parallelizes cleanly and keeps each call's context to one transcript, and the reduce step is the only place that needs to see across the corpus.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["decomposition", "map-reduce"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q506",
    domain: 1,
    objective: "1.5",
    stem: "A single prompt reads a 60-page credit agreement and states whether the borrower complies with its financial covenants. Verdicts differ between runs on the same document, and when reviewers investigate they find the model quoted the right clauses but applied a threshold taken from the wrong section. How should the task be decomposed?",
    choices: [
      {
        id: "A",
        text: "Split the agreement into sections and ask the same compliance question of each, then combine the verdicts.",
        rationale:
          "Sectioning scatters a judgment that needs several clauses at once, and no single section holds enough of the agreement to answer it.",
      },
      {
        id: "B",
        text: "Extract the covenant definitions and their thresholds into a structured record first, then reason about compliance over that record.",
      },
      {
        id: "C",
        text: "Ask the model to state its reasoning before the verdict, so a wrong threshold becomes visible.",
        rationale:
          "Surfacing the reasoning makes the error easier to spot afterwards, but the verdict is still produced by the conflation it is meant to catch.",
      },
      {
        id: "D",
        text: "Run the same prompt three times and take the majority verdict.",
        rationale:
          "Voting suppresses random variation, while this error is systematic: several runs can pull the same wrong threshold from the same wrong section.",
      },
    ],
    explanation:
      "Extract, then reason cuts between finding the facts and judging them, because the two failure modes are different and only the first is a reading problem. Once the thresholds are a structured record, the comparison is checkable on its own and a wrong number is visible without anyone rereading sixty pages.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["decomposition", "extract-then-reason"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q507",
    domain: 1,
    objective: "1.5",
    stem: "One call on the largest model tier reads a scanned invoice, pulls out eleven fields, and then decides whether the invoice may be paid automatically under a written policy. Cost per document is the binding constraint. Which TWO arguments most strongly support splitting this into two steps?",
    choices: [
      {
        id: "A",
        text: "Field extraction is mechanical enough to run on a smaller tier, leaving only the policy judgment on the expensive one.",
      },
      {
        id: "B",
        text: "Two shorter prompts are easier to maintain than one long prompt.",
        rationale:
          "Maintainability is a genuine benefit but a weak one, and it is the argument that most often justifies seams which buy nothing but latency.",
      },
      {
        id: "C",
        text: "Splitting cuts end-to-end latency because the two steps can then run at the same time.",
        rationale:
          "The judgment consumes the extracted fields, so the steps are ordered rather than parallel and the split adds a round trip instead of removing one.",
      },
      {
        id: "D",
        text: "The extracted fields are an artifact that can be checked on their own before the payment decision depends on them.",
      },
      {
        id: "E",
        text: "Each step can then be evaluated against its own success criterion, which raises end-to-end accuracy.",
        rationale:
          "Per-step evaluation improves what you can see rather than what the chain produces, and strong step scores coexist with a weaker end-to-end result.",
      },
    ],
    explanation:
      "A seam earns its place when it lets something be checked or lets work move to a cheaper tier, and this cut does both: the fields are verifiable in isolation, and only the judgment needs the larger model. Arguments from tidiness or from per-step scores justify seams that add latency without adding either.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["decomposition", "seams", "cost"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
] satisfies Question[];
