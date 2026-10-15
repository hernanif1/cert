import "server-only";

import { marked } from "marked";
import { slugify } from "@/lib/slug";

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

/**
 * `==text==` → <mark>. The one extension: authors get a highlighter without
 * reaching for raw HTML.
 */
marked.use({
  extensions: [
    {
      name: "mark",
      level: "inline",
      start: (src: string) => src.indexOf("=="),
      tokenizer(src: string) {
        const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
        if (!m) return undefined;
        return {
          type: "mark",
          raw: m[0],
          tokens: this.lexer.inlineTokens(m[1]),
        };
      },
      renderer(token) {
        return `<mark>${this.parser.parseInline(token.tokens ?? [])}</mark>`;
      },
    },
  ],
});

/**
 * `:::example` … `:::` → a hairline-boxed aside. Sets a worked illustration
 * apart from the argument around it without the weight of a callout. The body
 * is ordinary block markdown.
 */
marked.use({
  extensions: [
    {
      name: "exampleBox",
      level: "block",
      start: (src: string) => src.match(/^:::example/m)?.index,
      tokenizer(src: string) {
        const m = /^:::example[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/.exec(src);
        if (!m) return undefined;
        const token = { type: "exampleBox", raw: m[0], tokens: [] };
        this.lexer.blockTokens(m[1], token.tokens);
        return token;
      },
      renderer(token) {
        return `<div class="example-box">${this.parser.parse(token.tokens ?? [])}</div>\n`;
      },
    },
  ],
});

/**
 * A bold run that OPENS a paragraph or list item is a run-in label ("**Parse**
 * — turn source files into…"), not emphasis, and the reading styles render it
 * as a rounded chip. CSS cannot tell "first element" from "first thing" — a
 * text node before the <strong> is invisible to :first-child — so it is tagged
 * here, where the structure is known.
 */
function tagLeadIns(html: string): string {
  return html.replace(/(<(?:p|li)>(?:<p>)?)<strong>/g, '$1<strong class="lead-in">');
}

/** Block-level markdown: paragraphs, lists, emphasis, inline code. */
export function md(source: string): string {
  return tagLeadIns(marked.parse(source, { async: false }));
}

/** Inline markdown only — no wrapping <p>. For stems, labels, table cells. */
export function mdInline(source: string): string {
  return marked.parseInline(source, { async: false });
}

/** Inline markdown for a LIST ITEM, where an opening bold run is a label. */
export function mdListItem(source: string): string {
  return mdInline(source).replace(/^<strong>/, '<strong class="lead-in">');
}

/* ───────────────────────────── Key terms ─────────────────────────────── */

export interface TermRef {
  term: string;
  /** Fragment id of the term's row in the Key terms list. */
  id: string;
  definition: string;
}

/** "Retrieval-augmented generation (RAG)" → "term-retrieval-augmented-generation-rag" */
export function termId(term: string): string {
  return `term-${slugify(term)}`;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Link the FIRST mention of each key term to its definition.
 *
 * Works on rendered HTML, touching text nodes only and never text inside an
 * element that already carries its own meaning (links, code, bold labels,
 * highlights). `seen` is shared across a lesson's blocks by the caller so each
 * term is linked once per page — a page of dotted tags would be noise.
 *
 * A term "Chunking (semantic)" is matched by its head, "Chunking"; matching is
 * case-insensitive and whole-word, with Unicode-aware boundaries so accented
 * Portuguese terms match too.
 */
export function linkTerms(
  html: string,
  terms: TermRef[],
  seen: Set<string>,
  title: string,
): string {
  const pending = terms.filter((t) => !seen.has(t.id));
  if (pending.length === 0) return html;

  const headOf = (term: string) => term.replace(/\s*\(.*\)\s*$/, "").trim();
  const fold = (text: string) =>
    text.replace(/[.:,;—–-]+\s*$/, "").trim().toLocaleLowerCase();

  // Pass 1 — a bold run that IS a key term ("**Hybrid retrieval** combines…").
  // That is how most terms are introduced, so the chip or highlight itself
  // becomes the link rather than being skipped as "already meaningful".
  html = html.replace(
    /<strong( class="lead-in")?>([^<]+)<\/strong>/g,
    (whole, _cls: string | undefined, inner: string) => {
      const hit = pending.find(
        (t) => !seen.has(t.id) && fold(headOf(t.term)) === fold(inner),
      );
      if (!hit) return whole;
      seen.add(hit.id);
      return `<a class="term-link" href="#${hit.id}" title="${escapeAttr(`${hit.definition} — ${title}`)}">${whole}</a>`;
    },
  );

  // Pass 2 — the first plain-text mention of whatever is still unlinked.
  const parts = html.split(/(<[^>]+>)/);
  let skipDepth = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("<")) {
      if (/^<(a|code|strong|mark|kbd|pre)\b/i.test(part)) skipDepth++;
      else if (/^<\/(a|code|strong|mark|kbd|pre)>/i.test(part)) skipDepth--;
      continue;
    }
    if (skipDepth > 0 || !part.trim()) continue;

    // Inserted links are parked as placeholders so a later, shorter term
    // ("RAG") can never match inside an earlier one ("RAG pipeline").
    let text = part;
    const links: string[] = [];
    for (const t of pending) {
      if (seen.has(t.id)) continue;
      const head = headOf(t.term);
      if (head.length < 3) continue;
      const re = new RegExp(
        `(?<![\\p{L}\\p{N}])(${escapeRe(head)})(?![\\p{L}\\p{N}])`,
        "iu",
      );
      const m = re.exec(text);
      if (!m) continue;
      seen.add(t.id);
      links.push(
        `<a class="term" href="#${t.id}" title="${escapeAttr(`${t.definition} — ${title}`)}">${m[1]}</a>`,
      );
      text =
        text.slice(0, m.index) +
        `\u0000${links.length - 1}\u0000` +
        text.slice(m.index + m[0].length);
    }
    text = text.replace(/\u0000(\d+)\u0000/g, (_, n: string) => links[Number(n)]);
    parts[i] = text;
  }
  return parts.join("");
}
