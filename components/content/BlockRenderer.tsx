import type { LessonBlock } from "@/content/schema";
import { md, mdInline } from "@/lib/markdown";
import { Prose } from "@/components/content/Prose";
import { Callout } from "@/components/content/Callout";
import { PracticeScenario } from "@/components/lesson/PracticeScenario";
import { getQuestion } from "@/content/questions";
import { SectionHeading, SubHeading, headingId } from "@/components/content/SectionHeading";

/**
 * Server-side switch over the LessonBlock discriminated union, with a `never`
 * exhaustiveness check: adding a block kind to the schema breaks the build
 * until it is rendered here.
 */
export function BlockRenderer({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "prose":
      return <Prose source={block.md} />;

    case "heading":
      return (
        <SectionHeading id={headingId(block.text)}>{block.text}</SectionHeading>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`my-4 space-y-1.5 pl-5 ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, i) => (
            <li
              key={i}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mdInline(item) }}
            />
          ))}
        </Tag>
      );
    }

    case "callout":
      return (
        <Callout
          variant={block.variant}
          title={block.title}
          source={block.md}
        />
      );

    case "table":
      return (
        <figure className="my-6">
          {/* Tables are the one thing allowed to scroll horizontally. */}
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2">
                  {block.headers.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="border-b border-border px-3 py-2 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 align-top leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: mdInline(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-xs text-fg-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "code":
      return (
        <pre className="my-5 overflow-x-auto rounded-card border border-border bg-surface-2 p-4 text-[13px] leading-relaxed">
          <code className="font-mono">{block.code}</code>
        </pre>
      );

    case "example":
      return (
        <section className="my-6 rounded-card border border-border bg-surface p-5">
          <SubHeading className="mt-0">{block.title}</SubHeading>
          <div
            className="mt-3 text-sm leading-relaxed [&_p]:my-2"
            dangerouslySetInnerHTML={{ __html: md(block.scenario) }}
          />
          <div
            className="mt-3 border-l border-border pl-4 text-sm leading-relaxed text-fg-muted [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2"
            dangerouslySetInnerHTML={{ __html: md(block.walkthrough) }}
          />
          <p className="mt-3 text-sm font-medium">
            <span className="text-accent">Takeaway · </span>
            <span
              dangerouslySetInnerHTML={{ __html: mdInline(block.takeaway) }}
            />
          </p>
        </section>
      );

    case "practice": {
      const question = getQuestion(block.questionId);
      // The validator guarantees this resolves; render nothing rather than
      // crashing a page if a question is mid-authoring.
      if (!question) return null;
      return <PracticeScenario question={question} />;
    }

    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
