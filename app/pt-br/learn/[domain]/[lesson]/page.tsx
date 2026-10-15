import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { LessonView, lessonMetadata } from "@/components/views/LessonView";

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
  return lessonMetadata((await params).lesson, "pt-br");
}

export default async function LessonPage({ params }: { params: Params }) {
  const { domain, lesson } = await params;
  return <LessonView domain={domain} lesson={lesson} locale="pt-br" />;
}
