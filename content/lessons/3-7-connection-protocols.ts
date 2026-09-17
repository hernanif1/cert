import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.7",
  slug: "3-7-connection-protocols",
  domain: 3,
  objective:
    "Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent)",
  title: "Choosing an Integration Mechanism",
  summary:
    "MCP, a direct API or CLI call, and agent-to-agent delegation solve different problems, and picking the wrong one shows up as either needless plumbing or unbounded non-determinism. The choice follows from who needs the capability and who decides when to use it.",

  body: [
    {
      kind: "prose",
      md: "Three mechanisms connect a Claude-based system to the world, and they are not interchangeable.\n\n**MCP** — the Model Context Protocol — is an open standard for exposing tools, resources and prompts to any MCP-compatible client. Its value is reuse and discovery: one server, many clients, a uniform way to enumerate what is available. **A direct API or CLI call** is your own code invoking a system, with no protocol layer and no discovery. **Agent-to-agent** delegation hands a goal, not a call, to another autonomous agent that does its own planning with its own tools and context.",
    },

    { kind: "heading", text: "Two questions decide it" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Who decides whether this runs, and with what arguments?** If the orchestration code always knows, it is a function call — write it in code. If the model must decide at runtime, it is a tool.",
        "**How many distinct clients need this capability?** One application means a direct integration is sufficient. Several agents, IDEs or assistants — especially across teams — is what the protocol layer is for.",
      ],
    },
    {
      kind: "prose",
      md: "Agent-to-agent is a third case that neither question covers. It applies when the work needs independent multi-step reasoning, a different tool set, and a context window of its own — reconciling an account, investigating an incident, researching a topic. You delegate an objective and receive a result, accepting that the intermediate steps are the delegate's business.",
    },

    {
      kind: "table",
      caption: "Selection criteria across the three mechanisms",
      headers: ["Criterion", "MCP server", "Direct API / CLI", "Agent-to-agent"],
      rows: [
        [
          "Unit of exchange",
          "Tool, resource or prompt definitions",
          "A specific request and response",
          "A goal and a result",
        ],
        [
          "Who chooses arguments",
          "The model, at runtime",
          "Your code, deterministically",
          "The delegate agent decides its own steps",
        ],
        [
          "Reuse across clients",
          "The point of it",
          "Per-integration work each time",
          "High, but coupling is by contract not schema",
        ],
        [
          "Determinism",
          "Model-dependent selection",
          "Fully deterministic",
          "Lowest — the delegate plans for itself",
        ],
        [
          "Debuggability",
          "Good; individual calls are traceable",
          "Best",
          "Hardest; two traces must be correlated",
        ],
        [
          "Overhead added",
          "A server to run, version and secure",
          "None beyond the client library",
          "Another model loop, its own cost and latency",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "MCP is a transport and description standard, not a capability. Wrapping an endpoint in an MCP server does not make it more available to the model than a well-described tool defined inline; what it buys is that *other* clients can discover and use the same definition without reimplementing it. If there is exactly one consumer and no discovery requirement, the server is overhead you now maintain.",
    },

    { kind: "heading", text: "Deterministic steps do not belong to the model" },
    {
      kind: "prose",
      md: "The most common misapplication is exposing a fixed pipeline step as a tool. If every run must validate the payload, then write to the audit log, then call the pricing service, in that order, encoding those as tools introduces three chances for the model to skip, reorder or mis-argument a step that had no decision in it. Put them in code and give the model tools only where genuine runtime judgment is required. This is the workflow-versus-agent distinction applied at the level of a single call.",
    },

    {
      kind: "example",
      title: "Practical example: three integrations, three answers",
      scenario:
        "A platform team is connecting a claims-processing assistant to three systems: a document OCR service called on every submitted claim, an internal policy lookup that four different assistants and the engineering IDE fleet all need, and a fraud review that requires pulling records from several sources and forming a judgment.",
      walkthrough:
        "1. **OCR on every claim.** There is no decision — every claim is scanned. It becomes a step in the orchestration code calling the service's SDK directly, before the model is invoked at all.\n2. **Policy lookup across many clients.** Multiple independent consumers need the same capability with the same semantics. This is the case for an MCP server: define it once, and every compatible client discovers it.\n3. **Fraud review.** The work is open-ended, needs its own tools and a large working context, and should not pollute the claims assistant's context with dozens of intermediate lookups. Delegate it to a dedicated agent and consume its verdict.\n4. **Check the trade accepted.** The delegated path is the least predictable and hardest to debug, so it gets its own trace id, a step budget and a structured result contract.",
      takeaway:
        "The same system used all three mechanisms, chosen per capability. The deciding factors were who makes the decision, how many clients need it, and whether the work requires independent reasoning.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Expose it through MCP* reads as the modern, standards-aligned answer and is therefore over-offered. On items describing a single application with one fixed integration and no other consumers, the keyed answer is usually the direct call. Ask what the protocol layer is buying before you pay for it.",
    },

    { kind: "practice", questionId: "D3-q701" },
  ],

  keyTerms: [
    {
      term: "Model Context Protocol (MCP)",
      definition:
        "An open standard for servers to expose tools, resources and prompts to any compatible client, so one integration can be discovered and reused across many applications.",
    },
    {
      term: "Agent-to-agent delegation",
      definition:
        "Handing a goal to another autonomous agent with its own tools and context, and consuming its result rather than its steps. Buys isolation and specialization at the cost of predictability.",
    },
    {
      term: "Context isolation",
      definition:
        "Keeping a subtask's intermediate work in a separate context window so the caller receives only the conclusion. A primary reason to delegate rather than inline.",
    },
    {
      term: "Runtime decision point",
      definition:
        "A place where which action to take, or with what arguments, genuinely depends on the input. The test for whether something should be a tool rather than code.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Every internal service should be wrapped as an MCP server so agents can use it.",
      why: "The protocol layer pays for itself only when several independent clients need the same capability; with a single consumer it adds a server to deploy, version, secure and debug for no gain in what the model can do.",
      instead:
        "Use a direct integration when there is one consumer, and adopt MCP when reuse or discovery across clients is a real requirement.",
    },
    {
      id: "t2",
      trap: "A step that runs on every request should still be a tool, so the agent stays in control.",
      why: "Exposing a fixed step as a tool converts a guaranteed action into a probabilistic one, creating skip, reorder and wrong-argument failures that simply do not exist when the step lives in orchestration code.",
      instead:
        "Encode unconditional steps in code and reserve tools for calls whose timing or arguments genuinely depend on the input.",
    },
    {
      id: "t3",
      trap: "Delegating to another agent is a cleaner way to organize any multi-step task.",
      why: "A delegate plans independently, which removes your ability to guarantee sequence and makes failures span two traces, so the isolation is only worth it when the subtask truly needs its own reasoning and context.",
      instead:
        "Delegate open-ended subtasks that need separate tools and context, and decompose predictable sequences in your own orchestration.",
    },
    {
      id: "t4",
      trap: "Adopting MCP means replacing the service's existing REST API.",
      why: "An MCP server is an additional facade in front of capabilities that usually keep their original interface, and existing non-agent consumers continue to call the API exactly as before.",
      instead:
        "Treat MCP as a way to describe and expose existing capabilities to model clients, not as a migration of the underlying service.",
    },
  ],

  practiceQuestionIds: ["D3-q701", "D3-q703"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
