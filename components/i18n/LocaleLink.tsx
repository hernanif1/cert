"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/lib/i18n/client";
import { localizeHref } from "@/lib/i18n";

/**
 * `next/link` that keeps the reader inside their language. Callers always pass
 * the locale-free href ("/learn/…"); the prefix is applied here, so no page or
 * component ever concatenates "/pt-br" by hand.
 */
export function LocaleLink({
  href,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const locale = useLocale();
  return <Link href={localizeHref(href, locale)} {...rest} />;
}
