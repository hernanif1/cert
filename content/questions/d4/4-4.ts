import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q401",
    domain: 4,
    objective: "4.4",
    stem: "A RAG system suddenly returns confident but incorrect answers after a document refresh, while latency and model version are unchanged. What is the most likely first place to investigate?",
    choices: [
      {
        id: "A",
        text: "The model weights have silently changed.",
        rationale:
          "The model version is stated as unchanged, and a document refresh is not a mechanism by which weights would change.",
      },
      {
        id: "B",
        text: "The retrieval/indexing step is returning irrelevant or stale chunks.",
      },
      {
        id: "C",
        text: "The temperature setting is too low.",
        rationale:
          "Temperature affects variability, not factual grounding, and nothing in a document refresh would alter it.",
      },
      {
        id: "D",
        text: "The context window has shrunk.",
        rationale:
          "A shrinking context window would typically show up as truncation or latency changes, and it is not something a document refresh triggers.",
      },
    ],
    explanation:
      "Confident-but-wrong answers immediately following a document refresh, with model and latency unchanged, point to the retrieval layer feeding the model poor context — a broken re-index, mismatched embeddings, or stale chunks. Change-correlated debugging starts with what actually changed.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "debugging", "retrieval"],
    sourceRef: "exam-guide §8 Sample 3",
    type: "single",
    correct: "B",
  },
] satisfies Question[];
