"use client";

import MiniSearch from "minisearch";
import type { Locale } from "@/lib/i18n/config";
import { fold, RELAXED_SEARCH, SEARCH_OPTIONS, type SearchDoc, type SearchKind } from "@/lib/search";

/**
 * The client half of search: fetch the document list once per locale, build a
 * MiniSearch index in memory, and turn a query into ranked, highlighted hits.
 *
 * Nothing here runs until the palette is first opened, so a reader who never
 * searches pays for none of it — the library and the index both load lazily.
 */

export interface SearchIndex {
  ms: MiniSearch<SearchDoc>;
  /** Everything indexed, in build order. The empty-query state lists the pages. */
  docs: SearchDoc[];
}

export interface Hit extends SearchDoc {
  score: number;
  /** The index terms that matched, already folded — what the snippet marks up. */
  terms: string[];
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const cache: Partial<Record<Locale, Promise<SearchIndex>>> = {};

export function loadSearchIndex(locale: Locale): Promise<SearchIndex> {
  const pending = cache[locale];
  if (pending) return pending;
  const p = fetch(`${BASE}/search-index/${locale}.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`search index: HTTP ${r.status}`);
      return r.json() as Promise<SearchDoc[]>;
    })
    .then((docs) => {
      const ms = new MiniSearch<SearchDoc>(SEARCH_OPTIONS);
      ms.addAll(docs);
      return { ms, docs };
    })
    .catch((e) => {
      delete cache[locale]; // let the next open retry
      throw e;
    });
  cache[locale] = p;
  return p;
}

/** How many sections of ONE lesson may crowd the list before the rest yield. */
const SECTIONS_PER_LESSON = 3;

export function runSearch(index: SearchIndex, query: string, limit = 40): Hit[] {
  const q = query.trim();
  if (!q) return [];
  let results = index.ms.search(q);
  if (results.length === 0) results = index.ms.search(q, RELAXED_SEARCH);

  const perLesson = new Map<string, number>();
  const hits: Hit[] = [];
  for (const r of results) {
    const doc = r as unknown as SearchDoc & { score: number; terms: string[] };
    if (doc.kind === "section") {
      const lesson = doc.id.split(":")[1];
      const n = (perLesson.get(lesson) ?? 0) + 1;
      perLesson.set(lesson, n);
      if (n > SECTIONS_PER_LESSON) continue;
    }
    hits.push({
      id: doc.id,
      kind: doc.kind,
      title: doc.title,
      context: doc.context,
      text: doc.text,
      href: doc.href,
      domainId: doc.domainId,
      score: doc.score,
      terms: doc.terms,
    });
    if (hits.length >= limit) break;
  }
  return hits;
}

/* ─────────────────────────── Snippets & marks ─────────────────────────── */

export interface Segment {
  text: string;
  hit: boolean;
}

/** Fold per character so the result is index-aligned with the original: a
 *  match found in the folded copy can be cut out of the real text. Characters
 *  that would change length are left alone. */
function foldAligned(text: string): string {
  let out = "";
  for (const ch of text) {
    const f = fold(ch);
    out += f.length === ch.length ? f : ch;
  }
  return out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function termPattern(terms: string[]): RegExp | null {
  const parts = terms.filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRe);
  return parts.length ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join("|")})[\\p{L}\\p{N}]*`, "giu") : null;
}

/** Split `text` into plain and matched runs. Matches are whole words that
 *  START with a matched term, so a prefix query "chunk" marks "chunking". */
export function markTerms(text: string, terms: string[]): Segment[] {
  const re = termPattern(terms);
  if (!re) return [{ text, hit: false }];
  const folded = foldAligned(text);
  const out: Segment[] = [];
  let last = 0;
  for (const m of folded.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), hit: false });
    out.push({ text: text.slice(i, i + m[0].length), hit: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), hit: false });
  return out;
}

const WINDOW = 150;

/** A ~150-character window around the FIRST match, cut on word boundaries and
 *  ellipsised; the opening of the text when nothing matches (a fuzzy hit). */
export function snippet(text: string, terms: string[]): string {
  if (text.length <= WINDOW) return text;
  const re = termPattern(terms);
  const m = re ? re.exec(foldAligned(text)) : null;
  const at = m?.index ?? 0;

  let start = Math.max(0, at - Math.floor(WINDOW / 3));
  let end = Math.min(text.length, start + WINDOW);
  if (end === text.length) start = Math.max(0, end - WINDOW);
  // Snap to word boundaries so the window never opens or closes mid-word.
  if (start > 0) {
    const sp = text.indexOf(" ", start);
    if (sp !== -1 && sp < at) start = sp + 1;
  }
  if (end < text.length) {
    const sp = text.lastIndexOf(" ", end);
    if (sp > at + 1) end = sp;
  }
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

/** Display order of the groups under the top hit. */
export const KIND_ORDER: SearchKind[] = ["lesson", "section", "term", "trap", "domain", "page"];

export interface HitGroup {
  kind: SearchKind;
  hits: Hit[];
}

/** Spotlight's shape: the single best match on top, then the rest grouped by
 *  kind, groups ordered by their own best score. */
export function groupHits(hits: Hit[]): { top: Hit | null; groups: HitGroup[] } {
  if (hits.length === 0) return { top: null, groups: [] };
  const [top, ...rest] = hits;
  const byKind = new Map<SearchKind, Hit[]>();
  for (const h of rest) byKind.set(h.kind, [...(byKind.get(h.kind) ?? []), h]);
  const groups = Array.from(byKind, ([kind, hs]) => ({ kind, hits: hs })).sort(
    (a, b) => b.hits[0].score - a.hits[0].score || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind),
  );
  return { top, groups };
}
