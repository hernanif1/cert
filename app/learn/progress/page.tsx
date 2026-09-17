import type { Metadata } from "next";

export const metadata: Metadata = { title: "Progress Dashboard", description: "Exam readiness, per-domain coverage and drill mastery." };

export default function Page() {
  return (
    <main>
      <h1 className="font-display text-4xl">Progress Dashboard</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-fg-muted">Exam readiness, per-domain coverage and drill mastery.</p>
      <p className="mt-6 rounded-card border border-dashed border-border p-5 text-sm text-fg-muted">
        Not built yet.
      </p>
    </main>
  );
}
