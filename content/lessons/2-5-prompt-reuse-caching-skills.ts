import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.5",
  slug: "2-5-prompt-reuse-caching-skills",
  domain: 2,
  objective:
    "Implement prompt reuse strategies (caching, modular prompts, Skills)",
  title: "Prompt Reuse: Caching, Modular Prompts and Skills",
  summary:
    "Three mechanisms reuse prompt work, and they solve different problems: caching reuses computation across requests, modular fragments reuse authored text across surfaces, and Skills reuse a whole procedure across tasks. Ordering is the thread connecting them — everything stable goes before everything that varies.",

  body: [
    {
      kind: "prose",
      md: "Reuse is where prompt engineering meets operations. A prompt that is excellent and re-processed from scratch on every one of two million daily requests is an architecture problem, not a writing problem.",
    },

    { kind: "heading", text: "Prompt caching: a stable prefix, reused" },
    {
      kind: "prose",
      md: "Caching works on the **prefix** of a request. The provider retains the processed state of a leading span of the prompt and reuses it when a later request begins with byte-identical content. Two consequences follow, and between them they explain most caching questions on the exam.\n\nFirst, **order is the whole design**. The cache matches from the start of the prompt forward and stops at the first token that differs. A session identifier, a timestamp or a personalized greeting near the top invalidates everything after it, however large and stable that everything is.\n\nSecond, **identical means identical**. Reformatting a policy document, reordering tool definitions, or regenerating a list in a different order all break the match, so cacheable content should be built deterministically and versioned rather than assembled on the fly.\n\nCaching also has an economics. Establishing an entry costs more than sending those tokens normally and reading it back costs much less, so the benefit is a function of hit rate and a large prefix used once is a net loss. Entries expire and are typically refreshed by use: steady traffic keeps a cache warm, sporadic traffic pays the write cost repeatedly.",
    },
    {
      kind: "code",
      lang: "text",
      code: `stable prefix — reused across every request
  1. system prompt (role, rules, output contract)
  2. tool definitions
  3. large static reference material
  4. few-shot examples
  --- end of the reusable prefix ---
varies per request — never above this line
  5. retrieved chunks for this query
  6. conversation history
  7. the user's current message`,
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Caching does **not** shrink the request. You still send every token; the provider skips re-processing the part it has already seen. The win is in latency and billed cost on a hit — never in payload size, and never in how much of the context window you consume.",
    },

    { kind: "heading", text: "Modular prompts and Skills" },
    {
      kind: "prose",
      md: "**Modular prompts** solve a different problem: the same rules must hold across a web assistant, a batch pipeline and an internal tool, and today they are three copies drifting apart. Compose each prompt from named fragments — a shared tone block, a shared safety block, a per-surface task block — in a fixed order that keeps the invariant fragments first so the prefix stays cacheable. The cost is coupling: editing one shared fragment changes every consumer instantly, with no build step to catch it, which makes fragments production configuration rather than content.\n\n**Skills** package a capability rather than a paragraph: instructions for performing a particular kind of work, bundled with whatever supporting files or scripts that work needs. The model sees a short name and description at all times and loads the full body only when a task matches. That is progressive disclosure applied to instructions — an arbitrarily detailed procedure available without being paid for on requests that do not need it, which is precisely what a system prompt cannot do.",
    },
    {
      kind: "table",
      caption: "Three mechanisms, three problems",
      headers: ["Mechanism", "What it reuses", "Best when", "Main failure mode"],
      rows: [
        [
          "Prompt caching",
          "Processed computation over a stable prefix, across requests",
          "A large identical prefix on steady, high-volume traffic",
          "Anything variable placed above it silently drops the hit rate to zero",
        ],
        [
          "Modular prompt fragments",
          "Authored text, across surfaces and teams",
          "Several applications must share rules that have to stay in step",
          "An unreviewed fragment edit changes every consumer at once",
        ],
        [
          "Skills",
          "An entire procedure plus its supporting files, across tasks",
          "Repeated multi-step work with its own conventions and artifacts",
          "Overlapping or vaguely described skills load when they are not relevant",
        ],
      ],
    },

    {
      kind: "example",
      title: "Practical example: the header that cost a quarter of a million dollars",
      scenario:
        "A document-analysis product caches a 30,000-token instruction and policy prefix, with a reported hit rate above 90%. After a release, cost per request roughly triples and time-to-first-token doubles. The release notes mention one prompt change: a line at the top of the system prompt reading \"Current date and time: ...\" added so the assistant could reason about deadlines.",
      walkthrough:
        "1. **Check the cache metric, not the model.** Hit rate is near zero. Nothing about the model, the documents or the traffic changed.\n2. **Find the first varying token.** The timestamp line is now the first content in the request, and it differs on every call, so no subsequent token can match a stored prefix.\n3. **Move it, do not remove it.** The assistant genuinely needs the current time. It moves to the end of the prompt, alongside the user's message, below the cache boundary.\n4. **Reduce its resolution.** Second-level precision was never required. Rounding to the day would have made the line stable for most of a day even at the top — a useful instinct when a value must sit in the prefix.\n5. **Guard it.** A test now asserts that the constructed prefix for a fixed input is byte-identical across two builds, so the next well-meaning insertion fails in CI rather than in the invoice.",
      takeaway:
        "Nothing was wrong with the content of the prompt, only with where one line sat. Cache design is prompt layout, and a single dynamic value above the boundary is enough to invalidate everything below it.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When an item mentions caching, watch for options that claim it reduces tokens sent, extends the context window, or applies to repeated content anywhere in the prompt. All three are wrong for the same reason: caching matches a prefix and changes processing, not payload.",
    },

    { kind: "practice", questionId: "D2-q502" },
  ],

  keyTerms: [
    {
      term: "Stable prefix",
      definition:
        "The leading span of a prompt that is byte-identical across requests. Everything cacheable must live here, and nothing variable may be placed above it.",
    },
    {
      term: "Cache hit rate",
      definition:
        "The share of requests that reuse a stored prefix. Because establishing an entry costs more than a normal send, the economics of caching are entirely determined by this number.",
    },
    {
      term: "Prompt fragment",
      definition:
        "A named, versioned block of prompt text composed into several prompts. Shared fragments are production configuration and need review and evaluation before change.",
    },
    {
      term: "Skill",
      definition:
        "A packaged capability — instructions plus any supporting files — that the model discovers by name and description and loads in full only when a task matches it.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Prompt caching reduces the number of tokens you have to send.",
      why: "The full request still travels on every call and still occupies the same share of the context window; caching changes how the leading span is processed and billed on a hit, nothing else.",
      instead:
        "Expect caching to buy latency and cost on repeated prefixes, and use retrieval or compaction when the goal is to send less.",
    },
    {
      id: "t2",
      trap: "Any content repeated across requests benefits from caching.",
      why: "Only a span that begins at the very start of the prompt and is identical to a stored entry can be reused, so repeated material sitting after variable content is re-processed every time.",
      instead:
        "Reorganize the prompt so every repeated block sits contiguously at the front, ahead of anything per-request.",
    },
    {
      id: "t3",
      trap: "Putting the user's question first reads better, and the static document after it is still cacheable.",
      why: "Matching proceeds from the first token and stops at the first difference, so a varying opening segment makes every token that follows it unreusable regardless of how stable those tokens are.",
      instead:
        "Keep the fixed layout: system prompt, tools, static material, examples, then the variable content last.",
    },
    {
      id: "t4",
      trap: "A Skill is essentially a longer system prompt with a name attached.",
      why: "A Skill's body is loaded only when its description matches the task at hand, so detailed procedures cost nothing on unrelated requests, whereas every word of a system prompt is paid for on every single call.",
      instead:
        "Keep universal rules in the system prompt and package task-specific procedures as Skills the model can pull in on demand.",
    },
    {
      id: "t5",
      trap: "Shared prompt fragments are content, so they can be edited without a release process.",
      why: "Every surface composing a fragment inherits the edit immediately and with no build step in between, which makes an unreviewed change to shared prompt text a simultaneous production change everywhere.",
      instead:
        "Version fragments, review them like code, and run the evaluation suite for each consuming surface before rollout.",
    },
  ],

  practiceQuestionIds: ["D2-q502", "D2-q501"],

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
  relatedLessons: ["2.4", "3.8"],
} satisfies Lesson;
