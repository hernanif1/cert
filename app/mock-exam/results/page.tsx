import { Suspense } from "react";
import type { Metadata } from "next";
import { ScoreReport } from "@/components/exam/ScoreReport";

export const metadata: Metadata = {
  title: "Mock Exam Result",
  description: "Estimated scaled score and per-domain breakdown.",
};

export default function ResultsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      {/* useSearchParams needs a Suspense boundary to prerender statically. */}
      <Suspense fallback={<p className="text-sm text-fg-muted">Loading…</p>}>
        <ScoreReport />
      </Suspense>
    </main>
  );
}
