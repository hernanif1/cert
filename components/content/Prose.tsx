import { md } from "@/lib/markdown";

/**
 * Markdown rendered at build time. Tailwind's typography plugin is not used —
 * the handful of elements lesson prose produces are styled directly here, which
 * keeps the theme tokens authoritative and avoids another dependency.
 */
export function Prose({ source }: { source: string }) {
  return (
    <div
      className="[&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-accent [&_:not(pre)>code]:rounded-[0.3rem] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-border [&_:not(pre)>code]:bg-surface-2 [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:py-[0.1em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em] [&_:not(pre)>code]:text-fg [&_li]:my-1.5 [&_li]:marker:text-fg-muted [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-5 [&_strong]:font-semibold [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: md(source) }}
    />
  );
}
