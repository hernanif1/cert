import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D2-q101",
    domain: 2,
    objective: "2.1",
    stem: "A research platform runs an overnight job that summarizes 200,000 abstracts into a digest reviewed by editors the following morning. The engineering lead proposes selecting whichever model has the lowest measured time-to-first-token. What is the strongest argument against optimizing this workload for latency?",
    choices: [
      {
        id: "A",
        text: "Batch jobs still expose latency to users indirectly through the scheduler's queue depth.",
        rationale:
          "Queue depth is a function of total throughput and the job window, not of per-request time-to-first-token, and the window here is a whole night.",
      },
      {
        id: "B",
        text: "Faster models produce shorter responses, so the summaries would be truncated.",
        rationale:
          "Response length is governed by the instruction and the output limit, not by how quickly a model emits tokens. The two properties are unrelated.",
      },
      {
        id: "C",
        text: "Latency and cost move together, so optimizing for latency already optimizes cost.",
        rationale:
          "They often move in the same direction but they are distinct axes, and treating one as a proxy for the other is exactly the reasoning error this objective tests.",
      },
      {
        id: "D",
        text: "No one is waiting on any individual response, so latency is not a binding constraint and the decision should be driven by cost and output quality.",
      },
    ],
    explanation:
      "Model selection trades capability, latency and cost, and the workload determines which of the three actually binds. An overnight batch with a morning deadline has no per-request latency requirement at all, so optimizing for it spends capability or money on a property nobody can observe.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["model-selection", "latency", "batch"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D2-q102",
    domain: 2,
    objective: "2.1",
    stem: "A classification service runs on a mid-tier model, returns valid structured output on essentially every request, and costs more than the team wants. A proposal moves it to the smallest available model at roughly a fifth of the per-token rate. In testing, the small model returns malformed output on 18% of requests, which the pipeline handles by retrying with an expanded prompt containing four worked examples. Which analysis should decide this?",
    choices: [
      {
        id: "A",
        text: "Compare end-to-end cost per successfully completed request, including the retries and the longer retry prompt, against the current configuration.",
      },
      {
        id: "B",
        text: "Compare the published per-token rates, since retry behavior is a property of the pipeline rather than of the model.",
        rationale:
          "Retries are caused by the model's failure rate, so excluding them from the comparison measures the wrong thing and systematically favors the weaker model.",
      },
      {
        id: "C",
        text: "Adopt the small model, because an 18% retry rate cannot offset a five-fold reduction in the per-token rate.",
        rationale:
          "It asserts the conclusion the analysis is supposed to produce. A retry that also carries a longer prompt can easily consume a large share of the nominal saving.",
      },
      {
        id: "D",
        text: "Keep the mid-tier model, because small models are not suitable for tasks that require structured output.",
        rationale:
          "Small models produce structured output routinely when the contract is specified and validated. The blanket rule substitutes a generalization for a measurement.",
      },
    ],
    explanation:
      "Total spend is tokens multiplied by rate multiplied by attempts, and a cheaper model that fails often can cost more than an expensive one that succeeds first time. The decidable question is cost per successfully completed task with the full retry path priced in, measured on the team's own traffic.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["model-selection", "cost", "retries"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q103",
    domain: 2,
    objective: "2.1",
    stem: "An agent completes a 25-step research workflow in which each step consumes the previous step's output. On isolated steps a small model is correct about 97% of the time, but the full workflow succeeds only about 45% of the time. To control cost, the team wants to keep the small model and simply retry the whole workflow when it fails. What should the architect point out?",
    choices: [
      {
        id: "A",
        text: "Retrying is cheaper than a more capable model because most retries succeed on the second attempt.",
        rationale:
          "Each retry re-runs all 25 steps at full cost and faces the same 45% success rate, so the expected number of attempts is over two and cost roughly doubles.",
      },
      {
        id: "B",
        text: "The 97% per-step figure must be measured incorrectly, since it is inconsistent with a 45% workflow success rate.",
        rationale:
          "The figures are consistent: a 97% success rate raised to the 25th power is approximately 47%, which is exactly the observed behavior.",
      },
      {
        id: "C",
        text: "Per-step errors compound across the chain, so a 3% step error rate is sufficient to explain the workflow failure rate, and whole-workflow retries pay full cost for every attempt.",
      },
      {
        id: "D",
        text: "A workflow failure rate this high indicates a tool configuration problem rather than a model capability issue.",
        rationale:
          "The per-step measurement already isolates the model, and the workflow number follows arithmetically from it, so nothing points at tool configuration.",
      },
    ],
    explanation:
      "Long agentic chains are the canonical case for spending on capability: a small per-step error rate multiplies across steps, so 0.97 to the 25th power lands near the observed 45%. Retrying the chain does not break the compounding, it just pays for it repeatedly, which is why long tool-using workflows justify a stronger model than single-turn tasks do.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["model-selection", "agentic", "compounding-error"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D2-q104",
    domain: 2,
    objective: "2.1",
    stem: "A customer-facing assistant runs on the most capable model and sends a large, unchanging instruction and policy block with every request. Users complain about a multi-second pause before any text appears. The team's proposal is to move to the smallest available model. What should the architect ask them to evaluate first?",
    choices: [
      {
        id: "A",
        text: "Moving inference to a region closer to the majority of users, since network round-trip dominates time-to-first-token.",
        rationale:
          "Network transit is measured in tens of milliseconds, which does not account for a multi-second pause before the first token appears.",
      },
      {
        id: "B",
        text: "Streaming the response and caching the large static prefix, both of which attack time-to-first-token without giving up capability.",
      },
      {
        id: "C",
        text: "Raising the maximum output length so the model is not forced to compress its answer.",
        rationale:
          "A longer permitted response increases total generation time and does nothing about the wait before the first token, so it moves the metric the wrong way.",
      },
      {
        id: "D",
        text: "Splitting the instruction and policy block across several smaller requests so no single call carries all of it.",
        rationale:
          "Each call still processes its share of the same policy text and adds a round trip of its own, so total input work rises and the wait before the first visible token gets longer rather than shorter.",
      },
    ],
    explanation:
      "A downgrade is the option that costs quality, so it belongs last rather than first. Streaming changes when the user sees output, and caching a large identical prefix removes the work of re-processing it, and both address perceived latency directly while leaving model capability intact.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["model-selection", "latency", "caching"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D2-q105",
    domain: 2,
    objective: "2.1",
    stem: "An architect joins a project where the model was chosen by taking the highest-scoring entry on a public leaderboard. Quality complaints are now frequent, and they cluster on the team's domain-specific documents. What is the most appropriate corrective step?",
    choices: [
      {
        id: "A",
        text: "Build a representative evaluation set from the team's own traffic and score the candidate models against it with the production prompt.",
      },
      {
        id: "B",
        text: "Escalate every request to the most capable model available, since the complaints indicate the current model is under-powered.",
        rationale:
          "It assumes capability is the deficiency without testing that assumption, and it raises cost on all traffic to address a problem that may lie in the prompt or the context supplied.",
      },
      {
        id: "C",
        text: "Compare the leaderboard's per-category scores and pick whichever model leads the category closest to the team's domain.",
        rationale:
          "It is a finer-grained version of the same mistake: a category average still measures other people's tasks, not this team's documents, prompt or edge cases.",
      },
      {
        id: "D",
        text: "Add few-shot examples until the complaint volume falls, then revisit the model choice.",
        rationale:
          "Complaint volume is a lagging, unstructured signal, and tuning against it without a held-out set gives no way to tell a real improvement from noise.",
      },
    ],
    explanation:
      "Public benchmarks measure aggregate ability on generic tasks and say nothing about whether a model clears your quality floor on your data. The architect's move is to make the choice decidable: a representative evaluation set drawn from real traffic, scored with the prompt that will actually ship.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["model-selection", "evaluation"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q106",
    domain: 2,
    objective: "2.1",
    stem: "A document-processing platform handles two million requests a day. About 94% are routine single-page forms and 6% are complex multi-document packets that the smallest model handles badly. Everything currently runs on the most capable model and the workload is well over budget. Which TWO changes reduce cost substantially without regressing the complex packets?",
    choices: [
      {
        id: "A",
        text: "Route the routine single-page forms to a small model and keep the capable model for the complex packets.",
      },
      {
        id: "B",
        text: "Define an escalation trigger — failed schema validation or low routing confidence — that retries the request on the capable model.",
      },
      {
        id: "C",
        text: "Reduce the maximum output length across all requests so the capable model produces less text.",
        rationale:
          "A uniform cap truncates exactly the complex packets whose outputs are longest, which is the regression the question rules out.",
      },
      {
        id: "D",
        text: "Move all traffic to the small model and accept a higher error rate on the 6% that are complex.",
        rationale:
          "This buys the savings by degrading the complex cases, which the question explicitly excludes as an acceptable outcome.",
      },
      {
        id: "E",
        text: "Batch more requests into each API call so fewer calls are made.",
        rationale:
          "Billing and processing are driven by tokens rather than by call count, so consolidating calls does not reduce the cost of the same work.",
      },
    ],
    explanation:
      "Tiering makes cost a function of the volume-weighted mix rather than of the hardest case: sending 94% of traffic to a small model moves total spend close to the small model's rate. The escalation trigger is what keeps the complex tail safe, because it gives the routing decision a defined failure path back to the capable model.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["model-selection", "routing", "cost"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
] satisfies Question[];
