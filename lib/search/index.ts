import type { Options, SearchOptions } from "minisearch";
import type { DomainNumber } from "@/content/schema";

/**
 * The search contract shared by both sides of the client boundary.
 *
 * The index is BUILT ON THE CLIENT from a static JSON document list
 * (`/search-index/<locale>.json`, emitted at build time by the route handlers
 * under app/search-index/). Shipping documents rather than a serialised index
 * keeps the download smaller, and keeps the full text at hand for snippets.
 * Both sides must agree on the options below, which is why they live here and
 * nowhere else.
 */

export type SearchKind = "lesson" | "section" | "term" | "trap" | "domain" | "page";

export interface SearchDoc {
  /** Unique across the whole index: "lesson:3-5-rag…", "term:3-5-rag…:chunking". */
  id: string;
  kind: SearchKind;
  title: string;
  /** Where the hit lives — "3.5 · Integration", or the lesson a term belongs to. */
  context: string;
  /** Plain text (markdown already stripped). Searched, and mined for snippets. */
  text: string;
  /** Locale-free; LocaleLink / localizeHref adds the prefix. May carry a `#`. */
  href: string;
  domainId?: DomainNumber;
}

/** "Avaliação" → "avaliacao": a reader typing without accents still hits
 *  accented Portuguese, and vice versa. Also folds case. */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Short function words in both languages. Indexing them only adds noise, and a
 *  query made of nothing else should honestly return nothing. */
const STOPWORDS = new Set(
  (
    "a an and are as at be by for from in is it of on or that the this to was with " +
    "o os um uma e sao ser as ao aos da das de do dos em na nas no nos ou por que se com para"
  ).split(" "),
);

/** MiniSearch tokenises on whitespace and punctuation but keeps "re-rank" whole
 *  via this override, so "rerank" (prefix, fuzzy) and "re-rank" both hit. */
const SPLIT = /[\s,.;:!?()[\]{}"'“”‘’«»/\\|<>=+*~`—–]+/u;

export const KIND_BOOST: Record<SearchKind, number> = {
  lesson: 1.35,
  term: 1.25,
  domain: 1.15,
  page: 1.1,
  section: 1,
  trap: 0.9,
};

export const SEARCH_OPTIONS: Options<SearchDoc> = {
  fields: ["title", "text"],
  storeFields: ["kind", "title", "context", "text", "href", "domainId"],
  tokenize: (text) => text.split(SPLIT),
  processTerm: (term) => {
    const t = fold(term).replace(/^-+|-+$/g, "");
    return t.length < 2 || STOPWORDS.has(t) ? null : t;
  },
  searchOptions: {
    prefix: true,
    // Typos only matter once a word is long enough to have any: "rag" must
    // not match "tag", while "chunkng" should still find chunking.
    fuzzy: (term) => (term.length >= 5 ? 0.2 : false),
    boost: { title: 3 },
    boostDocument: (_id, _term, stored) =>
      KIND_BOOST[(stored as Pick<SearchDoc, "kind"> | undefined)?.kind ?? "section"],
    combineWith: "AND",
  },
};

/** When every term must match but nothing does, relax to any term. */
export const RELAXED_SEARCH: SearchOptions = { combineWith: "OR" };
