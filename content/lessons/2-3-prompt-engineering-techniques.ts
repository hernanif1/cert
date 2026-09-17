import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "2.3",
  slug: "2-3-prompt-engineering-techniques",
  domain: 2,
  objective:
    "Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought)",
  title: "Prompt Engineering Techniques",
  summary:
    "Zero-shot, few-shot and chain-of-thought are not a ladder you climb; they are three answers to three different failure modes. The exam gives you a symptom and expects you to name the technique that addresses it — and to recognize the cases where no prompting technique will help at all.",

  body: [
    {
      kind: "prose",
      md: "Every technique in this objective costs tokens, and tokens cost money and latency on every single request forever. So the discipline is diagnostic: identify what the model is actually getting wrong, then apply the cheapest technique that addresses that specific defect.",
    },
    {
      kind: "list",
      items: [
        "**Zero-shot** — a clear instruction, the necessary context, and an explicit output contract, with no examples. The default. It is the cheapest option and it is sufficient far more often than practitioners expect.",
        "**Few-shot** — a small set of input/output pairs demonstrating the task. Use it when the task is easier to *show* than to describe: a house style, an unusual label taxonomy, a nonstandard output shape, or a judgment call at the boundary between two categories.",
        "**Chain-of-thought** — instructing the model to work through intermediate steps before committing to an answer. Use it when the errors are reasoning errors: the model knows the facts and skips a step.",
      ],
    },

    { kind: "heading", text: "Matching the technique to the failure" },
    {
      kind: "table",
      caption: "Diagnose first, then pick",
      headers: ["Symptom", "Technique", "Why that one"],
      rows: [
        [
          "Output shape drifts between requests despite a described format",
          "Few-shot, three to five examples in the exact target shape",
          "A structure is conveyed more precisely by demonstration than by description",
        ],
        [
          "Correct on one-step cases, wrong on multi-step ones",
          "Chain-of-thought, reasoning before the answer",
          "The failure is a skipped step, and making steps explicit is what prevents skipping",
        ],
        [
          "Two adjacent categories are labeled inconsistently",
          "Few-shot chosen at the decision boundary, including near-misses",
          "Examples define a boundary that a written definition leaves ambiguous",
        ],
        [
          "Fluent, confident and factually wrong about your domain",
          "Retrieval — not a prompting change",
          "No arrangement of the prompt supplies knowledge the model does not have",
        ],
        [
          "Answers a related question rather than the one asked",
          "Tighter task framing and an explicit output contract",
          "The instruction, not the reasoning, is underspecified",
        ],
        [
          "One prompt doing classification, extraction and drafting at once",
          "Prompt chaining — split into sequential calls",
          "Each stage becomes separately testable and separately fixable",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Few-shot examples are training data for a single request, and they carry every weakness of training data. If four of five examples are the same class, the model will over-predict that class. If all of them are easy cases, they teach nothing about the boundary where the model is actually failing. Pick examples the way you would pick an evaluation set: balanced across classes, drawn from real traffic, and weighted toward the cases that are genuinely hard.\n\nBecause examples are sent on every request, they are the classic candidate for prompt caching — a fixed block of examples placed ahead of the varying user content can be reused rather than re-processed.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Chain-of-thought trades **latency and output tokens for accuracy on multi-step problems**. That trade is excellent on a complex calculation or a policy determination with several conditions, and it is a pure loss on a sentiment label. Where a model supports allocating extra reasoning effort before responding, that is the same trade offered as a dial instead of as prompt text.",
    },
    {
      kind: "prose",
      md: "One operational detail matters more than it looks: keep the reasoning out of the payload. Ask for the working in a delimited section and the final answer in the contracted shape, then parse only the answer. A downstream consumer that receives three paragraphs of deliberation wrapped around a JSON object will break, and the fix belongs in the prompt rather than in a fragile regular expression.",
    },

    {
      kind: "example",
      title: "Practical example: extracting terms from supplier contracts",
      scenario:
        "A pipeline extracts eight fields from supplier contracts. Zero-shot performance is strong on seven fields. The eighth — termination notice period — is wrong about a quarter of the time, always on contracts where notice is expressed as a clause referencing another clause rather than as a plain number of days. The team's proposal is to add fifty examples and move to the most capable model.",
      walkthrough:
        "1. **Localize the failure.** Seven fields are fine on the same documents with the same prompt, so this is not a context or model-capability problem. It is specific to one field with a specific structure.\n2. **Name the defect.** The model resolves the reference to the wrong clause. That is a skipped reasoning step, not a formatting problem, so examples alone would mostly teach a shape that is already correct.\n3. **Apply chain-of-thought to that field only.** Instruct the model to first quote the clause, then quote any clause it references, then state the resulting period — in a delimited working section that is discarded after parsing.\n4. **Add a small, targeted example set.** Four examples, all of them cross-referencing contracts, since that is the boundary the model is failing on. Fifty generic examples would have added tokens without touching the defect.\n5. **Cache and measure.** Examples and instructions sit ahead of the contract text so the prefix stays reusable, and the change is scored against the held-out set before rollout.",
      takeaway:
        "The winning move was diagnosing the defect as reasoning rather than format. The default instinct — more examples, bigger model — would have raised cost on every request and left a quarter of the cross-referencing contracts still wrong.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add more few-shot examples* is the most over-offered distractor in this objective, because it sounds like effort. Examples fix form and boundaries. They do not fix missing knowledge, and they do not fix skipped reasoning.",
    },

    { kind: "practice", questionId: "D2-q301" },
  ],

  keyTerms: [
    {
      term: "Zero-shot prompting",
      definition:
        "Instructing the model with no worked examples, relying on a clear task description and output contract. The cheapest option and the correct default.",
    },
    {
      term: "Few-shot prompting",
      definition:
        "Supplying a small number of input/output pairs that demonstrate the task. Most valuable for conveying format, house style and the boundary between adjacent categories.",
    },
    {
      term: "Chain-of-thought",
      definition:
        "Instructing the model to produce intermediate reasoning before its final answer, which reduces skipped-step errors on multi-step problems at the cost of latency and output tokens.",
    },
    {
      term: "Prompt chaining",
      definition:
        "Splitting a prompt that performs several jobs into sequential calls, so each stage can be evaluated, cached and fixed independently.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "More few-shot examples reliably means better accuracy.",
      why: "Returns flatten after a handful of well-chosen examples, and additional ones mostly buy tokens and latency while any class imbalance among them actively biases the model's predictions.",
      instead:
        "Use a small balanced set drawn from the cases the model is actually getting wrong, and measure whether each addition helps.",
    },
    {
      id: "t2",
      trap: "Chain-of-thought improves accuracy on any task, so it is a safe default.",
      why: "On lookups and simple classification it adds latency and output cost for no gain, and the extra generated text gives the model room to construct an elaborate justification for a wrong answer.",
      instead:
        "Reserve it for problems whose errors come from skipped intermediate steps, and verify the gain on your evaluation set.",
    },
    {
      id: "t3",
      trap: "Few-shot examples will fix a model that states incorrect facts about your domain.",
      why: "Examples demonstrate form and decision boundaries rather than content, so a model lacking the underlying knowledge will imitate the demonstrated shape perfectly and fill it with fabricated values.",
      instead:
        "Treat factual errors as a retrieval problem: supply the authoritative source in context and require citations.",
    },
    {
      id: "t4",
      trap: "The model's reasoning can be returned to the caller alongside the answer.",
      why: "Downstream consumers parse a contract, and prose wrapped around the payload breaks that contract, so the reasoning that improved accuracy becomes the thing that breaks the pipeline.",
      instead:
        "Have the model reason inside delimiters and emit the final answer in the contracted shape, then parse only that section.",
    },
  ],

  practiceQuestionIds: ["D2-q301", "D2-q305"],

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
  relatedLessons: ["2.5", "4.4"],
} satisfies Lesson;
