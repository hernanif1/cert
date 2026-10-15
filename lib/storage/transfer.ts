"use client";

import { CURRENT_SCHEMA_VERSION, KEY_ATTEMPT } from "@/lib/storage/keys";
import { removeRaw } from "@/lib/storage/safe-storage";
import { migrate } from "@/lib/storage/migrations";
import { EMPTY_STATE, type AppState } from "@/lib/storage/schema";
import { replaceState, snapshot } from "@/lib/storage/store";

const APP_TAG = "ccarp-study";

export interface Envelope {
  app: string;
  exportedAt: number;
  schemaVersion: number;
  state: AppState;
}

export function exportFilename(at: number = Date.now()): string {
  const d = new Date(at);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `ccarp-progress-${d.getFullYear()}-${m}-${day}.json`;
}

/** Download the durable blob wrapped in an envelope an import can sanity-check. */
export function exportProgress(): void {
  const envelope: Envelope = {
    app: APP_TAG,
    exportedAt: Date.now(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    state: snapshot(),
  };
  const blob = new Blob([JSON.stringify(envelope, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Release the blob, otherwise it is pinned for the life of the document.
  URL.revokeObjectURL(url);
}

export interface ImportPreview {
  state: AppState;
  lessonsInFile: number;
  lessonsNow: number;
  checksInFile: number;
  checksNow: number;
  cardsInFile: number;
  cardsNow: number;
  attemptsInFile: number;
  attemptsNow: number;
}

function countCompleted(s: AppState): number {
  return Object.values(s.lessons).filter((l) => l.completedAt).length;
}

/** Parse and validate without applying, so the UI can show a diff first. */
export function parseImport(text: string): ImportPreview {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  const env = parsed as Partial<Envelope>;
  if (!env || typeof env !== "object" || env.app !== APP_TAG) {
    throw new Error("That file was not exported from this study guide.");
  }

  // Run the same ladder as a normal load, so an older export still imports.
  const state = migrate(env.state ?? {});
  const now = snapshot();

  return {
    state,
    lessonsInFile: countCompleted(state),
    lessonsNow: countCompleted(now),
    checksInFile: Object.keys(state.checklist).length,
    checksNow: Object.keys(now.checklist).length,
    cardsInFile: Object.keys(state.drill.cards).length,
    cardsNow: Object.keys(now.drill.cards).length,
    attemptsInFile: state.examHistory.length,
    attemptsNow: now.examHistory.length,
  };
}

export function applyImportReplace(state: AppState): void {
  replaceState({ ...state, readOnly: undefined });
}

/** Union of completions, keeping the EARLIER timestamp for anything in both. */
export function applyImportMerge(incoming: AppState): void {
  const current = snapshot();
  const lessons = { ...current.lessons };

  for (const [slug, l] of Object.entries(incoming.lessons)) {
    const mine = lessons[slug];
    if (!mine) {
      lessons[slug] = l;
      continue;
    }
    const completedAt =
      mine.completedAt && l.completedAt
        ? Math.min(mine.completedAt, l.completedAt)
        : (mine.completedAt ?? l.completedAt);
    lessons[slug] = {
      completedAt,
      viewedAt: Math.min(mine.viewedAt || Infinity, l.viewedAt || Infinity) || 0,
    };
  }

  // Union of ticks, keeping the EARLIER timestamp — same rule as lessons.
  const checklist = { ...current.checklist };
  for (const [id, at] of Object.entries(incoming.checklist)) {
    const mine = checklist[id];
    checklist[id] = mine ? Math.min(mine, at) : at;
  }

  // Keep whichever card is further along; ties go to the more recent answer.
  const cards = { ...current.drill.cards };
  for (const [id, incomingCard] of Object.entries(incoming.drill.cards)) {
    const mine = cards[id];
    if (!mine || incomingCard.b > mine.b || incomingCard.last > mine.last) {
      cards[id] = incomingCard;
    }
  }

  const attempts = [...current.examHistory, ...incoming.examHistory]
    .filter((a, i, all) => all.findIndex((b) => b.id === a.id) === i)
    .sort((a, b) => a.submittedAt - b.submittedAt)
    .slice(-20);

  replaceState({
    ...current,
    lessons,
    checklist,
    drill: { ...current.drill, cards },
    examHistory: attempts,
    readOnly: undefined,
  });
}

/** Wipe durable state AND any in-flight exam attempt. */
export function resetProgress(): void {
  removeRaw(KEY_ATTEMPT);
  replaceState({ ...EMPTY_STATE, createdAt: Date.now() });
}
