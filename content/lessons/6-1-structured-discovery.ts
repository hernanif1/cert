import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "6.1",
  slug: "6-1-structured-discovery",
  domain: 6,
  objective: "Conduct structured discovery and requirement gathering",
  title: "Structured Discovery",
  summary:
    "Discovery converts a stakeholder's description of a job into things you can measure: real inputs, a baseline, someone who owns the definition of correct, and a written list of non-goals. The exam tests whether you ask for evidence rather than accepting a requirement as stated.",

  body: [
    {
      kind: "prose",
      md: "Every downstream decision rests on what discovery established, and an AI project fails in ways ordinary requirements gathering never surfaces. A stakeholder can describe a task fluently and still be unable to say what a correct output looks like — which is precisely the thing a non-deterministic system has to be held to.\n\nStructured discovery produces four artifacts, not a meeting summary:",
    },
    {
      kind: "list",
      ordered: true,
      items: [
        "**A representative sample of real inputs.** Twenty to fifty actual cases pulled from the live process, including the messy ones. Descriptions of the work are not inputs; the distribution of the real thing is where feasibility lives.",
        "**A definition of correct, with an owner.** Someone must be able to adjudicate a disputed output. If two experts label the same case differently, you have found a preference, not a specification.",
        "**A baseline.** What the current process costs, how long it takes, and how often it is wrong. Without it, no accuracy target can be argued for or against.",
        "**A non-goal list.** What the system will not do, written down and agreed while everyone is still calm.",
      ],
    },

    { kind: "heading", text: "Questions that de-risk an AI build" },
    {
      kind: "table",
      caption: "Each question buys a specific piece of risk reduction",
      headers: ["Ask", "What it de-risks", "Failure when it is skipped"],
      rows: [
        [
          "Can you show me ten real cases, three of which went badly?",
          "Feasibility and input distribution",
          "The design fits the demo case; real traffic is longer, dirtier and partly in another language",
        ],
        [
          "Who decides whether an output is right?",
          "Evaluability",
          "No golden set can be built, so no change can ever be shown to be an improvement",
        ],
        [
          "How often is the process wrong today, and how long does it take?",
          "Threshold setting",
          "An arbitrary target such as 99% gets committed to with nothing to compare it against",
        ],
        [
          "What does a wrong answer cost, and who notices it?",
          "Error-cost asymmetry",
          "A confident wrong answer reaches a customer with no review gate in front of it",
        ],
        [
          "How many requests per day, and how long is a typical input?",
          "Cost and latency envelope",
          "Token spend and p95 latency are discovered in production, after the budget is approved",
        ],
        [
          "What data may the model see, and where may it be processed?",
          "Legal and residency constraints",
          "Retrieval is redesigned late because a source cannot leave its region",
        ],
      ],
    },
    {
      kind: "prose",
      md: "Two of these deserve emphasis. **Error cost is rarely symmetric.** A missed high-severity claim and an over-escalated routine one have wildly different prices, and the ratio between them is what tells you where a human review gate belongs. Ask what the wrong answer costs in money, time or regulatory exposure, not whether accuracy matters.\n\n**Cost scales with tokens, not with seats.** A sponsor who budgets like a SaaS purchase assumes a price per user per month. Establish request volume, typical input and output length, and how many turns a task takes, because a long-document workflow at modest volume can outspend a short-prompt workflow at ten times the traffic.\n\nOne feasibility test is worth running before any design work: could a competent human answer this from the data the system will actually be able to reach? If not, no model choice fixes it, and the honest discovery finding is that the data has to change first.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Stakeholders arrive holding a solution — *we want a chatbot*, *we want fine-tuning*. Your job is to recover the underlying job: which decision gets made, by whom, on what evidence, and how often. Fix the outcome and keep the mechanism open. A request for a chatbot usually resolves into deflecting one class of ticket, which may not need a conversational interface at all.",
    },

    {
      kind: "example",
      title: "Practical example: “summarize our customer calls”",
      scenario:
        "A support director asks for an assistant that summarizes call transcripts. The stated requirement is one paragraph per call, and success is described as summaries the team trusts.",
      walkthrough:
        "1. **Ask for samples.** Thirty transcripts arrive. The median is 4,200 words, the longest is 31,000, and a fifth are bilingual — the cost and context envelope is now knowable rather than guessed.\n2. **Ask who reads the summary, and to decide what.** Team leads read them to pick which calls need a coaching review. The real job is triage, not summarization.\n3. **Reshape the output.** A short summary plus three structured fields — outcome, escalation risk, coaching flag — serves that decision and can be scored field by field.\n4. **Find the ground-truth owner.** Two leads disagree on escalation risk for four of ten sampled calls, so the label has to be defined before anything is built.\n5. **Write the non-goals.** No automated coaching action, no customer-facing output, no raw transcripts retained past thirty days.",
      takeaway:
        "The original request was unevaluable, because trust has no denominator. Discovery turned it into three fields with a labeling rule and an owner, which is what makes every later architecture decision testable.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Options that open the project by selecting a model, drafting prompts or booking a two-week proof of concept always look like momentum, and discovery questions look slow beside them. The exam keys the option that first secures real data and a measurable definition of success — a prototype built on unstated criteria cannot be shown to work, only demonstrated.",
    },

    {
      kind: "practice",
      questionIds: [
        "D6-q101",
        "D6-q102",
        "D6-q103",
        "D6-q104",
        "D6-q105",
        "D6-q106",
        "D6-q107",
        "D6-q108",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Representative sample",
      definition:
        "Real inputs drawn from the live process, including failures and outliers, used to establish feasibility, input length distribution and cost. Distinct from the curated examples a stakeholder volunteers.",
    },
    {
      term: "Ground-truth owner",
      definition:
        "The named person who adjudicates whether a disputed output is correct. Without one, no golden set exists and no accuracy claim can be settled.",
    },
    {
      term: "Baseline",
      definition:
        "How accurate, fast and expensive the current process is. The reference point that makes a proposed target defensible instead of arbitrary.",
    },
    {
      term: "Error-cost asymmetry",
      definition:
        "The differing business cost of a false positive and a false negative. Determines where human review gates and confidence thresholds belong.",
    },
    {
      term: "Non-goal",
      definition:
        "A capability explicitly excluded from scope, agreed in writing during discovery. The cheapest scope control there is, because it is free before anyone is invested.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "The stakeholder knows their own process, so their description of the task is a sufficient requirement.",
      why: "A fluent description of a workflow routinely omits the exceptions, the input variety and the tacit judgment that make the task hard, and none of that is visible until you hold the actual inputs.",
      instead:
        "Ask for real cases, including ones that went badly, and derive the requirement from what the data shows.",
    },
    {
      id: "t2",
      trap: "A quick proof of concept on a handful of examples is the fastest way to establish feasibility.",
      why: "Ten curated examples say nothing about the tail of the distribution, and a demo that succeeds on them sets an expectation the production system then has to fight, because nobody agreed what success would be measured on.",
      instead:
        "Establish measurable criteria and a representative sample first; then a prototype tests something falsifiable.",
    },
    {
      id: "t3",
      trap: "If two reviewers disagree about an output, a clearer prompt will resolve it.",
      why: "Reviewer disagreement means the task definition is missing, not that the model is confused; prompting cannot supply a decision rule that the organization has never actually made.",
      instead:
        "Adjudicate the disagreements, write the labeling rule, and only then treat the gap as a prompting problem.",
    },
    {
      id: "t4",
      trap: "Cost can be estimated once a model is chosen, since pricing is per token and volume is an engineering detail.",
      why: "Spend is driven by input length, output length, retrieval depth, retries and turns per task, so the estimate depends on discovery facts about the workload far more than on which model sits behind it.",
      instead:
        "Capture volume, typical document size and turns per task during discovery, and model spend per completed task from those.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 6",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["6.3", "6.5"],
} satisfies Lesson;
