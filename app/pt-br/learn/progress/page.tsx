import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

const t = getDict("pt-br").tools.progress;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription,
};

export default function ProgressPage() {
  return <ProgressDashboard />;
}
