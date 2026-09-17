import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "5.4",
  slug: "5-4-regulatory-compliance",
  domain: 5,
  objective:
    "Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP)",
  title: "Regulatory Compliance",
  summary:
    "An architect does not rule on whether a use is lawful; an architect makes sure the system can satisfy the controls lawfulness depends on. That means designing data boundaries, deletion paths, minimization and audit records before anyone asks for them.",

  body: [
    {
      kind: "prose",
      md: "These items are not law exams. They test whether you can translate a legal obligation into a technical control, and whether you know which part of the problem is yours. Counsel or a compliance owner decides lawfulness, controller status and contract terms. The architect makes the resulting obligations *implementable and evidenced*: where data goes, what is retained, what can be deleted, who acted, and where a person can intervene.",
    },
    {
      kind: "table",
      caption: "What each framework is actually asking",
      headers: ["Framework", "Core question", "Controls the architect owns"],
      rows: [
        [
          "GDPR",
          "Is this personal data processed lawfully, minimally and transparently?",
          "Purpose-scoped stores, minimization before the prompt, deletion that reaches logs and indexes, residency, human intervention on significant automated decisions",
        ],
        [
          "HIPAA",
          "Is protected health information handled by permitted parties, for permitted purposes, at the minimum necessary?",
          "A signed BAA with every vendor that touches PHI, redaction before egress, encryption, audit records of who accessed what",
        ],
        [
          "FedRAMP",
          "Is every cloud service inside this system's authorization boundary authorized at the right impact level?",
          "A drawn authorization boundary, services chosen from authorized offerings, continuous monitoring for the agency's ATO",
        ],
      ],
    },

    {
      kind: "callout",
      variant: "key-concept",
      md: "**Design for the control; do not rule on the law.** Your deliverables are capabilities: a deletion path that reaches every store, a boundary diagram, a redaction step, an audit record, a person who can change an outcome. Whether a processing activity is lawful belongs to counsel. Whether complying is even *possible* belongs to you.",
    },

    { kind: "heading", text: "GDPR, concretely" },
    {
      kind: "list",
      items: [
        "**Lawful basis and purpose limitation.** Data collected to deliver a service cannot be quietly reused to fine-tune a model; that is a new purpose needing its own basis. Architecturally, training corpora and operational stores must be separable and labeled.",
        "**Data minimization.** Send the fields the task needs. Replacing a name and account number with a case id before the prompt is a small change that removes the record from a whole class of downstream obligations.",
        "**Subject rights.** Access, rectification, erasure and portability reach everywhere personal data landed: prompt logs, vector indexes, caches, evaluation datasets, backups. Design the deletion path when you design ingestion.",
        "**Automated decisions.** Article 22 restricts decisions made solely by automated processing with legal or similarly significant effects; where permitted, the subject is entitled to human intervention, information about the logic, and a route to contest. That means a decision record, a reviewer with authority, and an appeal channel.",
        "**Transfers and residency.** Where inference runs is a design decision, not a procurement footnote.",
      ],
    },

    { kind: "heading", text: "HIPAA, concretely" },
    {
      kind: "prose",
      md: "PHI is health information that identifies an individual, and it stops being PHI only under a defined standard: Safe Harbor removal of the eighteen identifier categories, or expert determination. Deleting the patient's name is not de-identification — dates of service, ZIP codes and record numbers are on that list.\n\nTwo consequences dominate the design. First, **a vendor that processes PHI on your behalf is a business associate and needs a signed BAA before any PHI flows**, and that covers logging and monitoring as much as the model call. Second, **minimum necessary**: the prompt carries the fields the task requires rather than the whole chart, and retrieval is scoped to the care relationship.",
    },
    {
      kind: "callout",
      variant: "note",
      md: "Provider terms are facts to confirm in writing for your account, not assumptions to design around. Anthropic will execute a BAA for eligible Claude API usage and does not train its models on commercial API inputs and outputs by default — but confirm which products, endpoints and retention settings your agreement covers, then design the boundary to match.",
    },

    { kind: "heading", text: "FedRAMP, concretely" },
    {
      kind: "prose",
      md: "FedRAMP authorizes *cloud service offerings*, not applications and not models. The architect's first artifact is the **authorization boundary**: every component that stores, processes or transmits federal data, including the ones teams forget — the logging pipeline, the vector store, the observability SaaS.\n\nEach component inside it must be authorized at or above the system's impact level (Low, Moderate or High, mapped to NIST SP 800-53 baselines), the agency issues the ATO for the system as a whole, and continuous monitoring follows.",
    },

    {
      kind: "example",
      title: "Practical example: a prior-authorization assistant at a health plan",
      scenario:
        "A plan wants an assistant that reads prior-authorization requests, retrieves plan rules and recommends approve, deny or refer. Members are in the US and the EU. The team plans to log full prompts to a third-party observability SaaS and to fine-tune on a year of historical cases.",
      walkthrough:
        "1. **Classify the data first.** Requests contain PHI, so every component that sees a prompt is in scope — which requires a BAA with the observability vendor, not only with the model provider.\n2. **Minimize before the prompt.** Member identifiers are not needed to apply plan rules; substitute a case id and keep the mapping in the system of record.\n3. **Split the logging.** Structured metadata can flow to the SaaS; prompt bodies stay in a covered store with short retention.\n4. **Question the fine-tune.** The cases were collected to adjudicate claims, so training on them is a distinct purpose needing its own basis, and for EU members it creates an erasure obligation a trained model cannot satisfy. Retrieval over the same corpus avoids both.\n5. **Design for Article 22 before launch.** A denial is a significant decision: the assistant recommends, a named human decides with the retrieved rule text in front of them, and the member gets an explanation and an appeal route.",
      takeaway:
        "Not one of these steps is a legal opinion. Each is an architecture decision that either makes the lawyers' answer available or makes it impossible.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Compliance items reliably offer *encrypt everything* and *the vendor is certified*. Both are true statements that settle nothing: encryption is one safeguard among many, and an authorization or a BAA attaches to a named party, never to your system as a whole.",
    },

    { kind: "practice", questionId: "D5-q401" },
  ],

  keyTerms: [
    {
      term: "Business associate agreement (BAA)",
      definition:
        "The contract that permits a vendor to process PHI on a covered entity's behalf. Required before PHI flows, and required of every vendor in the path, including logging and monitoring.",
    },
    {
      term: "Minimum necessary",
      definition:
        "The HIPAA principle that a use or disclosure carries only the PHI the task requires. In an LLM system it governs what enters the prompt and what retrieval is scoped to return.",
    },
    {
      term: "Authorization boundary",
      definition:
        "The documented set of components that store, process or transmit federal data. Everything inside it must be authorized at or above the system's FedRAMP impact level.",
    },
    {
      term: "Right to erasure",
      definition:
        "A data subject's right to have personal data deleted, which in an LLM system extends to prompt logs, vector indexes, caches, eval sets and backups, not just the primary database.",
    },
    {
      term: "Article 22",
      definition:
        "The GDPR provision restricting solely automated decisions with legal or similarly significant effects, and requiring meaningful human intervention, information about the logic, and a route to contest.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Encrypting data in transit and at rest makes a system HIPAA compliant.",
      why: "Encryption is one technical safeguard among administrative, physical and technical requirements; without a signed BAA, minimum-necessary scoping, access control and audit records, the result is an encrypted non-compliant system.",
      instead:
        "Treat encryption as table stakes and work the full control set, starting with which parties may touch PHI.",
    },
    {
      id: "t2",
      trap: "Stripping names and email addresses anonymizes a record, so privacy rules no longer apply.",
      why: "Both Safe Harbor de-identification and the GDPR's definition of personal data cover indirect identifiers — dates, postal codes, device and record numbers, rare attribute combinations — that re-identify individuals with ordinary effort.",
      instead:
        "Apply a defined standard, and treat pseudonymized data as still in scope.",
    },
    {
      id: "t3",
      trap: "The model provider holds a FedRAMP authorization, so the system is FedRAMP compliant.",
      why: "FedRAMP authorizes individual cloud service offerings at an impact level, while a system's standing depends on every service inside its authorization boundary and on an agency ATO for the system as a whole.",
      instead:
        "Draw the boundary, verify each component's authorization at the required impact level, and plan continuous monitoring.",
    },
    {
      id: "t4",
      trap: "An erasure request is satisfied by deleting the subject's rows from the application database.",
      why: "Personal data in an LLM system also sits in prompt and completion logs, vector indexes, caches, evaluation datasets and backups, and each of those is a separate deletion path that only exists if someone built it.",
      instead:
        "Build the deletion path alongside ingestion, with a per-subject key that reaches every derived store.",
    },
    {
      id: "t5",
      trap: "The provider does not train on API data, so sending personal data raises no compliance issue.",
      why: "Training is one processing purpose among many: transmission, retention, access, cross-border transfer and the absence of a data-processing agreement or BAA are separate obligations that a no-training commitment does not address.",
      instead:
        "Confirm retention, residency and contract terms for your account, and minimize what is sent regardless.",
    },
  ],

  practiceQuestionIds: ["D5-q401", "D5-q402"],

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

  relatedLessons: ["5.3", "5.5"],
} satisfies Lesson;
