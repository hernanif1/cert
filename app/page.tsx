import Link from "next/link";
import { EXAM } from "@/content/exam-facts";

const FACTS: [string, string][] = [
  ["Items", String(EXAM.itemCount)],
  ["Time limit", `${EXAM.minutes} minutes`],
  ["Passing score", `${EXAM.passScaled} of ${EXAM.scaleMax}`],
  ["Exam fee", `$${EXAM.feeUsd} USD`],
  ["Validity", `${EXAM.validityMonths} months`],
  ["Exam code", EXAM.code],
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6">
      <p className="text-sm font-medium text-accent">
        Unofficial study guide
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
        {EXAM.credential}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
        Seven weighted domains, thirty-eight objectives, and a spaced-repetition
        drill built directly from the published exam blueprint. Everything runs
        in your browser; your progress never leaves this device.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/learn"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          Start studying
        </Link>
        <Link
          href="/learn/progress"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent"
        >
          Progress dashboard
        </Link>
      </div>

      <dl className="mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3">
        {FACTS.map(([label, value]) => (
          <div key={label} className="bg-surface px-4 py-5">
            <dt className="text-xs uppercase tracking-wide text-fg-muted">
              {label}
            </dt>
            <dd className="tnum mt-1 font-display text-2xl">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
