"use client";

import { useEffect } from "react";
import { applyTheme, setTheme, useTheme, type Theme } from "@/lib/theme";
import { useDict } from "@/lib/i18n/client";
import { Menu } from "@/components/ui/Menu";
import { Icon, type IconName } from "@/components/ui/Icon";

const ORDER: Theme[] = ["system", "light", "dark"];
const GLYPH: Record<Theme, IconName> = {
  system: "monitor",
  light: "sun",
  dark: "moon",
};

export function ThemeToggle() {
  const theme = useTheme();
  const t = useDict().theme;

  // Keep "system" honest when the OS preference flips mid-session.
  // Subscribe only — no setState, the class is an external system.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(theme);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [theme]);

  return (
    <Menu
      label={`${t.label}: ${t[theme]}`}
      trigger={
        <>
          <Icon name={GLYPH[theme]} size={15} />
          <span className="hidden xl:inline">{t[theme]}</span>
        </>
      }
      items={ORDER.map((value) => ({
        key: value,
        label: t[value],
        icon: GLYPH[value],
        selected: value === theme,
        onSelect: () => setTheme(value),
      }))}
    />
  );
}
