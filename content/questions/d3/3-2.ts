import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D3-q201",
    domain: 3,
    objective: "3.2",
    stem: "An expense assistant lets employees ask about their own reimbursements. It reaches the finance system through one integration account holding read access to every employee's records, and the system prompt instructs the model to answer only about the requesting employee. A penetration test retrieves a colleague's expense history by framing the request as a team budget summary. Which change closes the gap?",
    choices: [
      {
        id: "A",
        text: "Add explicit refusal examples to the system prompt covering team-level and aggregate phrasings.",
        rationale:
          "Enumerating phrasings hardens the system against the wording that was tested and leaves the underlying capability available to the next one.",
      },
      {
        id: "B",
        text: "Run a second model call that inspects each answer and redacts records belonging to other employees.",
        rationale:
          "The restricted records have already entered the context by then, and a redaction pass can be defeated by paraphrase or by a later turn in the same conversation.",
      },
      {
        id: "C",
        text: "Exchange the user's session for a downstream token scoped to that employee, so the finance system applies its own access rules to every query.",
      },
      {
        id: "D",
        text: "Rotate the integration account's credentials more frequently and move them into a secrets manager.",
        rationale:
          "Credential hygiene limits the damage from a leaked secret but does nothing about a request that uses the credential exactly as designed.",
      },
    ],
    explanation:
      "The finance system sees only the integration account, so it cannot enforce anything about who asked. Propagating the end user's identity moves the decision to the resource server, where refusal is deterministic and independent of how the request was phrased. Prompt-level and post-hoc controls leave the broad capability in place.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["authorization", "identity-propagation", "confused-deputy"],
    type: "single",
    correct: "C",
  },
  {
    schemaVersion: 1,
    id: "D3-q202",
    domain: 3,
    objective: "3.2",
    stem: "A security team approves an agent for production on the grounds that it is read-only: its tools can query the CRM and the internal wiki but cannot write to either. The agent summarizes account histories and posts each summary as a comment on a shared ticket the user names. Some CRM records contain text submitted by external parties through a public web form. Which risk has the approval overlooked?",
    choices: [
      {
        id: "A",
        text: "The agent could exhaust CRM API rate limits and degrade service for other consumers.",
        rationale:
          "A capacity concern worth managing, but it is not a confidentiality risk and has nothing to do with why read-only was treated as sufficient.",
      },
      {
        id: "B",
        text: "Read queries could return stale data if the CRM replicates asynchronously.",
        rationale:
          "Staleness affects answer accuracy rather than authorization, and it is unrelated to the agent's read scope or its posting capability.",
      },
      {
        id: "C",
        text: "The wiki could contain outdated internal procedures that the summaries then propagate.",
        rationale:
          "A content-quality issue rather than a security gap; the same risk would apply to a human reading the same wiki page.",
      },
      {
        id: "D",
        text: "Externally submitted text the agent reads can carry instructions that redirect the summary, and the ticket comment is an outbound channel for anything the agent can see.",
      },
    ],
    explanation:
      "Read-only limits integrity damage, not confidentiality damage. Broad read access combined with any outbound channel is an exfiltration path, and untrusted third-party content in the CRM gives an attacker a way to steer what gets written there. Read scope and egress paths have to be evaluated together.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["prompt-injection", "egress", "least-privilege"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D3-q203",
    domain: 3,
    objective: "3.2",
    stem: "An architect reviews an MCP integration for a healthcare scheduling assistant. The server authenticates each client connection with a static API key, its tools accept a `patient_id` argument that the model supplies, and the audit log records the server's service account as the actor on every call. Which two findings should the review rank as highest priority? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "Nothing verifies that the requesting user is entitled to the `patient_id` the model supplies, so the model effectively chooses whose record is read.",
      },
      {
        id: "B",
        text: "The static API key is rotated annually and should be rotated quarterly.",
        rationale:
          "Rotation cadence is a hygiene improvement that leaves every authorization and attribution defect in this design untouched.",
      },
      {
        id: "C",
        text: "The audit log cannot attribute an access to a human principal, which is the first question an incident investigation or a compliance audit asks.",
      },
      {
        id: "D",
        text: "Tool schemas should be compressed to reduce the tokens spent on every request.",
        rationale:
          "A cost and context concern with no bearing on the authentication and authorization properties under review.",
      },
      {
        id: "E",
        text: "The assistant should run on a more capable model so it handles patient identifiers more carefully.",
        rationale:
          "Model capability is not an access control, and a more careful model still calls a tool that performs no entitlement check at all.",
      },
    ],
    explanation:
      "Authentication of the connection is working; authorization and attribution are absent. A model-supplied record identifier that nothing validates makes the model the access-control decision point, and a log that names only the service account cannot answer who actually requested a patient's data. Both are structural gaps rather than tuning issues.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["authorization", "audit", "mcp"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "C"],
  },
  {
    schemaVersion: 1,
    id: "D3-q204",
    domain: 3,
    objective: "3.2",
    stem: "A deployment assistant needs credentials for a cloud provider. An engineer proposes storing a long-lived access key in the assistant's configuration and instructing the model, in the system prompt, to include that key when calling the deployment tool. What is the most significant problem with this design?",
    choices: [
      {
        id: "A",
        text: "Putting the credential in context spreads it through prompts, transcripts and logs, and makes the model responsible for a secret the tool implementation should hold.",
      },
      {
        id: "B",
        text: "The model may reproduce the key with a formatting error, causing intermittent authentication failures.",
        rationale:
          "A real annoyance, but a formatting bug is recoverable and is not the reason this design fails a security review.",
      },
      {
        id: "C",
        text: "Long-lived keys take longer to validate than short-lived tokens, adding latency to each deployment.",
        rationale:
          "Validation cost is negligible and is not the reason to keep static credentials out of a prompt.",
      },
      {
        id: "D",
        text: "The provider may rate-limit requests that reuse the same key across many sessions.",
        rationale:
          "Rate limiting is a capacity consideration that applies equally to a credential stored correctly on the server side.",
      },
    ],
    explanation:
      "A secret placed in the prompt is present in every request payload, every stored transcript and every debug log, and it can be echoed back by the model. Credentials belong in the tool implementation or a secrets manager, ideally as short-lived scoped tokens that the model never sees.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["secrets", "credentials"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D3-q205",
    domain: 3,
    objective: "3.2",
    stem: "During a design review, a team states that their agent is \"fully authenticated\" because every user signs in with SSO before opening the assistant and the assistant authenticates to each backend with its own credentials. Which requirement does that description leave unaddressed?",
    choices: [
      {
        id: "A",
        text: "Confidentiality of data in transit between the assistant and the backends.",
        rationale:
          "Transport security is a separate control and is not what distinguishes an authentication claim from an authorization one.",
      },
      {
        id: "B",
        text: "Availability of the backends when the identity provider is unreachable.",
        rationale:
          "A resilience concern rather than a missing access-control decision in the design being described.",
      },
      {
        id: "C",
        text: "Verification that the user's SSO session has not expired.",
        rationale:
          "Session freshness is still part of establishing who the caller is, so it does not name the layer that is missing.",
      },
      {
        id: "D",
        text: "Encryption of the backend credentials at rest in the assistant's configuration store.",
        rationale:
          "Secret storage protects the credential itself and says nothing about whether a given user may perform a given action.",
      },
      {
        id: "E",
        text: "Whether the signed-in user is permitted to perform the specific action on the specific record the assistant requests.",
      },
    ],
    explanation:
      "Both halves of the description are authentication: the user proves identity to the application, and the application proves identity to the backends. Neither establishes authorization, which is a per-request decision about whether this principal may take this action on this resource. That decision has to be enforced somewhere the model cannot influence.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["authentication", "authorization"],
    type: "single",
    correct: "E",
  },
] satisfies Question[];
