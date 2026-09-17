import type { Metadata } from "next";
import { DrillRunner } from "@/components/drill/DrillRunner";

export const metadata: Metadata = {
  title: "Drill Mode",
  description:
    "Spaced-repetition practice across the question bank, scheduled by a leech-aware Leitner system.",
};

export default function DrillPage() {
  return (
    <main>
      <DrillRunner />
    </main>
  );
}
