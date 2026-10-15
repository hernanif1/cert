import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/slug";

/**
 * Every section-level heading on a lesson page — the in-body subtitle, Exam
 * Traps, Key terms, Sources — renders through here, so they cannot drift.
 *
 * The short rule is the hierarchy device, drawn in the domain's hue: it reads
 * as a section break at a glance without needing more size or weight, which
 * keeps Source Serif elegant at 30px instead of shouting.
 */
export function SectionHeading({
  children,
  id,
  anchorLabel,
  className,
}: {
  children: ReactNode;
  id?: string;
  /** Accessible name for the "#" self-link. Omit to render no self-link. */
  anchorLabel?: string;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "group/h relative mt-16 mb-5 scroll-mt-24 font-display text-[1.875rem] font-medium leading-[1.2] tracking-[-0.02em] text-fg",
        "before:mb-4 before:block before:h-[3px] before:w-10 before:rounded-full before:bg-domain before:content-['']",
        className,
      )}
    >
      {children}
      {id && anchorLabel && (
        <a
          href={`#${id}`}
          aria-label={anchorLabel}
          className="ml-2 inline-flex align-middle text-domain opacity-0 transition-opacity focus-visible:opacity-100 group-hover/h:opacity-70"
        >
          <Icon name="hash" size={18} />
        </a>
      )}
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
        "mt-10 mb-3 font-display text-[1.375rem] font-medium leading-snug tracking-[-0.015em] text-fg",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/** "Precedence, templates and injected data" → "precedence-templates-and-injected-data" */
export function headingId(text: string): string {
  return slugify(text);
}
