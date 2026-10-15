import "server-only";

import type { Lesson } from "@/content/schema";
import { TRANSLATED } from "@/content/i18n/pt-br/lessons/registry";

/** A lesson without a translation falls back to English at the call site. */
export function getLessonContentPtBr(slug: string): Lesson | null {
  return TRANSLATED[slug] ?? null;
}
