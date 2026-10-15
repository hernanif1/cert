# CCAR-P Study Guide

An unofficial self-study site for the **Claude Certified Architect – Professional**
(CCAR-P) exam, built from the published exam guide in [`docs/exam-guide.pdf`](docs/exam-guide.pdf).

Seven weighted domains, 38 objectives, 339 questions, a spaced-repetition drill
and a timed mock exam. Everything runs in the browser; progress never leaves the
device.

## Running it

`npm` and `node` are not on `PATH` in non-interactive shells on this machine, and
the `PATH=… npm` form recurses through the nvm lazy-loader in `.zshrc`. Use `sh`,
which never reads `.zshrc`:

```bash
/bin/sh -c 'PATH=$HOME/.nvm/versions/node/v22.16.0/bin:$PATH; npm run dev'
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` (runs `validate` first) |
| `npm run serve` | Serve the built export on :3001 |
| `npm run check` | Typecheck, lint, validate, the four logic suites, and pt-BR parity |
| `npm run verify:ui` | Browser suites — storage, exam, drill, whole-site |
| `npm run validate:strict` | Release gate: content shortfalls become errors |
| `npm run registry` | Regenerate content registries after adding content or translations |
| `npm run verify:i18n` | Structural parity between English lessons and their pt-BR translations |

Verify against the **served export**, not `next dev` — dev masks export-only
failures such as a missing `generateStaticParams`.

## How it fits together

```
content/domains.ts      the blueprint: 7 domains, 38 objectives VERBATIM from the guide
content/schema.ts       the type contract every lesson and question compiles against
content/lessons/        38 lessons (registry.ts is generated)
content/questions/      276 drill questions + 63 reserved Mock Form A items
content/i18n/pt-br/     blueprint text + 38 translated lessons, keyed by the SAME slugs
lib/i18n/               locale config and the UI dictionaries (en is the shape, pt-br must match)
components/ui/Icon.tsx  the icon set; motion lives in globals.css under "Icon motion"
lib/search/            site search: documents built at build time, MiniSearch index built in the browser
lib/storage/            localStorage via useSyncExternalStore
lib/drill/              leech-aware Leitner scheduler
lib/exam/               blueprint sampler, scoring, readiness
scripts/validate-*.ts   the semantic checks tsc cannot express
```

Content is typed TypeScript rather than MDX so that `tsc` is a schema gate:
38 lessons written in independent batches stay structurally identical because
the build fails when they do not.

### Languages

The export has no server, so the locale lives in the URL: English keeps the
original routes (`/learn/…`) and Brazilian Portuguese mirrors them under
`/pt-br/…`. Each `app/pt-br/**/page.tsx` is a thin wrapper around the same view
in `components/views/` with `locale="pt-br"`. Slugs, question ids and storage
are shared, so progress carries across languages.

- A translation changes words only. `npm run verify:i18n` fails the build gate
  if block order, ids, real code or source URLs drift from the English lesson.
- A lesson with no translation falls back to English rather than disappearing.
- Questions stay in English in every locale on purpose: the real exam is in
  English, and the bank ships in the client bundle.
- `<html lang>` cannot vary per route in a shared root layout, so
  `LocaleScript` sets it from the URL before paint (next to `ThemeScript`).

### Reading design

`data-domain="1…7"` on any ancestor re-points `--domain`; list markers, heading
rules, highlights, chips, the progress bar and `::selection` all read it. All
markdown styling lives in one class, `.prose-reading` (globals.css). A bold run
that opens a paragraph or list item is tagged as a chip in `lib/markdown.ts`,
and the first mention of each key term links to its definition.

### Things worth knowing before changing content

- **Question ids are immutable once shipped.** Drill state is keyed by them, so
  renumbering silently orphans review history. Retire an item with
  `retired: true`; never reuse an id.
- Ids follow `D<domain>-q<objective><NN>`; Mock Form A uses objective digit `9`.
- Run `npm run registry` after adding files, or they are never imported.
- Source URLs are restricted to an allowlist in the validator — a human has to
  have opened a link before it ships.
- `npm run validate` tolerates in-progress authoring; `validate:strict` does not.

## Honest limitations

Practice scores are **estimates**, not Pearson VUE scores. The real exam is
equated with item-response-theory difficulty parameters that are not public, and
its guide implies unscored pretest items we cannot model. Our scale assumes the
minimally qualified candidate answers 70% correctly and anchors the 720 cut
there; it is useful for tracking your own trajectory, not for predicting a real
result.

Lessons are written from the published objectives and public documentation. This
is unofficial study material, not affiliated with or endorsed by Anthropic or
Pearson VUE, and no practice question is drawn from the live item bank.
