/**
 * Leitner engine checks. The cram guard in particular: getting it wrong means
 * a user who crams the night before silently pushes their whole deck 30 days.
 */
import {
  INTERVAL_DAYS,
  LEECH_LAPSES,
  SUSPEND_LAPSES,
  MASTERY_BOX,
  grade,
  isDue,
  isMastered,
  newCard,
  startOfLocalDay,
  endOfLocalDay,
} from "../lib/drill/leitner";
import type { CardState } from "../lib/storage/schema";

let failures = 0;
function check(name: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : "FAIL  "} ${name}${detail ? ` — ${detail}` : ""}`);
}

const DAY = 86_400_000;
const NOW = new Date("2026-09-17T14:30:00").getTime();

/* Promotion ladder */
let card = newCard();
const ladder: number[] = [];
for (let i = 0; i < 6; i++) {
  const r = grade(card, true, { now: NOW });
  card = r.card;
  ladder.push(card.b);
}
// Box 1 is relearning, so a new card promotes straight to box 2 (one day).
check("a new card promotes to box 2, skipping relearning", ladder[0] === 2, String(ladder[0]));
check("correct answers then walk to 6", ladder.join(",") === "2,3,4,5,6,6", ladder.join(","));
check(
  "a relapsed card does pass through box 1",
  grade({ ...newCard(), b: 2 }, false, { now: NOW }).card.b === 1,
);
check("box caps at 6", grade(card, true, { now: NOW }).card.b === 6);

/* Self-rated ease: easy retires, hard repeats, medium is the ladder. */
const retired = grade({ ...newCard(), b: 2, fl: 1 }, true, { now: NOW, ease: "easy" });
check("easy retires the card to the top box", retired.card.b === 6 && retired.retired);
check("a retired card is marked known", retired.card.kn === 1);
check("a retired card is never due", !isDue(retired.card, NOW + 365 * DAY));
check("a retired card still counts as mastered", isMastered(retired.card));
check("retiring clears the leech flag", retired.card.fl === undefined);
check("retiring is reversible by restoring the old card", !isMastered({ ...newCard(), b: 2 }));
const hard = grade({ ...newCard(), b: 3 }, true, { now: NOW, ease: "hard" });
check("hard drops one box", hard.card.b === 2);
check("hard comes back next round", hard.card.due === NOW && isDue(hard.card, NOW));
check("hard on a new card goes to relearning", grade(newCard(), true, { now: NOW, ease: "hard" }).card.b === 1);
check("hard still counts as correct", grade({ ...newCard(), b: 3 }, true, { now: NOW, ease: "hard" }).card.c === 1);
const medium = grade({ ...newCard(), b: 2 }, true, { now: NOW, ease: "medium" });
check("medium climbs one box", medium.card.b === 3);
check("medium comes back tomorrow, whatever the box", medium.intervalDays === 1 && medium.card.due === startOfLocalDay(NOW + DAY));
check("unrated answers keep the spaced ladder", grade({ ...newCard(), b: 2 }, true, { now: NOW }).intervalDays === INTERVAL_DAYS[3]);
check("a wrong answer ignores the rating", grade({ ...newCard(), b: 4 }, false, { now: NOW, ease: "easy" }).card.b === 2);
check("cram ignores the rating", grade({ ...newCard(), b: 2 }, true, { cram: true, now: NOW, ease: "easy" }).card.b === 2);
check("box 4 is mastered", isMastered({ ...newCard(), b: 4 }));
check("box 3 is not mastered", !isMastered({ ...newCard(), b: 3 }));
check(
  "a leech at box 4 is not mastered",
  !isMastered({ ...newCard(), b: 4, fl: 1 }),
);

/* Intervals and day alignment */
const atBox3 = grade({ ...newCard(), b: 2, r: 2, c: 2 }, true, { now: NOW });
check("box 2 → 3 schedules 3 days", atBox3.intervalDays === INTERVAL_DAYS[3]);
check(
  "due dates are aligned to local midnight",
  atBox3.card.due === startOfLocalDay(NOW + 3 * DAY),
  new Date(atBox3.card.due).toISOString(),
);
const lateNight = new Date("2026-09-17T23:45:00").getTime();
const earlyNext = new Date("2026-09-18T00:15:00").getTime();
check(
  "11:45pm and 12:15am do not differ by a whole extra day",
  Math.abs(
    grade({ ...newCard(), b: 2 }, true, { now: lateNight }).card.due -
      grade({ ...newCard(), b: 2 }, true, { now: earlyNext }).card.due,
  ) <= DAY,
);

/* Demotion */
const demoted = grade({ ...newCard(), b: 5, r: 9, c: 9, st: 5 }, false, { now: NOW });
check("a wrong answer demotes by two, not to zero", demoted.card.b === 3, String(demoted.card.b));
check("a wrong answer clears the streak", demoted.card.st === 0);
check("a wrong answer is due immediately", demoted.card.due === NOW);
check("box 1 cannot demote below 1", grade({ ...newCard(), b: 1 }, false, { now: NOW }).card.b === 1);

/* Leech and suspend */
let leech: CardState = { ...newCard(), b: 3 };
let becameLeechAt = 0;
let becameSuspendedAt = 0;
for (let i = 1; i <= SUSPEND_LAPSES; i++) {
  const r = grade(leech, false, { now: NOW });
  leech = r.card;
  if (r.becameLeech) becameLeechAt = i;
  if (r.becameSuspended) becameSuspendedAt = i;
}
check(`leech flag raised at lapse ${LEECH_LAPSES}`, becameLeechAt === LEECH_LAPSES, String(becameLeechAt));
check(`suspended at lapse ${SUSPEND_LAPSES}`, becameSuspendedAt === SUSPEND_LAPSES, String(becameSuspendedAt));
check("a suspended card is never due", !isDue(leech, NOW));

/* THE CRAM GUARD */
const scheduled: CardState = {
  ...newCard(), b: 5, due: startOfLocalDay(NOW + 14 * DAY), r: 8, c: 8, st: 4,
};
const crammedRight = grade(scheduled, true, { cram: true, now: NOW });
check("cram does not change the box", crammedRight.card.b === scheduled.b);
check("cram does not change the due date", crammedRight.card.due === scheduled.due,
  `${new Date(crammedRight.card.due).toISOString()} vs ${new Date(scheduled.due).toISOString()}`);
check("cram still counts the rep", crammedRight.card.r === scheduled.r + 1);

const crammedWrong = grade(scheduled, false, { cram: true, now: NOW });
check("a wrong cram answer does not demote", crammedWrong.card.b === scheduled.b);
check("a wrong cram answer does not add a lapse", crammedWrong.card.l === scheduled.l);
check("a wrong cram answer does not reschedule", crammedWrong.card.due === scheduled.due);

/* Due-today semantics */
check(
  "a card due later today is due now",
  isDue({ ...newCard(), b: 2, due: endOfLocalDay(NOW) - 1000 }, NOW),
);
check(
  "a card due tomorrow is not due today",
  !isDue({ ...newCard(), b: 2, due: startOfLocalDay(NOW + DAY) + 1000 }, NOW),
);
check("a new card is due", isDue(newCard(), NOW));
check("MASTERY_BOX is 4", MASTERY_BOX === 4);

console.log(failures === 0 ? "\nall drill checks passed" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
