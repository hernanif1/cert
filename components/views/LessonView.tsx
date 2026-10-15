import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Lesson } from "@/content/schema";
import { getLessonFor } from "@/lib/curriculum";
import { getDict, type Locale } from "@/lib/i18n";
import { getLessonContent } from "@/content/lessons";
import { termId, type TermRef } from "@/lib/markdown";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { ExamTraps } from "@/components/content/ExamTraps";
import { SectionHeading, headingId } from "@/components/content/SectionHeading";
import { Breadcrumbs } from "@/components/lesson/Breadcrumbs";
import { LessonPager } from "@/components/lesson/LessonPager";
import { MarkComplete } from "@/components/lesson/MarkComplete";
import { ReadingProgress } from "@/components/lesson/ReadingProgress";
import { Toc, type TocItem } from "@/components/lesson/Toc";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { DomainBadge, Icon } from "@/components/ui/Icon";

export function lessonMetadata(slug: string, locale: Locale): Metadata {
  const ref = getLessonFor(slug, locale);
  if (!ref) return {};
  const content = getLessonContent(slug, locale);
  return {
    title: `${ref.id} ${ref.title}`,
    description: content?.summary ?? ref.text,
  };
}

/** ~220 wpm for dense technical prose; tables and code read slower, so their
 *  words count too. Rounded up — nobody minds finishing early. */
function readingMinutes(lesson: Lesson): number {
  const words = JSON.stringify([lesson.summary, lesson.body, lesson.traps])
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

const SECTION = { traps: "exam-traps", terms: "key-terms", sources: "sources" };

export function LessonView({
  domain,
  lesson,
  locale,
}: {
  domain: string;
  lesson: string;
  locale: Locale;
}) {
  const ref = getLessonFor(lesson, locale);
  // Guard the pairing too: a valid lesson slug under the wrong domain is a 404.
  if (!ref || ref.domainSlug !== domain) notFound();

  const t = getDict(locale);
  const content = getLessonContent(lesson, locale);

  const terms: TermRef[] = (content?.keyTerms ?? []).map((k) => ({
    term: k.term,
    id: termId(k.term),
    definition: k.definition,
  }));

  const toc: TocItem[] = content
    ? [
        ...content.body.flatMap((b) =>
          b.kind === "heading" ? [{ id: headingId(b.text), text: b.text }] : [],
        ),
        ...(content.traps.length
          ? [{ id: SECTION.traps, text: t.lesson.examTraps }]
          : []),
        ...(terms.length ? [{ id: SECTION.terms, text: t.lesson.keyTerms }] : []),
        { id: SECTION.sources, text: t.lesson.sources },
      ]
    : [];

  return (
    // data-domain re-points --domain for everything below: bullets, heading
    // rules, highlights, the selection colour, the progress bar.
    <main data-domain={ref.domainId}>
      {content && (
        <ReadingProgress targetId="lesson-article" label={t.lesson.readingProgress} />
      )}

      <div data-focus-center className="toc:grid toc:grid-cols-[minmax(0,var(--container-reading))_13rem] toc:gap-16">
        <article id="lesson-article" className="min-w-0 max-w-reading">
          <Breadcrumbs lesson={ref} t={t} />

          <header className="mt-7">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
              <DomainBadge domainId={ref.domainId} size={44} draw />
              <div className="min-w-[13rem] flex-1 text-[0.8125rem] leading-snug">
                <p className="font-semibold uppercase tracking-[0.08em] text-domain">
                  <span className="text-[11px]">
                    {t.lesson.domain(ref.domainId)} · {t.lesson.task(ref.id)}
                  </span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-fg-muted">
                  <span>{ref.domainTitle}</span>
                  {content && (
                    <span className="tnum inline-flex items-center gap-1.5">
                      <Icon name="clock" size={13} />
                      {t.lesson.readingTime(readingMinutes(content))}
                    </span>
                  )}
                </p>
              </div>
              <MarkComplete slug={ref.slug} />
            </div>

            <h1 className="mt-7 font-display text-[2.25rem] leading-[1.12] tracking-[-0.022em] sm:text-[2.75rem]">
              {ref.title}
            </h1>

            <p className="mt-6 rounded-xl bg-surface-2 px-4 py-3.5 text-aux text-fg-muted">
              <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-domain">
                {t.lesson.objective}
              </span>
              {ref.text}
            </p>
          </header>

          {content ? (
            <>
              <p className="mt-9 font-display text-lede text-fg">
                {content.summary}
              </p>

              <div className="mt-10 text-reading">
                <BlockRenderer blocks={content.body} terms={terms} t={t} />
              </div>

              <ExamTraps
                traps={content.traps}
                id={SECTION.traps}
                title={t.lesson.examTraps}
                anchorLabel={t.lesson.linkToSection(t.lesson.examTraps)}
              />

              {content.keyTerms && content.keyTerms.length > 0 && (
                <section>
                  <SectionHeading
                    id={SECTION.terms}
                    anchorLabel={t.lesson.linkToSection(t.lesson.keyTerms)}
                  >
                    {t.lesson.keyTerms}
                  </SectionHeading>
                  <dl className="mt-4 divide-y divide-border border-y border-border">
                    {content.keyTerms.map((k) => (
                      <div
                        key={k.term}
                        id={termId(k.term)}
                        className="term-row scroll-mt-24 py-4 transition-colors"
                      >
                        <dt className="text-aux font-semibold">{k.term}</dt>
                        <dd className="mt-1.5 text-aux text-fg-muted">
                          {k.definition}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section>
                <SectionHeading
                  id={SECTION.sources}
                  anchorLabel={t.lesson.linkToSection(t.lesson.sources)}
                >
                  {t.lesson.sources}
                </SectionHeading>
                <ul className="mt-4 space-y-2.5 text-aux">
                  {content.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        className="link inline-flex items-baseline gap-1.5"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.label}
                        <Icon name="external-link" size={13} className="self-center" />
                        <span className="sr-only">({t.lesson.opensInNewTab})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-border p-5 text-aux text-fg-muted">
              {t.lesson.notWritten}
            </p>
          )}

          <footer className="mt-16 border-t border-border pt-7">
            <div className="flex flex-wrap items-center gap-3">
              <MarkComplete slug={ref.slug} />
              <LocaleLink
                href="/learn/drill"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-[0.8125rem] font-medium transition-colors hover:border-accent/60"
              >
                <Icon name="zap" size={15} />
                {t.lesson.drillDomain}
              </LocaleLink>
              <LocaleLink
                href={`/learn/${ref.domainSlug}`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-[0.8125rem] font-medium transition-colors hover:border-domain/60"
              >
                <Icon name="grid" size={15} />
                {t.lesson.allOf(ref.domainTitle)}
              </LocaleLink>
            </div>
            <LessonPager
              slug={ref.slug}
              domainId={ref.domainId}
              locale={locale}
              t={t}
            />
          </footer>
        </article>

        {toc.length > 1 && (
          <aside data-focus-hide className="hidden toc:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-4">
              <Toc
                items={toc}
                title={t.lesson.onThisPage}
                backToTop={t.lesson.backToTop}
              />
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
