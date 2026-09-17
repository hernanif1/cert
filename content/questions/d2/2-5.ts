import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D2-q001",
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
] satisfies Question[];
