import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q301",
    domain: 1,
    objective: "1.3",
    stem: "An insurer processes policy endorsement requests. Every request goes through the same five steps in the same order — validate, classify, extract, price, generate a letter — and each step's output is checked before the next begins. A vendor proposes replacing the pipeline with an autonomous agent that decides what to do per request. What is the strongest architectural argument against the proposal?",
    choices: [
      {
        id: "A",
        text: "Agents cannot invoke the same tools a code-driven workflow can.",
        rationale:
          "Agents use exactly the same tools; the difference lies in who decides when to call them, not in what is available.",
      },
      {
        id: "B",
        text: "The sequence is fully known in advance, so autonomy adds latency, cost variance and unpredictability without buying any flexibility.",
      },
      {
        id: "C",
        text: "Agentic systems cannot be evaluated, so the team would lose its existing quality metrics.",
        rationale:
          "Agentic systems can be evaluated, though end-to-end evaluation is harder; the decisive point is that dynamic control buys nothing when the path is fixed.",
      },
      {
        id: "D",
        text: "An agent would require a larger context window than the pipeline currently uses.",
        rationale:
          "Context size is a downstream implementation consequence, not the architectural reason a fixed sequence should remain a workflow.",
      },
    ],
    explanation:
      "The enumerability test settles this: if the steps can be written down before the request arrives, the design is a workflow. An agent would rediscover the same five steps on every request while making an auditable, regulated process nondeterministic, which is a cost with no corresponding benefit.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["patterns", "workflow", "agentic"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q302",
    domain: 1,
    objective: "1.3",
    stem: "A support platform handles three request types — refund status, technical troubleshooting, and account security — each needing a different prompt, a different toolset and a different escalation policy. Today a single prompt handles all three and quality is uneven across them. Which pattern fits the problem best?",
    choices: [
      {
        id: "A",
        text: "Parallelization: run all three specialized prompts on every request and select the best answer.",
        rationale:
          "Voting across three specialists triples cost on every request in order to settle a question a single cheap classification already answers.",
      },
      {
        id: "B",
        text: "Orchestrator–workers: have a lead model decompose each request into subtasks at run time.",
        rationale:
          "Run-time decomposition is for tasks whose subtasks cannot be enumerated in advance; here the three paths are fixed and already known.",
      },
      {
        id: "C",
        text: "An autonomous agent with every tool available and all three policies described in its instructions.",
        rationale:
          "Giving one agent all the tools and all the policies recreates the uneven-quality problem inside a loop that is harder to debug and audit.",
      },
      {
        id: "D",
        text: "Routing: classify the request first, then dispatch to the prompt and toolset specialized for that class.",
      },
    ],
    explanation:
      "Distinct input classes that require different handling is the defining signal for routing. A cheap classification step followed by dispatch lets each path be optimized and evaluated separately, which is exactly what a single shared prompt prevents.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["patterns", "routing"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q303",
    domain: 1,
    objective: "1.3",
    stem: "A marketing team generates localized ad copy. A written rubric covers tone, length and banned claims. Reviewers report that first drafts are acceptable about 70% of the time, and that a second pass explicitly checking the draft against the rubric almost always fixes the rest. Which pattern should the architect adopt?",
    choices: [
      {
        id: "A",
        text: "Evaluator–optimizer: generate, score the draft against the rubric in a second call, and revise until it passes or an iteration cap is reached.",
      },
      {
        id: "B",
        text: "Prompt chaining: split generation into headline, body and call-to-action steps.",
        rationale:
          "Chaining decomposes the drafting work but adds no step that checks a draft against the rubric, which is where reviewers say the improvement comes from.",
      },
      {
        id: "C",
        text: "Routing by locale to a prompt specialized for each target market.",
        rationale:
          "Per-locale prompts may improve tone, but the reported failures are rubric violations that recur across locales and would still go undetected.",
      },
      {
        id: "D",
        text: "An autonomous agent with a web-search tool that researches each market before writing.",
        rationale:
          "Research is not the gap; the rubric is already known and the defect is compliance with it, so added autonomy raises cost without touching the problem.",
      },
    ],
    explanation:
      "Evaluator–optimizer is selected by two conditions, and the stem states both: a clear evaluation criterion exists, and a second pass measurably improves the first attempt. That is precisely the case where a generate-score-revise loop with an iteration cap outperforms a single call.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["patterns", "evaluator-optimizer"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q304",
    domain: 1,
    objective: "1.3",
    stem: "A team's service answers one question per request with a single Claude call that has a retrieval tool and a calculator available, plus a memory store the prompt is assembled from. Control flow is fixed in code: nothing branches and nothing repeats. How should this architecture be classified?",
    choices: [
      {
        id: "A",
        text: "A workflow, because several components participate in producing the answer.",
        rationale:
          "A workflow orchestrates multiple model calls along a predefined path; here there is a single call, however many tools it may reach for.",
      },
      {
        id: "B",
        text: "An agent, because the model chooses which of the two tools to call.",
        rationale:
          "Tool availability within one call is not agency: the model is not directing its own sequence of steps or deciding when the task is complete.",
      },
      {
        id: "C",
        text: "An augmented LLM — a single model call extended with retrieval, tools and memory.",
      },
      {
        id: "D",
        text: "A multi-agent system, since retrieval and calculation are separate specialized components.",
        rationale:
          "Tools are not agents; a multi-agent system requires multiple model-driven actors, not multiple capabilities attached to one call.",
      },
    ],
    explanation:
      "The augmented LLM is the base building block: one call extended with retrieval, tools and memory. It is what the other patterns are composed from, and it remains the correct classification regardless of how many tools are attached, because the control flow is still fixed in code.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["patterns", "augmented-llm"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q305",
    domain: 1,
    objective: "1.3",
    stem: "An architect is deciding between a code-defined workflow and an agentic design for a new internal tool. Which TWO conditions most strongly favor the agentic design?",
    choices: [
      {
        id: "A",
        text: "The number of steps required cannot be known before the request arrives and depends on what intermediate results reveal.",
      },
      {
        id: "B",
        text: "The task requires more than one tool call to complete.",
        rationale:
          "Tool count says nothing about control flow; a fixed sequence of ten tool calls is still a workflow in every respect that matters.",
      },
      {
        id: "C",
        text: "The environment returns feedback the model can act on, and a wrong step is recoverable inside the loop.",
      },
      {
        id: "D",
        text: "The organization has asked for the most modern architecture available on the platform.",
        rationale:
          "Novelty is not a design criterion, and the accepted guidance is to use the simplest pattern that satisfies the requirement.",
      },
      {
        id: "E",
        text: "Per-request latency and cost are the binding constraints on the design.",
        rationale:
          "Agentic loops raise both; these constraints argue for a workflow or a single augmented call rather than for autonomy.",
      },
    ],
    explanation:
      "Autonomy pays for itself only when the path genuinely varies and when the loop can correct itself. Unknowable step counts supply the first condition and actionable environmental feedback with recoverable errors supplies the second. Tool count, novelty and tight cost constraints all point the other way.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["patterns", "agentic", "selection"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D1-q306",
    domain: 1,
    objective: "1.3",
    stem: "An agentic research assistant performs well in demonstrations but unpredictably in production: per-request cost varies by a factor of twenty and some sessions run for minutes. Leadership wants predictable spend without losing quality on the hard questions. What is the most appropriate architectural response?",
    choices: [
      {
        id: "A",
        text: "Cap the maximum output tokens per call so that cost is bounded.",
        rationale:
          "A per-call cap bounds one call, not the number of calls; an agent that loops thirty times still costs roughly thirty times as much.",
      },
      {
        id: "B",
        text: "Identify the request classes whose steps are actually predictable, route those to fixed workflows, and leave the agent for the genuinely open-ended remainder.",
      },
      {
        id: "C",
        text: "Replace the agent with a single augmented LLM call and accept the resulting quality loss.",
        rationale:
          "This discards the cases that genuinely need multi-step exploration, when only part of the traffic is actually open-ended.",
      },
      {
        id: "D",
        text: "Keep the agent as it is and move every call to a cheaper model tier.",
        rationale:
          "A cheaper tier lowers unit price but leaves the variance untouched and often lengthens loops, which can raise total cost rather than lowering it.",
      },
    ],
    explanation:
      "Cost variance in an agentic system comes from a variable number of steps, so the fix is to stop paying for autonomy on traffic that does not need it. Classifying requests and routing the enumerable ones into workflows preserves agentic capability where the path really varies while making most spend predictable.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["patterns", "agentic", "cost"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q307",
    domain: 1,
    objective: "1.3",
    stem: "A compliance check evaluates one policy document against thirty independent criteria. In a single prompt the model applies the early criteria carefully and grows noticeably less thorough toward the end of the list, and reviewers find the misses concentrated in the final third. Which workflow pattern best addresses this?",
    choices: [
      {
        id: "A",
        text: "Prompt chaining, so each criterion is evaluated in a step that receives the previous step's output.",
        rationale:
          "Chaining imposes an order on checks that do not depend on one another, and it carries every earlier verdict forward for no benefit.",
      },
      {
        id: "B",
        text: "Parallelization, evaluating independent groups of criteria in separate calls and aggregating the verdicts.",
      },
      {
        id: "C",
        text: "Routing, classifying the document first and sending it to a prompt specialized for its type.",
        rationale:
          "Routing helps when different inputs need different handling, but this one document must face all thirty criteria whatever its type.",
      },
      {
        id: "D",
        text: "An evaluator-optimizer loop that critiques and revises the verdict against a rubric.",
        rationale:
          "That loop improves a draft that exists; it does nothing about criteria the first pass never attended to, which is what the misses are.",
      },
    ],
    explanation:
      "Parallelization fits work that splits into independent pieces needing nothing from each other. Giving each group of criteria its own call restores the model's full attention to every criterion and makes aggregation an explicit step, while the patterns that impose sequence or specialization answer problems this task does not have.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["patterns", "parallelization"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q308",
    domain: 1,
    objective: "1.3",
    stem: "An analyst tool must answer questions about a regulation by following references: a clause cites another clause, which may cite a third, and how deep any chain runs is not known until it is followed. The team is split between a fixed workflow and an agentic design. Which consideration settles it?",
    choices: [
      {
        id: "A",
        text: "Whether the regulation is available in machine-readable form, since retrieval quality dominates the result.",
        rationale:
          "Grounding governs how accurate the answer is, but it is equally necessary under either design and so cannot choose between them.",
      },
      {
        id: "B",
        text: "Whether the team can absorb the higher and more variable per-request cost an agentic design carries.",
        rationale:
          "Cost decides whether the chosen design is viable to run; it does not establish which design the shape of the task actually calls for.",
      },
      {
        id: "C",
        text: "Whether the steps can be enumerated before the request arrives, given that the number of lookups depends on what each lookup returns.",
      },
      {
        id: "D",
        text: "Whether one call with a retrieval tool already answers most questions acceptably.",
        rationale:
          "Covering the common case with a single grounded call is worth measuring, but it sets a baseline rather than resolving the question for the rest.",
      },
    ],
    explanation:
      "Agency is warranted precisely when control flow cannot be written down in advance, which is the case as soon as each step's result decides whether another step is needed. The enumerability test separates a workflow from an agent; cost and grounding are real constraints that apply to whichever design the test selects.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["patterns", "agentic", "enumerability"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
