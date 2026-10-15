import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D5-q501",
    domain: 5,
    objective: "5.5",
    stem: "A lending team builds a pre-qualification assistant. To prevent bias they strip name, gender, age, marital status and home address from every application before the model sees it, and the design document describes the result as bias-free. What is the strongest objection an architect should raise?",
    choices: [
      {
        id: "A",
        text: "The model can still infer protected attributes from writing style, so the free-text sections should be removed as well.",
        rationale:
          "Stripping progressively more input degrades the task and still never reaches every proxy; removal is not a strategy that terminates.",
      },
      {
        id: "B",
        text: "Remaining fields — employer, school, occupation, banking history, branch postal code — carry the same signal, so the claim can only be tested by measuring outcomes across subgroups.",
      },
      {
        id: "C",
        text: "Pretraining data contains bias, so no application-level change can affect the outcome.",
        rationale:
          "Pretraining bias is real but does not make task design, thresholds and retrieval irrelevant; application-level outcomes are both measurable and movable.",
      },
      {
        id: "D",
        text: "Bias-free is achievable, but through a fairness constraint in the scoring layer rather than input removal.",
        rationale:
          "A scoring constraint presupposes a fairness criterion nobody has selected yet, and \"bias-free\" remains a claim no design can assert without measurement.",
      },
    ],
    explanation:
      "Removing protected attributes does not remove their signal, because correlated proxies remain throughout the record. It does remove the team's ability to detect disparate outcomes, so the honest position is that fairness is unmeasured until per-subgroup outcomes are evaluated for this task and this population.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["fairness", "proxy-variables", "bias"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q502",
    domain: 5,
    objective: "5.5",
    stem: "A product owner specifies that a clinical triage model must refer the same proportion of patients in every demographic group, achieve equal true-positive rates across those groups, and produce scores that mean the same thing in each group. Underlying referral base rates differ measurably between the groups. What should the architect tell them?",
    choices: [
      {
        id: "A",
        text: "All three are achievable once the model is retrained on a balanced dataset.",
        rationale:
          "Rebalancing training data changes the model, not the arithmetic: while base rates differ in the population, the three criteria stay mutually unsatisfiable.",
      },
      {
        id: "B",
        text: "All three are achievable by applying group-specific score thresholds after inference.",
        rationale:
          "Group-specific thresholds let you satisfy one criterion at the expense of another; they cannot make incompatible criteria compatible.",
      },
      {
        id: "C",
        text: "With differing base rates the three criteria are mathematically incompatible, so one must be chosen, documented, signed off and measured on a schedule.",
      },
      {
        id: "D",
        text: "The calibration requirement should be dropped, since calibration is a technical property rather than a fairness criterion.",
        rationale:
          "Predictive parity is a fairness criterion with real stakeholders, and discarding it by fiat replaces a documented trade-off with an undisclosed one.",
      },
    ],
    explanation:
      "Demographic parity, equal opportunity and predictive parity make different promises and cannot hold simultaneously when base rates differ across groups. The architect's deliverable is therefore not fairness in the abstract but a recorded decision: which criterion, which subgroups, which threshold, whose sign-off, and how often it is re-measured.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["fairness", "metrics", "trade-offs"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q503",
    domain: 5,
    objective: "5.5",
    stem: "A city agency deploys an assistant that answers benefits-eligibility questions for residents and drafts a recommended determination for a caseworker. An oversight board asks what transparency measures are in place. Which two commitments are the most substantive?",
    choices: [
      {
        id: "A",
        text: "A published statement of the agency's commitment to responsible AI principles.",
        rationale:
          "A statement of principles is not something anyone can check, and it tells a resident nothing about how their own case was handled.",
      },
      {
        id: "B",
        text: "A public dashboard showing how many queries the assistant handles each month.",
        rationale:
          "Volume metrics describe usage rather than how the system works, where it should not be relied on, or what to do about a wrong answer.",
      },
      {
        id: "C",
        text: "Published documentation of intended use and known limitations, including the populations and question types the system was not evaluated on.",
      },
      {
        id: "D",
        text: "Publication of the full system prompt so residents can read the instructions the model receives.",
        rationale:
          "The prompt is one input among corpus, thresholds and tooling; publishing it explains little about a determination while making the system easier to manipulate.",
      },
      {
        id: "E",
        text: "Clear disclosure that the resident is interacting with an AI system, with a named route to reach a caseworker and contest a determination.",
      },
    ],
    explanation:
      "Transparency is measured by what an affected person can learn and then do. Documented limitations tell people and caseworkers where the system should not be trusted, and disclosure plus a contest route gives an individual recourse. Principles statements and usage dashboards change nothing about either.",
    difficulty: 3,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["transparency", "documented-limitations", "recourse"],
    type: "multi",
    selectCount: 2,
    correct: ["C", "E"],
  },
  {
    schemaVersion: 1,
    id: "D5-q504",
    domain: 5,
    objective: "5.5",
    stem: "An architect must evaluate whether a resume-screening assistant scores applicants differently by ethnicity. Legal will not permit the team to collect applicants' ethnicity or to infer it. Which evaluation approach produces usable evidence under that constraint?",
    choices: [
      {
        id: "A",
        text: "Duplicate a sample of real resumes, vary only names and other ethnicity-correlated signals, and test whether the scores move.",
      },
      {
        id: "B",
        text: "Compare shortlist rates across applicants' postal codes as a proxy for ethnicity.",
        rationale:
          "Using a proxy to stand in for the attribute is the inference legal prohibited, and postal-code proxies are noisy enough that findings would be hard to act on anyway.",
      },
      {
        id: "C",
        text: "Ask the model to report whether any protected characteristic influenced its assessment.",
        rationale:
          "Self-reported reasoning is generated text rather than a trace of the computation, so a denial is evidence of nothing at all.",
      },
      {
        id: "D",
        text: "Audit aggregate agreement with recruiter decisions and investigate only if it drops below a threshold.",
        rationale:
          "Agreement with historical recruiters reproduces whatever those decisions contained, and an aggregate figure hides subgroup effects by construction.",
      },
    ],
    explanation:
      "Counterfactual testing holds the substance of an input constant and varies only the sensitive signal, so a score change is a direct, reproducible finding. It needs no demographic data about real applicants, which makes it the standard route out of the measurement paradox where collecting protected attributes is prohibited.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["bias-testing", "counterfactual", "measurement"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q505",
    domain: 5,
    objective: "5.5",
    stem: "A compliance team wants an audit trail explaining why an assistant declined each insurance quote. Engineering proposes storing the model's extended thinking output with every decision and showing it to customers who appeal. What is the most important objection?",
    choices: [
      {
        id: "A",
        text: "Thinking output is large, and retaining it for every decision will be expensive.",
        rationale:
          "Storage cost is a genuine consideration and a minor one beside presenting an unreliable artifact as the official reason for a decision.",
      },
      {
        id: "B",
        text: "Thinking output may repeat personal data from the input and would need redaction before disclosure.",
        rationale:
          "Redaction probably is required, but that is a treatable handling issue rather than a reason the artifact fails as an explanation.",
      },
      {
        id: "C",
        text: "Customers will find the reasoning too technical, so a plain-language summary should be generated instead.",
        rationale:
          "Readability matters, and summarizing an unfaithful account yields a more readable account that is still not why the decision was made.",
      },
      {
        id: "D",
        text: "Generated reasoning is not a faithful record of how the output was produced, so presenting it as the decision's rationale misrepresents the system to the person appealing.",
      },
    ],
    explanation:
      "Chain-of-thought and extended thinking are generated text, not a trace of the computation, so they can be plausible and post-hoc. They are valuable for debugging and for helping a reviewer check a conclusion against evidence, but an explanation offered to an affected person should rest on a decision record: inputs used, evidence retrieved, versions, threshold and the responsible human.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["transparency", "faithfulness", "explainability"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q506",
    domain: 5,
    objective: "5.5",
    stem: "A benefits-eligibility assistant reports 94% accuracy on a 4,000-case evaluation set and is approved for launch on that basis. An advocacy group later shows it performs markedly worse for applicants whose income comes from several part-time jobs, a pattern concentrated in one demographic group. What should the evaluation have done?",
    choices: [
      {
        id: "A",
        text: "Used a larger evaluation set, so the affected applicants were represented in sufficient numbers.",
        rationale:
          "More cases drawn the same way raises the count in every slice while still reporting one aggregate number that hides the difference.",
      },
      {
        id: "B",
        text: "Removed demographic attributes from the cases so the score could not be influenced by them.",
        rationale:
          "Stripping attributes prevents the analysis that would have found the gap and leaves the proxy, income structure, doing the same work.",
      },
      {
        id: "C",
        text: "Reported accuracy sliced by applicant circumstance and demographic group, not only in aggregate.",
      },
      {
        id: "D",
        text: "Set a higher accuracy threshold before launch, since 94% leaves substantial room for error.",
        rationale:
          "A stricter aggregate bar can be cleared by improving the majority slice further while the affected group stays exactly where it was.",
      },
    ],
    explanation:
      "An aggregate score is a weighted average that a large well-served majority can carry on its own, so a group-level failure is invisible in it by construction. Slicing every evaluation is what turns fairness from an adjective into a measurement, and the slices have to include the circumstances that act as proxies as well as the protected attributes themselves.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["fairness", "slicing", "evaluation"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q507",
    domain: 5,
    objective: "5.5",
    stem: "A recruiting assistant ranks applicants, and recruiters interview from the top of the list. Interview outcomes are fed back monthly as training signal for the ranker. After a year the assistant's rankings correlate more strongly with one university's graduates than they did at launch, though nothing in the code or prompt changed. What happened?",
    choices: [
      {
        id: "A",
        text: "Input drift: the applicant pool shifted toward that university over the year.",
        rationale:
          "A changing pool would move who applies, while the effect here is that the same kind of applicant is ranked progressively higher over time.",
      },
      {
        id: "B",
        text: "A feedback loop: the assistant's own output determined who was interviewed, and those outcomes became the signal that reinforced the pattern.",
      },
      {
        id: "C",
        text: "The model version was upgraded by the provider, changing how it weighs education.",
        rationale:
          "A provider change would shift behavior at a point in time rather than producing a pattern that strengthens month over month.",
      },
      {
        id: "D",
        text: "Recruiters developed automation bias and stopped scrutinizing the rankings.",
        rationale:
          "Reduced scrutiny would let a bias persist unchallenged without explaining why the correlation grew stronger than it was at launch.",
      },
    ],
    explanation:
      "When a system's outputs become the inputs it later learns from, an initial tilt is amplified rather than corrected: candidates the ranker buried are never interviewed, so they generate no evidence to the contrary. Breaking the loop means sampling outside the ranking and measuring on that sample, because no amount of data from the loop itself can contradict it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["fairness", "feedback-loops", "bias"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
