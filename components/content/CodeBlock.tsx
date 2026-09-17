import { highlightCode, type CodeLang } from "@/lib/highlight";

/** Empty label = no header strip. `text` blocks are prompts and transcripts,
 *  not code, and a "TEXT" chip on them would be noise. */
const LABEL: Record<CodeLang, string> = {
  text: "",
  json: "JSON",
  python: "Python",
  ts: "TypeScript",
  bash: "Bash",
};

export function CodeBlock({ code, lang }: { code: string; lang: CodeLang }) {
  const html = highlightCode(code, lang);
  return (
    <figure className="my-6 overflow-hidden rounded-card border border-border bg-surface-2">
      {LABEL[lang] && (
        <figcaption className="border-b border-border px-4 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-fg-muted">
          {LABEL[lang]}
        </figcaption>
      )}
      {html ? (
        // Build-time output from first-party content; nothing user-supplied.
        <div
          className="overflow-x-auto p-4 text-code"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="overflow-x-auto p-4 text-code">
          <pre className="font-mono">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}
