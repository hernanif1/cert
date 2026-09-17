import "server-only";

import { marked } from "marked";

/**
 * Markdown is rendered to HTML at BUILD TIME inside Server Components, so the
 * parser never enters the client bundle: arbitrarily rich lesson prose costs
 * 0KB at runtime. This is the main reason lesson content is typed TS modules
 * rather than MDX.
 *
 * Content is first-party and authored in-repo, so it is trusted input. Nothing
 * user-supplied is ever passed through here.
 */
marked.setOptions({ gfm: true, breaks: false });

/** Block-level markdown: paragraphs, lists, emphasis, inline code. */
export function md(source: string): string {
  return marked.parse(source, { async: false });
}

/** Inline markdown only — no wrapping <p>. For stems, labels, table cells. */
export function mdInline(source: string): string {
  return marked.parseInline(source, { async: false });
}
