import Link from "next/link";
import { neighbours } from "@/lib/curriculum";

/**
 * Prev/next across the flat 38-lesson order, so the last lesson of a domain
 * links straight into the first of the next. The domain name is shown when the
 * neighbour crosses a boundary.
 */
export function LessonPager({
  slug,
  domainId,
}: {
  slug: string;
  domainId: number;
}) {
  const { prev, next } = neighbours(slug);

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-card border border-border p-4 transition-colors hover:border-accent"
        >
          <span className="text-xs text-fg-muted">← Previous</span>
          {prev.domainId !== domainId && (
            <span className="mt-1 block text-[11px] uppercase tracking-wide text-fg-muted">
              {prev.domainTitle}
            </span>
          )}
          <span className="mt-1 block font-medium group-hover:text-accent">
            <span className="tnum text-fg-muted">{prev.id}</span> {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={next.href}
          className="group rounded-card border border-border p-4 text-right transition-colors hover:border-accent sm:col-start-2"
        >
          <span className="text-xs text-fg-muted">Next →</span>
          {next.domainId !== domainId && (
            <span className="mt-1 block text-[11px] uppercase tracking-wide text-fg-muted">
              {next.domainTitle}
            </span>
          )}
          <span className="mt-1 block font-medium group-hover:text-accent">
            <span className="tnum text-fg-muted">{next.id}</span> {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
