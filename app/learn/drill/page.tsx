import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { DrillRunner } from "@/components/drill/DrillRunner";

const t = getDict("en").tools.drill;

export const metadata: Metadata = {
  title: t.title,
  description: t.metaDescription,
};

export default function DrillPage() {
  return (
    // data-focus-center: with the rail gone in focus mode, centre the column.
    <main data-focus-center>
      <DrillRunner />
    </main>
  );
}
