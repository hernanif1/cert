import "server-only";

import { createHighlighterCoreSync, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import githubLightDefault from "@shikijs/themes/github-light-default";
import githubDarkDimmed from "@shikijs/themes/github-dark-dimmed";
import bash from "@shikijs/langs/bash";
import json from "@shikijs/langs/json";
import python from "@shikijs/langs/python";
import typescript from "@shikijs/langs/typescript";
import type { LessonBlock } from "@/content/schema";

export type CodeLang = Extract<LessonBlock, { kind: "code" }>["lang"];

/** Schema lang → TextMate grammar id. `text` never reaches shiki at all. */
const GRAMMAR: Record<Exclude<CodeLang, "text">, string> = {
  json: "json",
  python: "python",
  ts: "typescript",
  bash: "bash",
};

let highlighter: HighlighterCore | undefined;

/**
 * Sync + no WASM, so BlockRenderer stays a plain synchronous Server Component
 * and none of this reaches the client bundle. Created once per build process,
 * on first use — 6 of 38 lessons have a code block, so most pages never pay.
 */
function getHighlighter(): HighlighterCore {
  highlighter ??= createHighlighterCoreSync({
    themes: [githubLightDefault, githubDarkDimmed],
    langs: [bash, json, python, typescript],
    // `forgiving` skips the handful of Oniguruma patterns a native JS RegExp
    // cannot express instead of failing the whole build on them.
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return highlighter;
}

/**
 * Returns shiki's `<pre class="shiki">…</pre>` with per-token CSS variables, or
 * null for `text`, which has no grammar worth running and renders as escaped
 * plain text instead.
 *
 * `defaultColor: false` is load-bearing: it makes shiki emit --shiki-light and
 * --shiki-dark per token rather than a baked colour, which is what lets one
 * static build serve both themes. See the `.shiki` rules in app/globals.css.
 */
export function highlightCode(code: string, lang: CodeLang): string | null {
  if (lang === "text") return null;
  return getHighlighter().codeToHtml(code.replace(/\s+$/, ""), {
    lang: GRAMMAR[lang],
    themes: { light: "github-light-default", dark: "github-dark-dimmed" },
    defaultColor: false,
  });
}
