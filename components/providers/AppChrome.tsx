"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * The single client boundary wrapping the app.
 *
 * It deliberately does NOT provide study state: that lives in a module
 * singleton read through useSyncExternalStore (lib/storage/store.ts), so a
 * write re-renders only the components that select the changed slice rather
 * than this entire subtree.
 */
type ChromeValue = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const ChromeContext = createContext<ChromeValue | null>(null);

export function useChrome(): ChromeValue {
  const v = useContext(ChromeContext);
  if (!v) throw new Error("useChrome must be used inside <AppChrome>");
  return v;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <ChromeContext.Provider value={{ navOpen, setNavOpen }}>
      {children}
    </ChromeContext.Provider>
  );
}
