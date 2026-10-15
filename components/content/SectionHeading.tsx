import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Every section-level heading on a lesson page — the in-body subtitle, Exam
 * Traps, Key terms, Sources — renders through here, so they cannot drift.
 *
 * The short clay rule is the hierarchy device: it reads as a section break at
 * a glance without needing more size or weight, which keeps Source Serif
 * elegant at 28px instead of shouting.
 */
export function SectionHeading({
  children,
  id,
  className,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "mt-12 mb-4 scroll-mt-20 font-display text-[1.75rem] font-medium leading-[1.2] tracking-[-0.02em] text-fg",
        "before:mb-3 before:block before:h-[2px] before:w-9 before:bg-accent before:content-['']",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** h3 tier: example titles and Practice Scenario. Never used above an h2. */
export function SubHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "mt-8 mb-2 font-display text-[1.3125rem] font-medium leading-snug tracking-[-0.015em] text-fg",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** "Precedence, templates and injected data" → "precedence-templates-and-injected-data" */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
