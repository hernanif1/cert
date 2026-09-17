import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  hint,
  busy,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  busy?: boolean;
}) {
  return (
    <div className="bg-surface px-4 py-4" aria-busy={busy || undefined}>
      <p className="text-[11px] uppercase tracking-wide text-fg-muted">
        {label}
      </p>
      <p className="tnum mt-1 font-display text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
