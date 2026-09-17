export function ProgressBar({
  value,
  label,
  tone = "accent",
}: {
  value: number;
  label?: string;
  tone?: "accent" | "success" | "danger";
}) {
  const pct = Math.min(100, Math.max(0, value));
  const fill =
    tone === "success"
      ? "bg-success"
      : tone === "danger"
        ? "bg-danger"
        : "bg-accent";
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
