import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D5-q301",
    domain: 5,
    objective: "5.3",
    stem: "A logistics company plans an assistant that drafts and sends customer delay notifications — about 12,000 a day, recallable for five minutes after sending. The compliance lead proposes that an operations agent approve every message before it goes out. The team has four operations agents. What should the architect propose?",
    choices: [
      {
        id: "A",
        text: "Send automatically within the recall window, route only messages that trip a rule — new account, legal language, compensation offer — for approval, and audit a random sample of the rest.",
      },
      {
        id: "B",
        text: "Approve every message as proposed, and hire operations agents until the queue clears.",
        rationale:
          "Twelve thousand approvals a day is unaffordable, and long before the headcount arrives the queue degrades into rubber-stamping that provides assurance without scrutiny.",
      },
      {
        id: "C",
        text: "Have a second model review every message and escalate only the disagreements to a person.",
        rationale:
          "A critic model is a reasonable automated check but shares failure modes with the generator, and it still leaves the consequential categories unrouted to anyone accountable.",
      },
      {
        id: "D",
        text: "Send messages the model reports high confidence in, and route the remainder for approval.",
        rationale:
          "Self-reported confidence is not calibrated, so this routes by fluency rather than by consequence and waves through exactly the confident errors that matter.",
      },
    ],
    explanation:
      "Route by reversibility and blast radius. A recallable notification is a low-consequence action that suits monitoring plus sampling, while the defined high-consequence categories deserve blocking approval. Universal review of a reversible high-volume action buys nothing except a queue that reviewers clear by approving.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["human-in-the-loop", "risk-tiering"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q302",
    domain: 5,
    objective: "5.3",
    stem: "A bank routes every AI-generated credit-limit recommendation to an analyst for approval. Last quarter: 42,000 recommendations, 99.6% approved, median review time 11 seconds, three analysts on the queue. The risk committee cites the 99.6% approval rate as evidence that the model is performing well. What is the correct interpretation?",
    choices: [
      {
        id: "A",
        text: "The model is performing well; a high approval rate is what a well-tuned system should produce.",
        rationale:
          "Approval rate confounds model quality with reviewer engagement, and eleven seconds per case is far too little time to tell those two explanations apart.",
      },
      {
        id: "B",
        text: "The approval rate is meaningless because analysts cannot be expected to evaluate model output.",
        rationale:
          "Reviewers become effective when volume is tiered and evidence is presented to them, so this is a design failure rather than a limit on what people can do.",
      },
      {
        id: "C",
        text: "The volume per analyst makes meaningful review impossible, so the rate measures queue pressure; tier the queue and measure override rate against seeded gold cases.",
      },
      {
        id: "D",
        text: "The review step changes almost nothing and should be removed, with the savings invested in model evaluation.",
        rationale:
          "Removing human oversight from a regulated credit decision is the wrong response to finding that the oversight is nominal; the fix is to make it real where it matters.",
      },
    ],
    explanation:
      "Automation bias plus queue pressure produces near-perfect approval rates regardless of model quality, so approval rate cannot distinguish an excellent model from a disengaged reviewer. Tiering by consequence restores time per item, and gold cases seeded into the queue give an independent read on whether reviewers are actually catching errors.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["human-in-the-loop", "automation-bias", "metrics"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q303",
    domain: 5,
    objective: "5.3",
    stem: "A medical-coding assistant proposes billing codes that a coder approves or edits. Over six months the override rate has fallen from 9% to 0.5% while the model has not changed, and sampled audits put its accuracy steady at 93%. Which two changes are most likely to restore effective review?",
    choices: [
      {
        id: "A",
        text: "Show the clinical text supporting each proposed code, with the supporting passage highlighted.",
      },
      {
        id: "B",
        text: "Display the model's confidence score beside each proposed code.",
        rationale:
          "A self-reported score is not calibrated, and attaching one to a recommendation tends to increase deference rather than scrutiny.",
      },
      {
        id: "C",
        text: "Seed a known-bad sample into the queue and give coders feedback on the cases they let through.",
      },
      {
        id: "D",
        text: "Require a written justification whenever a coder rejects a proposed code.",
        rationale:
          "Making rejection more expensive than acceptance creates exactly the asymmetry that drives approval rates toward 100%.",
      },
      {
        id: "E",
        text: "Propose several candidate codes per case so coders have alternatives to compare.",
        rationale:
          "More options per case lengthens the queue and adds time pressure without improving the basis on which any single suggestion is judged.",
      },
    ],
    explanation:
      "A collapsing override rate against unchanged model accuracy is automation bias, not improvement. Reviewers need evidence next to the recommendation so checking is cheaper than redoing the work, and seeded gold cases give both a measurement of reviewer attention and the feedback that keeps it from decaying again.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["human-in-the-loop", "review-design", "automation-bias"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D5-q304",
    domain: 5,
    objective: "5.3",
    stem: "A trading-desk assistant drafts client emails that must go out within seconds of a market move. Compliance requires oversight of all client communications, but blocking approval would remove the latency advantage that justified the project. Which design best satisfies both constraints?",
    choices: [
      {
        id: "A",
        text: "Have compliance pre-approve message templates and let the assistant send anything built from them.",
        rationale:
          "Template approval covers the skeleton but not the generated content, which is where the compliance risk actually lives.",
      },
      {
        id: "B",
        text: "Send immediately and give compliance a monthly report of everything that went out.",
        rationale:
          "A monthly report is an audit rather than oversight: by the time anyone reads it, a non-compliant message has sat in a client's inbox for weeks.",
      },
      {
        id: "C",
        text: "Route only the messages the model flags as sensitive to compliance and send the rest immediately.",
        rationale:
          "Self-flagging places the decision about what needs oversight inside the component being overseen, and that judgment is not calibrated for the purpose.",
      },
      {
        id: "D",
        text: "Send immediately into a live compliance queue with a short recall window, escalate defined categories for blocking approval, and audit a sample of the remainder.",
      },
    ],
    explanation:
      "When latency forbids a blocking gate, human-on-the-loop plus a reversibility window preserves intervention without sitting in the request path. Defined high-consequence categories still get a blocking gate, and sampling the rest is what makes the unreviewed path a measured risk rather than an assumed one.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["human-in-the-loop", "human-on-the-loop", "latency"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q305",
    domain: 5,
    objective: "5.3",
    stem: "A lender declines loan applications automatically. To satisfy an oversight obligation, the team adds a second model call that reviews each decline and either confirms or reverses it; confirmed declines are finalized with no person involved. The privacy office asks whether this provides the human intervention required for a solely automated decision with a significant effect. What is the accurate answer?",
    choices: [
      {
        id: "A",
        text: "Yes, provided the reviewing call uses a different model and a different prompt from the deciding call.",
        rationale:
          "Model diversity slightly decorrelates errors and makes neither call a person; the obligation concerns human involvement, not ensembling.",
      },
      {
        id: "B",
        text: "No. The decision is still solely automated; meaningful human intervention requires a person with the authority and the information to reach a different outcome.",
      },
      {
        id: "C",
        text: "Yes, as long as the applicant can request a written explanation of the decline afterward.",
        rationale:
          "An explanation route is a separate obligation and does not convert a fully automated decision into one involving human intervention.",
      },
      {
        id: "D",
        text: "No, but a monthly human audit of a sample of declines would satisfy the requirement.",
        rationale:
          "A retrospective sample provides quality assurance across the population, not intervention in the individual decision the applicant is entitled to contest.",
      },
    ],
    explanation:
      "Automated critics are useful engineering and never discharge a human-intervention obligation: they share weights, context and any manipulation with the model they review. Where a regulation requires meaningful human involvement in a significant automated decision, a named person must see the evidence and be able to change the outcome.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["human-in-the-loop", "gdpr", "automated-decisions"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q306",
    domain: 5,
    objective: "5.3",
    stem: "An architect must show a governance board that a tiered human-review layer is working. Auto-approved items make up 85% of volume; the other 15% is routed to reviewers. Which set of metrics offers the strongest evidence?",
    choices: [
      {
        id: "A",
        text: "Approval rate on routed items and average queue depth.",
        rationale:
          "Both describe throughput. Approval rate is confounded by reviewer engagement, and neither says anything about the 85% nobody looked at.",
      },
      {
        id: "B",
        text: "The share of items routed for review and the median review latency.",
        rationale:
          "These characterize what the routing policy costs, not whether it catches errors or whether the unreviewed path is safe.",
      },
      {
        id: "C",
        text: "Override rate on routed items, reviewer agreement against seeded gold cases, and a measured error rate from a random audit of auto-approved items.",
      },
      {
        id: "D",
        text: "Model accuracy on the held-out eval set and escalations per reviewer per day.",
        rationale:
          "Offline accuracy on a curated set does not describe the production population, and escalations per reviewer is a workload figure rather than a safety one.",
      },
    ],
    explanation:
      "A tiered design makes two separate claims: that routed items receive real scrutiny, and that unrouted items are safe enough to skip. Override rate and gold-case agreement evidence the first; a random audit of auto-approved decisions is the only thing that evidences the second, and without it the threshold is an assertion.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["human-in-the-loop", "metrics", "sampled-audit"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q307",
    domain: 5,
    objective: "5.3",
    stem: "Adjusters reviewing an assistant's claim recommendations see only a decision and a confidence score. They approve almost everything, and when asked they say they have no practical way to tell a good recommendation from a bad one in the time available. What change most improves the quality of review?",
    choices: [
      {
        id: "A",
        text: "Display the confidence score more prominently and sort the queue so low-confidence items come first.",
        rationale:
          "Ordering by confidence puts weak items first while still giving the reviewer nothing to check any of them against.",
      },
      {
        id: "B",
        text: "Require the adjuster to type a short justification before approving.",
        rationale:
          "Forced justification slows approval and produces boilerplate, because the reviewer still lacks the material a real justification would cite.",
      },
      {
        id: "C",
        text: "Show the evidence behind each recommendation: the policy clauses retrieved, the claim fields used, and what would change the outcome.",
      },
      {
        id: "D",
        text: "Add a second model that reviews each recommendation and flags disagreement for the adjuster.",
        rationale:
          "A second model gives a second opinion on the same basis and does not turn the human into an independent check on either of them.",
      },
    ],
    explanation:
      "Review is real only when the reviewer can reach a different conclusion, which requires the evidence rather than the conclusion. A decision plus a confidence number gives nothing to verify against, so the rational response under time pressure is to approve, and the review layer becomes a record of approvals rather than a control.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["human-in-the-loop", "review-design", "evidence"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q308",
    domain: 5,
    objective: "5.3",
    stem: "An assistant that drafts regulatory filings is wrong in some material way on roughly 30% of outputs. The team proposes shipping it with mandatory human review of every filing, arguing that review makes the error rate irrelevant. Volume is 800 filings a day and the review team has six people. What is the strongest objection?",
    choices: [
      {
        id: "A",
        text: "Human review cannot be relied upon because reviewers are subject to automation bias.",
        rationale:
          "Automation bias is real and worsens with volume, but it is a consequence here rather than the first thing that breaks.",
      },
      {
        id: "B",
        text: "Regulators may not accept human review as a substitute for a validated system.",
        rationale:
          "Acceptability is worth confirming and is a compliance question, while the design fails on its own terms before anyone rules on it.",
      },
      {
        id: "C",
        text: "The 30% figure will drift over time, so the review burden is not stable.",
        rationale:
          "Drift would make a workable arrangement gradually worse, whereas this one does not work at the rate quoted today.",
      },
      {
        id: "D",
        text: "Review at that error rate and volume is not a control but a second production line: six people cannot meaningfully check 800 filings, so the queue clears by approving.",
      },
    ],
    explanation:
      "Human review is a control only when the queue can actually be cleared at the quality the design assumes. Mandatory review is the reflexively conservative answer and is usually the wrong one: it is unaffordable at volume, it degrades into rubber-stamping, and it is offered here in place of making the system accurate enough to review selectively.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["human-in-the-loop", "review-capacity", "design"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
