import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { getLesson } from "@/lib/curriculum";
import { getLessonContent } from "@/content/lessons";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { ExamTraps } from "@/components/content/ExamTraps";
import { SectionHeading } from "@/components/content/SectionHeading";
import { Breadcrumbs } from "@/components/lesson/Breadcrumbs";
import { LessonPager } from "@/components/lesson/LessonPager";
import { MarkComplete } from "@/components/lesson/MarkComplete";

export const dynamicParams = false;

/** Enumerates all 38 lesson routes from the blueprint. */
export function generateStaticParams() {
  return DOMAINS.flatMap((d) =>
    d.objectives.map((o) => ({ domain: d.slug, lesson: o.slug })),
  );
}

type Params = Promise<{ domain: string; lesson: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lesson } = await params;
  const ref = getLesson(lesson);
  if (!ref) return {};
  const content = getLessonContent(lesson);
  return {
    title: `${ref.id} ${ref.title}`,
    description: content?.summary ?? ref.text,
  };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { domain, lesson } = await params;
  const ref = getLesson(lesson);
  // Guard the pairing too: a valid lesson slug under the wrong domain is a 404.
  if (!ref || ref.domainSlug !== domain) notFound();

  const content = getLessonContent(lesson);

  return (
    <main>
      <Breadcrumbs lesson={ref} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded border border-border px-2 py-0.5 text-[11px] font-medium text-fg-muted">
          Domain {ref.domainId}
        </span>
        <span className="tnum rounded border border-accent/40 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
          Task {ref.id}
        </span>
        <span className="ml-auto">
          <MarkComplete slug={ref.slug} />
        </span>
      </div>

      <h1 className="mt-3 font-display text-4xl leading-[1.15] tracking-[-0.02em]">
        {ref.title}
      </h1>

      <p className="mt-3 max-w-2xl border-l-2 border-border pl-4 text-sm leading-relaxed text-fg-muted">
        <span className="font-medium text-fg">Objective · </span>
        {ref.text}
      </p>

      {content ? (
        <>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            {content.summary}
          </p>

          <div className="mt-8 max-w-3xl">
            <BlockRenderer blocks={content.body} />
          </div>

          <div className="max-w-3xl">
            <ExamTraps traps={content.traps} />
          </div>

          {content.keyTerms && content.keyTerms.length > 0 && (
            <section className="max-w-3xl">
              <SectionHeading>Key terms</SectionHeading>
              <dl className="mt-3 divide-y divide-border border-y border-border">
                {content.keyTerms.map((k) => (
                  <div key={k.term} className="py-3">
                    <dt className="text-sm font-medium">{k.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-fg-muted">
                      {k.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="max-w-3xl">
            <SectionHeading>Sources</SectionHeading>
            <ul className="mt-3 space-y-1.5 text-sm">
              {content.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    className="text-accent underline underline-offset-2"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p className="mt-8 max-w-2xl rounded-card border border-dashed border-border p-5 text-sm leading-relaxed text-fg-muted">
          This lesson has not been written yet. The route, navigation and
          progress tracking all work — only the prose is pending.
        </p>
      )}

      <div className="max-w-3xl">
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <MarkComplete slug={ref.slug} />
          <Link
            href="/learn/drill"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
          >
            Drill this domain
          </Link>
          <Link
            href={`/learn/${ref.domainSlug}`}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
          >
            All of {ref.domainTitle}
          </Link>
        </div>
        <LessonPager slug={ref.slug} domainId={ref.domainId} />
      </div>
    </main>
  );
}
