import type { Domain } from "@/content/schema";

/**
 * The exam blueprint. Single source of truth for weights, objectives, routing
 * slugs and content quotas.
 *
 * Every `text` field is transcribed VERBATIM from docs/exam-guide.pdf §6
 * "Exam Content Outline (Blueprint)". Do not paraphrase them: the validator
 * string-compares each lesson's `objective` against these, which is what stops
 * a lesson drifting away from what the exam actually measures.
 *
 * `mockItemCount` is largest-remainder rounding of 63 x weight and sums to 63.
 * `drillTarget` sums to 46/36/54/44/38/38/20 = 276 across the drill pool.
 * Each objective carries 6-8 items: one per concept its lesson teaches, which
 * is what the lesson's Practice Scenario walks the reader through.
 */
export const DOMAINS: Domain[] = [
  {
    id: 1,
    code: "D1",
    slug: "1-solution-design",
    title: "Solution Design & Architecture",
    weight: 0.17,
    mockItemCount: 11,
    blurb:
      "Turn a business problem into a Claude-based architecture: pick the right pattern, decompose the work, and justify the design against business value.",
    objectives: [
      {
        id: "1.1",
        text: "Translate business problems into Claude-based AI solutions",
        title: "Translating Business Problems",
        slug: "1-1-business-problem-translation",
        drillTarget: 8,
      },
      {
        id: "1.2",
        text: "Design end-to-end architectures (input → processing → output → feedback loops)",
        title: "End-to-End Architecture",
        slug: "1-2-end-to-end-architecture",
        drillTarget: 8,
      },
      {
        id: "1.3",
        text: "Select appropriate architectural patterns (workflow, agentic, augmented LLM)",
        title: "Choosing an Architectural Pattern",
        slug: "1-3-architectural-patterns",
        drillTarget: 8,
      },
      {
        id: "1.4",
        text: "Design multi-agent systems and orchestration strategies",
        title: "Multi-Agent Systems and Orchestration",
        slug: "1-4-multi-agent-orchestration",
        drillTarget: 8,
      },
      {
        id: "1.5",
        text: "Apply decomposition techniques for complex problem solving",
        title: "Decomposition Techniques",
        slug: "1-5-task-decomposition",
        drillTarget: 7,
      },
      {
        id: "1.6",
        text: "Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs)",
        title: "Aligning to Business Value",
        slug: "1-6-business-value-alignment",
        drillTarget: 7,
      },
    ],
  },
  {
    id: 2,
    code: "D2",
    slug: "2-models-prompting-context",
    title: "Claude Models, Prompting & Context Engineering",
    weight: 0.13,
    mockItemCount: 8,
    blurb:
      "Pick the right model for the job, then engineer prompts and context that hold up in production — including caching and reuse.",
    objectives: [
      {
        id: "2.1",
        text: "Select appropriate Claude models based on trade-offs",
        title: "Model Selection and Trade-offs",
        slug: "2-1-model-selection",
        drillTarget: 8,
      },
      {
        id: "2.2",
        text: "Design system prompts, templates, and guardrails",
        title: "System Prompts, Templates and Guardrails",
        slug: "2-2-system-prompts-guardrails",
        drillTarget: 7,
      },
      {
        id: "2.3",
        text: "Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)",
        title: "Prompt Engineering Techniques",
        slug: "2-3-prompt-engineering-techniques",
        drillTarget: 7,
      },
      {
        id: "2.4",
        text: "Optimize context windows and manage token usage",
        title: "Context Windows and Token Usage",
        slug: "2-4-context-window-token-management",
        drillTarget: 7,
      },
      {
        id: "2.5",
        text: "Implement prompt reuse strategies (caching, modular prompts, Skills)",
        title: "Prompt Reuse: Caching, Modular Prompts and Skills",
        slug: "2-5-prompt-reuse-caching-skills",
        drillTarget: 7,
      },
    ],
  },
  {
    id: 3,
    code: "D3",
    slug: "3-integration",
    title: "Integration",
    weight: 0.19,
    mockItemCount: 12,
    blurb:
      "The heaviest domain. Connect Claude to real systems: tools, auth, retrieval, protocols and observability — without opening security or latency holes.",
    objectives: [
      {
        id: "3.1",
        text: "Evaluate tool/agent configuration for capability bloat",
        title: "Tool Configuration and Capability Bloat",
        slug: "3-1-tool-configuration-capability-bloat",
        drillTarget: 7,
      },
      {
        id: "3.2",
        text: "Analyze authentication and authorization requirements to identify security gaps",
        title: "Authentication and Authorization Gaps",
        slug: "3-2-authentication-authorization",
        drillTarget: 7,
      },
      {
        id: "3.3",
        text: "Evaluate accuracy-latency trade-offs and justify configuration decisions",
        title: "Accuracy vs. Latency Trade-offs",
        slug: "3-3-accuracy-latency-tradeoffs",
        drillTarget: 7,
      },
      {
        id: "3.4",
        text: "Analyze observability challenges and select monitoring strategies at scale",
        title: "Observability at Scale",
        slug: "3-4-observability-at-scale",
        drillTarget: 7,
      },
      {
        id: "3.5",
        text: "Design a RAG pipeline with appropriate chunking and indexing strategies",
        title: "Designing a RAG Pipeline",
        slug: "3-5-rag-pipeline-design",
        drillTarget: 7,
      },
      {
        id: "3.6",
        text: "Apply retrieval strategies matched to data shape and query pattern",
        title: "Matching Retrieval to Data Shape",
        slug: "3-6-retrieval-strategies",
        drillTarget: 7,
      },
      {
        id: "3.7",
        text: "Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent)",
        title: "Choosing an Integration Mechanism",
        slug: "3-7-connection-protocols",
        drillTarget: 6,
      },
      {
        id: "3.8",
        text: "Evaluate progressive discovery vs. monolithic context strategy",
        title: "Progressive Discovery vs. Monolithic Context",
        slug: "3-8-progressive-discovery",
        drillTarget: 6,
      },
    ],
  },
  {
    id: 4,
    code: "D4",
    slug: "4-evaluation-testing-optimization",
    title: "Evaluation, Testing & Optimization",
    weight: 0.16,
    mockItemCount: 10,
    blurb:
      "Prove the system works and keep it working: metrics, eval datasets, A/B tests, diagnosis of failures, and cost/latency tuning.",
    objectives: [
      {
        id: "4.1",
        text: "Define evaluation metrics (accuracy, latency, cost, safety, security)",
        title: "Defining Evaluation Metrics",
        slug: "4-1-evaluation-metrics",
        drillTarget: 8,
      },
      {
        id: "4.2",
        text: "Design evaluation datasets and test frameworks using mixed methodologies",
        title: "Eval Datasets and Test Frameworks",
        slug: "4-2-eval-datasets-frameworks",
        drillTarget: 8,
      },
      {
        id: "4.3",
        text: "Conduct A/B testing and iterative improvements",
        title: "A/B Testing and Iteration",
        slug: "4-3-ab-testing-iteration",
        drillTarget: 7,
      },
      {
        id: "4.4",
        text: "Diagnose system issues (prompt failure, hallucinations, model mismatch)",
        title: "Diagnosing System Issues",
        slug: "4-4-diagnosing-system-issues",
        drillTarget: 7,
      },
      {
        id: "4.5",
        text: "Optimize token usage, latency, and cost-performance trade-offs",
        title: "Optimizing Tokens, Latency and Cost",
        slug: "4-5-token-latency-cost-optimization",
        drillTarget: 7,
      },
      {
        id: "4.6",
        text: "Monitor system performance using logging and observability tools",
        title: "Logging and Performance Monitoring",
        slug: "4-6-logging-observability-monitoring",
        drillTarget: 7,
      },
    ],
  },
  {
    id: 5,
    code: "D5",
    slug: "5-governance-safety-risk",
    title: "Governance, Safety & Risk Management",
    weight: 0.14,
    mockItemCount: 9,
    blurb:
      "Guardrails, failure modes, human oversight, regulatory compliance and the ethical considerations an architect is expected to design for.",
    objectives: [
      {
        id: "5.1",
        text: "Implement guardrails and safety controls",
        title: "Guardrails and Safety Controls",
        slug: "5-1-guardrails-safety-controls",
        drillTarget: 8,
      },
      {
        id: "5.2",
        text: "Identify risks, limitations, and failure modes of LLM systems",
        title: "Risks, Limitations and Failure Modes",
        slug: "5-2-risks-limitations-failure-modes",
        drillTarget: 8,
      },
      {
        id: "5.3",
        text: "Apply human-in-the-loop validation strategies",
        title: "Human-in-the-Loop Validation",
        slug: "5-3-human-in-the-loop",
        drillTarget: 8,
      },
      {
        id: "5.4",
        text: "Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP)",
        title: "Regulatory Compliance",
        slug: "5-4-regulatory-compliance",
        drillTarget: 7,
      },
      {
        id: "5.5",
        text: "Address ethical AI considerations (bias, fairness, transparency)",
        title: "Ethical AI Considerations",
        slug: "5-5-ethical-ai",
        drillTarget: 7,
      },
    ],
  },
  {
    id: 6,
    code: "D6",
    slug: "6-stakeholder-lifecycle",
    title: "Stakeholder Communication & Lifecycle Management",
    weight: 0.14,
    mockItemCount: 9,
    blurb:
      "The non-code half of the architect role: discovery, communicating trade-offs, managing expectations and SLAs, documentation and handoff.",
    objectives: [
      {
        id: "6.1",
        text: "Conduct structured discovery and requirement gathering",
        title: "Structured Discovery",
        slug: "6-1-structured-discovery",
        drillTarget: 8,
      },
      {
        id: "6.2",
        text: "Communicate architectural decisions and trade-offs",
        title: "Communicating Decisions and Trade-offs",
        slug: "6-2-communicating-decisions",
        drillTarget: 8,
      },
      {
        id: "6.3",
        text: "Manage stakeholder feedback loops and expectation alignment (including SLAs)",
        title: "Feedback Loops and SLAs",
        slug: "6-3-feedback-loops-slas",
        drillTarget: 8,
      },
      {
        id: "6.4",
        text: "Document architectures and provide implementation guidance",
        title: "Documenting Architectures",
        slug: "6-4-documenting-architectures",
        drillTarget: 7,
      },
      {
        id: "6.5",
        text: "Support lifecycle phases (discovery, design, handoff, monitoring, iteration)",
        title: "Supporting the Lifecycle",
        slug: "6-5-lifecycle-phases",
        drillTarget: 7,
      },
    ],
  },
  {
    id: 7,
    code: "D7",
    slug: "7-developer-productivity",
    title: "Developer Productivity & Operational Enablement",
    weight: 0.07,
    mockItemCount: 4,
    blurb:
      "The lightest domain at 7%: configuring Claude tooling for teams, improving developer workflows, and supporting operational debugging.",
    objectives: [
      {
        id: "7.1",
        text: "Configure Claude tools and environments for teams (e.g., Claude Code)",
        title: "Configuring Claude Tools for Teams",
        slug: "7-1-team-tooling-claude-code",
        drillTarget: 7,
      },
      {
        id: "7.2",
        text: "Improve developer workflows using AI-assisted tooling",
        title: "AI-Assisted Developer Workflows",
        slug: "7-2-ai-assisted-workflows",
        drillTarget: 7,
      },
      {
        id: "7.3",
        text: "Support debugging and operational issue resolution",
        title: "Debugging and Operational Support",
        slug: "7-3-debugging-operational-issues",
        drillTarget: 6,
      },
    ],
  },
];
