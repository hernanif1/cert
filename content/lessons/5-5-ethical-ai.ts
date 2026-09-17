import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.5",
  slug: "5-5-ethical-ai",
  domain: 5,
  objective:
    "Address ethical AI considerations (bias, fairness, transparency)",
  title: "Ethical AI Considerations",
  summary:
    "Bias, fairness and transparency become engineering work the moment you have to name a metric, a subgroup, a threshold and a disclosure. This objective rewards concrete, measurable commitments and keys against statements of good intent.",

  body: [
    {
      kind: "prose",
      md: "Ethical requirements arrive as adjectives — fair, unbiased, transparent — and the architect's job is to convert them into something a test can fail. That conversion is the whole objective. The distractors are the versions that sound responsible and cannot be measured.",
    },

    { kind: "heading", text: "Where bias enters" },
    {
      kind: "list",
      items: [
        "**Pretraining data.** Broad text carries the associations of its sources. This is the bias people discuss most and the one an application team controls least directly.",
        "**Your corpus and examples.** A knowledge base of historical decisions teaches the system to reproduce them, wrong ones included. Few-shot examples drawn from past cases do the same, faster.",
        "**Task framing.** Asking whether a candidate is *a good fit for the team* invites a different answer than asking whether they meet a listed requirement.",
        "**Proxy variables.** Removing a protected attribute rarely removes its signal: postal code, school, employment gaps, name, photo and writing style all carry it. This is the most common wrong answer in the area.",
        "**Feedback loops.** When outputs become tomorrow's retrieval corpus or training data, whatever skew the system started with gets amplified.",
      ],
    },

    { kind: "heading", text: "Fairness is a choice between incompatible definitions" },
    {
      kind: "prose",
      md: "There is no neutral fairness metric. The families in common use make different promises, and outside degenerate cases you cannot satisfy them at once.",
    },
    {
      kind: "table",
      caption: "Three fairness criteria and what each concedes",
      headers: ["Criterion", "Requires", "Uncomfortable implication"],
      rows: [
        [
          "Demographic parity",
          "Equal selection rates across groups",
          "Ignores whether qualifying rates differ; can require different effective bars",
        ],
        [
          "Equal opportunity",
          "Equal true-positive rates across groups",
          "Permits unequal selection rates and unequal false-positive rates",
        ],
        [
          "Predictive parity",
          "A given score means the same thing in every group",
          "Coexists with unequal error rates in exactly the way people object to",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "When base rates differ between groups, satisfying one criterion breaks the others — this is an arithmetic result, not an engineering shortfall. So the deliverable is never \"the system is fair\". It is a written decision: **which criterion, which subgroups, which threshold, whose sign-off, measured how often**. An answer promising all three criteria is wrong on the math.",
    },

    { kind: "heading", text: "Measuring it" },
    {
      kind: "list",
      items: [
        "**Slice every evaluation.** Aggregate accuracy hides subgroup failure by construction. Report per-subgroup metrics, and check each slice has enough items to support a claim.",
        "**Test counterfactually.** Hold the substance of an input constant and vary only a name, pronoun, school or dialect. A score that moves is a direct, reproducible finding — and it needs no protected-attribute data at all.",
        "**Screen for disparate impact.** In US employment contexts the four-fifths rule — a group's selection rate below 80% of the highest group's — is a long-standing screening heuristic used by enforcement agencies. It is not a safe harbor above the line or a violation below it; it tells you where to look.",
        "**Solve the measurement paradox.** You often cannot collect the attributes you would need to measure fairness. The routes out are limited-purpose collection with separate access control, a trusted third party holding the attribute, or counterfactual testing that sidesteps the need.",
      ],
    },

    { kind: "heading", text: "Transparency that is worth something" },
    {
      kind: "prose",
      md: "Transparency means affected people can learn what they need to know and do something about it. Concretely: disclose that the counterpart is an AI system wherever someone could reasonably assume otherwise; publish intended use and **documented limitations**, including the populations and inputs the system was never evaluated on; keep a decision record of inputs, evidence retrieved, model and prompt version, outcome and responsible human; and provide a route to contest.\n\nOne caution the exam likes: **a model's stated reasoning is not necessarily a faithful account of how it produced an answer.** Chain-of-thought is generated text. It is genuinely useful for debugging and for helping a reviewer check a conclusion against evidence, and it is not an explanation you can defend as the causal story.",
    },

    {
      kind: "example",
      title: "Practical example: a resume-screening assistant",
      scenario:
        "A company scores applicants against a job description and shortlists the top 20%. To avoid bias the team strips name, gender, age and address from every resume before the model sees it. The pilot reports 91% agreement with past recruiter decisions, which the team presents as validation.",
      walkthrough:
        "1. **The headline metric is the problem.** 91% agreement with historical recruiters means the system reproduces historical selection, whatever that contained. Agreement with the past measures conformity, not quality.\n2. **Stripping fields did not remove the signal.** University, employment gaps, activities, phrasing and non-native syntax all correlate with protected characteristics, and the model reads every one of them.\n3. **Test counterfactually.** Duplicate 500 resumes varying only the name and the university. Scores move measurably — a finding that needs no demographic data and that a regulator can follow.\n4. **Pick a criterion.** With legal and the hiring owner, choose equal opportunity on the shortlisting decision, define the subgroups, and screen selection rates for disparate impact each quarter.\n5. **Change the task.** Score against listed, job-related requirements with the supporting text quoted from the resume, instead of a holistic fit score. Narrow tasks are easier to justify and easier to audit.\n6. **Keep the human real and the record complete.** The assistant shortlists nobody on its own; it surfaces evidence to a recruiter who decides, and every decision is recorded with model and prompt version.",
      takeaway:
        "Every step turned an adjective into an artifact: a test, a metric, a threshold, a record. That is what the exam means by addressing ethical considerations.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "*We removed the protected attributes* and *the provider evaluated the model for bias* are the two most common answers, and they fail for the same reason: fairness is a property of a deployed system doing a particular task for a particular population, and only measuring that system's outcomes can establish it.",
    },

    { kind: "practice", questionId: "D5-q501" },
  ],

  keyTerms: [
    {
      term: "Proxy variable",
      definition:
        "An attribute that correlates with a protected characteristic — postal code, school, employment gap, name — and carries its signal into a model that never saw the characteristic itself.",
    },
    {
      term: "Disparate impact",
      definition:
        "A neutral-looking process producing materially different outcomes across groups. Screened in US employment contexts with the four-fifths rule of thumb.",
    },
    {
      term: "Counterfactual testing",
      definition:
        "Varying only a sensitive signal in an otherwise identical input and measuring whether the output changes. Reproducible, and it requires no demographic data.",
    },
    {
      term: "Faithfulness",
      definition:
        "Whether stated reasoning reflects the process that produced the answer. Generated reasoning can be plausible and post-hoc, so it is not defensible as an explanation of a decision.",
    },
    {
      term: "Documented limitations",
      definition:
        "A published statement of what the system was evaluated on, what it was not, and where it should not be relied on. The most practical transparency artifact an architect produces.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Excluding protected attributes from the input makes the system fair.",
      why: "Correlated proxies such as postal code, school, employment gaps and writing style carry the same signal, so exclusion removes your ability to measure disparate outcomes while leaving the outcomes themselves intact.",
      instead:
        "Measure outcomes by subgroup and test counterfactually; blinding the input is fine, but it is not evidence of fairness.",
    },
    {
      id: "t2",
      trap: "A system can be built to satisfy demographic parity, equal opportunity and predictive parity simultaneously.",
      why: "Where base rates differ across groups these criteria are mathematically incompatible, so a design promising all three is claiming something arithmetic forbids rather than something engineering has failed to deliver.",
      instead:
        "Choose the criterion that fits the harm you are preventing, record the choice and its owner, and measure it on a schedule.",
    },
    {
      id: "t3",
      trap: "Showing the model's chain-of-thought gives affected users an explanation of the decision.",
      why: "Generated reasoning is not a faithful trace of the computation and can be a plausible post-hoc narrative, so presenting it as the causal account misleads exactly the people who are entitled to a real one.",
      instead:
        "Provide a decision record — inputs used, evidence retrieved, versions, responsible human — and a route to contest it.",
    },
    {
      id: "t4",
      trap: "The provider's model card reports low bias on standard benchmarks, so the application is fair.",
      why: "Benchmarks measure a model in the abstract, whereas harm arises from a specific task, prompt, retrieval corpus, threshold and population, none of which the provider evaluated for you.",
      instead:
        "Run task-specific subgroup evaluations on your own data before launch and on a schedule afterward.",
    },
  ],

  practiceQuestionIds: ["D5-q501", "D5-q502"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["5.3", "5.4"],
} satisfies Lesson;
