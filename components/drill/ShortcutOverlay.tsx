"use client";

import { useEffect, useRef } from "react";
import { useDict } from "@/lib/i18n/client";

/**
 * Native <dialog> — focus trapping, Esc-to-close and the backdrop come for
 * free, with no dependency and no focus-management code to get wrong.
 */
export function ShortcutOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useDict().tools.drill;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop lands on the dialog element itself.
        if (e.target === ref.current) onClose();
      }}
      className="rounded-2xl border border-border bg-surface p-0 text-fg backdrop:bg-ink-900/50"
    >
      <div className="w-[min(92vw,26rem)] p-5">
        <h2 className="font-display text-lg">{t.shortcutsTitle}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {t.shortcutList.map(([key, meaning]) => (
            <div key={key} className="flex gap-4">
              <dt className="w-28 shrink-0">
                <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
                  {key}
                </kbd>
              </dt>
              <dd className="flex-1 text-fg-muted">{meaning}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent"
        >
          {t.close}
        </button>
      </div>
    </dialog>
  );
}
