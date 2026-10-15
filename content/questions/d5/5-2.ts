import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D5-q201",
    domain: 5,
    objective: "5.2",
    stem: "An agent completes supplier onboarding in nine tool-backed steps. Each step measures 97% correct in isolation, which the team reports as evidence that the workflow is ready for production. A two-week pilot instead shows that roughly one run in four needs an operator to redo work. What best explains the gap?",
    choices: [
      {
        id: "A",
        text: "The per-step measurements were taken on unrepresentative fixtures and are overstated.",
        rationale:
          "Measurement error is always possible, but no overstatement is needed here: the observed pilot rate is exactly what nine independently 97%-reliable steps predict.",
      },
      {
        id: "B",
        text: "Per-step success multiplies across the chain: 0.97 to the ninth power is about 76%, so roughly a quarter of runs fail somewhere.",
      },
      {
        id: "C",
        text: "Non-determinism means each run samples a different execution path, so per-step averages do not apply to a chain.",
        rationale:
          "Sampling variation explains why individual runs differ, not why a consistent quarter of them fail, which the arithmetic already accounts for.",
      },
      {
        id: "D",
        text: "The context window is exceeded on longer runs, degrading the later steps.",
        rationale:
          "Context pressure would concentrate failures in late steps on long inputs, rather than producing the uniform end-to-end rate the multiplication predicts.",
      },
    ],
    explanation:
      "Chained probabilistic steps compound: end-to-end success is approximately per-step reliability raised to the number of steps. Step metrics that look healthy in isolation routinely describe an unusable workflow, which is why end-to-end completion is the number to measure and to report to stakeholders.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["failure-modes", "compounding-error", "agents"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q202",
    domain: 5,
    objective: "5.2",
    stem: "A nightly pipeline turns support tickets into an executive digest. The error rate is 0.0%, latency is stable, and no alert has fired in three months. A manager then notices that last week's digest attributed a major outage to the wrong product line and described two incidents that never occurred. What does this most directly reveal about the monitoring?",
    choices: [
      {
        id: "A",
        text: "The pipeline needs retry logic so transient failures do not corrupt the digest.",
        rationale:
          "Retries address operations that report failure. Nothing here reported failure, which is precisely the property that made the problem invisible.",
      },
      {
        id: "B",
        text: "Latency monitoring should be supplemented with token-usage monitoring to detect truncated inputs.",
        rationale:
          "Token accounting is worth having, but a fabricated incident consumes roughly the tokens a real one would, so it would not have flagged this.",
      },
      {
        id: "C",
        text: "The error rate is computed over the wrong window and is masking intermittent failures.",
        rationale:
          "No window would help, because nothing errored at all: the run completed successfully and produced a well-formed, confident, wrong document.",
      },
      {
        id: "D",
        text: "It measures whether the pipeline ran, not whether its output was true; groundedness checks and source attribution are missing.",
      },
    ],
    explanation:
      "The defining LLM failure mode is a fluent, well-formed, wrong output delivered with no error signal. Availability and latency dashboards inherited from conventional services report perfect health throughout, so quality signals — claims traced to source tickets, groundedness scoring, sampled human review — have to be monitored separately.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "silent-failure", "monitoring"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q203",
    domain: 5,
    objective: "5.2",
    stem: "A customer-facing assistant that has been stable for six months begins quoting shipping policies that were retired last year. There has been no code deployment in five weeks, the model snapshot is pinned, and latency and error rates are unchanged. Which two investigations are most likely to locate the cause?",
    choices: [
      {
        id: "A",
        text: "Add a system-prompt instruction telling the assistant to disregard any policy it believes has been superseded.",
        rationale:
          "Nothing in the retrieved text marks a policy as superseded, so the instruction asks the model to sort on a signal that never reached its context.",
      },
      {
        id: "B",
        text: "Review what changed in the retrieval corpus and its ingestion job over the past five weeks.",
      },
      {
        id: "C",
        text: "Compare answers against a larger model to determine whether capability is now the limiting factor.",
        rationale:
          "A larger model reading the same retired policy document reaches the same retired conclusion; capability is not the variable that changed.",
      },
      {
        id: "D",
        text: "Replay the regression eval set and compare per-case results against the last known-good run.",
      },
      {
        id: "E",
        text: "Increase the number of retrieved chunks so that current policies are more likely to be included.",
        rationale:
          "Adding chunks from a corpus that now contains superseded content places old and new policy side by side without telling the model which one governs.",
      },
    ],
    explanation:
      "Degradation with no code change, a pinned model and flat operational metrics is the signature of drift in an upstream dependency, and the corpus is the dependency that changes without a deployment. A regression eval replay converts the vague report into a dated, per-case diff that localizes when the behavior shifted.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "drift", "diagnosis"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D5-q204",
    domain: 5,
    objective: "5.2",
    stem: "A CI suite asserts that a classification prompt returns an exact JSON string for each of 200 fixture inputs. It fails intermittently on four or five cases per run, although spot checks show the answers are acceptable. The team pins the model snapshot and replays each captured request instead of regenerating it; the failure count falls but never reaches zero. What is the right conclusion?",
    choices: [
      {
        id: "A",
        text: "A pinned snapshot replaying a captured request should be fully deterministic, so the remaining failures indicate a bug in the prompt template.",
        rationale:
          "Identical output is never guaranteed even with every version pinned — batching, tie-breaking and serving-side changes all shift tokens — so residual variation is expected rather than evidence of a template bug.",
      },
      {
        id: "B",
        text: "Pinning the retrieval index build and the tool versions as well will make the suite fully deterministic.",
        rationale:
          "Pinning each remaining dependency removes more sources of variation but never all of them, and it does nothing about a suite that is asserting the wrong property in the first place.",
      },
      {
        id: "C",
        text: "Exact-match assertions test the wrong property; assert schema validity and the predicted label, and score any free text with a rubric.",
      },
      {
        id: "D",
        text: "Retry each failing case up to three times and fail only if every attempt mismatches.",
        rationale:
          "Retrying until a string matches converts a flaky suite into a slow flaky suite that now reports green over genuine regressions.",
      },
    ],
    explanation:
      "LLM output is non-deterministic by construction, and pinning versions narrows the sources of variation without collapsing the distribution. Tests must assert the properties that matter — valid schema, correct label, required fields, rubric score above a threshold — because an exact-string assertion measures token identity, which was never the requirement.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "non-determinism", "testing"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q205",
    domain: 5,
    objective: "5.2",
    stem: "During acceptance testing of a contract-review assistant, a reviewer challenges answers they believe are wrong. The assistant revises its position about 80% of the time, which the team records as evidence that it \"handles correction well.\" The reviewer then challenges three answers that were in fact correct, supplying no new evidence, and the assistant revises all three. What has the test actually measured?",
    choices: [
      {
        id: "A",
        text: "Sycophancy: the model moves toward the position the user appears to hold, independently of whether its original answer was right.",
      },
      {
        id: "B",
        text: "Calibration: the model is correctly signaling low confidence by revising when challenged.",
        rationale:
          "Revision under social pressure is not a confidence signal. A calibrated system holds a correct answer when the challenge introduces no new evidence.",
      },
      {
        id: "C",
        text: "Instruction-following: the model is obeying the reviewer's implied instruction to reconsider.",
        rationale:
          "Relabeling the behavior as compliance does not make it safe; the observable defect is that correct conclusions are abandoned for no reason.",
      },
      {
        id: "D",
        text: "Context degradation: repeated challenges push the earlier reasoning out of the window.",
        rationale:
          "A three-turn exchange is nowhere near a context limit, and the reversal appears immediately rather than after a long conversation.",
      },
    ],
    explanation:
      "An evaluation loop in which a human repeatedly pushes back measures agreeableness, not accuracy, because models tend to revise toward the position the user seems to favor. Correctness has to be judged against ground truth by a rater who does not signal the answer they expect.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "sycophancy", "evaluation"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q206",
    domain: 5,
    objective: "5.2",
    stem: "A travel agent books itineraries across six steps. Users report itineraries missing the return flight, yet the agent's summary always describes a complete round trip. Traces show `search_flights` returning HTTP 200 with an empty results array for certain airport codes, after which the agent proceeds. Which change addresses the root cause?",
    choices: [
      {
        id: "A",
        text: "Instruct the model to state explicitly whenever a search returns no results.",
        rationale:
          "The model is already narrating around a gap it does not register as a failure, so asking it to notice keeps detection inside the component that missed it.",
      },
      {
        id: "B",
        text: "Assert a postcondition on each step — a schema-valid, non-empty result where one is required — and fail the run when it is not met.",
      },
      {
        id: "C",
        text: "Retry the flight search three times before moving on to the next step.",
        rationale:
          "The search is not failing transiently; it legitimately returns zero rows for those codes, so three identical empty responses lead to the same silent continuation.",
      },
      {
        id: "D",
        text: "Add an output classifier that checks the final summary for completeness.",
        rationale:
          "Checking the summary happens after booking and cannot distinguish an accidentally missing leg from a one-way trip the traveler actually requested.",
      },
    ],
    explanation:
      "A successful HTTP status with an empty payload is indistinguishable from a legitimate empty result unless something asserts what a valid result looks like. Explicit step postconditions convert a silent gap into a loud, localized failure at the step that caused it, rather than letting the model narrate confidently over the missing data.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "orchestration", "silent-failure"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q207",
    domain: 5,
    objective: "5.2",
    stem: "A ten-step agent completes an onboarding task end to end about 60% of the time, with each step measuring roughly 95% in isolation. Which TWO changes address the actual cause?",
    choices: [
      {
        id: "A",
        text: "Collapse steps that do not need to be separate, so fewer probabilistic calls sit in the chain.",
      },
      {
        id: "B",
        text: "Move the whole chain to a more capable model tier.",
        rationale:
          "A better tier lifts each step's rate a little and leaves ten of them multiplying, so the end-to-end figure improves far less than it appears it should.",
      },
      {
        id: "C",
        text: "Add deterministic validation on the artifacts crossing the remaining steps, so an error is caught rather than carried forward.",
      },
      {
        id: "D",
        text: "Retry any step that fails, up to three attempts.",
        rationale:
          "Retries help where failures are transient, while a step that is wrong in a way nothing detects is retried on an error nobody noticed.",
      },
      {
        id: "E",
        text: "Run the steps concurrently where their inputs allow it.",
        rationale:
          "Parallelism shortens wall-clock time without changing how many probabilistic results the final answer depends on.",
      },
    ],
    explanation:
      "Accuracies multiply along a chain rather than averaging, so chain length is itself a risk factor and shortening the chain is a safety control. The other lever is interrupting the product: a check on the artifact crossing a seam stops an error propagating, which is what neither a better model nor a retry provides.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["failure-modes", "compounding-error", "chain-length"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D5-q208",
    domain: 5,
    objective: "5.2",
    stem: "A support assistant is praised in testing for \"remembering\" a customer's earlier complaint within a conversation. In production, customers who return the next day find it has no idea what was agreed, and the team files a bug against the model. How should the architect characterize this?",
    choices: [
      {
        id: "A",
        text: "Not a defect: context is not memory, so anything that must survive a session has to be stored and retrieved deliberately.",
      },
      {
        id: "B",
        text: "A model limitation to be resolved by moving to a tier with a larger context window.",
        rationale:
          "A larger window holds more of one conversation and still starts empty on the next, because nothing carries between requests on its own.",
      },
      {
        id: "C",
        text: "A regression introduced by conversation compaction discarding the earlier turns.",
        rationale:
          "Compaction can lose detail inside a long session, whereas here a new session begins with no prior turns to discard.",
      },
      {
        id: "D",
        text: "A retrieval failure, since the earlier complaint was not returned by the knowledge base.",
        rationale:
          "Retrieval can only return what was written somewhere, and the conversation was never persisted to a store it could search.",
      },
    ],
    explanation:
      "Within a request the model sees exactly what is in the context window and nothing else; across requests it sees nothing at all. Persistence is an architecture decision, so continuity between sessions comes from writing the relevant facts down and retrieving them, never from the model retaining anything.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["failure-modes", "context-is-not-memory", "limitations"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
