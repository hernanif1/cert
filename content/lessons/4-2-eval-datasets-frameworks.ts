import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "4.2",
  slug: "4-2-eval-datasets-frameworks",
  domain: 4,
  objective:
    "Design evaluation datasets and test frameworks using mixed methodologies",
  title: "Eval Datasets and Test Frameworks",
  summary:
    "A test framework for an LLM system is three graders — code assertions, an LLM judge, and humans — pointed at one versioned golden set. The architecture question is which grader each check belongs to, and how the golden set is built so it keeps catching regressions instead of quietly becoming a training set.",

  body: [
    {
      kind: "prose",
      md: "Evaluation is the only thing standing between a demo and a system anyone can rely on, and it rests on two artifacts: a golden set that represents the work, and a framework that grades outputs against it. Neither is optional, and the exam treats *mixed methodologies* as the load-bearing phrase — no single grading method covers a real system.",
    },

    { kind: "heading", text: "Building the golden set" },
    {
      kind: "prose",
      md: "A **golden set** pairs inputs with either a reference output or the criteria by which an output is judged acceptable. Four sources feed it, and a suite built from only one is fragile:",
    },
    {
      kind: "list",
      items: [
        "**Production traces** — real inputs, which is the only source that reflects how people actually phrase things. Redact before use.",
        "**Curated hand-written cases** — written to exercise a capability deliberately, including combinations users have not tried yet.",
        "**Synthetic variation** — generated to fill coverage gaps and rare categories cheaply. Useful for breadth, weak as ground truth on its own.",
        "**Adversarial and regression cases** — every bug ever found becomes a permanent case, which is how the suite stops the same failure shipping twice.",
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Stratify the golden set deliberately. A set sampled purely at random mirrors production, which means the rare, high-consequence cases that actually matter appear once or twice and the aggregate score is dominated by easy traffic. Over-sample the hard strata and report per-stratum scores as well as an overall number. Fifty well-chosen cases run on every change beat two thousand run once a quarter.",
    },
    {
      kind: "prose",
      md: "Hold out a slice. Once a team iterates prompts against the whole golden set, that set has become a training set: scores climb because the prompt has been fitted to those specific items, not because the system improved. Keep a blind split that is used only to confirm a release, and version the golden set so a score is always attributable to a known snapshot.",
    },

    { kind: "heading", text: "Three graders, one framework" },
    {
      kind: "table",
      caption: "Push every check to the cheapest grader that can actually decide it",
      headers: ["Grader", "Best for", "Cost and speed", "Main weakness"],
      rows: [
        [
          "Code assertion",
          "Schema validity, required fields, numeric tolerance, tool called, forbidden string absent",
          "Near-free, milliseconds, fully deterministic",
          "Cannot judge anything subjective",
        ],
        [
          "LLM-as-judge",
          "Tone, coherence, groundedness, rubric scores on open-ended text",
          "Cheap enough for thousands of cases per run",
          "Systematic biases; needs calibration",
        ],
        [
          "Human review",
          "Ground truth, disputed cases, calibrating the judge, novel failure discovery",
          "Slow and expensive; hours to days",
          "Does not scale to every change",
        ],
      ],
    },
    {
      kind: "prose",
      md: "**An LLM judge is a measuring instrument, and instruments have known error.** Judges favor the first option presented in a pairwise comparison, reward length and confident phrasing over correctness, score outputs from their own model family more generously, and cluster their scores in a narrow band. None of that makes them unusable; it means they are engineered rather than trusted.\n\nThe standard mitigations are cumulative: give the judge a rubric with explicit anchors for each score rather than a vague scale, supply a reference answer so the task becomes comparison rather than opinion, randomize order in pairwise tests, and use a model from a different family than the one under test. Then measure the judge itself — agreement against a few hundred human-labeled cases — and re-check that agreement whenever the judge prompt or model changes. An uncalibrated judge is a number with unknown units.",
    },
    {
      kind: "example",
      title: "Practical example: an eval suite for a contract-review assistant",
      scenario:
        "The assistant extracts key terms from a contract, flags clauses that deviate from a playbook, and drafts a summary for counsel. The team has one notebook that runs twelve hand-picked contracts and prints outputs for someone to read.",
      walkthrough:
        "1. **Split the checks by grader.** Extracted dates, parties and values become code assertions against a labeled key. Deviation flags become classification against a labeled set, scored with per-class recall. Only the drafted summary needs a judge.\n2. **Build the golden set in strata.** Two hundred contracts, over-sampled on the clause types counsel says are risky, plus every contract that has ever produced a miss.\n3. **Calibrate the judge.** Two lawyers score 150 summaries against the same rubric; the judge prompt is revised until agreement with them is acceptable, and that agreement is itself tracked.\n4. **Wire it into the pipeline.** Code assertions run on every commit as a blocking gate. The full suite including the judge runs nightly and before release. Humans review a weekly sample plus every case where the judge and a code assertion disagree.",
      takeaway:
        "The methodologies are layered by cost and frequency, not chosen once. Deterministic checks run constantly, judges run often, humans run rarely and calibrate everything else.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Have the same model grade its own outputs* and *collect more production data until the golden set is large enough* both appear as tempting answers. The first introduces self-preference bias into the only signal you have; the second delays every decision and still misses the rare strata that random sampling underrepresents.",
    },

    {
      kind: "practice",
      questionIds: [
        "D4-q201",
        "D4-q202",
        "D4-q203",
        "D4-q204",
        "D4-q205",
        "D4-q206",
        "D4-q207",
        "D4-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Golden set",
      definition:
        "A versioned set of inputs paired with reference outputs or acceptance criteria, used as the fixed yardstick against which every system change is scored. The house name for this artifact — not \"golden dataset\" or \"eval set\".",
    },
    {
      term: "LLM-as-judge",
      definition:
        "Using a model to grade another model's output against a rubric. Scales subjective evaluation, but carries position, verbosity and self-preference biases that must be mitigated and measured.",
    },
    {
      term: "Judge calibration",
      definition:
        "Measuring agreement between an LLM judge and human labels on the same cases, then tuning the judge prompt until agreement is acceptable. Re-run whenever the judge model or prompt changes.",
    },
    {
      term: "Regression suite",
      definition:
        "The subset of cases that must never fail again, grown by adding every confirmed bug as a permanent case. Run on every change, not on a schedule.",
    },
    {
      term: "Held-out split",
      definition:
        "Cases reserved from prompt iteration so that a release score reflects generalization rather than fitting to the golden set.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Use an LLM judge for all evaluation, since it handles every kind of check.",
      why: "Anything a deterministic assertion can decide — valid JSON, a required field, a number within tolerance — is decided more cheaply, faster and without variance in code, and handing it to a judge adds cost and noise.",
      instead:
        "Route each check to the cheapest grader that can actually decide it, and reserve the judge for genuinely subjective quality.",
    },
    {
      id: "t2",
      trap: "The model under test is the best judge of its own output, since it understands the task.",
      why: "Judges score outputs from their own model family more generously than a human would, so self-grading inflates the one signal meant to detect problems and hides exactly the failures the eval exists to catch.",
      instead:
        "Judge with a different model family, anchor on a reference answer, and calibrate against human labels.",
    },
    {
      id: "t3",
      trap: "A larger golden set always produces a more trustworthy result.",
      why: "A large set sampled at random is still dominated by easy, common traffic, and its cost and runtime push teams to run it rarely, which removes the fast feedback that actually catches regressions.",
      instead:
        "Stratify toward hard and high-consequence cases, keep the suite fast enough to run on every change, and report per-stratum scores.",
    },
    {
      id: "t4",
      trap: "Eval scores rising release over release proves the system is genuinely improving.",
      why: "If prompts were iterated against the entire golden set, the score measures fit to those specific items rather than capability, and the gain frequently fails to appear in production.",
      instead:
        "Reserve a held-out split that is only ever used to confirm a release, and version the golden set alongside the code.",
    },
    {
      id: "t5",
      trap: "Synthetic test cases can replace production traces once generation quality is good enough.",
      why: "Generated inputs inherit the assumptions of whoever wrote the generation prompt, so they systematically miss the malformed, ambiguous and off-distribution phrasing that real users produce constantly.",
      instead:
        "Use synthetic data to fill known coverage gaps, and anchor the suite on redacted real traces.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 4",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["4.1", "4.3"],
} satisfies Lesson;
