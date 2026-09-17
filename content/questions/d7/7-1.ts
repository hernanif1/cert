import type { Question } from "@/content/schema";

export const questions = [
  {
    schemaVersion: 1,
    id: "D7-q101",
    domain: 7,
    objective: "7.1",
    stem: "A team requires every source file the agent edits to be run through the project formatter before it is committed. They added \"Always run the formatter after editing a file\" to the shared project instructions two months ago, and roughly one commit in ten still arrives unformatted. What should the architect recommend?",
    choices: [
      {
        id: "A",
        text: "Move the line to the top of the project instructions and phrase it more emphatically.",
        rationale:
          "Position and emphasis shift the odds slightly, but the rule stays advisory and a requirement that holds nine times out of ten is not a requirement.",
      },
      {
        id: "B",
        text: "Replace the instruction with a hook that runs the formatter automatically after every file edit.",
      },
      {
        id: "C",
        text: "Add the formatter command to the permission allowlist so it never stops for approval.",
        rationale:
          "Allowlisting removes friction when the agent chooses to run the formatter; it does nothing to make that choice happen on the runs where it currently does not.",
      },
      {
        id: "D",
        text: "Add an example of a correctly formatted file to the project instructions so the expected style is unambiguous.",
        rationale:
          "The style was never in doubt — the step is being skipped, not misunderstood — and the example adds tokens to every session for no behavioral change.",
      },
    ],
    explanation:
      "Project instructions are advisory context the model weighs against everything else in the window, so compliance is high but never guaranteed. A hook is executed by the harness unconditionally, which is why anything that must happen on every run belongs there rather than in a document.",
    difficulty: 2,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["claude-code", "hooks", "enforcement"],
    type: "single",
    correct: "B",
  },
  {
    schemaVersion: 1,
    id: "D7-q102",
    domain: 7,
    objective: "7.1",
    stem: "Two engineers wired the team's observability MCP server into their agent configuration using a single shared read-write service token, and checked the configuration into the repository so everyone could use it. What is the most serious consequence?",
    choices: [
      {
        id: "A",
        text: "The MCP server will rate-limit the team because every request originates from one identity.",
        rationale:
          "Rate limiting is an operational annoyance that is usually adjustable, and it is a far smaller problem than the access and accountability failure this setup creates.",
      },
      {
        id: "B",
        text: "Developers will be unable to use the server concurrently while it is bound to one token.",
        rationale:
          "A single credential supports concurrent sessions without difficulty, so availability is not what breaks here.",
      },
      {
        id: "C",
        text: "The token will need manual rotation more frequently than per-user credentials would.",
        rationale:
          "Rotation burden is real but secondary; the setup is unsafe from the moment it works, not only when the credential ages.",
      },
      {
        id: "D",
        text: "Every developer now acts with the union of that token's permissions regardless of their own entitlements, and every action in the audit log is attributed to the token rather than to a person.",
      },
    ],
    explanation:
      "Sharing the server configuration is correct; sharing the credential is not. Per-developer authentication keeps the agent acting within each person's existing entitlements and keeps audit trails attributable, which is what makes an incident investigable afterward. A committed shared token also puts a live credential in version control.",
    difficulty: 2,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["mcp", "credentials", "least-privilege"],
    type: "single",
    correct: "D",
  },
  {
    schemaVersion: 1,
    id: "D7-q103",
    domain: 7,
    objective: "7.1",
    stem: "A platform team is standardizing agent configuration across twenty repositories so that the same request produces comparable behavior regardless of who runs it. Which TWO pieces of configuration belong in version control alongside the code?",
    choices: [
      {
        id: "A",
        text: "Project instructions describing build and test commands, house conventions and architectural orientation.",
      },
      {
        id: "B",
        text: "The team's baseline permission rules for which operations may run without stopping for approval.",
      },
      {
        id: "C",
        text: "Each developer's personal tool preferences and local filesystem paths.",
        rationale:
          "Machine-specific values break other people's environments when committed, which is exactly why a local, uncommitted settings layer exists.",
      },
      {
        id: "D",
        text: "Individual developers' credentials for the shared MCP servers.",
        rationale:
          "Credentials never belong in version control, and authentication is deliberately per-person so the agent inherits each developer's own entitlements.",
      },
      {
        id: "E",
        text: "Transcripts of successful agent sessions so other developers can copy the prompts that worked.",
        rationale:
          "Transcripts go stale as the code changes and are not a reviewable contract; a recurring workflow belongs in a committed Skill or command instead.",
      },
    ],
    explanation:
      "Configuration that describes the project belongs in the repository, where it is versioned, branch-correct and reviewed in pull requests. Configuration that describes a machine or a person stays local. Getting that split wrong produces either twenty divergent environments or committed paths that break other people's setups.",
    difficulty: 1,
    cognitiveLevel: "recall",
    pool: "drill",
    tags: ["claude-code", "configuration-layers"],
    type: "multi",
    selectCount: 2,
    correct: ["A", "B"],
  },
  {
    schemaVersion: 1,
    id: "D7-q104",
    domain: 7,
    objective: "7.1",
    stem: "A developer reports that approval prompts interrupt them constantly and asks for all shell commands to be allowlisted. Reviewing the logs, the prompts are triggered almost entirely by the test runner, the build command and a read-only status query, with an occasional invocation of a production deploy script. What should the architect approve?",
    choices: [
      {
        id: "A",
        text: "Allowlist the test runner, the build and the status query, and leave the deploy script prompting.",
      },
      {
        id: "B",
        text: "Allowlist all commands and rely on the project instructions to keep the agent from misusing them.",
        rationale:
          "It removes the gate on the one irreversible operation in the list and replaces it with advisory text, which is the weakest possible control on the highest-impact action.",
      },
      {
        id: "C",
        text: "Deny all commands and require the developer to run everything manually outside the agent.",
        rationale:
          "It eliminates the interruptions by eliminating the capability, discarding the throughput gains for operations that carry essentially no risk.",
      },
      {
        id: "D",
        text: "Allowlist everything for this developer only, since the blast radius is limited to their machine.",
        rationale:
          "The deploy script reaches production, so the blast radius was never confined to one machine, and per-person exceptions also defeat the reproducibility the shared baseline exists for.",
      },
    ],
    explanation:
      "The approval prompt is the control that stops an irreversible action running unattended, so the allowlist is a security decision rather than an ergonomic one. Read-only and reversible operations belong on it; anything that deploys, pushes, spends money or writes outside the working tree keeps asking.",
    difficulty: 3,
    cognitiveLevel: "analysis",
    pool: "drill",
    tags: ["permissions", "allowlist", "claude-code"],
    type: "single",
    correct: "A",
  },
  {
    schemaVersion: 1,
    id: "D7-q105",
    domain: 7,
    objective: "7.1",
    stem: "Several engineers keep the team's release checklist in personal notes and paste it into the agent each time they cut a release. Steps are occasionally skipped, and comparing two engineers' versions shows they have drifted apart. What is the appropriate fix?",
    choices: [
      {
        id: "A",
        text: "Have each engineer store the checklist in their personal agent settings file.",
        rationale:
          "Personal settings are uncommitted and unreviewed, so the copies keep diverging — the notes app has simply been renamed.",
      },
      {
        id: "B",
        text: "Paste the checklist into the system prompt of every session so it is always available.",
        rationale:
          "It pays for a release procedure on every unrelated request and still leaves the text unversioned and unreviewed.",
      },
      {
        id: "C",
        text: "Commit the checklist to the repository as a shared Skill, so it is discoverable, reviewed and identical for everyone.",
      },
      {
        id: "D",
        text: "Publish the checklist on the team wiki and link to it from the project instructions.",
        rationale:
          "A wiki page does not travel with the branch, is not reviewed when the release process changes, and leaves the agent dependent on someone fetching it.",
      },
    ],
    explanation:
      "A repeated team workflow living in individual chat histories is tribal knowledge with an expiry date. Committing it as a Skill puts it under review and version control, makes it discoverable by name and description without being paid for on unrelated requests, and guarantees every engineer runs the same procedure.",
    difficulty: 1,
    cognitiveLevel: "application",
    pool: "drill",
    tags: ["skills", "team-workflows"],
    type: "single",
    correct: "C",
  },
] satisfies Question[];
