import type { Metadata } from "next";

export const metadata: Metadata = { title: "Drill Mode", description: "Spaced-repetition practice across the question bank." };

export default function Page() {
  return (
    <main>
      <h1 className="font-display text-4xl">Drill Mode</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-fg-muted">Spaced-repetition practice across the question bank.</p>
      <p className="mt-6 rounded-card border border-dashed border-border p-5 text-sm text-fg-muted">
        Not built yet.
      </p>
    </main>
  );
}
