import { LearnView, learnMetadata } from "@/components/views/LearnView";

export const metadata = learnMetadata("en");

export default function LearnPage() {
  return <LearnView locale="en" />;
}
