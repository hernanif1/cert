"use client";

import { useSyncExternalStore } from "react";
import { KEY_DURABLE } from "@/lib/storage/keys";
import { readJSON, storageBlocked, writeRaw } from "@/lib/storage/safe-storage";
import { migrate } from "@/lib/storage/migrations";
import { EMPTY_STATE, type AppState } from "@/lib/storage/schema";

/**
 * Module-singleton store read through useSyncExternalStore.
 *
 * Why not a hook reading localStorage, or a Context provider:
 *
 *  - getServerSnapshot (the third argument) is what React uses during SSR AND
 *    during hydration. That makes a server/client mismatch structurally
 *    impossible, so no component needs a `mounted` boolean.
 *  - Cross-tab sync is free: the `storage` event is just another notify().
 *  - A Context provider re-renders its whole subtree on every write. With
 *    selector hooks, marking a lesson complete re-renders that checkmark and
 *    its domain ring — not a 63-question exam grid.
 *
 * `state` is replaced by reference only on write, so getSnapshot can return it
 * directly. Returning a freshly-parsed object here would loop forever.
 */

let state: AppState = EMPTY_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function load(): AppState {
  return migrate(readJSON<unknown>(KEY_DURABLE) ?? {});
}

if (typeof window !== "undefined") {
  state = load();
  hydrated = true;

  window.addEventListener("storage", (e) => {
    // Another tab wrote. `null` key means the whole store was cleared.
    if (e.key !== null && e.key !== KEY_DURABLE) return;
    state = load();
    notify();
  });
}

/* ───────────────────────────── Persistence ─────────────────────────── */

let flushTimer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;

function persistNow(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!dirty) return;
  dirty = false;
  if (state.readOnly) return; // never write back over a newer schema
  writeRaw(KEY_DURABLE, JSON.stringify(state));
}

function schedulePersist(): void {
  dirty = true;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(persistNow, 250);
}

if (typeof window !== "undefined") {
  // pagehide + visibilitychange, NOT beforeunload: beforeunload does not fire
  // reliably when mobile Safari kills a backgrounded tab.
  window.addEventListener("pagehide", persistNow);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) persistNow();
  });
}

/* ────────────────────────────── Mutation ───────────────────────────── */

/** Apply an immutable update. The updater must return a NEW object. */
export function mutate(fn: (s: AppState) => AppState): void {
  const next = fn(state);
  if (next === state) return;
  state = { ...next, updatedAt: Date.now() };
  if (!state.createdAt) state.createdAt = state.updatedAt;
  schedulePersist();
  notify();
}

/** Replace wholesale — used by import and reset. */
export function replaceState(next: AppState): void {
  state = { ...next, updatedAt: Date.now() };
  dirty = true;
  persistNow();
  notify();
}

export function snapshot(): AppState {
  return state;
}

/* ──────────────────────────────── Hooks ────────────────────────────── */

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): AppState => state;
const getServerSnapshot = (): AppState => EMPTY_STATE;

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * False during SSR and the first client render, true thereafter.
 *
 * Components gate their SKELETON on this — not on whether a value is zero.
 * Rendering a real "0/38" as a placeholder is a lie that then visibly jumps.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false,
  );
}

/** True when the browser is blocking site data, so the UI can say so once. */
export function useStorageBlocked(): boolean {
  const isHydrated = useHydrated();
  return isHydrated && storageBlocked();
}

export function useReadOnly(): boolean {
  return useAppState().readOnly === true;
}
