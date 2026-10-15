import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { FlaggedQuestions } from "@/components/flagged/FlaggedQuestions";

const t = getDict("pt-br").tools.flagged;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription,
};

export default function FlaggedRoute() {
  return <FlaggedQuestions />;
}
