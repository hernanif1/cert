"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface TocItem {
  id: string;
  text: string;
}

/**
 * "On this page", in the right-hand rail once the viewport can afford three
 * columns. The list itself is server data (the lesson's heading blocks); this
 * component only adds the scroll-spy.
 *
 * The active section is the LAST heading that has crossed a line 30% down the
 * viewport — the one you are actually reading — rather than whichever heading
 * happens to be intersecting, which flickers between two on long sections.
 */
export function Toc({
  items,
  title,
  backToTop,
}: {
  items: TocItem[];
  title: string;
  backToTop: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll(); // first reading, deferred to a frame like every later one
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={title} className="text-[0.8125rem]">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted/80">
        <Icon name="list" size={14} />
        {title}
      </p>
      <ul className="mt-3 border-l border-border">
        {items.map((item) => {
          const here = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={here ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l-2 py-1.5 pl-3.5 leading-snug transition-colors",
                  here
                    ? "border-domain font-medium text-fg"
                    : "border-transparent text-fg-muted hover:border-border hover:text-fg",
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
      <a
        href="#content"
        className="mt-4 inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg"
      >
        <Icon name="arrow-up" size={13} />
        {backToTop}
      </a>
    </nav>
  );
}
