"use client";

import { useEffect, useRef, useState } from "react";
import { useDict } from "@/lib/i18n/client";

/**
 * ISOLATED LEAF with its own state. This is a hard requirement: if the
 * countdown lived in ExamRunner's state, all 63 questions and the navigator
 * grid would re-render once per second for two hours.
 *
 * Truth is always `deadlineAt - Date.now()`; the timeout only drives display.
 * Background tabs throttle timers to 1Hz or slower, so an accumulating counter
 * would gift the user free minutes, and closing a laptop must not pause an exam.
 */
export function ExamTimer({
  deadlineAt,
  onExpire,
}: {
  deadlineAt: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() => deadlineAt - Date.now());
  const [announcement, setAnnouncement] = useState("");
  const expired = useRef(false);
  const announced = useRef(new Set<number>());
  const onExpireRef = useRef(onExpire);
  const announce = useDict().tools.exam.minutesRemaining;
  const announceRef = useRef(announce);

  // Keep the callback current without making it a dependency of the timer
  // effect — re-running that effect would restart the countdown every render.
  useEffect(() => {
    onExpireRef.current = onExpire;
    announceRef.current = announce;
  }, [onExpire, announce]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const left = deadlineAt - Date.now();
      setRemaining(left);

      if (left <= 0) {
        if (!expired.current) {
          expired.current = true;
          onExpireRef.current();
        }
        return;
      }

      // Announce only at milestones: a per-second live region is unusable
      // with a screen reader.
      const mins = Math.ceil(left / 60_000);
      if ([10, 5, 1].includes(mins) && !announced.current.has(mins)) {
        announced.current.add(mins);
        setAnnouncement(announceRef.current(mins));
      }

      // Re-sync to the wall clock so we do not drift past the second boundary.
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };

    tick();
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deadlineAt]);

  const low = remaining <= 5 * 60_000;

  return (
    <>
      <time
        aria-live="off"
        className={`tnum font-mono text-lg ${low ? "text-danger" : ""}`}
      >
        {format(remaining)}
      </time>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
