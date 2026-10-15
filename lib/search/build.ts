import "server-only";

import type { Lesson, LessonBlock } from "@/content/schema";
import { getLessonContent } from "@/content/lessons";
import { domainsFor, lessonOrderFor, weightPercent } from "@/lib/curriculum";
import { getDict, type Locale } from "@/lib/i18n";
import { termId } from "@/lib/markdown";
import { slugify } from "@/lib/slug";
import type { SearchDoc } from "@/lib/search";

/**
 * Turns the whole curriculum into the flat document list the palette indexes.
 * Runs at BUILD TIME only (route handlers under app/search-index/), so the
 * lesson bodies it reads never reach a page bundle.
 *
 * One document per DESTINATION, not per lesson: a section, a key term and an
 * exam trap each get their own row with an anchored href, so a hit lands the
 * reader on the paragraph that matched rather than at the top of the page.
 */

/** Lesson markdown → plain text. Only the authoring syntax lib/markdown.ts
 *  understands is stripped; identifiers like `max_tokens` survive intact. */
export function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^:::\w*[ \t]*$/gm, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^[ \t]*(?:#{1,6}|>)[ \t]*/gm, "")
    .replace(/\*\*|__|==|~~|`/g, "")
    .replace(/(^|[\s(])[*_](?=\S)/g, "$1")
    .replace(/(?<=\S)[*_](?=[\s).,;:!?]|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The searchable words of one block, or nothing for blocks that are not prose. */
function blockText(b: LessonBlock): string {
  switch (b.kind) {
    case "prose":
      return plain(b.md);
    case "list":
      return b.items.map(plain).join(" ");
    case "callout":
      return [b.title, plain(b.md)].filter(Boolean).join(". ");
    case "table":
      return [b.caption, ...b.headers, ...b.rows.flat()]
        .filter((s): s is string => Boolean(s))
        .map(plain)
        .join(" ");
    case "example":
      return [b.title, plain(b.scenario), plain(b.walkthrough), plain(b.takeaway)].join(" ");
    case "code":
    case "heading":
    case "practice":
      return "";
  }
}

function lessonDocs(lesson: Lesson, href: string, context: string, domainId: Lesson["domain"], examTraps: string): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // Walk the body once, bucketing prose under the heading above it. The run
  // before the first heading is the lesson's own introduction.
  const sections: { heading: string | null; parts: string[] }[] = [{ heading: null, parts: [] }];
  for (const b of lesson.body) {
    if (b.kind === "heading") sections.push({ heading: b.text, parts: [] });
    else {
      const text = blockText(b);
      if (text) sections[sections.length - 1].parts.push(text);
    }
  }
  const intro = sections[0].parts.join(" ");

  docs.push({
    id: `lesson:${lesson.slug}`,
    kind: "lesson",
    title: lesson.title,
    context,
    text: [lesson.summary, lesson.objective, ...(lesson.keyTerms ?? []).map((k) => k.term), intro].join(" "),
    href,
    domainId,
  });

  for (const s of sections.slice(1)) {
    if (!s.heading) continue;
    docs.push({
      id: `section:${lesson.slug}:${slugify(s.heading)}`,
      kind: "section",
      title: s.heading,
      context: lesson.title,
      text: s.parts.join(" "),
      href: `${href}#${slugify(s.heading)}`,
      domainId,
    });
  }

  for (const k of lesson.keyTerms ?? []) {
    docs.push({
      id: `term:${lesson.slug}:${slugify(k.term)}`,
      kind: "term",
      title: k.term,
      context: lesson.title,
      text: k.definition,
      href: `${href}#${termId(k.term)}`,
      domainId,
    });
  }

  for (const t of lesson.traps) {
    docs.push({
      id: `trap:${lesson.slug}:${t.id}`,
      kind: "trap",
      title: plain(t.trap),
      context: `${examTraps} · ${lesson.title}`,
      text: [plain(t.why), t.instead ? plain(t.instead) : ""].join(" ").trim(),
      href: `${href}#exam-traps`,
      domainId,
    });
  }

  return docs;
}

export function buildSearchDocs(locale: Locale): SearchDoc[] {
  const t = getDict(locale);
  const docs: SearchDoc[] = [];

  for (const d of domainsFor(locale)) {
    docs.push({
      id: `domain:${d.slug}`,
      kind: "domain",
      title: d.title,
      context: `${t.lesson.domain(d.id)} · ${t.nav.weightOfExam(weightPercent(d.weight))}`,
      text: [d.blurb, ...d.objectives.map((o) => `${o.title}. ${o.text}`)].join(" "),
      href: `/learn/${d.slug}`,
      domainId: d.id,
    });
  }

  for (const ref of lessonOrderFor(locale)) {
    const context = `${ref.id} · ${ref.domainTitle}`;
    const content = getLessonContent(ref.slug, locale);
    if (content) {
      docs.push(...lessonDocs(content, ref.href, context, ref.domainId, t.lesson.examTraps));
    } else {
      docs.push({
        id: `lesson:${ref.slug}`,
        kind: "lesson",
        title: ref.title,
        context,
        text: ref.text,
        href: ref.href,
        domainId: ref.domainId,
      });
    }
  }

  const pages: [string, string, string][] = [
    ["/learn", t.nav.curriculum, t.learn.intro],
    ["/learn/drill", t.nav.drill, t.nav.drillHint],
    ["/learn/progress", t.nav.progress, t.nav.progressHint],
    ["/learn/checklist", t.nav.checklist, t.nav.checklistHint],
    ["/learn/flagged", t.nav.flagged, t.nav.flaggedHint],
    ["/mock-exam", t.nav.mockExam, t.nav.mockExamHint],
  ];
  for (const [href, title, text] of pages) {
    docs.push({ id: `page:${href}`, kind: "page", title, context: t.nav.studyTools, text, href });
  }

  return docs;
}
