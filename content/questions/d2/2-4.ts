import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D2-q401",
    domain: 2,
    objective: "2.4",
    stem: "A chat assistant is fast and inexpensive for the first few exchanges of a session. By the twentieth turn, time-to-first-token has roughly tripled and cost per request is about five times the opening turn. The model, prompt template and retrieval settings have not changed. What is the most likely cause and the correct first fix?",
    choices: [
      {
        id: "A",
        text: "The retrieval index has grown over time; rebuild it with smaller chunks.",
        rationale:
          "Index size affects search time, not the length of the prompt sent to the model, and it would not produce a per-session ramp that resets with each new conversation.",
      },
      {
        id: "B",
        text: "The model degrades under sustained load; add a concurrency limit to the service.",
        rationale:
          "The pattern tracks turn number within a session rather than overall traffic, which rules out load as the driver.",
      },
      {
        id: "C",
        text: "Conversation history is accumulating in every request; compact older turns into a structured summary and drop the raw exchange.",
      },
      {
        id: "D",
        text: "The context window is close to full; move to a model with a larger window.",
        rationale:
          "A larger ceiling lets the session grow further before failing while making every request in it slower and more expensive, so it postpones the symptom and worsens the cause.",
      },
    ],
    explanation:
      "Cost and latency scale with tokens actually sent, and in a conversational system the term that grows is history — each turn appends the user message, the response, and any tool calls between them. Compaction replaces older turns with a summary that preserves decisions and identifiers, which is what stops the linear growth.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["context-window", "compaction", "cost"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D2-q402",
    domain: 2,
    objective: "2.4",
    stem: "A team budgeted a prompt at 6,000 tokens by counting about 4,500 words and multiplying by an estimate of 1.3 tokens per word. In production the same prompt regularly overruns the budget, and the requests that overrun are consistently the ones carrying minified JSON configuration and Japanese product names. What went wrong?",
    choices: [
      {
        id: "A",
        text: "Token counts vary per request because the model tokenizes non-deterministically, so any estimate is approximate.",
        rationale:
          "Tokenization is deterministic for a given text and tokenizer. The same input always yields the same count, which is why measurement is possible at all.",
      },
      {
        id: "B",
        text: "The estimate omitted the output tokens, which also consume the window.",
        rationale:
          "Output does share the window and should be reserved, but that would inflate every request uniformly rather than only those containing JSON and Japanese text.",
      },
      {
        id: "C",
        text: "Whitespace inflates the JSON token count and should be stripped before sending.",
        rationale:
          "The failing payloads are already minified, so there is no whitespace left to remove, and the overrun persists regardless.",
      },
      {
        id: "D",
        text: "Word-based estimates understate dense payloads: subword tokenization splits minified JSON and non-Latin text into far more tokens per character than English prose.",
      },
    ],
    explanation:
      "Tokens are subword units, not words. Punctuation-heavy structured text and non-Latin scripts fragment into many more tokens per character than English prose, so a words-times-a-constant estimate under-counts precisely the payloads most likely to overflow. Budget from a real tokenizer and log actual usage per request.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["tokenization", "budgeting"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D2-q403",
    domain: 2,
    objective: "2.4",
    stem: "An assistant answers questions about a 40-page contract that is supplied in full with every request. The contract text is identical across requests within a deal, and the questions vary. The team wants to reduce time-to-first-token. Where should the question sit relative to the contract?",
    choices: [
      {
        id: "A",
        text: "After the contract, so the model has read the material before receiving the instruction and so the contract can occupy a stable, cacheable prefix.",
      },
      {
        id: "B",
        text: "Before the contract, so the model knows what it is looking for as it reads.",
        rationale:
          "It is intuitive but backwards on both counts: it puts the varying content at the front, which prevents any of the contract below it from being reused across requests.",
      },
      {
        id: "C",
        text: "Split into two copies, one before the contract and one after, for redundancy.",
        rationale:
          "It doubles the varying content, still places some of it above the contract, and leaves nothing beneath it reusable.",
      },
      {
        id: "D",
        text: "Position has no bearing on latency; only the total token count matters.",
        rationale:
          "Ordering determines how much of the prompt can be reused from a cache, which is one of the largest levers available on time-to-first-token.",
      },
    ],
    explanation:
      "Placing long reference material first and the instruction last helps the model act on what it has just read, and it composes with caching: the static contract sits in the reusable prefix while the varying question sits below it. Any variable content placed above the contract would make every token after it uncacheable.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["context-window", "prompt-ordering", "caching"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q404",
    domain: 2,
    objective: "2.4",
    stem: "An agent's requests sit close to the context limit. Each one carries definitions for 40 tools, an 18-turn history, 20 retrieved chunks and a 4,000-token system prompt, and a typical task uses three or four tools. Which TWO changes reduce context pressure without discarding information the task needs?",
    choices: [
      {
        id: "A",
        text: "Expose only the tools relevant to the current task and put the remainder behind on-demand discovery.",
      },
      {
        id: "B",
        text: "Re-rank the retrieved chunks and pass the best five rather than all twenty.",
      },
      {
        id: "C",
        text: "Truncate the system prompt to its first 1,000 tokens.",
        rationale:
          "Cutting the prompt at an arbitrary point removes rules and the output contract the task depends on, which is exactly the information loss the question excludes.",
      },
      {
        id: "D",
        text: "Move to a model with a larger context window.",
        rationale:
          "A larger ceiling raises how much can be sent without reducing how much is sent, so cost, latency and dilution are all unchanged.",
      },
      {
        id: "E",
        text: "Concatenate the 18 turns into a single message to reduce per-message overhead.",
        rationale:
          "Message framing is a negligible share of the total, so the same content in one envelope occupies essentially the same space.",
      },
    ],
    explanation:
      "Both keyed changes remove material the task does not use rather than material it needs. Trimming the tool surface to what is relevant cuts a large fixed block, and re-ranking before truncation keeps the chunks that answer the question while dropping the fifteen that dilute it. Neither loses information the task actually depends on.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["context-window", "tools", "retrieval"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D2-q405",
    domain: 2,
    objective: "2.4",
    stem: "A team trimmed a prompt from 12,000 tokens to 9,000 and found that end-to-end response time barely moved. The assistant returns around 900 tokens per response. They ask the architect why the saving did not materialize. What is the most likely explanation?",
    choices: [
      {
        id: "A",
        text: "Input tokens are processed one at a time, so a 25% reduction should have produced a proportional saving and something else must be wrong.",
        rationale:
          "Input is processed in parallel rather than serially, which is precisely why cutting it yields a much smaller latency win than intuition suggests.",
      },
      {
        id: "B",
        text: "Output is generated one token at a time and dominates wall-clock time, so the 900-token response is the bottleneck rather than the input.",
      },
      {
        id: "C",
        text: "The change invalidated the cached prefix, and the lost cache hits offset the saving.",
        rationale:
          "That is a real risk worth checking, but it would have made response time noticeably worse rather than leaving it essentially unchanged.",
      },
      {
        id: "D",
        text: "Response time is a function of the model's context window size rather than of how many tokens are processed.",
        rationale:
          "Window size is a ceiling, not a cost. Latency tracks the tokens actually processed, not the maximum the model would accept.",
      },
    ],
    explanation:
      "Input and output contribute to latency very differently: input is processed largely in parallel while output is produced serially, one token after another. That makes a long response the dominant latency term, which is why capping output length or tightening the requested format is often a bigger win than trimming thousands of input tokens.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["latency", "output-tokens"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D2-q406",
    domain: 2,
    objective: "2.4",
    stem: "An assistant answers questions from an internal knowledge base. A team raised the number of retrieved chunks from five to twenty-five, expecting better coverage. Accuracy fell, and answers now frequently cite a passage related to the question that does not actually address it. Which TWO changes most directly address the cause?",
    choices: [
      {
        id: "A",
        text: "Rerank the retrieved chunks and pass only the highest-scoring few to the model.",
      },
      {
        id: "B",
        text: "Move to a model with a larger context window so all twenty-five chunks fit comfortably.",
        rationale:
          "The chunks already fit; the loss comes from relevant material competing with irrelevant material rather than from a capacity limit.",
      },
      {
        id: "C",
        text: "Raise the relevance threshold so weakly matching chunks are dropped before the call rather than ranked into it.",
      },
      {
        id: "D",
        text: "Add a chain-of-thought instruction so the model reasons about which chunk is most relevant.",
        rationale:
          "Reasoning over a diluted context spends output tokens and latency on a selection problem retrieval should have settled before the call.",
      },
      {
        id: "E",
        text: "Increase the chunk size so each retrieved passage carries more surrounding context.",
        rationale:
          "Larger chunks add more competing text per result, pushing the ratio of relevant to irrelevant material further in the wrong direction.",
      },
    ],
    explanation:
      "Context is not free real estate: relevant material competes for attention with everything else in the window, so once coverage is adequate precision matters more than recall. Dilution is fixed before the call by ranking and thresholding, not after it by a bigger window or more reasoning.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["context-window", "dilution", "retrieval"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D2-q407",
    domain: 2,
    objective: "2.4",
    stem: "A conversational assistant grows slower and more expensive the longer a session runs, and by the thirtieth turn it starts answering from a detail the user corrected twenty turns earlier. An engineer proposes moving to a model with a four-times-larger context window. What is the strongest objection?",
    choices: [
      {
        id: "A",
        text: "A larger window postpones the limit without touching the cause: the whole history is still re-sent and re-read every turn, so cost, latency and the stale detail all persist.",
      },
      {
        id: "B",
        text: "Larger-context models are priced higher per token, so the change would raise cost further.",
        rationale:
          "Per-token price is secondary to the fact that the token count itself keeps growing every turn whatever the window size.",
      },
      {
        id: "C",
        text: "The assistant would then exceed the provider's request size limit on long sessions.",
        rationale:
          "Raising that ceiling is precisely what a bigger window does, so it is the one problem the proposal genuinely solves.",
      },
      {
        id: "D",
        text: "Model quality varies between tiers, so answers might get worse after the switch.",
        rationale:
          "A tier change carries quality risk in general, but it says nothing about why this assistant degrades as a session lengthens.",
      },
    ],
    explanation:
      "Buying headroom at the point of failure is the standard wrong answer on this objective. Growing history is a design problem addressed by compaction, summarization and dropping superseded turns; until that exists, a larger window moves the same curve to the right while the corrected detail stays in the context being re-read.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["context-window", "compaction", "long-conversations"],
    type: "single",
    correct: "A",
  },
] satisfies Question[];
