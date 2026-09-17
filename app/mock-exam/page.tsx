import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mock Exam", description: "A timed 63-item form under exam conditions." };

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">Mock Exam</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-fg-muted">A timed 63-item form under exam conditions.</p>
      <p className="mt-6 rounded-card border border-dashed border-border p-5 text-sm text-fg-muted">
        Not built yet.
      </p>
    </main>
  );
}
