/**
 * Facts transcribed from docs/exam-guide.pdf §5 "Exam Details at a Glance"
 * (Claude Certification Program, CCAR-P Exam Guide v1.0, effective July 2026).
 * Single source of truth — never restate these inline in a component.
 */
export const EXAM = {
  credential: "Claude Certified Architect – Professional",
  code: "CCAR-P",
  guideVersion: "1.0",
  effective: "July 2026",
  itemCount: 63,
  minutes: 120,
  scaleMin: 100,
  scaleMax: 1000,
  passScaled: 720,
  feeUsd: 175,
  validityMonths: 12,
  delivery: "Proctored — online or Pearson VUE test center",
  itemFormat:
    "Multiple-choice and multiple-response; each item states how many responses to select",
} as const;

/**
 * The cut score is a scaled 720, but the raw-percent it corresponds to is not
 * published. We anchor our estimate at 70% and say so wherever a score is shown.
 * See lib/exam/scoring.ts.
 */
export const ASSUMED_CUT_RAW = 0.7;
