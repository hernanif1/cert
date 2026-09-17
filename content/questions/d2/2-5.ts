import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D2-q501",
    domain: 2,
    objective: "2.5",
    stem: "An application sends the same 8,000-token system prompt and policy document on every request, followed by a short, varying user message. Latency and cost are both concerns. Which optimization most directly addresses both?",
    choices: [
      {
        id: "A",
        text: "Truncate the policy document to the first 1,000 tokens.",
        rationale:
          "This trades away policy the system needs to behave correctly. It cuts cost by discarding required context, which is a correctness regression, not an optimization.",
      },
      {
        id: "B",
        text: "Switch to the smallest available model regardless of task fit.",
        rationale:
          "Downsizing without regard to task fit risks output quality. Model selection is a real lever, but 'regardless of fit' is what makes this wrong.",
      },
      {
        id: "C",
        text: "Place the static system prompt and policy before the dynamic content and enable prompt caching.",
      },
      {
        id: "D",
        text: "Move the policy document into a few-shot example block.",
        rationale:
          "Relocating the same tokens into examples does not create a stable, reusable prefix, so nothing becomes cacheable and neither cost nor latency improves.",
      },
    ],
    explanation:
      "Ordering stable content first and enabling prompt caching lets the repeated prefix be reused across requests, reducing both time-to-first-token and per-request cost without discarding any required context. The key requirement is that the cacheable content is identical and comes before anything that varies.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["prompt-caching", "cost", "latency"],
    sourceRef: "exam-guide §8 Sample 2",
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D2-q502",
    domain: 2,
    objective: "2.5",
    stem: "A document-analysis product caches a 30,000-token instruction and policy prefix and has reported a cache hit rate above 90% for months. After a release, cost per request roughly triples and time-to-first-token doubles. The only prompt change in that release was a line reading \"Current date and time: ...\" inserted at the very top of the system prompt. What happened?",
    choices: [
      {
        id: "A",
        text: "The extra line pushed the prompt past a size threshold, disabling caching for the request.",
        rationale:
          "A single short line does not cross any meaningful size boundary, and caching is not switched off by prompt length in the way this implies.",
      },
      {
        id: "B",
        text: "Timestamps cannot be cached, so the provider now bypasses caching for the entire request.",
        rationale:
          "There is no content-type rule that exempts timestamps. Any text can sit in a cached prefix as long as it is identical from one request to the next.",
      },
      {
        id: "C",
        text: "The prefix is still being reused, so the regression must come from something else in the release.",
        rationale:
          "It dismisses the one change that is sufficient to explain both symptoms, and the cache hit rate metric would immediately contradict it.",
      },
      {
        id: "D",
        text: "Every request now begins with a different token, so no stored prefix can match; moving the timestamp below the cacheable content restores the hit rate.",
      },
    ],
    explanation:
      "Caching matches from the first token of the prompt forward and stops at the first difference. A value that changes on every call, placed at the very top, makes the entire 30,000-token prefix beneath it unreusable. The fix is positional: the timestamp moves below the cache boundary, next to the other per-request content.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["prompt-caching", "prompt-ordering"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D2-q503",
    domain: 2,
    objective: "2.5",
    stem: "An internal tool sends a 2,000-token system prompt, then a 60,000-token contract that is different on every request, then the user's question. The team enables prompt caching and sees almost no change in cost or latency. Why?",
    choices: [
      {
        id: "A",
        text: "Only the 2,000-token system prompt is identical across requests, so that is all that can be reused; the 60,000 varying tokens are re-processed every time.",
      },
      {
        id: "B",
        text: "Caching applies to the largest block in the request, and the contract is too variable to be stored.",
        rationale:
          "Caching has nothing to do with which block is largest. It applies to a prefix, and a prefix qualifies by being identical rather than by being big.",
      },
      {
        id: "C",
        text: "The contract should be moved above the system prompt so the bulk of the request is cached first.",
        rationale:
          "Putting the varying content first would make even the system prompt uncacheable, turning a small win into no win at all.",
      },
      {
        id: "D",
        text: "Caching only takes effect when the same user sends consecutive requests.",
        rationale:
          "Reuse depends on the content of the prefix, not on who sent the previous request or how recently.",
      },
    ],
    explanation:
      "Caching reuses processing over a prefix that is byte-identical across requests, and here that prefix ends where the contract begins. When the bulk of the payload genuinely varies, caching has almost nothing to work with, and the right levers are retrieval or summarization to stop sending 60,000 tokens in the first place.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["prompt-caching", "stable-prefix"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q504",
    domain: 2,
    objective: "2.5",
    stem: "An organization runs four Claude-based surfaces that are supposed to share the same tone and escalation rules. Today those rules exist as four copies that have drifted apart, and a team proposes replacing them with a shared prompt-fragment library. Which TWO controls should accompany that change? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Version the fragments and require review before any change, since every consuming surface inherits an edit immediately with no build step in between.",
      },
      {
        id: "B",
        text: "Run each surface's evaluation suite against a proposed fragment change before it is rolled out.",
      },
      {
        id: "C",
        text: "Give each surface its own editable copy of the fragments so teams are not blocked on each other.",
        rationale:
          "That is exactly the arrangement that produced four diverging copies, so it reintroduces the problem the library is meant to solve.",
      },
      {
        id: "D",
        text: "Place each surface's task-specific fragment first so every prompt opens with its most specific content.",
        rationale:
          "Putting the per-surface fragment ahead of the shared ones destroys the stable prefix, so nothing below it can be reused across requests.",
      },
      {
        id: "E",
        text: "Merge the fragments into a single monolithic prompt so composition order cannot drift.",
        rationale:
          "A monolith removes the reuse that motivated the library and forces every surface to carry rules that do not apply to it.",
      },
    ],
    explanation:
      "A shared fragment is production configuration: editing one is a simultaneous behavior change across every surface that composes it, with no compiler or deploy gate to catch a mistake. Versioning with review gives the change a controlled path, and running each consumer's evaluation suite is what detects a regression on a surface the author was not thinking about.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["modular-prompts", "governance"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D2-q505",
    domain: 2,
    objective: "2.5",
    stem: "A team maintains a 9,000-token system prompt containing six detailed procedures — incident triage, release checklist, data migration and three others. Any given request uses at most one of them. The team wants all six to stay available without paying for all six on every call. What should they do?",
    choices: [
      {
        id: "A",
        text: "Enable prompt caching so the six procedures are reused across requests.",
        rationale:
          "Caching lowers the cost of re-processing a repeated prefix, but all six procedures still occupy the window on every request and still compete for attention with the one that matters.",
      },
      {
        id: "B",
        text: "Split the prompt into six variants and ask the user to choose one at the start of each session.",
        rationale:
          "It pushes a routing decision onto the user, fails when a session needs two procedures, and creates six prompts to keep in step with each other.",
      },
      {
        id: "C",
        text: "Package each procedure as a Skill, so its name and description are always visible and its full body loads only when a task matches.",
      },
      {
        id: "D",
        text: "Move the procedures into few-shot example blocks, which the model consults only when they are relevant.",
        rationale:
          "Examples are ordinary prompt content sent on every request; nothing about the block makes them conditional or cheaper when unused.",
      },
    ],
    explanation:
      "Skills apply progressive disclosure to instructions: a short description stays resident so the model knows the capability exists, and the detailed body is loaded only when a task matches. That is precisely the property a system prompt cannot have, since every word of it is paid for on every request regardless of relevance.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["skills", "progressive-disclosure", "context"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
