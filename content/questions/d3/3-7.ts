import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q701",
    domain: 3,
    objective: "3.7",
    stem: "One internal application calls one legacy pricing service. The service has a stable REST API, nothing else in the AI estate uses it, and the assistant must call it whenever a user asks for a quote. An engineer proposes building an MCP server in front of it. What is the strongest argument against?",
    choices: [
      {
        id: "A",
        text: "With a single consumer and no discovery requirement, the server adds a component to deploy, version and secure without changing what the model can do.",
      },
      {
        id: "B",
        text: "MCP cannot express the authentication scheme the pricing service uses.",
        rationale:
          "MCP servers routinely front authenticated services; the protocol places no constraint on how a server authenticates downstream.",
      },
      {
        id: "C",
        text: "MCP adds unacceptable per-call latency compared with a direct HTTP request.",
        rationale:
          "A co-located server adds modest overhead, and latency is not the principal reason to skip the protocol layer in this case.",
      },
      {
        id: "D",
        text: "The pricing service would have to be rewritten to speak the protocol.",
        rationale:
          "An MCP server is a facade in front of an unchanged service; the underlying API keeps its interface and its existing consumers.",
      },
    ],
    explanation:
      "MCP earns its keep through reuse and discovery across clients. A tool defined inline gives this single application exactly the same capability, so with one consumer the protocol layer is operational overhead rather than architecture. The question to ask is always what the standard is buying before you agree to maintain it.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["mcp", "integration-selection"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q702",
    domain: 3,
    objective: "3.7",
    stem: "An insurance platform runs four clients — claims intake, underwriting support, an agent desktop, and a developer CLI — and all four need to look up policy terms with identical semantics. Each team has built its own lookup against the policy database, and the four implementations have diverged on how they resolve effective dates. Which mechanism fits?",
    choices: [
      {
        id: "A",
        text: "Have the other three delegate policy questions to the underwriting assistant as agent-to-agent calls.",
        rationale:
          "This routes a deterministic lookup through another model's reasoning, adding cost, latency and non-determinism to a query with one right answer.",
      },
      {
        id: "B",
        text: "Publish a shared client library and require every team to adopt it.",
        rationale:
          "A library unifies the code that imports it, but each team still authors and maintains its own tool surface and description for the model.",
      },
      {
        id: "C",
        text: "Expose the lookup once as an MCP server so every compatible client discovers the same tool with the same semantics.",
      },
      {
        id: "D",
        text: "Consolidate the four clients into a single agent holding all of their tools.",
        rationale:
          "Merging unrelated roles into one configuration is capability bloat; it removes the duplication by creating a larger problem.",
      },
    ],
    explanation:
      "Several independent clients needing one capability with one definition is the case the protocol layer exists for. Defining the lookup once as an MCP server gives every compatible client the same tool description and the same effective-date semantics, which no per-team implementation or shared library can guarantee at the model's interface.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["mcp", "reuse", "integration-selection"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q703",
    domain: 3,
    objective: "3.7",
    stem: "A logistics assistant must resolve shipment exceptions. For each one it may need to check carrier status, query the warehouse system, read customer correspondence, consult contractual terms, and then decide a remedy. Resolution takes between three and twenty steps depending on what it finds, and the intermediate lookups produce large volumes of text that are irrelevant once a decision is reached. Which approach fits best?",
    choices: [
      {
        id: "A",
        text: "Add all five capabilities as tools on the main assistant and let it loop until the exception is resolved.",
        rationale:
          "Every intermediate lookup then accumulates in the main assistant's context, crowding out the customer conversation it also has to maintain.",
      },
      {
        id: "B",
        text: "Expose the five systems through a single MCP server so the assistant discovers them uniformly.",
        rationale:
          "Standardizing how the tools are described does nothing about where twenty steps of intermediate output accumulate.",
      },
      {
        id: "C",
        text: "Encode the resolution steps as a fixed workflow in orchestration code.",
        rationale:
          "The path branches from three to twenty steps depending on what each lookup reveals, so a fixed sequence cannot express it.",
      },
      {
        id: "D",
        text: "Delegate exception resolution to a dedicated agent with its own tools and context, and consume only its decision.",
      },
    ],
    explanation:
      "Open-ended work that needs its own tool set, its own multi-step reasoning, and produces bulky intermediate output is the case for agent-to-agent delegation. The caller hands over a goal and receives a verdict, keeping the intermediate lookups out of its own context. The trade accepted is lower predictability, which is managed with a step budget and a structured result contract.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["agent-to-agent", "context-isolation", "integration-selection"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q704",
    domain: 3,
    objective: "3.7",
    stem: "A team must invoke a data-quality check that runs for every ingested batch, always with the same arguments, before any model call happens. They are deciding which integration mechanism to use. Which fits?",
    choices: [
      {
        id: "A",
        text: "An MCP tool the agent calls when it judges the check is needed.",
        rationale:
          "The check is unconditional, so giving the model discretion introduces a chance of skipping it with no corresponding benefit.",
      },
      {
        id: "B",
        text: "A tool defined inline in the model request, with a description stating it is mandatory.",
        rationale:
          "Describing a tool as mandatory does not make invocation certain; tool selection remains a model decision on every turn.",
      },
      {
        id: "C",
        text: "An agent-to-agent delegation to a data-quality agent.",
        rationale:
          "Delegation buys independent reasoning, which a fixed check with fixed arguments neither needs nor can use.",
      },
      {
        id: "D",
        text: "A system-prompt instruction requiring the agent to run the check first.",
        rationale:
          "Prompt instructions are advisory text and cannot make an unconditional step deterministic or correctly ordered.",
      },
      {
        id: "E",
        text: "A direct call from the pipeline's orchestration code, before the model is invoked.",
      },
    ],
    explanation:
      "There is no runtime decision here: the check always runs, always with the same arguments, at a fixed point. Anything that routes it through the model converts a guarantee into a probability. Tools are for calls whose timing or arguments genuinely depend on the input.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["integration-selection", "workflow-vs-agent"],
    type: "single",
    correct: "E",
  },
  {
    schemaVersion: 1,
    id: "D3-q705",
    domain: 3,
    objective: "3.7",
    stem: "A team reports that their assistant cannot reliably use an internal inventory service: it calls the endpoint with the wrong field names and misreads the response. An engineer proposes putting an MCP server in front of the service, arguing that MCP will let the model use it correctly. What is the accurate assessment?",
    choices: [
      {
        id: "A",
        text: "Correct, because MCP standardizes the request and response format in a way models handle more reliably.",
        rationale:
          "MCP standardizes how a capability is described and transported, and the field names and response shape remain whatever the server chooses to expose.",
      },
      {
        id: "B",
        text: "The gain would come from the clear tool descriptions and schemas the server defines, which could equally be written for a direct tool definition.",
      },
      {
        id: "C",
        text: "Correct, because an MCP server validates arguments before they reach the service and rejects malformed calls.",
        rationale:
          "A server can validate, but so can any tool implementation, and validation is a property of what was built rather than of the protocol.",
      },
      {
        id: "D",
        text: "Incorrect, because MCP is intended for external integrations and this service is internal.",
        rationale:
          "MCP is routinely used inside an organization, and where the service sits is not what decides whether the protocol layer is worth maintaining.",
      },
    ],
    explanation:
      "MCP is a transport and description standard, not a capability: it does not make a model able to do anything a well-described inline tool could not. The reliability here comes from naming, schemas and documentation, so the real question is whether reuse across clients justifies maintaining a server to carry them.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["mcp", "integration-selection"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q706",
    domain: 3,
    objective: "3.7",
    stem: "A coding assistant used by engineers on their workstations needs to run the team's existing build, test and lint commands. Those commands are already a mature, documented command-line tool that engineers run by hand every day, and the assistant runs in the same shell session with the same permissions as the engineer. Which integration mechanism fits?",
    choices: [
      {
        id: "A",
        text: "An MCP server wrapping each command as a separate tool, so the assistant gets typed schemas.",
        rationale:
          "A server adds a component to build, version and deploy in front of an interface the assistant can already reach and engineers already trust.",
      },
      {
        id: "B",
        text: "A direct API integration against the build system, bypassing the command line.",
        rationale:
          "Talking to the build system directly reimplements behaviour the command-line tool already encodes and drifts from what engineers run by hand.",
      },
      {
        id: "C",
        text: "Agent-to-agent delegation to a dedicated build agent holding its own credentials.",
        rationale:
          "Delegation buys context isolation and a separate identity, neither of which is needed when the work runs locally as the engineer already.",
      },
      {
        id: "D",
        text: "Direct CLI invocation, since the capability already exists as a composable command with the right permissions in scope.",
      },
    ],
    explanation:
      "The two questions that decide the mechanism are who holds the authority at runtime and how many clients need the capability. Here the engineer's own session supplies the authority and there is one client, so the existing command line is the integration; wrapping it would add a maintained component without changing what the assistant can do.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["integration-selection", "cli", "tool-design"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
