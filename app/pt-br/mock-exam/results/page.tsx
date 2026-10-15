import { Suspense } from "react";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { ScoreReport } from "@/components/exam/ScoreReport";

const t = getDict("pt-br").tools;

export const metadata: Metadata = {
  title: t.result.metaTitle,
  description: t.result.metaDescription,
};

export default function ResultsPage() {
  return (
    <main className="mx-auto w-full max-w-shell flex-1 px-4 py-10 sm:px-6 lg:py-12">
      {/* useSearchParams needs a Suspense boundary to prerender statically. */}
      <Suspense fallback={<p className="text-sm text-fg-muted">{t.loading}</p>}>
        <ScoreReport />
      </Suspense>
    </main>
  );
}
