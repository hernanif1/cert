import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.6",
  slug: "3-6-retrieval-strategies",
  domain: 3,
  objective:
    "Apply retrieval strategies matched to data shape and query pattern",
  title: "Matching Retrieval to Data Shape",
  summary:
    "Similarity search is one retrieval strategy among several, and it is the wrong one for aggregation, exhaustive listing and relationship traversal. This objective is about picking the mechanism the data and the question jointly demand — including deciding that retrieval is not needed at all.",

  body: [
    {
      kind: "prose",
      md: "Designing a pipeline and choosing a strategy are different skills. Once you have decided *that* you will retrieve, you still have to decide *how*, and the answer depends on two inputs that must be considered together: the shape of the data and the pattern of the questions asked against it.\n\nA corpus of unstructured prose queried conversationally is the case vector search was built for. Almost every other combination has a better mechanism available, and the exam rewards recognizing which.",
    },

    { kind: "heading", text: "The selection matrix" },
    {
      kind: "table",
      caption: "Data shape plus query pattern determines the mechanism",
      headers: ["Data shape", "Query pattern", "Mechanism"],
      rows: [
        [
          "Unstructured prose",
          "Conceptual, paraphrased questions",
          "Dense vector search",
        ],
        [
          "Identifiers, codes, symbols, rare terms",
          "Exact lookup of a known token",
          "Lexical search, or hybrid where both styles appear",
        ],
        [
          "Rows in a relational store or warehouse",
          "Counts, sums, rankings, time comparisons",
          "Generated SQL or a purpose-built API — not embeddings",
        ],
        [
          "Entities with typed relationships",
          "Multi-hop, dependency and impact questions",
          "Graph traversal, optionally seeded by a vector lookup",
        ],
        [
          "Small corpus that fits comfortably in context",
          "Anything",
          "Put it in the prompt and cache it; skip retrieval",
        ],
        [
          "Volatile data — prices, stock, status",
          "Current state",
          "Live API call at request time, never a periodically rebuilt index",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Similarity is not aggregation.** *How many contracts renew in Q3* is a counting problem over a known field. Vector search returns the *k* passages most like the question — it has no notion of completeness, so it cannot tell you it missed forty rows. Any question containing *how many*, *total*, *all*, *average* or *rank* is asking for an operation that a top-k retriever structurally cannot perform.",
    },

    { kind: "heading", text: "Query patterns that break naive retrieval" },
    {
      kind: "list",
      items: [
        "**Exhaustive.** *List every supplier in a sanctioned country.* Requires a filter over the full set, not the nearest neighbors of a sentence.",
        "**Multi-hop.** *Which services will break if we deprecate the auth library?* The answer is a traversal; no single passage contains it, and raising *k* retrieves more first hops rather than reaching the second.",
        "**Comparative.** *How does this year's policy differ from last year's?* Needs two targeted, disjoint retrievals, not one blended pool the model has to untangle.",
        "**Temporal.** *What is the current rate?* Needs a recency constraint or a live lookup; older and newer versions of a document are near-identical to an embedding model.",
        "**Negation.** *Which accounts have no active contract?* Absence cannot be retrieved. It has to be computed from a complete set.",
      ],
    },
    {
      kind: "prose",
      md: "For multi-hop and comparative patterns, the usual remedy is query transformation rather than a different index: decompose the question into sub-questions, retrieve for each, and let the model compose. Where a question spans mechanisms — *summarize the risk language in every contract expiring this quarter* — route it as a structured query that selects the rows, followed by retrieval scoped to the documents that survived.",
    },

    { kind: "heading", text: "Tuning the two dials that matter" },
    {
      kind: "prose",
      md: "**Top-k** is a recall-versus-noise trade. Raising it helps when evaluation shows the right passage is being missed entirely; it hurts when the right passage is already retrieved and is now buried among near-duplicates. Diagnose which before touching the number.\n\n**Filters** should be applied before similarity, not after. Post-filtering a top-10 result down to the three documents a user may see can leave you with three weak matches when ten strong ones existed inside the permitted scope.",
    },

    {
      kind: "example",
      title: "Practical example: a sales assistant that cannot count",
      scenario:
        "A sales assistant is grounded in a vector index built from CRM exports, one chunk per opportunity record. It answers *what did we discuss with Northwind last quarter* well. It answers *how many deals over $50,000 closed in EMEA last quarter* with a number that is confidently wrong and different on each attempt.",
      walkthrough:
        "1. **Classify the two query types.** The first is a semantic lookup over narrative notes. The second is an aggregation with two predicates over structured fields.\n2. **Recognize the structural mismatch.** The assistant retrieves ten chunks, sees a handful of qualifying deals, and counts those. There were 312. Nothing in the pipeline could have known.\n3. **Reject the tempting fixes.** Raising top-k to 100 gets closer without ever being right, and re-chunking changes nothing about completeness.\n4. **Route by intent.** Aggregation and filter questions go to a generated SQL query against the CRM warehouse; narrative questions go to the vector index.\n5. **Return a verifiable answer.** The SQL path emits the query alongside the number, which the previous design could not do at all.",
      takeaway:
        "The failure was not tuning. Counting requires a complete set, and a top-k retriever returns a ranked sample — so the fix was a different mechanism for that query class, not a better-configured index.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Increase the number of retrieved results* is the most frequently offered distractor on this objective. It is correct only when the diagnosis is a recall miss. When the question demands completeness, an ordering change, or a traversal, more results move the answer closer to right without ever making it right — which is worse, because it looks like progress.",
    },

    { kind: "practice", questionId: "D3-q601" },
  ],

  keyTerms: [
    {
      term: "Query pattern",
      definition:
        "The class of question users actually ask — conceptual, exact-match, aggregate, multi-hop, comparative, temporal — which constrains the retrieval mechanism as much as the data's shape does.",
    },
    {
      term: "Query decomposition",
      definition:
        "Splitting a compound or multi-hop question into sub-questions, retrieving for each independently, and composing the results. The standard answer when no single passage contains the answer.",
    },
    {
      term: "Pre-filter",
      definition:
        "Restricting the candidate set by structured predicates before similarity is computed, so the top-k comes from the permitted, relevant subset rather than being trimmed after the fact.",
    },
    {
      term: "Text-to-SQL routing",
      definition:
        "Sending aggregate, filter and ranking questions to a generated query over structured storage instead of a vector index, producing complete and auditable answers.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Any grounding problem can be solved by embedding the data and retrieving it.",
      why: "Aggregation, exhaustive listing and negation all require a complete result set, and a top-k similarity search returns a ranked sample with no way to know or report what it left out.",
      instead:
        "Route counting, filtering and ranking questions to structured queries, and reserve similarity search for conceptual lookups over prose.",
    },
    {
      id: "t2",
      trap: "A multi-hop question is answerable by retrieving a larger number of chunks.",
      why: "Raising top-k widens the first hop but never reaches the second, because the linking fact lives in a document that is not textually similar to the original question at all.",
      instead:
        "Decompose the question into sequential retrievals, or traverse an explicit relationship graph.",
    },
    {
      id: "t3",
      trap: "A small internal handbook should still go through a retrieval pipeline for consistency.",
      why: "A corpus that fits comfortably in the context window can simply be included and cached, and forcing it through retrieval adds chunk-boundary errors, ranking errors and operational overhead in exchange for nothing.",
      instead:
        "Load small, stable corpora directly into context and use retrieval when the corpus genuinely exceeds what you can pass.",
    },
    {
      id: "t4",
      trap: "Access and recency filters can be applied to the retrieved results after the search.",
      why: "Post-filtering shrinks an already-ranked list, so a query can return three weak passages that survived the filter while ten strong permitted ones were never scored in the first place.",
      instead:
        "Apply structured predicates before similarity so the ranking is computed over the eligible subset.",
    },
    {
      id: "t5",
      trap: "Frequently changing operational data should be re-indexed on a schedule so the agent can retrieve it.",
      why: "Any index of volatile state is stale between rebuilds, and the agent has no signal telling it how old the retrieved value is, so it reports outdated figures with full confidence.",
      instead:
        "Read volatile state through a live API call at request time and reserve indexing for durable content.",
    },
  ],

  practiceQuestionIds: ["D3-q601", "D3-q603"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Introducing Contextual Retrieval — Anthropic",
      url: "https://www.anthropic.com/news/contextual-retrieval",
      kind: "anthropic-blog",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
  relatedLessons: ["3.5"],
} satisfies Lesson;
