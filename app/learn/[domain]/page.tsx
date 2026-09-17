import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { EXAM } from "@/content/exam-facts";
import { getDomain, domainNumberLabel, weightPercent } from "@/lib/curriculum";

// output:'export' requires this — an unknown param must not be rendered on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const d = getDomain(domain);
  if (!d) return {};
  return {
    title: `${d.title} (${weightPercent(d.weight)})`,
    description: d.blurb,
  };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const d = getDomain(domain);
  if (!d) notFound();

  return (
    <main>
      <Link
        href="/learn"
        className="text-sm text-fg-muted transition-colors hover:text-accent"
      >
        ← Curriculum
      </Link>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="tnum font-display text-3xl text-fg-muted/60">
          {domainNumberLabel(d.id)}
        </span>
        <h1 className="flex-1 font-display text-4xl">{d.title}</h1>
        <span className="tnum text-lg font-medium text-accent">
          {weightPercent(d.weight)}
        </span>
      </div>

      <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">{d.blurb}</p>
      <p className="tnum mt-2 text-xs text-fg-muted">
        {d.objectives.length} lessons · contributes {d.mockItemCount} of{" "}
        {EXAM.itemCount} items to a mock form
      </p>

      <h2 className="mt-10 font-display text-lg">Task statements</h2>
      <ul className="mt-3 divide-y divide-border border-y border-border">
        {d.objectives.map((o) => (
          <li key={o.slug}>
            <Link
              href={`/learn/${d.slug}/${o.slug}`}
              className="group flex gap-4 py-4 transition-colors hover:bg-surface-2"
            >
              <span className="tnum w-10 shrink-0 pl-1 text-sm font-medium text-accent">
                {o.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:text-accent">
                  {o.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-fg-muted">
                  {o.text}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
