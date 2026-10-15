import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q801",
    domain: 3,
    objective: "3.8",
    stem: "A code assistant receives the full text of every file in a 4,000-file repository at the start of each session, which fits inside the model's context window. Engineers report that it frequently edits the wrong file when several have similar names, and that sessions get slower and less precise as they go on. What change should the architect make?",
    choices: [
      {
        id: "A",
        text: "Move to a model with an even larger context window so the repository fits with headroom.",
        rationale:
          "Headroom was never the constraint; the assistant already receives every file and is choosing badly among them.",
      },
      {
        id: "B",
        text: "Supply a directory listing plus read and search tools, and let the assistant load only the files a task requires.",
      },
      {
        id: "C",
        text: "Reorder the files so the most frequently edited appear at the start of the prompt.",
        rationale:
          "Position helps at the margin but leaves thousands of irrelevant files competing for attention on every turn of the session.",
      },
      {
        id: "D",
        text: "Summarize each file to a paragraph and include all 4,000 summaries.",
        rationale:
          "Summaries shrink the payload but discard the exact code the assistant needs in order to edit correctly, trading one failure mode for another.",
      },
    ],
    explanation:
      "Fitting in the window is not the same as being usable. Thousands of similar files dilute attention and are reprocessed on every turn, which is precisely the wrong-file and degradation pattern reported. A map plus on-demand reads keeps the working context proportional to the task.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["progressive-discovery", "context-dilution"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q802",
    domain: 3,
    objective: "3.8",
    stem: "A team argues that because their model's context window can hold their entire 600,000-token policy library, progressive discovery is an unnecessary complication. Which consideration most directly challenges that reasoning?",
    choices: [
      {
        id: "A",
        text: "The library will eventually outgrow even the largest available context window.",
        rationale:
          "A forecast about future size does not address whether the design is sound for the corpus they have today.",
      },
      {
        id: "B",
        text: "Context is billed per token, making the approach expensive.",
        rationale:
          "Cost is a genuine concern that caching largely addresses; the stronger objection is about the quality of reasoning over the payload.",
      },
      {
        id: "C",
        text: "Relevant passages compete for attention with everything else loaded, so accuracy degrades as the irrelevant share grows.",
      },
      {
        id: "D",
        text: "Loading the library requires a slow parsing step at the start of each session.",
        rationale:
          "Ingest time is a one-off setup cost and is not the reason a mostly irrelevant payload hurts answer quality.",
      },
    ],
    explanation:
      "Capacity and effectiveness are different properties. A window large enough to hold a corpus says nothing about whether the model can reliably find and use the small part that matters, and the irrelevant remainder is reprocessed on every turn. The decision should follow from what fraction of the corpus a typical task actually needs.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["progressive-discovery", "context-dilution"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q803",
    domain: 3,
    objective: "3.8",
    stem: "Two designs for an internal assistant are being compared. Design A loads a 30,000-token stable operations manual as a cached prefix. Design B supplies a 1,200-token index of manual sections plus a tool to fetch sections on demand. Sessions average twelve turns, and a typical session touches three sections. Which analysis best supports the decision?",
    choices: [
      {
        id: "A",
        text: "Compare cost and latency per completed session, since Design A carries 30,000 cached tokens through all twelve turns while Design B pays a small prefix plus three fetches.",
      },
      {
        id: "B",
        text: "Prefer Design B because it always sends fewer tokens.",
        rationale:
          "Fewer tokens per request does not settle it; twelve turns of repeated fetching can exceed a cached prefix, so the comparison has to be per session.",
      },
      {
        id: "C",
        text: "Prefer Design A because caching makes the prefix free after the first request.",
        rationale:
          "Cached input is cheaper but not free, and the cached content still occupies the window and is reasoned over on every turn.",
      },
      {
        id: "D",
        text: "Prefer Design A because it guarantees the assistant sees all relevant material.",
        rationale:
          "Presence in the window does not guarantee use, and this reasoning ignores the attention cost of the sections a session never needs.",
      },
    ],
    explanation:
      "Neither strategy is right by default; the numbers decide. The unit of comparison is the session rather than the request, because a cached prefix is carried through every turn while progressive fetches are paid once each. Attention cost over the unused portion belongs in the same comparison.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["progressive-discovery", "caching", "cost-analysis"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q804",
    domain: 3,
    objective: "3.8",
    stem: "An agent using progressive discovery over a 900-document knowledge base either fetches nothing at all or fetches more than a dozen documents per task, with little in between. The index it is given lists document filenames and nothing else. What should change first?",
    choices: [
      {
        id: "A",
        text: "Cap the number of documents the agent may fetch per task.",
        rationale:
          "A cap suppresses one symptom and worsens the other, since the agent still has no basis for choosing which documents to fetch.",
      },
      {
        id: "B",
        text: "Switch to a monolithic strategy and load all 900 documents.",
        rationale:
          "This abandons the design over a fixable defect in the map, and reintroduces the dilution problem progressive discovery was chosen to avoid.",
      },
      {
        id: "C",
        text: "Add a re-ranking pass over the documents the agent fetched.",
        rationale:
          "Re-ranking operates after the fetch decision, so it cannot help an agent that fetched nothing or fetched indiscriminately.",
      },
      {
        id: "D",
        text: "Enrich each index entry with a short description of what the document covers, so relevance can be judged before fetching.",
      },
    ],
    explanation:
      "Progressive discovery depends entirely on the quality of the map. Filenames give the agent no basis for judging relevance, so it either guesses and gives up or pulls everything plausible — the round trips of one strategy with the context bloat of the other. Describing each entry restores the decision the design assumed it could make.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["progressive-discovery", "indexing", "tool-design"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q805",
    domain: 3,
    objective: "3.8",
    stem: "An architect is allocating context for a claims assistant between material that is always resident, material fetched on demand, and material never loaded. Which TWO belong in the always-resident tier?",
    choices: [
      {
        id: "A",
        text: "The assistant's role, its escalation rules and the output contract it must produce.",
      },
      {
        id: "B",
        text: "The full text of the claim file currently under discussion.",
        rationale:
          "A claim file is exactly what on-demand fetching is for: it is large, it differs per conversation, and it is needed only once the claim is identified.",
      },
      {
        id: "C",
        text: "The complete policy wordings library, so any clause can be quoted without a lookup.",
        rationale:
          "A whole library is the canonical monolithic load; almost none of it is relevant to a given claim and its presence dilutes what is.",
      },
      {
        id: "D",
        text: "The index or map describing what can be fetched and when each entry applies.",
      },
      {
        id: "E",
        text: "Historical claims from the last five years, for precedent.",
        rationale:
          "Precedent matters occasionally and is enormous, which makes it either fetched on demand or, if no plausible task needs it, not loaded at all.",
      },
    ],
    explanation:
      "The hybrid works when the resident tier holds only what every turn needs: the instructions that govern behavior, and the map that makes discovery possible. Everything sized by the corpus rather than by the task belongs behind a fetch, because a resident tier that grows with the data reproduces the monolithic problem it was meant to avoid.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["progressive-discovery", "hybrid", "context-budget"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D3-q806",
    domain: 3,
    objective: "3.8",
    stem: "A team loads a 25,000-token operations reference as a cached prefix on every request and reports an excellent cache hit rate. The reference is now edited several times a day by on-call engineers. Cost and latency have climbed sharply even though request volume is flat. What explains it, and what follows?",
    choices: [
      {
        id: "A",
        text: "The reference has grown past the point where caching is economical, so it should be summarized before loading.",
        rationale:
          "Summarizing would shrink it, but the size is unchanged; what changed is how often the cached prefix stops matching.",
      },
      {
        id: "B",
        text: "The cache hit rate is being measured incorrectly, since frequent edits cannot coexist with a high rate.",
        rationale:
          "The reported rate may well be accurate over a window, and the design problem exists whether or not the metric is precise.",
      },
      {
        id: "C",
        text: "Each edit invalidates the prefix, so volatile material should be fetched on demand rather than held resident in a cached prefix.",
      },
      {
        id: "D",
        text: "Engineers are editing the reference while requests are in flight, so requests should be queued during edits.",
        rationale:
          "Serializing edits against traffic would add operational pain without changing the fact that the material changes many times a day.",
      },
    ],
    explanation:
      "A resident cached prefix pays for itself only while it is stable, because every change makes the next request re-process the whole block. Volatility is one of the signals that selects progressive discovery: material that changes through the day belongs behind a fetch, where an edit costs one lookup rather than every request's prefix.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["progressive-discovery", "caching", "volatility"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
