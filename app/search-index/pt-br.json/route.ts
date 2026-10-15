import { buildSearchDocs } from "@/lib/search/build";

/** The pt-BR mirror of ../en.json/route.ts. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchDocs("pt-br"));
}
