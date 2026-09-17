import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q101",
    domain: 4,
    objective: "4.1",
    stem: "A team is launching an assistant that extracts six fields from a purchase order, classifies the order into a fulfillment path, and drafts a confirmation email. Their proposed launch criterion is a single figure: \"accuracy above 95%\". An architect is asked to turn that into usable metrics. What should the architect do first?",
    choices: [
      {
        id: "A",
        text: "Raise the target to 99% so the criterion is stricter across all three outputs.",
        rationale:
          "Tightening an undefined number does not make it measurable; the figure still cannot be attributed to extraction, classification or drafting.",
      },
      {
        id: "B",
        text: "Replace the criterion with an average user satisfaction score collected after launch.",
        rationale:
          "Satisfaction is a lagging aggregate that cannot say which of the three capabilities moved, and it only exists once users have already been affected.",
      },
      {
        id: "C",
        text: "Define a separate measure and threshold for each output type, weighted by business consequence.",
      },
      {
        id: "D",
        text: "Have the model rate the quality of its own output on a five-point scale and average the ratings.",
        rationale:
          "Self-ratings correlate poorly with correctness and supply no measurement method that anyone outside the system can independently verify.",
      },
    ],
    explanation:
      "A system with three distinct output types fails in three distinct ways, and one aggregate number moves for reasons that cannot be traced to any of them. Extraction supports field-level exact match, classification supports per-class recall, and a drafted email needs a rubric. Thresholds are then set where a business decision actually changes.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["metrics", "accuracy"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q102",
    domain: 4,
    objective: "4.1",
    stem: "A customer-facing assistant streams its answers. The team reports a mean response time of 1.9 seconds against a 3-second target, yet support tickets about slowness keep arriving and a few users report the interface appearing to hang. Which metric change would best expose what those users are experiencing?",
    choices: [
      {
        id: "A",
        text: "Report time to first token and total completion time, each at p95 and p99.",
      },
      {
        id: "B",
        text: "Lower the target from 3 seconds to 2 seconds and keep measuring the mean.",
        rationale:
          "Moving a threshold on a statistic that hides the tail changes the number on the dashboard, not the experience of the slowest requests.",
      },
      {
        id: "C",
        text: "Track the mean response time separately for each model version in use.",
        rationale:
          "Segmenting an average still averages away the tail inside each segment, so the slow requests remain invisible in every panel.",
      },
      {
        id: "D",
        text: "Measure throughput in requests per second during peak hours.",
        rationale:
          "Throughput describes system capacity rather than what any individual user waits for, and it can look healthy while tail latency is severe.",
      },
    ],
    explanation:
      "A mean is dominated by the fast majority and conceals the tail that generates complaints. In a streaming interface the perceived hang is time to first token, which is a different quantity from total completion time; reporting both at high percentiles is what makes the complaint and the measurement describe the same thing.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["metrics", "latency"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q103",
    domain: 4,
    objective: "4.1",
    stem: "A vendor presents its safety and security posture for an assistant: a harmful-output rate of 0.02% measured on sampled production traffic, and zero prompt-injection incidents recorded in six months of operation. An architect reviewing the submission identifies two structural weaknesses in how these numbers were produced. Which two? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "The harmful-output rate is reported without any measure of how often benign requests are refused.",
      },
      {
        id: "B",
        text: "The harmful-output rate should be computed daily rather than over the full six-month window.",
        rationale:
          "Changing the aggregation window addresses neither weakness, and a daily rate on a very rare event would be noisier without being more informative.",
      },
      {
        id: "C",
        text: "Harmful outputs should be graded by the same model that produced them, for consistency.",
        rationale:
          "Self-grading introduces leniency toward a model's own outputs, so this weakens the measurement method rather than repairing what is missing.",
      },
      {
        id: "D",
        text: "Injection resistance is inferred from recorded incidents rather than measured against a maintained adversarial suite.",
      },
      {
        id: "E",
        text: "The two numbers should be combined into a single trust score for easier reporting.",
        rationale:
          "Collapsing metrics that are meant to be traded off against one another into one figure removes exactly the tension that makes the pair useful.",
      },
    ],
    explanation:
      "Harmful-output rate is trivially minimized by a system that refuses aggressively, so it is only interpretable beside a false-refusal rate on benign requests. Security is adversarial and ordinary traffic contains almost no attacks, so an incident count measures attacker activity rather than system resistance and reads perfect until a campaign begins.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["metrics", "safety", "security"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D4-q104",
    domain: 4,
    objective: "4.1",
    stem: "After swapping a document classifier onto a cheaper model, a team reports that spend per million tokens fell by 40%. Two weeks later the operations group says its queue of manually corrected documents has roughly doubled. Which metric, tracked from the start, would have made this trade-off visible before the change shipped?",
    choices: [
      {
        id: "A",
        text: "Total monthly token volume across both models.",
        rationale:
          "Volume says nothing about whether the work those tokens produced was usable, and it can fall at the same time as rework rises.",
      },
      {
        id: "B",
        text: "Time to first token at p95 for the classifier endpoint.",
        rationale:
          "Latency is unrelated to the failure described here, which is classification quality driving downstream manual correction.",
      },
      {
        id: "C",
        text: "Number of API calls issued per document processed.",
        rationale:
          "Call count captures automated retries only, and misses the human correction effort that sits entirely outside the API.",
      },
      {
        id: "D",
        text: "Cost per correctly classified document, including the cost of downstream manual correction.",
      },
    ],
    explanation:
      "Unit token price is an accounting fact that ignores how much work a task actually takes to complete successfully. A model that is cheaper per token but wrong more often shifts spend into retries and human handoffs, so the cost metric that survives a model swap is cost per successfully completed task.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["metrics", "cost"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q105",
    domain: 4,
    objective: "4.1",
    stem: "A grounded question-answering service reports 97% groundedness: nearly every sentence in its answers traces to a passage it retrieved. A transcript review nevertheless finds that users often follow up by rephrasing their original question. What does this pattern indicate, and what is missing from the metric set?",
    choices: [
      {
        id: "A",
        text: "The groundedness judge is miscalibrated and scoring too generously; recalibrate it against human labels.",
        rationale:
          "A miscalibrated judge would surface as disagreement with human labels on the same cases, not as users rephrasing after a faithful answer.",
      },
      {
        id: "B",
        text: "Answers are faithful to the retrieved passages but are not addressing what was asked; answer relevance has to be measured as a separate number.",
      },
      {
        id: "C",
        text: "Retrieval latency is too high, so users resubmit before the answer finishes rendering.",
        rationale:
          "Resubmission caused by slowness appears as near-identical requests seconds apart, not as reformulated follow-up questions after a complete answer.",
      },
      {
        id: "D",
        text: "The safety filter is suppressing part of the content, which truncates the answers.",
        rationale:
          "Filtering would register in refusal counters and produce visibly declined or partial responses rather than fully grounded ones.",
      },
    ],
    explanation:
      "Groundedness and relevance are independent properties of a retrieval-grounded answer. A system can quote its context perfectly while answering a question nobody asked, so a single accuracy figure for a RAG answer is under-specified; both numbers are needed before the system can be said to be working.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["metrics", "accuracy", "rag"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q106",
    domain: 4,
    objective: "4.1",
    stem: "A triage assistant routes incoming requests into four categories. One of them, \"urgent safety concern\", accounts for about 2% of volume. The launch dashboard shows 96% overall classification accuracy and the project is declared ready to ship. What is the strongest objection an architect can raise?",
    choices: [
      {
        id: "A",
        text: "96% is too low for any production classifier; the target should be raised to 99% overall.",
        rationale:
          "A blanket target ignores where the errors land, and the same overall figure can be acceptable or catastrophic depending on which class absorbs them.",
      },
      {
        id: "B",
        text: "Classification accuracy should be replaced by an LLM judge scoring each routing decision.",
        rationale:
          "The correct category is objectively labeled here, so a deterministic comparison is cheaper, faster and more reliable than a judge.",
      },
      {
        id: "C",
        text: "Overall accuracy can sit at 96% while recall on the 2% urgent class is near zero, so that class needs its own measure and its own threshold.",
      },
      {
        id: "D",
        text: "The dashboard should report precision instead of accuracy for the system as a whole.",
        rationale:
          "Swapping one aggregate statistic for another still produces a single figure dominated by the three common classes.",
      },
    ],
    explanation:
      "With a 2% class, a model that never predicts it at all can still score 98% overall. Metrics must be defined per capability and weighted by business consequence, which here means per-class recall on the urgent category with a threshold set by what the business can tolerate, not by the aggregate.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["metrics", "accuracy", "thresholds"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
