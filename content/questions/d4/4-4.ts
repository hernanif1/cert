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
          "Sampling parameters are rejected outright on the current model family, so this is not a lever that exists; and even where it did, temperature governs variability rather than factual grounding, and a document refresh would not alter it.",
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
  {
    schemaVersion: 1,
    id: "D4-q402",
    domain: 4,
    objective: "4.4",
    stem: "An agent that plans multi-step data migrations fails on about 30% of tasks. The failures are concentrated almost entirely in tasks requiring four or more dependent steps; one- and two-step tasks nearly always succeed. Three substantial prompt rewrites have not shifted the pattern. Which diagnosis does this evidence support?",
    choices: [
      {
        id: "A",
        text: "Prompt failure — restructure the instruction ordering and add more worked examples.",
        rationale:
          "Three genuine rewrites leaving the difficulty gradient untouched is evidence against the prompt being the binding constraint here.",
      },
      {
        id: "B",
        text: "Hallucination — add citation requirements and a verification pass over the plan.",
        rationale:
          "The failures track task complexity rather than unsupported factual claims, which is not the signature of fabrication.",
      },
      {
        id: "C",
        text: "Retrieval failure — inspect the chunks returned for the failing tasks.",
        rationale:
          "Nothing indicates the agent works from retrieved documents, and retrieval problems do not sort themselves neatly by step count.",
      },
      {
        id: "D",
        text: "Model mismatch — hold the prompt and inputs fixed, re-run the failing tasks on a more capable model, and consider decomposing the task.",
      },
    ],
    explanation:
      "Model mismatch is identified by a distribution, not by a single bad output: failures concentrating on the cases that need several chained inferences and surviving genuine prompt rewrites is the characteristic pattern. The discriminating test holds everything else constant and varies only the model; decomposition into smaller steps is often the cheaper response to the same finding.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["diagnosis", "model-mismatch"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q403",
    domain: 4,
    objective: "4.4",
    stem: "An extraction service returns valid JSON for short documents, but for long documents it silently omits the final two of eight required fields. The prompt template plainly requires all eight. Where should the architect look first?",
    choices: [
      {
        id: "A",
        text: "The fully rendered request for a failing long document, including its token counts, to see whether content was truncated during assembly.",
      },
      {
        id: "B",
        text: "The maximum output token limit, which may be cutting the response short before the last two fields are written.",
        rationale:
          "A response stopped at the output limit would arrive as truncated, unparseable JSON rather than the well-formed object with six fields the service actually returns.",
      },
      {
        id: "C",
        text: "The JSON schema definition, which may be marking the final two fields optional.",
        rationale:
          "An optional field in the schema would not explain why the omission appears only once documents get long.",
      },
      {
        id: "D",
        text: "The model version, which may have changed between the short- and long-document tests.",
        rationale:
          "A version change would affect documents of every length rather than sorting failures by input size.",
      },
    ],
    explanation:
      "A failure that correlates with input length points at prompt assembly rather than at reasoning. The template hides what actually happened; only the rendered request shows truncation, reordered content or an instruction pushed out of the window. Debugging from the template is how length-dependent failures stay mysterious.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["diagnosis", "prompt-failure", "truncation"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q404",
    domain: 4,
    objective: "4.4",
    stem: "A grounded assistant tells a customer the refund window is 45 days. The published policy says 30. The architect pulls the complete request log for that response. Which single check best separates a hallucination from a retrieval failure?",
    choices: [
      {
        id: "A",
        text: "Search the knowledge base for any document that mentions a 45-day refund window.",
        rationale:
          "What sits in the corpus is not what reached the model; a stale document can remain indexed and unretrieved, so its presence cannot say whether the figure came from the context or from the model.",
      },
      {
        id: "B",
        text: "Ask the model how confident it is that 45 days is the correct figure.",
        rationale:
          "Self-reported confidence comes from the same process that produced the error and runs high precisely on fluent fabrications.",
      },
      {
        id: "C",
        text: "Check whether the retrieved context contained a 45-day figure, a 30-day figure, or no refund window at all.",
      },
      {
        id: "D",
        text: "Compare the answer against what the previous model version produced for the same question.",
        rationale:
          "Another model may be right or wrong for unrelated reasons, which does not localize this failure to a specific layer.",
      },
    ],
    explanation:
      "Diagnosis means isolating a layer. If 45 days appears in the retrieved context, retrieval supplied a wrong or stale document and the model was faithful. If only 30 appears, the model contradicted its context. If neither appears, the context was insufficient and the model fabricated rather than declining. Each outcome points at a different fix.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["diagnosis", "hallucination", "retrieval"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q405",
    domain: 4,
    objective: "4.4",
    stem: "A summarization service is required to stay under 150 words and to include every numeric figure from the source. On long financial filings it routinely breaches the word limit; on short ones it complies. The same behavior appears on two different models with the same prompt. What does this most likely indicate?",
    choices: [
      {
        id: "A",
        text: "Model mismatch — the task exceeds what either model is capable of doing reliably.",
        rationale:
          "Identical behavior across two models, with an obvious structural explanation available, points away from capability as the constraint.",
      },
      {
        id: "B",
        text: "Prompt failure — the two requirements conflict as source length grows, and the prompt never says which one takes precedence.",
      },
      {
        id: "C",
        text: "Hallucination — the model is inventing content in order to fill out the summary.",
        rationale:
          "Exceeding a length limit while faithfully including required figures is an instruction conflict, not the assertion of unsupported facts.",
      },
      {
        id: "D",
        text: "A tokenization issue — word counts and token counts do not correspond exactly.",
        rationale:
          "The word-to-token mismatch is real but does not explain compliance on short documents and consistent breach on long ones.",
      },
    ],
    explanation:
      "Two instructions that are individually satisfiable can become mutually unsatisfiable as input scales, and a prompt that states both without a precedence rule leaves the model to pick. The fix is to resolve the conflict explicitly — for example, prioritize the figures and relax or restructure the length constraint — rather than to change models.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["diagnosis", "prompt-failure"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
