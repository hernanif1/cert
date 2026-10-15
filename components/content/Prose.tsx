import { cn } from "@/lib/cn";

/**
 * Build-time HTML from lib/markdown.ts. Tailwind's typography plugin is not
 * used — everything markdown can emit is styled once, by `.prose-reading` in
 * globals.css, which keeps the theme and domain tokens authoritative.
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose-reading", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
