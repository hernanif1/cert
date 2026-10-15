import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D6-q301",
    domain: 6,
    objective: "6.3",
    stem: "A customer's procurement team wants the support-assistant contract to guarantee “99% accurate answers.” The account team is ready to sign. What should the architect propose instead?",
    choices: [
      {
        id: "A",
        text: "A commitment on a defined population and method — field-level accuracy on a fixed golden set re-run each release — plus a defect triage time, with availability and p95 latency committed separately.",
      },
      {
        id: "B",
        text: "A 95% guarantee, which is more realistic for a generative system and still reassures the customer.",
        rationale:
          "Lowering an undefined number leaves it undefined; the first disputed answer reopens the argument with nothing to settle it.",
      },
      {
        id: "C",
        text: "No accuracy commitment at all, on the grounds that model output is non-deterministic.",
        rationale:
          "Aggregate rates over a fixed labeled set are stable even when individual outputs vary, so refusing to commit gives away a negotiation that was winnable.",
      },
      {
        id: "D",
        text: "A commitment that every answer is reviewed by a human before it reaches the customer.",
        rationale:
          "This converts a quality commitment into a staffing promise that destroys the economics, and human reviewers miss errors too.",
      },
    ],
    explanation:
      "An enforceable commitment needs a population, a method and a window. Splitting the promise into closed-task accuracy on a named golden set, a process guarantee for defects, and separate availability and latency terms gives the customer something real and gives the team something it can actually verify each release.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["sla", "expectation-alignment"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q302",
    domain: 6,
    objective: "6.3",
    stem: "A retrieval team wants to add a re-ranking stage that measurably improves answer quality but adds about 600 ms at p95. The signed SLA commits p95 end-to-end latency under 4 seconds, and current p95 is 3.7 seconds. What is the best course of action?",
    choices: [
      {
        id: "A",
        text: "Ship the re-ranker and monitor, since p95 is an aggregate over many requests and will absorb the additional stage.",
        rationale:
          "Adding a fixed stage cost shifts the whole latency distribution rather than averaging out, so the percentile breaches almost immediately.",
      },
      {
        id: "B",
        text: "Renegotiate the SLA to 5 seconds before shipping the improvement.",
        rationale:
          "Renegotiation may eventually be right, but asking for it before looking inside the budget spends stakeholder goodwill on a constraint that has not been shown to bind.",
      },
      {
        id: "C",
        text: "Find the 600 ms elsewhere in the latency budget — a smaller first-pass candidate set, caching, or moving a stage off the critical path — and only renegotiate if it cannot be found.",
      },
      {
        id: "D",
        text: "Return the first-pass answer immediately, then run the re-ranker asynchronously and correct the answer if it differs.",
        rationale:
          "Visibly revising an answer after delivery is a worse experience than a slightly slower correct one, and it pays for both passes on every request.",
      },
    ],
    explanation:
      "A latency SLA is a fixed budget that every pipeline stage draws from, so a new stage must be funded from within it before the commitment is reopened. Writing the budget as a per-stage decomposition is what makes that trade visible and keeps quality improvements from silently consuming a contractual promise.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["sla", "latency-budget"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q303",
    domain: 6,
    objective: "6.3",
    stem: "Six months after launch, the product team reports that “users say the assistant is unreliable,” based on a 7% thumbs-down rate. Engineering cannot act on the report: the rate has been roughly flat, and nobody can say which part of the system the complaints implicate. What change to the feedback loop helps most?",
    choices: [
      {
        id: "A",
        text: "Increase the number of outputs a domain expert reviews in the weekly sampled review.",
        rationale:
          "A larger expert sample catches drift the users never report, but it still does not attribute the 7% that users are already flagging.",
      },
      {
        id: "B",
        text: "Move to a more capable model to raise overall quality and bring the negative rate down.",
        rationale:
          "Spending on capability without knowing whether the failures are retrieval, latency or unwanted refusals may not move the rate at all.",
      },
      {
        id: "C",
        text: "Add an optional free-text comment box to the thumbs-down control.",
        rationale:
          "Free text arrives sparse and unstructured and has to be manually coded before it can be counted, which is exactly the work reason codes avoid.",
      },
      {
        id: "D",
        text: "Require a reason code on negative feedback, route each code to the component it implicates, and promote confirmed defects into the evaluation set.",
      },
    ],
    explanation:
      "An unqualified negative signal is unattributable by construction. Forcing a small set of reason codes splits the rate into retrieval failures, missed intent, latency complaints and wrong refusals, each of which points at a different fix, and promoting confirmed cases into the eval set stops the same defect shipping twice.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["feedback-loops", "reason-codes"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q304",
    domain: 6,
    objective: "6.3",
    stem: "Finance approved an annual budget from the pilot's measured cost per case. Three months into production the cost per case is 2.5 times the pilot figure, although the model, the prompt and the retrieval configuration are unchanged. Which explanation should the architect investigate first?",
    choices: [
      {
        id: "A",
        text: "The provider's per-token price has changed since the pilot.",
        rationale:
          "Pricing is contractual and a change would be a known, announced event, so it is not a plausible first hypothesis for an unexplained cost shift.",
      },
      {
        id: "B",
        text: "Production inputs are longer and sessions run more turns than the curated pilot cases, so each case consumes far more tokens.",
      },
      {
        id: "C",
        text: "Prompt caching that was effective during the pilot is no longer being hit in production.",
        rationale:
          "Worth checking, and it would raise input cost, but a caching change alone does not explain growth in output tokens and turns per case.",
      },
      {
        id: "D",
        text: "Many more users are on the system than during the pilot, which raises the cost of each case.",
        rationale:
          "More users multiply the number of cases and therefore the total bill, but they do not change what a single case costs.",
      },
    ],
    explanation:
      "Cost per case is driven by tokens: input length, output length, retrieval depth, retries and turns. Pilot cases are curated and usually shorter and cleaner than live traffic, so the per-case figure from a pilot is the most common source of a budget surprise and the first place to look when spend diverges.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["cost", "expectation-alignment"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q305",
    domain: 6,
    objective: "6.3",
    stem: "Legal is drafting the service agreement for a generative drafting assistant sold to enterprise customers and asks the architect which commitments can be written into it. Which TWO belong in the SLA as written?",
    choices: [
      {
        id: "A",
        text: "Availability: 99.9% of requests return a non-error response, measured server-side and reported monthly.",
      },
      {
        id: "B",
        text: "Quality: every draft the assistant produces is factually correct.",
        rationale:
          "No generative system can promise per-output correctness, and a single counterexample would put the vendor in breach.",
      },
      {
        id: "C",
        text: "Quality: drafts score at least four out of five on customer satisfaction.",
        rationale:
          "A satisfaction score with no fixed population, rubric or window cannot be verified, so it will be disputed case by case.",
      },
      {
        id: "D",
        text: "Response: a reported defect is triaged within two business days and added to the regression suite.",
      },
      {
        id: "E",
        text: "Latency: average response time stays under three seconds.",
        rationale:
          "The mean is dominated by the fast majority and hides the slow tail that generates every complaint, so it can be met while users wait.",
      },
    ],
    explanation:
      "Availability is measurable and stable, and a process commitment on defect handling is enforceable where output quality is not. Per-output correctness and unanchored satisfaction scores cannot be verified, and a mean latency target conceals exactly the tail behavior an SLA exists to bound.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["sla", "commitments"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D6-q306",
    domain: 6,
    objective: "6.3",
    stem: "In a review, the platform lead says “our SLO is 99.9% availability and our SLA is 99.5%.” A new engineer asks why the two numbers differ. What is the correct explanation?",
    choices: [
      {
        id: "A",
        text: "They are the same commitment, stated differently for internal and external audiences.",
        rationale:
          "They are deliberately different numbers; treating them as the same removes the margin the difference exists to create.",
      },
      {
        id: "B",
        text: "The external commitment is set tighter than the internal target so customers get the stronger promise.",
        rationale:
          "This inverts the relationship and would mean every internal miss is simultaneously a contractual breach.",
      },
      {
        id: "C",
        text: "The internal objective is set tighter than the external commitment, so degradation is detected and fixed before it becomes a contractual breach.",
      },
      {
        id: "D",
        text: "The SLO applies to model behavior while the SLA applies to the surrounding infrastructure.",
        rationale:
          "The distinction is about who the commitment is made to and what consequence it carries, not about which layer it measures.",
      },
    ],
    explanation:
      "An SLI is the measured indicator, an SLO is the internal target, and an SLA is the external promise carrying a consequence. Setting the objective tighter than the agreement creates headroom: the team gets alerted and acts while there is still margin left before penalties apply.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["sli-slo-sla"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q307",
    domain: 6,
    objective: "6.3",
    stem: "Six months after launch an assistant's in-product feedback is sparse and its escalation transcripts only cover conversations that failed badly enough to be handed off. The steering group wants a feedback mechanism that reliably surfaces the quality problems neither channel sees. What should the architect add?",
    choices: [
      {
        id: "A",
        text: "A prompt asking every user to rate the answer before the conversation closes.",
        rationale:
          "Mandatory rating raises volume and biases it toward users willing to click, while still only describing conversations users chose to finish.",
      },
      {
        id: "B",
        text: "An automated judge scoring every production response, with an alert on the weekly average.",
        rationale:
          "Scoring everything is useful telemetry but produces a number rather than a forum, so no stakeholder is obliged to look at specific cases.",
      },
      {
        id: "C",
        text: "A quarterly survey of the business units the assistant serves.",
        rationale:
          "A quarterly cycle is far too slow to change a system, and survey responses describe impressions rather than identifiable conversations.",
      },
      {
        id: "D",
        text: "A standing sampled review at a fixed cadence, where a stratified sample of real conversations is read by the people who own the definition of correct.",
      },
    ],
    explanation:
      "In-product signal and escalations are both self-selecting, so the failures that never annoy anyone enough to report are invisible in both. A standing review on a fixed cadence samples the traffic nobody complained about and puts it in front of the owner of the ground truth, which is what makes it a loop that changes the system rather than a metric.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["feedback-loops", "sampled-review", "stakeholders"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q308",
    domain: 6,
    objective: "6.3",
    stem: "An internal agreement commits an assistant to 93% extraction accuracy, measured on a golden set fixed at launch. Eighteen months later the assistant still scores 94% on that set, while the business reports a clear decline in the quality of what it receives. Both statements are true. What is the flaw in the commitment?",
    choices: [
      {
        id: "A",
        text: "The threshold was set too low, so a system can satisfy it while performing poorly.",
        rationale:
          "A higher bar on the same fixed set would be cleared the same way, because the set no longer resembles what the business sends.",
      },
      {
        id: "B",
        text: "The commitment is anchored to a frozen population, so it stops describing production as the input distribution moves away from it.",
      },
      {
        id: "C",
        text: "Accuracy is the wrong measure for an extraction task and should be replaced by a per-field metric.",
        rationale:
          "Per-field reporting would localize the problem usefully and would still be computed against the same stale population.",
      },
      {
        id: "D",
        text: "The agreement lacks a stated consequence for missing the threshold.",
        rationale:
          "A consequence matters when the number is breached, and here the number is being met while the experience degrades.",
      },
    ],
    explanation:
      "A quality commitment is a claim about a population, so its denominator has to track what the system actually receives. Freezing the golden set makes the metric stable and eventually meaningless, which is why an accuracy commitment needs a refresh cadence for the set alongside the threshold itself.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["sla", "expectation-alignment", "drift"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
