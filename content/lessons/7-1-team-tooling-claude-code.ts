import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.1",
  slug: "7-1-team-tooling-claude-code",
  domain: 7,
  objective:
    "Configure Claude tools and environments for teams (e.g., Claude Code)",
  title: "Configuring Claude Tools for Teams",
  summary:
    "Configuring an agentic tool for a team means deciding what is shared and versioned, what stays personal, and what is enforced rather than merely requested. Claude Code is the reference case: project instructions, permissions, MCP servers and hooks are the four surfaces an architect is expected to reason about.",

  body: [
    {
      kind: "prose",
      md: "Claude Code is Anthropic's agentic command-line tool, also available inside IDEs and on the web. One developer configures it by trial and error and gets good results. A team that does the same gets twenty subtly different environments, which means the same request produces different behavior depending on whose laptop ran it — and nobody can reproduce anyone else's outcome.\n\nTeam configuration is therefore about moving decisions out of individual environments and into the repository, where they are reviewed, versioned and shared. Four surfaces carry that weight:",
    },
    {
      kind: "list",
      items: [
        "**Project instructions** — a committed memory file describing how *this* codebase works: build and test commands, conventions, architectural orientation, the things a new engineer would ask in their first week.",
        "**Permissions** — which operations the agent may perform without asking, and which always stop for human approval.",
        "**MCP servers** — the internal systems the agent can reach: issue tracker, documentation, observability, internal APIs.",
        "**Hooks** — scripts that run automatically at defined points in the agent's lifecycle, such as after a file edit or before a commit.",
      ],
    },

    { kind: "heading", text: "What is shared, what is personal" },
    {
      kind: "prose",
      md: "Configuration layers. Settings that describe the *project* belong in the repository and change through pull request; settings that describe a *machine or a person* stay local and uncommitted. Getting this split wrong is the most common team-configuration failure — either everyone re-invents the shared parts, or personal paths and preferences get committed and break other people's setups.",
    },
    {
      kind: "table",
      caption: "The configuration layers and who owns each",
      headers: ["Layer", "Lives where", "Carries", "Changes through"],
      rows: [
        [
          "Project instructions",
          "Committed in the repository, next to the code",
          "Build and test commands, conventions, architecture notes",
          "Pull request review, like any other file",
        ],
        [
          "Shared settings and permissions",
          "Committed alongside the project",
          "The team's baseline allowlist and denied operations",
          "Pull request review",
        ],
        [
          "Personal settings",
          "Local, and deliberately not committed",
          "Machine paths, individual preferences, personal overrides",
          "The individual, with no team impact",
        ],
        [
          "MCP servers",
          "Server list in project config; credentials per developer",
          "Which internal systems the agent can reach",
          "Platform team defines; each developer authenticates as themselves",
        ],
        [
          "Hooks",
          "Committed scripts bound to lifecycle events",
          "Formatting, linting, policy checks that must always run",
          "Pull request review",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "Instructions are advisory; permissions and hooks are enforcement. An instruction is context the model weighs against everything else in the window — compliance is high but not guaranteed. A hook is a script the harness executes unconditionally, and a permission rule is a gate the harness applies before the action happens. Anything that must be true every time belongs in the second category.",
    },

    { kind: "heading", text: "Permissions, credentials and scale" },
    {
      kind: "prose",
      md: "The approval prompt is the control that keeps an irreversible action from happening unattended, so the allowlist is a real security decision rather than an ergonomic one. Allowlist the operations that are read-only or trivially reversible — running tests, reading files, querying a status endpoint — and keep destructive or outbound operations stopping for a human. Teams that respond to prompt fatigue by allowing everything have removed the review precisely where the blast radius is largest.\n\nMCP credentials follow the same logic. The *list* of servers is shared configuration; **authentication stays per developer**, so the agent acts with the individual's existing permissions and the audit trail names a person. A shared service account collapses everyone's access to the union of all permissions and makes attribution impossible after an incident.\n\nAs adoption grows, recurring team workflows should stop living in individual chat histories. A release checklist, a migration procedure or a review rubric that the team performs repeatedly belongs in the repository as a Skill or a shared command, where it is discoverable, reviewable and identical for everyone.",
    },

    {
      kind: "example",
      title: "Practical example: standardizing a twelve-person platform team",
      scenario:
        "Adoption is enthusiastic and results are wildly uneven. Some developers get changes that follow house conventions; others get code that ignores the internal HTTP client and reimplements retry logic. Two engineers have wired the production observability MCP server with a shared read-write token. Several have allowlisted every command to stop the prompts.",
      walkthrough:
        "1. **Write the project instructions once, and commit them.** Build and test commands, the internal libraries to prefer, the directories that are generated, the conventions a reviewer would otherwise flag. The convention drift disappears because the context is no longer per-developer.\n2. **Split the settings.** A committed baseline carries the team allowlist; a local file carries machine-specific paths and personal preferences, and is ignored by version control.\n3. **Narrow the allowlist deliberately.** Tests, builds, formatters and read-only queries run without prompting. Anything that writes outside the working tree, pushes, deploys or spends money keeps asking.\n4. **Fix the credential model.** The MCP server list moves into project configuration; the shared token is revoked and each developer authenticates individually, so access matches their existing entitlements and logs name them.\n5. **Make the non-negotiables deterministic.** Formatting and lint move from a line in the instructions to a hook that runs after every edit — the rule now executes rather than being requested.\n6. **Capture the repeated workflows.** The release checklist and the migration procedure become committed Skills instead of instructions someone pastes from a wiki.",
      takeaway:
        "Every fix moved a decision from an individual's environment into the repository, where it is reviewed and versioned. That is what makes agent behavior reproducible across a team, and it is what the exam means by configuring tooling for teams.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "*Add it to the project instructions* is offered as the answer to every team-configuration problem, and it is right for conventions and orientation. When the scenario says something must happen **every time** — a formatter, a policy check, a blocked operation — the keyed answer is a hook or a permission rule, not a sentence in a document.",
    },

    {
      kind: "practice",
      questionIds: [
        "D7-q101",
        "D7-q102",
        "D7-q103",
        "D7-q104",
        "D7-q105",
        "D7-q106",
        "D7-q107",
      ],
    },
  ],

  keyTerms: [
    {
      term: "Project instructions",
      definition:
        "A committed memory file giving the agent durable context about the codebase — commands, conventions, architecture. Versioned with the code it describes, and reviewed like code.",
    },
    {
      term: "Permission allowlist",
      definition:
        "The set of operations the agent may perform without stopping for approval. Read-only and reversible operations belong here; destructive and irreversible ones do not.",
    },
    {
      term: "Hook",
      definition:
        "A script the harness runs automatically at a defined lifecycle point. Hooks are deterministic, which makes them the right place for anything that must happen on every run.",
    },
    {
      term: "Per-developer authentication",
      definition:
        "Configuring shared MCP servers so each developer authenticates individually, preserving least privilege and keeping audit trails attributable to a person.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Broadly allowlisting commands is a reasonable way to stop interrupting developers with approval prompts.",
      why: "The approval prompt is the control that prevents an irreversible action running unattended, so removing it wholesale for convenience drops the review exactly where the blast radius is largest.",
      instead:
        "Allowlist read-only and reversible operations, and keep destructive, outbound or costly ones stopping for a human.",
    },
    {
      id: "t2",
      trap: "A shared service account for MCP servers is simpler than configuring authentication per developer.",
      why: "It grants every developer the union of all permissions regardless of their own entitlements, and every action in the audit log is attributed to the account rather than to the person who initiated it.",
      instead:
        "Share the server configuration in the repository and have each developer authenticate individually.",
    },
    {
      id: "t3",
      trap: "Project instructions belong in a team wiki, where they are easier to keep up to date.",
      why: "Instructions that do not travel with the repository are never reviewed when the code they describe changes, so they drift silently and cannot be branched or rolled back with the code.",
      instead:
        "Commit them next to the code so they are versioned, reviewed in pull requests, and correct per branch.",
    },
    {
      id: "t4",
      trap: "Anything the team must always do can be written as a rule in the project instructions.",
      why: "Instructions are advisory context the model weighs against everything else in the window, which makes compliance high but never certain, and a check that runs most of the time is not a control.",
      instead:
        "Express must-happen behavior as a hook or a permission rule, which the harness executes deterministically.",
    },
  ],

  sources: [
    {
      label: "CCAR-P Exam Guide §6, Domain 7",
      url: "/exam-guide.pdf",
      kind: "exam-guide",
    },
    {
      label: "Claude Docs",
      url: "https://docs.claude.com/en/home",
      kind: "anthropic-docs",
    },
    {
      label: "Model Context Protocol",
      url: "https://modelcontextprotocol.io",
      kind: "external",
    },
  ],
  relatedLessons: ["3.7", "7.2"],
} satisfies Lesson;
