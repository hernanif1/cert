import Link from "next/link";
import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { EXAM } from "@/content/exam-facts";
import { domainNumberLabel, TOTAL_LESSONS, weightPercent } from "@/lib/curriculum";

export const metadata: Metadata = {
  title: "Curriculum",
  description: `All ${DOMAINS.length} domains and ${TOTAL_LESSONS} objectives of the ${EXAM.code} exam blueprint.`,
};

const FACTS: [string, string][] = [
  ["Items", String(EXAM.itemCount)],
  ["Time", `${EXAM.minutes} min`],
  ["Pass", `${EXAM.passScaled}/${EXAM.scaleMax}`],
  ["Domains", String(DOMAINS.length)],
  ["Objectives", String(TOTAL_LESSONS)],
];

export default function LearnPage() {
  return (
    <main>
      <p className="text-sm font-medium text-accent">Curriculum</p>
      <h1 className="mt-2 font-display text-4xl">{EXAM.credential}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
        Seven content domains, weighted exactly as the published blueprint
        weights them. Each objective below is one lesson.
      </p>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4">
        {FACTS.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] uppercase tracking-wide text-fg-muted">
              {label}
            </dt>
            <dd className="tnum font-display text-xl">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-8 space-y-3">
        {DOMAINS.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/learn/${d.slug}`}
              className="group block rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-baseline gap-3">
                <span className="tnum font-display text-2xl text-fg-muted/60">
                  {domainNumberLabel(d.id)}
                </span>
                <h2 className="flex-1 font-display text-xl group-hover:text-accent">
                  {d.title}
                </h2>
                <span className="tnum text-sm font-medium text-accent">
                  {weightPercent(d.weight)}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
                {d.blurb}
              </p>
              <p className="tnum mt-3 text-xs text-fg-muted">
                {d.objectives.length} lessons · {d.mockItemCount} of{" "}
                {EXAM.itemCount} mock items
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
