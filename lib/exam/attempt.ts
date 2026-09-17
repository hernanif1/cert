"use client";

import { useSyncExternalStore } from "react";
import { EXAM } from "@/content/exam-facts";
import type { ChoiceId, DomainNumber, Question } from "@/content/schema";
import { getQuestion } from "@/content/questions";
import { KEY_ATTEMPT } from "@/lib/storage/keys";
import { readJSON, removeRaw, writeRaw } from "@/lib/storage/safe-storage";
import { mutate } from "@/lib/storage/store";
import { MAX_EXAM_HISTORY, type AppState, type MockAttempt } from "@/lib/storage/schema";
import { sampleForm } from "@/lib/exam/sampler";
import { isAnswerCorrect } from "@/components/question/QuestionCard";
import { toScaledScore, passed } from "@/lib/exam/scoring";

/**
 * The in-flight attempt, in its own storage key.
 *
 * It is written on every answer, flag and cursor move — roughly 200 times per
 * exam — and is worthless the moment it is submitted. Keeping it out of the
 * durable blob means a corrupt or oversized attempt cannot take 38 lessons of
 * study progress with it, and "abandon exam" is a single removeItem.
 */
export interface ActiveAttempt {
  id: string;
  seed: number;
  startedAt: number;
  /** startedAt + 120min. AUTHORITATIVE — never recomputed from elapsed ticks. */
  deadlineAt: number;
  questionIds: string[];
  answers: Record<string, ChoiceId[]>;
  flagged: string[];
  cursor: number;
  isFormA: boolean;
}

let active: ActiveAttempt | null = null;
let loaded = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function load(): ActiveAttempt | null {
  const raw = readJSON<ActiveAttempt>(KEY_ATTEMPT);
  if (!raw || !Array.isArray(raw.questionIds) || raw.questionIds.length === 0) {
    return null;
  }
  return raw;
}

if (typeof window !== "undefined") {
  active = load();
  loaded = true;
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function persistNow(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (active) writeRaw(KEY_ATTEMPT, JSON.stringify(active));
  else removeRaw(KEY_ATTEMPT);
}

function schedulePersist(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(persistNow, 300);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", persistNow);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) persistNow();
  });
}

function update(fn: (a: ActiveAttempt) => ActiveAttempt): void {
  if (!active) return;
  active = fn(active);
  schedulePersist();
  notify();
}

/* ─────────────────────────────── Lifecycle ─────────────────────────── */

export function startAttempt(state: AppState): ActiveAttempt | null {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const { questionIds, isFormA } = sampleForm(state, seed);
  if (questionIds.length === 0) return null;

  const startedAt = Date.now();
  active = {
    id: `m${startedAt.toString(36)}`,
    seed,
    startedAt,
    deadlineAt: startedAt + EXAM.minutes * 60_000,
    questionIds,
    answers: {},
    flagged: [],
    cursor: 0,
    isFormA,
  };
  persistNow();
  notify();
  return active;
}

export function abandonAttempt(): void {
  active = null;
  persistNow();
  notify();
}

export function answer(questionId: string, choices: ChoiceId[]): void {
  update((a) => ({ ...a, answers: { ...a.answers, [questionId]: choices } }));
}

export function toggleFlag(questionId: string): void {
  update((a) => ({
    ...a,
    flagged: a.flagged.includes(questionId)
      ? a.flagged.filter((id) => id !== questionId)
      : [...a.flagged, questionId],
  }));
}

export function goTo(index: number): void {
  update((a) => ({
    ...a,
    cursor: Math.min(a.questionIds.length - 1, Math.max(0, index)),
  }));
}

/* ─────────────────────────────── Grading ───────────────────────────── */

export function gradeAttempt(
  attempt: ActiveAttempt,
  timedOut: boolean,
  lookup: (id: string) => Question | undefined = (id) =>
    getQuestion(id as Question["id"]),
): MockAttempt {
  const byDomain = {} as MockAttempt["byDomain"];
  const questionIds: MockAttempt["questionIds"] = [];
  const correctness: boolean[] = [];
  let raw = 0;

  for (const id of attempt.questionIds) {
    const q = lookup(id);
    if (!q) continue;
    const ok = isAnswerCorrect(q, attempt.answers[id] ?? []);
    if (ok) raw++;
    questionIds.push(q.id);
    correctness.push(ok);

    const d = q.domain as DomainNumber;
    const bucket = byDomain[d] ?? { correct: 0, total: 0 };
    byDomain[d] = { correct: bucket.correct + (ok ? 1 : 0), total: bucket.total + 1 };
  }

  const total = questionIds.length;
  const scaled = toScaledScore(raw, total);
  const submittedAt = Date.now();

  return {
    id: attempt.id,
    seed: attempt.seed,
    startedAt: attempt.startedAt,
    submittedAt,
    durationMs: submittedAt - attempt.startedAt,
    timedOut,
    raw,
    total,
    scaled,
    passed: passed(scaled),
    byDomain,
    questionIds,
    correctness,
  };
}

/** Grade, push to history, clear the in-flight key. Returns the attempt id. */
export function submitAttempt(timedOut = false): string | null {
  if (!active) return null;
  const graded = gradeAttempt(active, timedOut);

  mutate((s) => ({
    ...s,
    examHistory: [...s.examHistory, graded].slice(-MAX_EXAM_HISTORY),
  }));

  active = null;
  persistNow();
  notify();
  return graded.id;
}

/* ──────────────────────────────── Hooks ────────────────────────────── */

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useActiveAttempt(): ActiveAttempt | null {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => null,
  );
}

export function useAttemptLoaded(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => loaded,
    () => false,
  );
}

export function answeredCount(a: ActiveAttempt): number {
  return a.questionIds.filter((id) => (a.answers[id]?.length ?? 0) > 0).length;
}
