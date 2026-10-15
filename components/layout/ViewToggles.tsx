"use client";

import { useEffect } from "react";
import {
  setFocusMode,
  toggleFullscreen,
  useFocusMode,
  useFullscreen,
  useFullscreenSupported,
} from "@/lib/view-mode";
import { useDict } from "@/lib/i18n/client";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

function ToggleButton({
  label,
  icon,
  pressed,
  onClick,
}: {
  label: string;
  icon: IconName;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border transition-colors",
        pressed
          ? "border-accent/60 bg-accent-soft text-fg"
          : "border-border text-fg-muted hover:border-accent/60 hover:text-fg",
      )}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

/** Browser fullscreen. Renders nothing where the API is unavailable, so there
 *  is never a dead button. */
export function FullscreenToggle() {
  const t = useDict().view;
  const supported = useFullscreenSupported();
  const on = useFullscreen();
  if (!supported) return null;

  return (
    <ToggleButton
      label={on ? t.exitFullscreen : t.enterFullscreen}
      icon={on ? "minimize" : "maximize"}
      pressed={on}
      onClick={toggleFullscreen}
    />
  );
}

/** Focus mode: hides everything but the page content, the language menu and
 *  these two buttons.
 *  The hiding itself is CSS — see "Focus mode" in globals.css. */
export function FocusToggle() {
  const t = useDict().view;
  const on = useFocusMode();

  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      // Only the language menu competes for Escape here: the other menus and
      // the drawer are hidden in focus mode, and in fullscreen the browser
      // takes it first. An open menu gets the key; the next press leaves.
      if (e.key !== "Escape") return;
      if (document.querySelector('[data-topbar] [aria-expanded="true"]')) return;
      setFocusMode(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [on]);

  return (
    <ToggleButton
      label={on ? t.exitFocus : t.enterFocus}
      icon="focus"
      pressed={on}
      onClick={() => setFocusMode(!on)}
    />
  );
}
