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
    stem: "A team indexes several thousand product spec sheets exported as HTML. The data that matters sits in tables whose column headers carry the unit and meaning of every number beneath them. The current parser strips all markup to plain text before chunking, and retrieved chunks routinely contain bare figures that the assistant then attributes to the wrong attribute. Which pipeline change addresses the cause?",
    choices: [
      {
        id: "A",
        text: "Increase chunk overlap so a header is more likely to appear in the neighbouring chunk.",
        rationale:
          "Overlap only repeats whatever text sits at a boundary, and in a long table the header is thousands of characters away from most rows, so it is not recovered.",
      },
      { id: "B", text: "Parse the tables as structure and chunk them as row groups with the column headers replayed into every chunk." },
      {
        id: "C",
        text: "Embed each spec sheet as a single chunk so no table is ever split.",
        rationale:
          "One vector standing for a whole sheet represents many attributes at once, which dilutes the embedding and lowers similarity for every question asked of it.",
      },
      {
        id: "D",
        text: "List the attribute names in the system prompt so the assistant can map bare figures back to their columns.",
        rationale:
          "A generic list cannot tell the model which column a particular retrieved number came from, because that association was destroyed at parse time, long before retrieval ran.",
      },
    ],
    explanation:
      "Parsing is the first pipeline decision, and a parser that flattens markup throws away the structure the chunker needs. Column headers carry the meaning of the numbers beneath them, so tabular sources are chunked as row groups with the header replayed into each chunk. No amount of overlap, prompt wording or chunk resizing restores signal that was discarded before chunking began.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["rag", "parsing", "chunking"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q503",
    domain: 3,
    objective: "3.5",
    stem: "A support assistant is grounded in a knowledge base that is re-indexed nightly. After a routine re-index, users report that the assistant answers confidently but cites procedures that were retired two years ago. Latency, model version and prompt template are all unchanged. Which two actions most directly address the root cause?",
    choices: [
      { id: "A", text: "Add document status and effective-date metadata to the index and filter on it at retrieval time." },
      {
        id: "B",
        text: "Instruct the assistant in the system prompt to cite only the most recently updated procedure available to it.",
        rationale:
          "Nothing in the retrieved text tells the model which procedure is newest, so the instruction asks it to sort on metadata that was never indexed or passed into the context.",
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
    stem: "An architect evaluates a policy assistant against 300 questions drawn from a 900-page handbook of continuous prose. The retrieved chunk is on topic 96% of the time, yet graders mark a fifth of the answers incomplete, and inspection shows the chunk ending partway through a rule whose qualifying exception begins in the following chunk. The handbook is split into 750-token units with no overlap. What is the most appropriate change?",
    choices: [
      {
        id: "A",
        text: "Raise the number of chunks passed to the model from three to ten so the continuation is more likely to be included.",
        rationale:
          "Nothing makes the adjacent unit rank highly enough to be among the ten returned, so this pays input cost on every query and only sometimes works by accident.",
      },
      { id: "B", text: "Add overlap of roughly 10-15% of the chunk size so a statement that spans a boundary survives intact in at least one chunk." },
      {
        id: "C",
        text: "Halve the unit size to 375 tokens so each chunk is more tightly focused.",
        rationale:
          "Smaller units double the number of boundaries, which makes it more likely rather than less that a rule and its exception end up separated.",
      },
      {
        id: "D",
        text: "Re-embed the corpus with a model that accepts a longer input.",
        rationale:
          "The embedding model's input limit is not the constraint here, because the text is split before it is ever embedded, so a longer limit changes nothing about where the boundaries fall.",
      },
    ],
    explanation:
      "Chunk size trades recall against sufficiency, and the failing property here is sufficiency: retrieval reaches the right region, but the unit it returns does not contain the whole rule. Overlap repeats the tail of each chunk at the head of the next, which keeps a statement that crosses a boundary intact without giving up the sharper embeddings that smaller units provide.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "chunking", "overlap"],
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
  {
    schemaVersion: 1,
    id: "D3-q506",
    domain: 3,
    objective: "3.5",
    stem: "A RAG assistant over 12,000 scanned policy PDFs returns chunks that are on topic but frequently contain a page header, a footer with a document control number, and text from an adjacent column interleaved mid-sentence. Retrieval scores look reasonable and the team is considering a larger model. Where does the fix belong?",
    choices: [
      {
        id: "A",
        text: "In chunking: use smaller chunks so the stray header and footer text is isolated in its own chunk.",
        rationale:
          "Smaller chunks distribute the same noise across more of them and shrink the coherent text each one carries.",
      },
      {
        id: "B",
        text: "In the model call: instruct the model to ignore headers, footers and control numbers when reading a chunk.",
        rationale:
          "The model can be told to disregard obvious furniture, but the interleaved columns have already corrupted the sentences it must rely on.",
      },
      {
        id: "C",
        text: "In re-ranking: score candidates so the cleanest chunks are preferred.",
        rationale:
          "Re-ranking chooses among what the pipeline produced, and here every candidate carries the same defect because all of them came through the same parser.",
      },
      {
        id: "D",
        text: "In parsing: extract clean, correctly ordered text with layout handled before anything is chunked or embedded.",
      },
    ],
    explanation:
      "Parse is the first stage for a reason: every later stage inherits whatever it produces. Embeddings computed over interleaved columns encode noise, and no chunk size, re-ranker or model recovers text that was never read in the right order.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["rag", "parsing", "pipeline"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q507",
    domain: 3,
    objective: "3.5",
    stem: "A parts assistant is indexed with dense vectors over a catalogue of components. Questions phrased in prose work well. Questions naming an exact part number such as \"what is the lead time on BRK-4471-A\" often return a chunk about a similar but different part. What should the team change?",
    choices: [
      {
        id: "A",
        text: "Re-embed the catalogue with a model trained on technical text so identifiers are represented better.",
        rationale:
          "A better embedding shifts which near neighbors win, while an identifier needs an exact match rather than a closer approximation.",
      },
      {
        id: "B",
        text: "Increase the number of retrieved chunks so the correct part appears somewhere in the set.",
        rationale:
          "A longer candidate list buries the right chunk among lookalikes and leaves the model to pick between part numbers it cannot distinguish.",
      },
      {
        id: "C",
        text: "Add lexical search alongside the vector index and combine the two, so exact identifier matches are retrieved on their own merits.",
      },
      {
        id: "D",
        text: "Chunk at one component per chunk so each part number sits in its own passage.",
        rationale:
          "One part per chunk is sound design and is likely already the case, but it does nothing about a retriever that ranks by semantic similarity.",
      },
    ],
    explanation:
      "Indexing is not only vectors. Embeddings capture meaning, which is exactly wrong for tokens whose value is their exactness: BRK-4471-A and BRK-4471-B mean nearly the same thing to a similarity search and completely different things to a customer. Hybrid retrieval keeps the semantic behaviour while letting lexical matching handle identifiers.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["rag", "hybrid-retrieval", "indexing"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
