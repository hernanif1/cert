import { md } from "@/lib/markdown";

/**
 * Markdown rendered at build time. Tailwind's typography plugin is not used —
 * the handful of elements lesson prose produces are styled directly here, which
 * keeps the theme tokens authoritative and avoids another dependency.
 */
export function Prose({ source }: { source: string }) {
  return (
    <div
      className="[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_p]:leading-[1.75] [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: md(source) }}
    />
  );
}
