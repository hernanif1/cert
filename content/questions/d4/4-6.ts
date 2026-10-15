import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D4-q601",
    domain: 4,
    objective: "4.6",
    stem: "A document assistant's operations dashboard tracks request volume, HTTP error rate and p95 latency. All three have been stable for two months. Account managers report that the answers have become noticeably less useful over the same period. What is the gap in the monitoring design?",
    choices: [
      {
        id: "A",
        text: "Latency should be tracked at p99 rather than p95.",
        rationale:
          "A finer percentile still measures speed, and nothing in the report suggests the system became slower at any percentile.",
      },
      {
        id: "B",
        text: "The dashboards need to be segmented by customer account.",
        rationale:
          "Segmenting metrics that cannot detect quality loss reproduces the same blind spot across more panels.",
      },
      {
        id: "C",
        text: "Request volume should be compared against a seasonal baseline.",
        rationale:
          "Volume trends describe demand for the system, not whether the answers it is producing are any good.",
      },
      {
        id: "D",
        text: "None of the tracked signals measures output quality, so a degradation that still returns well-formed successful responses is invisible.",
      },
    ],
    explanation:
      "LLM systems fail silently: the call succeeds, the text is fluent, and only correctness has moved. Availability-style signals never fire on that, so monitoring has to manufacture a quality series the system will not emit on its own — proxy counters, sampled grading, and a scheduled canary set.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["monitoring", "silent-failure"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q602",
    domain: 4,
    objective: "4.6",
    stem: "A silent quality regression in a drafting assistant went undetected for three weeks. The architect is asked to add monitoring that would have surfaced the same regression within a day. Which two additions are most effective?",
    choices: [
      {
        id: "A",
        text: "Chart the implicit signals already present in the workflow — human edit rate, escalation rate and retry rate — as time series with thresholds.",
      },
      {
        id: "B",
        text: "Add a thumbs-up/thumbs-down control to the interface and alert when the ratio drops.",
        rationale:
          "Explicit ratings are submitted by a small, self-selecting share of users, so the series is far too sparse and too lagged to fire inside a day.",
      },
      {
        id: "C",
        text: "Increase log retention from 30 days to one year.",
        rationale:
          "Longer retention helps a retrospective investigation but contributes nothing to detecting a regression while it is happening.",
      },
      {
        id: "D",
        text: "Replay a frozen canary evaluation set against production nightly and chart the resulting score.",
      },
      {
        id: "E",
        text: "Raise request logging from a 10% sample to 100% of traffic.",
        rationale:
          "More complete logs improve forensics after the fact but still contain no measure of whether the outputs were correct.",
      },
    ],
    explanation:
      "Detection needs a continuous quality signal. Implicit proxies such as edit and escalation rate react within minutes on real traffic and cost nothing to label, while a frozen canary set replayed on a schedule gives a series whose inputs never change, so any movement is attributable to the system rather than the traffic.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["monitoring", "regression-detection"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D4-q603",
    domain: 4,
    objective: "4.6",
    stem: "Over six weeks the judge-scored quality of sampled production traffic falls from 4.3 to 3.8. Across the same period a nightly canary set, whose inputs never change and which is graded by the same judge, holds steady at 4.4. There have been no deploys, prompt changes or index rebuilds. What is the most likely explanation?",
    choices: [
      {
        id: "A",
        text: "The judge has drifted and is now scoring production traffic more harshly.",
        rationale:
          "The same judge grades both series, so judge drift would have pulled the canary score down alongside the production score.",
      },
      {
        id: "B",
        text: "The input distribution has shifted — users are asking different or harder questions — rather than the system degrading.",
      },
      {
        id: "C",
        text: "The canary set has become contaminated and no longer detects regressions.",
        rationale:
          "Contamination would show as an inflated canary score that fails to move when a real change regresses the system, and here nothing has changed at all.",
      },
      {
        id: "D",
        text: "Sampling bias in the production sample is understating the true quality.",
        rationale:
          "A bias that appears gradually over six weeks with no change to the sampler is a much weaker explanation than a shift in the traffic itself.",
      },
    ],
    explanation:
      "A fixed-input canary series and a live-traffic series are designed to be read against each other. Canary flat while sampled quality falls isolates the change to the inputs, not the system, which redirects the investigation toward new topics, new markets or new phrasing rather than toward the model or the prompt.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["monitoring", "drift"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q604",
    domain: 4,
    objective: "4.6",
    stem: "An architect is defining what each request must log for an assistant that ships prompt changes weekly and rebuilds its retrieval index nightly. Which addition most improves the team's ability to attribute a future quality regression to its cause?",
    choices: [
      {
        id: "A",
        text: "The full prompt and completion text for every request, retained indefinitely.",
        rationale:
          "Indefinite retention of prompts and completions creates a privacy and compliance liability, and the raw text still does not identify which configuration produced it.",
      },
      {
        id: "B",
        text: "A unique per-request identifier surfaced to the user for support tickets.",
        rationale:
          "A correlation id makes one conversation findable but carries no information about what differed between releases.",
      },
      {
        id: "C",
        text: "Model version, prompt template version and index build id on every request, annotated onto the dashboards at each deploy.",
      },
      {
        id: "D",
        text: "A per-request confidence score obtained by asking the model to rate its own answer.",
        rationale:
          "Self-rated confidence is weakly correlated with correctness and would not localize a regression to any particular release.",
      },
    ],
    explanation:
      "Attribution requires that every request record the identity of the configuration that produced it, not only its outcome. With version fields on each line and deploys marked on the charts, a step in a quality series can be lined up against a specific prompt change or index rebuild instead of being guessed at.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["logging", "attribution"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q605",
    domain: 4,
    objective: "4.6",
    stem: "A team has forty alerts configured across its assistant. Most fire several times a week, and the engineers have muted the channel. The architect is asked to fix the alerting. Which principle should guide the redesign?",
    choices: [
      {
        id: "A",
        text: "Page only on symptoms users actually feel, each with a named owner and a defined response, and route slow trends to a scheduled review instead.",
      },
      {
        id: "B",
        text: "Widen every threshold by 50% so that alerts fire considerably less often.",
        rationale:
          "Loosening thresholds uniformly reduces noise and genuine detection together, without distinguishing which alerts were ever worth acting on.",
      },
      {
        id: "C",
        text: "Route all forty alerts to a dedicated on-call rotation so that none are missed.",
        rationale:
          "Adding staffing to an unactionable alert stream spreads the fatigue across more people rather than removing its cause.",
      },
      {
        id: "D",
        text: "Replace threshold alerts with anomaly detection across every metric.",
        rationale:
          "Anomaly detection on forty metrics produces a comparable volume of notifications with less explainability, so the muting problem survives the change.",
      },
    ],
    explanation:
      "An alert that nobody can act on trains the team to ignore the channel, which is a worse outcome than the condition being monitored. Paging is reserved for user-visible breakage with an owner and a runbook; gradual quality decay is real but belongs on a periodic review rather than a pager.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["monitoring", "alerting"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q606",
    domain: 4,
    objective: "4.6",
    stem: "A drafting assistant produces replies that agents edit before sending. The team wants a quality signal that reacts within hours rather than the days an LLM-judge sample takes, and that needs no labeling. Which signal fits?",
    choices: [
      {
        id: "A",
        text: "The share of conversations in which the agent used the assistant at all.",
        rationale:
          "Adoption tracks whether people reach for the tool, which moves with habit and training long after quality has changed.",
      },
      {
        id: "B",
        text: "The proportion of drafts sent unedited, and how much of the text agents change when they do edit.",
      },
      {
        id: "C",
        text: "A weekly survey asking agents to rate the assistant's usefulness.",
        rationale:
          "A survey is explicit labeling on a weekly cadence, which is slower than the judge sample it is meant to beat and sparser.",
      },
      {
        id: "D",
        text: "The rate of HTTP errors and timeouts from the drafting endpoint.",
        rationale:
          "Those are operational signals, and a silent quality regression produces successful responses that nobody had to correct any faster.",
      },
    ],
    explanation:
      "A proxy quality metric is a behavior the system already records that correlates with quality and costs nothing to collect. Edit distance on human-corrected output reacts almost immediately and needs no judge, which is what makes it the fastest of the three complementary signals even though it is blind to drafts nobody reviews carefully.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["monitoring", "proxy-quality-metric"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q607",
    domain: 4,
    objective: "4.6",
    stem: "A judge-scored quality metric fell over an eight-day window. The team ships prompt changes several times a week, rebuilds the index nightly and updates model configuration occasionally, and reconstructing what happened when takes two engineers most of a day. What should be added to the monitoring so this is answerable immediately?",
    choices: [
      {
        id: "A",
        text: "A finer sampling interval on the quality metric, so the shift is located to the hour.",
        rationale:
          "Knowing the precise hour of the drop still leaves the team searching several systems for what changed around it.",
      },
      {
        id: "B",
        text: "Alerting on the quality metric, so the next drop is noticed sooner.",
        rationale:
          "Earlier notice shortens the exposure and does nothing about the attribution work that follows the alert.",
      },
      {
        id: "C",
        text: "Deploy annotations on the metric timeline, marking every prompt, index and configuration change as it happens.",
      },
      {
        id: "D",
        text: "Retention of full prompts and completions for the affected window.",
        rationale:
          "Stored payloads show what the system produced, not which of the week's changes altered what it was producing.",
      },
    ],
    explanation:
      "A metric that moves is only actionable if the timeline carries what changed beside it. Annotating deploys as they happen turns correlation into a first guess that takes seconds, which is the difference between a monitoring system that reports a problem and one that helps locate it.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["monitoring", "deploy-annotation", "attribution"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
