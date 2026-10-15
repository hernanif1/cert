import type { LessonRef } from "@/lib/curriculum";
import type { Dict } from "@/lib/i18n";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";

export function Breadcrumbs({ lesson, t }: { lesson: LessonRef; t: Dict }) {
  return (
    <nav aria-label={t.lesson.breadcrumb} className="text-[0.8125rem] text-fg-muted">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <LocaleLink href="/learn" className="transition-colors hover:text-fg">
            {t.lesson.learn}
          </LocaleLink>
        </li>
        <li aria-hidden="true" className="opacity-50">
          <Icon name="chevron-right" size={13} />
        </li>
        <li>
          <LocaleLink
            href={`/learn/${lesson.domainSlug}`}
            className="transition-colors hover:text-domain"
          >
            {lesson.domainTitle}
          </LocaleLink>
        </li>
        <li aria-hidden="true" className="opacity-50">
          <Icon name="chevron-right" size={13} />
        </li>
        <li className="tnum font-medium text-fg" aria-current="page">
          {lesson.id}
        </li>
      </ol>
    </nav>
  );
}
