import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q101",
    domain: 3,
    objective: "3.1",
    stem: "A team exposes a customer-support agent that can read tickets, draft replies, issue refunds, and delete user accounts. Support staff only ever need to read tickets and draft replies. Applying least-privilege principles, which change best reduces risk?",
    choices: [
      {
        id: "A",
        text: "Add logging to the refund and delete tools so misuse can be audited later.",
        rationale:
          "Logging is a detective control. It tells you afterwards that damage was done; it does not stop the agent from doing it.",
      },
      {
        id: "B",
        text: "Remove the refund and delete tools from the agent's configuration entirely.",
      },
      {
        id: "C",
        text: "Keep all tools but add a confirmation prompt before refunds and deletions.",
        rationale:
          "A confirmation is a compensating control around a privilege the role never needed. It narrows the window for misuse without removing the capability.",
      },
      {
        id: "D",
        text: "Replace the agent with a larger model that follows instructions more reliably.",
        rationale:
          "Model size is unrelated to authorization scope. A more capable model with a delete tool can still delete accounts.",
      },
    ],
    explanation:
      "Least privilege means removing capabilities the role does not require, eliminating the attack surface rather than monitoring or guarding it. Logging and confirmations are detective and compensating controls, not removal of unnecessary privilege, and model choice does not change what a tool is allowed to do.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["least-privilege", "tool-design"],
    sourceRef: "exam-guide §8 Sample 1",
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q102",
    domain: 3,
    objective: "3.1",
    stem: "A code-review assistant is connected to three MCP servers exposing 38 tools between them. Engineers report that it sometimes opens pull requests when asked only to summarize a diff, and that every request carries roughly 19,000 tokens of tool definitions before any code is included. Call logs show that tools from two of the three servers have never been invoked. Which two changes most directly address both complaints?",
    choices: [
      {
        id: "A",
        text: "Remove the write-capable Git tools from the review assistant and expose them only on a separate merge agent.",
      },
      {
        id: "B",
        text: "Add a system-prompt paragraph instructing the assistant never to open a pull request unless explicitly asked.",
        rationale:
          "Prompt text competes with tool descriptions rather than removing the capability, and it does nothing about the token overhead the definitions impose on every request.",
      },
      {
        id: "C",
        text: "Disconnect the two servers whose tools have never appeared in call logs.",
      },
      {
        id: "D",
        text: "Enable prompt caching on the tool definitions so the fixed prefix is not re-billed on every request.",
        rationale:
          "Caching lowers the cost of re-sending a stable prefix but leaves the definitions in the window and leaves the write capability available to any turn.",
      },
      {
        id: "E",
        text: "Switch to a more capable model so tool selection is more reliable across the 38 options.",
        rationale:
          "Model capability does not shrink the candidate set or the definition tokens, and a stronger model holding a write tool can still open a pull request.",
      },
    ],
    explanation:
      "Both complaints trace to the same bloated configuration. Dropping the never-called servers cuts the fixed context overhead directly, and removing write capability from a read-only review role eliminates the unwanted action rather than guarding against it. Caching, prompting and a bigger model each leave the tool set unchanged.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["tool-design", "least-privilege", "context-cost"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D3-q103",
    domain: 3,
    objective: "3.1",
    stem: "An analytics agent has two tools: `run_report`, described as \"Run a saved analytics report\", and `execute_query`, described as \"Run an analytics query and return results\". The agent picks `execute_query` for saved reports about a third of the time, producing slower responses and occasionally different numbers. The team has already added a system-prompt paragraph explaining when to use each. What should the architect do next?",
    choices: [
      {
        id: "A",
        text: "Move the instruction paragraph to the end of the system prompt, closer to the user's message.",
        rationale:
          "Repositioning prompt text changes emphasis but not the fact that two definitions both plausibly cover the same request.",
      },
      {
        id: "B",
        text: "Add few-shot examples demonstrating the correct choice for several report requests.",
        rationale:
          "Examples nudge selection on cases they resemble while the underlying ambiguity keeps reasserting itself on the requests they do not cover.",
      },
      {
        id: "C",
        text: "Rewrite the descriptions so each states what the other does not cover, or merge them into one tool with a mode parameter.",
      },
      {
        id: "D",
        text: "Delete `execute_query` so only the saved-report tool remains.",
        rationale:
          "Ad-hoc querying is a capability this agent legitimately needs; this resolves the confusion by removing required function rather than clarifying the boundary.",
      },
    ],
    explanation:
      "Wrong-tool selection between two plausible candidates is a definition problem, not a prompting problem. The model is discriminating between descriptions, so the fix has to change the descriptions — either by making the boundary explicit or by collapsing the overlap into a single tool.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["tool-design", "tool-overlap"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q104",
    domain: 3,
    objective: "3.1",
    stem: "A procurement agent runs a fixed sequence on every purchase request: validate the requisition schema, write an audit-log entry, then call the pricing service. All three are exposed as tools. An audit finds that 4% of processed requests have no audit-log entry, and in a handful of cases pricing was called before validation. What is the most appropriate architectural change?",
    choices: [
      {
        id: "A",
        text: "Add a reviewer model that reads each transcript and flags runs with a missing audit entry.",
        rationale:
          "This detects the omission after the request has already been processed; it does not make the audit entry happen.",
      },
      {
        id: "B",
        text: "Strengthen the three tool descriptions to state the required ordering and that the audit log is mandatory.",
        rationale:
          "Descriptions influence which tool is selected but cannot guarantee that an unconditional step runs, or runs in a fixed position.",
      },
      {
        id: "C",
        text: "Move to a more capable model that follows multi-step instructions more reliably.",
        rationale:
          "A higher compliance rate is still a rate; steps with no decision in them should not depend on model behavior at all.",
      },
      {
        id: "D",
        text: "Move the three steps into orchestration code that runs around the model call, and remove them as tools.",
      },
    ],
    explanation:
      "None of these three steps involves a runtime decision — they always run, always in the same order, with arguments the orchestrator already knows. Exposing them as tools converted guaranteed behavior into probabilistic behavior. Encoding them in code eliminates the failure class rather than reducing its frequency.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["tool-design", "workflow-vs-agent"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q105",
    domain: 3,
    objective: "3.1",
    stem: "A support assistant's cost per request has roughly tripled over a quarter with no change in traffic, model, or average conversation length. The only configuration change in that period was connecting two additional MCP servers, adding 22 tool definitions. Time to first token has also risen. What is the most likely explanation?",
    choices: [
      {
        id: "A",
        text: "Tool definitions are serialized into every request, so the fixed input-token overhead grew with the catalog.",
      },
      {
        id: "B",
        text: "The additional servers add network round trips to every request even when their tools are not called.",
        rationale:
          "Definitions are declared, not invoked; no call reaches a server whose tools the model does not select on that turn.",
      },
      {
        id: "C",
        text: "The agent now retries more often because it has more tools to consider.",
        rationale:
          "Retries are driven by errors and stop reasons rather than catalog size, and nothing reported indicates a rise in failed calls.",
      },
      {
        id: "D",
        text: "Larger tool catalogs cause requests to be routed to a more expensive model tier.",
        rationale:
          "The model is chosen by the caller and does not change based on how many tools a request declares.",
      },
    ],
    explanation:
      "Every declared tool's name, description and JSON schema is sent on every request, so a catalog that grows by 22 definitions raises the fixed input cost and the input-processing time of each call whether or not those tools are ever used. This is the context cost of capability bloat, and it is measurable directly from token counts.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["tool-design", "context-cost"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
