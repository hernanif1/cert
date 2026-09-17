"use client";

import { mutate, useAppState } from "@/lib/storage/store";
import type { Theme } from "@/lib/theme-types";

export type { Theme };

/**
 * Theme lives at `settings.theme` inside the durable blob, and is read and
 * written through the store so there is exactly ONE writer to that key. An
 * independent read-modify-write here would race the store and clobber whichever
 * write landed second.
 *
 * ThemeScript reads the same path directly before first paint; that read is
 * safe precisely because it never writes.
 */

/** Resolve "system" against the OS preference and apply the class. */
export function applyTheme(theme: Theme): void {
  const dark =
    theme === "dark" ||
    (theme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme(): Theme {
  return useAppState().settings.theme;
}

export function setTheme(theme: Theme): void {
  mutate((s) => ({ ...s, settings: { ...s.settings, theme } }));
  applyTheme(theme);
}
