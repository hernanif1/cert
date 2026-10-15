import { en, type Dict } from "@/lib/i18n/dict/en";
import { ptBR } from "@/lib/i18n/dict/pt-br";
import type { Locale } from "@/lib/i18n/config";

export type { Dict };
export * from "@/lib/i18n/config";

const DICTS: Record<Locale, Dict> = { en, "pt-br": ptBR };

/** Works on both sides of the client boundary: the dictionaries are plain
 *  metadata and carry no lesson prose. */
export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}
