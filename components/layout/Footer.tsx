"use client";

import { EXAM } from "@/content/exam-facts";
import { useDict } from "@/lib/i18n/client";

export function Footer() {
  const t = useDict().footer;
  return (
    <footer data-focus-hide className="mt-auto border-t border-border bg-surface-2">
      <div className="mx-auto max-w-shell px-4 py-10 text-xs leading-relaxed text-fg-muted sm:px-6">
        <p className="font-display text-sm text-fg">{EXAM.credential}</p>
        <p className="mt-3 max-w-3xl">{t.disclaimer}</p>
        <p className="mt-3">
          {t.builtFrom(EXAM.code, EXAM.guideVersion, EXAM.effective)}
        </p>
      </div>
    </footer>
  );
}
