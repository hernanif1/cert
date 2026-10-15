/**
 * Locale plumbing for a STATIC EXPORT: there is no middleware and no server,
 * so the locale is carried by the URL. English keeps its original unprefixed
 * routes (`/learn/…`) so every stored link and test URL survives; Brazilian
 * Portuguese mirrors them under `/pt-br/…`.
 *
 * This module is metadata-only and safe to import from client components.
 */
export const LOCALES = ["en", "pt-br"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tag for `<html lang>` and `Intl` formatters. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  "pt-br": "pt-BR",
};

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  "pt-br": "Português (Brasil)",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  "pt-br": "PT",
};

/** localStorage key for the reader's preferred language. Deliberately NOT part
 *  of the durable study blob: that key has exactly one writer (the store). */
export const KEY_LOCALE = "ccarp:locale";

const PREFIX = "/pt-br";

/** `usePathname()` never includes basePath, so neither do these helpers. */
export function localeFromPath(pathname: string): Locale {
  return pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)
    ? "pt-br"
    : "en";
}

/** "/pt-br/learn/x/" → "/learn/x/"; an unprefixed path is returned as is. */
export function stripLocale(pathname: string): string {
  if (pathname === PREFIX) return "/";
  return pathname.startsWith(`${PREFIX}/`)
    ? pathname.slice(PREFIX.length)
    : pathname;
}

/** Prefix an app-internal, locale-free href for the given locale. */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "en" || !href.startsWith("/")) return href;
  return href === "/" ? PREFIX : `${PREFIX}${href}`;
}
