import type { NextConfig } from "next";

/**
 * Fully static export. No server, no API routes.
 *
 * `basePath` is read from the environment so a later GitHub Pages deploy only
 * needs `NEXT_PUBLIC_BASE_PATH=/cert`; it is empty for local serving and Vercel.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Emits out/learn/<domain>/index.html — behaves identically under
  // `serve`, Vercel and GitHub Pages. Without it the three disagree on redirects.
  trailingSlash: true,
  basePath,
  // No Image Optimization server exists in an export build.
  images: { unoptimized: true },
  // Next 16 runs eslint as a separate step (`npm run lint`), not during build.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
