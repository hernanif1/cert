import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q301",
    domain: 3,
    objective: "3.3",
    stem: "A conversational assistant must return its first output within 1.5 seconds at p95. The pipeline runs retrieval, then a classification call configured at the highest reasoning effort, then generation. Measured p95 is 4.1 seconds, of which 2.2 seconds is the classification call. Classification assigns one of nine fixed intents, and offline evaluation shows that running it at the highest effort rather than the lowest moves its accuracy from 96.4% to 96.9%. What is the best first change?",
    choices: [
      {
        id: "A",
        text: "Run classification in parallel with generation.",
        rationale:
          "Generation is conditioned on the classified intent, so the two stages cannot overlap without generating before the intent is known.",
      },
      {
        id: "B",
        text: "Keep the effort level and stream the classification stage so the user sees progress.",
        rationale:
          "Intermediate classification output is not useful to the user, and streaming an internal stage does not move the first meaningful token any earlier.",
      },
      {
        id: "C",
        text: "Collapse the pipeline into a single call that classifies and answers at once.",
        rationale:
          "A plausible simplification, but it merges two separately-evaluated concerns and is a far larger change than the measurement justifies as a first step.",
      },
      {
        id: "D",
        text: "Drop the classification stage to the lowest reasoning effort.",
      },
    ],
    explanation:
      "The highest effort setting is buying half a percentage point of accuracy on a nine-way classification and costing 2.2 seconds of a 1.5-second budget. Reasoning depth pays off on derivation, not on assigning one of a small set of known labels, so this is the lever with the best latency return per point of accuracy given up.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["latency", "reasoning-effort", "sla"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q302",
    domain: 3,
    objective: "3.3",
    stem: "A document-summarization service processes 200,000 filings in an overnight batch window running 01:00 to 06:00, currently finishing at 03:40. Product asks whether accuracy can be improved. Engineering objects that the pipeline already averages 3.8 seconds per document and that any additional processing \"will hurt latency\". Which assessment is correct?",
    choices: [
      {
        id: "A",
        text: "Engineering is right; per-document latency is the binding constraint in any high-volume pipeline.",
        rationale:
          "Per-request latency binds when a human is waiting for the result. Here the only deadline is the end of the batch window.",
      },
      {
        id: "B",
        text: "Accuracy work should wait until the batch is parallelized further.",
        rationale:
          "The window currently finishes more than two hours early, so there is headroom to spend before additional parallelism is needed.",
      },
      {
        id: "C",
        text: "Per-document latency matters only through total throughput; the real question is whether the extra processing still fits the window.",
      },
      {
        id: "D",
        text: "Accuracy and latency cannot both be optimized, so product must choose one.",
        rationale:
          "This states the trade-off as absolute when the relevant question is how much of the available latency budget the offline window actually leaves unused.",
      },
    ],
    explanation:
      "Latency budgets come from the interaction mode, not from the model. An asynchronous batch with two hours of slack can absorb accuracy-maximizing configurations that would be unacceptable in a chat turn, so the constraint to reason about is completion before 06:00, not seconds per document.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["latency", "batch", "justification"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q303",
    domain: 3,
    objective: "3.3",
    stem: "A medical-coding assistant suggests billing codes that a certified coder reviews and corrects before submission. The team proposes the highest-capability model, running every call at `effort: max`, and a second verification model call on every suggestion, arguing that billing errors are expensive. Turnaround time has become a complaint. Which critique of this configuration is strongest?",
    choices: [
      {
        id: "A",
        text: "The verification call duplicates review that a certified coder already performs, spending latency and cost on a control the workflow already has.",
      },
      {
        id: "B",
        text: "The maximum effort setting should be dropped because code assignment is a lookup task.",
        rationale:
          "Assigning codes from clinical narrative involves genuine inference, so this dismisses a lever that may well be earning its latency.",
      },
      {
        id: "C",
        text: "Maximum model capability is unjustified because the coder will catch any error the model makes.",
        rationale:
          "A human reviewer is expensive and fallible, so pushing more error onto the reviewer is not obviously the right trade in this workflow.",
      },
      {
        id: "D",
        text: "The configuration is sound, because the cost of a billing error dominates every other consideration.",
        rationale:
          "Error cost justifies spending on accuracy but not spending twice on the same control when a human reviewer is already in the loop.",
      },
    ],
    explanation:
      "Accuracy levers are priced against the whole system, not against the model call alone. A verification pass adds its full duration to every request while guarding an output that a certified reviewer already inspects, so it is the stage whose cost is least defensible once the human step is counted.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["accuracy", "verification", "human-in-the-loop"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q304",
    domain: 3,
    objective: "3.3",
    stem: "A customer-facing chat assistant sends a 9,000-token system prompt of brand guidelines and tool definitions that is byte-identical on every request, and returns each answer as one complete response. Users wait a median of 2.9 seconds before seeing anything; the target is under 1.5. Answer quality is considered good and must not regress. Which two changes most directly reduce the wait?",
    choices: [
      {
        id: "A",
        text: "Enable prompt caching on the stable system prompt and tool definitions.",
      },
      {
        id: "B",
        text: "Reduce the number of retrieved chunks from eight to two.",
        rationale:
          "This cuts input tokens but risks dropping the passage an answer depends on, which is exactly the accuracy trade the scenario rules out.",
      },
      {
        id: "C",
        text: "Stream the response so the user sees output as it is generated.",
      },
      {
        id: "D",
        text: "Switch every request to a smaller model.",
        rationale:
          "A smaller model buys latency by accepting more error, and the scenario states that answer quality must not regress.",
      },
      {
        id: "E",
        text: "Raise the maximum output token limit so responses are not truncated.",
        rationale:
          "The output cap has no effect on how long the first token takes, and truncation is not among the reported symptoms.",
      },
    ],
    explanation:
      "Two levers here are accuracy-neutral. Caching an identical prefix removes most of the input-processing time before generation begins, and streaming moves the moment the user first sees output without changing what is generated. The other options all buy time by giving up quality the scenario protects.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["latency", "caching", "streaming"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D3-q305",
    domain: 3,
    objective: "3.3",
    stem: "A team reports that enabling streaming on their summarization endpoint \"cut latency in half\". The endpoint's only consumer is a downstream service that parses the complete JSON summary before storing it. What actually changed for that consumer?",
    choices: [
      {
        id: "A",
        text: "Total generation time halved because tokens are emitted as they are produced.",
        rationale:
          "Streaming changes how output is delivered, not how fast it is produced; the same tokens are generated at the same rate.",
      },
      {
        id: "B",
        text: "The model produced shorter summaries because streaming imposes an implicit length limit.",
        rationale:
          "Delivery mode places no constraint on output length, so the model generates exactly as much as it would have otherwise.",
      },
      {
        id: "C",
        text: "Latency improved because streamed requests are scheduled ahead of buffered ones.",
        rationale:
          "No such prioritization exists, and whether a response is streamed does not change how the request is scheduled.",
      },
      {
        id: "D",
        text: "The consumer can begin parsing earlier, so end-to-end time fell.",
        rationale:
          "This consumer parses complete JSON, so it cannot act on a partial document and gains nothing from incremental delivery.",
      },
      {
        id: "E",
        text: "Nothing measurable changed; streaming improves perceived latency for a human reader, and this consumer waits for the full response either way.",
      },
    ],
    explanation:
      "Streaming moves when the first token becomes visible but leaves total completion time unchanged. That distinction is invisible to a machine consumer that must have the whole response before it can do anything, so the reported improvement is a measurement artifact rather than a real gain.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["latency", "streaming", "perceived-latency"],
    type: "single",
    correct: "E",
  },
  {
    schemaVersion: 1,
    id: "D3-q306",
    domain: 3,
    objective: "3.3",
    stem: "A chat assistant must begin responding within two seconds at p95 and currently misses at 2.6 seconds. Before the main call it runs three checks in sequence: a prompt-injection classifier, a PII detector and a topic filter, each taking roughly 200 milliseconds. The main call begins only after all three return. What is the strongest first move?",
    choices: [
      {
        id: "A",
        text: "Replace the three classifiers with a single prompt instruction asking the model to self-check for all three conditions.",
        rationale:
          "Folding the checks into the model removes the independent enforcement they exist to provide, trading a latency problem for a control problem.",
      },
      {
        id: "B",
        text: "Move the three checks to run after the main call, on the generated response.",
        rationale:
          "Checking afterwards adds its cost to the tail instead of the head and lets a request the filters would have blocked reach the model first.",
      },
      {
        id: "C",
        text: "Move to a faster model tier so the main call absorbs the 600 milliseconds the checks consume.",
        rationale:
          "That spends quality on overhead the design added, and the checks keep their place on the critical path whatever the main call costs.",
      },
      {
        id: "D",
        text: "Run the three checks concurrently, so the gate costs about 200 milliseconds rather than 600.",
      },
    ],
    explanation:
      "Guardrails that run serially each add their full latency to the critical path, and three independent checks have no reason to wait for one another. Parallelizing them preserves every control while cutting the gate to the cost of its slowest member, which is the cheapest 400 milliseconds available here.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["latency", "guardrails", "serial-cost"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q307",
    domain: 3,
    objective: "3.3",
    stem: "A team is asked to cut p95 latency on an assistant that retrieves documents, calls a model, and validates the output. Their proposal is to move to a faster model tier. The architect asks for something before approving it. What should that be?",
    choices: [
      {
        id: "A",
        text: "An estimate of the quality the faster tier would cost, measured on the evaluation set.",
        rationale:
          "That measurement is needed before the change ships, but it presumes the model call is where the time goes, which has not been established.",
      },
      {
        id: "B",
        text: "A projection of the cost saving the smaller tier would deliver at current traffic.",
        rationale:
          "Cost is a welcome side effect and a poor basis for a latency decision, and it also assumes the answer before the diagnosis.",
      },
      {
        id: "C",
        text: "A per-stage latency breakdown at p95, showing how much of the budget retrieval, generation and validation each consume.",
      },
      {
        id: "D",
        text: "A load test confirming that p95 latency holds at twice the current request rate.",
        rationale:
          "Headroom under load is worth knowing separately, but it describes how the current distribution behaves rather than where the current time is spent.",
      },
    ],
    explanation:
      "Every lever on this objective trades something real, so choosing one before knowing where the time goes risks paying accuracy for a stage that was never the bottleneck. A per-stage breakdown at the percentile in the commitment is what makes the trade explicit and the justification defensible.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["latency", "measurement", "justification"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
