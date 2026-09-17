import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q501",
    domain: 3,
    objective: "3.5",
    stem: "A financial-services team indexes a library of regulatory filings. Each filing has a rigid section structure, and analysts ask questions that almost always concern a single section, such as risk factors or executive compensation. The team currently splits every filing into fixed 800-character chunks and reports that answers often mix content from unrelated sections. Which chunking change best addresses this?",
    choices: [
      { id: "A", text: "Split on section boundaries so each chunk holds one complete section.", },
      {
        id: "B",
        text: "Halve the chunk size to 400 characters to make each chunk more focused.",
        rationale:
          "Smaller fixed chunks still cut across section boundaries; they simply produce more fragments per section and worsen the sufficiency problem.",
      },
      {
        id: "C",
        text: "Double the chunk size to 1,600 characters so more of a section fits in each chunk.",
        rationale:
          "Larger arbitrary chunks span even more unrelated sections, diluting each embedding and making the mixing complaint worse rather than better.",
      },
      {
        id: "D",
        text: "Keep fixed chunking and raise the number of chunks retrieved per query.",
        rationale:
          "Retrieving more of the same badly-cut chunks increases the volume of irrelevant content in the prompt; it treats a symptom of the split, not the split.",
      },
    ],
    explanation:
      "The source data has explicit, meaningful structure and queries map onto that structure, so chunk boundaries should follow section boundaries. Chunking decisions derive from the shape of the data, and fixed character splits discard exactly the structure that makes these documents retrievable.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["rag", "chunking"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q502",
    domain: 3,
    objective: "3.5",
    stem: "An enterprise search assistant handles two query styles: conceptual questions phrased in natural language, and lookups of exact part numbers such as HX-4471-B. Conceptual questions work well against the existing vector index; part-number lookups frequently return unrelated components. What should the architect change?",
    choices: [
      {
        id: "A",
        text: "Increase the embedding dimensionality so identifiers are represented more precisely.",
        rationale:
          "Dimensionality does not give a model semantic signal that is not there. Near-identical identifier strings embed to near-identical vectors regardless of how many dimensions are used.",
      },
      { id: "B", text: "Add lexical search alongside the vector index and combine the results." },
      {
        id: "C",
        text: "Lower the similarity threshold so more candidates are returned for identifier queries.",
        rationale:
          "Returning more low-similarity candidates from an index that cannot distinguish identifiers surfaces more wrong parts, not the right one.",
      },
      {
        id: "D",
        text: "Instruct the model in the system prompt to pay closer attention to part numbers.",
        rationale:
          "Prompting cannot recover a document that retrieval never returned. The failure happens before the model sees anything.",
      },
    ],
    explanation:
      "Part numbers carry almost no semantic signal, so dense embeddings place unrelated identifiers close together. Hybrid retrieval pairs dense search for paraphrase with lexical matching for exact tokens, which is the standard answer whenever a corpus mixes conceptual and identifier queries.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["rag", "hybrid-retrieval"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q503",
    domain: 3,
    objective: "3.5",
    stem: "A support assistant is grounded in a knowledge base that is re-indexed nightly. After a routine re-index, users report that the assistant answers confidently but cites procedures that were retired two years ago. Latency, model version and prompt template are all unchanged. Which two actions most directly address the root cause? (Select TWO.)",
    choices: [
      { id: "A", text: "Add document status and effective-date metadata to the index and filter on it at retrieval time." },
      {
        id: "B",
        text: "Raise the model's temperature so it hedges more on uncertain answers.",
        rationale:
          "Temperature changes phrasing variability, not which documents were retrieved. The assistant is faithfully reporting what it was given.",
      },
      { id: "C", text: "Verify that retired documents were actually removed or superseded in the re-index job." },
      {
        id: "D",
        text: "Switch to a larger model so it recognises outdated procedures.",
        rationale:
          "A larger model reading a retired procedure with no signal that it is retired reaches the same conclusion. Model capability does not substitute for corpus hygiene.",
      },
      {
        id: "E",
        text: "Increase the number of retrieved chunks so current procedures are also included.",
        rationale:
          "Adding current procedures alongside retired ones gives the model contradictory context without telling it which to trust, which tends to produce worse answers rather than better.",
      },
    ],
    explanation:
      "Confidently wrong answers correlated with a re-index point at the corpus and the index, not the model. The fix is to make recency explicit — verify the ingestion actually retired old documents, and store status and effective dates as filterable metadata so superseded content cannot be retrieved as current.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "indexing", "metadata"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D3-q504",
    domain: 3,
    objective: "3.5",
    stem: "An architect reviews a RAG pipeline where evaluation shows the correct chunk appears in the top twenty retrieved results roughly 95% of the time, but appears in the top three only 40% of the time. The prompt passes the top three chunks to the model. What is the most appropriate change?",
    choices: [
      {
        id: "A",
        text: "Re-chunk the corpus with smaller chunks and more overlap.",
        rationale:
          "Re-chunking addresses recall, and recall is already 95%. The correct content is being found; the problem is where it lands in the ordering.",
      },
      { id: "B", text: "Add a re-ranking pass over the top twenty candidates before selecting three." },
      {
        id: "C",
        text: "Switch to a different embedding model and re-index the corpus.",
        rationale:
          "A full re-index is an expensive response to a precision problem that a re-ranker solves directly, and it risks regressing the recall that currently works well.",
      },
      {
        id: "D",
        text: "Pass all twenty retrieved chunks to the model instead of three.",
        rationale:
          "This raises cost and latency on every request and buries the right chunk among seventeen irrelevant ones, which degrades answer quality even though the content is technically present.",
      },
    ],
    explanation:
      "High recall with poor precision is the textbook signal for re-ranking: a fast first pass finds the right material, and a slower, more accurate model reorders the shortlist. Re-chunking or re-embedding would target recall, which is not the failing metric here.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "re-ranking", "evaluation"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q505",
    domain: 3,
    objective: "3.5",
    stem: "A team migrates its RAG pipeline from one embedding model to another with the same vector dimensionality. To save time and cost, they plan to embed only newly ingested documents with the new model and leave existing vectors in place, since the dimensions still match. What is the most significant consequence?",
    choices: [
      {
        id: "A",
        text: "Query latency will increase because the index now contains two vector formats.",
        rationale:
          "Both sets of vectors have identical dimensionality, so the index treats them uniformly and search performance is essentially unchanged. The problem is correctness, not speed.",
      },
      { id: "B", text: "Similarity scores become meaningless across the two sets, so retrieval quality degrades unpredictably." },
      {
        id: "C",
        text: "The index will reject the new vectors because they were produced by a different model.",
        rationale:
          "A vector index stores arrays of floats and has no knowledge of which model produced them. Nothing will fail loudly, which is precisely what makes this dangerous.",
      },
      {
        id: "D",
        text: "Storage requirements will roughly double for the affected documents.",
        rationale:
          "Each document still holds one vector of the same size; nothing is duplicated. Storage is unaffected.",
      },
    ],
    explanation:
      "Embedding vectors are only comparable within the model that produced them. Two models place the same text at unrelated coordinates, so cosine similarity between a new query vector and an old document vector is noise even at identical dimensionality. Changing embedding models requires re-indexing the entire corpus, and the failure is silent rather than loud.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "embeddings", "migration"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
