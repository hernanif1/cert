"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDict, useLocale } from "@/lib/i18n/client";
import {
  HTML_LANG,
  KEY_LOCALE,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_SHORT,
  localizeHref,
  stripLocale,
  type Locale,
} from "@/lib/i18n";
import { Menu } from "@/components/ui/Menu";
import { Icon } from "@/components/ui/Icon";

/**
 * Switches language by navigating to the same page in the other locale's route
 * tree — the URL is the source of truth, so a shared link opens in the language
 * it was shared in. The choice is also remembered (KEY_LOCALE) so LocaleScript
 * can bring a returning reader straight back to their language.
 */
export function LanguageMenu() {
  const locale = useLocale();
  const t = useDict().language;
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  // The root layout is shared by both locales and prerenders `lang="en"`;
  // LocaleScript corrects it before paint, this keeps it right across
  // client-side navigations.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  function choose(next: Locale) {
    try {
      localStorage.setItem(KEY_LOCALE, next);
    } catch {
      // Storage blocked: the URL still carries the choice for this visit.
    }
    if (next === locale) return;
    const target = localizeHref(stripLocale(pathname), next);
    // Query string matters on /mock-exam/results (?attempt=…).
    router.push(target + window.location.search + window.location.hash);
  }

  return (
    <Menu
      label={t.aria(LOCALE_LABEL[locale])}
      trigger={
        <>
          <Icon name="globe" size={15} />
          <span>{LOCALE_SHORT[locale]}</span>
        </>
      }
      items={LOCALES.map((value) => ({
        key: value,
        label: LOCALE_LABEL[value],
        hint: LOCALE_SHORT[value],
        lang: HTML_LANG[value],
        selected: value === locale,
        onSelect: () => choose(value),
      }))}
    />
  );
}
