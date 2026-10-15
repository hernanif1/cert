import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D5-q101",
    domain: 5,
    objective: "5.1",
    stem: "A fintech support agent can issue refunds through an `issue_refund` tool. The only thing preventing refunds above $250 is a line in the system prompt telling the model to refuse larger amounts. During a red-team exercise a tester obtains a $4,000 refund by pasting a fabricated \"updated refund policy\" into the chat. Which change removes this class of failure?",
    choices: [
      {
        id: "A",
        text: "Rewrite the instruction in stronger, more explicit language and place it at the end of the system prompt.",
        rationale:
          "A stronger wording is still an instruction the model can be argued out of, and the next tester simply arrives with a different framing.",
      },
      {
        id: "B",
        text: "Add an instruction telling the model to ignore any policy text supplied by the user.",
        rationale:
          "That control lives in the same layer that just failed: injected text competes with it on equal terms, and nothing outside the model notices when the injection wins.",
      },
      {
        id: "C",
        text: "Enforce the $250 ceiling inside the refund tool, rejecting larger amounts before any money moves.",
      },
      {
        id: "D",
        text: "Add an output classifier that flags replies mentioning refunds above the limit.",
        rationale:
          "Output screening runs after the tool has executed, so at best it flags the message describing a payment that has already left the account.",
      },
      {
        id: "E",
        text: "Log every refund above $250 and have an analyst review the report each morning.",
        rationale:
          "Next-day detection is a useful backstop but not a guardrail: the transfer is irreversible by the time the report is read.",
      },
    ],
    explanation:
      "A guardrail has to run where the model gets no vote. Moving the amount ceiling into the tool implementation turns a persuasion problem into a deterministic rejection before the side effect, while prompt wording, output screening and after-the-fact review all act too late or in the layer that was already defeated.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["guardrails", "tool-authorization"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D5-q102",
    domain: 5,
    objective: "5.1",
    stem: "A moderation layer in front of a customer-facing assistant uses a 900-entry blocklist of banned phrases. It has caught exact matches reliably for a year, but the abuse team reports a rising volume of prohibited requests getting through via rephrasing, deliberate misspelling and switching language. The team proposes deleting the blocklist and replacing it with a trained classifier. What is the best assessment?",
    choices: [
      {
        id: "A",
        text: "Keep the blocklist for exact-form strings and add the classifier for intent; they cover different failure modes.",
      },
      {
        id: "B",
        text: "Replace the blocklist entirely, since a classifier subsumes everything a list of literal strings could match.",
        rationale:
          "A classifier returns a probability and is weakest precisely where the list is strongest — literal strings such as account numbers and internal identifiers — which it will miss at a rate no threshold setting fixes.",
      },
      {
        id: "C",
        text: "Expand the blocklist with the observed misspellings and translations and keep it as the only control.",
        rationale:
          "Enumerating variants is a losing race against paraphrase and encoding: every new bypass costs the attacker seconds and the defender a deployment.",
      },
      {
        id: "D",
        text: "Move the blocklist from the input path to the output path so rephrased requests are caught in the reply.",
        rationale:
          "Relocating the same brittle string matching changes which text it fails to match, not whether it fails, and it gives up the cheap pre-call rejection.",
      },
    ],
    explanation:
      "Deterministic rules and classifiers are complementary, not competing. Rules are cheap, auditable and exact, which suits identifiers and literal patterns; classifiers generalize across phrasing and language, which suits intent-shaped categories. Discarding either one leaves an obvious gap, and layered defense assumes both.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["guardrails", "classifiers", "blocklists"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q103",
    domain: 5,
    objective: "5.1",
    stem: "An agent that can move funds calls a safety classifier before every transfer. During a regional outage the classifier returned timeouts, and because the client treats a timeout as a pass, transfers ran unscreened for forty minutes before anyone noticed. The team's proposed fix is to raise the classifier timeout from 2 seconds to 10 seconds. What should the architect require instead?",
    choices: [
      {
        id: "A",
        text: "Cache recent classifier verdicts so the agent can reuse them when the service is unavailable.",
        rationale:
          "A cache helps repeated identical requests and does nothing for a novel transfer during an outage, which is exactly the case that matters.",
      },
      {
        id: "B",
        text: "Add a secondary classifier from a different vendor and call it when the primary times out.",
        rationale:
          "Redundancy reduces how often the situation arises but leaves the behavior undefined when both are unavailable, which is the actual defect in the design.",
      },
      {
        id: "C",
        text: "Raise the timeout to 10 seconds and page the on-call engineer whenever timeouts exceed a threshold.",
        rationale:
          "A longer timeout converts a fast unscreened transfer into a slow one; the failure behavior is unchanged and every user pays the latency.",
      },
      {
        id: "D",
        text: "Make the transfer path fail closed when no verdict is available, with alerting and a documented manual override.",
      },
    ],
    explanation:
      "Every guardrail needs a defined behavior for the unavailable state, chosen by the severity of the action it protects. A fund transfer is irreversible, so the correct default is to deny when the control cannot be evaluated. Leaving the decision implicit means the system fails open under load, which is the one condition an attacker can generate on demand.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["guardrails", "fail-closed", "availability"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q104",
    domain: 5,
    objective: "5.1",
    stem: "A procurement agent reads inbound supplier email, summarizes it, and can call `search_contracts`, `update_supplier_record` and `send_email`. One supplier message contains hidden text instructing the agent to mail the contract archive to an outside address, and the agent complies. The team responds by adding a classifier that scans incoming mail for injection patterns. Which two further controls do the most to bound what a future successful injection can achieve?",
    choices: [
      {
        id: "A",
        text: "Restrict `send_email` to recipients already present on the account record, enforced inside the tool.",
      },
      {
        id: "B",
        text: "Instruct the model in the system prompt to treat all email content as data and never as instructions.",
        rationale:
          "Worth writing, but it is the same probabilistic layer the injection already defeated, and it bounds nothing when the model is persuaded again.",
      },
      {
        id: "C",
        text: "Increase the injection classifier's sensitivity so borderline messages are flagged as well.",
        rationale:
          "Tuning a single detector harder does not limit the damage when detection misses, and a lower threshold mostly buys false positives on legitimate supplier mail.",
      },
      {
        id: "D",
        text: "Require human approval before any outbound message that carries an attachment or contract text.",
      },
      {
        id: "E",
        text: "Log every tool call with the id of the email that triggered it, for post-incident review.",
        rationale:
          "Forensics matters for the review afterward, but the archive has already left the building; logging contains nothing.",
      },
    ],
    explanation:
      "Detection of prompt injection is useful and will never be complete, so the architectural answer is containment: shrink what a compromised turn can reach. A destination allowlist enforced in the tool and a human gate on high-consequence egress both cap the blast radius regardless of whether the classifier caught the message.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["prompt-injection", "blast-radius", "egress"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "D"],
  },
  {
    schemaVersion: 1,
    id: "D5-q105",
    domain: 5,
    objective: "5.1",
    stem: "A health-information assistant blocks responses flagged by its safety classifier. When a block happens the service returns a generic HTTP 500 and records nothing beyond the status code. Support cannot distinguish a blocked answer from an outage, and the safety team cannot say whether blocks are rising or falling. What should the architect change first?",
    choices: [
      {
        id: "A",
        text: "Have the model generate an explanation of why its response was blocked and return that to the user.",
        rationale:
          "A refusal written by the same model that produced the blocked content is not a control, and it hands whoever is probing the system a description of the rule that fired.",
      },
      {
        id: "B",
        text: "Return a fixed safe message and emit a structured event carrying the trace id, the rule that fired and its score, with a counter the safety team can alert on.",
      },
      {
        id: "C",
        text: "Lower the classifier threshold so fewer requests are blocked while the logging gap is investigated.",
        rationale:
          "Weakening the control because its firings are invisible is the wrong direction, and it trades real safety coverage for a reporting problem.",
      },
      {
        id: "D",
        text: "Write the full blocked prompt and response into the general application log for later analysis.",
        rationale:
          "Copying flagged health information into a general-purpose log expands the sensitive-data footprint and usually conflicts with the retention policy that covers that data.",
      },
    ],
    explanation:
      "Firing behavior is part of the guardrail design. A control that fires must return a deterministic response the model did not write, record a structured event that identifies what fired and why, and increment a counter, because firing rate is the signal that distinguishes an attack from a regression. Identifiers and scores give that visibility without duplicating sensitive content.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["guardrails", "observability", "firing-behavior"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q106",
    domain: 5,
    objective: "5.1",
    stem: "An architect reviews an internal research assistant. Its safety controls are an input scan for personal data, a system prompt listing prohibited topics, and an output classifier over the final response. The assistant also exposes a tool that permanently deletes documents from a shared workspace. Which gap should the review flag as most serious?",
    choices: [
      {
        id: "A",
        text: "Nothing authorizes the delete operation before it runs; the output classifier only sees what the model says afterward.",
      },
      {
        id: "B",
        text: "The input scan runs before the model call and therefore cannot inspect retrieved documents.",
        rationale:
          "That is a genuine limitation of input screening, but it is secondary to having no control at all standing between the model and an irreversible action.",
      },
      {
        id: "C",
        text: "The output classifier duplicates the prohibited-topic instruction and should be removed as redundant.",
        rationale:
          "A deterministic screen and a prompt instruction are independent layers, and deleting one because it overlaps the other is exactly how defense in depth erodes.",
      },
      {
        id: "D",
        text: "The prohibited topics in the system prompt are not enumerated in enough detail.",
        rationale:
          "Elaborating the prompt polishes the weakest layer while the missing layer — an authorization check inside the deletion tool — stays missing.",
      },
    ],
    explanation:
      "Controls must be mapped to the points in the request path where harm can occur. All three existing controls address content, and none addresses action. An irreversible side effect needs authorization inside the tool before it executes, because an output filter runs after the deletion has already happened.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["guardrails", "layered-defense", "tool-authorization"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q107",
    domain: 5,
    objective: "5.1",
    stem: "An agent that can cancel subscriptions runs an output filter which inspects the final response for policy violations and blocks it when one is found. During an incident the filter correctly blocked a response, yet the customer's subscription had already been cancelled. The team proposes making the filter stricter. What is the real defect?",
    choices: [
      {
        id: "A",
        text: "The filter's policy rules are incomplete, since a stricter version would have flagged the request earlier.",
        rationale:
          "Strictness changes what the filter catches, and it would still be reading a response produced after the cancellation had happened.",
      },
      {
        id: "B",
        text: "The control is in the wrong position: a check that runs on the response cannot prevent a tool call that already executed.",
      },
      {
        id: "C",
        text: "The cancellation tool should be idempotent so the blocked response leaves the account unchanged.",
        rationale:
          "Idempotency makes a repeated call harmless without stopping the first one, which is the call that cancelled the subscription.",
      },
      {
        id: "D",
        text: "The filter should fail closed, so a blocked response also rolls back the conversation.",
        rationale:
          "Fail-closed governs behavior when a control is unavailable, and rolling back a conversation does not reverse an effect in another system.",
      },
    ],
    explanation:
      "Ordering matters as much as coverage: each layer can only act on what exists when it runs, and an output filter runs after the model has already taken its actions. Anything with an external effect has to be gated at tool authorization, before the call, where a decision can still prevent rather than merely describe.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["guardrails", "ordering", "layered-defense"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q108",
    domain: 5,
    objective: "5.1",
    stem: "An input classifier on an internal research assistant fires on about 12% of questions, and review shows the great majority are legitimate. Engineers now route around the assistant for anything sensitive, and one team has asked for the classifier to be disabled. What should the architect do?",
    choices: [
      {
        id: "A",
        text: "Disable the classifier and rely on the output filter and tool authorization already in place.",
        rationale:
          "Removing a layer because it is badly tuned gives up the coverage it was added for, and the other layers are blind to what it screens.",
      },
      {
        id: "B",
        text: "Keep the classifier as it is and require teams to submit a justification when they bypass it.",
        rationale:
          "A bypass process formalizes the workaround while leaving the false-positive rate that created the demand for it.",
      },
      {
        id: "C",
        text: "Raise the classifier's threshold until the firing rate falls to a level teams tolerate.",
        rationale:
          "Moving the threshold by tolerance rather than by evidence trades an unknown amount of true-positive coverage for quieter complaints.",
      },
      {
        id: "D",
        text: "Collect the confirmed false positives and tune the classifier against them, while routing borderline cases to review rather than blocking.",
      },
    ],
    explanation:
      "A control that fires constantly on legitimate traffic gets worked around, and a guardrail people route around protects nothing. Tuning on confirmed false positives is the maintenance a classifier requires, and sending borderline cases to review keeps coverage while removing the cost that is driving the bypass.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["guardrails", "false-positives", "tuning"],
    type: "single",
    correct: "D",
  },
] satisfies Question[];
