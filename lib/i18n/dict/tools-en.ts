import type { ReadinessGate, ReadinessLabel } from "@/lib/exam/readiness";

/** Strings for the three study tools: progress dashboard, drill, mock exam.
 *  English wording is load-bearing — the UI test suites select on it. */
export const toolsEn = {
  loading: "Loading…",
  eyebrowTools: "Study Tools",
  eyebrowPractice: "Practice",

  progress: {
    metaDescription:
      "Exam readiness, per-domain coverage and drill mastery — stored only in this browser.",
    title: "Progress Dashboard",
    readiness: "Exam readiness",
    readinessAria: (score: number) => `Exam readiness ${score} of 100`,
    labels: {
      "Just Beginning": "Just Beginning",
      "Building Foundations": "Building Foundations",
      "Getting There": "Getting There",
      "Nearly There": "Nearly There",
      "Exam Ready": "Exam Ready",
    } as Record<ReadinessLabel, string>,
    lessons: "Lessons",
    drill: "Drill",
    mock: "Mock",
    component: (label: string) => `${label} component`,
    gate: (g: ReadinessGate): string => {
      switch (g.kind) {
        case "no-mock":
          return `Your composite is ${g.score}, but you have not taken a mock exam. That is the number that decides.`;
        case "failed-mock":
          return `Your composite is ${g.score}, but your last mock scored ${g.scaled} — below the ${g.cut} cut. That is the number that decides.`;
        case "weak-domain":
          return `Your last mock passed, but ${g.weak.map((w) => `D${w.id} at ${w.pct}%`).join(", ")} is below ${g.min}%. Shore that up before sitting the real exam.`;
        case "lessons":
          return `Your composite is ${g.score}, but only ${g.done} of 38 lessons are complete (${g.needed} needed).`;
      }
    },
    unlock: (points: number) => `Take a mock exam to unlock ${points} points.`,
    startOne: "Start one",
    pctComplete: (pct: number) => `${pct}% complete`,
    mockAttempts: "Mock attempts",
    best: (n: number) => `best ${n}`,
    passAt: (n: number) => `pass at ${n}`,
    drillSeen: "Drill seen",
    dayStreak: "Day streak",
    longest: (n: number) => `longest ${n}`,
    openDrill: "Open drill mode",
    seen: "Seen",
    mastered: "Mastered",
    dueToday: "Due today",
    leeches: "Leeches",
    bankPending: "The question bank is still being authored.",
    byDomain: "By domain",
    domainAria: (title: string, pct: number) => `${title} ${pct}% of lessons complete`,
    domainLine: (done: string, total: number, weight: string) =>
      `${done}/${total} lessons · ${weight} of the exam`,
    drillMastered: (done: string, total: number) => `${done}/${total} drill mastered`,
    footnote: (lessons: number, drill: number, mock: number, total: number) =>
      `Readiness weights lessons at ${lessons}, drill at ${drill} and mock performance at ${mock}. A lesson counts once it is marked complete and you have answered at least one question on its objective — clicking through ${total} lessons should not, on its own, say you are ready.`,
  },

  checklist: {
    metaDescription:
      "A pre-exam self-assessment: 24 statements to tick off honestly, stored only in this browser.",
    title: "Readiness Checklist",
    intro:
      "Tick a box only when you could explain it out loud, unprompted. These ticks are for you — they do not move the readiness score, so there is nothing to game.",
    checked: (done: number, total: number) => `${done} of ${total} checked`,
    progressAria: "Checklist progress",
    groupAria: (title: string, done: number, total: number) =>
      `${title}: ${done} of ${total} checked`,
    prepGroup: "Exam preparation",
    openLesson: (text: string) => `Open the lesson covering: ${text}`,
    allChecked:
      "Every box ticked. Take a timed mock exam — that score is the one that decides.",
  },

  data: {
    title: "Your data",
    intro:
      "Progress is stored only in this browser, on this device. Export it to move to another machine or keep a backup.",
    export: "Export progress",
    import: "Import progress",
    reset: "Reset progress",
    readError: "Could not read that file.",
    importQuestion: "Import this file?",
    lessonsComplete: "Lessons complete",
    checklistTicks: "Checklist ticks",
    drillCards: "Drill cards",
    mockAttempts: "Mock attempts",
    file: (n: number) => `file: ${n}`,
    now: (n: number) => `now: ${n}`,
    merge: "Merge",
    replace: "Replace everything",
    cancel: "Cancel",
    deleteQuestion: "Delete all progress on this device?",
    deleteBody:
      "Lesson completions, checklist ticks, drill history and mock attempts. This cannot be undone — take a backup first.",
    backupFirst: "Export a backup first",
    deleteAll: "Delete all progress",
  },

  flagged: {
    metaDescription:
      "Every question you flagged in drill, in one list, with a copyable prompt that asks an assistant to explain each one.",
    title: "Flagged Questions",
    intro:
      "Every question you flagged, kept in this browser. Each row has a prompt to copy into Claude: it asks for a full explanation of the correct answer and every distractor, with links back to the lesson here and to the Claude documentation it comes from.",
    count: (n: number) => (n === 1 ? "1 flagged question" : `${n} flagged questions`),
    empty: "Nothing flagged yet. Press F on any card in drill, or the flag on the card, and it will show up here.",
    copyPrompt: "Copy prompt",
    copyPromptFor: (id: string) => `Copy a study prompt for the question from ${id}`,
    copied: "Copied",
    copyFailed: "Copy failed — select and copy manually",
    unflag: "Remove flag",
    promptIntro:
      "I am preparing for the CCAR-P exam (Claude Certified Architect – Professional). Below is a practice question I flagged while studying, with its answer choices and the correct answer.",
    promptQuestion: (objective: string) => `Question (exam objective ${objective})`,
    promptRated: (rating: string) => `I rated this: ${rating}`,
    promptCorrect: "Correct answer",
    promptSource: (id: string, title: string, url: string) =>
      `Where it comes from: lesson ${id} "${title}" of my study guide — ${url}`,
    promptSourceUnknown: (objective: string) =>
      `Where it comes from: exam objective ${objective} of my study guide.`,
    promptAsk:
      "Please: (1) explain in detail why the correct answer is correct; (2) explain why each of the other choices is wrong; (3) name the underlying concept I should remember, and where I rated the question use the rating to judge how much depth I need; (4) end with a References section that includes the internal lesson link above and the link(s) to the official Claude documentation page(s) (docs.claude.com or code.claude.com) that cover this topic, naming the section I should read.",
  },

  drill: {
    metaDescription:
      "Spaced-repetition practice across the question bank, scheduled by a leech-aware Leitner system.",
    title: "Drill Mode",
    loading: "Loading drill…",
    bankPending:
      "The question bank is still being authored. Drill opens as soon as there are questions to schedule.",
    intro:
      "Spaced repetition over the question bank. Cards move up a box each time you get them right and drop two when you do not; box 4 counts as mastered.",
    mode: "Mode",
    modes: {
      due: ["Due", "Cards scheduled for today"],
      mixed: ["Mixed", "Due cards plus new ones"],
      new: ["New", "Never answered"],
      weak: ["Weak areas", "Low accuracy or lapsing"],
      leeches: ["Leeches", "Four or more lapses"],
      bookmarked: ["Flagged", "Flagged for review"],
      cram: ["Cram", "Ignores scheduling; records nothing"],
    } as Record<string, [string, string]>,
    domains: "Domains",
    all: "All",
    start: "Start session",
    keys: "Keys: 1–6 select · Enter check · then E easy / Enter medium / H hard · F flag · R review flagged · S suspend · Esc end session",
    complete: "Session complete",
    score: (right: number, total: number) => `${right} of ${total} correct`,
    cramNote: "Cram session — your review schedule was left untouched.",
    dueTomorrow: (n: number) => `Due tomorrow: ${n}`,
    another: "Another session",
    changeFilters: "Change filters",
    progress: "Progress",
    box: (n: number) => `Box ${n}`,
    leech: "leech",
    cramBadge: "cram — nothing recorded",
    shortcuts: "Shortcuts",
    end: "End session",
    becameLeech: "flagged as a leech",
    becameSuspended: "suspended",
    leechAdvice:
      "You have missed this four times. That is usually a gap in the material rather than in memory —",
    reread: (id: string) => `re-read lesson ${id}`,
    next: "Next",
    lesson: (id: string) => `Lesson ${id}`,
    suspend: "Suspend",
    shortcutsTitle: "Keyboard shortcuts",
    shortcutList: [
      ["1 – 6", "Select a choice (toggles, for multi-select)"],
      ["Enter / Space", "Check the answer; after the reveal, rate Medium and move on"],
      ["E", "After the reveal: rate Easy — you will never see it again"],
      ["H", "After the reveal: rate Hard — it comes back next round"],
      ["Backspace", "Clear the current selection"],
      ["F", "Flag this question — kept on the card, so the Flagged mode can drill it later"],
      ["R", "Review this session's flagged questions now"],
      ["S", "Suspend this card and skip it"],
      ["Esc", "End the session"],
      ["?", "Show this list"],
    ] as [string, string][],
    close: "Close",
    reviewFlagged: (n: number) => `Review flagged (${n})`,
    reviewing: "reviewing flagged",
    reviewComplete: "Review complete",
    reviewScore: (right: number, total: number) =>
      `${right} of ${total} flagged questions correct on review`,
    reviewNote: "Review passes never touch your schedule.",
    resumeSession: "Back to the session",
    backToSummary: "Back to the summary",
    flaggedTitle: (n: number) => `Flagged for review (${n})`,
    retiredNotice: (id: string) => `Question from ${id} retired — you will not see it again.`,
    undo: "Undo",
    stats: { due: "Due today", fresh: "New", leeches: "Leeches", pool: "In pool", retired: "Retired" },
    paceHint: (mmss: string) => `Exam pace: ${mmss} per item. Freezes when you check the answer.`,
    ease: { easy: "Easy", medium: "Medium", hard: "Hard" } as Record<"easy" | "medium" | "hard", string>,
    easeHint: {
      easy: "Retires the question: you will not see it again.",
      medium: "Comes back tomorrow.",
      hard: "Comes back in the next round.",
    } as Record<"easy" | "medium" | "hard", string>,
    ratePrompt: "How was it?",
    retiredPreview: "retired for good",
    wrongPreview: "A wrong answer comes back next round whatever you rate.",
    itemClock: "item",
    totalClock: "total",
    totalHint: (mmss: string, n: number) =>
      `Session budget: ${mmss} for ${n} items at exam pace. Runs until the session ends.`,
  },

  exam: {
    metaDescription: (items: number, minutes: number) =>
      `A timed ${items}-item practice form under ${minutes}-minute exam conditions.`,
    title: "Mock Exam",
    intro: (items: number, minutes: number, min: number, max: number, cut: number) =>
      `${items} items, ${minutes} minutes, scored on an estimated ${min}–${max} scale with the cut at ${cut}. The timer runs on wall-clock time: closing the tab does not pause it.`,
    facts: { items: "Items", minutes: "Minutes", pass: "Pass", attempts: "Attempts" },
    start: "Start the exam",
    bankPending:
      "The question bank is still being authored, so an exam cannot be assembled yet.",
    past: "Past attempts",
    correct: (raw: number, total: number) => `${raw}/${total} correct`,
    timedOut: "timed out",
    report: "Report",
    inProgress: "Attempt in progress",
    orphaned: "This attempt references questions that are no longer in the bank.",
    discard: "Discard it",
    timeRemaining: "Time remaining",
    minutesRemaining: (n: number) => `${n} minute${n === 1 ? "" : "s"} remaining`,
    answered: (n: number, total: number) => `${n}/${total} answered`,
    previous: "Previous",
    next: "Next",
    submitExam: "Submit exam",
    keys: "Keys: 1–6 select · ← → navigate · F flag",
    submitQuestion: "Submit for scoring?",
    submitSummary: (answered: number, unanswered: number, flagged: number) =>
      `${answered} answered · ${unanswered} unanswered · ${flagged} flagged`,
    unansweredWarning: "Unanswered items are scored as incorrect.",
    submit: "Submit",
    keepWorking: "Keep working",
    formA: "Form A — none of these items appear in drill, so this is a clean reading.",
    seenBefore: (seen: number, total: number) =>
      `${seen} of ${total} items you have seen before in drill.`,
    abandonConfirm: "Abandon this attempt? It will not be scored.",
    abandon: "Abandon attempt",
    navItem: (n: number, answered: boolean, flagged: boolean) =>
      `Question ${n}, ${answered ? "answered" : "unanswered"}${flagged ? ", flagged for review" : ""}`,
    legendAnswered: "answered",
    legendFlagged: "flagged",
  },

  result: {
    metaTitle: "Mock Exam Result",
    metaDescription: "Estimated scaled score and per-domain breakdown.",
    none: "No attempt to report",
    take: "Take a mock exam",
    eyebrow: "Mock exam result",
    pass: "Pass",
    fail: "Fail",
    scaledNote: (cut: number) => `estimated scaled score · cut at ${cut}`,
    scaledAria: (n: number) => `Scaled score ${n}`,
    summary: (raw: number, total: number, needed: number, minutes: number) =>
      `${raw} of ${total} correct · you needed ${needed} · ${minutes} min used`,
    timeExpired: "time expired",
    gap: (domain: string, pct: number, items: number, weight: string) =>
      `Your largest gap was ${domain} at ${pct}% on ${items} items — that is ${weight} of the exam.`,
    byDomain: "By domain",
    byDomainNote:
      "Weakest first. Domain percentages are diagnostic — the real exam bases pass or fail on the total scaled score alone.",
    ofExam: (weight: string) => `${weight} of the exam`,
    lowConfidence: (n: number) =>
      `only ${n} items, so treat this percentage as indicative only`,
    another: "Take another",
    drillWeak: "Drill your weak areas",
    dashboard: "Progress dashboard",
    estimateLead: "This score is an estimate, not a Pearson VUE score.",
    estimateBody: (total: number, cut: number, scaled: number) =>
      `The real exam is equated with item-response-theory difficulty parameters we do not have, and its guide describes the blueprint weights as the proportion of scored items — implying unscored pretest items we cannot model, so we score all ${total}. Our scale assumes the minimally qualified candidate answers 70% correctly and anchors the ${cut} cut there. A ${scaled} here is not a ${scaled} there. What it is good for is tracking your own trajectory across attempts.`,
  },
};
