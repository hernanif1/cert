"use client";

import { useEffect } from "react";
import { useChrome } from "@/components/providers/AppChrome";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { cn } from "@/lib/cn";

/** Fixed rail on desktop; a dismissible drawer below lg. */
export function SidebarShell() {
  const { navOpen, setNavOpen } = useChrome();

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen, setNavOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        className="mb-4 rounded-md border border-border px-3 py-1.5 text-xs font-medium lg:hidden"
        aria-expanded={navOpen}
      >
        ☰ Curriculum
      </button>

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/40 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "z-50 shrink-0 border-border bg-surface-2 lg:sticky lg:top-14 lg:block lg:w-64 lg:self-start lg:border-r lg:bg-transparent",
          "lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:pr-3",
          navOpen
            ? "fixed inset-y-0 left-0 w-72 overflow-y-auto border-r p-4"
            : "hidden",
        )}
      >
        <SidebarNav onNavigate={() => setNavOpen(false)} />
      </aside>
    </>
  );
}
