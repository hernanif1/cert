"use client";

import { useHydrated } from "@/lib/storage/store";
import {
  useChecklistChecked,
  useChecklistGroupProgress,
  useChecklistProgress,
  toggleChecklistItem,
} from "@/lib/storage/hooks";
import {
  checklistFor,
  groupIds,
  type ResolvedChecklistGroup,
  type ResolvedChecklistItem,
} from "@/lib/checklist";
import { domainsFor } from "@/lib/curriculum";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { Icon, DOMAIN_ICON } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Self-assessment checklist.
 *
 * Every row and every group count is its OWN subscriber to the store, so
 * ticking one box re-renders that row, its group header and the total — not
 * twenty-four rows. Same reasoning as the selector hooks in lib/storage/hooks.
 *
 * Boxes stay disabled until useHydrated() is true. The first client render has
 * to match the prerendered HTML exactly (every box empty), and a box that
 * renders unticked and then fills in under the reader's cursor is worse than a
 * box that is briefly inert.
 */

function ChecklistRow({ item }: { item: ResolvedChecklistItem }) {
  const hydrated = useHydrated();
  const checked = useChecklistChecked(item.id);
  const dict = useDict();
  const t = dict.tools.checklist;
  const inputId = `check-${item.id}`;

  return (
    <li className="flex items-start gap-3 py-3">
      <input
        id={inputId}
        type="checkbox"
        checked={hydrated && checked}
        disabled={!hydrated}
        aria-busy={!hydrated}
        onChange={() => toggleChecklistItem(item.id)}
        className="mt-0.5 size-[1.05rem] shrink-0 cursor-pointer accent-accent disabled:cursor-default"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={inputId}
          className={cn(
            "block cursor-pointer text-[0.9375rem] leading-snug transition-colors",
            hydrated && checked ? "text-fg-muted line-through decoration-border" : "text-fg",
          )}
        >
          {item.text}
        </label>
        {item.href && (
          <LocaleLink
            href={item.href}
            title={item.lesson ? t.openLesson(item.text) : undefined}
            className="mt-1 inline-flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-domain"
          >
            {item.lesson ? (
              <>
                <span className="tnum font-semibold text-domain">{item.lesson.id}</span>
                {item.lesson.title}
              </>
            ) : (
              // The only non-lesson destination; its label is the nav's, so the
              // row never invents a second name for a page that already has one.
              dict.nav.mockExam
            )}
            <Icon name="arrow-right" size={12} />
          </LocaleLink>
        )}
      </div>
    </li>
  );
}

function GroupCount({ ids, title }: { ids: string[]; title: string }) {
  const hydrated = useHydrated();
  const { done, total } = useChecklistGroupProgress(ids);
  const t = useDict().tools.checklist;
  return (
    <span
      className="tnum text-xs text-fg-muted"
      aria-busy={!hydrated}
      aria-label={hydrated ? t.groupAria(title, done, total) : undefined}
    >
      {hydrated ? done : "—"}/{total}
    </span>
  );
}

function Group({
  group,
  title,
  code,
}: {
  group: ResolvedChecklistGroup;
  title: string;
  code: string | null;
}) {
  const isPrep = group.domain === "prep";
  return (
    <section
      // Drives the --domain colour token, exactly as the dashboard rows do.
      data-domain={isPrep ? undefined : group.domain}
      className="mt-6 rounded-2xl border border-border bg-surface px-5 py-4"
    >
      <div className="flex items-baseline gap-2.5">
        <Icon
          name={group.domain === "prep" ? "flag" : DOMAIN_ICON[group.domain]}
          size={16}
          className={cn("shrink-0 translate-y-0.5", isPrep ? "text-accent" : "text-domain")}
        />
        <h2 className="min-w-0 flex-1 font-display text-lg leading-snug">
          {code && <span className="tnum mr-2 text-sm text-domain">{code}</span>}
          {title}
        </h2>
        <GroupCount ids={groupIds(group)} title={title} />
      </div>
      <ul className="mt-2 divide-y divide-border">
        {group.items.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function Summary() {
  const hydrated = useHydrated();
  const { done, total, pct } = useChecklistProgress();
  const t = useDict().tools.checklist;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
      <div className="tnum flex items-baseline justify-between">
        <p className="font-display text-2xl" aria-busy={!hydrated}>
          {hydrated ? (
            t.checked(done, total)
          ) : (
            <span className="inline-block h-7 w-40 animate-pulse rounded bg-surface-2 align-middle" />
          )}
        </p>
        <p className="text-sm text-fg-muted">{hydrated ? `${pct}%` : "—"}</p>
      </div>
      <div className="mt-3">
        <ProgressBar
          value={hydrated ? pct : 0}
          label={t.progressAria}
          tone={hydrated && done === total ? "success" : "accent"}
        />
      </div>
      {hydrated && done === total && (
        <p className="mt-4 rounded-md border-l-2 border-success/50 bg-success/[0.07] px-4 py-3 text-sm leading-relaxed">
          {t.allChecked}
        </p>
      )}
    </section>
  );
}

export function ChecklistPage() {
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.checklist;
  const domains = domainsFor(locale);

  return (
    <main>
      <p className="text-sm font-medium text-accent">{dict.tools.eyebrowTools}</p>
      <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
        {t.title}
      </h1>
      <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-fg-muted">
        {t.intro}
      </p>

      <Summary />

      {checklistFor(locale).map((group) => {
        const domain =
          group.domain === "prep"
            ? undefined
            : domains.find((d) => d.id === group.domain);
        return (
          <Group
            key={String(group.domain)}
            group={group}
            title={domain?.title ?? t.prepGroup}
            code={domain?.code ?? null}
          />
        );
      })}
    </main>
  );
}
