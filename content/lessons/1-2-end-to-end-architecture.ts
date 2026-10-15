import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "1.2",
  slug: "1-2-end-to-end-architecture",
  domain: 1,
  objective:
    "Design end-to-end architectures (input → processing → output → feedback loops)",
  title: "End-to-End Architecture",
  summary:
    "An end-to-end design is four stages — input, processing, output, feedback — and a stage the diagram omits is a stage nobody owns. Feedback is the one teams skip, and skipping it is what leaves a system at launch quality forever.",

  body: [
    {
      kind: "prose",
      md: "Domain 1 asks you to draw the whole system, not the model call in the middle of it. Each of the four stages owns guarantees the others cannot provide, and the common failure is not a weak stage but a missing one. A design that stops at *the model returns an answer* has no way to tell whether the answer was right and no path from that knowledge back into the system.",
    },

    { kind: "heading", text: "Input: everything before the model sees anything" },
    {
      kind: "prose",
      md: "The input stage owns four responsibilities, and they run in that order — each one narrowing what is allowed to reach the model:",
    },
    {
      kind: "list",
      items: [
        "**Ingestion.** Where the formats converge. PDFs, email bodies, webhooks and form submissions become one internal representation, so nothing downstream has to know which channel a record arrived on.",
        "**Normalization.** Where that representation is made uniform. Encodings, dates, units, currencies and field names are resolved once, in code, rather than left for the prompt to interpret.",
        "**Validation.** Where the unprocessable is rejected before tokens are spent on it — a missing required field, a file too large for the context window, a type no extractor handles.",
        "**Trust.** Where every record is labelled with its origin, because origin is what decides whether its content may act on the system.",
      ],
    },
    {
      kind: "prose",
      md: "Trust is the least obvious of the four and the one reviewers ask about. Content that arrives from outside the organization is data, never instruction. That boundary is enforced structurally: delimit external content, keep it separate from the instructions, and never let text that came from a supplier, a customer or a web page decide what a tool is allowed to do.",
    },

    { kind: "heading", text: "Processing: the part people draw" },
    {
      kind: "prose",
      md: "Processing covers the model calls and the control flow around them — retrieval, tool invocation, branching, retries and state. Two architectural decisions live here. The first is who decides the sequence: code, or the model. The second is what the model is allowed to reach, which is an authorization question rather than a prompting one. Tools carry the system's privileges, so their scope is designed rather than inherited.",
    },

    { kind: "heading", text: "Output: a contract, not a string" },
    {
      kind: "prose",
      md: "Downstream systems consume records, not prose. The output stage shapes the result, validates it against a schema, and decides what happens when validation fails — repair once, retry within a bounded budget, or route to a human. It also owns delivery and the placement of any review gate.\n\nGate placement is what exam items probe. A review step that runs after an irreversible action has already been taken is not a control; it is a correction. If the point of the gate is to prevent something, it belongs in the path.",
    },

    { kind: "heading", text: "Feedback loops: the stage that gets skipped" },
    {
      kind: "prose",
      md: "A feedback loop turns production behavior into evidence and then into a change. It has three parts, and all three are designed before launch because two of them cannot be retrofitted.\n\n**Capture.** Log the input, the prompt version, the model version, the output and the outcome together. An outcome without its input is a rating nobody can act on.\n\n**Label.** Human corrections are the cheapest labels an organization will ever get. When a reviewer edits a draft or moves a ticket to a different queue, that is a labeled example, and a design that does not store it has thrown away its evaluation set.\n\n**Act.** Corrections accumulate into a regression suite, so a change to a prompt, a model or a retrieval strategy is measured rather than argued about.",
    },
    {
      kind: "table",
      caption: "What each stage owns, and what breaks without it",
      headers: ["Stage", "Owns", "Weak or skipped"],
      rows: [
        [
          "Input",
          "Ingestion, normalization, validation, the trust boundary for external content",
          "Spend wasted on unprocessable records; external text able to steer the system",
        ],
        [
          "Processing",
          "Model calls, retrieval, tool scope, control flow, retries, state",
          "Unbounded loops and tools holding more authority than the task needs",
        ],
        [
          "Output",
          "Schema validation, failure handling, delivery, gate placement",
          "Silent corruption downstream; review that cannot prevent anything",
        ],
        [
          "Feedback",
          "Capture, labeling, the evaluation set, drift monitoring",
          "Launch quality becomes permanent quality; regressions found by customers",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Decide what to log before launch. Correlating an output with the exact input, prompt version and model version that produced it is nearly free at design time and effectively impossible to reconstruct afterwards.",
    },

    {
      kind: "example",
      title: "Practical example: an invoice intake pipeline",
      scenario:
        "A shared-services team processes 9,000 supplier invoices a month. Invoices arrive as email attachments, a model extracts fifteen fields, and the fields are written to the ERP. After launch, the ERP load fails a few times a month, and the accuracy figure the team quotes is still the one from its pre-launch test set.",
      walkthrough:
        "1. **Input.** Attachments are normalized to one internal record, and anything that is not a readable invoice is rejected before a model call. Supplier text is delimited and never treated as instruction.\n2. **Processing.** Extraction runs against a field specification, and low-confidence fields are flagged rather than guessed.\n3. **Output.** The record is validated against the ERP schema. A failing record is repaired once and then routed to a clerk — never coerced to null and loaded, which is what the team had been doing.\n4. **Feedback.** Every clerk correction is stored against the original document and the prompt version. After a month the team has 400 real labels.\n5. **Act.** Those labels become the regression set, so the next prompt change is measured instead of debated.",
      takeaway:
        "Only step four was missing at launch, and its absence is why nobody could answer a question about quality four months in. The other three stages worked and taught the team nothing.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "When a stem says quality has not improved since launch, the tempting options are all interventions — a larger model, a retrieval layer, a verifier pass. Each is a single change with no way to tell whether it helped. The keyed answer is the mechanism: captured outcomes linked to the inputs and versions that produced them.",
    },

    {
      kind: "practice",
      questionIds: [
        "D1-q201",
        "D1-q202",
        "D1-q203",
        "D1-q204",
        "D1-q205",
        "D1-q206",
        "D1-q207",
        "D1-q208",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Trust boundary",
      definition:
        "The line at which externally supplied content is marked as data rather than instruction, enforced by structure and by tool authorization rather than by asking the model nicely.",
    },
    {
      term: "Output contract",
      definition:
        "The schema a downstream consumer relies on, validated deterministically before delivery, with a defined path for records that fail validation.",
    },
    {
      term: "In-path gate",
      definition:
        "A human or programmatic check placed before an irreversible action, as opposed to a post-delivery review that can only correct the record.",
    },
    {
      term: "Correction capture",
      definition:
        "Storing a human's edit alongside the input, prompt version and model version that produced the original output, turning routine review work into labeled evaluation data.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "A thumbs-up and thumbs-down control satisfies the feedback-loop requirement.",
      why: "A rating with no link to the input, prompt version and model version that produced the output tells the team something was wrong without giving them anything to reproduce, measure or change.",
      instead:
        "Capture the whole record — input, versions, output, outcome — and treat human corrections as the label.",
    },
    {
      id: "t2",
      trap: "Output validation can be delegated to the model that produced the output.",
      why: "A model asked to check its own work shares the reasoning that produced the error and will frequently confirm it, whereas structural guarantees such as schema conformance are enforceable in code with certainty.",
      instead:
        "Validate structure deterministically and reserve model review for judgments that code cannot express.",
    },
    {
      id: "t3",
      trap: "A human review step placed after delivery still counts as a control.",
      why: "Once an irreversible action has been taken — a message sent, a payment issued, a claim denied — a later review can only correct the record, not prevent the harm the gate was introduced to stop.",
      instead:
        "Put the gate in the path of the action it governs, and sample after the fact only where the action is reversible.",
    },
    {
      id: "t4",
      trap: "Feedback loops are an operations concern that can be added once the system is live.",
      why: "Capture and correlation have to sit in the request path from the first day, because an event that was never logged with its prompt and model version cannot be reconstructed from anything later.",
      instead:
        "Treat the logging schema as a design-time deliverable alongside the prompt and the tool definitions.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 1",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Building Effective Agents — Anthropic",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
      kind: "anthropic-blog",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
  ],

  relatedLessons: ["1.3"],
} satisfies Lesson;
