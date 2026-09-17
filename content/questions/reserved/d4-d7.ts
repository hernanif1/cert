import type { Question } from "@/content/schema";

/**
 * Mock Form A — the D4–D7 half.
 *
 * These 32 items are authored as one sitting, not as per-objective drills:
 * the spread samples across each domain's objectives, difficulty is mixed the
 * way a real form mixes it, and no scenario is reused from the drill pool.
 * Reserved ids use objective digit 9; the `objective` field carries the real
 * objective.
 */
export const questions = [
  /* ──────────────── D4 · Evaluation, Testing & Optimization ─────────────── */

  {
    schemaVersion: 1,
    id: "D4-q901",
    domain: 4,
    objective: "4.1",
    stem: "A retail returns-triage assistant goes live next month. The launch dashboard plots four figures nightly: field-level extraction accuracy, p95 response time, cost per request, and refusal rate. None of the four has a threshold attached, and nobody on the team can say what happens if one of them moves. What should the architect add before launch?",
    choices: [
      {
        id: "A",
        text: "Two further metrics — groundedness and a hallucination rate — so the quality dimension is covered more completely.",
        rationale:
          "Broader coverage does not help while not one of the existing figures is tied to a decision. The gap is interpretation, not the number of dimensions measured.",
      },
      {
        id: "B",
        text: "A single composite score combining the four, so movement is easier to read at a glance.",
        rationale:
          "A composite hides which dimension moved and makes the trade-off between accuracy, latency and cost invisible at exactly the moment it has to be weighed.",
      },
      {
        id: "C",
        text: "A target value for each metric, derived from the process it replaces, plus the action taken when a target is breached.",
      },
      {
        id: "D",
        text: "Hourly rather than nightly recomputation, so the team sees movement sooner.",
        rationale:
          "Recomputing uninterpretable numbers more often produces faster noise. Nothing about the cadence turns telemetry into a launch decision.",
      },
    ],
    explanation:
      "Defining an evaluation metric means naming the measurement, the target it must hit, and the decision the target governs. A figure with no threshold and no owning decision is telemetry: it cannot gate a launch, and it cannot tell anyone whether the system is better than the process it replaces. Targets come from the measured baseline.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["metrics", "targets", "launch-criteria"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q902",
    domain: 4,
    objective: "4.1",
    stem: "An architect reviews the metric set for an agent that reads internal tickets and can call `create_ticket`, `update_ticket` and `post_comment` on behalf of the requesting user. Accuracy, p95 latency, cost per resolved ticket and a harmful-content rate are all defined and instrumented. Nothing measures the security dimension. Which two metrics best fill that gap? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Mean number of tool calls per resolved ticket.",
        rationale:
          "A reasonable efficiency and cost signal, but it says nothing about whether any of those calls was one the requesting user was not entitled to make.",
      },
      {
        id: "B",
        text: "Rate of tool calls the agent attempted outside the requesting user's own permissions, counted at the enforcement layer.",
      },
      {
        id: "C",
        text: "Share of agent responses a reviewer rates as professional in tone.",
        rationale:
          "Tone is a quality and brand concern. It moves independently of whether an unauthorized action was attempted or an injected instruction was followed.",
      },
      {
        id: "D",
        text: "Uptime of the ticketing API the agent depends on.",
        rationale:
          "A dependency availability figure that belongs on the reliability dashboard. It measures whether the system is up, not whether it is being abused.",
      },
      {
        id: "E",
        text: "Pass rate against a maintained suite of prompt-injection and privilege-escalation attempts, re-run on every release.",
      },
      {
        id: "F",
        text: "Total tokens consumed per day across all agent sessions.",
        rationale:
          "A spend metric. Unauthorized actions are cheap in tokens, so this figure would sit flat straight through a successful attack.",
      },
    ],
    explanation:
      "Security is a first-class metric dimension alongside accuracy, latency, cost and safety, and it has to be measured where it is enforced. Attempted-violation rate at the authorization layer captures what the agent tried to do beyond its caller's rights, and a standing adversarial suite gives a per-release number rather than a count of incidents that happened to be noticed.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["metrics", "security", "agents"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "E"],
  },
  {
    schemaVersion: 1,
    id: "D4-q903",
    domain: 4,
    objective: "4.2",
    stem: "A team builds its first evaluation dataset for a warranty-claims assistant by asking a model to generate 250 realistic-looking claims with expected answers. The suite scored 96% on its first run and has never dropped below 94%. Production complaints, meanwhile, concern claims with photographs attached, claims filed in Portuguese, and claims where the purchase date is missing. Which three changes most directly repair the dataset? (Select THREE.)",
    choices: [
      {
        id: "A",
        text: "Seed the dataset from sampled real production claims instead of generated ones.",
      },
      {
        id: "B",
        text: "Add cases for each failure category the complaints identify, with expected outputs agreed by a claims expert.",
      },
      {
        id: "C",
        text: "Grow the dataset from 250 to 1,000 generated cases so rare situations appear by chance.",
        rationale:
          "More cases drawn from the same generator reproduce the same easy claims. Scale cannot introduce conditions the generator never modeled in the first place.",
      },
      {
        id: "D",
        text: "Label every case as normal, edge or adversarial, and report the score per slice as well as overall.",
      },
      {
        id: "E",
        text: "Replace the automated graders with human review of all 250 cases on every run.",
        rationale:
          "Human grading is slower and far more expensive, and it changes how the cases are scored rather than fixing the fact that the cases do not represent production.",
      },
      {
        id: "F",
        text: "Raise the passing threshold from 94% to 99% so the suite is harder to satisfy.",
        rationale:
          "A higher bar on an unrepresentative dataset forces tuning against cases that nobody actually sends, which widens the gap with production rather than closing it.",
      },
    ],
    explanation:
      "An evaluation dataset is only useful to the degree it resembles what the system will be asked to do. Generated-only data inherits the generator's blind spots, which is why the suite sat at 96% while real traffic failed. Mixed methodology means sourcing from production, encoding known failures as permanent cases, and slicing the score so a strong overall figure cannot hide a weak edge-case tier.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["eval-dataset", "synthetic-data", "slicing"],
    type: "multi",
    selectCount: 3,
    correct: ["A", "B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D4-q904",
    domain: 4,
    objective: "4.2",
    stem: "An evaluation harness for a seven-step procurement agent records one boolean per task: did the final purchase order match the expected one. Across 120 tasks the suite has been stuck at 68% for a month. Each time it fails, an engineer spends about an hour replaying the run by hand to work out which step went wrong. Which change to the framework most improves the team's ability to iterate?",
    choices: [
      {
        id: "A",
        text: "Assert on intermediate checkpoints — supplier selected, quantities extracted, approval path chosen — alongside the final output.",
      },
      {
        id: "B",
        text: "Raise the task count from 120 to 500 so the score is more stable.",
        rationale:
          "A larger sample tightens the confidence interval on a number that already reproduces consistently. It still does not say which of the seven steps failed.",
      },
      {
        id: "C",
        text: "Replace the boolean with a five-point judge rating of the final purchase order.",
        rationale:
          "A graded score on the same end-of-run artifact is still a single verdict at the end of the trajectory, so the attribution problem is entirely unchanged.",
      },
      {
        id: "D",
        text: "Run each task three times and record the majority result.",
        rationale:
          "This measures run-to-run variance, which is worth knowing, but it averages away the very failures the team needs to localize inside the trajectory.",
      },
    ],
    explanation:
      "Test frameworks for agentic systems need trajectory-level assertions, not only end-state checks. A per-step expectation turns a month of manual replay into an automatic answer about where the workflow breaks, which is what makes iteration possible; end-state-only scoring measures the system but gives the team nothing to act on.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["eval-framework", "agents", "step-assertions"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q905",
    domain: 4,
    objective: "4.3",
    stem: "An internal contract-review assistant serves 70 lawyers and handles roughly 350 documents a week. The team wants to compare a revised prompt against the current one and needs to detect a three-point change in clause-extraction accuracy. A power calculation puts the split test at about eleven months at current volume. What should the architect propose?",
    choices: [
      {
        id: "A",
        text: "Run the split test anyway and read the result after four weeks.",
        rationale:
          "Reading an underpowered test early yields a number that is mostly noise, and a non-significant outcome will be reported as evidence that the change did nothing.",
      },
      {
        id: "B",
        text: "Loosen the significance threshold to 0.2 so the test concludes sooner.",
        rationale:
          "Trading false positives for speed means shipping changes that never worked. Moving the bar does not create the sample the comparison requires.",
      },
      {
        id: "C",
        text: "Randomize by lawyer rather than by document to raise the effective sample size.",
        rationale:
          "Changing the randomization unit does not manufacture traffic, and clustering responses within a lawyer typically lowers effective sample size rather than raising it.",
      },
      {
        id: "D",
        text: "Decide the change offline on a labeled extraction set, then roll it out in stages while watching guardrail metrics.",
      },
    ],
    explanation:
      "A/B testing is one instrument among several, and it only earns its place when traffic can power the comparison inside a useful timeframe. At this volume it cannot, so the defensible route is an offline measurement on labeled data, where every case is graded, followed by a staged rollout with guardrails to catch what the offline set did not cover.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["ab-testing", "power", "staged-rollout"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q906",
    domain: 4,
    objective: "4.3",
    stem: "A team tests two versions of a meeting assistant that differ only in how they write the running summary carried into later turns. Both versions read and write the same per-workspace summary store, and colleagues inside a workspace are assigned to versions independently. After three weeks the new version leads by two points on the primary metric. What most undermines this result?",
    choices: [
      {
        id: "A",
        text: "The primary metric was chosen after the comparison had already started.",
        rationale:
          "Nothing in the setup indicates this happened. It would be a separate governance failure rather than the structural defect described in the scenario.",
      },
      {
        id: "B",
        text: "Each version reads summaries the other version wrote, so the two are not independent and the measured gap does not reflect either design on its own.",
      },
      {
        id: "C",
        text: "Three weeks is too short for a summarization change to show its effect.",
        rationale:
          "Duration is not the defect. Running a contaminated comparison for longer produces a more precise estimate of a quantity that still means nothing.",
      },
      {
        id: "D",
        text: "Assigning at the level of the individual colleague introduces selection bias.",
        rationale:
          "Independent random assignment is not selection bias. The problem is that the two arms share mutable state after assignment, not the way assignment was done.",
      },
    ],
    explanation:
      "The comparison assumes each unit's outcome depends only on its own treatment. A shared summary store breaks that assumption: one version's output becomes the other's input, so the arms contaminate each other and the two-point gap is uninterpretable. The fix is to randomize at the workspace boundary or give each arm its own store.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["ab-testing", "interference", "shared-state"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D4-q907",
    domain: 4,
    objective: "4.4",
    stem: "A grounded product assistant fills a six-field specification card from retrieved datasheets. When a datasheet genuinely omits the operating-temperature range, the assistant supplies a plausible range anyway. The prompt instructs it to return all six fields on every call. Which change most directly addresses the cause?",
    choices: [
      {
        id: "A",
        text: "Allow and require an explicit `not_stated` value for any field the retrieved text does not support.",
      },
      {
        id: "B",
        text: "Add an instruction telling the model not to invent values.",
        rationale:
          "The same prompt still demands six populated fields, so a blanket honesty instruction contradicts the output contract the model is being graded against.",
      },
      {
        id: "C",
        text: "Retrieve more datasheet chunks per request so the missing range is more likely to be found.",
        rationale:
          "Useful when the content exists and retrieval missed it. Here the range is absent from the source document, so widening retrieval returns the same silence.",
      },
      {
        id: "D",
        text: "Move this extraction step to a larger model.",
        rationale:
          "A stronger model asked for a value that does not exist will still produce one. Capability does not relieve the pressure the output contract creates.",
      },
    ],
    explanation:
      "This is a prompt failure presenting as a hallucination. The output contract makes fabrication the only way to satisfy the instruction, so the diagnosis is the contract rather than the model or the retrieval step. Making abstention a legal, expected output removes the pressure and turns a silent invention into a visible gap.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["diagnosis", "abstention", "prompt-failure"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D4-q908",
    domain: 4,
    objective: "4.4",
    stem: "An insurance document assistant scores 93% overall. Broken out by intake channel it scores 97% on documents submitted through the web form and 61% on documents arriving as email attachments. Prompt, model and retrieval configuration are identical for both channels. Sampling the low-scoring outputs shows fields populated with fragments of neighboring text. Where should the architect investigate first?",
    choices: [
      {
        id: "A",
        text: "The system prompt, which may need examples drawn from attachment-sourced documents.",
        rationale:
          "Prompt examples cannot recover characters that were never read correctly, and the identical prompt already succeeds on the same task via the web form.",
      },
      {
        id: "B",
        text: "The model's handling of long inputs, since attachments tend to be longer.",
        rationale:
          "Length failures truncate or omit content. Fields holding fragments of adjacent text point at how the page was read, not at how much of it there was.",
      },
      {
        id: "C",
        text: "The text-extraction stage that turns attachments into the text the model actually sees.",
      },
      {
        id: "D",
        text: "The retrieval index, which may be ranking attachment-derived chunks poorly.",
        rationale:
          "Poor ranking surfaces irrelevant but coherent passages. Interleaved neighboring text is a signature of layout parsing rather than of ranking.",
      },
    ],
    explanation:
      "Diagnosis starts by isolating what differs between a healthy cohort and a failing one. Everything downstream of intake is identical here, so the defect lives in the stage that is not: the conversion of attachments into text. The fragment symptom confirms it — the model is faithfully reading badly extracted characters.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["diagnosis", "cohort-analysis", "document-pipeline"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D4-q909",
    domain: 4,
    objective: "4.5",
    stem: "An agentic code-review assistant averages 14 turns per review. The full contents of every file it has opened are re-sent on each turn, so by turn ten a request carries roughly 90,000 tokens of file text. Cost per review is four times the estimate and p95 latency has doubled since the assistant shipped. Which change yields the largest improvement?",
    choices: [
      {
        id: "A",
        text: "Enable prompt caching over the system prompt and tool schemas.",
        rationale:
          "Worth doing, but those are a few thousand stable tokens. The growth comes from file text that changes every turn and so never forms a reusable prefix.",
      },
      {
        id: "B",
        text: "Move the review to a smaller, cheaper model.",
        rationale:
          "A smaller model still pays for the same 90,000 tokens each turn and reviews code less well. The input volume, not the unit price, is what grew.",
      },
      {
        id: "C",
        text: "Cap each review at eight turns.",
        rationale:
          "This truncates work mid-review and only trims the tail, while requests are already oversized several turns before the cap would bite.",
      },
      {
        id: "D",
        text: "Keep file contents out of the running conversation — store them once, pass only the ranges under discussion, and let the agent re-read on demand.",
      },
    ],
    explanation:
      "In an agent loop the dominant token cost is usually accumulated tool output rather than the prompt or the model. Re-sending whole files makes every turn more expensive than the last, so cost and latency grow with conversation depth. Controlling what stays resident in context is the lever; model choice and caching act on the part that is already small.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["optimization", "context-growth", "agents"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D4-q910",
    domain: 4,
    objective: "4.6",
    stem: "A shared document assistant serves 40 business units from one deployment. Overall p95 latency, error rate and judge-scored quality have been flat for two months. The legal unit then escalates that answers have been close to useless for them since a retrieval index change five weeks ago. Their 300 requests a day sit inside a total of 90,000. Which monitoring change would have surfaced this?",
    choices: [
      {
        id: "A",
        text: "Alert whenever any single request scores below two on the quality judge.",
        rationale:
          "Individual low scores occur constantly in healthy traffic. An alert on each one fires continuously and gets muted long before it catches anything real.",
      },
      {
        id: "B",
        text: "Break every dashboard metric down by business unit and alert on deviation from each unit's own baseline.",
      },
      {
        id: "C",
        text: "Raise judge-scoring coverage from 2% to 10% of traffic.",
        rationale:
          "More samples feeding the same aggregate leaves a cohort that is a third of one percent of volume just as invisible, only at five times the grading cost.",
      },
      {
        id: "D",
        text: "Add a feedback widget so users can flag bad answers.",
        rationale:
          "A useful signal, but it depends on users choosing to report, and in this case it surfaced only as an escalation five weeks later.",
      },
    ],
    explanation:
      "Monitoring at scale fails when aggregation hides the cohort that broke. A unit contributing 0.3% of traffic can collapse without moving a single global number, so the dashboard has to be segmented along the dimension that varies — tenant, document type, locale — and alerting has to compare each segment against its own history rather than the fleet average.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["monitoring", "segmentation", "multi-tenant"],
    type: "single",
    correct: "B",
  },

  /* ────────────── D5 · Governance, Safety & Risk Management ─────────────── */

  {
    schemaVersion: 1,
    id: "D5-q901",
    domain: 5,
    objective: "5.1",
    stem: "A research agent has a web-fetch tool and a scratch-file tool and is told to keep working until it has answered the question. During an overnight run it fell into a cycle of fetching, summarizing and re-fetching the same three pages, and stopped only when the account hit its monthly spend limit at 6 a.m. The team proposes adding \"do not fetch the same page twice\" to the system prompt. Which two controls should the architect require instead? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "A hard per-run ceiling on tool calls and tokens, enforced by the orchestrator rather than by the model.",
      },
      {
        id: "B",
        text: "A larger context window so the agent can see all of its own earlier fetches.",
        rationale:
          "The agent could already see them; awareness was never the binding constraint, and a wider window raises the cost of every iteration of the loop.",
      },
      {
        id: "C",
        text: "A lower sampling temperature so the agent behaves more deterministically.",
        rationale:
          "Determinism does not bound work. A deterministic agent loops just as reliably, and sampling settings create no stopping condition of any kind.",
      },
      {
        id: "D",
        text: "An explicit, checkable completion condition, with the run terminated and escalated when it is not met inside the budget.",
      },
      {
        id: "E",
        text: "A wrapper that restarts the run from the beginning whenever it exceeds an hour.",
        rationale:
          "Restarting an unbounded process multiplies the spend it was supposed to contain and discards whatever partial progress the run had made.",
      },
    ],
    explanation:
      "A guardrail that the model can talk itself out of is not a control. Resource exhaustion is bounded by limits the orchestration layer enforces — a ceiling on calls and tokens — and by a termination condition someone other than the model can evaluate, so an agent that cannot finish stops and escalates rather than running until the budget does.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["guardrails", "resource-limits", "agent-loops"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D5-q902",
    domain: 5,
    objective: "5.1",
    stem: "A safety classifier in front of a patient-messaging assistant blocks any draft it flags, and blocked 4.1% of drafts last quarter. A review of 200 blocked drafts finds 160 were ordinary clinical language the classifier misread. The nurses who hit the block now route those messages through personal email instead. The safety team's position is that the threshold must not move. What should the architect propose?",
    choices: [
      {
        id: "A",
        text: "Relax the threshold until the block rate falls below 1%.",
        rationale:
          "Picking a threshold from the block rate rather than from measured error rates trades an unknown amount of real harm for an easier-looking number.",
      },
      {
        id: "B",
        text: "Hold the threshold and train the nurses not to use the workaround.",
        rationale:
          "A control people route around has already failed. Policy pressure on users restores none of the coverage and pushes the traffic further out of view.",
      },
      {
        id: "C",
        text: "Remove the classifier and rely on the assistant's own refusal behavior.",
        rationale:
          "This deletes the independent check and leaves the model policing itself, which is precisely the arrangement a separate classifier exists to avoid.",
      },
      {
        id: "D",
        text: "Measure false-positive and false-negative rates on a labeled clinical sample, then route flagged-but-plausible drafts to a fast human review lane rather than a hard block.",
      },
    ],
    explanation:
      "A guardrail has two error rates and both carry cost. An unmeasured false-positive rate produces shadow workflows that defeat the control entirely, so the first move is to quantify both errors on representative clinical text. Blocking is one response among several; routing to review preserves oversight without pushing legitimate work outside the system.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["guardrails", "false-positives", "review-routing"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q903",
    domain: 5,
    objective: "5.2",
    stem: "A travel-policy assistant is told at the start of each chat which cost center the traveler belongs to and which airlines are approved for it. Short chats apply the rules correctly. Past roughly forty turns it begins suggesting airlines outside the approved list, and the logged request shows the opening turns are no longer present. Which failure mode is this?",
    choices: [
      {
        id: "A",
        text: "Constraints stated once at the start are evicted as the conversation is trimmed to fit the context window.",
      },
      {
        id: "B",
        text: "The provider updated the model mid-conversation, changing how it weighs instructions.",
        rationale:
          "A provider change would affect short chats as well, and the logged request already shows the opening turns missing from what the model received.",
      },
      {
        id: "C",
        text: "The approved-airline list is being retrieved incorrectly from the policy index.",
        rationale:
          "The list was never retrieved. It was supplied in conversation at the start of the chat, and the evidence concerns what the request still contains.",
      },
      {
        id: "D",
        text: "The traveler is manipulating the assistant into disregarding policy.",
        rationale:
          "Nothing in the pattern suggests adversarial input, and the failure tracks conversation length rather than anything a particular traveler said.",
      },
    ],
    explanation:
      "Silent context truncation is a standard failure mode of long sessions: the model does not report that it lost the rules, it simply stops applying them. Durable constraints belong in the system prompt or are re-injected each turn, so that trimming conversation history can never remove them. The length correlation is the tell.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["failure-modes", "context-truncation", "long-sessions"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q904",
    domain: 5,
    objective: "5.2",
    stem: "An order-management agent calls `submit_return`, which occasionally times out after the warehouse system has already recorded the return. The agent retries on timeout, and finance now finds duplicate return credits on roughly one order in 400. The engineering lead proposes lengthening the timeout. Which two changes actually address the failure? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Send a caller-generated idempotency key with each `submit_return` so a repeat of the same logical call is recognized as such.",
      },
      {
        id: "B",
        text: "Raise the sampling temperature so the agent varies its retry behavior.",
        rationale:
          "Sampling variability has no bearing on duplicate side effects, and it makes the agent's behavior less predictable at exactly the wrong boundary.",
      },
      {
        id: "C",
        text: "Have the agent read the return's state back after a timeout and act on what it finds instead of retrying blindly.",
      },
      {
        id: "D",
        text: "Instruct the agent in the system prompt never to call `submit_return` twice for the same order.",
        rationale:
          "The agent has no way to know whether the first call landed, and the instruction gives it none. Correctness here belongs to the protocol, not the prompt.",
      },
      {
        id: "E",
        text: "Disable retries entirely so no duplicate can be created.",
        rationale:
          "This converts a duplication problem into a silent-loss problem: genuine timeouts would leave returns unprocessed with nobody informed that anything failed.",
      },
    ],
    explanation:
      "Non-idempotent side-effecting tools combined with automatic retries are a classic agentic failure mode, because a timeout is ambiguous about whether the write landed. The architectural answer is to make the repeat safe with an idempotency key and to resolve the ambiguity by reading state back. Lengthening the timeout narrows the window without closing it.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["failure-modes", "idempotency", "tool-side-effects"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D5-q905",
    domain: 5,
    objective: "5.3",
    stem: "Underwriters approve or reject an assistant's risk narratives before they are attached to a policy file. Each narrative runs about 600 words and draws on the applicant's submitted documents. Underwriters say they cannot realistically check them: verifying one means opening six PDFs and hunting for the relevant paragraph. Approval takes an average of 40 seconds. Which change most improves the quality of review?",
    choices: [
      {
        id: "A",
        text: "Cut the narrative to 200 words so there is less to check.",
        rationale:
          "A shorter narrative still makes claims the underwriter cannot trace. Brevity lowers reading time without giving them anything to check the claims against.",
      },
      {
        id: "B",
        text: "Attach a confidence score to each narrative so underwriters know which ones to scrutinize.",
        rationale:
          "Self-reported confidence is poorly calibrated, and it concentrates attention without making any individual claim verifiable in the time available.",
      },
      {
        id: "C",
        text: "Render each claim with an inline link to the exact page and paragraph it came from, so verification costs one click per claim.",
      },
      {
        id: "D",
        text: "Require two underwriters to approve each narrative.",
        rationale:
          "Doubling a review nobody can perform doubles the cost and produces two uninformed approvals in place of one, while halving throughput.",
      },
    ],
    explanation:
      "Human-in-the-loop validation only works when the human can verify inside the time the process allows. A 40-second approval on 600 unsourced words is a signature, not a check. Designing the evidence surface — traceable citations at claim granularity — is what converts the checkpoint into real oversight, and it is a design decision, not a training one.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["human-in-the-loop", "verifiability", "citations"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q906",
    domain: 5,
    objective: "5.3",
    stem: "An export-compliance assistant screens outbound shipments and flags about 30 a week as possibly restricted. Flags land in the shared shipping-desk queue, where the first available clerk clears them. Clerks clear 29 of 30 within minutes; the one they escalate usually has an unfamiliar country name. An audit finds two genuinely restricted shipments were cleared and shipped. What is the primary design fault?",
    choices: [
      {
        id: "A",
        text: "The flag rate is too high, so clerks have become desensitized to it.",
        rationale:
          "Thirty flags a week across a shipping desk is a manageable volume. The audit failure is about who is deciding, not about the number of decisions.",
      },
      {
        id: "B",
        text: "The review is routed to people with neither the licensing knowledge nor the authority to hold a shipment, so the gate cannot reach a different conclusion than the model did.",
      },
      {
        id: "C",
        text: "The assistant's recall is too low to be relied on for screening.",
        rationale:
          "The audit found shipments the assistant had already flagged. The model surfaced them correctly and the review step let them through.",
      },
      {
        id: "D",
        text: "Clerks should be required to document a reason for every clearance.",
        rationale:
          "A reasonable audit improvement on its own, but documenting an unqualified decision produces a written record of the same wrong outcome.",
      },
    ],
    explanation:
      "A validation step is only meaningful when the reviewer has the expertise, the evidence and the authority to decide differently from the model. Routing by queue availability rather than by competence produces a gate that rubber-stamps by construction. Human-in-the-loop design specifies who reviews and what they are given, not just that a review exists.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["human-in-the-loop", "reviewer-competence", "escalation"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q907",
    domain: 5,
    objective: "5.4",
    stem: "A German manufacturer's works agreement requires that employee data stay inside the EU and that every subprocessor handling it be named in an appendix. The assistant runs in an EU region. Its evaluation harness uploads sampled transcripts to a US analytics workspace, and the retrieval index is replicated nightly to a US bucket for disaster recovery. The team holds that the assistant is compliant because inference is EU-hosted. What should the architect tell them?",
    choices: [
      {
        id: "A",
        text: "Residency applies to every component that stores or processes the data, so the evaluation workspace and the backup replica are in scope and must be regionalized or removed from the path.",
      },
      {
        id: "B",
        text: "Residency is satisfied because inference is EU-hosted; evaluation and backups are internal engineering concerns.",
        rationale:
          "Both systems hold the employee data itself, and a commitment about where data lives carves out no exception for systems the engineering team happens to own.",
      },
      {
        id: "C",
        text: "Encrypting the nightly replica and the uploaded transcripts brings both transfers within the agreement.",
        rationale:
          "Encryption limits who can read the data. It changes neither the region the data is stored in nor which third party is processing it.",
      },
      {
        id: "D",
        text: "Naming the analytics vendor in the appendix resolves the issue for both systems.",
        rationale:
          "Naming a subprocessor satisfies the disclosure clause but not the residency clause, and it says nothing at all about the US backup bucket.",
      },
    ],
    explanation:
      "Compliance scope is the whole data path, not the inference call. Evaluation harnesses, observability sinks and disaster-recovery replicas are the places residency commitments most often break, because they are added by engineers after the compliance review and handle the same personal data the production path does.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["data-residency", "subprocessors", "compliance-scope"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q908",
    domain: 5,
    objective: "5.4",
    stem: "A broker's advice assistant operates under two rules: a financial regulator requires every piece of advice given to a client to be retained for seven years, and the firm's privacy policy commits to deleting a client's personal data on request. A client who received advice last year submits a deletion request. Engineering proposes deleting that client's entire conversation history, advice records included. What should the architect advise?",
    choices: [
      {
        id: "A",
        text: "Delete everything as requested, since the privacy commitment is the stricter of the two obligations.",
        rationale:
          "The retention rule is a legal obligation on the firm. Destroying records it is required to keep creates a regulatory breach rather than resolving a privacy one.",
      },
      {
        id: "B",
        text: "Retain everything and decline the request, since the regulator's rule covers the conversation.",
        rationale:
          "The obligation covers advice records, not every message exchanged. A blanket refusal keeps personal data the firm has no lawful basis to hold.",
      },
      {
        id: "C",
        text: "Keep only the records the retention obligation covers, under a documented legal basis and restricted access, and delete everything outside that scope.",
      },
      {
        id: "D",
        text: "Anonymize the advice records by stripping the client identifier, then confirm deletion.",
        rationale:
          "Advice records that can no longer be tied to a client defeat the purpose of a rule that exists to reconstruct what that client was told.",
      },
    ],
    explanation:
      "Erasure rights yield to a legal retention obligation for exactly the data that obligation covers, and no further. The architectural consequence is that deletion must be scopeable at record granularity rather than by conversation or by account, and that the retained subset needs a documented basis and access controls of its own.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["retention", "erasure", "conflicting-obligations"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q909",
    domain: 5,
    objective: "5.5",
    stem: "A utility's assistant recommends hardship-payment arrangements. It is grounded entirely in eleven years of case notes written by the company's own collections agents. An audit finds it proposes the shortest, strictest plan far more often for customers in a handful of postcodes, and those postcodes correlate with a protected characteristic. A review of the model, prompt and retrieval configuration finds no reference to location anywhere. Which explanation should the architect pursue first?",
    choices: [
      {
        id: "A",
        text: "Bias carried in from the model's pretraining that the prompt failed to suppress.",
        rationale:
          "Possible in principle, but the system is grounded in one company's specific corpus and the disparity tracks that company's own history rather than a general pattern.",
      },
      {
        id: "B",
        text: "The retrieval step is leaking postcode into the query through customer metadata.",
        rationale:
          "Worth verifying, though the configuration review already found no location reference, and grounding on past decisions explains the pattern without it.",
      },
      {
        id: "C",
        text: "The audit sample is too small to support the conclusion it reaches.",
        rationale:
          "Sample adequacy is always worth checking, but dismissing a disparity finding before investigating its most likely source is not a defensible first move.",
      },
      {
        id: "D",
        text: "The case notes encode the collections team's historical decisions, so the assistant reproduces whatever disparity those decisions already contained.",
      },
    ],
    explanation:
      "When a system is grounded in a record of past human decisions, fairness work starts with auditing that ground truth. Removing a protected attribute from the prompt does not remove it from eleven years of case notes, where it survives in the outcomes themselves. The architect's first move is to measure disparity in the corpus, not in the model.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["bias", "grounding-corpus", "historical-disparity"],
    type: "single",
    correct: "D",
  },

  /* ─────────── D6 · Stakeholder Communication & Lifecycle Mgmt ──────────── */

  {
    schemaVersion: 1,
    id: "D6-q901",
    domain: 6,
    objective: "6.1",
    stem: "An IT director sponsors an assistant to triage facilities work orders and has already agreed a scope and a delivery date with the architect. In the second discovery session the architect learns that the facilities operations manager, whose team actually dispatches the work orders, has been in no meeting and first heard of the project that morning. What should the architect do next?",
    choices: [
      {
        id: "A",
        text: "Continue with the agreed scope and share the design with the operations manager once it is drafted.",
        rationale:
          "Showing a finished design to the person who owns the process invites a late rejection and wastes the design effort that produced it.",
      },
      {
        id: "B",
        text: "Pause the scope agreement and run discovery with the operations team, because the workflow constraints and the real success criteria live with them.",
      },
      {
        id: "C",
        text: "Ask the IT director to relay questions to the operations manager so the schedule is not disturbed.",
        rationale:
          "Secondhand requirements lose the operational detail discovery exists to capture, and they conceal any disagreement between the two stakeholders.",
      },
      {
        id: "D",
        text: "Proceed on schedule and add a change-request process to absorb whatever the operations team raises later.",
        rationale:
          "Change control manages surprises after the fact; it is not a substitute for gathering requirements from the people who actually hold them.",
      },
    ],
    explanation:
      "Structured discovery identifies who owns the process and the decisions, not only who funds the work. The sponsor can agree a budget, but the constraints that determine whether the design is usable — how work orders are dispatched, what an error costs, what the team will accept — sit with the operating team, and gathering them late is the expensive path.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["discovery", "stakeholder-mapping"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q902",
    domain: 6,
    objective: "6.1",
    stem: "A sponsor wants an assistant to cut the cost of handling supplier invoice queries and asks for a business case. During discovery nobody can say how many queries arrive, how long one takes to handle, or how often the current process gets it wrong. The finance team's estimate is \"a couple of hours a day, mostly.\" What should the architect establish before committing to a target?",
    choices: [
      {
        id: "A",
        text: "An accuracy target agreed with the sponsor, so the team has something concrete to build toward.",
        rationale:
          "A target agreed with no baseline is a number chosen from the air. Nothing later can show that hitting it represents an improvement on anything.",
      },
      {
        id: "B",
        text: "A technical proof of concept on ten sample queries to show the task is feasible.",
        rationale:
          "Feasibility is worth checking, but a demo on ten queries neither sizes the opportunity nor indicates whether the work is worth funding.",
      },
      {
        id: "C",
        text: "A measured baseline of the current process — volume, handling time and error rate — taken over a representative period.",
      },
      {
        id: "D",
        text: "An inventory of the systems the assistant would need to read from.",
        rationale:
          "An integration inventory becomes necessary during design, but it says nothing about the size of the problem or the value of solving it.",
      },
    ],
    explanation:
      "Requirement gathering produces a measurable baseline. Without volume, handling time and error rate for the process as it runs today, there is no business case to approve, no defensible success target, and no way after launch to say whether the assistant improved anything. Impressions like \"a couple of hours a day\" are the signal that measurement has not happened.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["discovery", "baseline", "business-case"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q903",
    domain: 6,
    objective: "6.2",
    stem: "A head of operations reviewing the design for a shipment-exception assistant says: \"I just need to know it will classify these correctly every time, the way the rules engine does.\" The architect expects roughly 94% accuracy, on a set of cases the rules engine cannot handle at all. How should the architect respond?",
    choices: [
      {
        id: "A",
        text: "Give the expected error rate, show what happens to a misclassified exception, and set both against how the rules engine fails today.",
      },
      {
        id: "B",
        text: "Assure her that with enough prompt engineering the system will reach effectively 100% on the cases that matter.",
        rationale:
          "This sets an expectation the architect cannot meet and defers the conversation about error handling to the worst possible moment, after launch.",
      },
      {
        id: "C",
        text: "Explain that language models are probabilistic and that determinism is not achievable with this technology.",
        rationale:
          "Technically accurate and operationally useless. It names what she cannot have without saying what she gets or how errors will be contained.",
      },
      {
        id: "D",
        text: "Propose keeping the rules engine as the decision-maker and using the assistant only to write summaries.",
        rationale:
          "Retreating from the requirement abandons the cases the rules engine cannot handle, which is the reason the project was funded.",
      },
    ],
    explanation:
      "Communicating a trade-off means expressing it in the stakeholder's terms: the expected error rate, the consequence of an error, and the comparison against the status quo — which has its own failure rate, usually unmeasured. Naming the technology's properties is not communication; showing what the business experiences on the bad path is.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["communication", "expectation-setting", "error-rates"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q904",
    domain: 6,
    objective: "6.2",
    stem: "An architect must take a choice to a steering committee: keep the current single-pass design at 3.1 seconds p95 and 88% resolution, or add a verification pass reaching 94% resolution at 5.4 seconds p95 and 1.6 times the cost per case. The draft slide lists those six numbers and nothing else. Which two additions most improve the committee's ability to decide? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "What six points of resolution are worth in the committee's own units — cases deflected from the contact center per month, and what each one costs today.",
      },
      {
        id: "B",
        text: "A summary of the benchmark methodology behind the resolution figures.",
        rationale:
          "Methodology belongs in an appendix for the technical reviewer. It does not help a committee weigh the business consequence of either option.",
      },
      {
        id: "C",
        text: "How reversible each option is — what switching to the other design would cost in three months, and what would trigger that switch.",
      },
      {
        id: "D",
        text: "An explanation of how the verification pass works internally.",
        rationale:
          "Mechanism detail consumes committee time without changing which option is better for the business or what the committee is being asked to approve.",
      },
      {
        id: "E",
        text: "The architect's preferred option stated up front, with the numbers removed to keep the slide clean.",
        rationale:
          "A recommendation with no evidence asks the committee to approve on trust and leaves no record of why the choice was made when someone revisits it.",
      },
    ],
    explanation:
      "Committees decide on business consequence and on the cost of being wrong. Translating a technical delta into the units they already manage makes the comparison real, and stating reversibility tells them how much the decision actually commits — which is often what determines whether they can approve it today rather than deferring.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["communication", "trade-offs", "reversibility"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D6-q905",
    domain: 6,
    objective: "6.3",
    stem: "An SLA draft for a hosted assistant commits to \"p95 response under four seconds, measured monthly.\" The customer's network sits between their users and the service, the customer's own identity provider is called on every request, and the customer intends to measure from the browser. The provider measures at its ingress. What must the SLA add before it is signable?",
    choices: [
      {
        id: "A",
        text: "A service-credit schedule proportional to the size of the breach.",
        rationale:
          "Credits define the remedy once a breach is established. They do nothing to settle whether a breach occurred, which is the open question here.",
      },
      {
        id: "B",
        text: "A p99 commitment alongside p95, so the tail is covered too.",
        rationale:
          "Adding a stricter percentile to an undefined measurement multiplies the disagreement rather than resolving where and by whom the number is measured.",
      },
      {
        id: "C",
        text: "A clause stating that the provider's measurement is authoritative.",
        rationale:
          "Declaring one party correct does not make the figure meaningful, and it writes the customer's actual experience out of the agreement entirely.",
      },
      {
        id: "D",
        text: "The measurement point, the excluded dependencies, and whose instrumentation the monthly figure is computed from.",
      },
    ],
    explanation:
      "An SLA number is only enforceable when the measurement point, the exclusions and the source of truth are written down. Here the customer's network and identity provider sit inside the browser-measured path and outside the provider's, so both parties will report different p95 figures in good faith and neither will be wrong.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["sla", "measurement-definition", "exclusions"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D6-q906",
    domain: 6,
    objective: "6.3",
    stem: "Users can report a bad answer from inside a legal-research assistant. Reports land in a shared spreadsheet that now holds 340 rows going back five months. Nobody owns it, nothing in it has been reproduced, and the last three releases shipped without anyone opening it. The product lead asks for a second feedback channel because \"users are not telling us enough.\" What should the architect recommend?",
    choices: [
      {
        id: "A",
        text: "Assign an owner and a triage commitment for the reports that already exist, and route confirmed ones into the regression suite, before adding any channel.",
      },
      {
        id: "B",
        text: "Add the second channel and merge both streams into the same spreadsheet.",
        rationale:
          "A second inlet into an unread backlog produces more unread rows and further erodes any willingness users still have to report problems.",
      },
      {
        id: "C",
        text: "Replace free-text reports with a five-star rating so the signal is easier to aggregate.",
        rationale:
          "An aggregate score conveys mood while discarding the specific failing cases that make a report reproducible and therefore actionable.",
      },
      {
        id: "D",
        text: "Close the spreadsheet and rely on production monitoring instead.",
        rationale:
          "Monitoring catches what the team already thought to instrument. User reports are the channel for failures nobody anticipated, which is what would be discarded.",
      },
    ],
    explanation:
      "A feedback loop is only a loop when reports have an owner, a response commitment and a path into the evaluation set. The problem here is not signal volume — 340 reports is ample — but that nothing consumes it. Adding collection capacity to a dead end costs engineering time and teaches users that reporting is pointless.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["feedback-loops", "triage-ownership", "regression-suite"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D6-q907",
    domain: 6,
    objective: "6.4",
    stem: "An architecture document for a nightly contract-ingestion pipeline covers the components, the data flow and the design rationale in detail. The operations team that will carry the pager asks what they are meant to do when the nightly index build fails, and the document has no answer. What should be added?",
    choices: [
      {
        id: "A",
        text: "A more detailed component diagram showing every service dependency.",
        rationale:
          "Dependency detail helps a reader understand the system. It does not tell a person on call at 3 a.m. which action to take first.",
      },
      {
        id: "B",
        text: "The rationale for choosing nightly rebuilds over incremental updates.",
        rationale:
          "Useful context for a future design change, but the operations team needs a procedure to follow, not the reasoning behind the schedule.",
      },
      {
        id: "C",
        text: "A runbook: the failure signals, the immediate action for each, the escalation path, and what the system serves while the index is stale.",
      },
      {
        id: "D",
        text: "A link to the source repository so operators can read the build script themselves.",
        rationale:
          "Expecting on-call engineers to derive a recovery procedure from source under time pressure is a reliable way to make incidents longer.",
      },
    ],
    explanation:
      "Implementation guidance covers the operating model, not only the build. A design document that stops at the happy path hands the receiving team a system they cannot run, and the degraded-mode question — what does the assistant serve while the index is stale — is an architectural decision the operators cannot make for themselves during an incident.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["documentation", "runbook", "operations"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D6-q908",
    domain: 6,
    objective: "6.4",
    stem: "Three product teams will call a shared summarization service. The architect's handoff document specifies the request and response fields, the authentication scheme and the p95 latency target. The first integrating team immediately asks what the service returns when the source document is unreadable, when the summary is refused by the safety layer, and when the model is unavailable. What is missing from the contract?",
    choices: [
      {
        id: "A",
        text: "A quickstart example showing one successful call end to end.",
        rationale:
          "An example of the happy path is convenient, but every question the team raised concerns what happens when the call does not succeed.",
      },
      {
        id: "B",
        text: "The failure and abstention semantics — a distinct, documented response for each condition and what the caller is expected to do with it.",
      },
      {
        id: "C",
        text: "Per-team rate limits so one product cannot starve the other two.",
        rationale:
          "A genuine operational concern worth adding, but it tells no caller how to handle an unreadable document or a refused summary.",
      },
      {
        id: "D",
        text: "A versioning policy for the response schema.",
        rationale:
          "Important for the long-term contract, though it answers a question about future change rather than the three conditions raised today.",
      },
    ],
    explanation:
      "An integration contract is defined by its failure modes as much as by its success path, and a refusal is a distinct outcome from an error. Teams left to guess build divergent handling — one retries a safety refusal forever, another surfaces a stack trace to the user — and the divergence is discovered in production.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["documentation", "interface-contract", "failure-semantics"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D6-q909",
    domain: 6,
    objective: "6.5",
    stem: "A six-week pilot of a single-prompt claims-summarization design reaches 71% acceptable summaries against a 90% launch bar. The failures cluster on multi-claimant files, where one pass must hold four claimants' facts apart. Four rounds of prompt revision, a week each, have moved the figure by two points in total. The sponsor asks whether to keep iterating. What should the architect recommend?",
    choices: [
      {
        id: "A",
        text: "Continue prompt iteration, since every round has produced a measurable gain.",
        rationale:
          "Half a point a week against a nineteen-point gap is not a route to the bar, and the failures sit in a structural limit of the chosen design.",
      },
      {
        id: "B",
        text: "Move to a larger model and re-run the pilot before touching the design.",
        rationale:
          "Worth measuring, but the failure is one pass being asked to track four entities at once, which is a decomposition problem more than a capability one.",
      },
      {
        id: "C",
        text: "Lower the launch bar to 75% and ship with a review queue for the remainder.",
        rationale:
          "Renegotiating the bar before establishing whether it is reachable converts a design question into an expectation-management one and hides the real limit.",
      },
      {
        id: "D",
        text: "Re-architect the multi-claimant path to extract each claimant separately and compose the summary, then re-pilot that path against the same bar.",
      },
    ],
    explanation:
      "Supporting the lifecycle includes knowing when the pilot has returned a verdict on the design rather than on the prompt. Four rounds with a flat trajectory and failures concentrated in one structural case is evidence that iteration is exhausted, and evidence is what makes a return to the design phase a defensible recommendation instead of a preference.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["lifecycle", "pilot", "re-architecture"],
    type: "single",
    correct: "D",
  },

  /* ────────── D7 · Developer Productivity & Operational Enablement ──────── */

  {
    schemaVersion: 1,
    id: "D7-q901",
    domain: 7,
    objective: "7.1",
    stem: "A platform team connects a company-wide MCP server exposing 63 tools — ticketing, deploys, metrics, HR lookups and more — to every engineering repository's agent configuration, so nobody has to request access. Engineers report that the agent now picks the wrong tool on routine tasks and that reviews take longer. Which change best addresses both the reliability and the exposure problem?",
    choices: [
      {
        id: "A",
        text: "Write longer, more precise descriptions for each of the 63 tools so selection is more accurate.",
        rationale:
          "Better descriptions help at the margin, but the agent still weighs 63 options every turn and every repository still holds access it never needed.",
      },
      {
        id: "B",
        text: "Keep the server connected everywhere and add a project instruction listing which tools each repository should use.",
        rationale:
          "An instruction steers the model without removing anything, so both the selection surface and the standing access remain exactly as broad as before.",
      },
      {
        id: "C",
        text: "Enable per repository only the tool groups that repository's work actually requires, and connect the rest on request.",
      },
      {
        id: "D",
        text: "Split the server into 63 single-tool servers and connect all of them.",
        rationale:
          "The same tools reach the same agent through more connections. The surface is unchanged and the configuration becomes considerably harder to maintain.",
      },
    ],
    explanation:
      "Configuring team tooling means scoping it to the work each project does. A universal tool surface degrades selection accuracy, because the model chooses among options that are irrelevant to the task, and it grants every repository standing access that nobody reviewed. Enablement is per project; breadth is requested and granted, not defaulted.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["mcp", "tool-scoping", "least-privilege"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D7-q902",
    domain: 7,
    objective: "7.1",
    stem: "A 200-engineer organization is moving from a 15-person pilot to a full rollout of agentic coding tooling next quarter. The pilot ran on one shared account with no per-team breakdown, and finance has asked what the rollout will cost and who will own it. Which two things should the architect put in place before the rollout? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Usage attribution per team, so spend can be traced back to the team that generated it.",
      },
      {
        id: "B",
        text: "A named budget owner per team and a defined action when a team crosses its threshold.",
      },
      {
        id: "C",
        text: "A mandatory minimum number of agent sessions per engineer per week.",
        rationale:
          "Mandating activity produces activity rather than value, and it corrupts the usage data the organization is trying to learn from in the first place.",
      },
      {
        id: "D",
        text: "A single organization-wide cap that pauses all usage when it is reached.",
        rationale:
          "An aggregate cap turns one team's overrun into everyone's outage, and it gives no team the information it would need to prevent that.",
      },
      {
        id: "E",
        text: "A rule that only senior engineers may use the tooling during the first month.",
        rationale:
          "This manages risk by limiting reach rather than by creating visibility, and it delays exactly the adoption the rollout exists to achieve.",
      },
    ],
    explanation:
      "Configuring tools for teams includes the operational envelope around them. Attribution turns an opaque shared bill into a per-team signal that can be compared against the value that team is getting, and a named owner with a defined threshold response is what makes that signal act on anything before the invoice arrives.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["rollout", "cost-attribution", "governance"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D7-q903",
    domain: 7,
    objective: "7.2",
    stem: "A team adopts agentic tooling and lets it draft every pull request description. Six weeks later reviewers complain that the descriptions read well but never say why a change was made, and two reverts followed a reviewer approving a change that contradicted a decision taken in a design review. What should the architect change in the workflow?",
    choices: [
      {
        id: "A",
        text: "Require the author to supply the intent and the constraints the change must respect, and let the tool describe what changed.",
      },
      {
        id: "B",
        text: "Add a template so every generated description carries a \"Why\" section.",
        rationale:
          "A heading the tool fills in from the diff produces a plausible reason invented after the fact, which is the failure that caused the reverts.",
      },
      {
        id: "C",
        text: "Stop generating descriptions and go back to writing them by hand.",
        rationale:
          "This discards a real saving on the mechanical half of the description instead of fixing the half that genuinely requires a human.",
      },
      {
        id: "D",
        text: "Ask reviewers to read the full diff and disregard the description.",
        rationale:
          "Descriptions exist because a diff does not reveal intent. Removing the summary makes review slower without recovering the missing rationale.",
      },
    ],
    explanation:
      "AI-assisted workflows work when each side supplies what only it holds. Intent and the constraints a change must respect exist in the author's head and in prior decisions, and cannot be recovered from the diff; the mechanical account of what changed can. Splitting the description along that line is what keeps review effective as volume rises.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["workflow", "code-review", "intent"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D7-q904",
    domain: 7,
    objective: "7.3",
    stem: "An agentic release-notes workflow succeeds on every engineer's machine and fails in the shared CI runner, where it stops partway through with no useful error. The prompt, the repository state and the model are identical in both places. An engineer proposes rewriting the prompt to be more robust. What is the most efficient first step instead?",
    choices: [
      {
        id: "A",
        text: "Re-run the workflow in CI several more times to establish whether the failure is intermittent.",
        rationale:
          "Repetition is cheap, but the failure is already consistent across environments, so this confirms what is known and localizes nothing.",
      },
      {
        id: "B",
        text: "Print the effective configuration in both environments — tool availability, permission rules and environment variables — and compare them.",
      },
      {
        id: "C",
        text: "Raise the verbosity of the model's output so the failure point becomes visible.",
        rationale:
          "More narration describes what the agent believes it is doing; it does not reveal a tool or credential the runner never had available.",
      },
      {
        id: "D",
        text: "Grant the CI runner the same broad permissions an engineer's machine has.",
        rationale:
          "This may make the symptom vanish while installing an unreviewed privilege in an automated environment, and it never identifies what was missing.",
      },
    ],
    explanation:
      "When identical work behaves differently in two environments, the difference is in the environment. Comparing the effective configuration — which tools resolved, which permission rules applied, which variables were set — localizes the cause before anything is changed, and it avoids the common mistake of editing the prompt to work around missing infrastructure.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["debugging", "environment-parity", "configuration"],
    type: "single",
    correct: "B",
  },
] satisfies Question[];
