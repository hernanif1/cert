import type { CalloutVariant } from "@/content/schema";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const STYLES: Record<CalloutVariant, { box: string; label: string; icon: IconName }> = {
  "key-concept": {
    box: "border-domain/35 bg-domain-soft",
    label: "text-domain",
    icon: "lightbulb",
  },
  "exam-distractor": {
    box: "border-warning/40 bg-warning/[0.07]",
    label: "text-warning",
    icon: "decoy",
  },
  pitfall: {
    box: "border-danger/40 bg-danger-soft",
    label: "text-danger",
    icon: "alert",
  },
  note: { box: "border-border bg-surface-2", label: "text-fg-muted", icon: "info" },
};

export function Callout({
  variant,
  title,
  html,
}: {
  variant: CalloutVariant;
  /** Already resolved: the block's own title or the localised default. */
  title: string;
  html: string;
}) {
  const s = STYLES[variant];
  return (
    <aside className={cn("my-9 rounded-2xl border px-5 py-5 sm:px-6", s.box)}>
      <p
        className={cn(
          "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]",
          s.label,
        )}
      >
        <Icon name={s.icon} size={16} className="icon-draw-view" />
        {title}
      </p>
      <div
        className="prose-reading mt-3 text-aux [&_p]:my-2.5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </aside>
  );
}
