import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata: Metadata = {
  title: "Progress Dashboard",
  description:
    "Exam readiness, per-domain coverage and drill mastery — stored only in this browser.",
};

export default function ProgressPage() {
  return <ProgressDashboard />;
}
