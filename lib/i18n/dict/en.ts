import { toolsEn } from "@/lib/i18n/dict/tools-en";

/**
 * English UI strings — the source of truth for the dictionary SHAPE.
 * `Dict` is derived from this object, so a key added here is a type error in
 * every other locale until it is translated.
 *
 * Metadata-only (a few KB): safe to import from client components.
 */
export const en = {
  tools: toolsEn,
  brand: "Claude Certified",
  skipToContent: "Skip to content",

  nav: {
    primary: "Primary",
    curriculum: "Curriculum",
    overview: "Overview",
    practice: "Practice",
    studyTools: "Study Tools",
    mockExam: "Mock Exam",
    mockExamHint: "63 timed items under exam conditions",
    takeMockExam: "Take Mock Exam",
    progress: "Progress Dashboard",
    progressHint: "Readiness, coverage and drill mastery",
    drill: "Drill Mode",
    drillHint: "Spaced repetition across the question bank",
    checklist: "Readiness Checklist",
    checklistHint: "Self-assessment you tick off yourself",
    flagged: "Flagged Questions",
    flaggedHint: "Everything you flagged, with a prompt to study them",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    allDomains: "All domains",
    domainOverview: "Domain overview",
    showLessons: (title: string) => `Show lessons in ${title}`,
    hideLessons: (title: string) => `Hide lessons in ${title}`,
    lessonsCount: (n: number) => `${n} lessons`,
    weightOfExam: (pct: string) => `${pct} of the exam`,
  },

  theme: {
    label: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
    aria: (current: string) => `Theme: ${current}. Click to change.`,
  },

  language: {
    label: "Language",
    aria: (current: string) => `Language: ${current}`,
  },

  search: {
    label: "Search",
    open: (shortcut: string) => `Search (${shortcut})`,
    placeholder: "Search lessons, sections, key terms, exam traps…",
    loading: "Loading the index…",
    error: "Search is unavailable right now. Close and try again.",
    jumpTo: "Jump to",
    noResults: (q: string) => `No results for “${q}”.`,
    topHit: "Top hit",
    results: "Search results",
    kinds: {
      lesson: "Lessons",
      section: "Sections",
      term: "Key terms",
      trap: "Exam traps",
      domain: "Domains",
      page: "Pages",
    },
    keys: { navigate: "to navigate", open: "to open", close: "to close" },
  },

  view: {
    enterFullscreen: "Enter full screen",
    exitFullscreen: "Exit full screen",
    enterFocus: "Focus mode: hide navigation",
    exitFocus: "Exit focus mode (Esc)",
  },

  footer: {
    disclaimer:
      "Unofficial study material. Not affiliated with, licensed by, or endorsed by Anthropic or Pearson VUE. Lessons are written from the published exam guide objectives and public documentation; no practice question is drawn from the live item bank, and practice scores are estimates that are not comparable to a real scaled score.",
    builtFrom: (code: string, version: string, effective: string) =>
      `Built from the ${code} Exam Guide v${version} (${effective}).`,
  },

  storageBlocked:
    "Your browser is blocking site data, so progress won’t be saved between visits.",

  home: {
    eyebrow: "Unofficial study guide",
    intro:
      "Seven weighted domains, thirty-eight objectives, and a spaced-repetition drill built directly from the published exam blueprint. Everything runs in your browser; your progress never leaves this device.",
    start: "Start studying",
    progress: "Progress dashboard",
    facts: {
      items: "Items",
      timeLimit: "Time limit",
      minutes: (n: number) => `${n} minutes`,
      passingScore: "Passing score",
      passOf: (pass: number, max: number) => `${pass} of ${max}`,
      fee: "Exam fee",
      validity: "Validity",
      months: (n: number) => `${n} months`,
      code: "Exam code",
    },
  },

  learn: {
    metaTitle: "Curriculum",
    metaDescription: (domains: number, lessons: number, code: string) =>
      `All ${domains} domains and ${lessons} objectives of the ${code} exam blueprint.`,
    eyebrow: "Curriculum",
    intro:
      "Seven content domains, weighted exactly as the published blueprint weights them. Each objective below is one lesson.",
    facts: {
      items: "Items",
      time: "Time",
      min: (n: number) => `${n} min`,
      pass: "Pass",
      domains: "Domains",
      objectives: "Objectives",
    },
    domainMeta: (lessons: number, mock: number, total: number) =>
      `${lessons} lessons · ${mock} of ${total} mock items`,
  },

  domain: {
    back: "Curriculum",
    meta: (lessons: number, mock: number, total: number) =>
      `${lessons} lessons · contributes ${mock} of ${total} items to a mock form`,
    taskStatements: "Task statements",
    drill: "Drill this domain",
  },

  lesson: {
    breadcrumb: "Breadcrumb",
    learn: "Learn",
    domain: (n: number) => `Domain ${n}`,
    task: (id: string) => `Task ${id}`,
    readingTime: (min: number) => `${min} min read`,
    objective: "Objective",
    markComplete: "Mark complete",
    completed: "Completed",
    keyTerms: "Key terms",
    sources: "Sources",
    examTraps: "Exam Traps",
    takeaway: "Takeaway",
    notWritten:
      "This lesson has not been written yet. The route, navigation and progress tracking all work — only the prose is pending.",
    drillDomain: "Drill this domain",
    allOf: (title: string) => `All of ${title}`,
    pager: "Lesson navigation",
    previous: "Previous",
    next: "Next",
    onThisPage: "On this page",
    backToTop: "Back to top",
    linkToSection: (title: string) => `Link to section: ${title}`,
    seeDefinition: "See the definition under Key terms",
    opensInNewTab: "opens in a new tab",
    readingProgress: "Reading progress",
  },

  callout: {
    "key-concept": "Key Concept",
    "exam-distractor": "Common Exam Distractor",
    pitfall: "Pitfall",
    note: "Note",
  },

  practice: {
    title: "Practice Scenario",
    englishNote: "",
    check: "Check answer",
    next: "Next question",
    seeResult: "See result",
    restart: "Start over",
    score: (right: number, total: number) => `${right} of ${total} correct`,
    progressAria: "Practice progress",
    questionState: (n: number, state: string) => `Question ${n}: ${state}`,
    state: {
      pending: "not answered",
      correct: "correct",
      incorrect: "incorrect",
    },
    drillDomain: "Drill this domain",
    boxMove: (from: number, to: number, when: string) =>
      `Box ${from} → ${to} · next review ${when}`,
    interval: {
      again: "again this session",
      tomorrow: "tomorrow",
      inDays: (n: number) => `in ${n} days`,
    },
  },

  question: {
    counter: (i: number, total: number) => `Question ${i} of ${total}`,
    select: (word: string) => `Select ${word}.`,
    numberWord: { 2: "TWO", 3: "THREE" } as Record<number, string>,
    flag: "Flag",
    flagged: "Flagged",
    flagAria: "Flag for review",
    unflagAria: "Remove review flag",
    choices: "Answer choices",
    missed: "You missed this one.",
    correct: "Correct",
    notQuite: "Not quite",
  },

  progressUi: {
    completedTitle: "Completed",
    lessonsOf: (done: number, total: number) => `${done} of ${total} lessons`,
    lessonsComplete: (done: number, total: number) =>
      `${done} of ${total} lessons complete`,
  },

  notFound: {
    title: "Page not found",
    body: "That page is not part of the curriculum.",
    back: "Back to the curriculum",
  },
};

export type Dict = typeof en;
