import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.4",
  slug: "4-4-diagnosing-system-issues",
  domain: 4,
  objective:
    "Diagnose system issues (prompt failure, hallucinations, model mismatch)",
  title: "Diagnosing System Issues",
  summary:
    "\"The model is wrong\" is a symptom, not a diagnosis. An architect isolates the failing layer — prompt, context, model, or tool — with a discriminating experiment before changing anything, because each layer has a different fix and the wrong fix leaves the defect in place.",

  body: [
    {
      kind: "prose",
      md: "An LLM system fails in layers, and the layers produce symptoms that look identical from the outside: a fluent, confident, wrong answer. Diagnosis is the work of deciding which layer produced it. Guessing is expensive, because every layer has a plausible-sounding remedy and applying the wrong one adds complexity while the defect survives.\n\nTwo habits do most of the work before any theory is formed. **Correlate with change**: if the system was fine on Tuesday and wrong on Wednesday, the diff between them is the shortest path to the cause — a re-index, a prompt edit, a model version pin that was loosened, an upstream schema change. **Reproduce by replay**: pin the model snapshot, prompt version, tool definitions and retrieval index build, then replay the captured request N times and read the *rendered* prompt rather than the template. Identical output is never guaranteed even where sampling controls exist, and on the current model family they are not available at all, so the unit of reproduction is a failure rate rather than a single run. Truncation, a variable that resolved empty, and a tool result that arrived malformed are all invisible in the template and obvious in what was actually sent.",
    },

    { kind: "heading", text: "Reading the signature" },
    {
      kind: "table",
      caption: "Each failure class leaves a distinct pattern across inputs",
      headers: ["Class", "Signature across the eval set", "Discriminating test", "Fix lives in"],
      rows: [
        [
          "Prompt failure",
          "The same instruction is violated on nearly every input, regardless of difficulty",
          "Simplify or reorder the instruction and re-run the same cases",
          "Prompt structure, examples, output contract",
        ],
        [
          "Hallucination",
          "Errors are specific fabricated details; the rest of the answer is sound",
          "Check whether the asserted fact appears anywhere in the supplied context",
          "Grounding: citations, a refusal path, a verification pass",
        ],
        [
          "Model mismatch",
          "Errors concentrate on the most complex cases and survive prompt rewrites",
          "Hold everything constant and run a more capable model",
          "Model choice, or decomposition into smaller steps",
        ],
        [
          "Retrieval failure",
          "Answers are faithful to their context, but the context is the wrong document",
          "Inject known-good context directly, bypassing retrieval",
          "Chunking, index metadata, ranking",
        ],
        [
          "Tool or integration failure",
          "Failures cluster on inputs that trigger one tool, often with malformed arguments",
          "Replay the tool call in isolation against its schema",
          "Tool description, schema, error handling",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "The discriminating test is always *change one layer and hold the rest fixed*. Swapping the model while the prompt and context stay identical separates model mismatch from prompt failure. Feeding the golden document straight into the prompt separates retrieval failure from everything downstream of it. Without such a test, a diagnosis is a preference.",
    },
    {
      kind: "prose",
      md: "**Hallucination is not one thing.** A model may assert something absent from any source, contradict a source it was given, or over-extend a source into a conclusion it does not support. Only the second is detectable by comparing output against context, which is why groundedness checks catch some hallucinations and not others. The structural remedies are the same in each case: give the model a legitimate path to declining, require claims to cite the span that supports them, and verify high-stakes claims in a second pass rather than hoping the first pass is honest.\n\n**Model mismatch is diagnosed by a distribution, not by a bad output.** If failures scatter uniformly across easy and hard cases, the model is probably not the constraint. If they concentrate on the cases that require several chained inferences, survive three genuine prompt rewrites, and vanish when the same prompt runs on a more capable model, the task is asking for capability the chosen model does not have. Decomposing the task into smaller steps is often the cheaper answer to the same finding.",
    },
    {
      kind: "example",
      title: "Practical example: an assistant that invents policy numbers",
      scenario:
        "An internal assistant answers benefits questions. Support reports that it sometimes cites policy document numbers that do not exist. The team's proposed fix is to add \"Do not make up information\" to the system prompt and to resend any answer a user complains about.",
      walkthrough:
        "1. **Reproduce.** Fifteen failing conversations are replayed ten times each against the pinned snapshot, prompt version and index build, using the exact rendered prompts. Twelve fabricate on most replays, so this is a rate, not a one-off.\n2. **Check the context.** In eleven of the twelve, no policy number appears anywhere in the retrieved context. The model was asked a question its context could not answer and had no sanctioned way to say so.\n3. **Rule out model mismatch.** The same twelve cases run on a more capable model with identical prompt and context. Ten still fabricate, so capability is not the constraint.\n4. **Fix the structure, not the wording.** The output contract now requires a quoted supporting span for every cited number, an explicit no-answer branch is added and shown in the examples, and a cheap post-check rejects any citation whose number is absent from context.\n5. **Lock it in.** All twelve cases join the regression suite.",
      takeaway:
        "Wording and resampling control variability, not truthfulness, and an instruction not to hallucinate gives the model no mechanism to comply. Fabrication under insufficient context is fixed by structure: citations, a refusal path, and verification.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Watch for options that stack instructions onto the prompt — *tell it to be accurate*, *tell it to double-check*. They are attractive because they are cheap, and they are keyed wrong whenever the stem shows the model lacked the information to answer at all. No wording can recover a fact that never reached the context window.",
    },

    { kind: "practice", questionId: "D4-q401" },
  ],

  keyTerms: [
    {
      term: "Rendered prompt",
      definition:
        "The exact text sent to the model after templating, retrieval insertion and truncation. Debugging from the template instead hides empty variables and silent truncation.",
    },
    {
      term: "Discriminating test",
      definition:
        "An experiment that changes exactly one layer while holding the others fixed, so its result rules a hypothesis in or out rather than merely being consistent with it.",
    },
    {
      term: "Model mismatch",
      definition:
        "A task demanding more reasoning or instruction-following than the selected model provides. Recognized by failures concentrating on complex cases and persisting across prompt rewrites.",
    },
    {
      term: "Refusal path",
      definition:
        "An explicit, demonstrated option for the model to report that the context does not contain the answer. Without one, insufficient context reliably produces fabrication.",
    },
    {
      term: "Change correlation",
      definition:
        "Anchoring diagnosis to what changed between a known-good and a known-bad point in time, before reasoning about mechanism.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Hallucinations are reduced by adding an instruction such as \"only state facts you are certain of\".",
      why: "The model has no reliable internal signal of certainty to act on, and when the answer is simply absent from its context no instruction can conjure it, so the wording changes tone rather than behavior.",
      instead:
        "Give it a sanctioned no-answer branch, require citations to supplied spans, and verify high-stakes claims separately.",
    },
    {
      id: "t2",
      trap: "Pinning a sampling parameter makes a failing case reproducible, so one clean replay clears the ticket.",
      why: "Identical output is not guaranteed even where such controls exist, the current model family rejects them outright, and a fabricated detail that is the most probable continuation under thin context would survive greedy decoding anyway.",
      instead:
        "Pin the model snapshot, prompt version, tool definitions and index build, replay the captured request N times, and compare failure rates before and after a fix.",
    },
    {
      id: "t3",
      trap: "A wrong answer that a stronger model gets right proves the original model was the problem.",
      why: "One case proves nothing about the distribution, and a stronger model can compensate for a badly structured prompt or thin context, which masks a cheaper fix behind a permanently higher bill.",
      instead:
        "Compare failure rates across difficulty strata on the full eval set before concluding the model is the constraint.",
    },
    {
      id: "t4",
      trap: "Debugging from the prompt template is equivalent to debugging from what the model received.",
      why: "The template hides everything that happens at assembly time — variables resolving empty, retrieved chunks landing in the wrong order, and middle-of-context truncation that silently drops the instruction being violated.",
      instead:
        "Log and inspect the fully rendered request, including token counts, for every failing case.",
    },
    {
      id: "t5",
      trap: "Grounded output can be verified by asking the model to rate its own confidence in the answer.",
      why: "Self-reported confidence correlates poorly with correctness and is generated by the same process that produced the error, so it tends to be high precisely on fluent fabrications.",
      instead:
        "Verify against the source text with a separate check rather than asking the generator to grade itself.",
    },
  ],

  practiceQuestionIds: ["D4-q401", "D4-q403"],

  sources: [
    {
      label: "CCAR-P Exam Guide §8, sample item 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["4.2", "3.5"],
} satisfies Lesson;
