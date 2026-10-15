import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "3.2",
  slug: "3-2-authentication-authorization",
  domain: 3,
  objective:
    "Analyze authentication and authorization requirements to identify security gaps",
  title: "Authentication and Authorization Gaps",
  summary:
    "An agent that calls real systems inherits whatever identity you give it, and the model is never the thing enforcing permissions. This objective is about spotting the gap between who asked and what the integration is actually allowed to do.",

  body: [
    {
      kind: "prose",
      md: "Two questions look similar and are not. **Authentication** asks *who is making this call*. **Authorization** asks *is this principal permitted to do this*. Integration reviews fail when a system answers the first convincingly and never really answers the second.\n\nThe structural problem in agent architectures is that the model sits between the human and the backend. Requests arrive at your database or your SaaS API carrying the agent's credentials, not the user's, unless you deliberately arrange otherwise. That arrangement is the whole objective.",
    },

    { kind: "heading", text: "The confused deputy" },
    {
      kind: "prose",
      md: "An agent holding a broad service account is a *confused deputy*: it has more authority than any individual user, and it acts on instructions it did not originate. Ask it for someone else's salary record and the backend will happily comply, because the backend sees only the service account.\n\nThe fix is identity propagation. The user's identity must reach the system that enforces permissions — via token exchange, on-behalf-of flows, or per-user credentials held by the integration layer — so that access control runs where it has always run, in the resource server.",
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "**The model is not a security boundary.** A system prompt saying *only access records belonging to the current user* is a request, not a control. It can be argued with, out-reasoned, or overridden by injected text in a document the agent retrieves. Every permission decision must be enforced by code the model cannot influence — in the tool implementation, the API gateway, or the database's own row-level policy.",
    },

    { kind: "heading", text: "Where gaps actually appear" },
    {
      kind: "table",
      caption: "Common integration gaps and what closes them",
      headers: ["Gap", "Why it passes review", "Control that closes it"],
      rows: [
        [
          "Shared service account for all users",
          "Authentication to the backend genuinely works",
          "Propagate end-user identity; enforce per-user scope at the resource",
        ],
        [
          "Filtering results after retrieval",
          "Users see only their own rows in testing",
          "Filter before retrieval, in the query or index, so unauthorized data is never loaded",
        ],
        [
          "Long-lived static API keys in configuration",
          "Simple, and rotation is on the roadmap",
          "Short-lived tokens with automatic refresh and a narrow scope",
        ],
        [
          "Prompt-level restrictions on tool usage",
          "The agent complies in every manual test",
          "Authorization checks inside the tool implementation",
        ],
        [
          "Audit logs recording the agent as actor",
          "Logs exist and look complete",
          "Record the human principal, session and tool arguments on every privileged call",
        ],
        [
          "One embedding index across tenants",
          "Similarity search rarely crosses tenants",
          "Tenant-scoped indexes, or a mandatory tenant filter applied server-side",
        ],
      ],
    },

    { kind: "heading", text: "Prompt injection is a privilege problem" },
    {
      kind: "prose",
      md: "When an agent reads untrusted content — a support ticket, a web page, a PDF, the output of another agent — that content can contain instructions. The agent cannot reliably distinguish data from directive, so the only durable mitigation is to bound what a successful injection can reach. That means minimal scopes, human approval on irreversible actions, and egress restrictions on where the agent may send data. Detection helps; containment is what the exam keys.",
    },

    {
      kind: "example",
      title: "Practical example: an HR assistant that answers too much",
      scenario:
        "An HR assistant lets employees ask about their own compensation and leave balances. It queries the HRIS through an MCP server configured with one integration account that has read access to all employee records. The system prompt instructs the model to answer only about the requesting employee. A security review is scheduled before launch.",
      walkthrough:
        "1. **Identify the principal at the resource.** Every query reaches the HRIS as the integration account. The HRIS has no idea which employee asked, so it cannot enforce anything.\n2. **Test the boundary, not the happy path.** A request phrased as a reporting task — *summarize leave balances across the team for planning* — returns other employees' data, because nothing but the prompt was stopping it.\n3. **Propagate identity.** Exchange the user's session token for a downstream token scoped to that employee, so the HRIS applies its own access rules.\n4. **Scope the credential.** Even the fallback service account should hold read access only to the fields the assistant needs, not the whole record.\n5. **Fix the audit trail.** Log the employee id, session and tool arguments, not just that the integration account ran a query.",
      takeaway:
        "The prompt was doing security work it cannot do. Moving enforcement to the HRIS made the same request fail at the resource server, where refusal is deterministic.",
    },

    {
      kind: "callout",
      variant: "pitfall",
      md: "Read-only is not automatically safe. An agent with broad read access and any outbound channel — email, a webhook, a ticket comment, even a chat reply visible to others — can exfiltrate everything it can see. Evaluate read scope and egress paths together.",
    },
    {
      kind: "callout",
      variant: "exam-distractor",
      md: "On security items, options that *tighten the prompt* — add refusal examples, restate the rule, list forbidden phrasings — are written to look like the diligent answer. They are almost never keyed. So is *rotate the credential more often*, which is real hygiene aimed at the wrong failure. The keyed option moves the decision to code: identity propagation, a scoped token, or a check inside the tool implementation.",
    },

    {
      kind: "practice",
      questionIds: [
        "D3-q201",
        "D3-q202",
        "D3-q203",
        "D3-q204",
        "D3-q205",
        "D3-q206",
        "D3-q207",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Confused deputy",
      definition:
        "A component with more authority than its callers that performs privileged actions on their behalf without checking whether the caller was entitled to them.",
    },
    {
      term: "Identity propagation",
      definition:
        "Carrying the end user's identity through the agent to the system that enforces permissions, typically by exchanging a session token for a scoped downstream token.",
    },
    {
      term: "Pre-filtering",
      definition:
        "Applying authorization constraints in the query or index before data is retrieved, so unauthorized records never enter the model's context in the first place.",
    },
    {
      term: "Egress control",
      definition:
        "Restricting where an agent may send data — recipients, domains, destinations — so that broad read access cannot be converted into exfiltration.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A system prompt that forbids accessing other users' data is an adequate access control.",
      why: "Instructions in the prompt are advisory text the model weighs against everything else in context, including content injected by an attacker, so they cannot produce the deterministic denial that authorization requires.",
      instead:
        "Enforce the rule in the tool implementation or the resource server, where the model has no influence over the outcome.",
    },
    {
      id: "t2",
      trap: "Because the MCP server authenticates every connection, the integration is secure.",
      why: "Authentication only establishes which client is calling; it says nothing about whether that client's current user may perform the requested action on the requested record, which is a separate decision entirely.",
      instead:
        "Pair authentication with per-request authorization that takes the end user's identity and the specific resource into account.",
    },
    {
      id: "t3",
      trap: "Retrieving broadly and filtering unauthorized rows out of the model's answer protects the data.",
      why: "Once unauthorized content is in the context window it has already crossed the boundary, and it can leak through paraphrase, summarization, or a later turn regardless of what the final filter removes.",
      instead:
        "Apply the access filter before retrieval so restricted records are never loaded.",
    },
    {
      id: "t4",
      trap: "A read-only agent needs no further containment because it cannot change anything.",
      why: "Confidentiality is violated by reading, not only by writing, and any outbound path the agent controls turns broad read access into an exfiltration channel for an attacker who can inject instructions.",
      instead:
        "Scope read access to what the task needs and constrain the destinations the agent may send data to.",
    },
    {
      id: "t5",
      trap: "Audit requirements are satisfied once every tool call is logged.",
      why: "Logs that attribute every action to the shared integration account cannot answer who actually requested it, which is precisely the question an incident investigation or a compliance audit asks first.",
      instead:
        "Record the human principal, session identifier and arguments alongside the tool call.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 3",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Model Context Protocol — authorization",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],
} satisfies Lesson;
