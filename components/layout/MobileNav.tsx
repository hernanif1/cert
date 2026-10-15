"use client";

import { useEffect, useRef } from "react";
import { useChrome } from "@/components/providers/AppChrome";
import { useDict } from "@/lib/i18n/client";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { Icon } from "@/components/ui/Icon";

/**
 * The full navigation as a drawer, below lg. A native <dialog> gives focus
 * trapping, Esc-to-close, the backdrop and inert background for free — the
 * same reasoning as the drill's ShortcutOverlay.
 */
export function MobileNav() {
  const { navOpen, setNavOpen } = useChrome();
  const t = useDict().nav;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (navOpen && !el.open) el.showModal();
    if (!navOpen && el.open) el.close();
  }, [navOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        aria-expanded={navOpen}
        aria-label={t.openMenu}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-accent/60 hover:text-fg lg:hidden"
      >
        <Icon name="menu" size={16} />
      </button>

      <dialog
        ref={ref}
        onClose={() => setNavOpen(false)}
        onClick={(e) => {
          // Clicking the backdrop lands on the dialog element itself.
          if (e.target === ref.current) setNavOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-[min(20rem,88vw)] max-w-none border-r border-border bg-bg p-0 text-fg backdrop:bg-ink-900/45 backdrop:backdrop-blur-[2px] drawer"
      >
        {navOpen && (
          <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="font-display text-base tracking-tight">
                {t.curriculum}
              </span>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label={t.closeMenu}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-accent/60 hover:text-fg"
              >
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-8">
              <SidebarNav onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
