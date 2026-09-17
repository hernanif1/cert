import type { Question } from "@/content/schema";

/**
 * Mock Form A — reserved items for Domains 1-3.
 *
 * Authored as one half of a 63-item exam form, not as a per-objective drill
 * batch: the objective spread samples across each domain, difficulty is mixed
 * the way a real sitting mixes it, and no scenario is reused from the drill
 * pool. Reserved ids use objective digit 9; the `objective` field carries the
 * real objective.
 */
export const questions = [
  /* ──────────────────────────── Domain 1 ──────────────────────────── */
  {
    schemaVersion: 1,
    id: "D1-q901",
    domain: 1,
    objective: "1.1",
    stem: "An airline's loyalty team asks for an assistant that will cut average call handle time from eight minutes to five. Discovery shows handle time breaks down into roughly 90 seconds of agent research, 30 seconds of conversation with the member, and a five-to-six minute wait on a legacy mainframe lookup that runs once per call. Which response best translates this business problem?",
    choices: [
      {
        id: "A",
        text: "Accept the five-minute target and design the assistant to draft the member response while the mainframe lookup runs.",
        rationale:
          "Overlapping the research with the wait reclaims at most the 90 seconds of research. The target still cannot be met, and committing to it before doing that arithmetic is the error.",
      },
      {
        id: "B",
        text: "Place Claude in front of the mainframe to predict the lookup result so agents do not have to wait for it.",
        rationale:
          "This substitutes a probabilistic estimate for an authoritative system of record on data the airline must state exactly. It trades a latency problem for a correctness problem.",
      },
      {
        id: "C",
        text: "Quantify the share of handle time the assistant can actually influence and set the success target against that share rather than against total handle time.",
      },
      {
        id: "D",
        text: "Choose the fastest available model and a tight token budget so the assistant adds as little latency as possible to the call.",
        rationale:
          "Model latency is a rounding error next to a five-minute mainframe wait. Optimizing it cannot move the metric the business named.",
      },
    ],
    explanation:
      "Translating a business problem means establishing which part of the stated outcome the solution can move. Here more than half of handle time sits in a system the assistant does not touch, so a target expressed against total handle time is unachievable no matter how good the design is. The architect's job is to make the addressable share explicit before any commitment is made.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["problem-translation", "success-criteria"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q902",
    domain: 1,
    objective: "1.1",
    stem: "A national retailer asks for an assistant that tells store managers what to reorder, on the grounds that Claude can read four years of point-of-sale history. Reviewing the data, the architect finds that stockouts were never recorded anywhere: the history shows what was sold, not what customers wanted and could not buy. What is the most important implication for the translation of this problem?",
    choices: [
      {
        id: "A",
        text: "The outcome the business wants cannot be learned or validated from the data that exists, so either the data capture changes or the problem is re-scoped to something the history does support.",
      },
      {
        id: "B",
        text: "A model with a longer context window would let the assistant reason over all four years of history in a single pass.",
        rationale:
          "Context length determines how much of the record the model can read. It does not add a signal the record never contained.",
      },
      {
        id: "C",
        text: "The history should be indexed for retrieval so the assistant can cite specific sales figures in each recommendation.",
        rationale:
          "Retrieval makes a systematically biased record easier to quote. Citations would make an unreliable recommendation look better evidenced, not become better.",
      },
      {
        id: "D",
        text: "The assistant should be instructed to flag uncertainty whenever a recommendation rests on incomplete data.",
        rationale:
          "Every recommendation rests on this gap, and nothing in the data marks where demand was truncated, so the model has no basis on which to raise the flag.",
      },
    ],
    explanation:
      "Translation includes a feasibility judgment about the data. Demand cannot be inferred from sales when sales are censored by availability, and there is no ground truth against which reorder suggestions could be evaluated. Naming that gap and either fixing the capture or narrowing the scope is the architect's obligation before any design work begins.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["problem-translation", "data-feasibility"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q903",
    domain: 1,
    objective: "1.2",
    stem: "A radiology-intake service accepts referral documents from sixty clinics. About half arrive as digital text PDFs and half as scans of faxed forms. Field-extraction accuracy is 93% overall, but a per-clinic breakdown shows 97% for clinics that send digital files and 61% for clinics that send scans. The team proposes moving to a more capable model. Which change best addresses the failure?",
    choices: [
      {
        id: "A",
        text: "Move to a more capable model, since the harder half of the inputs needs more capability.",
        rationale:
          "The model is not the stage that is failing. A degraded scan that lost the characters in the first place gives every model the same unreadable input.",
      },
      {
        id: "B",
        text: "Add few-shot examples drawn from scanned referrals to the extraction prompt.",
        rationale:
          "Examples teach the model what a correct extraction looks like. They cannot recover field values that never survived the fax and scan.",
      },
      {
        id: "C",
        text: "Retry the extraction three times on scanned documents and take the majority result.",
        rationale:
          "Repeating the same call on the same degraded input produces three attempts at the same guess. Majority voting stabilizes variance, not missing information.",
      },
      {
        id: "D",
        text: "Add an input-stage conversion step with a quality gate, routing pages that convert poorly to human transcription before the model call.",
      },
      {
        id: "E",
        text: "Raise the extraction confidence threshold and send everything below it to manual review.",
        rationale:
          "This pushes roughly 40% of one cohort into a manual queue without addressing why those documents are unreadable, and it sizes the queue by the defect rather than fixing it.",
      },
    ],
    explanation:
      "An end-to-end design owns its input stage, not only its model call. A 36-point accuracy gap that tracks input format exactly is a normalization failure upstream of the model, and the correct intervention is a conversion and quality gate at ingestion. Diagnosing by stage is what stops teams from paying for capability that cannot help.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["end-to-end", "input-stage", "normalization"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q904",
    domain: 1,
    objective: "1.2",
    stem: "A network-provisioning assistant turns an engineer's free-text change request into a JSON configuration object that the provisioning service applies. About 2% of responses fail the service's schema check: a port count written as the word `twelve`, an unrecognized extra field, a bandwidth value with no unit. The service catches the exception, writes a debug-level log line and returns an empty configuration, so the requesting engineer's screen goes blank with no indication that anything went wrong. Which TWO changes to the end-to-end design most directly address this?",
    choices: [
      {
        id: "A",
        text: "Validate the model's output against the schema inside the service and, when validation fails, re-prompt once with the validation error attached before giving up.",
      },
      {
        id: "B",
        text: "Raise the output token limit so a long configuration is never cut off before the object closes.",
        rationale:
          "Truncation produces text that does not parse at all. These responses parse cleanly and then violate the contract, which is a different defect with a different remedy.",
      },
      {
        id: "C",
        text: "Have the service coerce near-misses — read `twelve` as 12, discard fields it does not recognize — so more responses clear the check.",
        rationale:
          "Coercion guesses at what the model meant and then commits that guess to a live network change. It turns a loud, countable failure into a quiet wrong value that nobody is alerted to.",
      },
      {
        id: "D",
        text: "Stop swallowing the failure: return a distinct error the requesting engineer's screen can render, and count every validation failure as a metric that can be alerted on.",
      },
      {
        id: "E",
        text: "Retry the identical request up to three times and use the first response that validates.",
        rationale:
          "A blind retry pays for whole generations again and still returns nothing when the model reproduces the same structural error, and the engineer is told nothing either way.",
      },
    ],
    explanation:
      "An end-to-end design owns the boundary where a model's output becomes another system's input, and a probabilistic generator will eventually emit something the contract does not allow. The processing stage should check the output against the schema and feed the error back so the model can repair its own response, and the output stage should make a residual failure visible — a distinct error the caller can render and a counted metric someone can alert on — instead of returning an empty result that looks like a legitimate answer.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["end-to-end", "output-validation", "error-surfacing"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D1-q905",
    domain: 1,
    objective: "1.3",
    stem: "A clinical-trial screening tool must judge each patient record against fourteen eligibility criteria. The criteria are independent of one another, every one must be evaluated on every record, and the sponsor requires a durable per-criterion record of how each judgment was reached. An engineer proposes a single agent with a `check_criterion` tool, letting the model decide which criteria to check and in what order. Which architectural pattern fits this work better?",
    choices: [
      {
        id: "A",
        text: "An agentic loop with a stricter system prompt that lists all fourteen criteria and requires the model to check each one.",
        rationale:
          "Coverage then depends on the model remembering to complete a checklist, which is precisely the guarantee a regulated screening process cannot leave probabilistic.",
      },
      {
        id: "B",
        text: "A workflow that fans out one call per criterion in code and aggregates the fourteen verdicts, since the set of steps is fixed and known in advance.",
      },
      {
        id: "C",
        text: "A single prompt that presents all fourteen criteria and returns one combined verdict per record.",
        rationale:
          "One call gives one blended judgment with no separable per-criterion record, and attention is spread across fourteen unrelated questions at once.",
      },
      {
        id: "D",
        text: "An orchestrator agent that delegates to fourteen specialist subagents, one per criterion.",
        rationale:
          "Delegation overhead and nondeterministic planning buy nothing here: there is no planning to do, because the full list of steps is known before the record arrives.",
      },
    ],
    explanation:
      "Agentic designs earn their cost when the sequence of steps cannot be known in advance. Here it is fully known, the steps are independent, and an auditable per-step record is a hard requirement — the definition of a code-defined workflow with a parallel fan-out and an aggregation step.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["patterns", "workflow", "parallelization"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q906",
    domain: 1,
    objective: "1.3",
    stem: "An architect reviews production traces for an agentic claims assistant. In 95% of sessions the agent makes the same four tool calls in the same order. The remaining 5% are genuine exceptions where it investigates, backtracks, and sometimes asks for help. Cost per session varies by an order of magnitude, and the team cannot reproduce a past session for audit. What is the most appropriate redesign?",
    choices: [
      {
        id: "A",
        text: "Implement the 95% path as a deterministic workflow in code and route only the cases that fall outside it into the agentic path.",
      },
      {
        id: "B",
        text: "Keep the agent and add system-prompt instructions describing the four-step order it should normally follow.",
        rationale:
          "The agent already follows that order almost always. Writing it down makes the common path marginally more likely while leaving it unreproducible and unbounded in cost.",
      },
      {
        id: "C",
        text: "Keep the agent and cap the number of tool calls per session to bound cost and latency.",
        rationale:
          "A cap bounds spend by truncating exactly the 5% of sessions that legitimately need the loop, converting a cost problem into an unhandled-case problem.",
      },
      {
        id: "D",
        text: "Replace the agent with a single prompt that performs all four steps at once.",
        rationale:
          "This removes the observable seams between steps and leaves no path at all for the exceptional cases the agent currently handles.",
      },
    ],
    explanation:
      "Pattern selection follows the shape of the control flow, and the traces show two populations: a fixed sequence and a genuinely open-ended remainder. Encoding the fixed path in code makes it cheap, reproducible and auditable, and reserving the agentic pattern for the exceptions is what agentic designs are actually for.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["patterns", "agentic", "workflow"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D1-q907",
    domain: 1,
    objective: "1.4",
    stem: "An incident-investigation orchestrator delegates to three specialist subagents. When one subagent's query tool errors, that subagent returns a fluent paragraph reporting that it found nothing relevant, and the orchestrator's final report states there is no evidence of the failure in that system. Which TWO changes most directly address this?",
    choices: [
      {
        id: "A",
        text: "Retry each failed subagent up to three times before the orchestrator composes its report.",
        rationale:
          "Retries recover transient errors but a persistent outage still surfaces as a confident report of nothing found, which is the dangerous part.",
      },
      {
        id: "B",
        text: "Have subagents return a structured result that distinguishes a completed search with no matches from a search that could not be completed.",
      },
      {
        id: "C",
        text: "Move the subagents to a more capable model so they reason more carefully about tool errors.",
        rationale:
          "Capability does not change the fact that a free-text paragraph has no field in which failure can be represented unambiguously to the caller.",
      },
      {
        id: "D",
        text: "Add a fourth subagent that reviews the other three reports for accuracy.",
        rationale:
          "A reviewer reading the same fluent paragraph has no more signal than the orchestrator did, and it adds another layer that can fail the same silent way.",
      },
      {
        id: "E",
        text: "Require the orchestrator to report coverage explicitly — which systems were searched successfully and which were not — rather than synthesizing one narrative.",
      },
    ],
    explanation:
      "Multi-agent systems fail at their interfaces, and natural-language handoffs erase the difference between an absence of findings and an absence of evidence. Structured subagent results make failure representable, and an explicit coverage statement forces that failure into the orchestrator's output instead of letting synthesis smooth it away.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["multi-agent", "orchestration", "error-propagation"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "E"],
  },
  {
    schemaVersion: 1,
    id: "D1-q908",
    domain: 1,
    objective: "1.4",
    stem: "A market-research system pairs a writer agent with a critic agent: the writer drafts, the critic returns objections, and the loop repeats until the critic raises none. About one session in twelve never converges and runs until the request times out, returning nothing at all. Which change most directly addresses this?",
    choices: [
      {
        id: "A",
        text: "Instruct the critic to be more lenient so it accepts drafts sooner.",
        rationale:
          "Leniency trades a visible timeout for invisible quality loss on every session, and it still provides no guarantee that any given loop terminates.",
      },
      {
        id: "B",
        text: "Move the writer to a more capable model so its drafts satisfy the critic in fewer rounds.",
        rationale:
          "This shifts the distribution of round counts without bounding the tail. An unbounded loop with a better writer is still an unbounded loop.",
      },
      {
        id: "C",
        text: "Bound the loop with a maximum number of rounds and a defined output for the bounded case — the best draft so far plus the outstanding objections.",
      },
      {
        id: "D",
        text: "Run the writer and critic in parallel on the same input and merge their outputs.",
        rationale:
          "The critic's whole function is to respond to a draft, so running it concurrently leaves it with nothing to critique and destroys the pattern.",
      },
    ],
    explanation:
      "Any orchestration that loops until a model declares itself satisfied needs an externally enforced stopping condition, because convergence is not guaranteed by anything in the design. Bounding the rounds and specifying what to return when the bound is hit converts a total failure into a degraded but useful result.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["multi-agent", "orchestration", "termination"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D1-q909",
    domain: 1,
    objective: "1.5",
    stem: "A grant-review pipeline runs three chained steps: summarize the application, score the summary against a rubric, then write applicant feedback from the score. Reviewers report that the feedback regularly praises strengths the application never claims and misses weaknesses stated plainly in it. Each step passes its own evaluation. What best explains the failure?",
    choices: [
      {
        id: "A",
        text: "The rubric is ambiguous, so the scoring step interprets it inconsistently across applications.",
        rationale:
          "An ambiguous rubric produces inconsistent scores, not feedback that invents strengths absent from the source document.",
      },
      {
        id: "B",
        text: "Three steps is too coarse; the task needs to be decomposed further.",
        rationale:
          "Adding more steps to a chain that already discards its source adds more boundaries at which the same information is lost.",
      },
      {
        id: "C",
        text: "The model used for the feedback step is too small for open-ended writing.",
        rationale:
          "The feedback step writes fluently and accurately about what it was given. Its input is the problem, not its capability.",
      },
      {
        id: "D",
        text: "Each step consumes only the previous step's output, so the summary's omissions and paraphrases become ground truth for scoring and feedback with no path back to the application.",
      },
      {
        id: "E",
        text: "Sampling variability across three separate calls compounds into inconsistent final output.",
        rationale:
          "Variability would make the errors random across runs. These errors are systematic and directional, tracking what the summary kept and dropped.",
      },
    ],
    explanation:
      "Decomposition creates boundaries, and every boundary that passes only a derived artifact discards evidence the downstream steps cannot recover. Steps that must ground claims in the source need the source, either alongside the intermediate or through citations that point back into it — per-step evaluations pass because each step is faithful to an input that is already wrong.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["decomposition", "information-loss"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D1-q910",
    domain: 1,
    objective: "1.5",
    stem: "A proposal-drafting assistant does three things in one prompt: find relevant past answers, adapt them to the new question, and check the result against the current product catalog. When an answer is wrong, the team cannot tell which of the three went wrong. What does decomposing this into three steps most directly buy them?",
    choices: [
      {
        id: "A",
        text: "Lower cost per request, because each individual prompt is shorter.",
        rationale:
          "Three calls usually cost more in total than one: each carries its own instructions and its own share of the context.",
      },
      {
        id: "B",
        text: "Observable intermediate outputs, so each stage can be measured and fixed independently.",
      },
      {
        id: "C",
        text: "Lower latency, because each step has less work to do.",
        rationale:
          "Sequential steps add round trips. Splitting a single call into three generally raises end-to-end latency rather than lowering it.",
      },
      {
        id: "D",
        text: "Higher accuracy, because smaller tasks are always easier for a model to perform.",
        rationale:
          "This is the common overstatement. Decomposition can also lose cross-step context and compound per-step error rates, so accuracy is not guaranteed to improve.",
      },
    ],
    explanation:
      "The first return on decomposition is diagnosability: separate calls produce separate artifacts, so a failure can be attributed to a stage and that stage can be evaluated on its own. Cost and latency usually move the wrong way, and accuracy improves only when the boundaries are chosen well.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "reserved",
    tags: ["decomposition", "observability"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D1-q911",
    domain: 1,
    objective: "1.6",
    stem: "A shared-services team reports that its drafting assistant saves each of 2,000 employees about 30 minutes a week, and presents this to the steering committee as $4.1 million of annual savings. The architect is asked to review the claim before it enters the program's business case. What is the strongest objection?",
    choices: [
      {
        id: "A",
        text: "Thirty minutes returned to 2,000 individual weeks is capacity, not cash; it becomes a saving only if the freed time is measurably redirected to valued work or if headcount or contractor spend actually falls.",
      },
      {
        id: "B",
        text: "The calculation should use fully loaded employee cost rather than base salary, which would raise the figure further.",
        rationale:
          "This refines the arithmetic while accepting the premise that dispersed minutes convert directly into money, which is the part that does not hold.",
      },
      {
        id: "C",
        text: "Self-reported time savings should be replaced by a survey of how useful employees find the assistant.",
        rationale:
          "Perceived usefulness is a softer measure than the one it replaces and moves the claim further from anything the finance function can book.",
      },
      {
        id: "D",
        text: "The figure omits the assistant's inference and engineering costs, so the net benefit is overstated.",
        rationale:
          "True but secondary: even a free assistant would not turn dispersed half-hours into $4.1 million of recoverable cost.",
      },
      {
        id: "E",
        text: "Productivity is the wrong value pillar here; the claim belongs under performance SLAs.",
        rationale:
          "Productivity is the right pillar. The problem is that it has been measured as a cost reduction rather than as capacity released.",
      },
    ],
    explanation:
      "Business-value alignment requires naming the pillar and then measuring it the way that pillar actually pays out. Productivity gains distributed in small increments across many people release capacity; they reduce cost only when the organization acts on that capacity. An architect who lets an hours-times-rate extrapolation into a business case has set the program up to miss a benefit it was never going to realize.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["business-value", "productivity", "measurement"],
    type: "single",
    correct: "A",
  },

  /* ──────────────────────────── Domain 2 ──────────────────────────── */
  {
    schemaVersion: 1,
    id: "D2-q901",
    domain: 2,
    objective: "2.1",
    stem: "A team has spent eight months tuning its prompts against the model currently in production. To evaluate a cheaper, smaller model, an engineer replays the exact production prompts against the candidate, measures a 14-point accuracy drop, and recommends staying where they are. What is the strongest objection to that conclusion?",
    choices: [
      {
        id: "A",
        text: "The evaluation should have been run on live traffic rather than on replayed requests.",
        rationale:
          "Replay against a held-out set is a legitimate offline method, and live traffic would reproduce the same confound while exposing users to the weaker configuration.",
      },
      {
        id: "B",
        text: "The sample was too small to detect a difference of that size reliably.",
        rationale:
          "A 14-point gap is large enough to be visible in a modest sample. Statistical power is not what makes this comparison unsound.",
      },
      {
        id: "C",
        text: "The comparison confounds model capability with prompt fit: prompts tuned for one model encode its habits, and the candidate deserves a prompt tuned for it before the two are compared.",
      },
      {
        id: "D",
        text: "Accuracy alone is the wrong metric; the comparison should be made on cost per correct answer.",
        rationale:
          "A better headline metric is worth having, but it is computed from the same invalid accuracy measurement and does not rescue the comparison.",
      },
    ],
    explanation:
      "Model selection is a comparison between configurations, not between raw models. Prompts iterated for months against one model carry its formatting habits, its tolerance for terse instructions and its reasoning defaults; replaying them unchanged measures how well the candidate imitates the incumbent. A fair trade-off decision requires each candidate to be given a prompt adapted to it.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["model-selection", "evaluation-design"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D2-q902",
    domain: 2,
    objective: "2.1",
    stem: "A content-moderation classifier assigns one of five labels, runs about 40 million times a month, and refers anything it is unsure about to a human queue staffed for a 5% referral rate. Offline evaluation on a labeled sample puts the candidate tiers within a point of one another on the posts they decide automatically; what separates them is how often they refer. An architect is choosing the model tier. Which consideration should dominate the decision?",
    choices: [
      {
        id: "A",
        text: "Time to first token, since moderation sits in the posting path.",
        rationale:
          "The output is a single label, so streaming behavior barely matters. Total call latency is a constraint, but at this volume it is not what separates the candidates.",
      },
      {
        id: "B",
        text: "Context window size, so that unusually long posts never need to be truncated.",
        rationale:
          "Long posts are a tail case handled by chunking or truncation rules. Sizing the whole decision around it optimizes for the rarest input.",
      },
      {
        id: "C",
        text: "Selecting the most capable available model, because moderation errors carry reputational risk.",
        rationale:
          "This is the reflex answer. The human queue is the designed control for residual error, and capability beyond what keeps referrals inside that budget is paid for 40 million times a month.",
      },
      {
        id: "D",
        text: "The lowest per-call cost among models that keep referrals inside the queue's 5% capacity.",
      },
    ],
    explanation:
      "Model trade-offs are resolved against the constraint the system actually imposes. Two quantities matter for quality here — how many posts escape as confident errors, and how many land in the human queue — and the offline result says the candidates are equivalent on the first, so the referral rate is what distinguishes them and the queue's 5% capacity is the floor. Everything above that floor is pure cost repeated 40 million times a month, so the correct selection is the cheapest model that clears it.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["model-selection", "cost"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D2-q903",
    domain: 2,
    objective: "2.2",
    stem: "A wealth-management assistant's system prompt states in bold that it must never give personalized investment advice. Red-team testing confirms it refuses direct requests. Over eight-turn conversations in which the user gradually supplies age, balance and risk appetite, it produces a specific allocation recommendation about one time in five. Which change most directly strengthens the control?",
    choices: [
      {
        id: "A",
        text: "Repeat the restriction at the end of every user turn so it stays close to the model's attention.",
        rationale:
          "Restating the rule raises compliance somewhat and is worth doing, but the control remains a probabilistic instruction competing with a conversation built to erode it.",
      },
      {
        id: "B",
        text: "Add an independent check outside the generating call that classifies the draft response and blocks personalized recommendations before they reach the user.",
      },
      {
        id: "C",
        text: "Move the restriction from the system prompt into the first user message so it travels with the conversation.",
        rationale:
          "The user turn is the least authoritative place to put a policy rule, and it puts the restriction in the same channel as the input trying to circumvent it.",
      },
      {
        id: "D",
        text: "Run the assistant on the most capable available model so it follows the instruction more reliably.",
        rationale:
          "A more capable model raises the compliance rate without changing the nature of the control, and a one-in-five failure on a regulated boundary is not an acceptable target to approach asymptotically.",
      },
    ],
    explanation:
      "A guardrail expressed only as prompt text is an instruction the model usually follows, not a control that cannot be violated. Where the consequence is regulatory, the enforcement point belongs outside the generating call — a separate classification or policy gate that inspects the output — so that compliance does not depend on the model resisting a conversation designed to wear it down.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["guardrails", "system-prompts", "enforcement"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D2-q904",
    domain: 2,
    objective: "2.2",
    stem: "A pre-sales assistant's system prompt lists nine prohibitions: do not name competitors, do not speculate about the roadmap, do not give legal opinions, and six more. Compliance is excellent. Sales leadership complains that the assistant is evasive — it declines, says nothing useful, and leaves the customer without a next step. Which revision most improves the output without weakening the rules?",
    choices: [
      {
        id: "A",
        text: "For each prohibition, state what the assistant should do instead and where to route the customer, so every rule defines a behavior rather than only an absence.",
      },
      {
        id: "B",
        text: "Reduce the nine prohibitions to the three that matter most.",
        rationale:
          "This buys usefulness by giving up control the business asked for, and the six dropped rules were presumably added for reasons that still apply.",
      },
      {
        id: "C",
        text: "Add few-shot examples of well-worded refusals.",
        rationale:
          "Examples of graceful refusal teach the assistant to refuse more gracefully, reinforcing the exact behavior leadership is objecting to.",
      },
      {
        id: "D",
        text: "Move the prohibitions into a post-processing filter that redacts violating sentences.",
        rationale:
          "Redaction leaves customers with mutilated answers and removes the model's chance to say something useful in place of the prohibited content.",
      },
    ],
    explanation:
      "A system prompt made only of prohibitions specifies the failure space and leaves the success space undefined, so the safest output the model can produce is silence. Pairing each constraint with the permitted alternative and a routing path gives the model somewhere to go, which preserves the guardrail while restoring the behavior the business wants.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["system-prompts", "instruction-design"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D2-q905",
    domain: 2,
    objective: "2.3",
    stem: "A team adds six worked examples to a ticket-triage prompt. Overall accuracy improves by four points, but the share of tickets labeled `urgent` rises from a historical 11% to 29%, almost entirely from borderline cases. Five of the six examples the team happened to pick are urgent tickets. What is the most likely cause?",
    choices: [
      {
        id: "A",
        text: "Six examples is too few for the model to generalize across twelve ticket types.",
        rationale:
          "Adding more examples drawn the same way would deepen the skew. Count is not what shifted the decision boundary in one direction.",
      },
      {
        id: "B",
        text: "The urgency definition in the prompt is ambiguous, and the examples exposed the ambiguity.",
        rationale:
          "An ambiguous definition produces scattered errors in both directions. This error is one-directional and appeared exactly when the examples did.",
      },
      {
        id: "C",
        text: "The example set's label distribution acts as a prior, and a set that is five-sixths urgent pushes borderline cases toward urgent.",
      },
      {
        id: "D",
        text: "The added examples lengthened the prompt enough that the category definitions lost influence.",
        rationale:
          "A few hundred extra tokens does not displace the instructions, and displacement would degrade accuracy overall rather than improve it by four points.",
      },
    ],
    explanation:
      "Few-shot examples carry more than format: their class balance is read as evidence about how common each class is. An unbalanced example set therefore shifts the decision boundary in the direction it over-represents, which is exactly the pattern of a lifted urgent rate concentrated in borderline cases. Example sets need to be curated for distribution and coverage, not just for correctness.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["few-shot", "prompt-engineering", "bias"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D2-q906",
    domain: 2,
    objective: "2.3",
    stem: "An eligibility-determination prompt asks for the verdict first and the reasoning afterward, so a downstream parser can read the first line. On applications that turn on one condition it is accurate. On applications that turn on three or four interacting conditions it is wrong about a quarter of the time, and the reasoning that follows often contradicts the verdict above it. Which change most directly addresses this?",
    choices: [
      {
        id: "A",
        text: "Add few-shot examples of correct multi-condition determinations.",
        rationale:
          "Examples demonstrate the answer format and some reasoning patterns, but they leave the verdict still being emitted before any of that reasoning has happened.",
      },
      {
        id: "B",
        text: "Raise the output token limit so the reasoning section is never truncated.",
        rationale:
          "The reasoning is being produced in full; it simply arrives after the decision it was supposed to inform. Length is not the constraint.",
      },
      {
        id: "C",
        text: "Have the model attach a confidence score to the verdict and route low-confidence cases to a human.",
        rationale:
          "This routes the symptom at ongoing human cost, and a confidence score emitted at the same point as the verdict rests on the same unreasoned judgment.",
      },
      {
        id: "D",
        text: "Have the model work through the conditions first and emit the verdict last, inside a delimited field the parser reads.",
      },
      {
        id: "E",
        text: "Split the determination into one call per condition and combine the results in code.",
        rationale:
          "This would work but is a far larger redesign for a failure caused by ordering alone, and it gives up the model's ability to reason about how the conditions interact.",
      },
    ],
    explanation:
      "Chain-of-thought only helps when the reasoning precedes the answer: tokens generated after a verdict cannot influence it, so the model commits first and rationalizes second. Moving the reasoning ahead of the decision and delimiting the final field preserves machine parsing while restoring the benefit, which is why answer-first templates quietly disable chain-of-thought.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["chain-of-thought", "output-format"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D2-q907",
    domain: 2,
    objective: "2.4",
    stem: "A long-running agent compacts its session by summarizing the oldest turns whenever the transcript passes a threshold. After each compaction the agent re-runs tool calls it already completed earlier in the session, sometimes repeating their side effects. Which TWO changes best address this?",
    choices: [
      {
        id: "A",
        text: "Maintain a structured record of completed steps and their results outside the transcript, and include it verbatim in every compacted context.",
      },
      {
        id: "B",
        text: "Raise the compaction threshold so sessions run longer before the first summarization.",
        rationale:
          "This postpones the first compaction and leaves every subsequent one behaving exactly the same way. Long sessions still lose the record.",
      },
      {
        id: "C",
        text: "Persist tool results to an external store and keep short references to them in context, so the agent can re-read a result instead of re-deriving it.",
      },
      {
        id: "D",
        text: "Instruct the summarizer to keep a prose list of every tool call it saw while compacting the oldest turns.",
        rationale:
          "That list is written by the same lossy pass it is meant to survive, so it thins with each successive compaction and gives the agent nothing it can reliably check a pending call against.",
      },
      {
        id: "E",
        text: "Add an instruction to the compaction prompt telling the model not to redo work it has already done.",
        rationale:
          "The instruction survives compaction; the evidence of what was done does not. The model cannot obey a rule about facts it can no longer see.",
      },
    ],
    explanation:
      "Managing a context window over a long session means deciding what must survive compression, and summarization optimizes for narrative continuity rather than for state. Completed actions and their results are state, so they belong in a structured record carried forward intact or in an external store the agent can dereference — the conversation transcript is a poor system of record.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["context-window", "compaction", "agent-state"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D2-q908",
    domain: 2,
    objective: "2.5",
    stem: "An internal underwriting tool sends a 20,000-token reference appendix, unchanged for months, ahead of a short case description. Traffic is about 40 requests a day arriving at unpredictable intervals of ten to sixty minutes. The team enables prompt caching and finds that cost per request goes slightly up rather than down. What best explains this?",
    choices: [
      {
        id: "A",
        text: "The appendix is too large to be held as a single cached prefix.",
        rationale:
          "Twenty thousand tokens is a routine size for a cached prefix. Size is not what is defeating the reuse here.",
      },
      {
        id: "B",
        text: "Writing a cache entry costs more than reading the same tokens uncached, and at this arrival pattern most requests find the entry expired and pay the write premium again.",
      },
      {
        id: "C",
        text: "Caching improves time to first token but never reduces cost.",
        rationale:
          "Cache reads are substantially cheaper than ordinary input tokens. Caching is a cost optimization as much as a latency one, given sufficient reuse.",
      },
      {
        id: "D",
        text: "The case description differs on every request, so the prefix is never identical between calls.",
        rationale:
          "The varying text sits after the appendix, which leaves the prefix byte-identical. This is the common misreading of how prefix reuse works.",
      },
    ],
    explanation:
      "Prompt caching is a bet that a prefix will be reused often enough, and soon enough, to repay the premium charged for writing the entry. Forty requests a day arriving further apart than the entry survives means the system writes far more often than it reads, so the optimization inverts. Reuse strategy is a function of traffic shape, not just of how much text repeats.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["prompt-caching", "cost", "reuse"],
    type: "single",
    correct: "B",
  },

  /* ──────────────────────────── Domain 3 ──────────────────────────── */
  {
    schemaVersion: 1,
    id: "D3-q901",
    domain: 3,
    objective: "3.1",
    stem: "A support agent's `search_tickets` tool returns the full body of every match, often forty tickets or more. Traces show sessions consuming most of the context window after two searches, after which the agent loses track of the original request and searches again. The team proposes moving to a model with a larger context window. Which change best addresses the cause?",
    choices: [
      {
        id: "A",
        text: "Have `search_tickets` return a bounded list of ids with short summaries, and add a separate tool that fetches one ticket's full body on demand.",
      },
      {
        id: "B",
        text: "Move to a model with a larger context window so that two searches fit comfortably.",
        rationale:
          "More headroom postpones the same failure to the fourth or fifth search while paying for every one of those tokens on every request.",
      },
      {
        id: "C",
        text: "Cap the agent at one search per session.",
        rationale:
          "Many legitimate investigations need more than one search, so this converts a context problem into an inability to complete real work.",
      },
      {
        id: "D",
        text: "Summarize the conversation whenever it approaches the context limit.",
        rationale:
          "Compressing forty unread ticket bodies after the fact spends a model call cleaning up material that should never have entered the context.",
      },
    ],
    explanation:
      "Capability bloat is not only about how many tools an agent has; a single tool that returns unbounded output floods the context just as effectively. Returning a compact, navigable result set and offering detail through a second call keeps the agent's working context proportional to what it actually needs to read.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["tool-design", "context-bloat"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q902",
    domain: 3,
    objective: "3.1",
    stem: "An agent creates tickets through a `create_ticket` tool whose `priority` parameter is typed as a free-form string and described as the ticket's priority. The ticketing system routes only on the values P1 through P4. About 8% of created tickets arrive with values such as `high` or `urgent` and land in an unrouted queue nobody watches. Which change to the tool configuration best fixes this?",
    choices: [
      {
        id: "A",
        text: "Have the ticketing system reject invalid values and return an error the agent can retry against.",
        rationale:
          "This spends a round trip on every failure and still depends on the model guessing an unconstrained value correctly on the second attempt.",
      },
      {
        id: "B",
        text: "Add a line to the system prompt listing the four permitted priority values.",
        rationale:
          "The common reflex, but a prompt line is one instruction among many competing for attention, whereas a schema constraint is validated on every call.",
      },
      {
        id: "C",
        text: "Constrain `priority` to an enumerated set of P1 through P4 in the tool's input schema.",
      },
      {
        id: "D",
        text: "Map common synonyms such as `high` and `urgent` onto P1 through P4 in the integration layer.",
        rationale:
          "This hides the defect behind a guess at what the model meant, and every new synonym the model invents reopens the same unrouted queue.",
      },
    ],
    explanation:
      "Tool configuration is where an agent's action space is defined, and a parameter's type and description are the contract the model works from. An enumerated schema makes an out-of-range value impossible to emit rather than merely discouraged, which is the difference between a constraint and a suggestion.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["tool-design", "schema-constraints"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q903",
    domain: 3,
    objective: "3.2",
    stem: "An orchestrator agent signs the user in, then spawns subagents that reach three backend systems using the orchestrator's own service credentials, which hold tenant-wide access. A security review flags the design. Which TWO changes most directly close the authorization gap?",
    choices: [
      {
        id: "A",
        text: "Give the subagents read-only versions of the orchestrator's credentials.",
        rationale:
          "Read-only still means every user's records across the whole tenant. It reduces the blast radius of a write bug, not the exposure of data the user may not see.",
      },
      {
        id: "B",
        text: "Propagate the signed-in user's identity to each subagent as a scoped delegated credential, and have every backend authorize against that identity.",
      },
      {
        id: "C",
        text: "Record the user's id on every subagent call so the audit log attributes actions correctly.",
        rationale:
          "Attribution tells you afterward who an over-broad action was taken on behalf of. It does not stop the action from being possible.",
      },
      {
        id: "D",
        text: "Issue each subagent only the scopes its own task requires, for the duration of that task.",
      },
      {
        id: "E",
        text: "Include the user's role in each subagent's system prompt and instruct it to stay within that role.",
        rationale:
          "A prompt is not an access control. Anything the credential permits remains reachable whenever the model is confused, coerced or simply wrong.",
      },
    ],
    explanation:
      "Authentication of the human at the front door says nothing about what the system does on their behalf at the back. When privilege stops at the orchestrator and subagents inherit a tenant-wide identity, the effective authorization boundary is the service account, not the user. Delegated identity enforced at each backend, combined with least-privilege task-scoped credentials, is what makes the two match.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["authorization", "delegation", "least-privilege"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "D"],
  },
  {
    schemaVersion: 1,
    id: "D3-q904",
    domain: 3,
    objective: "3.2",
    stem: "A contractor's account is disabled in the identity provider at 17:00 on their last day. The next morning they open the assistant and it answers questions about internal projects as usual: the integration layer holds a refresh token obtained weeks earlier and renews access on its own. Which change most directly addresses this class of failure?",
    choices: [
      {
        id: "A",
        text: "Shorten the assistant's idle session timeout to fifteen minutes.",
        rationale:
          "A timeout forces the user to start a new session, which the cached grant then satisfies again. It changes how often they sign in, not whether they still can.",
      },
      {
        id: "B",
        text: "Run a nightly job that reconciles disabled accounts against active assistant sessions.",
        rationale:
          "This narrows the exposure to a day rather than closing it, and it leaves revocation dependent on a batch job that can fail silently.",
      },
      {
        id: "C",
        text: "Delete the user's conversation history when their account is disabled.",
        rationale:
          "Removing past conversations addresses data retention. The account still holds live access to the backends going forward.",
      },
      {
        id: "D",
        text: "Validate the user's entitlements against the identity provider on each request and use short-lived credentials that cannot outlive a revocation.",
      },
    ],
    explanation:
      "An authorization design is only as good as its revocation path. Long-lived cached grants make access a property of a token issued in the past rather than of the user's current standing, so deprovisioning in the identity provider never reaches the assistant. Per-request validation with short-lived credentials binds access to present entitlements, which is what the identity provider is the authority on.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["authentication", "revocation", "token-lifetime"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q905",
    domain: 3,
    objective: "3.3",
    stem: "A quoting endpoint is called inside a checkout flow that abandons the call and displays a stale cached price if nothing has returned within 800 ms. The pipeline answers in 310 ms at p50, but 6% of requests take a second verification pass and land at 2.4 seconds, so those customers see the stale price. Which change best satisfies the contract?",
    choices: [
      {
        id: "A",
        text: "Ask the checkout team to raise their timeout to three seconds.",
        rationale:
          "That pushes a 2.4-second wait onto every customer who hits the slow branch, trading a stale price for an abandoned checkout session.",
      },
      {
        id: "B",
        text: "Enforce a deadline inside the endpoint: return the first-pass quote when the budget is spent, run verification asynchronously, and flag discrepancies afterward.",
      },
      {
        id: "C",
        text: "Run the verification pass on a smaller model so it completes faster.",
        rationale:
          "A faster second call shrinks the tail without bounding it, and any request unlucky enough to be slow still blows through a hard 800 ms ceiling.",
      },
      {
        id: "D",
        text: "Optimize the p50 path further so more of the budget is left for verification.",
        rationale:
          "p50 already clears the budget with room to spare. Tuning the metric that is passing does not constrain the branch that is failing.",
      },
    ],
    explanation:
      "When latency is a contract rather than a preference, accuracy work has to fit inside the budget or move out of the request path entirely. A deadline that returns the best available answer and defers verification converts an unbounded tail into a bounded response plus an asynchronous correction — an explicit accuracy-for-latency trade made at the point where the contract binds.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["latency", "tail-latency", "deadlines"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q906",
    domain: 3,
    objective: "3.4",
    stem: "A platform handling two million agent requests a day samples 1% of traces uniformly and retains them for thirty days. Support escalations consistently describe failures for which the team can find no trace at all. Which change best improves their ability to investigate these reports?",
    choices: [
      {
        id: "A",
        text: "Sample on the tail: retain every trace that errored, refused, exceeded a latency threshold or ended without a completed task, plus a small uniform baseline.",
      },
      {
        id: "B",
        text: "Raise uniform sampling from 1% to 10%.",
        rationale:
          "Ten times the storage still drops nine of every ten rare events, and rare events are precisely the population the escalations are drawn from.",
      },
      {
        id: "C",
        text: "Extend trace retention from thirty days to ninety.",
        rationale:
          "Longer retention keeps the same traces for longer. The ones the team wants were never captured in the first place.",
      },
      {
        id: "D",
        text: "Log full prompts and completions for every request.",
        rationale:
          "Capturing everything solves the visibility problem by taking on the privacy exposure and storage cost that made sampling necessary.",
      },
      {
        id: "E",
        text: "Add dashboards for per-tenant request volume and token spend.",
        rationale:
          "Aggregates describe the population. An escalation is about one specific session, which no dashboard can reconstruct.",
      },
    ],
    explanation:
      "Uniform sampling is optimized for estimating typical behavior, and observability at scale is almost always needed for the atypical. Biasing retention toward errors, refusals, latency outliers and incomplete tasks captures the sessions that generate escalations, while a small uniform baseline preserves the ability to characterize normal traffic.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["observability", "sampling", "tracing"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q907",
    domain: 3,
    objective: "3.5",
    stem: "A multi-turn research assistant embeds the user's latest message verbatim as its retrieval query. Opening questions retrieve well. Follow-ups such as \"and for the Canadian entity?\" retrieve almost nothing useful, even though the relevant documents are indexed and would be found by a fully worded question. Which change best addresses this?",
    choices: [
      {
        id: "A",
        text: "Concatenate the whole conversation and embed that as the query.",
        rationale:
          "The resulting vector averages every topic discussed so far, which drags the query away from the one thing the user just asked about.",
      },
      {
        id: "B",
        text: "Increase the number of chunks retrieved when the user's message is short.",
        rationale:
          "Retrieving more results from a query that carries almost no topical content returns more of the wrong material, not the missing document.",
      },
      {
        id: "C",
        text: "Rewrite each follow-up into a standalone query using the conversation so far, then embed the rewritten query.",
      },
      {
        id: "D",
        text: "Include the conversation history in the generation prompt so the model can interpret the follow-up correctly.",
        rationale:
          "The history is already available at generation time. The failure happens earlier, when a context-free fragment is used as the retrieval query.",
      },
    ],
    explanation:
      "Retrieval quality depends on the query carrying the meaning of the question, and a conversational follow-up carries almost none of it — the subject lives in earlier turns. Rewriting the follow-up into a self-contained query before embedding is the standard fix, and it belongs in the pipeline stage where the deficiency actually is.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["rag", "query-rewriting", "multi-turn"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q908",
    domain: 3,
    objective: "3.5",
    stem: "A policy corpus is split into 600-token chunks. Many chunks read like \"This limit does not apply to entities listed in Section 4\" with nothing indicating which policy or jurisdiction they came from. Evaluation shows the correct chunk is usually retrieved, yet answers frequently attribute a rule to the wrong policy. Which indexing change most directly addresses this?",
    choices: [
      {
        id: "A",
        text: "Increase chunk overlap so each chunk carries more of its neighbors.",
        rationale:
          "The neighboring text is equally anonymous. Overlap adds adjacent sentences, not the document identity that lives in the title and hierarchy.",
      },
      {
        id: "B",
        text: "Double the chunk size so more surrounding text is captured.",
        rationale:
          "Tempting, but a larger window of body text still may not contain the policy name, and it dilutes each embedding across more unrelated content.",
      },
      {
        id: "C",
        text: "Add a re-ranking pass over the retrieved candidates.",
        rationale:
          "Re-ranking reorders a shortlist. The correct chunk is already being retrieved, and every candidate is ambiguous in exactly the same way.",
      },
      {
        id: "D",
        text: "Prepend the document title and section path to each chunk's text before embedding it, so the chunk carries the context its body omits.",
      },
      {
        id: "E",
        text: "Store the document title as a filterable metadata field on each chunk.",
        rationale:
          "A filter narrows candidates by an attribute the user must already know, and it does not change what the model reads when it interprets the chunk.",
      },
    ],
    explanation:
      "Chunking strips text away from the structure that gave it meaning, and policy prose leans heavily on that structure through pronouns and cross-references. Enriching each chunk with its document title and section path before embedding restores the identifying context to both the vector and the text the model reads, which is what makes correct attribution possible.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["rag", "chunking", "contextual-retrieval"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q909",
    domain: 3,
    objective: "3.6",
    stem: "Legal operations asks an assistant which of the company's 1,800 active contracts contain a most-favored-nation clause. Backed by top-k vector retrieval over the contract text, the assistant names four. Manual review finds thirty-one. Which TWO changes fit this query shape?",
    choices: [
      {
        id: "A",
        text: "Raise k from 10 to 200 so that many more candidates reach the model.",
        rationale:
          "Truncating a ranked list at a larger number is still truncation, and it asks the model to read 200 long contracts to answer one question.",
      },
      {
        id: "B",
        text: "Add a re-ranking pass over the retrieved candidates.",
        rationale:
          "Re-ranking improves the ordering of a shortlist. It cannot make a shortlist exhaustive, and exhaustiveness is exactly what this question requires.",
      },
      {
        id: "C",
        text: "Run a one-time classification pass over every contract for the clause and store the verdict as a queryable attribute.",
      },
      {
        id: "D",
        text: "Use a model with a context window large enough to hold all 1,800 contracts at once.",
        rationale:
          "Even where it fits, this pays to re-read the whole corpus per question and still relies on the model being exhaustive over an enormous input.",
      },
      {
        id: "E",
        text: "Answer questions of this shape with a filter or aggregation over the stored attribute rather than with a similarity search.",
      },
    ],
    explanation:
      "Retrieval strategy follows the query pattern, and \"which of all of them\" is a recall-complete question that similarity search structurally cannot answer: top-k returns the most similar documents, never all of the qualifying ones. Classifying the corpus once into a stored attribute and then filtering on it converts the question into the kind of query that returns a complete set.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["retrieval-strategy", "exhaustive-queries", "structured-attributes"],
    type: "multi",
    selectCount: 2,
    correct: ["C", "E"],
  },
  {
    schemaVersion: 1,
    id: "D3-q910",
    domain: 3,
    objective: "3.6",
    stem: "A field-service assistant grounded in an equipment manual answers \"what does fault code E-217 mean\" correctly. It fails on \"the compressor trips whenever ambient temperature is above 35 degrees and the unit has been running more than six hours\", where the answer requires combining the thermal-derating table, the compressor-protection section and a service bulletin. A single retrieval returns chunks from only one of the three. Which retrieval strategy fits?",
    choices: [
      {
        id: "A",
        text: "Retrieve more chunks per query and let the model sort them out.",
        rationale:
          "The other two passages are not textually similar to the question, so extending the same ranked list mostly adds near-misses from the section already found.",
      },
      {
        id: "B",
        text: "Let the model decompose the question and issue several targeted retrievals in sequence, accumulating evidence before it answers.",
      },
      {
        id: "C",
        text: "Re-chunk the manual into larger sections so each chunk covers more ground.",
        rationale:
          "The three passages sit in different parts of the manual and in a separate bulletin, so no chunk boundary brings them together.",
      },
      {
        id: "D",
        text: "Add a re-ranking pass over the retrieved chunks.",
        rationale:
          "Re-ranking reorders what one query already found. Two of the three needed passages were never in the candidate set to be reordered.",
      },
    ],
    explanation:
      "Single-pass top-k retrieval assumes the answer lives in material similar to the question. A multi-hop question assembles its answer from passages that are similar to intermediate sub-questions instead, so the retrieval has to become iterative — decompose, retrieve, read, retrieve again — which is the strategy this query pattern calls for.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "reserved",
    tags: ["retrieval-strategy", "multi-hop"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D3-q911",
    domain: 3,
    objective: "3.7",
    stem: "A hospital runs a prior-authorization agent and its insurer runs a utilization-review agent. Settling one request takes several rounds over hours, each side holds records the other must not see in full, and each side's decisions must be made under its own policy and signed by its own organization. An engineer proposes that the insurer expose its review tools through an MCP server so the hospital's agent can call them directly. What is the strongest objection?",
    choices: [
      {
        id: "A",
        text: "It puts the hospital's agent in control of the insurer's tools, collapsing an exchange between two organizations that each retain their own policy and authority into one agent driving both sides.",
      },
      {
        id: "B",
        text: "MCP cannot support interactions that run for hours.",
        rationale:
          "Duration is not the discriminator; a tool-based integration can be invoked repeatedly over any span. The objection has to be about who holds authority.",
      },
      {
        id: "C",
        text: "MCP has no authentication story, so the insurer could not secure the connection.",
        rationale:
          "MCP supports authorization for server access. Securing the connection is a solved problem and is not what makes this design wrong.",
      },
      {
        id: "D",
        text: "The two organizations would have to run the same model for the tools to behave consistently.",
        rationale:
          "Tool semantics are defined by the server, not by the caller's model. Nothing requires either side to match the other's model choice.",
      },
    ],
    explanation:
      "Choosing an integration mechanism is a question about where authority sits. MCP is the right answer when one agent should be able to use another system's capabilities as its own tools. Here each organization must apply its own policy, withhold its own data and stand behind its own decision, which is an agent-to-agent exchange of messages and proposals between peers rather than one agent operating the other's toolset.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["mcp", "agent-to-agent", "integration-mechanism"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q912",
    domain: 3,
    objective: "3.8",
    stem: "An assistant over a 200,000-document knowledge base uses a four-level discovery hierarchy: the model reads a domain index, then a subdomain index, then a document index, then fetches the document. Answer quality is good. Median time to a first answer is eleven seconds, and traces show seven to nine sequential retrieval round trips before the model writes anything. Which change best reduces latency without returning to a monolithic context?",
    choices: [
      {
        id: "A",
        text: "Issue the four index lookups in parallel so their latencies overlap.",
        rationale:
          "Each level's query is derived from the previous level's answer, so the lookups are inherently sequential and cannot be overlapped.",
      },
      {
        id: "B",
        text: "Move to a faster model so each round trip completes sooner.",
        rationale:
          "This shaves a fraction off each hop while leaving seven to nine of them in the critical path, so the structural cost is untouched.",
      },
      {
        id: "C",
        text: "Prefetch every child index one level ahead, so the next lookup is already in memory by the time the model asks for it.",
        rationale:
          "Prefetching takes the storage latency out of each hop but not the model call that decides which child to descend into, and those seven to nine sequential decisions are what set the eleven seconds.",
      },
      {
        id: "D",
        text: "Cache each level's index so repeated lookups are cheaper.",
        rationale:
          "Caching lowers the cost of each hop but the model still has to take every hop, and the number of sequential round trips is what sets the latency.",
      },
      {
        id: "E",
        text: "Flatten the hierarchy: carry one richer index as a cached prefix so a typical task resolves in a single targeted fetch.",
      },
    ],
    explanation:
      "Progressive discovery buys context efficiency and pays for it in round trips, so the design variable is how many hops a typical task needs. A deep hierarchy minimizes tokens per hop at the cost of many hops; flattening it into one richer index that is cheap to carry as a stable prefix keeps the corpus out of context while cutting the sequential path to roughly one fetch.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "reserved",
    tags: ["progressive-discovery", "latency", "index-design"],
    type: "single",
    correct: "E",
  },
] satisfies Question[];
