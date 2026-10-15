import { highlightCode, type CodeLang } from "@/lib/highlight";
import { Icon } from "@/components/ui/Icon";

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
    <figure className="my-9 overflow-hidden rounded-2xl border border-border bg-surface-2">
      {LABEL[lang] && (
        <figcaption className="flex items-center gap-2 border-b border-border px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-fg-muted">
          <Icon name="terminal" size={13} />
          {LABEL[lang]}
        </figcaption>
      )}
      {html ? (
        // Build-time output from first-party content; nothing user-supplied.
        <div
          className="overflow-x-auto p-5 text-code"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="overflow-x-auto p-5 text-code">
          {/* tabIndex matches shiki's own `<pre tabindex="0">`: it gives the
              browser a focusable element inside the scroll container, so an
              overflowing block stays keyboard-scrollable on this branch too. */}
          <pre className="font-mono" tabIndex={0}>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}
