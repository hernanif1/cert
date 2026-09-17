import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.8",
  slug: "3-8-progressive-discovery",
  domain: 3,
  objective: "Evaluate progressive discovery vs. monolithic context strategy",
  title: "Progressive Discovery vs. Monolithic Context",
  summary:
    "You can load everything the agent might need upfront, or give it a map and let it fetch detail on demand. The choice turns on how much of the corpus a typical task actually touches, how stable it is, and whether you are optimizing per-request cost or per-session cost.",

  body: [
    {
      kind: "prose",
      md: "**Monolithic context** puts everything in the prompt: the full policy set, every tool definition, the whole schema, the complete file listing. It is one round trip, fully deterministic about what the model saw, and highly cacheable when the payload is stable.\n\n**Progressive discovery** puts in a map — an index, a table of contents, a compact tool catalog — plus the means to fetch detail. The agent pulls what it needs, when it needs it. Working context stays small and relevant, but each fetch is another round trip and the agent can fail to look.\n\nNeither is a default. The exam wants the trade priced against a specific workload.",
    },

    { kind: "heading", text: "What drives the decision" },
    {
      kind: "table",
      caption: "Signals that point to each strategy",
      headers: ["Signal", "Points to"],
      rows: [
        [
          "Corpus fits comfortably in the window and is stable",
          "Monolithic, with the prefix cached",
        ],
        [
          "A typical task needs a small, unpredictable slice of a large corpus",
          "Progressive discovery",
        ],
        [
          "Content changes between requests",
          "Progressive — a volatile prefix defeats caching anyway",
        ],
        [
          "Strict single-turn latency budget",
          "Monolithic; extra fetches are extra round trips",
        ],
        [
          "Long sessions where the same material is reused many times",
          "Monolithic, amortized across the session",
        ],
        [
          "Audit requires proving exactly what informed a decision",
          "Monolithic, or progressive with every fetch logged",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "A large context window makes monolithic loading *possible*, not *free*. Filling a window with mostly-irrelevant material dilutes attention across it, and the tokens are processed on every turn of a multi-turn session. The relevant question is not whether the corpus fits — it is what fraction of what you loaded the task actually needed.",
    },

    { kind: "heading", text: "The hybrid is usually the answer" },
    {
      kind: "prose",
      md: "Real systems rarely choose one. The durable pattern is a **stable monolithic core plus progressive detail**: identity, operating instructions, output contract and a compact index of what exists go in the prefix, where they are cached and never change. Everything voluminous or volatile is fetched on demand.\n\nSkills are this pattern made explicit. A short description is always in context so the model knows a capability exists; the full instructions load only when it is invoked. Tool catalogs can work the same way — a search-and-load surface instead of hundreds of inline definitions. So can codebases: a directory listing plus read tools beats pasting every file.",
    },
    {
      kind: "list",
      items: [
        "**Always resident.** Role, constraints, output format, safety rules, and a map of available resources. Small, stable, cacheable.",
        "**Fetched on demand.** Document bodies, full tool schemas, query results, file contents — anything large, changing, or needed by only some tasks.",
        "**Never loaded.** Material no plausible task requires. The cheapest tokens are the ones you never send.",
      ],
    },

    {
      kind: "example",
      title: "Practical example: a legal review assistant at two scales",
      scenario:
        "A legal assistant reviews contracts against an internal playbook. At launch the playbook is 40 pages and the whole thing is pasted into the system prompt, cached, and works well. Two years later it is 900 pages across 60 jurisdiction-specific annexes. Answers have become vague, cost per review has quadrupled, and the team is debating a larger-context model.",
      walkthrough:
        "1. **Measure the usage fraction.** A typical review cites two or three annexes. More than 90% of the loaded material is irrelevant to any given contract.\n2. **Recognize the real cost.** The bigger window would accommodate the payload but would not make the irrelevant 90% harmless, and it is re-processed on every turn of a multi-turn review.\n3. **Split the context.** The review methodology, output schema and an annex index — one line per annex — stay in the cached prefix, roughly 4,000 tokens.\n4. **Fetch the rest.** A retrieval tool loads full annex text on request. The agent names the jurisdiction and clause type and pulls two or three.\n5. **Keep the audit trail.** Every fetch is logged, so a reviewer can still prove which annexes informed a conclusion — the property monolithic loading gave away for free.",
      takeaway:
        "The same design was correct at 40 pages and wrong at 900. What changed was not the window size but the fraction of the corpus a single task needed.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Progressive discovery only works if the map is good. An index that does not describe what each entry contains leaves the agent guessing, and it will either fetch nothing or fetch everything — the worst of both strategies, with the round trips of one and the context bloat of the other.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Move to a model with a larger context window* is the standing distractor on this objective. It answers a capacity question the scenario has usually already told you is not binding — the material fits, and the agent is still choosing badly among it. The keyed option almost always narrows what reaches the model rather than widening the space it arrives in.",
    },

    { kind: "practice", questionId: "D3-q801" },
  ],

  keyTerms: [
    {
      term: "Progressive discovery",
      definition:
        "Supplying a compact map of available material plus tools to fetch detail on demand, so working context holds only what the current task needs.",
    },
    {
      term: "Monolithic context",
      definition:
        "Loading everything a task might require into the prompt upfront. Deterministic and cacheable; degrades as the share of irrelevant material grows.",
    },
    {
      term: "Context dilution",
      definition:
        "The loss of precision that comes from surrounding the relevant material with large volumes of irrelevant material, even when everything fits inside the window.",
    },
    {
      term: "Stable prefix",
      definition:
        "The unchanging leading portion of a prompt — role, rules, schema, index — that can be cached across requests. Volatile content placed early destroys the cache for everything after it.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A large enough context window removes the need for progressive loading.",
      why: "Capacity and effectiveness are different properties: a window filled largely with irrelevant material dilutes attention and is re-processed on every turn, so fitting is not the same as helping.",
      instead:
        "Decide from the fraction of the corpus a typical task actually uses, not from whether the whole corpus fits.",
    },
    {
      id: "t2",
      trap: "Progressive discovery is always cheaper because fewer tokens are loaded.",
      why: "Each fetch is an extra round trip with its own latency, and a long session that repeatedly pulls the same material can send more tokens in total than one cached monolithic prefix would have.",
      instead:
        "Compare cost per completed session, including retries and repeated fetches, rather than tokens per single request.",
    },
    {
      id: "t3",
      trap: "Prompt caching makes a monolithic strategy safe at any size.",
      why: "Caching reduces the cost and processing time of a repeated prefix but changes nothing about how much irrelevant material the model must reason around, so accuracy still degrades as the payload grows.",
      instead:
        "Cache the stable core and move bulk or volatile material behind on-demand retrieval.",
    },
    {
      id: "t4",
      trap: "Loading every document upfront guarantees the agent will not miss relevant information.",
      why: "Presence in the window is not the same as being used, and a specific clause buried in hundreds of pages of similar text competes with everything around it for the model's attention.",
      instead:
        "Narrow what reaches the model so the relevant material faces less competition, and verify with evaluation rather than assuming coverage.",
    },
  ],

  practiceQuestionIds: ["D3-q801", "D3-q803"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],
} satisfies Lesson;
