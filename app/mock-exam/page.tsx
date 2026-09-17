import type { Metadata } from "next";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { EXAM } from "@/content/exam-facts";

export const metadata: Metadata = {
  title: "Mock Exam",
  description: `A timed ${EXAM.itemCount}-item practice form under ${EXAM.minutes}-minute exam conditions.`,
};

export default function MockExamPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <ExamRunner />
    </main>
  );
}
