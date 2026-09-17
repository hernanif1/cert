"use client";

import { useEffect } from "react";
import { applyTheme, setTheme, useTheme, type Theme } from "@/lib/theme";

const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};
const GLYPH: Record<Theme, string> = {
  system: "◐",
  light: "○",
  dark: "◑",
};

export function ThemeToggle() {
  const theme = useTheme();

  // Keep "system" honest when the OS preference flips mid-session.
  // Subscribe only — no setState, the class is an external system.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(theme);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-accent hover:text-fg"
      aria-label={`Theme: ${LABEL[theme]}. Click to change.`}
      title={`Theme: ${LABEL[theme]}`}
    >
      <span aria-hidden="true">{GLYPH[theme]}</span>
      <span className="ml-1.5 hidden sm:inline">{LABEL[theme]}</span>
    </button>
  );
}
