import { en } from "@/lib/i18n/dict/en";
import { ptBR } from "@/lib/i18n/dict/pt-br";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { Icon } from "@/components/ui/Icon";

/**
 * A static export emits ONE 404.html for every unmatched URL, so this page
 * cannot know which language the reader was in. It says it in both.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-shell flex-1 flex-col items-start px-4 py-24 sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        {en.notFound.title}
        <span lang="pt-BR" className="mt-1 block text-2xl text-fg-muted sm:text-3xl">
          {ptBR.notFound.title}
        </span>
      </h1>
      <p className="mt-5 text-fg-muted">
        {en.notFound.body}{" "}
        <span lang="pt-BR">{ptBR.notFound.body}</span>
      </p>
      <LocaleLink
        href="/learn"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
      >
        <Icon name="arrow-left" size={15} />
        {en.notFound.back}
      </LocaleLink>
    </main>
  );
}
