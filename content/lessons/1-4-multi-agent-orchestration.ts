import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.4",
  slug: "1-4-multi-agent-orchestration",
  domain: 1,
  objective: "Design multi-agent systems and orchestration strategies",
  title: "Multi-Agent Systems and Orchestration",
  summary:
    "Multi-agent systems buy parallelism and context isolation, and pay for them in tokens, latency and coordination failure. The exam tests whether you can name the conditions that justify the trade and the ones that make it a mistake.",

  body: [
    {
      kind: "prose",
      md: "A multi-agent system has more than one actor running its own loop, and that is a narrower claim than the diagrams suggest. An orchestrator that decomposes a task at run time, fans the pieces out and synthesizes what comes back is the **orchestrator–workers** workflow from Objective 1.3: the designer fixed that structure, and only the subtasks are generated per request. The design becomes multi-agent at a different point — when each **subagent** runs its own tool loop and chooses its own stopping point, so how many steps it takes is not knowable in advance and no code path decides it.\n\nSo the fan-out shape never settles the question. Ask what the delegated piece actually is: one generated subtask, executed and returned, or an open-ended investigation the subagent has to steer itself.\n\nWhere it is the second, two things are being bought, and naming them precisely is what makes the trade assessable:\n\n**Parallelism.** Independent subtasks run at once, so wall-clock time falls toward the slowest subtask instead of the sum of all of them.\n\n**Context isolation.** Each subagent has its own context window. A subagent can read forty pages and return three sentences, and only those three sentences enter the orchestrator's context. That is the mechanism that makes broad search feasible at all.\n\nThe price is paid in tokens. Every subagent re-reads its own instructions, tool definitions and context, so total consumption scales with agents and turns — routinely an order of magnitude above a single call answering the same question. The design is justified when the answer is valuable enough to absorb that multiplier.",
    },

    { kind: "heading", text: "When the shape fits, and when it does not" },
    {
      kind: "table",
      caption: "Signals for and against a multi-agent decomposition",
      headers: ["Signal", "Fit", "Why"],
      rows: [
        [
          "Subtasks are independent and can be explored in parallel",
          "Strong",
          "Parallelism and isolation both pay off; the classic breadth-first search",
        ],
        [
          "Each subtask needs a different tool or credential scope",
          "Strong",
          "Separate agents give each piece least privilege by construction",
        ],
        [
          "Subtasks share mutable state every one of them must see",
          "Poor",
          "Isolation becomes duplication, and agents overwrite each other's work",
        ],
        [
          "The task is a fixed sequence of known steps",
          "Poor",
          "A workflow produces the same result at lower cost and full predictability",
        ],
        [
          "Each delegated piece is one subtask that returns after a single pass",
          "Poor",
          "That is orchestrator–workers: run-time fan-out inside a workflow, not a second agent",
        ],
        [
          "The answer is low-value and per-request cost matters",
          "Poor",
          "The token multiplier is never recovered",
        ],
      ],
    },

    { kind: "heading", text: "Orchestration strategies" },
    {
      kind: "prose",
      md: "Four arrangements cover nearly everything, and each fails in its own characteristic way.",
    },
    {
      kind: "list",
      items: [
        "**Orchestrator and subagents.** A lead model plans, delegates and synthesizes; subagents never call one another. Keeping the interaction graph a tree is what makes cost and failure attribution tractable, because every finding has exactly one path back to the request that produced it. The right shape for breadth — many independent lines of inquiry whose results compress — and the wrong one the moment two subagents need each other's intermediate work.",
        "**Sequential handoff.** Each subagent completes a stage and passes a defined artifact to the next: extract, then verify, then draft. Cheap, predictable and easy to resume, because every boundary artifact is inspectable on its own. The artifact is also the entire contract — a judgment made upstream and not written into it is gone — so this arrangement fails at the seams rather than inside a stage, and the fix is a richer interface rather than a stronger model.",
        "**Generator and critic.** One subagent produces, a second scores the draft against a rubric and returns specific defects, over a bounded number of rounds. It pays for itself where quality is judged rather than computed, and where the critic holds something the generator lacks: a rubric, a test result, a different toolset. A critic sharing the generator's context and instructions mostly agrees with it, so bound the rounds and exit on the rubric being met rather than on the critic declaring itself satisfied.",
        "**Shared workspace.** Subagents read and write one common artifact — a plan file, a document, a task board. State survives any individual agent, which makes long-running work resumable, and concurrent edits silently drop each other, which makes it dangerous. It needs an explicit write protocol: per-section ownership, append-only updates, or a coordinator that serializes writes. Without one the last writer wins and nothing raises an error.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Every subagent needs three things, and the absence of any one of them is the usual root cause when a multi-agent system misbehaves: an explicit objective, a defined output format, and a stopping condition. Without a stopping condition an agent either loops or stops when it happens to feel finished, which is not a property a system can be built on.",
    },

    {
      kind: "example",
      title: "Practical example: a vendor comparison assistant",
      scenario:
        "A procurement team wants forty vendors compared across eight criteria. The single-agent version fills its context after about twelve vendors, then starts producing shallow summaries and contradicting its own earlier findings.",
      walkthrough:
        "1. **Check independence.** Each vendor can be researched without reference to the others, so the work is genuinely parallel.\n2. **Design the contract.** Each subagent gets one vendor, the eight criteria, an output schema and a cap on tool calls. Which pages it opens, and how many, is its own decision — vendor sites are organized differently and the path to a given criterion cannot be written down in advance. That open loop, not the fan-out, is what makes this multi-agent rather than orchestrator–workers.\n3. **Compress at the boundary.** Subagents return the filled schema, not their browsing transcripts. Forty short records fit comfortably where twelve transcripts did not.\n4. **Scope the tools.** Research subagents get search and fetch and nothing else; only the orchestrator writes the final document.\n5. **Budget.** Forty subagents cost roughly an order of magnitude more tokens than the failed single-agent attempt. The team accepts it because the comparison informs a seven-figure decision.",
      takeaway:
        "Isolation was the point. Parallelism made it fast, but the compressed boundary is what made it possible at all.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add more specialized agents* and *let the agents coordinate among themselves* both read as sophistication and both usually key wrong. Peer-to-peer coordination turns a tree into a graph with no bound on interactions, and more agents on a coupled problem multiplies duplicated context rather than dividing the work.",
    },

    { kind: "practice", questionId: "D1-q401" },
  ],

  keyTerms: [
    {
      term: "Context isolation",
      definition:
        "Giving each subagent its own context window so it can consume large input and return only a compressed result, keeping the orchestrator's context small.",
    },
    {
      term: "Subagent",
      definition:
        "A delegated actor that runs its own tool loop and chooses its own stopping point. The word is reserved for that; a delegate executing a single generated subtask and returning is a worker inside the orchestrator–workers workflow, not a second agent.",
    },
    {
      term: "Orchestrator",
      definition:
        "The lead model that decomposes the task, delegates to subagents, and synthesizes their returned artifacts into one answer. The same shape appears in the orchestrator–workers workflow, so it is what the delegates are allowed to do — not the fan-out — that makes a design multi-agent.",
    },
    {
      term: "Stopping condition",
      definition:
        "The explicit rule that ends a subagent's work — a satisfied objective, a tool-call budget, or an iteration cap — without which cost and latency are unbounded.",
    },
    {
      term: "Token multiplier",
      definition:
        "The factor by which a multi-agent design increases total consumption, because every agent re-reads its own instructions, tools and context on every turn.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Subagents can share the orchestrator's context window so that nothing is lost between them.",
      why: "Each model call carries its own context, and forcing one shared window across every actor removes the isolation that is the pattern's principal benefit while reintroducing exactly the context pressure it was adopted to relieve.",
      instead:
        "Define a compact return artifact per subagent and let the orchestrator synthesize from those.",
    },
    {
      id: "t2",
      trap: "When a multi-agent system underperforms, adding more specialized subagents will help.",
      why: "Where subtasks are coupled through shared state, each extra agent re-reads the same material and creates another chance for conflicting conclusions, so the regression deepens instead of resolving.",
      instead:
        "Re-examine whether the decomposition is genuinely independent before changing the fan-out.",
    },
    {
      id: "t3",
      trap: "Subagents should return their full tool output so the orchestrator can judge the evidence itself.",
      why: "Returning raw transcripts pushes the context problem straight back into the orchestrator and throws away the isolation that made the decomposition worth its token cost in the first place.",
      instead:
        "Have each subagent return a schema-shaped finding, with pointers to sources the orchestrator can re-fetch if needed.",
    },
    {
      id: "t4",
      trap: "Giving every subagent the full toolset keeps the design flexible.",
      why: "Uniform tool access abandons least privilege, widens the blast radius of a single bad step, and makes it materially harder to attribute a destructive action to the agent that took it.",
      instead:
        "Scope each subagent's tools and credentials to what its stated objective requires and nothing more.",
    },
  ],

  practiceQuestionIds: ["D1-q401"],

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
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
  ],

  relatedLessons: ["1.3", "1.5"],
} satisfies Lesson;
