import { DOMAINS } from "@/content/domains";
import { EXAM } from "@/content/exam-facts";
import type { DomainNumber } from "@/content/schema";

/**
 * Per-domain item counts for a 63-item form, from largest-remainder rounding of
 * 63 x weight. They land on an exact integer partition — no fudging:
 *
 *   D1 10.71→11  D2 8.19→8  D3 11.97→12  D4 10.08→10
 *   D5  8.82→ 9  D6 8.82→9  D7  4.41→ 4            = 63
 *
 * Effective weights come within 0.6pp of the blueprint everywhere.
 */
export const BLUEPRINT: Record<DomainNumber, number> = DOMAINS.reduce(
  (acc, d) => {
    acc[d.id] = d.mockItemCount;
    return acc;
  },
  {} as Record<DomainNumber, number>,
);

export const BLUEPRINT_TOTAL = Object.values(BLUEPRINT).reduce((a, b) => a + b, 0);

if (BLUEPRINT_TOTAL !== EXAM.itemCount) {
  throw new Error(
    `Blueprint sums to ${BLUEPRINT_TOTAL}, expected ${EXAM.itemCount}. Fix content/domains.ts.`,
  );
}
