import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.3",
  slug: "1-3-architectural-patterns",
  domain: 1,
  objective:
    "Select appropriate architectural patterns (workflow, agentic, augmented LLM)",
  title: "Choosing an Architectural Pattern",
  summary:
    "Three levels are being distinguished — the augmented LLM, workflows whose control flow lives in code, and agents that direct their own process. The exam rewards picking the simplest level that meets the requirement and penalizes autonomy the problem never asked for.",

  body: [
    {
      kind: "prose",
      md: "The whole taxonomy turns on one question: who decides what happens next.\n\n**The augmented LLM** is a single model call extended with retrieval, tools and memory. It is the building block every other pattern is made from, and it is a complete architecture on its own for a large share of real requirements.\n\n**A workflow** orchestrates multiple model calls along a path defined in code. The steps are known before the request arrives; the model fills them in.\n\n**An agent** decides its own steps. It chooses a tool, evaluates the result, and continues until it judges the task complete or a stopping condition fires.\n\nThe published guidance is unambiguous and the exam follows it: use the simplest pattern that meets the requirement, and add complexity only where it demonstrably buys something. Agentic designs trade latency, cost and predictability for flexibility, which is a good trade only when the flexibility is needed.",
    },

    { kind: "heading", text: "The workflow patterns worth naming" },
    {
      kind: "table",
      caption: "Workflow patterns and the signal that selects each",
      headers: ["Pattern", "Shape", "Select it when"],
      rows: [
        [
          "Prompt chaining",
          "A fixed sequence, each step consuming the last",
          "The steps are known in advance and each intermediate result is verifiable",
        ],
        [
          "Routing",
          "Classify first, then dispatch to a specialized path",
          "Inputs fall into distinct classes needing different prompts, tools or policies",
        ],
        [
          "Parallelization",
          "Independent subtasks at once — sectioning, or voting on one task",
          "Work splits into independent pieces, or several attempts raise confidence",
        ],
        [
          "Orchestrator–workers",
          "A lead call decomposes at run time and delegates",
          "The subtasks depend on the input and cannot be enumerated beforehand",
        ],
        [
          "Evaluator–optimizer",
          "Generate, score against a rubric, revise",
          "A clear evaluation exists and a second pass reliably improves the draft",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Orchestrator–workers is the pattern most often mislabeled. It is a workflow, because the overall structure is fixed by the designer, but its subtasks are produced at run time instead of written down in advance. That is what distinguishes it from parallelization, and what puts it closest to the agentic boundary without crossing it.",
    },

    { kind: "heading", text: "Choosing between the three levels" },
    {
      kind: "list",
      ordered: true,
      items: [
        "Can you write the steps down before the request arrives? If yes, it is a workflow. Enumerability is the test, not complexity.",
        "Does the number of steps depend on what intermediate results reveal? That is the case agents exist for.",
        "Does the environment give the model feedback it can act on, and is a wrong step recoverable inside the loop? Without both, autonomy compounds errors instead of correcting them.",
        "Is a single grounded call enough? Then the augmented LLM is the answer and anything more is pure cost.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Tool use does not make a system agentic. Agency is a property of control flow: a model that picks tools inside a step whose position in the sequence was fixed by code is still running a workflow. Ask who decides what happens next, every time.",
    },

    {
      kind: "example",
      title: "Practical example: choosing a pattern for policy endorsements",
      scenario:
        "An insurer processes policy endorsement requests. Every request is validated, classified into one of four endorsement types, has its fields extracted, is priced, and produces a customer letter. The sequence never varies. A vendor proposes replacing the pipeline with an autonomous agent.",
      walkthrough:
        "1. **Enumerate.** The five steps are already written down, in order, in the existing runbook. That settles the first question: this is a workflow.\n2. **Look for a class split.** The four endorsement types need different extraction fields and pricing rules, so a routing step after classification earns its place.\n3. **Check for open-endedness.** Nothing about a request changes which steps run, only which branch runs. No agentic requirement appears.\n4. **Price the alternative.** An agent would rediscover the same five steps on every request, at higher latency and variable cost, and would make the pipeline harder to audit — a real problem in a regulated process.\n5. **Decide.** Prompt chaining with a routing step, each step schema-validated.",
      takeaway:
        "The agent was not rejected because agents are bad. It was rejected because the flexibility it sells was not a requirement here, while its costs were certain.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Items in this objective offer the agentic option as the sophisticated answer, usually dressed in words like *autonomous* or *self-directed*. When the stem states or implies that the steps are known in advance, that option is the distractor. Reach for an agent only when the stem shows the path genuinely varies per request.",
    },

    { kind: "practice", questionId: "D1-q301" },
  ],

  keyTerms: [
    {
      term: "Augmented LLM",
      definition:
        "A single model call extended with retrieval, tools and memory. The building block of every other pattern, and a complete architecture for many requirements.",
    },
    {
      term: "Workflow",
      definition:
        "Multiple model calls orchestrated along a path defined in code, where the steps are known before the request arrives.",
    },
    {
      term: "Agent",
      definition:
        "A system in which the model directs its own process — choosing tools, evaluating results and continuing — until it judges the task done or a stopping condition fires.",
    },
    {
      term: "Enumerability test",
      definition:
        "The question that separates workflow from agent: can the steps be written down before the request arrives, or does the path depend on what is discovered along the way.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "An agentic architecture is the more advanced choice and therefore the safer recommendation.",
      why: "Autonomy is a trade rather than an upgrade: it buys flexibility with added latency, variable cost and reduced predictability, none of which a task with a fixed sequence has any use for.",
      instead:
        "Pick the simplest pattern that meets the requirement and escalate only when the path genuinely varies per request.",
    },
    {
      id: "t2",
      trap: "Any system that calls tools is an agent.",
      why: "Tool availability is orthogonal to control flow, and both a single augmented call and a code-driven workflow use tools while a model never chooses the sequence of steps.",
      instead:
        "Classify by who decides the next step — the code path, or the model.",
    },
    {
      id: "t3",
      trap: "Orchestrator–workers is a multi-agent system rather than a workflow pattern.",
      why: "The orchestration structure is fixed by the designer even though the subtasks are generated per request, and that fixed structure is exactly what keeps the pattern on the workflow side of the line.",
      instead:
        "Treat run-time subtask generation as what distinguishes it from parallelization, not as evidence of agency.",
    },
    {
      id: "t4",
      trap: "A routing step should use the same model as the branches it routes to.",
      why: "Classifying an input into a handful of known classes is a far easier task than the downstream work, so running the router on the heaviest tier adds latency and cost to every single request for no measurable accuracy gain.",
      instead:
        "Size the router to the classification task and reserve capability for the specialized paths.",
    },
  ],

  practiceQuestionIds: ["D1-q301", "D1-q304"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["1.4", "1.5"],
} satisfies Lesson;
