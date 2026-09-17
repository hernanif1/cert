import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D5-q401",
    domain: 5,
    objective: "5.4",
    stem: "A hospital system is about to launch a Claude-based summarizer for clinical notes. The team has enabled encryption in transit and at rest, scoped the service account, and set 30-day log retention. Prompts containing PHI are also streamed to a third-party observability vendor for debugging. Which prerequisite is missing before launch?",
    choices: [
      {
        id: "A",
        text: "The prompt payloads should be encrypted with a customer-managed key rather than a provider-managed one.",
        rationale:
          "Key ownership is a hardening choice, not a prerequisite, and encryption of any kind does not make a vendor permitted to receive PHI.",
      },
      {
        id: "B",
        text: "Log retention should be reduced from 30 days to 7 days before any PHI is processed.",
        rationale:
          "Shorter retention narrows exposure, but no retention period makes an otherwise impermissible disclosure permissible.",
      },
      {
        id: "C",
        text: "The summarizer should be moved into a dedicated VPC before it handles clinical notes.",
        rationale:
          "Network isolation is sound practice and says nothing about which parties are authorized to receive PHI, which is the gate that has not been cleared.",
      },
      {
        id: "D",
        text: "A signed business associate agreement with every vendor that receives PHI, including the observability vendor.",
      },
    ],
    explanation:
      "Any vendor processing PHI on a covered entity's behalf is a business associate and needs an executed BAA before PHI flows. The obligation follows the data, so it covers the logging and monitoring stack as much as the model call, and it is a gate rather than something retrofitted after launch.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["hipaa", "phi", "baa"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D5-q402",
    domain: 5,
    objective: "5.4",
    stem: "A European customer invokes their right to erasure against a support assistant. Engineering deletes the customer's rows from the ticketing database and reports the request complete. The architect reviewing the response concludes the deletion is incomplete. Which stores most likely still hold that customer's personal data?",
    choices: [
      {
        id: "A",
        text: "Only the database backups, which will age out on their own retention schedule.",
        rationale:
          "Backups do matter, but naming them alone misses the live stores that will keep serving this customer's data to production requests indefinitely.",
      },
      {
        id: "B",
        text: "Prompt and completion logs, the vector index built from the tickets, response caches and the evaluation dataset.",
      },
      {
        id: "C",
        text: "The model weights, which absorbed the customer's tickets during inference.",
        rationale:
          "Inference does not update weights, and commercial API traffic is not used to train models by default, so the weights are not where this data resides.",
      },
      {
        id: "D",
        text: "Nothing further: once the source records are gone, derived systems have no lawful basis to keep copies.",
        rationale:
          "Lawful basis is not a deletion mechanism. Copies persist until a deletion path physically reaches them, which is exactly what the request obliges you to build.",
      },
    ],
    explanation:
      "Personal data in an LLM system propagates well beyond the primary database: prompt logs, embeddings and their index, caches, eval sets and backups are all separate deletion paths. Erasure has to be designed alongside ingestion, keyed per subject, or a request can only ever be answered partially.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["gdpr", "erasure", "data-lifecycle"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D5-q403",
    domain: 5,
    objective: "5.4",
    stem: "A contractor is preparing a Claude-based case-triage system for a federal agency ATO at FedRAMP Moderate. The architecture includes the model service, a managed vector database, an open-source tracing SaaS the team prefers, and a spreadsheet-based evaluation harness on a developer laptop. The team's position is that the system qualifies because the model provider offers a FedRAMP-authorized service. What should the architect tell them?",
    choices: [
      {
        id: "A",
        text: "Every component that stores, processes or transmits federal data sits inside the authorization boundary and must be authorized at or above Moderate; the tracing SaaS and the laptop harness must be assessed or removed.",
      },
      {
        id: "B",
        text: "Only components that persist federal data are in scope, so the tracing SaaS is exempt provided it keeps traces for under 30 days.",
        rationale:
          "Transmitting or processing federal data places a service inside the boundary regardless of how long it keeps anything; a short retention period is not an exemption.",
      },
      {
        id: "C",
        text: "The system inherits the model provider's authorization, and the remaining components need only a documented risk acceptance.",
        rationale:
          "Authorizations attach to individual cloud service offerings and are not inherited by systems built on them, and a risk acceptance is not an agency ATO.",
      },
      {
        id: "D",
        text: "FedRAMP governs the agency's own infrastructure, so a contractor-operated system is assessed under a different framework.",
        rationale:
          "Cloud services handling federal data on an agency's behalf fall within FedRAMP whoever operates them; the operator does not change the requirement.",
      },
    ],
    explanation:
      "FedRAMP authorizes cloud service offerings, not applications or models, so compliance turns on the authorization boundary: the full set of components touching federal data, each authorized at or above the system's impact level, with the agency issuing the ATO and continuous monitoring after it. Ancillary tooling is where boundaries usually leak.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["fedramp", "authorization-boundary"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D5-q404",
    domain: 5,
    objective: "5.4",
    stem: "An insurer plans to use an assistant to decide, with no human involvement, whether to renew motor policies for EU customers — a decision with a significant effect on those customers. Legal has confirmed a valid basis for the processing. Which two capabilities must the architecture provide? (Select TWO.)",
    choices: [
      {
        id: "A",
        text: "A confidence score returned alongside every renewal decision.",
        rationale:
          "A score is an engineering signal with no standing in the obligation, and an uncalibrated one actively misleads whoever reads it.",
      },
      {
        id: "B",
        text: "A route by which the customer can obtain human intervention and contest the decision.",
      },
      {
        id: "C",
        text: "The model's full chain-of-thought text, stored and disclosed to the customer on request.",
        rationale:
          "Generated reasoning is not a faithful account of how the output was produced, so presenting it as the explanation misinforms the person entitled to a real one.",
      },
      {
        id: "D",
        text: "Retention of every decision record for a minimum of seven years.",
        rationale:
          "A fixed multi-year retention period is not what the obligation requires, and over-retaining personal data creates a minimization problem of its own.",
      },
      {
        id: "E",
        text: "A decision record capturing the inputs used, the evidence retrieved, the model and prompt version, and the outcome.",
      },
      {
        id: "F",
        text: "An opt-out that routes the customer to a rules-based scoring engine instead.",
        rationale:
          "Substituting a different automated system does not supply the human element the obligation turns on.",
      },
    ],
    explanation:
      "Where a solely automated decision has legal or similarly significant effects, the subject is entitled to meaningful human intervention and a route to contest, which requires a reviewer with authority and a durable record of what the decision was based on. Those are architecture deliverables: an appeal path and a decision record, not a confidence number or a reasoning transcript.",
    difficulty: 3,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["gdpr", "automated-decisions", "article-22"],
    type: "multi",
    selectCount: 2,
    correct: ["B", "E"],
  },
  {
    schemaVersion: 1,
    id: "D5-q405",
    domain: 5,
    objective: "5.4",
    stem: "A clinical documentation assistant pastes each patient's entire chart — demographics, insurance identifiers, full history — into every prompt, because selecting fields was more work than sending everything. The actual task is to draft a visit summary from today's encounter note. Which change most reduces regulatory exposure without changing the product?",
    choices: [
      {
        id: "A",
        text: "Encrypt the prompt payload with a customer-managed key before transmission.",
        rationale:
          "Encryption protects data in transit and at rest and does nothing about disclosing far more PHI than the task requires to a system that will then log it.",
      },
      {
        id: "B",
        text: "Shorten prompt-log retention from 90 days to 14 days.",
        rationale:
          "Shorter retention narrows the exposure window while every prompt still carries the whole chart, and the over-disclosure has already occurred.",
      },
      {
        id: "C",
        text: "Send only what the task needs — today's encounter note and minimal demographics — with identifiers replaced by a case reference.",
      },
      {
        id: "D",
        text: "Move the assistant to a dedicated tenant so charts are not processed alongside other customers' data.",
        rationale:
          "Tenant isolation addresses whose data sits nearby, not the volume of PHI this workload discloses for a task that never needed it.",
      },
    ],
    explanation:
      "Minimum necessary under HIPAA and data minimization under the GDPR both point at the same control: constrain what enters the prompt to the fields the task requires. Redaction upstream shrinks the blast radius of every downstream control — logging, retention, vendor scope and breach exposure — in a way that encryption and isolation cannot.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["hipaa", "minimum-necessary", "data-minimization"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
