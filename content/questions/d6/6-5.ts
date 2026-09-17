import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D6-q501",
    domain: 6,
    objective: "6.5",
    stem: "A document-intake assistant scores 94% on the team's forty-case development set. The sponsor, impressed by the demo, wants the manual review queue switched off on launch day to capture the savings immediately. What should the architect recommend?",
    choices: [
      {
        id: "A",
        text: "Run a bounded pilot on live traffic with the manual queue still in place, and switch it off per document type as each one meets a measured threshold.",
      },
      {
        id: "B",
        text: "Switch the queue off at launch and monitor closely, reinstating it if accuracy drops below target.",
        rationale:
          "By the time the drop is visible the errors have already reached customers, and reinstating the queue does not undo them.",
      },
      {
        id: "C",
        text: "Expand the development set to four hundred cases and re-test before making the launch decision.",
        rationale:
          "A larger curated set still reflects what the team imagined rather than what arrives, so it can raise confidence without reducing risk.",
      },
      {
        id: "D",
        text: "Move to a more capable model to build margin above the threshold before launch.",
        rationale:
          "Buying capability against an unmeasured distribution spends money on a gap nobody has characterized yet.",
      },
    ],
    explanation:
      "A development-set score says nothing about the tail of live traffic, where length, noise, scans and edge cases live. A pilot with the existing process still running buys exactly that information at bounded cost, and gating the rollout per segment on measured evidence keeps the blast radius small while the eval set is rebuilt from reality.",
    difficulty: 3,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["pilot", "rollout"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q502",
    domain: 6,
    objective: "6.5",
    stem: "A customer reports that the assistant gave a wrong answer three days ago and quotes it back verbatim. The team's logs contain the request timestamp, the final answer text and total latency. After an afternoon of work nobody can say why the answer was wrong. What was missing from the design?",
    choices: [
      {
        id: "A",
        text: "A longer log retention window.",
        rationale:
          "The record from three days ago was still available; the problem is that it contains nothing explanatory, not that it expired.",
      },
      {
        id: "B",
        text: "Reason codes attached to user feedback on the original response.",
        rationale:
          "Reason codes make aggregate complaint volume actionable but do not let anyone reconstruct what a single past request was given.",
      },
      {
        id: "C",
        text: "Prompt version, model id, retrieved document ids and tool calls recorded with each request.",
      },
      {
        id: "D",
        text: "Token counts and per-request cost recorded alongside latency.",
        rationale:
          "Token and cost figures support budget and optimization work; they say nothing about which documents or instructions produced the answer.",
      },
    ],
    explanation:
      "An AI answer is explained by what the model was given, not by what it returned. Without the prompt version, model id, retrieved document ids and tool results for that specific request, an investigation cannot distinguish a retrieval failure from a prompt change from a model behavior shift, and every incident becomes guesswork.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["monitoring", "traces"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q503",
    domain: 6,
    objective: "6.5",
    stem: "Anthropic announces a newer Claude model, and the engineering lead wants to adopt it next sprint to capture the quality gain. The assistant currently runs under an SLA that commits p95 latency and a cost-per-case budget. Which TWO steps should the architect insist on before any production traffic moves? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Switch production to the new model and compare user feedback before and after the change.",
        rationale:
          "This uses customers as the test set, and the comparison is confounded by whatever else changed in the same period.",
      },
      {
        id: "B",
        text: "Run the existing evaluation suite against the new model with the current prompts, before any rollout.",
      },
      {
        id: "C",
        text: "Rewrite the prompts for the new model first, then evaluate the combination.",
        rationale:
          "Changing model and prompts together means a regression cannot be attributed to either; tune only after a clean baseline exists.",
      },
      {
        id: "D",
        text: "Treat the new model's behavior as a superset of the old one and skip regression testing for prompts that are unchanged.",
        rationale:
          "A newer model is a different behavior distribution, not a strict improvement, and prompts tuned around older quirks routinely regress.",
      },
      {
        id: "E",
        text: "Re-measure latency and cost per completed case, since both can move with a model change and both are committed in the SLA.",
      },
    ],
    explanation:
      "A model upgrade is a change like any other and goes through the same gate. Running the current eval suite with unchanged prompts isolates the model's effect on quality, and re-measuring latency and cost per case checks the two commitments an upgrade can quietly breach even when accuracy improves.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["model-upgrade", "iteration"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "E"],
  },
  {
    schemaVersion: 1,
    id: "D6-q504",
    domain: 6,
    objective: "6.5",
    stem: "An architect is winding down her engagement and asks the delivery lead whether handoff is complete. The implementation team has read the architecture document, attended three walkthroughs and closed every question from the design review. What is the actual exit criterion for handoff?",
    choices: [
      {
        id: "A",
        text: "The implementation team has formally signed off on the architecture document.",
        rationale:
          "A sign-off records agreement with a description; it does not demonstrate that anyone else can run or change the system.",
      },
      {
        id: "B",
        text: "The implementation team has independently reproduced the baseline evaluation results and shipped a prompt change through its own pipeline.",
      },
      {
        id: "C",
        text: "Every open question raised during the design review has been answered and closed.",
        rationale:
          "Answered questions show the design was understood in discussion, which is a much weaker claim than being able to operate it.",
      },
      {
        id: "D",
        text: "The system has been deployed to production successfully.",
        rationale:
          "A deployment can succeed with the architect still on the critical path for every evaluation and prompt change.",
      },
    ],
    explanation:
      "Handoff transfers capability, not documents. Reproducing the baseline proves the team has the eval suite, the golden set and the pinned configuration, and shipping a prompt change through their own pipeline proves they can iterate without the architect, which is the only thing that removes the dependency.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["handoff", "exit-criteria"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q505",
    domain: 6,
    objective: "6.5",
    stem: "An engineer fixes a stakeholder complaint by editing the system prompt and deploying the change the same afternoon. Two weeks later a different capability, which had been working for months, is reported broken, and the prompt edit turns out to be the cause. What should the architect put in place?",
    choices: [
      {
        id: "A",
        text: "Require architect approval before any prompt change is deployed.",
        rationale:
          "Approval depends on one person predicting side effects by reading a diff, which is exactly what an evaluation suite does reliably.",
      },
      {
        id: "B",
        text: "Freeze prompts between scheduled releases so changes are batched.",
        rationale:
          "Batching delays every fix and makes the eventual regression harder to attribute, since several edits ship together.",
      },
      {
        id: "C",
        text: "Track the original complaint in the backlog so it can be revisited if it recurs.",
        rationale:
          "A backlog entry records the issue but neither prevents the regression nor detects it before customers do.",
      },
      {
        id: "D",
        text: "Gate every prompt change on the regression suite, and add the original complaint to the golden set as a permanent case.",
      },
    ],
    explanation:
      "Prompt edits have non-local effects, so iteration needs an automated gate rather than human vigilance. Running the eval suite on every change catches the collateral damage before release, and promoting the reported defect into the golden set means that specific behavior is protected from then on.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["iteration", "regression-gate"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
