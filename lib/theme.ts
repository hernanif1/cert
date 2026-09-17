"use client";

import { useSyncExternalStore } from "react";
import { KEY_DURABLE } from "@/lib/storage/keys";
import { readJSON, writeRaw } from "@/lib/storage/safe-storage";

export type Theme = "light" | "dark" | "system";

/**
 * Theme is stored as `settings.theme` inside the durable blob so there is one
 * place to export, import and reset. It is read through useSyncExternalStore
 * rather than an effect: that is what React uses during SSR *and* hydration,
 * so a mismatch between server ("system") and client ("dark") is impossible
 * without a `mounted` flag.
 */

function read(): Theme {
  const blob = readJSON<{ settings?: { theme?: Theme } }>(KEY_DURABLE);
  const t = blob?.settings?.theme;
  return t === "light" || t === "dark" || t === "system" ? t : "system";
}

function write(theme: Theme): void {
  const blob = readJSON<Record<string, unknown>>(KEY_DURABLE) ?? {};
  const settings = (blob.settings ?? {}) as Record<string, unknown>;
  writeRaw(
    KEY_DURABLE,
    JSON.stringify({ ...blob, settings: { ...settings, theme } }),
  );
}

/** Resolve "system" against the OS preference and apply the class. */
export function applyTheme(theme: Theme): void {
  const dark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

const listeners = new Set<() => void>();
let cached: Theme | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Returns a primitive, so a fresh call can never trigger a re-render loop.
function getSnapshot(): Theme {
  if (cached === null) cached = read();
  return cached;
}

function getServerSnapshot(): Theme {
  return "system";
}

export function setTheme(theme: Theme): void {
  cached = theme;
  write(theme);
  applyTheme(theme);
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
