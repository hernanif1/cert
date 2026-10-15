import { LearnView, learnMetadata } from "@/components/views/LearnView";

export const metadata = learnMetadata("pt-br");

export default function LearnPage() {
  return <LearnView locale="pt-br" />;
}
