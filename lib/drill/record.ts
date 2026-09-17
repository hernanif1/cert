"use client";

import type { QuestionId } from "@/content/schema";
import { mutate } from "@/lib/storage/store";
import { localDayKey } from "@/lib/storage/schema";
import { grade, newCard, type GradeResult } from "@/lib/drill/leitner";

/**
 * Record an answer against a question's drill card.
 *
 * Called from every consumer — lesson practice, drill mode, and the mock exam
 * review — so answering a lesson's practice scenario seeds your drill deck.
 * One question, one id, one card, wherever you met it.
 */
export function recordAnswer(
  questionId: QuestionId,
  correct: boolean,
  options: { cram?: boolean } = {},
): GradeResult {
  const now = Date.now();
  let result!: GradeResult;

  mutate((s) => {
    const existing = s.drill.cards[questionId] ?? newCard();
    const wasNew = existing.r === 0;
    result = grade(existing, correct, { cram: options.cram, now });

    const today = localDayKey(now);
    const daily =
      s.drill.daily.date === today
        ? s.drill.daily
        : { date: today, newIntroduced: 0, reviewsDone: 0 };

    const streak = updateStreak(s.drill.streak, today);

    return {
      ...s,
      drill: {
        ...s.drill,
        cards: { ...s.drill.cards, [questionId]: result.card },
        daily: {
          ...daily,
          newIntroduced: daily.newIntroduced + (wasNew && !options.cram ? 1 : 0),
          reviewsDone: daily.reviewsDone + 1,
        },
        streak,
      },
    };
  });

  return result;
}

/** Calendar-day streak. One missed day breaks it — no freezes, which are an
 *  engagement gimmick that corrupts the signal. */
function updateStreak(
  streak: { current: number; longest: number; lastStudyDate: string },
  today: string,
): { current: number; longest: number; lastStudyDate: string } {
  if (streak.lastStudyDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const m = String(yesterday.getMonth() + 1).padStart(2, "0");
  const d = String(yesterday.getDate()).padStart(2, "0");
  const yKey = `${yesterday.getFullYear()}-${m}-${d}`;

  const current = streak.lastStudyDate === yKey ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastStudyDate: today,
  };
}

export function setBookmarked(questionId: QuestionId, bookmarked: boolean): void {
  mutate((s) => {
    const card = s.drill.cards[questionId] ?? newCard();
    const next = { ...card };
    if (bookmarked) next.bm = 1;
    else delete next.bm;
    return { ...s, drill: { ...s.drill, cards: { ...s.drill.cards, [questionId]: next } } };
  });
}

export function setSuspended(questionId: QuestionId, suspended: boolean): void {
  mutate((s) => {
    const card = s.drill.cards[questionId] ?? newCard();
    const next = { ...card };
    if (suspended) next.sp = 1;
    else {
      delete next.sp;
      // Unsuspending puts the card back in circulation immediately.
      next.due = Date.now();
      next.b = Math.max(1, next.b) as typeof next.b;
    }
    return { ...s, drill: { ...s.drill, cards: { ...s.drill.cards, [questionId]: next } } };
  });
}
