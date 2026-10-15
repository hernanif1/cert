import type { Metadata } from "next";
import { EXAM } from "@/content/exam-facts";
import { getDict } from "@/lib/i18n";
import { ExamRunner } from "@/components/exam/ExamRunner";

const t = getDict("en").tools.exam;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription(EXAM.itemCount, EXAM.minutes),
};

export default function MockExamPage() {
  return (
    <main className="mx-auto w-full max-w-shell flex-1 px-4 py-10 sm:px-6 lg:py-12">
      <ExamRunner />
    </main>
  );
}
