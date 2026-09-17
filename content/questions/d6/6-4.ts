import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D6-q401",
    domain: 6,
    objective: "6.4",
    stem: "A team keeps its production prompts in a wiki appendix attached to the architecture document, and the deployed service reads its prompts from a configuration file in the repository. An evaluation result from last quarter cannot be reproduced, and nobody can establish which prompt text produced it. What should the architect change?",
    choices: [
      {
        id: "A",
        text: "Restrict edit rights on the wiki page so only the architect can change the prompts.",
        rationale:
          "Locking one of two copies slows divergence without removing it, and it still leaves no record of which text was live at any given time.",
      },
      {
        id: "B",
        text: "Move prompts into the repository under version control, reference them by id in configuration and traces, and delete the wiki copy.",
      },
      {
        id: "C",
        text: "Add a weekly process that copies the wiki page into the repository so the two stay aligned.",
        rationale:
          "A sync between two writable copies is a drift generator with extra steps, and it guarantees a window in which the two disagree.",
      },
      {
        id: "D",
        text: "Include the full prompt text in the architecture document so reviewers can inspect the exact wording.",
        rationale:
          "Quoting the prompt in a document creates yet another copy to fall out of date and does nothing to make past results reproducible.",
      },
    ],
    explanation:
      "Prompts are source code: versioned, reviewed and referenced by id from configuration and from every trace. A single authoritative copy is what lets any recorded evaluation result be tied back to the exact instructions that produced it, which is the precondition for reproducing or comparing any run.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["documentation", "prompt-versioning"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q402",
    domain: 6,
    objective: "6.4",
    stem: "An implementation partner removed a metadata filter on region from the retrieval query because it complicated a join and appeared to be a performance optimization. The filter was required by a data residency agreement. The architect's guidance had listed the step as “filter results by region.” What documentation change best prevents a recurrence?",
    choices: [
      {
        id: "A",
        text: "Mark the filter as a fixed constraint the implementer may not change, and enforce it with a test that fails the build when the region filter is missing, with the data residency obligation recorded in the test's failure message.",
      },
      {
        id: "B",
        text: "Add a code review rule requiring architect approval for any change to retrieval code.",
        rationale:
          "A review gate only helps if the reviewer knows why the filter exists, and it adds a standing bottleneck on every unrelated retrieval change.",
      },
      {
        id: "C",
        text: "Move the requirement into the architecture diagram so that it is more prominent.",
        rationale:
          "Greater prominence without the reason attached leaves the instruction just as easy to dismiss as an optimization.",
      },
      {
        id: "D",
        text: "Add an assertion to the retrieval test suite that checks for the region filter, with no comment or message explaining what it protects.",
        rationale:
          "An unexplained assertion reads as leftover scaffolding and is deleted with the same confidence as the filter was; a gate has to carry its reason to survive the next refactor.",
      },
    ],
    explanation:
      "Implementation guidance must say what an implementer may decide and what they may not, and a regulatory constraint is exactly the case for building the gate rather than restating the instruction. The durable form combines both: the build fails when the filter is missing, and the failure message names the residency obligation, so the next engineer meets the reason at the moment they would otherwise have removed it. Advisory wording alone relies on goodwill, and an unexplained test invites the same deletion as the filter.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["implementation-guidance", "constraints"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q403",
    domain: 6,
    objective: "6.4",
    stem: "An architect is assembling the handoff package for an implementation partner who must reproduce the architect's reported baseline of 91% field accuracy before building on top of it. Which TWO items are essential for that reproduction?",
    choices: [
      {
        id: "A",
        text: "The architect's evaluation report showing the per-field accuracy breakdown behind the 91% figure.",
        rationale:
          "A breakdown tells the partner what the result looked like, which is not the same as re-deriving it; reading a number reproduces nothing on its own.",
      },
      {
        id: "B",
        text: "A runnable evaluation command and the path to the golden set it scores against.",
      },
      {
        id: "C",
        text: "The pinned model id, prompt version and retrieval parameters used to produce the baseline numbers.",
      },
      {
        id: "D",
        text: "A month of production traces, so the partner can score the system against the real input distribution.",
        rationale:
          "Live traffic is valuable for finding new failures, but it is not the population the 91% was measured on, so scoring against it yields a different number rather than the same one.",
      },
      {
        id: "E",
        text: "A written description of the chunking, retrieval and prompting approach, detailed enough to re-implement it.",
        rationale:
          "A description lets the partner build something similar, and something similar scores differently; reproduction needs the exact pinned artifacts rather than a reconstruction of them.",
      },
    ],
    explanation:
      "Reproducing a number requires the same inputs, the same scoring and the same configuration. A runnable eval against a named golden set supplies the first two, and pinned model, prompt and retrieval settings supply the third; without both, the partner can only take the architect's figure on faith. Everything else in the package — the reported breakdown, real traffic, a prose description of the approach — is useful work that produces a different number rather than the same one.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["handoff", "reproducibility"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "C"],
  },
  {
    schemaVersion: 1,
    id: "D6-q404",
    domain: 6,
    objective: "6.4",
    stem: "A security reviewer receives the architecture diagram for an agentic assistant that reads incoming customer email, searches an internal knowledge base and can issue refunds through a tool. The diagram shows every service as a labeled box with arrows between them. What must be added before the reviewer can do her job?",
    choices: [
      {
        id: "A",
        text: "The model version used at each stage of the pipeline.",
        rationale:
          "Model versions belong in the configuration record and matter for reproducibility, but they do not show where an attack enters or what it can reach.",
      },
      {
        id: "B",
        text: "Expected latency for each hop, so slow paths are visible.",
        rationale:
          "Latency annotations support performance work and say nothing about trust, authority or data handling.",
      },
      {
        id: "C",
        text: "The prompt text used for each model call.",
        rationale:
          "Prompt wording is a soft control that a reviewer cannot rely on, and it does not describe the structural boundaries she has to assess.",
      },
      {
        id: "D",
        text: "Where untrusted text enters, which components can take consequential actions, and where regulated data is stored and for how long.",
      },
    ],
    explanation:
      "A security review turns on trust boundaries: untrusted content such as customer email and retrieved documents reaching a component that can act, and the location and retention of regulated data. A diagram of boxes and arrows shows connectivity but not authority, which is the property being reviewed.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["diagrams", "trust-boundaries"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q405",
    domain: 6,
    objective: "6.4",
    stem: "An architecture overview written eighteen months ago is still the document everyone consults, but a tool integration added six months ago never appeared in it and a new engineer has just built against the outdated flow. What is the most durable fix?",
    choices: [
      {
        id: "A",
        text: "Schedule a semiannual documentation review for the whole team.",
        rationale:
          "Calendar reviews discover drift months after it happened, and they are the first thing dropped in a busy quarter.",
      },
      {
        id: "B",
        text: "Move the documentation into the code repository so it sits closer to the changes it describes.",
        rationale:
          "Proximity makes updating easier but nothing forces it, so the document can still lag every change by months.",
      },
      {
        id: "C",
        text: "Give the document a named owner and a change trigger — adding a tool or data source requires updating the overview in the same change — enforced through the review checklist.",
      },
      {
        id: "D",
        text: "Generate the architecture overview automatically from the deployed configuration.",
        rationale:
          "Generation captures what exists but never why it was chosen, and the reasoning is the part a reader cannot recover from the running system.",
      },
    ],
    explanation:
      "Documents go stale because nothing connects a change in the system to a change in the document. Naming an owner and binding the update to the event that invalidates it puts the revision inside the work that caused it, rather than in a review round that happens long after anyone remembers the details.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["documentation", "ownership"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
