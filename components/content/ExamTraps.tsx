import { mdInline } from "@/lib/markdown";
import type { ExamTrap } from "@/content/schema";
import { SectionHeading } from "@/components/content/SectionHeading";
import { Icon } from "@/components/ui/Icon";

/**
 * Each trap states the tempting wrong answer, why it is wrong, and what is
 * correct instead. Rendered as a definition-style list rather than prose so
 * the three parts stay visually distinct while skimming.
 */
export function ExamTraps({
  traps,
  id,
  title,
  anchorLabel,
}: {
  traps: ExamTrap[];
  id: string;
  title: string;
  anchorLabel: string;
}) {
  if (traps.length === 0) return null;
  return (
    <section>
      <SectionHeading id={id} anchorLabel={anchorLabel}>
        {title}
      </SectionHeading>
      <ul className="mt-5 space-y-4">
        {traps.map((t) => (
          <li
            key={t.id}
            className="prose-reading rounded-2xl border border-border bg-surface p-5 text-aux"
          >
            <p className="!my-0 flex gap-3 font-medium">
              <Icon name="x-circle" size={18} className="mt-[0.22em] text-danger" />
              <span dangerouslySetInnerHTML={{ __html: mdInline(t.trap) }} />
            </p>
            <p
              className="!mb-0 !mt-2.5 pl-[1.875rem] text-fg-muted"
              dangerouslySetInnerHTML={{ __html: mdInline(t.why) }}
            />
            {t.instead && (
              <p className="!mb-0 !mt-3 flex gap-3">
                <Icon name="check-circle" size={18} className="mt-[0.22em] text-success" />
                <span
                  dangerouslySetInnerHTML={{ __html: mdInline(t.instead) }}
                />
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
