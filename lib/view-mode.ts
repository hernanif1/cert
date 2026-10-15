"use client";

import { useSyncExternalStore } from "react";

/**
 * Two independent view modes, both read from the DOM through
 * useSyncExternalStore because the DOM is where the truth lives:
 *
 * - Fullscreen belongs to the browser. Esc and F11 change it behind React's
 *   back, so the button follows `fullscreenchange` instead of its own clicks.
 * - Focus mode is a `data-focus` attribute on <html>. globals.css ("Focus
 *   mode") does all the hiding, so no layout component has to subscribe, and
 *   the attribute survives client-side navigation. It is per-visit on purpose:
 *   a reload always brings the navigation back.
 */
const never = () => () => {};

/* ── Fullscreen ──────────────────────────────────────────────────────────── */

function onFullscreenChange(notify: () => void) {
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
}

export function useFullscreen(): boolean {
  return useSyncExternalStore(
    onFullscreenChange,
    () => document.fullscreenElement !== null,
    () => false,
  );
}

/** False on the server and wherever the API is missing (iPhone Safari). */
export function useFullscreenSupported(): boolean {
  return useSyncExternalStore(
    never,
    () => document.fullscreenEnabled === true,
    () => false,
  );
}

export function toggleFullscreen(): void {
  const done = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
  // Rejected when the browser or an embedding iframe forbids it; the button
  // simply stays in its current state.
  done.catch(() => {});
}

/* ── Focus mode ──────────────────────────────────────────────────────────── */

const FOCUS_ATTR = "data-focus";
const focusListeners = new Set<() => void>();

function onFocusChange(notify: () => void) {
  focusListeners.add(notify);
  return () => {
    focusListeners.delete(notify);
  };
}

export function useFocusMode(): boolean {
  return useSyncExternalStore(
    onFocusChange,
    () => document.documentElement.hasAttribute(FOCUS_ATTR),
    () => false,
  );
}

export function setFocusMode(on: boolean): void {
  document.documentElement.toggleAttribute(FOCUS_ATTR, on);
  focusListeners.forEach((notify) => notify());
}
