import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q601",
    domain: 3,
    objective: "3.6",
    stem: "A finance assistant is grounded in a vector index built from monthly expense reports, one chunk per line item. It answers \"what was the Dublin office's travel exception in March\" well. Asked \"how much did we spend on contractors in FY25\", it returns a confidently stated figure that differs on each attempt. Which change addresses this?",
    choices: [
      {
        id: "A",
        text: "Raise top-k from 10 to 200 so more line items are included in the total.",
        rationale:
          "This narrows the gap without ever closing it: a ranked sample has no notion of completeness, so the sum stays wrong while costing far more.",
      },
      {
        id: "B",
        text: "Re-chunk the reports so each chunk holds a full month rather than a single line item.",
        rationale:
          "Different chunk boundaries change what a passage contains but not the fact that top-k retrieval returns a subset rather than the full set.",
      },
      {
        id: "C",
        text: "Add a re-ranking pass so the most relevant contractor line items appear first.",
        rationale:
          "Re-ranking reorders the candidates retrieval already returned; an aggregate needs every qualifying row, not the best-ranked ones.",
      },
      {
        id: "D",
        text: "Route aggregate questions to a generated SQL query over the expense warehouse and keep the index for narrative lookups.",
      },
    ],
    explanation:
      "Summation requires a complete result set over a known field, and similarity search returns the k passages most like the question. No amount of tuning gives a top-k retriever a notion of completeness, so questions containing \"how much\", \"how many\" or \"total\" belong on a structured query path, with the vector index reserved for conceptual lookups.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["retrieval-selection", "aggregation", "text-to-sql"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q602",
    domain: 3,
    objective: "3.6",
    stem: "A platform-engineering assistant answers questions about a microservice estate. \"What does the billing service do\" works well. \"If we deprecate the shared auth library, which services break\" returns only services whose documentation mentions the library by name, missing every service that depends on it through an intermediate package. The team has already doubled top-k and added a re-ranker. What is the underlying problem?",
    choices: [
      {
        id: "A",
        text: "The chunks are too small to contain complete dependency declarations.",
        rationale:
          "Larger chunks would carry more of each manifest, but the missing dependents are described in other services' manifests entirely.",
      },
      {
        id: "B",
        text: "The embedding model underweights code identifiers relative to surrounding prose.",
        rationale:
          "Better lexical matching would improve first-hop recall, which already works; the missing services never name the library at all.",
      },
      {
        id: "C",
        text: "The re-ranker is optimizing textual similarity rather than dependency relevance.",
        rationale:
          "A re-ranker can only reorder candidates retrieval returned, and the transitive dependents were never among them.",
      },
      {
        id: "D",
        text: "Top-k is still too low for an estate of this size.",
        rationale:
          "No value of k reaches a document that bears no textual similarity to the query; the connection is structural rather than semantic.",
      },
      {
        id: "E",
        text: "The question requires traversing a dependency graph, and similarity search cannot reach a second hop.",
      },
    ],
    explanation:
      "Impact questions are multi-hop: the answer is the transitive closure of a relationship, and no single passage contains it. A service that depends on the library only indirectly shares no vocabulary with the query, so it is unreachable by similarity at any k. The mechanism has to change to graph traversal or to sequential decomposed retrievals.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["retrieval-selection", "multi-hop", "graph"],
    type: "single",
    correct: "E",
  },
  {
    schemaVersion: 1,
    id: "D3-q603",
    domain: 3,
    objective: "3.6",
    stem: "An internal assistant answers questions about a 30-page onboarding handbook that is revised roughly twice a year. The team has proposed building an embedding pipeline with a nightly re-index job. Reviewing the proposal, what is the strongest recommendation?",
    choices: [
      {
        id: "A",
        text: "Proceed, but trigger re-indexing on document change rather than nightly.",
        rationale:
          "This trims operational waste while keeping a retrieval layer that a corpus of this size does not justify in the first place.",
      },
      {
        id: "B",
        text: "Proceed, and add lexical search alongside the vectors so policy numbers match exactly.",
        rationale:
          "A sensible refinement to a pipeline that should not exist here, since the entire handbook fits comfortably in context.",
      },
      {
        id: "C",
        text: "Skip retrieval: put the handbook in the prompt as a cached prefix and update it when the document is revised.",
      },
      {
        id: "D",
        text: "Split the handbook by section and give the assistant one retrieval tool per section.",
        rationale:
          "This manufactures a tool-selection problem over a document small enough to load whole, adding failure modes with no offsetting benefit.",
      },
    ],
    explanation:
      "The discriminator is what fraction of the corpus a typical task touches. Load and cache when a typical question touches most of a small, stable corpus; reach for retrieval or progressive discovery when it touches a small fraction of a large one. A 30-page handbook revised twice a year sits firmly on the first side, so a pipeline here adds chunk-boundary errors, ranking errors and an ingestion job to operate, in exchange for nothing.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["retrieval-selection", "when-not-to-rag", "caching"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q604",
    domain: 3,
    objective: "3.6",
    stem: "A compliance assistant retrieves from a policy index where each chunk carries `jurisdiction`, `effective_date` and `status`. Users in Germany report that answers sometimes cite superseded EU-wide guidance instead of current German rules. Evaluation shows the correct German chunk is retrieved inside top-k on most queries, but superseded EU guidance is consistently ranked above it and the answer is written from whichever passage came first. Which two changes address this?",
    choices: [
      {
        id: "A",
        text: "Apply `status` and `effective_date` as pre-filters so similarity is computed only over policies currently in force.",
      },
      {
        id: "B",
        text: "Raise top-k so the German chunk is included more often.",
        rationale:
          "The right chunk is already inside top-k; adding candidates cannot change the fact that superseded text out-ranks it, and it enlarges the pool competing for the model's attention.",
      },
      {
        id: "C",
        text: "Run both a jurisdiction-specific and a general retrieval, then let the model decide which passages to trust.",
        rationale:
          "This hands the model a contradictory pool with no signal about precedence, which is the failure already being reported.",
      },
      {
        id: "D",
        text: "Bind the user's jurisdiction from their account profile as a mandatory retrieval predicate instead of inferring it from the question wording.",
      },
      {
        id: "E",
        text: "Replace the embedding model with one trained on legal text.",
        rationale:
          "A domain-tuned model may score policy language somewhat better, but superseded and current versions of the same rule remain near-identical semantically.",
      },
    ],
    explanation:
      "Nothing here is a recall problem, so a deeper top-k cannot help: the right passage is already retrieved and is simply losing to text that should never have been a candidate at all. The fix is constraint rather than ranking. Status and effective date should narrow the candidate set before similarity is computed, so superseded guidance is never scored, and the jurisdiction that applies is known from the user's account and belongs in the query as a hard predicate rather than as something the model infers from phrasing.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["retrieval-selection", "pre-filtering", "temporal"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D3-q605",
    domain: 3,
    objective: "3.6",
    stem: "A retail assistant answers questions like \"is the Aurora jacket in stock in size M at the Portland store\". The team built it by indexing a nightly inventory snapshot into a vector store alongside product descriptions. Customers complain that the assistant tells them an item is available when it is not. Which design change is appropriate?",
    choices: [
      {
        id: "A",
        text: "Re-index hourly instead of nightly to shrink the staleness window.",
        rationale:
          "This narrows the window without removing it, and store inventory can change within seconds during trading hours.",
      },
      {
        id: "B",
        text: "Query the inventory service directly at request time through a tool, and keep the index for product descriptions.",
      },
      {
        id: "C",
        text: "Add the snapshot timestamp to each chunk so the model can caveat its answer.",
        rationale:
          "A caveat makes a wrong answer more honest but still fails to answer the customer's actual question about current availability.",
      },
      {
        id: "D",
        text: "Increase top-k so more store-and-size combinations are retrieved.",
        rationale:
          "Retrieving more stale records does not make any of them current; the failure is freshness, not recall.",
      },
    ],
    explanation:
      "Volatile operational state should be read live, not indexed. An index of inventory is stale the moment it is built, and the agent has no signal telling it how old the value is. Product descriptions are durable and belong in the index; stock levels belong behind a request-time API call.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["retrieval-selection", "volatile-data", "live-api"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q606",
    domain: 3,
    objective: "3.6",
    stem: "A customer-success assistant is grounded in a vector index of account notes. It answers \"what did we discuss with Northwind in March\" well. It answers \"which accounts have had no contact in 90 days\" with a short, confident and wrong list. Why does the second question fail?",
    choices: [
      {
        id: "A",
        text: "Establishing that something is absent requires examining every account, and a top-k retriever returns the closest matches rather than a complete set.",
      },
      {
        id: "B",
        text: "The notes do not record contact dates in a form the embedding can represent.",
        rationale:
          "Dates are usually present in the notes, and even perfectly embedded dates would not let a similarity search prove that nothing else exists.",
      },
      {
        id: "C",
        text: "The phrasing is negated, and negation is known to embed poorly, so the query vector lands near notes about contact.",
        rationale:
          "Negated phrasing does confuse similarity scoring, but rewording the query still cannot produce the exhaustive scan the answer depends on.",
      },
      {
        id: "D",
        text: "Ninety days of notes exceed the context window once enough chunks are retrieved.",
        rationale:
          "Capacity would cap how much is read, while the answer is wrong in kind: it names some accounts rather than all qualifying ones.",
      },
    ],
    explanation:
      "Negation and exhaustiveness are query patterns that similarity search cannot serve, because both are claims about a complete set and retrieval returns a ranked sample. Questions of that shape belong against a queryable store of the underlying records, with retrieval reserved for finding relevant passages.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["retrieval-selection", "negation", "completeness"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q607",
    domain: 3,
    objective: "3.6",
    stem: "A benefits assistant is asked \"how does this year's parental leave policy differ from last year's\". Retrieval returns five chunks, four from the current policy and one from the prior year, and the answer describes the current policy while asserting that little has changed. Which TWO changes address the cause?",
    choices: [
      {
        id: "A",
        text: "Increase the number of retrieved chunks so more of the prior policy is included.",
        rationale:
          "A longer list still lets one document dominate the ranking, because nothing in the retrieval makes the two years compete on equal terms.",
      },
      {
        id: "B",
        text: "Decompose the question into two retrievals, one scoped to each policy year, and compare the results.",
      },
      {
        id: "C",
        text: "Filter on the policy-year metadata so each sub-query draws only from its own version.",
      },
      {
        id: "D",
        text: "Instruct the model to state explicitly when it has not seen enough of one document to compare.",
        rationale:
          "An honesty instruction turns a wrong answer into a refusal, which is better, but it still does not get the prior policy in front of the model.",
      },
      {
        id: "E",
        text: "Re-rank the five retrieved chunks so the prior-year chunk is presented first.",
        rationale:
          "Ordering changes emphasis within an unbalanced set, and one chunk of the prior policy is not enough to ground a comparison whatever position it holds.",
      },
    ],
    explanation:
      "A comparative question is two retrievals and a comparison, not one retrieval over a mixed corpus: a single ranked query lets whichever document is better represented crowd out the other. Decomposing the query and pinning each part to its version with metadata gives the comparison both sides to work from.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["retrieval-selection", "query-decomposition", "comparative"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "C"],
  },
] satisfies Question[];
