import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q201",
    domain: 4,
    objective: "4.2",
    stem: "An evaluation harness sends every output to an LLM judge, including checks for whether the response parses as JSON, whether all five required keys are present, and whether the total field equals the sum of the line items. The suite costs several hundred dollars per run, and it returns slightly different verdicts on identical inputs. What is the most appropriate change?",
    choices: [
      {
        id: "A",
        text: "Give the judge a detailed rubric with worked examples for each of the three checks so its verdicts stabilize.",
        rationale:
          "A sharper rubric narrows disagreement but still spends a model call, and the per-run fee, on three checks that a parser decides exactly, instantly and for free.",
      },
      {
        id: "B",
        text: "Move the structural and arithmetic checks into deterministic code assertions, keeping the judge for genuinely subjective quality.",
      },
      {
        id: "C",
        text: "Run the judge three times per case and take the majority verdict.",
        rationale:
          "Triple-voting triples the cost of checks that were never subjective and treats the variance as unavoidable rather than as an artifact of the wrong grader.",
      },
      {
        id: "D",
        text: "Replace the judge with human reviewers for all of these checks.",
        rationale:
          "Human review is the slowest and most expensive grader available, and it is entirely wasted on checks a parser can settle in milliseconds.",
      },
    ],
    explanation:
      "Mixed methodology means routing each check to the cheapest grader that can actually decide it. Schema validity, required fields and arithmetic are deterministic properties, so they belong in code where they are free, fast and variance-free. Judges are reserved for the subjective quality that code cannot assess.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["eval-framework", "graders"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q202",
    domain: 4,
    objective: "4.2",
    stem: "Over four months a team's score on its 300-case evaluation dataset has climbed from 71% to 92%, achieved almost entirely through prompt iteration against that dataset. Production complaint volume over the same period is unchanged. The dataset, the graders and the traffic mix have all stayed the same. What is the most likely explanation?",
    choices: [
      {
        id: "A",
        text: "The graders have drifted and are now scoring more leniently than they did four months ago.",
        rationale:
          "The stem states the graders are unchanged, and grader drift would also lift scores on cases the team never iterated against.",
      },
      {
        id: "B",
        text: "The production traffic distribution has moved away from what the dataset represents.",
        rationale:
          "The stem holds the traffic mix constant, and traffic drift would not produce a steady climb that tracks deliberate prompt edits on fixed cases.",
      },
      {
        id: "C",
        text: "At 300 cases the dataset is too small to give a stable estimate, so the climb is sampling noise.",
        rationale:
          "Small samples produce noisy scores in both directions, not a monotonic four-month rise aligned with prompt iteration.",
      },
      {
        id: "D",
        text: "The prompts have been fitted to these specific cases, so the score now measures fit to the dataset rather than capability.",
      },
    ],
    explanation:
      "Iterating prompts against an entire evaluation set converts that set into a training set: the score rises because the prompt has been tuned to those exact items. A held-out split that is never used during iteration is what keeps a release score a measure of generalization rather than memorization.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["eval-dataset", "contamination"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q203",
    domain: 4,
    objective: "4.2",
    stem: "A support assistant shipped a bug in which it quoted a shipping tier that was discontinued last year. The fix is verified by hand against the reported conversation and released. What should happen to that failing case?",
    choices: [
      {
        id: "A",
        text: "It becomes a permanent case in the regression suite, run on every subsequent change.",
      },
      {
        id: "B",
        text: "It is archived alongside the incident ticket so the team can refer to it later.",
        rationale:
          "An archived ticket is never executed by anything, so exactly the same defect can ship again without a single check noticing.",
      },
      {
        id: "C",
        text: "It is added to the held-out split so it is only checked at release time.",
        rationale:
          "The held-out split exists to measure generalization, and burying a known defect there delays detection until the end of the cycle.",
      },
      {
        id: "D",
        text: "It is added as a few-shot example inside the production prompt.",
        rationale:
          "Turning one bug into a prompt example patches that phrasing only, and it removes the case from measurement altogether.",
      },
    ],
    explanation:
      "A regression suite grows by absorbing every confirmed failure as a permanent case, which is the mechanism that stops the same defect shipping twice. Manual verification confirms one fix at one moment; only an executed case protects the behavior against every future change.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["eval-dataset", "regression"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q204",
    domain: 4,
    objective: "4.2",
    stem: "A team introduces an LLM judge to score answer quality against a five-point rubric. In a pilot, the judge rates their own model's answers about 0.8 points higher than two domain experts rated the identical answers, and in pairwise comparisons it almost always prefers whichever answer is longer. Which three changes most directly address what the pilot revealed?",
    choices: [
      {
        id: "A",
        text: "Run the judge on a model from a different family than the system under test.",
      },
      {
        id: "B",
        text: "Expand the rubric from five points to ten for finer resolution.",
        rationale:
          "More gradations on the same vague scale widen the spread of scores without making any individual judgment more accurate or less biased.",
      },
      {
        id: "C",
        text: "Give the judge explicit anchors describing what each score means, plus a reference answer to compare against.",
      },
      {
        id: "D",
        text: "Have the judge state its reasoning and report a confidence value, then weight scores by that confidence.",
        rationale:
          "Self-reported confidence is produced by the same process that generated the bias, so weighting by it amplifies the bias rather than correcting it.",
      },
      {
        id: "E",
        text: "Track agreement between the judge and human labels as a standing metric, re-checked whenever the judge prompt or model changes.",
      },
      {
        id: "F",
        text: "Abandon the judge and have domain experts score all outputs instead.",
        rationale:
          "Expert-only grading cannot run on every change, so it removes the fast feedback the suite exists to provide and stalls iteration.",
      },
    ],
    explanation:
      "The pilot exposed two known judge biases: self-preference toward its own model family and a preference for verbosity. The standard mitigations are cumulative — judge with a different model family, replace a vague scale with anchored criteria and a reference answer so scoring becomes comparison, and treat judge-human agreement as a metric that is itself monitored.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["llm-as-judge", "bias", "calibration"],
    type: "multi",
    selectCount: 3,
    correct: ["A", "C", "E"],
  },
  {
    schemaVersion: 1,
    id: "D4-q205",
    domain: 4,
    objective: "4.2",
    stem: "An evaluation dataset is built by sampling 2,000 production conversations at random. The suite scores 94% and takes 40 minutes per run, so the team runs it weekly. The failure category the business cares about most — multi-account billing disputes — is roughly 1% of traffic. What should the architect change?",
    choices: [
      {
        id: "A",
        text: "Increase the sample to 10,000 conversations so rare categories appear more often in absolute terms.",
        rationale:
          "Scaling a random sample preserves the same proportions and makes an already slow suite far slower, which reduces how often anyone runs it.",
      },
      {
        id: "B",
        text: "Keep the dataset as it is and publish a confidence interval alongside the 94%.",
        rationale:
          "An interval quantifies uncertainty in the aggregate but leaves the business-critical category just as invisible inside it.",
      },
      {
        id: "C",
        text: "Stratify the set to over-sample billing disputes, report per-stratum scores, and trim the suite so it runs on every change.",
      },
      {
        id: "D",
        text: "Replace the production sample with synthetic billing-dispute cases generated from the internal playbook.",
        rationale:
          "Generated cases inherit the assumptions of whoever wrote the generation prompt and lose the malformed real phrasing that causes many of the failures.",
      },
    ],
    explanation:
      "A randomly sampled dataset mirrors production, which means high-consequence rare cases barely register and the aggregate is dominated by easy traffic. Deliberate stratification with per-stratum reporting surfaces the category that matters, and a suite fast enough to run on every change is worth more than a large one that runs weekly.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["eval-dataset", "stratification"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q206",
    domain: 4,
    objective: "4.2",
    stem: "An architect must decide what runs when for an evaluation framework with three grader types. Commits land roughly twenty times a day, releases go out weekly, and two domain experts are available for about four hours a week. Which allocation is most defensible?",
    choices: [
      {
        id: "A",
        text: "Deterministic assertions block every commit; the judge-scored suite runs nightly and before each release; experts calibrate the judge and adjudicate disputed cases.",
      },
      {
        id: "B",
        text: "The full judge-scored suite blocks every commit, experts review every release, and assertions run nightly.",
        rationale:
          "Putting the slowest and costliest grader in the commit path stalls twenty commits a day, and it spends scarce expert time where it adds the least.",
      },
      {
        id: "C",
        text: "Experts review a sample of every commit, and assertions and the judge both run only before release.",
        rationale:
          "Four expert-hours a week cannot cover twenty commits a day, and moving all automation to release time removes the fast feedback entirely.",
      },
      {
        id: "D",
        text: "All three graders run before release only, so day-to-day development is never blocked.",
        rationale:
          "A structural break would then survive a full week of commits before anything caught it, which a blocking assertion prevents at almost no cost.",
      },
    ],
    explanation:
      "Mixed methodologies are layered by cost and frequency rather than chosen once. Deterministic checks are cheap enough to gate every commit, judges are cheap enough to run nightly across the whole dataset, and scarce human time is best spent calibrating the judge and resolving cases the automation disagrees about.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["eval-framework", "mixed-methodology"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q207",
    domain: 4,
    objective: "4.2",
    stem: "A golden set is built entirely from six months of production traces. It scores well, yet the assistant fails in a pilot on multi-currency invoices, which the business will begin receiving next quarter and which appear nowhere in the traces. How should the set be extended?",
    choices: [
      {
        id: "A",
        text: "Wait for multi-currency invoices to appear in production and add the traces once volume is sufficient.",
        rationale:
          "That delays coverage until after the launch the cases were meant to protect, which is the point at which failures become expensive.",
      },
      {
        id: "B",
        text: "Add synthetic cases covering multi-currency invoices, with expected outputs written by someone who knows the rules.",
      },
      {
        id: "C",
        text: "Increase the sampling window from six to eighteen months so rarer inputs are represented.",
        rationale:
          "A longer window draws more of the same distribution, and an input the business has never received is not in any amount of history.",
      },
      {
        id: "D",
        text: "Lower the pass threshold to reflect the uncertainty about inputs the set does not cover.",
        rationale:
          "Moving the bar changes what the score reports rather than what it measures, leaving the gap in coverage exactly where it was.",
      },
    ],
    explanation:
      "Production traces give real inputs and therefore only the inputs the system has already seen. Synthetic variation exists to fill the gaps traces cannot: rare paths, new categories and anything the business is about to start sending, each with an expected output authored deliberately rather than observed.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["eval-dataset", "synthetic-cases", "coverage"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q208",
    domain: 4,
    objective: "4.2",
    stem: "An evaluation suite checks a summarization assistant with deterministic assertions only: word count within range, every numeric figure from the source present, no banned phrase. The suite passes consistently while reviewers keep rejecting summaries as misleading about what the source concluded. What should change?",
    choices: [
      {
        id: "A",
        text: "Add more deterministic assertions, covering required section headings and sentence count.",
        rationale:
          "More assertions of the same kind check more surface properties, none of which can express whether a conclusion was represented fairly.",
      },
      {
        id: "B",
        text: "Replace the deterministic checks with an LLM judge scoring overall quality.",
        rationale:
          "Discarding the cheap exact checks gives up the things they decide perfectly and pays a judge to re-decide them less reliably.",
      },
      {
        id: "C",
        text: "Send every rejected summary to a human reviewer and track the rejection rate as the metric.",
        rationale:
          "Human review is the most accurate grader and the slowest, so making it the only quality signal means learning about defects after release.",
      },
      {
        id: "D",
        text: "Keep the deterministic checks and add a judged criterion for faithfulness to the source's conclusions.",
      },
    ],
    explanation:
      "Push every check to the cheapest grader that can actually decide it, and no cheaper. Counting, presence and format are decided exactly by code; whether a summary misrepresents a conclusion is a judgment, so it needs a judge layered on top of the assertions rather than replacing them.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["eval-framework", "graders", "llm-as-judge"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
