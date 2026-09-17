import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.3",
  slug: "5-3-human-in-the-loop",
  domain: 5,
  objective: "Apply human-in-the-loop validation strategies",
  title: "Human-in-the-Loop Validation",
  summary:
    "Human review is not one control but a family of them, and the design question is which decisions reach a person, when, and with what evidence. A review step a reviewer cannot realistically disagree with buys accountability theater, not safety.",

  body: [
    {
      kind: "prose",
      md: "Three placements, with very different economics. **In the loop**: a person approves before the side effect, so the action cannot happen without them. **On the loop**: the system acts and a person monitors, able to intervene or reverse. **Over the loop**: nobody sees individual decisions, but a sample is audited afterward to estimate the automated path's error rate.\n\nMost exam items are really asking which of these fits a described risk profile, and the answer almost never turns out to be *review everything*.",
    },
    {
      kind: "table",
      caption: "Matching the review pattern to the decision",
      headers: ["Pattern", "Human acts", "Coverage", "Cost", "Fits"],
      rows: [
        [
          "Approval gate",
          "Before the side effect",
          "Every routed item",
          "Human latency in the request path",
          "Irreversible, high-value or regulated decisions",
        ],
        [
          "Escalation on rule",
          "Before the side effect, for routed items only",
          "The subset that trips a condition",
          "Latency only on escalations",
          "Mixed populations where most cases are routine",
        ],
        [
          "Monitoring with intervention",
          "During or just after",
          "Live queue, best effort",
          "Staffing, not latency",
          "High-volume reversible actions",
        ],
        [
          "Reversibility window",
          "After the action, before it is final",
          "Anything recallable",
          "Low",
          "Drafts, scheduled sends, queued jobs",
        ],
        [
          "Sampled audit",
          "After the fact, on a sample",
          "Statistical",
          "Low and predictable",
          "Proving the automated path's error rate",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**Route by reversibility and blast radius, not by the model's confidence.** A reversible mistake costs an undo; an irreversible one costs the thing itself. Self-reported confidence is generated text and is not calibrated, so thresholding on it escalates the articulate cases rather than the risky ones.",
    },

    { kind: "heading", text: "Making review real" },
    {
      kind: "prose",
      md: "The characteristic failure of human-in-the-loop design is not that people miss things. It is **automation bias**: a fluent, complete, plausible recommendation arrives, the reviewer's nominal job is to check it, and the approval rate settles above 99%. The control exists on the architecture diagram and nowhere else.",
    },
    {
      kind: "list",
      items: [
        "**Evidence, not a conclusion.** Show the retrieved sources, the tool calls and the values that drove the recommendation, so checking does not mean redoing the work.",
        "**A queue that can actually be cleared.** Reviewer throughput times headcount must exceed routed volume with headroom, or the backlog gets resolved by approving faster.",
        "**A cheap, blameless reject path.** Rejecting should be one click plus a reason code. If rejection requires a written justification, the approval rate tells you nothing.",
        "**Measurement of the reviewers.** Track override rate, time on task, and agreement against gold cases seeded into the queue. A 100% approval rate is a finding, not a success.",
        "**A feedback loop.** Overrides and reason codes are the best evaluation data the system will ever produce; route them into the eval set, not only into the audit log.",
      ],
    },

    { kind: "heading", text: "What human review is not" },
    {
      kind: "prose",
      md: "A second model call critiquing the first is not human review. It can be a good automated check — cheap, fast, scalable — but it shares weights, context and any injected instruction with the model it reviews, so its errors correlate with the errors it exists to catch.\n\nThe distinction also matters legally. Where a regulation requires meaningful human intervention in a significant automated decision, the reviewer must have both the authority and the information to reach a different outcome. A person who cannot in practice change the result does not satisfy the requirement, however prominently they appear in the workflow.",
    },

    {
      kind: "example",
      title: "Practical example: a claims adjudication assistant",
      scenario:
        "An insurer routes 100% of the assistant's claim recommendations to human review — about 40,000 a month across six adjusters. Leadership cites the universal review as the primary safety control. The approval rate is 99.2% and the median time on a claim is nine seconds.",
      walkthrough:
        "1. **Measure the review, not the model.** Nine seconds is a glance. Universal coverage has produced a queue that can only be cleared by approving, so the control is nominal.\n2. **Tier by consequence.** Claims under $500 auto-approve with a reversibility window plus a 2% sampled audit. Between $500 and $10,000, route only on a tripped rule — new provider, missing documentation, conflict with claim history. Above $10,000, always review.\n3. **Watch the numbers move.** Routed volume falls by four fifths, median time on task rises to about ninety seconds, and the override rate rises from 0.8% to 7%. Detected error went up as coverage went down.\n4. **Give reviewers evidence.** An evidence panel shows the policy clauses retrieved, the prior claims compared, and the fields that triggered routing, with one-click reject and reason codes.\n5. **Measure the reviewers.** 1% of the queue is seeded known-bad cases; adjusters who pass them consistently need retraining, not more volume.\n6. **Prove the auto path.** The sampled audit gives a defensible error estimate for what was never reviewed, which is what makes the threshold an evidence-based choice rather than an assertion.",
      takeaway:
        "Reviewing everything badly was worse than reviewing the right subset well, and the sample is what turns the tiering into a claim you can defend.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Have a human review every output* reads as the conservative answer and is usually wrong: it is unaffordable at volume, it degrades into rubber-stamping, and it discards the latency benefit that justified automation. The keyed answer tiers by risk and then proves the unreviewed path is safe by sampling it.",
    },

    { kind: "practice", questionId: "D5-q301" },
  ],

  keyTerms: [
    {
      term: "Human-in-the-loop",
      definition:
        "A person approves or rejects before the action takes effect. The only pattern that prevents an irreversible mistake rather than detecting one.",
    },
    {
      term: "Human-on-the-loop",
      definition:
        "The system acts autonomously while a person monitors and can intervene or reverse. Bounded by how quickly intervention is still useful.",
    },
    {
      term: "Automation bias",
      definition:
        "The tendency to accept a system's recommendation with less scrutiny than an equivalent human one, especially under time pressure or high volume.",
    },
    {
      term: "Override rate",
      definition:
        "The share of routed items a reviewer changes. Near-zero usually indicates disengaged review rather than a flawless model.",
    },
    {
      term: "Sampled audit",
      definition:
        "Reviewing a random sample of unreviewed decisions to estimate the automated path's error rate, which is what makes a routing threshold defensible.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Routing every decision to a human is the most conservative and therefore the safest design.",
      why: "At production volume, universal review creates queues that reviewers clear by approving faster, so attention per item collapses while the step now also confers false assurance to everyone downstream.",
      instead:
        "Tier by reversibility and blast radius, then sample the automated path to prove its error rate.",
    },
    {
      id: "t2",
      trap: "The model's self-reported confidence score is the natural trigger for escalation to a human.",
      why: "Expressed confidence is generated text rather than a calibrated probability, so it tracks fluency and phrasing more closely than correctness and escalates the wrong population of cases.",
      instead:
        "Trigger on decision properties — value, reversibility, novelty, conflict with a system of record — plus external signals such as retrieval scores or disagreement between independent runs.",
    },
    {
      id: "t3",
      trap: "A second model reviewing the first satisfies a human-in-the-loop requirement.",
      why: "A critic model shares weights, context and any injected instructions with the model it reviews, so its failures correlate with the ones it should catch, and no regulator treats it as human intervention.",
      instead:
        "Use automated critics for scale and a human for the decisions where accountability has to land on a person.",
    },
    {
      id: "t4",
      trap: "A high approval rate demonstrates that the automated step is performing well.",
      why: "Approval rate confounds model quality with reviewer engagement: an overloaded or under-informed reviewer produces the same near-perfect number as a genuinely accurate system, so the metric cannot distinguish them.",
      instead:
        "Measure override rate against seeded gold cases and audit a sample of approved items independently.",
    },
  ],

  practiceQuestionIds: ["D5-q301", "D5-q302"],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 5",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic Engineering",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
  ],

  relatedLessons: ["5.1", "5.4"],
} satisfies Lesson;
