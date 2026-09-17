import type { Lesson } from "@/content/schema";

export const lesson = {
  schemaVersion: 1,
  id: "7.2",
  slug: "7-2-ai-assisted-workflows",
  domain: 7,
  objective: "Improve developer workflows using AI-assisted tooling",
  title: "AI-Assisted Developer Workflows",
  summary:
    "An agentic coding tool is only as reliable as the feedback loop it can run against, so the highest-leverage investment is usually the test suite rather than the prompt. The exam expects you to scope work to what is verifiable and to measure outcomes rather than output.",

  body: [
    {
      kind: "prose",
      md: "The question an architect is asked is not *should we adopt this* but *where does it pay, and what has to be true for it to pay safely*. Both halves have the same answer: **verification**. A task that the agent can check its own work on — by running tests, a type checker, a linter, a build — is a task it does well and a task a human can trust. A task with no such signal produces plausible code that someone has to validate by reading, which is the slowest and least reliable form of review there is.",
    },
    {
      kind: "table",
      caption: "Fit follows from how verifiable the work is",
      headers: ["Work", "Fit", "What makes it work or fail"],
      rows: [
        [
          "Writing tests against existing behavior",
          "Strong",
          "The specification is the code that already runs; failures are immediate and unambiguous",
        ],
        [
          "Wide mechanical refactors and framework migrations",
          "Strong",
          "Repetitive, tedious for humans, and the existing suite is the acceptance criterion",
        ],
        [
          "Reproducing and reducing a reported bug",
          "Strong",
          "The failing case is the definition of done, and the loop terminates on its own",
        ],
        [
          "Orienting in an unfamiliar codebase",
          "Strong",
          "The answer is checkable against the code, and being wrong is cheap",
        ],
        [
          "First-pass code review",
          "Good, as a supplement",
          "Catches the mechanical classes cheaply; does not know what the change was supposed to do",
        ],
        [
          "Greenfield features with ambiguous requirements",
          "Weak until decomposed",
          "No verification signal exists yet, so nothing constrains a confident wrong direction",
        ],
      ],
    },
    {
      kind: "callout",
      variant: "key-concept",
      md: "The value of an agentic tool scales with the quality of the feedback signal already present in the repository. A team with fast, meaningful tests gets an agent that converges on working code; a team without them gets an agent that produces code which compiles, reads well, and may be wrong in ways nobody notices until production.",
    },

    { kind: "heading", text: "Scoping, review and the diff" },
    {
      kind: "prose",
      md: "Scope work into increments that are separately verifiable. A large ambiguous task needs decomposition before delegation — not because the model cannot hold it, but because a change that touches forty files arrives as a single reviewable unit, and human review quality falls sharply with diff size. Generated code concentrates risk in exactly the step humans are worst at, so the counter-move is smaller changes that each pass the suite.\n\nThe developer owns the diff. Reviewing the agent's summary of its change is not a substitute for reviewing the change: the summary is generated text describing intent, and it can be accurate and confident while the code beneath it does something else. Independent tasks can run in parallel in separate branches or worktrees, which is a genuine throughput win — but each still lands as its own reviewed change.",
    },

    { kind: "heading", text: "Measuring adoption honestly" },
    {
      kind: "prose",
      md: "The metrics that are easy to collect are the ones that mislead. Share of code written by the assistant, suggestions accepted, prompts issued — all of these measure activity, and a team can drive every one of them up while shipping more slowly and breaking more often.\n\nMeasure the outcomes the tooling was adopted to improve: **cycle time** from first commit to merge, **change failure rate**, **time to restore** after a bad change, and **review burden** in reviewer-hours per merged change. These are the same delivery metrics the organization already tracks, which is exactly why they are credible to the people funding the adoption. If cycle time falls while change failure rate holds steady, the adoption is working; if both rise, activity metrics will still look excellent.",
    },

    {
      kind: "example",
      title: "Practical example: an adoption that looked successful",
      scenario:
        "Six months in, a division reports that 45% of merged lines were agent-generated and suggestion acceptance is above 70%. Leadership is pleased. Meanwhile the team's own retrospective complains that reviews take forever, and incident volume has crept upward. Nobody connects the three facts.",
      walkthrough:
        "1. **Measure delivery, not activity.** Pull cycle time, change failure rate and reviewer-hours per change. Median time to merge has nearly doubled and change failure rate is up by half.\n2. **Look at the diffs.** Median change size has roughly tripled. Developers are delegating whole features rather than increments, and reviewers are approving large generated diffs they cannot realistically read.\n3. **Check the verification signal.** The services with rising incidents are the two with the weakest test coverage — the agent had nothing to check itself against, and neither did the reviewer.\n4. **Change the practice, not the tool.** Cap the scope of a delegated task at one verifiable increment. Require the suite to pass before review, and have the agent write the missing characterization tests first on the weakly covered services.\n5. **Retire the vanity metrics.** Report cycle time, change failure rate and review burden instead; the generated-lines number is deleted rather than improved.",
      takeaway:
        "The tool was never the problem. Unbounded scope plus a weak verification loop turned a throughput gain into a review bottleneck and a reliability regression, and the metrics being reported were incapable of showing it.",
    },

    {
      kind: "callout",
      variant: "exam-distractor",
      md: "Any option that proposes measuring AI-assisted development by volume — lines generated, suggestions accepted, percentage of the codebase — is a distractor. Volume is not an outcome. The keyed option ties back to delivery performance or defect rates.",
    },

    { kind: "practice", questionId: "D7-q205" },
  ],

  keyTerms: [
    {
      term: "Verification loop",
      definition:
        "The automated feedback an agent can run against its own work — tests, type checks, linters, builds. Its quality sets the ceiling on how reliably agentic tooling can operate in a repository.",
    },
    {
      term: "Verifiable increment",
      definition:
        "A unit of delegated work small enough that passing the suite and reading the diff together establish correctness. The practical scoping unit for agentic development.",
    },
    {
      term: "Outcome metrics",
      definition:
        "Delivery measures such as cycle time, change failure rate and time to restore, used in place of activity measures like accepted suggestions or generated lines.",
    },
    {
      term: "Characterization test",
      definition:
        "A test written to pin down what existing code currently does, so that a subsequent refactor has an acceptance criterion. A high-value first task in a weakly covered codebase.",
    },
  ],

  traps: [
    {
      id: "t1",
      trap: "Adoption is best measured by the share of code the assistant writes.",
      why: "Generated volume says nothing about whether a change was correct, necessary or cheap to review, and a team can raise that number while cycle time lengthens and defects increase.",
      instead:
        "Report cycle time, change failure rate, time to restore and review burden — the delivery metrics the organization already trusts.",
    },
    {
      id: "t2",
      trap: "A repository with weak test coverage benefits most, because the agent can write the tests it lacks.",
      why: "The agent's reliability depends on the feedback signal it can run, so without a suite neither it nor the reviewer can distinguish a working change from a plausible one, and errors land unnoticed.",
      instead:
        "Build the verification loop first — often by having the agent write characterization tests — then delegate change work against it.",
    },
    {
      id: "t3",
      trap: "Larger delegated tasks are more efficient because one review covers more work.",
      why: "Review quality falls sharply as diff size grows, so a large generated change concentrates risk in the step humans perform worst, and the apparent saving is paid back as escaped defects.",
      instead:
        "Delegate one verifiable increment at a time, and run independent increments in parallel rather than merging them into one change.",
    },
    {
      id: "t4",
      trap: "Reading the agent's explanation of its change is an acceptable substitute for reading the diff.",
      why: "The explanation is generated text describing intent and can be entirely accurate about what was meant while the code does something different, and only the code is what actually ships.",
      instead:
        "Review the diff. Treat the explanation as a guide to where to look, never as evidence of what the change does.",
    },
  ],

  practiceQuestionIds: ["D7-q205", "D7-q201"],

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
  ],
  relatedLessons: ["7.1", "7.3"],
} satisfies Lesson;
