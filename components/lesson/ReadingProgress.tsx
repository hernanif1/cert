"use client";

import { useEffect, useRef } from "react";

/**
 * A 2px bar under the top bar showing how far through the article you are.
 * Written straight to the element's transform inside rAF — no React state, so
 * scrolling never re-renders anything.
 */
export function ReadingProgress({
  targetId,
  label,
}: {
  targetId: string;
  label: string;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const span = rect.height - window.innerHeight * 0.6;
      const done = span <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / span));
      el.style.transform = `scaleX(${done})`;
      el.parentElement?.setAttribute("aria-valuenow", String(Math.round(done * 100)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      role="progressbar"
      data-reading-progress
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className="pointer-events-none fixed inset-x-0 top-[calc(3.5rem+1px)] z-30 h-[3px]"
    >
      <div
        ref={bar}
        // Inline, not `scale-x-0`: Tailwind v4 emits the `scale` property for
        // that utility, which the transform written in the effect cannot undo.
        style={{ transform: "scaleX(0)" }}
        className="h-full origin-left bg-domain will-change-transform"
      />
    </div>
  );
}
