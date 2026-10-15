import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { ChecklistPage } from "@/components/checklist/ChecklistPage";

const t = getDict("en").tools.checklist;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription,
};

export default function ChecklistRoute() {
  return <ChecklistPage />;
}
