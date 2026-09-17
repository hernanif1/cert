import Link from "next/link";
import type { LessonRef } from "@/lib/curriculum";

export function Breadcrumbs({ lesson }: { lesson: LessonRef }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-fg-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/learn" className="transition-colors hover:text-accent">
            Learn
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={`/learn/${lesson.domainSlug}`}
            className="transition-colors hover:text-accent"
          >
            {lesson.domainTitle}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="tnum text-fg" aria-current="page">
          {lesson.id}
        </li>
      </ol>
    </nav>
  );
}
