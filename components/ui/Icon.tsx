import type { ReactNode, SVGProps } from "react";
import type { DomainNumber } from "@/content/schema";
import { cn } from "@/lib/cn";

/**
 * The site's icon set: 24px grid, 1.6px round strokes, `currentColor` only.
 * Hand-inlined rather than a dependency — thirty-odd glyphs cost ~4KB, ship no
 * JS, and work in Server Components.
 *
 * Motion is CSS-only and lives in globals.css ("Icon motion"). Parts that move
 * carry an `i-*` class; the trigger is always a hover/focus/state on the
 * nearest interactive ancestor, never the icon itself, so the hit area is the
 * whole control. Everything is switched off by prefers-reduced-motion.
 *
 * `pathLength={1}` normalises every stroke to length 1, which is what lets one
 * `stroke-dashoffset: 1 → 0` keyframe draw any glyph.
 */
const P = { pathLength: 1 } as const;

const GLYPHS = {
  /* ── Navigation & chrome ─────────────────────────────────────────────── */
  menu: (
    <>
      <path {...P} d="M4 7h16" />
      <path {...P} d="M4 12h16" />
      <path {...P} d="M4 17h16" />
    </>
  ),
  x: (
    <>
      <path {...P} d="M18 6 6 18" />
      <path {...P} d="m6 6 12 12" />
    </>
  ),
  "chevron-down": <path {...P} d="m6 9 6 6 6-6" />,
  "chevron-right": <path {...P} d="m9 6 6 6-6 6" />,
  "arrow-right": (
    <>
      <path {...P} d="M5 12h14" />
      <path {...P} d="m13 6 6 6-6 6" />
    </>
  ),
  "arrow-left": (
    <>
      <path {...P} d="M19 12H5" />
      <path {...P} d="m11 18-6-6 6-6" />
    </>
  ),
  "arrow-up": (
    <>
      <path {...P} d="M12 19V5" />
      <path {...P} d="m6 11 6-6 6 6" />
    </>
  ),
  "external-link": (
    <>
      <path {...P} d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <g className="i-nudge-out">
        <path {...P} d="M15 3h6v6" />
        <path {...P} d="M10 14 21 3" />
      </g>
    </>
  ),
  hash: (
    <>
      <path {...P} d="M4 9h16" />
      <path {...P} d="M4 15h16" />
      <path {...P} d="M10 3 8 21" />
      <path {...P} d="M16 3l-2 18" />
    </>
  ),
  search: (
    <>
      <circle {...P} cx="11" cy="11" r="7" />
      <path {...P} d="m20 20-3.5-3.5" />
    </>
  ),
  list: (
    <>
      <path {...P} d="M9 6h11" />
      <path {...P} d="M9 12h11" />
      <path {...P} d="M9 18h11" />
      <path {...P} d="M4 6h.01" />
      <path {...P} d="M4 12h.01" />
      <path {...P} d="M4 18h.01" />
    </>
  ),

  /* ── Theme & language ────────────────────────────────────────────────── */
  sun: (
    <>
      <circle {...P} cx="12" cy="12" r="4" />
      <g className="i-spin">
        <path {...P} d="M12 2v2" />
        <path {...P} d="M12 20v2" />
        <path {...P} d="m4.93 4.93 1.41 1.41" />
        <path {...P} d="m17.66 17.66 1.41 1.41" />
        <path {...P} d="M2 12h2" />
        <path {...P} d="M20 12h2" />
        <path {...P} d="m4.93 19.07 1.41-1.41" />
        <path {...P} d="m17.66 6.34 1.41-1.41" />
      </g>
    </>
  ),
  moon: (
    <g className="i-tilt">
      <path {...P} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </g>
  ),
  monitor: (
    <>
      <rect {...P} x="2" y="3" width="20" height="14" rx="2" />
      <path {...P} d="M8 21h8" />
      <path {...P} d="M12 17v4" />
    </>
  ),
  globe: (
    <>
      <circle {...P} cx="12" cy="12" r="10" />
      <path {...P} d="M2 12h20" />
      <path
        {...P}
        className="i-meridian"
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      />
    </>
  ),

  /* ── View modes ──────────────────────────────────────────────────────── */
  maximize: (
    <>
      <path {...P} d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path {...P} d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path {...P} d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path {...P} d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </>
  ),
  minimize: (
    <>
      <path {...P} d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path {...P} d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path {...P} d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path {...P} d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </>
  ),
  /* Focus mode: a page with nothing around it. */
  focus: (
    <>
      <rect {...P} x="3" y="3" width="18" height="18" rx="2" />
      <path {...P} d="M8 8h8" />
      <path {...P} d="M8 12h8" />
      <path {...P} d="M8 16h5" />
    </>
  ),

  /* ── Study tools ─────────────────────────────────────────────────────── */
  book: (
    <>
      <path {...P} className="i-page-l" d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path {...P} className="i-page-r" d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  grid: (
    <>
      <rect {...P} x="3" y="3" width="7" height="7" rx="1.5" />
      <rect {...P} x="14" y="3" width="7" height="7" rx="1.5" />
      <rect {...P} x="14" y="14" width="7" height="7" rx="1.5" />
      <rect {...P} x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  target: (
    <>
      <circle {...P} cx="12" cy="12" r="10" />
      <circle {...P} cx="12" cy="12" r="6" />
      <circle {...P} className="i-pulse" cx="12" cy="12" r="2" />
    </>
  ),
  chart: (
    <>
      <path {...P} className="i-bar i-bar-1" d="M6 20v-6" />
      <path {...P} className="i-bar i-bar-2" d="M12 20V4" />
      <path {...P} className="i-bar i-bar-3" d="M18 20V10" />
    </>
  ),
  zap: <path {...P} className="i-flash" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  clock: (
    <>
      <circle {...P} cx="12" cy="12" r="10" />
      <path {...P} className="i-hand" d="M12 6v6l4 2" />
    </>
  ),

  /* ── State ───────────────────────────────────────────────────────────── */
  check: <path {...P} className="i-draw" d="m4 12 5 5L20 6" />,
  circle: <circle {...P} cx="12" cy="12" r="9" />,
  "check-circle": (
    <>
      <circle {...P} cx="12" cy="12" r="9" />
      <path {...P} className="i-draw" d="m8 12.5 3 3 5-6" />
    </>
  ),
  "x-circle": (
    <>
      <circle {...P} cx="12" cy="12" r="9" />
      <path {...P} d="m15 9-6 6" />
      <path {...P} d="m9 9 6 6" />
    </>
  ),
  flag: (
    <>
      <path {...P} d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path {...P} d="M4 22v-7" />
    </>
  ),
  keyboard: (
    <>
      <rect {...P} x="2" y="5" width="20" height="14" rx="2" />
      <path {...P} d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M9 13h6" />
    </>
  ),

  /* ── Callouts ────────────────────────────────────────────────────────── */
  lightbulb: (
    <>
      <path {...P} d="M9 18h6" />
      <path {...P} d="M10 21h4" />
      <path
        {...P}
        d="M12 3a6 6 0 0 0-4 10.5c.8.8 1.3 1.6 1.5 2.5h5c.2-.9.7-1.7 1.5-2.5A6 6 0 0 0 12 3z"
      />
    </>
  ),
  decoy: (
    <>
      <circle {...P} cx="12" cy="12" r="10" />
      <path {...P} d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <path {...P} d="M12 17h.01" />
    </>
  ),
  alert: (
    <>
      <path {...P} d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path {...P} d="M12 9v4" />
      <path {...P} d="M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle {...P} cx="12" cy="12" r="10" />
      <path {...P} d="M12 16v-4" />
      <path {...P} d="M12 8h.01" />
    </>
  ),

  /* ── The seven domains ───────────────────────────────────────────────── */
  /* D1 Solution Design & Architecture — stacked layers */
  layers: (
    <>
      <path {...P} className="i-layer-1" d="M12 3 3 7.5l9 4.5 9-4.5L12 3z" />
      <path {...P} className="i-layer-2" d="m3 12 9 4.5 9-4.5" />
      <path {...P} className="i-layer-3" d="m3 16.5 9 4.5 9-4.5" />
    </>
  ),
  /* D2 Models, Prompting & Context — a prompt */
  prompt: (
    <>
      <path {...P} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path {...P} className="i-type-1" d="M8 8h8" />
      <path {...P} className="i-type-2" d="M8 12h5" />
    </>
  ),
  /* D3 Integration — connected nodes */
  nodes: (
    <>
      <circle {...P} cx="18" cy="5" r="3" />
      <circle {...P} cx="6" cy="12" r="3" />
      <circle {...P} cx="18" cy="19" r="3" />
      <path {...P} className="i-link" d="m8.6 13.5 6.8 4" />
      <path {...P} className="i-link" d="m15.4 6.5-6.8 4" />
    </>
  ),
  /* D4 Evaluation, Testing & Optimization — a gauge */
  gauge: (
    <>
      <path {...P} d="M5.64 19.36a9 9 0 1 1 12.72 0" />
      <path {...P} className="i-needle" d="m12 13 4-5" />
      <path {...P} d="M12 13h.01" />
    </>
  ),
  /* D5 Governance, Safety & Risk — a shield */
  shield: (
    <>
      <path {...P} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path {...P} className="i-draw" d="m9 12 2 2 4-4" />
    </>
  ),
  /* D6 Stakeholder Communication & Lifecycle — people */
  users: (
    <>
      <path {...P} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle {...P} cx="9" cy="7" r="4" />
      <g className="i-peer">
        <path {...P} d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path {...P} d="M16 3.13a4 4 0 0 1 0 7.75" />
      </g>
    </>
  ),
  /* D7 Developer Productivity — a terminal */
  terminal: (
    <>
      <path {...P} d="m4 17 6-6-6-6" />
      <path {...P} className="i-cursor" d="M12 19h8" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof GLYPHS;

export const DOMAIN_ICON: Record<DomainNumber, IconName> = {
  1: "layers",
  2: "prompt",
  3: "nodes",
  4: "gauge",
  5: "shield",
  6: "users",
  7: "terminal",
};

export function Icon({
  name,
  size = 18,
  className,
  draw,
  ...rest
}: {
  name: IconName;
  size?: number;
  /** Stroke the glyph in once when it first renders / scrolls into view. */
  draw?: boolean;
} & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("icon shrink-0", `icon-${name}`, draw && "icon-draw", className)}
      {...rest}
    >
      {GLYPHS[name]}
    </svg>
  );
}

/** A domain's glyph on its tinted, rounded tile. Inherits `--domain`. */
export function DomainBadge({
  domainId,
  size = 36,
  draw,
  className,
}: {
  domainId: DomainNumber;
  size?: number;
  draw?: boolean;
  className?: string;
}) {
  return (
    <span
      data-domain={domainId}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[0.7rem] bg-domain-soft text-domain",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={DOMAIN_ICON[domainId]} size={Math.round(size * 0.54)} draw={draw} />
    </span>
  );
}
