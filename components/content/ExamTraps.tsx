import { mdInline } from "@/lib/markdown";
import type { ExamTrap } from "@/content/schema";

/**
 * Each trap states the tempting wrong answer, why it is wrong, and what is
 * correct instead. Rendered as a definition-style list rather than prose so
 * the three parts stay visually distinct while skimming.
 */
export function ExamTraps({ traps }: { traps: ExamTrap[] }) {
  if (traps.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Exam Traps</h2>
      <ul className="mt-4 space-y-4">
        {traps.map((t) => (
          <li
            key={t.id}
            className="rounded-card border border-border bg-surface p-4"
          >
            <p className="flex gap-2 text-sm font-medium">
              <span aria-hidden="true" className="text-danger">
                ✗
              </span>
              <span dangerouslySetInnerHTML={{ __html: mdInline(t.trap) }} />
            </p>
            <p
              className="mt-2 pl-6 text-sm leading-relaxed text-fg-muted"
              dangerouslySetInnerHTML={{ __html: mdInline(t.why) }}
            />
            {t.instead && (
              <p className="mt-2 flex gap-2 pl-6 text-sm leading-relaxed">
                <span aria-hidden="true" className="text-success">
                  ✓
                </span>
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
