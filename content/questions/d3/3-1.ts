import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q001",
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
] satisfies Question[];
