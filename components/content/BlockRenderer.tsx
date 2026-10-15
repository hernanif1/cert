import type { LessonBlock, Question } from "@/content/schema";
import type { Dict } from "@/lib/i18n";
import { md, mdInline, mdListItem, linkTerms, type TermRef } from "@/lib/markdown";
import { Prose } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { CodeBlock } from "@/components/content/CodeBlock";
import { PracticeScenario } from "@/components/lesson/PracticeScenario";
import { getQuestion } from "@/content/questions";
import { SectionHeading, SubHeading, headingId } from "@/components/content/SectionHeading";
import { Icon } from "@/components/ui/Icon";

/**
 * Server-side switch over the LessonBlock discriminated union, with a `never`
 * exhaustiveness check: adding a block kind to the schema breaks the build
 * until it is rendered here.
 *
 * Markdown is rendered in one ordered PRE-PASS rather than inside each block,
 * because key-term linking is stateful — "first mention on the page" only
 * means something if the blocks are visited in reading order.
 */
export function BlockRenderer({
  blocks,
  terms = [],
  t,
}: {
  blocks: LessonBlock[];
  terms?: TermRef[];
  t: Dict;
}) {
  const seen = new Set<string>();
  const link = (html: string) => linkTerms(html, terms, seen, t.lesson.seeDefinition);

  const html = blocks.map((block): string | string[] | null => {
    switch (block.kind) {
      case "prose":
        return link(md(block.md));
      case "callout":
        return link(md(block.md));
      case "list":
        return block.items.map((item) => link(mdListItem(item)));
      case "example":
        return [
          link(md(block.scenario)),
          link(md(block.walkthrough)),
          link(mdInline(block.takeaway)),
        ];
      default:
        return null;
    }
  });

  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} html={html[i]} t={t} />
      ))}
    </>
  );
}

function Block({
  block,
  html,
  t,
}: {
  block: LessonBlock;
  html: string | string[] | null;
  t: Dict;
}) {
  switch (block.kind) {
    case "prose":
      return <Prose html={html as string} />;

    case "heading":
      return (
        <SectionHeading
          id={headingId(block.text)}
          anchorLabel={t.lesson.linkToSection(block.text)}
        >
          {block.text}
        </SectionHeading>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <div className="prose-reading">
          <Tag>
            {(html as string[]).map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </Tag>
        </div>
      );
    }

    case "callout":
      return (
        <Callout
          variant={block.variant}
          title={block.title ?? t.callout[block.variant]}
          html={html as string}
        />
      );

    case "table":
      return (
        <figure className="my-9">
          {/* Tables are the one thing allowed to scroll horizontally. */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-aux">
              <thead>
                <tr className="bg-surface-2">
                  {block.headers.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 even:bg-surface-2/40">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="prose-reading px-4 py-3 align-top first:font-medium"
                        dangerouslySetInnerHTML={{ __html: mdInline(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-[0.8125rem] text-fg-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "code":
      return <CodeBlock code={block.code} lang={block.lang} />;

    case "example":
      return (
        <section className="my-9 rounded-2xl border border-border bg-surface p-5 sm:p-7">
          <SubHeading className="mt-0">{block.title}</SubHeading>
          <div
            className="prose-reading mt-3 text-aux [&_p]:my-2.5"
            dangerouslySetInnerHTML={{ __html: (html as string[])[0] }}
          />
          <div
            className="prose-reading mt-4 border-l-2 border-domain/40 pl-4 text-aux text-fg-muted [&_li]:my-1.5 [&_p]:my-2.5"
            dangerouslySetInnerHTML={{ __html: (html as string[])[1] }}
          />
          <p className="prose-reading mt-5 flex gap-2.5 rounded-xl bg-domain-soft px-4 py-3 text-aux font-medium">
            <Icon name="check-circle" size={18} className="mt-[0.2em] text-domain" />
            <span>
              <span className="text-domain">{t.lesson.takeaway} · </span>
              <span
                dangerouslySetInnerHTML={{ __html: (html as string[])[2] }}
              />
            </span>
          </p>
        </section>
      );

    case "practice": {
      // The validator guarantees these resolve; drop what does not rather than
      // crashing a page if a question is mid-authoring.
      const questions = block.questionIds
        .map((id) => getQuestion(id))
        .filter((q): q is Question => q !== undefined);
      if (questions.length === 0) return null;
      return <PracticeScenario questions={questions} />;
    }

    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
