import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q601",
    domain: 1,
    objective: "1.6",
    stem: "A chief operating officer sponsors an initiative to let the firm issue same-day custom quotes, a service it has never been able to offer. Finance asks the architect to justify the design on headcount reduction, since that is how every prior technology case was approved. What is the most appropriate response?",
    choices: [
      {
        id: "A",
        text: "Recalculate the business case as cost savings, since that is the metric finance already uses.",
        rationale:
          "Restating a capability case as savings understates something the firm could not do at all and sets the project up to be judged on the wrong number.",
      },
      {
        id: "B",
        text: "Accept the cost framing and reduce scope until the projected savings justify the spend.",
        rationale:
          "Cutting scope to fit a savings target sacrifices the new capability that was the entire point of the initiative.",
      },
      {
        id: "C",
        text: "Defer the initiative until a cost-reduction case can be built alongside the capability case.",
        rationale:
          "Delaying a capability play until it also pays for itself as automation forfeits the timing advantage that makes transformation valuable.",
      },
      {
        id: "D",
        text: "Measure the initiative against the revenue and win rate the new capability unlocks, and treat the unit cost of a quote as a constraint rather than the objective.",
      },
    ],
    explanation:
      "This is a transformation case: the comparison is against not offering the service at all, not against a cheaper way of doing something the firm already does. Naming the pillar sets the metric, and the per-quote cost then becomes a bound the design must respect rather than the number success is judged on.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["business-value", "transformation"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q602",
    domain: 1,
    objective: "1.6",
    stem: "A customer-facing assistant carries a contractual commitment that 95% of responses must begin within 1.2 seconds. The current design retrieves eight documents, calls a large model once, then runs a second model pass that checks the answer before anything is shown. Measured 95th-percentile time to first token is 2.6 seconds. Which change best preserves the commitment?",
    choices: [
      {
        id: "A",
        text: "Stream from a smaller model tier with a reduced retrieval budget, and move the verification pass onto an asynchronous audit path.",
      },
      {
        id: "B",
        text: "Keep the design and renegotiate the commitment to a 95th percentile of three seconds.",
        rationale:
          "Renegotiating a contractual term is a commercial move rather than an architectural response, and it may simply not be available.",
      },
      {
        id: "C",
        text: "Cache final responses so that repeat questions are served instantly.",
        rationale:
          "Response caching helps only on repeats, while the 95th percentile is set by the cold path, which is exactly the traffic that misses the target.",
      },
      {
        id: "D",
        text: "Report the daily average response time, which is already comfortably inside the bound.",
        rationale:
          "A percentile commitment is not satisfied by a mean; averaging hides precisely the tail the agreement was written to control.",
      },
    ],
    explanation:
      "A percentile commitment on time to first token is met by designing the slow path. A smaller tier and a bounded retrieval budget shorten it, streaming makes first token the measured event, and moving synchronous verification off the request path removes a blocking call without discarding the check entirely.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["business-value", "sla", "latency"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q603",
    domain: 1,
    objective: "1.6",
    stem: "A team migrates a summarization feature to the smallest suitable model tier and reports a 70% reduction in model spend. Three months later, the finance partner shows that the feature's total cost has risen above its pre-migration level. What most likely happened?",
    choices: [
      {
        id: "A",
        text: "Token prices rose after the migration was completed.",
        rationale:
          "Published prices do not move that way, and a price change would not be a consequence of the team's own migration decision.",
      },
      {
        id: "B",
        text: "Downstream human review and rework grew, and that labor is part of the feature's total cost of ownership.",
      },
      {
        id: "C",
        text: "The smaller tier consumed more input tokens to process the same documents.",
        rationale:
          "The same document tokenizes to roughly the same count regardless of tier, so input volume does not explain a rise in total cost.",
      },
      {
        id: "D",
        text: "Prompt caching stopped working when the model changed.",
        rationale:
          "A cache miss at migration raises cost briefly and then repopulates; it does not produce a sustained increase across three months.",
      },
    ],
    explanation:
      "Total cost of ownership includes the human effort a design creates, not only its model spend. A cheaper tier that produces more summaries needing correction shifts cost from the model bill onto reviewers, which is why cost decisions are evaluated against the full total rather than against the line item that is easiest to measure.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["business-value", "cost", "tco"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q604",
    domain: 1,
    objective: "1.6",
    stem: "A steering committee asks an architect to name the value pillar each of two proposals serves. Proposal one gives 300 analysts a drafting assistant, with the analyst still making and signing every final judgment. Proposal two removes a manual re-keying step from an invoice pipeline entirely. Which TWO statements are correct? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Proposal one serves productivity: it is measured in hours returned per analyst, with the person retained as the decision-maker.",
      },
      {
        id: "B",
        text: "Proposal two serves efficiency: it is measured in cost and cycle time per invoice, with a step removed from the process.",
      },
      {
        id: "C",
        text: "Proposal one serves transformation, because analysts can now produce work they could not produce before.",
        rationale:
          "Transformation means the organization can offer something it could not offer at all; drafting existing work faster is a productivity gain.",
      },
      {
        id: "D",
        text: "Proposal two serves performance SLAs, because removing a step reduces end-to-end latency.",
        rationale:
          "Latency may improve incidentally, but no service-level commitment is stated, and the pillar follows the commitment being made rather than a side effect.",
      },
      {
        id: "E",
        text: "Both proposals serve cost, since both ultimately reduce spend.",
        rationale:
          "Almost every initiative touches cost, which is exactly why labeling everything a cost play destroys the ability to prioritize between proposals.",
      },
    ],
    explanation:
      "The pillars are separated by whether work left the process or a person got time back. An assistant that drafts while the analyst still decides returns hours per head, which is productivity; a re-keying step deleted from a pipeline lowers cost and cycle time per unit processed, which is efficiency.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["business-value", "pillars"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D1-q605",
    domain: 1,
    objective: "1.6",
    stem: "An architect must choose between two designs that both satisfy the same functional requirement. Design A costs $0.90 per document and returns an answer in about 40 seconds. Design B costs $3.10 per document and returns an answer in about 4 seconds. Which additional fact most directly decides the choice?",
    choices: [
      {
        id: "A",
        text: "Which design uses the more capable model.",
        rationale:
          "Model capability is an input to a design, not a selection criterion, once both designs already meet the functional requirement.",
      },
      {
        id: "B",
        text: "Which design the engineering team can deliver sooner.",
        rationale:
          "Delivery time affects scheduling but says nothing about which design serves the value the business is actually buying.",
      },
      {
        id: "C",
        text: "Whether the consumer is a person waiting for the answer or an overnight batch job.",
      },
      {
        id: "D",
        text: "Which design produces fewer tokens per document.",
        rationale:
          "Token volume is already reflected in the stated per-document cost, so it contributes nothing new to the decision.",
      },
    ],
    explanation:
      "Neither design is better in the abstract; the governing pillar decides. A batch consumer makes this an efficiency question, where the cheaper and slower design wins outright, while a person waiting makes it a service-level question, where the latency is the requirement and the extra cost is what it costs to meet it.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["business-value", "pillars", "trade-offs"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
