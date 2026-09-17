import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { getLesson } from "@/lib/curriculum";
import { getLessonContent } from "@/content/lessons";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { ExamTraps } from "@/components/content/ExamTraps";
import { Breadcrumbs } from "@/components/lesson/Breadcrumbs";
import { LessonPager } from "@/components/lesson/LessonPager";

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
      </div>

      <h1 className="mt-3 font-display text-4xl">{ref.title}</h1>

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
            <section className="mt-10 max-w-3xl">
              <h2 className="font-display text-2xl">Key terms</h2>
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

          <section className="mt-10 max-w-3xl">
            <h2 className="font-display text-2xl">Sources</h2>
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
        <LessonPager slug={ref.slug} domainId={ref.domainId} />
      </div>
    </main>
  );
}
