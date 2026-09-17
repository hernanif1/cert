/**
 * localStorage access that cannot throw.
 *
 * The subtle part: when a browser is set to block site data, `window.localStorage`
 * throws SecurityError on PROPERTY ACCESS — before `.getItem()` is ever called.
 * A try/catch around only the method call misses exactly the case it was written
 * for. Safari private mode has historically also allowed reads while throwing
 * QuotaExceededError on writes, so we probe both.
 */

let cached: Storage | null | undefined;

export function safeStorage(): Storage | null {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage; // can throw on its own
    const probe = "__ccarp_probe__";
    s.setItem(probe, "1"); // can throw independently
    s.removeItem(probe);
    cached = s;
  } catch {
    cached = null; // degrade to in-memory; the app still works
  }
  return cached;
}

/** True when progress cannot be persisted, so the UI can say so once. */
export function storageBlocked(): boolean {
  return safeStorage() === null;
}

export function readRaw(key: string): string | null {
  try {
    return safeStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: string): void {
  try {
    safeStorage()?.setItem(key, value);
  } catch {
    /* quota or blocked — non-fatal by design */
  }
}

export function removeRaw(key: string): void {
  try {
    safeStorage()?.removeItem(key);
  } catch {
    /* non-fatal */
  }
}

export function readJSON<T>(key: string): T | null {
  const raw = readRaw(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null; // malformed blob: treated as absent, never thrown
  }
}
