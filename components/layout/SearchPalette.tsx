"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { localizeHref, type Locale } from "@/lib/i18n";
import { useDict, useLocale } from "@/lib/i18n/client";
import type { SearchDoc, SearchKind } from "@/lib/search";
import {
  groupHits,
  loadSearchIndex,
  markTerms,
  runSearch,
  snippet,
  type Hit,
  type SearchIndex,
} from "@/lib/search/client";
import { DomainBadge, Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Spotlight for the curriculum: the magnifier in the top bar, or ⌘K / Ctrl+K
 * anywhere, opens a centred palette; results stream in as you type, grouped
 * under a single top hit, and ↑ ↓ ↵ drive it without leaving the input.
 *
 * A native <dialog> supplies the focus trap, Escape and the backdrop, as the
 * drawer and the drill's shortcut overlay already do. The dialog must NOT sit
 * inside a `data-focus-hide` wrapper: focus mode sets those to display:none,
 * and a modal inside one would open invisibly and swallow Escape.
 */

const KIND_ICON: Record<Exclude<SearchKind, "domain">, IconName> = {
  lesson: "book",
  section: "hash",
  term: "lightbulb",
  trap: "decoy",
  page: "arrow-right",
};

const PAGE_ICON: Record<string, IconName> = {
  "/learn": "grid",
  "/learn/drill": "zap",
  "/learn/progress": "chart",
  "/learn/checklist": "check-circle",
  "/learn/flagged": "flag",
  "/mock-exam": "target",
};

function iconFor(doc: SearchDoc): ReactNode {
  if (doc.kind === "domain" && doc.domainId) {
    return <DomainBadge domainId={doc.domainId} size={28} />;
  }
  const name = doc.kind === "page" ? (PAGE_ICON[doc.href] ?? "arrow-right") : KIND_ICON[doc.kind as Exclude<SearchKind, "domain">];
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-surface text-fg-muted">
      <Icon name={name} size={14} />
    </span>
  );
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {markTerms(text, terms).map((s, i) =>
        s.hit ? (
          <mark key={i} className="rounded-[3px] bg-accent/20 text-inherit">
            {s.text}
          </mark>
        ) : (
          s.text
        ),
      )}
    </>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1 font-mono text-[10px] text-fg-muted">
      {children}
    </kbd>
  );
}

interface Row {
  doc: SearchDoc;
  terms: string[];
  /** Only query results carry one; the empty-state shortcuts do not. */
  snippet?: string;
}

function Option({
  row,
  id,
  selected,
  locale,
  onHover,
  onPick,
}: {
  row: Row;
  id: string;
  selected: boolean;
  locale: Locale;
  onHover: () => void;
  onPick: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      id={id}
      role="option"
      aria-selected={selected}
      href={localizeHref(row.doc.href, locale)}
      tabIndex={-1}
      onPointerMove={onHover}
      onClick={onPick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors",
        selected ? "bg-accent-soft" : "hover:bg-surface-2",
      )}
    >
      {iconFor(row.doc)}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[0.875rem] font-medium leading-snug text-fg">
          <Marked text={row.doc.title} terms={row.terms} />
        </span>
        <span className="block truncate text-[11px] text-fg-muted">{row.doc.context}</span>
        {row.snippet && (
          <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-fg-muted">
            <Marked text={row.snippet} terms={row.terms} />
          </span>
        )}
      </span>
      <Icon
        name="arrow-right"
        size={14}
        className={cn("shrink-0 text-accent transition-opacity", selected ? "opacity-100" : "opacity-0")}
      />
    </a>
  );
}

const subscribeNever = () => () => {};
/** The platform's modifier, read once on the client; the prerender says ⌘K. */
const shortcutLabel = () =>
  /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘K" : "Ctrl+K";

function GroupLabel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      className="px-2.5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted/80"
    >
      {children}
    </p>
  );
}

export function SearchPalette() {
  const t = useDict().search;
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<{ locale: Locale; ix: SearchIndex } | null>(null);
  const [failed, setFailed] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const shortcut = useSyncExternalStore(subscribeNever, shortcutLabel, () => "⌘K");

  // Navigation closes the palette (same pattern as useDisclosure).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  function show() {
    setFailed(false);
    setOpen(true);
  }

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFailed(false);
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      inputRef.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  // The index loads on first open, once per locale, and is kept for the
  // session. A failed fetch is retried the next time the palette opens.
  useEffect(() => {
    if (!open || index?.locale === locale) return;
    let cancelled = false;
    loadSearchIndex(locale).then(
      (ix) => {
        if (!cancelled) setIndex({ locale, ix });
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [open, index, locale]);

  const ready = index?.locale === locale ? index.ix : null;
  const trimmed = query.trim();

  const hits = useMemo(() => (ready ? runSearch(ready, trimmed) : []), [ready, trimmed]);
  const { top, groups } = useMemo(() => groupHits(hits), [hits]);

  const toRow = (h: Hit): Row => ({ doc: h, terms: h.terms, snippet: snippet(h.text, h.terms) });
  const shortcuts: Row[] = useMemo(
    () => (ready ? ready.docs.filter((d) => d.kind === "page").map((doc) => ({ doc, terms: [] })) : []),
    [ready],
  );
  const rows: Row[] = trimmed
    ? [...(top ? [toRow(top)] : []), ...groups.flatMap((g) => g.hits.map(toRow))]
    : shortcuts;
  const current = Math.min(active, Math.max(0, rows.length - 1));
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  useEffect(() => {
    listRef.current
      ?.querySelector('[role="option"][aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [current, rows.length]);

  function go(doc: SearchDoc) {
    setOpen(false);
    router.push(localizeHref(doc.href, locale));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (rows.length === 0) return;
    const move = (n: number) => {
      e.preventDefault();
      setActive((n + rows.length) % rows.length);
    };
    if (e.key === "ArrowDown") move(current + 1);
    else if (e.key === "ArrowUp") move(current - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(rows.length - 1);
    else if (e.key === "Enter") {
      e.preventDefault();
      go(rows[current].doc);
    }
  }

  function pick(e: MouseEvent<HTMLAnchorElement>, doc: SearchDoc) {
    // Modified clicks keep native link behaviour (new tab, window…).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      setOpen(false);
      return;
    }
    e.preventDefault();
    go(doc);
  }

  let rowIndex = 0;
  const renderRow = (row: Row) => {
    const i = rowIndex++;
    return (
      <Option
        key={row.doc.id}
        row={row}
        id={optionId(i)}
        selected={i === current}
        locale={locale}
        onHover={() => setActive(i)}
        onPick={(e) => pick(e, row.doc)}
      />
    );
  };

  const listId = `${baseId}-list`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-focus-hide
        data-search-trigger
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Meta+K Control+K"
        aria-label={t.open(shortcut)}
        title={t.open(shortcut)}
        onClick={show}
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border px-2 text-fg-muted transition-colors hover:border-accent/60 hover:text-fg"
      >
        <Icon name="search" size={15} />
        <kbd className="hidden font-mono text-[10px] font-medium tracking-wide md:inline">{shortcut}</kbd>
      </button>

      <dialog
        ref={dialogRef}
        data-search
        aria-label={t.label}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          // Clicking the backdrop lands on the dialog element itself.
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="palette pointer-events-auto mx-auto mt-[12vh] mb-auto w-[min(92vw,40rem)] max-w-none rounded-2xl border border-border bg-surface p-0 text-fg shadow-[0_32px_80px_-24px_rgb(0_0_0/0.45)] backdrop:bg-ink-900/40 backdrop:backdrop-blur-[3px]"
      >
        {open && (
          <div className="flex max-h-[min(72vh,36rem)] flex-col">
            <div className="flex shrink-0 items-center gap-3 border-b border-border px-4">
              <Icon name="search" size={18} className="shrink-0 text-fg-muted" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={rows.length > 0}
                aria-controls={listId}
                aria-activedescendant={rows.length ? optionId(current) : undefined}
                aria-autocomplete="list"
                aria-label={t.label}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t.placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                className="h-14 min-w-0 flex-1 bg-transparent text-[1.0625rem] text-fg outline-none placeholder:text-fg-muted/70"
              />
              {query && (
                <button
                  type="button"
                  aria-label={t.keys.close}
                  onClick={() => {
                    setQuery("");
                    setActive(0);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex size-6 items-center justify-center rounded-md text-fg-muted hover:bg-surface-2 hover:text-fg"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
              <Kbd>esc</Kbd>
            </div>

            <div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={t.results}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
            >
              {!ready && !failed && (
                <p className="px-2.5 py-6 text-center text-[0.8125rem] text-fg-muted">{t.loading}</p>
              )}
              {failed && (
                <p className="px-2.5 py-6 text-center text-[0.8125rem] text-fg-muted">{t.error}</p>
              )}
              {ready && !trimmed && (
                <div role="group" aria-labelledby={`${baseId}-jump`}>
                  <GroupLabel id={`${baseId}-jump`}>{t.jumpTo}</GroupLabel>
                  {shortcuts.map(renderRow)}
                </div>
              )}
              {ready && trimmed && rows.length === 0 && (
                <p className="px-2.5 py-6 text-center text-[0.8125rem] text-fg-muted">
                  {t.noResults(trimmed)}
                </p>
              )}
              {ready && trimmed && top && (
                <div role="group" aria-labelledby={`${baseId}-top`}>
                  <GroupLabel id={`${baseId}-top`}>{t.topHit}</GroupLabel>
                  {renderRow(toRow(top))}
                </div>
              )}
              {ready &&
                trimmed &&
                groups.map((g) => (
                  <div key={g.kind} role="group" aria-labelledby={`${baseId}-${g.kind}`}>
                    <GroupLabel id={`${baseId}-${g.kind}`}>{t.kinds[g.kind]}</GroupLabel>
                    {g.hits.map((h) => renderRow(toRow(h)))}
                  </div>
                ))}
            </div>

            <footer className="flex shrink-0 items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-fg-muted">
              <span className="inline-flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> {t.keys.navigate}
              </span>
              <span className="inline-flex items-center gap-1">
                <Kbd>↵</Kbd> {t.keys.open}
              </span>
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Kbd>esc</Kbd> {t.keys.close}
              </span>
            </footer>
          </div>
        )}
      </dialog>
    </>
  );
}
