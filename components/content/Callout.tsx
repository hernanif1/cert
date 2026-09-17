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
    <aside className={cn("my-6 rounded-card border-l-[3px] px-5 py-4", s.box)}>
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.1em]",
          s.label,
        )}
      >
        {title ?? DEFAULT_TITLE[variant]}
      </p>
      <div
        className="mt-2.5 text-aux [&_:not(pre)>code]:rounded-[0.3rem] [&_:not(pre)>code]:bg-bg/60 [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em] [&_p]:my-2 [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: md(source) }}
      />
    </aside>
  );
}
