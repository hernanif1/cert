import { buildSearchDocs } from "@/lib/search/build";

/**
 * The English search documents, emitted as a static file by `next build`
 * (out/search-index/en.json). The palette fetches it on first open and builds
 * the index in the browser — see lib/search/client.ts.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchDocs("en"));
}
