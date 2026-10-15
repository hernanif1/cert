import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { DrillRunner } from "@/components/drill/DrillRunner";

const t = getDict("pt-br").tools.drill;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription,
};

export default function DrillPage() {
  return (
    <main>
      <DrillRunner />
    </main>
  );
}
