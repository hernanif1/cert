import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.5",
  slug: "3-5-rag-pipeline-design",
  domain: 3,
  objective:
    "Design a RAG pipeline with appropriate chunking and indexing strategies",
  title: "Designing a RAG Pipeline",
  summary:
    "A RAG pipeline is four decisions — parse, chunk, embed, index — and the exam tests whether you can match each one to the shape of the source data. Most RAG failures trace back to chunking, not to the model.",

  body: [
    {
      kind: "prose",
      md: "Retrieval-augmented generation replaces *put everything in the prompt* with *put the right thing in the prompt*. That reframing matters for the exam, because it tells you where to look when a RAG system misbehaves: the model is usually answering faithfully from whatever context it was handed, and the interesting question is how that context was chosen.\n\nFour decisions define the pipeline, and each one can be wrong independently:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**Parse** — turn source files into clean text while preserving structure. Heading hierarchy, table boundaries and code blocks are signal, and a parser that flattens them has already thrown away the information a good chunker needs.",
        "**Chunk** — split that text into retrievable units. This is where most failures originate.",
        "**Embed** — map each chunk to a vector. The embedding model and the query model must match; embeddings from different models are not comparable.",
        "**Index** — store vectors alongside the metadata you will later want to filter on, such as document type, effective date, or access scope.",
      ],
    },
    {
      kind: "prose",
      md: "Retrieval then runs in reverse: embed the query, search the index, optionally filter and re-rank, and place the surviving chunks in the prompt. An architect is expected to justify each decision against the data, not to recite a default.",
    },

    { kind: "heading", text: "Matching the chunking strategy to the data" },
    {
      kind: "prose",
      md: "There is no universally correct chunk size. The right strategy follows from the shape of the source material, and the exam consistently rewards answers that reason from data shape rather than quoting a number.",
    },
    {
      kind: "table",
      caption: "Chunking strategy follows from the shape of the source data",
      headers: ["Data shape", "Strategy", "Typical size", "Failure mode if wrong"],
      rows: [
        [
          "Long prose, policy documents",
          "Recursive character split with overlap",
          "500–1000 tokens, 10–15% overlap",
          "Answers truncated mid-clause; a rule and its exception land in different chunks",
        ],
        [
          "Structured API or product reference",
          "Semantic split on section boundaries",
          "One section per chunk",
          "Parameters separated from the endpoint they belong to",
        ],
        [
          "Tabular data, CSV exports",
          "Row groups with the header replayed into each chunk",
          "20–50 rows plus header",
          "Numbers retrieved without the column meaning that makes them readable",
        ],
        [
          "Source code",
          "Syntax-aware split on function or class boundaries",
          "One symbol per chunk",
          "Function bodies split in half; signatures orphaned from implementations",
        ],
        [
          "Chat transcripts, tickets",
          "Conversation turns grouped by thread",
          "One exchange per chunk",
          "A question retrieved without its answer",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Chunk size trades **recall** against **sufficiency**. Smaller chunks produce sharper embeddings and match more queries, but may not carry enough context to answer. Larger chunks carry more context but dilute the embedding: one vector now represents several topics, so cosine similarity drops for every one of them. Overlap buys back sufficiency without giving up recall.",
    },

    { kind: "heading", text: "Indexing is not only vectors" },
    {
      kind: "prose",
      md: "A vector index alone answers *what is semantically similar*. Production systems usually need more than that.\n\n**Hybrid retrieval** combines dense vector similarity with lexical search such as BM25. Dense search handles paraphrase and synonym; lexical search handles the exact tokens that embeddings are bad at — error codes, part numbers, proper nouns, `SKU-44189`. If users search for identifiers, a pure vector index will disappoint them.\n\n**Metadata filtering** narrows the candidate set before similarity is ever computed. Storing effective dates, document types and access scopes alongside each vector lets you answer *the current policy* rather than *a policy*, and lets you enforce authorization at retrieval time rather than hoping the model declines.\n\n**Re-ranking** applies a slower, more accurate model to the top candidates after a fast first pass. It is the standard answer when recall is fine but precision is poor: the right chunk is being retrieved, just not ranked first.",
    },

    {
      kind: "example",
      title: "Practical example: a 40,000-page benefits knowledge base",
      scenario:
        "An HR assistant answers plan-eligibility questions across a 40,000-page benefits library. It is accurate on general questions and confidently wrong on specifics — quoting last year's deductible, or a rule from the wrong regional plan. Latency is fine and the model has not changed.",
      walkthrough:
        "1. **Reproduce and inspect retrieval, not the model.** Log the chunks actually retrieved for a failing query. They are on-topic but from superseded plan years.\n2. **Diagnose.** The index holds every plan year with no way to distinguish them. Semantically, the 2024 and 2026 deductible paragraphs are nearly identical, so similarity search picks essentially at random.\n3. **Fix the index, not the prompt.** Add `plan_year`, `region` and `document_status` metadata, and filter on them before similarity.\n4. **Fix the chunking.** The eligibility tables had been split by character count, separating rows from their headers. Re-chunk them as row groups with the header replayed.\n5. **Add lexical matching.** Users search plan codes, which embeddings handle poorly. Hybrid retrieval catches those.",
      takeaway:
        "Nothing here was a model problem, and a larger model would not have helped. The fix was in retrieval, which is where the exam expects you to look first.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When a RAG answer is wrong, *use a larger model* and *increase the context window* will both be offered as options. Neither addresses retrieval feeding the model bad chunks — a bigger model reading the wrong document still answers from the wrong document. The exam consistently keys the retrieval-layer option.",
    },

    { kind: "practice", questionId: "D3-q501" },
  ],

  keyTerms: [
    {
      term: "Chunking",
      definition:
        "Splitting parsed source text into the units that are embedded, indexed and ultimately retrieved. The single highest-leverage decision in a RAG pipeline.",
    },
    {
      term: "Overlap",
      definition:
        "Repeating a portion of the preceding chunk at the start of the next, so a statement spanning a boundary survives in at least one chunk intact. Typically 10–15% of chunk size.",
    },
    {
      term: "Hybrid retrieval",
      definition:
        "Combining dense vector similarity with lexical search such as BM25, so the system handles both paraphrase and exact identifiers.",
    },
    {
      term: "Re-ranking",
      definition:
        "Scoring the top-k candidates from a fast first-pass retrieval with a slower, more accurate model. The standard remedy when recall is adequate but precision is poor.",
    },
    {
      term: "Metadata filtering",
      definition:
        "Restricting the candidate set by stored attributes — date, type, access scope — before similarity is computed, rather than filtering after.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Bigger chunks are safer because they preserve more surrounding context.",
      why: "Oversized chunks dilute the embedding: a single vector now has to represent several distinct topics, so its similarity to any one of them falls and recall degrades across the board.",
      instead:
        "Size a chunk to one coherent idea and add overlap to protect statements that straddle a boundary.",
    },
    {
      id: "t2",
      trap: "A RAG system returning confident but wrong answers needs a more capable model.",
      why: "Confidently wrong output with unchanged latency and model version points at the context the model was given, not its reasoning over that context. A larger model reading the wrong chunk reaches the same wrong conclusion.",
      instead:
        "Inspect what retrieval actually returned for the failing query before touching the model.",
    },
    {
      id: "t3",
      trap: "A vector index alone is sufficient, since embeddings capture meaning.",
      why: "Embeddings are weak precisely where exact tokens matter — error codes, SKUs, part numbers and proper nouns — because those carry little semantic signal and near-identical strings embed almost identically.",
      instead:
        "Use hybrid retrieval so lexical matching covers identifiers that dense search handles badly.",
    },
    {
      id: "t4",
      trap: "Chunk size should be tuned to fill the model's context window.",
      why: "Context window size constrains how much you can pass, but it says nothing about which split makes a chunk independently meaningful and retrievable, which is what chunking actually decides.",
      instead:
        "Derive chunk boundaries from the structure of the source data, then decide how many chunks the window can hold.",
    },
    {
      id: "t5",
      trap: "Re-embedding is unnecessary when you switch embedding models, as long as dimensions match.",
      why: "Vectors are only comparable within the model that produced them; two models place the same text at unrelated coordinates, so similarity scores across them are meaningless even at identical dimensionality.",
      instead:
        "Treat an embedding model change as a full re-index of the corpus.",
    },
  ],

  practiceQuestionIds: ["D3-q501"],

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
} satisfies Lesson;
