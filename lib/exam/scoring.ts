import { EXAM, ASSUMED_CUT_RAW } from "@/content/exam-facts";
import type { DomainNumber } from "@/content/schema";
import { DOMAINS } from "@/content/domains";

/**
 * Raw score → ESTIMATED scaled score.
 *
 * The real exam is criterion-referenced and equated with IRT per-item
 * difficulty parameters. Nobody outside Anthropic and Pearson has those tables,
 * so any mapping we write is an estimate. Rather than hide that behind a single
 * straight line, the function hinges on one declared assumption:
 *
 *   The minimally qualified candidate answers 70% of items correctly — the
 *   midpoint of the 65-75% range typical of criterion-referenced IT certs —
 *   and the published 720 cut score is anchored exactly there.
 *
 * Two linear segments meet at that hinge, which makes the assumption an
 * explicit, tunable number instead of an accident of the slope. A naive
 * 0-100% → 100-1000 line would put the cut at 68.9% raw *implicitly*.
 *
 * The exam guide also notes the blueprint weights describe the proportion of
 * SCORED items, implying unscored pretest items on the real form. We cannot
 * model those, so we score every item. Always label output as estimated.
 */
export function toScaledScore(correct: number, total: number = EXAM.itemCount): number {
  if (total <= 0) return EXAM.scaleMin;
  const raw = Math.min(1, Math.max(0, correct / total));
  const { scaleMin, scaleMax, passScaled } = EXAM;

  const scaled =
    raw <= ASSUMED_CUT_RAW
      ? scaleMin + (raw / ASSUMED_CUT_RAW) * (passScaled - scaleMin)
      : passScaled +
        ((raw - ASSUMED_CUT_RAW) / (1 - ASSUMED_CUT_RAW)) * (scaleMax - passScaled);

  return Math.round(Math.min(scaleMax, Math.max(scaleMin, scaled)));
}

export function passed(scaled: number): boolean {
  return scaled >= EXAM.passScaled;
}

/** Fewest correct answers that still passes. 45 of 63 under the 70% anchor. */
export function minimumCorrectToPass(total: number = EXAM.itemCount): number {
  for (let n = 0; n <= total; n++) {
    if (passed(toScaledScore(n, total))) return n;
  }
  return total;
}

export interface DomainResult {
  domain: DomainNumber;
  code: `D${DomainNumber}`;
  title: string;
  itemsPresented: number;
  correct: number;
  percent: number;
  blueprintWeight: number;
  /**
   * D7 contributes only 4 items, so a single item moves the number 25 points.
   * The real score report has this problem and does not warn you; we do.
   */
  lowConfidence: boolean;
}

const LOW_CONFIDENCE_BELOW = 8;

export function domainResults(
  byDomain: Record<DomainNumber, { correct: number; total: number }>,
): DomainResult[] {
  return DOMAINS.map((d) => {
    const r = byDomain[d.id] ?? { correct: 0, total: 0 };
    return {
      domain: d.id,
      code: d.code,
      title: d.title,
      itemsPresented: r.total,
      correct: r.correct,
      percent: r.total === 0 ? 0 : Math.round((r.correct / r.total) * 100),
      blueprintWeight: d.weight,
      lowConfidence: r.total > 0 && r.total < LOW_CONFIDENCE_BELOW,
    };
  });
}
