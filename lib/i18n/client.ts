"use client";

import { usePathname } from "next/navigation";
import { getDict, localeFromPath, type Dict, type Locale } from "@/lib/i18n";

/**
 * The URL is the single source of truth for the locale. During the static
 * prerender `usePathname()` already returns the page's own path, so the HTML
 * ships in the right language and there is no hydration flash to mask.
 */
export function useLocale(): Locale {
  return localeFromPath(usePathname() ?? "/");
}

export function useDict(): Dict {
  return getDict(useLocale());
}
