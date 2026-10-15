import type { ReactNode } from "react";
import { LearnLayout } from "@/components/views/LearnLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <LearnLayout>{children}</LearnLayout>;
}
