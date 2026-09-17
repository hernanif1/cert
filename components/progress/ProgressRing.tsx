/**
 * Server Component: the value arrives as a prop, so the SVG geometry never
 * enters the client bundle and the ring is reusable in static contexts. The
 * client wrapper reads the store and passes the number down.
 */
export function ProgressRing({
  value,
  size = 36,
  stroke = 3,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `${pct}% complete`}
      className="-rotate-90 shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--ui-border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--ui-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
      />
    </svg>
  );
}
