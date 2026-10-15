import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q301",
    domain: 4,
    objective: "4.3",
    stem: "A team wants to improve a summarization feature. In a single experiment arm they rewrite the system prompt, switch to a different model, and raise the number of source documents passed from three to five. After two weeks the arm shows a 4% improvement on the primary metric. What is the most significant problem with this experiment?",
    choices: [
      {
        id: "A",
        text: "Two weeks is too short a window for a 4% effect to be considered reliable.",
        rationale:
          "Whether the duration is adequate depends on the power calculation, which may well be satisfied; duration is not what makes this result unusable.",
      },
      {
        id: "B",
        text: "The primary metric should have been selected after inspecting the results.",
        rationale:
          "Choosing a metric after seeing the data is worse practice rather than a remedy, and nothing in the scenario suggests they did that.",
      },
      {
        id: "C",
        text: "The control arm should have received the prompt rewrite as well, so only the model differed.",
        rationale:
          "Giving the control part of the treatment destroys the very comparison the experiment exists to make.",
      },
      {
        id: "D",
        text: "The 4% cannot be attributed to any one of the three changes, and one of them may be hurting while the others help.",
      },
    ],
    explanation:
      "Bundling changes yields a single aggregate number with no attribution: a genuine win from the prompt rewrite can be masking a regression from the model swap, and a loss gives no indication which component to revert. Testing one variable at a time, or using a factorial design when interactions matter, is what makes a result actionable.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["ab-testing", "experiment-design"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q302",
    domain: 4,
    objective: "4.3",
    stem: "An experiment is planned to run for fourteen days based on a power calculation. On day three the dashboard shows the treatment arm ahead with p = 0.04, and the product manager asks to stop the test and ship. What should the architect advise?",
    choices: [
      {
        id: "A",
        text: "Continue to the planned sample size, or switch to a sequential design whose stopping rule accounts for repeated inspection.",
      },
      {
        id: "B",
        text: "Ship now, since p below 0.05 was the agreed decision threshold and more data can only refine the estimate.",
        rationale:
          "Repeated looks give a genuinely null effect many chances to cross the threshold, so an early crossing is far weaker evidence than its nominal p-value implies.",
      },
      {
        id: "C",
        text: "Extend the test to twenty-eight days, since doubling the duration halves the error rate.",
        rationale:
          "More data helps but not in that proportion, and the defect here is the stopping rule rather than the length of the run.",
      },
      {
        id: "D",
        text: "Shift traffic allocation to 90% treatment so the result reaches significance sooner.",
        rationale:
          "Reallocating mid-flight breaks the randomization balance and exposes many more users before the effect has actually been established.",
      },
    ],
    explanation:
      "Checking continuously and stopping at the first significant reading inflates the false-positive rate well above the nominal level, because accumulating data wanders across the threshold by chance. The remedy is either a pre-registered sample size honored to the end, or a sequential test explicitly designed for repeated looks.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["ab-testing", "statistics"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q303",
    domain: 4,
    objective: "4.3",
    stem: "A team runs an A/B test on a support assistant. Traffic is split by hashing the request id, so a returning user can land in either arm on any given message. The only metric tracked is first-contact deflection rate, which is up six points and comfortably powered. Which two objections should block the rollout?",
    choices: [
      {
        id: "A",
        text: "A six-point effect is implausibly large and most likely indicates an instrumentation error.",
        rationale:
          "A large effect deserves verification, but effect size alone is not an objection and the scenario offers no evidence that instrumentation is broken.",
      },
      {
        id: "B",
        text: "Randomizing per request mixes both behaviors inside a single user's session, which makes a user-level metric like deflection uninterpretable.",
      },
      {
        id: "C",
        text: "Deflection rate should be measured over a ninety-day window rather than during the test.",
        rationale:
          "A window that long delays every decision and still does nothing about the assignment defect or the absent guardrails.",
      },
      {
        id: "D",
        text: "No guardrail metric was defined, so deflection may have risen by leaving problems unresolved rather than by solving them.",
      },
      {
        id: "E",
        text: "The control arm should have run the previous model version in addition to the previous prompt.",
        rationale:
          "Varying two things between arms is the opposite of what a controlled comparison needs, and it would make any result unattributable.",
      },
    ],
    explanation:
      "Assignment must be sticky at the unit the metric is measured on; hashing the request id gives one person both behaviors and turns every user-level outcome into a blend of the arms. Separately, a primary metric with no guardrails — reopened tickets, escalation rate, CSAT, cost — cannot distinguish resolving a problem from deferring it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["ab-testing", "randomization", "guardrails"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D4-q304",
    domain: 4,
    objective: "4.3",
    stem: "To save engineering effort, a team ships a new retrieval configuration to 100% of traffic on a Monday and plans to judge it by comparing the following week's resolution rate against the previous week's. What is the main weakness of this plan?",
    choices: [
      {
        id: "A",
        text: "Weekly aggregates are too coarse to detect a change in resolution rate.",
        rationale:
          "Granularity is a secondary concern here; the same comparison computed daily would carry exactly the same flaw.",
      },
      {
        id: "B",
        text: "The team will have no way to roll back if the new configuration performs badly.",
        rationale:
          "A full rollout is reversible; the real problem is that this comparison cannot establish whether a rollback is warranted.",
      },
      {
        id: "C",
        text: "With no concurrent control group, seasonality, marketing activity and unrelated deploys are all confounded with the change.",
      },
      {
        id: "D",
        text: "Resolution rate is a lagging metric and should be replaced by a model-graded quality score.",
        rationale:
          "Swapping the metric does not supply the missing control group, and the same confounding applies to any metric measured this way.",
      },
    ],
    explanation:
      "A before-and-after comparison attributes every difference between the two periods to the change, including everything else that moved. Concurrent randomized arms exist precisely to hold those factors constant, which is what makes an A/B result causal rather than merely chronological.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["ab-testing", "confounding"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q305",
    domain: 4,
    objective: "4.3",
    stem: "A product manager asks why a proposed prompt change should not go straight into a live A/B test, given that the test will measure real user outcomes anyway. What is the strongest reason to run the offline regression suite first?",
    choices: [
      {
        id: "A",
        text: "Offline evaluation measures user behavior more precisely than an online test does.",
        rationale:
          "Offline evaluation cannot observe user behavior at all; it scores outputs against a fixed dataset of inputs somebody chose.",
      },
      {
        id: "B",
        text: "It catches format breaks and known regressions before any user is exposed to them, at a small fraction of the cost.",
      },
      {
        id: "C",
        text: "Offline scores can be used in place of a power calculation to size the experiment.",
        rationale:
          "Sample size derives from the baseline rate and the minimum effect worth shipping, not from an offline quality score.",
      },
      {
        id: "D",
        text: "Running offline first guarantees that the online result will agree with the offline result.",
        rationale:
          "The two measure different things, and the absence of that guarantee is exactly why the online test is still required.",
      },
    ],
    explanation:
      "Offline evaluation and online experimentation answer different questions and neither replaces the other. The offline suite is the cheap gate that stops a broken variant reaching users; the A/B test then measures the outcome the business is actually buying on traffic nobody curated.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["ab-testing", "offline-eval"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q306",
    domain: 4,
    objective: "4.3",
    stem: "A team wants to replace the retrieval configuration behind a legal assistant. Offline evaluation on the golden set is favorable. The risk is that production questions differ from the golden set in ways nobody has characterized, and a bad answer to a live user is costly. What is the appropriate next rung before an A/B test?",
    choices: [
      {
        id: "A",
        text: "A shadow run: send production traffic to the new configuration in parallel, serve only the current one, and compare the outputs offline.",
      },
      {
        id: "B",
        text: "A canary release to 1% of users, monitored for a week.",
        rationale:
          "A canary is the right rung after a shadow run, since it is the first that exposes real users to the new configuration's answers.",
      },
      {
        id: "C",
        text: "Extend the golden set with more cases until it resembles production closely enough.",
        rationale:
          "Broadening the set narrows the gap it was drawn from without ever confirming that the remaining difference is small.",
      },
      {
        id: "D",
        text: "Run the A/B test but restrict it to internal employees.",
        rationale:
          "Employee traffic removes customer risk and also removes the production distribution whose unknown shape is the whole concern.",
      },
    ],
    explanation:
      "Exposure escalates in rungs, and each buys more signal at more risk. A shadow run is the only stage that sees real production inputs at full volume with zero user exposure, which is exactly what is wanted when the worry is distribution mismatch rather than the configuration itself.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["ab-testing", "shadow-run", "rollout"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q307",
    domain: 4,
    objective: "4.3",
    stem: "An experiment on a 3.1% escalation rate is planned to run until the result is significant. After three weeks the arms differ by 0.2 points with a wide interval, and the team debates whether to keep going, call it a tie, or ship the treatment because it is nominally ahead. What should have been decided before the test began?",
    choices: [
      {
        id: "A",
        text: "The segments to analyze, so a positive result in one of them could be found if the overall test was flat.",
        rationale:
          "Pre-specifying segments does prevent a fishing expedition later, but it does not tell the team how long the overall test needs to run.",
      },
      {
        id: "B",
        text: "A guardrail metric, so a neutral primary result could still be interpreted.",
        rationale:
          "A guardrail catches harm alongside a win; it says nothing about whether the experiment could detect the win in the first place.",
      },
      {
        id: "C",
        text: "The smallest effect worth acting on, and the sample size and duration required to detect it.",
      },
      {
        id: "D",
        text: "A stopping rule allowing the test to end early once the interval excludes zero.",
        rationale:
          "Stopping the moment the interval excludes zero is peeking, which inflates the false-positive rate rather than resolving an underpowered test.",
      },
    ],
    explanation:
      "Running until something looks significant guarantees an answer eventually and makes it uninterpretable. Fixing the minimum detectable effect in advance converts the design into a duration, so a flat result at the end is informative: the effect the business cared about is not there.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["ab-testing", "sample-size", "experiment-design"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
