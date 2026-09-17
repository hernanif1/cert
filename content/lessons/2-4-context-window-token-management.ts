import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.4",
  slug: "2-4-context-window-token-management",
  domain: 2,
  objective: "Optimize context windows and manage token usage",
  title: "Context Windows and Token Usage",
  summary:
    "The context window is a shared budget, not a target to fill: system prompt, tool definitions, history, retrieved material and the reserved output all compete for the same space. Cost and latency scale with what you actually send, and answer quality falls when the relevant passage is buried among irrelevant ones.",

  body: [
    {
      kind: "prose",
      md: "A larger window raises the ceiling on what a request *can* contain. It changes nothing about what a request *should* contain. Three costs follow every token you add, regardless of how much headroom is left:",
    },
    {
      kind: "list",
      items: [
        "**Money** — input tokens are billed on every request, and a wasteful prompt multiplies by traffic volume.",
        "**Latency** — a long input takes longer to process before the first output token appears, which is the part users perceive.",
        "**Accuracy** — relevant material competes with irrelevant material for the model's attention, so padding a prompt with marginally-related context can lower answer quality outright.",
      ],
    },
    {
      kind: "prose",
      md: "That third cost is the one exam items probe, because it inverts the intuition that more context is safer. A precise, small context reliably beats a large, diluted one.",
    },

    { kind: "heading", text: "Budget by component" },
    {
      kind: "prose",
      md: "Treat the window like a capacity plan. Account for each contributor, know what makes it grow, and have a named lever for each.",
    },
    {
      kind: "table",
      caption: "Where the tokens go",
      headers: ["Component", "Grows with", "Lever"],
      rows: [
        [
          "System prompt and tool definitions",
          "Number of tools exposed and length of the rule set",
          "Expose only the tools the task needs; move rare ones behind on-demand discovery",
        ],
        [
          "Conversation history",
          "Session length — the usual cause of cost drifting upward over a session",
          "Compact older turns into a running summary; keep the decisions, drop the transcript",
        ],
        [
          "Retrieved context",
          "Chunk size multiplied by how many chunks you pass",
          "Re-rank and pass fewer, better chunks rather than a larger top-k",
        ],
        [
          "Tool results",
          "The verbosity of whatever API answered",
          "Project the fields you need before the result enters the transcript",
        ],
        [
          "Reserved output",
          "The format and verbosity you asked for",
          "Cap maximum output and specify the contracted shape only",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Output tokens deserve separate attention. They are generated serially, so they dominate wall-clock latency in a way input tokens do not, and on current models they are billed at a higher rate than input. \"Answer in at most three sentences\" is frequently a larger latency win than trimming a thousand tokens of input.",
    },

    { kind: "heading", text: "Placement, measurement and the long-conversation problem" },
    {
      kind: "prose",
      md: "Arrangement within the window matters. With a long document in context, putting the instruction and the question *after* the material helps the model act on what it just read, and it composes neatly with caching: the static document sits in the stable prefix while the varying question sits at the end. Structure long context with explicit delimiters so the model can tell one source from another.\n\nMeasure rather than estimate. Token count is not word count — subword tokenization means code, JSON, tables and non-English text pack far more tokens per character than English prose, so a word-based estimate under-counts exactly the payloads most likely to overflow. Count tokens with a real tokenizer before sending, and log input and output token counts per request so a creeping prompt shows up as a trend rather than as an incident.\n\nFor conversational systems the dominant growth term is history. Each turn appends the user message, the assistant response, and every tool call and result in between. The standard remedy is **compaction**: periodically replace older turns with a structured summary that preserves the durable facts and decisions and discards the exchange itself. Anything the user might refer back to — identifiers, choices, constraints — is pinned; the rest is recoverable from logs if anyone ever needs it.",
    },

    {
      kind: "example",
      title: "Practical example: an assistant that gets slower as you use it",
      scenario:
        "An internal research assistant is fast and cheap for the first few exchanges. By the twentieth turn, responses take several seconds to begin, per-request cost is roughly six times the opening turn, and users report it answering questions they asked ten minutes ago instead of the current one. The model, prompt template and retrieval configuration have not changed.",
      walkthrough:
        "1. **Instrument before guessing.** Log input tokens by component per request. History and tool results account for most of the growth; the system prompt and retrieved chunks are flat.\n2. **Read the quality symptom correctly.** Answering a stale question is dilution, not a model defect: the current question is one short paragraph competing with twenty turns of related text.\n3. **Compact.** After a threshold, summarize older turns into a structured block — the research question, the sources accepted, the conclusions reached — and drop the raw exchange.\n4. **Trim tool results at the source.** The search tool was returning full documents into the transcript. Project it to title, identifier and the matched passage.\n5. **Move the question last.** The user's current turn now sits at the end of the window, after the reference material rather than buried ahead of it.",
      takeaway:
        "Cost, latency and the stale-answer complaint had one shared cause, and moving to a larger context window would have fixed none of them. It would have let the session grow further before failing, while making every request slower and more expensive on the way.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Move to a model with a larger context window* is offered whenever a scenario mentions truncation, cost drift or a long session. It is the right answer only when a single irreducible input genuinely does not fit. When the scenario shows growth over time or degraded answer quality, the keyed option manages what goes in.",
    },

    { kind: "practice", questionId: "D2-q405" },
  ],

  keyTerms: [
    {
      term: "Context window",
      definition:
        "The maximum combined size of input and reserved output for a single request. A shared budget across system prompt, tools, history, retrieved material and response.",
    },
    {
      term: "Compaction",
      definition:
        "Replacing older conversation turns with a structured summary that preserves durable facts and decisions, so history stops growing linearly with session length.",
    },
    {
      term: "Context dilution",
      definition:
        "The drop in answer quality that occurs when relevant material competes with a large volume of irrelevant material in the same window.",
    },
    {
      term: "Token accounting",
      definition:
        "Measuring input and output tokens per component and per request, rather than estimating from word counts, which understate dense payloads such as code and JSON.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A larger context window removes the need to manage context.",
      why: "Cost and latency scale with the tokens actually sent rather than with the size of the ceiling, and answer quality degrades when the relevant passage is surrounded by material that is merely related.",
      instead:
        "Treat window size as headroom for irreducible inputs, and keep selecting the smallest context that answers the question.",
    },
    {
      id: "t2",
      trap: "Word count is a close enough proxy for token count when budgeting a prompt.",
      why: "Subword tokenization packs code, JSON, tables and non-English text far more densely than English prose, so word-based estimates under-count precisely the payloads most likely to overflow the window.",
      instead:
        "Count tokens with a real tokenizer before sending, and log actual token usage per request.",
    },
    {
      id: "t3",
      trap: "Output tokens are a minor contributor to cost and latency next to a long input.",
      why: "Output is generated one token at a time and therefore dominates wall-clock time, and it is billed at a higher rate than input, so an unbounded response is expensive twice over.",
      instead:
        "Cap maximum output, request the contracted shape only, and keep reasoning out of the returned payload.",
    },
    {
      id: "t4",
      trap: "Summarizing history loses information, so retaining the full transcript is the safe choice.",
      why: "Keeping everything substitutes an uncontrolled loss for a controlled one: attention to any individual early fact falls as the transcript grows, and the session eventually fails on the window entirely.",
      instead:
        "Compact deliberately — pin identifiers, decisions and constraints in a structured summary and discard the raw exchange.",
    },
  ],

  practiceQuestionIds: ["D2-q405", "D2-q401"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 2",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["2.5", "3.8", "4.5"],
} satisfies Lesson;
