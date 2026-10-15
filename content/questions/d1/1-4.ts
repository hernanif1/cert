import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D1-q401",
    domain: 1,
    objective: "1.4",
    stem: "A team splits a contract-review pipeline into five subagents, one per clause type, and reports that the multi-agent version is slower, more expensive and less accurate than the single-agent version it replaced. Each subagent needs the full contract plus the other subagents' findings in order to do its job. What best explains the regression?",
    choices: [
      {
        id: "A",
        text: "The subtasks are tightly coupled through shared state, so isolation costs duplicated context without buying independence.",
      },
      {
        id: "B",
        text: "Five subagents is too many; the same decomposition with three would perform better.",
        rationale:
          "Fan-out is not the problem — a coupled decomposition performs badly at any width, and trimming it only reduces the symptom.",
      },
      {
        id: "C",
        text: "The orchestrator model is not capable enough to coordinate five subagents reliably.",
        rationale:
          "Coordination capacity is not the binding constraint when every subagent must read the same full document and each other's output anyway.",
      },
      {
        id: "D",
        text: "The subagents should have been run sequentially rather than in parallel.",
        rationale:
          "Serializing coupled subagents removes the parallel speedup while retaining every token of duplicated context, which makes latency worse.",
      },
    ],
    explanation:
      "Multi-agent decomposition pays off on independent subtasks, where isolation lets each agent read a lot and return a little. When every subagent needs the same full document and each other's findings, the design re-sends the same context five times and adds coordination overhead, so cost, latency and consistency all degrade at once.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["multi-agent", "coupling"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q402",
    domain: 1,
    objective: "1.4",
    stem: "A research assistant must survey forty vendor websites and produce one comparison table. The sites are organized differently, so covering one means following whatever links it offers until the eight required fields can be filled — which pages are read, and how many, cannot be written down in advance. Each site can be examined independently, and the useful findings from a site compress to a short structured summary. Which orchestration strategy fits the work?",
    choices: [
      {
        id: "A",
        text: "A single agent that visits all forty sites within one long-running conversation.",
        rationale:
          "One context accumulating forty page fetches degrades as it fills, and it serializes work that is embarrassingly parallel.",
      },
      {
        id: "B",
        text: "A chain of forty prompt-chaining steps, each passing its output into the next.",
        rationale:
          "Chaining imposes a false sequence on independent work and drags irrelevant prior output into every later step.",
      },
      {
        id: "C",
        text: "An orchestrator that spawns parallel subagents, one per site, each running its own browse loop until it can fill the schema and returning a compressed summary the orchestrator synthesizes.",
      },
      {
        id: "D",
        text: "Forty independent agents that each write their findings directly into one shared comparison document as they go.",
        rationale:
          "Concurrent writers to shared mutable state produce conflicting edits and ordering problems with no coordinator to resolve them.",
      },
    ],
    explanation:
      "Independent subtasks whose results compress are the canonical case for orchestrator and subagents, and what makes this genuinely multi-agent rather than a fan-out workflow is that each subagent steers its own browse loop and decides when the schema is filled. Parallelism cuts wall-clock time toward the slowest site, and context isolation means the orchestrator receives forty short records instead of forty browsing transcripts, which is what keeps the synthesis step feasible.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["multi-agent", "orchestration"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q403",
    domain: 1,
    objective: "1.4",
    stem: "An architect is designing an orchestrator-and-subagent system for production incident investigation. Which THREE design decisions most directly reduce the common multi-agent failure modes?",
    choices: [
      {
        id: "A",
        text: "Give each subagent an explicit objective, a defined output format and a stopping condition.",
      },
      {
        id: "B",
        text: "Scope each subagent's tools and credentials to what its stated objective requires.",
      },
      {
        id: "C",
        text: "Let subagents call one another directly so they can resolve conflicting findings without the orchestrator.",
        rationale:
          "Peer-to-peer calls turn a tree into an unbounded interaction graph and make cost, latency and failure attribution impossible to reason about.",
      },
      {
        id: "D",
        text: "Have subagents return compressed findings rather than raw tool output to the orchestrator.",
      },
      {
        id: "E",
        text: "Share one context window across the orchestrator and every subagent so that nothing is lost between them.",
        rationale:
          "A shared window removes the isolation that makes the pattern worthwhile and reintroduces the context pressure it was adopted to relieve.",
      },
      {
        id: "F",
        text: "Let the orchestrator re-run any subagent whose findings look thin, until the investigation converges.",
        rationale:
          "An open-ended re-run policy is exactly the unbounded work a stopping condition exists to prevent, and it inflates cost and latency with no defined notion of convergence.",
      },
    ],
    explanation:
      "The recurring multi-agent failures are unbounded work, over-broad authority and context blow-up in the orchestrator. Explicit objectives with stopping conditions bound the work, least-privilege tool scoping bounds the damage a bad step can do, and compressed returns preserve the context isolation that justifies the pattern in the first place.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["multi-agent", "orchestration", "tool-scope"],
    type: "multi",
    selectCount: 3,
    correct: ["A", "B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D1-q404",
    domain: 1,
    objective: "1.4",
    stem: "A finance team builds a multi-agent system in which one agent drafts a monthly report, a second edits it, and a third fact-checks it, all three reading and rewriting the same shared draft. In testing, the final report intermittently loses corrections the editor had made. What is the underlying issue?",
    choices: [
      {
        id: "A",
        text: "The fact-checking agent should run before the editor so it cannot overwrite the editor's work.",
        rationale:
          "Reordering hides one instance of the conflict; blind rewrites of shared state will still drop changes at a different seam.",
      },
      {
        id: "B",
        text: "Multiple agents mutating one artifact without a coordinator or an explicit handoff contract produces lost updates.",
      },
      {
        id: "C",
        text: "The editor agent needs a more capable model so its corrections are made more durably.",
        rationale:
          "Model capability cannot make an edit survive another agent's rewrite; durability is a property of the coordination protocol, not of the writer.",
      },
      {
        id: "D",
        text: "Each agent should receive the full reasoning history of the other two.",
        rationale:
          "Broadcasting reasoning inflates every context and still leaves two writers free to overwrite the same artifact.",
      },
    ],
    explanation:
      "A shared workspace is a legitimate orchestration strategy but requires an explicit write protocol. Without one, an agent that regenerates the document from its own view of the content silently discards another agent's edits. The fix is a defined handoff artifact or a coordinator that serializes writes, not a better writer.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["multi-agent", "shared-state"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q405",
    domain: 1,
    objective: "1.4",
    stem: "A product owner asks why the multi-agent version of a research feature costs so much more per request than the single-call version, given that both use the same model. Which explanation is most accurate?",
    choices: [
      {
        id: "A",
        text: "Prompt caching cannot help here, because each subagent starts a fresh conversation rather than reusing the single-call version's cached prefix.",
        rationale:
          "Caching changes the price of a repeated prefix, but the multiplier remains even when every subagent's prefix is cached, because each one still accumulates and re-reads its own growing context.",
      },
      {
        id: "B",
        text: "Orchestration reasoning is inherently more expensive to generate than ordinary output.",
        rationale:
          "Orchestrator output is priced like any other output and is a small share of the total next to the context every agent re-reads.",
      },
      {
        id: "C",
        text: "Subagents duplicate each other's work where their assigned pieces overlap, so the same research is paid for more than once.",
        rationale:
          "Overlapping assignments do waste tokens, but the multiplier shows up even when the decomposition is perfectly disjoint, because it comes from per-agent context rather than repeated research.",
      },
      {
        id: "D",
        text: "Each subagent re-reads its own instructions, tool definitions and context every turn, so total consumption scales with agents and turns.",
      },
    ],
    explanation:
      "The multi-agent token multiplier is structural. Every agent pays for its own system prompt, tool definitions and accumulated context on each turn, and the orchestrator pays again to synthesize what comes back, which routinely puts total consumption an order of magnitude above a single call answering the same question.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["multi-agent", "cost"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q406",
    domain: 1,
    objective: "1.4",
    stem: "A team describes its design to a stakeholder: a fixed script calls Claude three times — extract, then classify, then summarize — passing each result into the next call, with no model deciding what happens next. The stakeholder calls it a multi-agent system. How should the architect characterize it?",
    choices: [
      {
        id: "A",
        text: "A multi-agent system, since three distinct model roles participate in the result.",
        rationale:
          "Roles described in prompts are not agents; nothing in the design lets a model direct its own process or choose the next step.",
      },
      {
        id: "B",
        text: "An agentic system, because models and tools are combined across several steps.",
        rationale:
          "Combining components does not create agency, which requires a model controlling the loop and its own tool use.",
      },
      {
        id: "C",
        text: "A prompt-chaining workflow, because the control flow is fixed in code rather than decided by a model.",
      },
      {
        id: "D",
        text: "An augmented LLM, since the three calls serve one logical task.",
        rationale:
          "An augmented LLM is a single call extended with retrieval, tools or memory; this is three orchestrated calls along a predefined path.",
      },
    ],
    explanation:
      "A multi-agent system requires more than one model-driven actor making its own decisions about what to do next. Three scripted calls in a fixed order are prompt chaining, and naming it correctly matters because it sets expectations for cost, determinism and how the system is evaluated.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["multi-agent", "patterns"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q407",
    domain: 1,
    objective: "1.4",
    stem: "A platform team builds an assistant that drafts infrastructure configuration changes. Any change reaching the cluster must first be examined by something that did not write it, and whatever examines it must have no ability to apply anything itself. Which orchestration strategy fits?",
    choices: [
      {
        id: "A",
        text: "A shared workspace in which a drafting subagent and a reviewing subagent both read and write the change set.",
        rationale:
          "A shared workspace lets the reviewer edit the very artifact it is meant to judge, which removes the independence the requirement asks for.",
      },
      {
        id: "B",
        text: "Sequential handoff, each subagent completing its stage and passing the result to the next.",
        rationale:
          "Handoff describes the order accurately enough, but it says nothing about withholding apply authority, which is the part of the requirement that bites.",
      },
      {
        id: "C",
        text: "An orchestrator that decomposes the change into parts and assigns each part to a subagent.",
        rationale:
          "Decomposition parallelizes the drafting and leaves the result unexamined, so no part of that arrangement supplies an independent check.",
      },
      {
        id: "D",
        text: "Generator and critic, where one subagent proposes the change and a separate critic evaluates it with no authority to apply.",
      },
    ],
    explanation:
      "Generator and critic exists for this shape: the value comes from the critic being a different context, under a different instruction, holding narrower permissions than the generator. Separating who proposes from who may approve is an authorization decision, so it belongs in the orchestration strategy rather than in a prompt.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["multi-agent", "orchestration", "generator-critic"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q408",
    domain: 1,
    objective: "1.4",
    stem: "An incident-investigation subagent is given a log-search tool and told to find the cause of an outage. On most incidents it returns within about a minute. On three occasions it ran for over forty minutes, consumed the entire context window and returned nothing usable, and on review the searches it issued each time were reasonable. What is the root cause?",
    choices: [
      {
        id: "A",
        text: "The subagent has no stopping condition, so nothing tells it when the investigation is complete or futile.",
      },
      {
        id: "B",
        text: "The log-search tool returns too much data per call, exhausting context faster than the subagent can summarize it.",
        rationale:
          "A tool that noisy would shorten every run rather than three of them, and the same searches complete normally on most incidents.",
      },
      {
        id: "C",
        text: "The task is too broad and should be divided among several specialized subagents.",
        rationale:
          "More subagents divide the same unbounded search across more contexts, and every one of them inherits the missing termination rule.",
      },
      {
        id: "D",
        text: "The orchestrator should pass the subagent more context about the incident up front.",
        rationale:
          "Richer starting context may shorten the common case, but a run with no defined end still does not end on the incidents where the answer is absent.",
      },
    ],
    explanation:
      "Every subagent needs a clear task, the context that task requires, and a condition that ends it. The third is the one most often left implicit, and its absence presents exactly this way: acceptable behavior wherever the work happens to terminate on its own, and unbounded cost wherever it does not.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["multi-agent", "stopping-condition"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
