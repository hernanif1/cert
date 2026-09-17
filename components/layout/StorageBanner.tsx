"use client";

import { useStorageBlocked } from "@/lib/storage/store";

/**
 * One non-blocking line when the browser refuses site data. Never a modal:
 * the app works fine in memory, it just forgets between visits.
 */
export function StorageBanner() {
  const blocked = useStorageBlocked();
  if (!blocked) return null;
  return (
    <p
      role="status"
      className="border-b border-warning/30 bg-warning/[0.08] px-4 py-2 text-center text-xs text-fg"
    >
      Your browser is blocking site data, so progress won&rsquo;t be saved
      between visits.
    </p>
  );
}
