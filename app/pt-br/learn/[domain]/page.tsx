import type { Metadata } from "next";
import { DOMAINS } from "@/content/domains";
import { DomainView, domainMetadata } from "@/components/views/DomainView";

// output:'export' requires this — an unknown param must not be rendered on demand.
export const dynamicParams = false;

export function generateStaticParams() {
  return DOMAINS.map((d) => ({ domain: d.slug }));
}

type Params = Promise<{ domain: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  return domainMetadata((await params).domain, "pt-br");
}

export default async function DomainPage({ params }: { params: Params }) {
  return <DomainView domain={(await params).domain} locale="pt-br" />;
}
