"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "@/content/questions";
import { correctIdsOf, type Question } from "@/content/schema";
import type { CardState } from "@/lib/storage/schema";
import { useAppState, useHydrated } from "@/lib/storage/store";
import { setBookmarked } from "@/lib/drill/record";
import { easeOf } from "@/lib/drill/leitner";
import { getLessonByObjectiveFor, type LessonRef } from "@/lib/curriculum";
import { localizeHref, type Locale } from "@/lib/i18n";
import { useDict, useLocale } from "@/lib/i18n/client";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Enough of the stem to recognise it; the lesson link carries the rest. */
const STEM_PREVIEW = 140;

function preview(stem: string): string {
  if (stem.length <= STEM_PREVIEW) return stem;
  const cut = stem.slice(0, STEM_PREVIEW);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 80))}…`;
}

type FlaggedDict = ReturnType<typeof useDict>["tools"]["flagged"];

/**
 * One question as a prompt for an LLM tutor: the exact stem and choices, the
 * key, the learner's own rating, and where the question came from — the
 * lesson on this site, as an absolute link, plus a request to cite the
 * official Claude documentation page behind it. The bank's explanation is
 * deliberately left out: the point is a fresh, fuller explanation, not a
 * paraphrase of ours.
 */
export function buildQuestionPrompt(
  question: Question,
  card: CardState | undefined,
  lesson: LessonRef | undefined,
  locale: Locale,
  t: FlaggedDict,
  ease: Record<"easy" | "medium" | "hard", string>,
): string {
  const correct = correctIdsOf(question);
  const rating = easeOf(card);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const lessonUrl = lesson ? `${origin}${localizeHref(lesson.href, locale)}/` : "";
  const lines = [
    t.promptIntro,
    "",
    `${t.promptQuestion(question.objective)}${rating ? ` — ${t.promptRated(ease[rating])}` : ""}`,
    question.stem,
    ...question.choices.map((c) => `${c.id}) ${c.text}`),
    `${t.promptCorrect}: ${correct.join(", ")}`,
    "",
    lesson ? t.promptSource(lesson.id, lesson.title, lessonUrl) : t.promptSourceUnknown(question.objective),
    "",
    t.promptAsk,
  ];
  return lines.join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Per-row copy. `getText` runs on click so the absolute link reads the live origin. */
function CopyPromptButton({ getText, label }: { getText: () => string; label: string }) {
  const t = useDict().tools.flagged;
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(id);
  }, [state]);

  return (
    <button
      type="button"
      onClick={async () => setState((await copyText(getText())) ? "copied" : "failed")}
      aria-label={label}
      title={label}
      aria-live="polite"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        state === "copied"
          ? "border-success/50 bg-success-soft text-success"
          : state === "failed"
            ? "border-danger/50 bg-danger-soft text-danger"
            : "border-border text-fg-muted hover:border-accent hover:text-accent",
      )}
    >
      <Icon name={state === "copied" ? "check" : "prompt"} size={13} />
      {state === "copied" ? t.copied : state === "failed" ? t.copyFailed : t.copyPrompt}
    </button>
  );
}

export function FlaggedQuestions() {
  const hydrated = useHydrated();
  const state = useAppState();
  const locale = useLocale();
  const dict = useDict();
  const t = dict.tools.flagged;
  const ease = dict.tools.drill.ease;

  const items = useMemo(
    () =>
      hydrated
        ? QUESTIONS.filter((q) => state.drill.cards[q.id]?.bm === 1).map((q) => ({
            question: q,
            card: state.drill.cards[q.id],
          }))
        : [],
    [hydrated, state.drill.cards],
  );

  return (
    <main>
      <p className="text-sm font-medium text-accent">{dict.tools.eyebrowTools}</p>
      <h1 className="mt-3 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
        {t.title}
      </h1>
      <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-fg-muted">
        {t.intro}
      </p>

      <p className="tnum mt-6 text-sm text-fg-muted" aria-busy={!hydrated}>
        {hydrated ? t.count(items.length) : dict.tools.loading}
      </p>

      {hydrated && items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm leading-relaxed text-fg-muted">
          {t.empty}{" "}
          <LocaleLink href="/learn/drill" className="font-medium text-fg underline underline-offset-2">
            {dict.nav.drill} →
          </LocaleLink>
        </p>
      )}

      {items.length > 0 && (
        <ol className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {items.map(({ question, card }) => {
            const lesson = getLessonByObjectiveFor(question.objective, locale);
            const rating = easeOf(card);
            return (
              <li key={question.id} className="flex items-start gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-fg-muted">
                    {lesson && (
                      <LocaleLink
                        href={lesson.href}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
                      >
                        <span className="rounded-md border border-border px-1.5 py-0.5 font-medium normal-case tracking-normal text-fg">
                          {lesson.domainCode}
                        </span>
                        <span className="tnum font-semibold normal-case tracking-normal text-accent">
                          {lesson.id}
                        </span>
                        <span className="normal-case tracking-normal">{lesson.title}</span>
                      </LocaleLink>
                    )}
                    {/* The rating badge only exists for cards the drill has
                        graded; a flag set from elsewhere shows nothing. */}
                    {rating && (
                      <span
                        className={cn(
                          "rounded-md border px-1.5 py-0.5 font-medium normal-case tracking-normal",
                          rating === "easy" && "border-success/50 bg-success-soft text-success",
                          rating === "medium" && "border-border bg-surface-2 text-fg",
                          rating === "hard" && "border-danger/50 bg-danger-soft text-danger",
                        )}
                      >
                        {ease[rating]}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[0.9375rem] leading-snug" lang="en">
                    {preview(question.stem)}
                  </p>
                </div>
                <CopyPromptButton
                  label={t.copyPromptFor(lesson?.id ?? question.objective)}
                  getText={() => buildQuestionPrompt(question, card, lesson, locale, t, ease)}
                />
                <button
                  type="button"
                  onClick={() => setBookmarked(question.id, false)}
                  aria-label={t.unflag}
                  title={t.unflag}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-fg-muted/70 transition-colors hover:bg-surface-2 hover:text-danger"
                >
                  <Icon name="x" size={14} />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
