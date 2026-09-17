import { md } from "@/lib/markdown";
import type { CalloutVariant } from "@/content/schema";
import { cn } from "@/lib/cn";

const STYLES: Record<CalloutVariant, { box: string; label: string }> = {
  "key-concept": {
    box: "border-accent/40 bg-accent-soft",
    label: "text-accent",
  },
  "exam-distractor": {
    box: "border-warning/40 bg-warning/[0.07]",
    label: "text-warning",
  },
  pitfall: { box: "border-danger/40 bg-danger-soft", label: "text-danger" },
  note: { box: "border-border bg-surface-2", label: "text-fg-muted" },
};

const DEFAULT_TITLE: Record<CalloutVariant, string> = {
  "key-concept": "Key Concept",
  "exam-distractor": "Common Exam Distractor",
  pitfall: "Pitfall",
  note: "Note",
};

export function Callout({
  variant,
  title,
  source,
}: {
  variant: CalloutVariant;
  title?: string;
  source: string;
}) {
  const s = STYLES[variant];
  return (
    <aside className={cn("my-6 rounded-card border-l-2 px-5 py-4", s.box)}>
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider",
          s.label,
        )}
      >
        {title ?? DEFAULT_TITLE[variant]}
      </p>
      <div
        className="mt-2 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-bg/60 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_p]:my-2 [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: md(source) }}
      />
    </aside>
  );
}
