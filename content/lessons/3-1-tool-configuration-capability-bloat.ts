import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.1",
  slug: "3-1-tool-configuration-capability-bloat",
  domain: 3,
  objective: "Evaluate tool/agent configuration for capability bloat",
  title: "Tool Configuration and Capability Bloat",
  summary:
    "Every tool handed to an agent costs context, competes for attention at selection time, and widens the blast radius of a bad decision. Evaluating for bloat means asking what the job actually requires and deleting the rest.",

  body: [
    {
      kind: "prose",
      md: "A tool definition is not free. It occupies context on every request, it joins the set the model must discriminate between on every turn, and it is a capability the agent can exercise whenever it decides to. Teams add tools one at a time because each looks individually useful, and the configuration degrades gradually rather than failing loudly — which is why the exam asks you to *evaluate* a configuration rather than debug an error.\n\nThree costs accumulate, and separating them matters because each has a different fix:",
    },
    {
      kind: "list",
      items: [
        "**Context cost.** Every tool's name, description and JSON schema is serialized into every request. A handful of servers with verbose schemas can consume tens of thousands of tokens before the user has said anything.",
        "**Selection cost.** The model chooses from the whole set on each turn. Accuracy falls as the set grows, and falls fastest when descriptions overlap — two tools that both plausibly fit a request force a coin flip.",
        "**Blast-radius cost.** Anything present can be invoked, including by instructions smuggled in through a retrieved document or a tool result. A capability the workflow never needs is pure downside.",
      ],
    },
    {
      kind: "prose",
      md: "The first cost is measurable, the second shows up as wrong-tool errors, and the third shows up once, expensively.",
    },

    { kind: "heading", text: "Reading the symptoms" },
    {
      kind: "table",
      caption: "Bloat presents as ordinary bugs; the fix is in the configuration",
      headers: ["Symptom", "Likely cause", "Correct response"],
      rows: [
        [
          "Wrong tool chosen for an unambiguous request",
          "Two tools with overlapping descriptions",
          "Merge them, or rewrite descriptions so the boundary is explicit",
        ],
        [
          "High latency and cost even on trivial turns",
          "Large tool schemas re-sent on every request",
          "Trim schemas, drop unused tools, or load definitions on demand",
        ],
        [
          "Agent invents plausible parameter values",
          "Required parameters the caller cannot know",
          "Give the parameter a default or resolve it server-side",
        ],
        [
          "One agent spans unrelated business domains",
          "Tool set covers several roles at once",
          "Split into role-scoped agents with disjoint tool sets",
        ],
        [
          "A destructive action fires unexpectedly",
          "Write capability exposed to a read-only workflow",
          "Remove the tool rather than guarding it",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Least privilege applies to tool configuration exactly as it applies to service accounts. The question is never *could this be useful someday* but *does this agent's job require it now*. Logging a dangerous tool, or putting a confirmation in front of it, leaves the capability in place — those are detective and compensating controls layered over a privilege that should not exist.",
    },

    { kind: "heading", text: "Trimming a configuration" },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Start from the workflow, not the catalog.** Enumerate the tasks the agent must complete, then the minimum tools each one needs. Everything else is a removal candidate.",
        "**Collapse overlaps.** If two tools would both be defensible answers to the same request, the model will be wrong some of the time no matter how it is prompted.",
        "**Separate read from write.** Splitting retrieval-only agents from action-taking agents shrinks both sets and confines the dangerous half to a narrow, auditable surface.",
        "**Push determinism into code.** A step that always runs in the same place with the same arguments belongs in the orchestration layer, not in a tool the model may forget to call.",
        "**Load on demand when the catalog is genuinely large.** Where a domain really needs hundreds of capabilities, expose a small discovery surface and fetch definitions as they become relevant.",
      ],
    },

    {
      kind: "example",
      title: "Practical example: an operations assistant with 47 tools",
      scenario:
        "An internal operations assistant is wired to five MCP servers exposing 47 tools between them. Users report that it reads the staging deployment tracker when asked about production, and that simple questions stall for seconds before the first token. Per-request cost has tripled since the third server was connected.",
      walkthrough:
        "1. **Measure the fixed overhead.** Tool definitions serialize to roughly 24,000 tokens on every request, which accounts for the cost increase and much of the time to first token.\n2. **Classify by usage.** Call logs show eleven tools carry 98% of invocations and nineteen have never been called once.\n3. **Locate the confusion.** `get_deployment_status` and `fetch_deploy_state` come from different servers with near-identical descriptions, and neither names the environment it covers.\n4. **Cut and clarify.** Disconnect the two servers contributing only dead tools, and rewrite the surviving description to state its environment explicitly.\n5. **Split what remains.** Incident response needs write access; the everyday assistant does not. Two agents with disjoint tool sets replace one agent holding all of them.",
      takeaway:
        "Nothing here was fixed by prompting. The wrong-tool errors were a description problem, the latency was a schema-size problem, and the exposure was a scope problem — three separate costs of one bloated configuration.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When an agent picks the wrong tool, *add system-prompt instructions telling it which tool to use* is almost always offered and almost never keyed. Prompt text competes with tool descriptions instead of overriding them, and the approach scales badly as the set grows. The exam keys the option that changes the tool set itself — removing, merging or disambiguating.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q101",
        "D3-q102",
        "D3-q103",
        "D3-q104",
        "D3-q105",
        "D3-q106",
        "D3-q107",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Capability bloat",
      definition:
        "A tool or agent configuration that exposes more capability than the workflow requires, degrading selection accuracy and enlarging the blast radius without adding useful function.",
    },
    {
      term: "Blast radius",
      definition:
        "The set of actions an agent can take if it behaves wrongly — through model error, ambiguous instructions, or injected content. Bounded by what tools exist, not by what the prompt asks for.",
    },
    {
      term: "Tool overlap",
      definition:
        "Two or more tool definitions that are both plausible answers to the same request. The dominant cause of wrong-tool selection, and unreachable by prompt instructions.",
    },
    {
      term: "Role-scoped agent",
      definition:
        "An agent whose tool set is drawn from one job function, so that read-only and action-taking work run under separate, minimal configurations.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "More tools make an agent more capable, so exposing the full catalog is the safe default.",
      why: "Tool-selection accuracy falls as the candidate set grows, and every definition consumes context on every request, so a larger catalog reliably makes the agent worse at the tasks it does perform.",
      instead:
        "Scope the tool set to the workflow the agent owns and remove anything that workflow does not require.",
    },
    {
      id: "t2",
      trap: "An unused tool is harmless as long as every call to it is logged.",
      why: "Logging is a detective control that reports damage after it happens; the capability stays available to any turn, including one steered by instructions injected through retrieved content.",
      instead:
        "Remove the capability, and reserve logging for privileges the role genuinely needs.",
    },
    {
      id: "t3",
      trap: "Prompt caching makes a large tool catalog effectively free.",
      why: "Caching lowers the cost and latency of re-sending a stable prefix, but the definitions still occupy the context window and still enlarge the set the model must choose from on every single turn.",
      instead:
        "Treat caching as a cost optimization and keep evaluating the catalog for selection accuracy and blast radius.",
    },
    {
      id: "t4",
      trap: "A deterministic step should still be a tool so the agent can decide when to run it.",
      why: "Handing the model a decision that has exactly one correct answer manufactures a failure mode where none existed and spends a turn of latency to gain no flexibility at all.",
      instead:
        "Encode fixed steps in orchestration code and reserve tools for genuine runtime choices.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
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
} satisfies Lesson;
