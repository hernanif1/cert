/**
 * Structural parity between the English lessons and their pt-BR translations.
 *
 * A translation may change WORDS and nothing else. Everything the app keys on —
 * ids, slugs, block order and kinds, question ids, trap ids, source URLs, real
 * code — must be byte-identical, or progress, practice scenarios and anchors
 * silently diverge between languages.
 *
 * Usage:
 *   tsx scripts/verify-i18n.ts            every translated lesson; fails if any
 *                                         of the 38 is missing
 *   tsx scripts/verify-i18n.ts 3-5-rag…   just the named slugs (for authoring)
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { DOMAINS } from "../content/domains";
import { OBJECTIVES_PT_BR } from "../content/i18n/pt-br/domains";
import type { Lesson, LessonBlock } from "../content/schema";

const ROOT = join(import.meta.dirname, "..");
const EN_DIR = join(ROOT, "content/lessons");
const PT_DIR = join(ROOT, "content/i18n/pt-br/lessons");
const SKIP = new Set(["index.ts", "registry.ts"]);

const ALL_SLUGS = DOMAINS.flatMap((d) => d.objectives.map((o) => o.slug));
const requested = process.argv.slice(2);
const slugs = requested.length ? requested : ALL_SLUGS;

let fails = 0;
let warns = 0;
const fail = (slug: string, msg: string) => {
  fails++;
  console.log(`FAIL  ${slug} — ${msg}`);
};
const warn = (slug: string, msg: string) => {
  warns++;
  console.log(`warn  ${slug} — ${msg}`);
};

async function load(dir: string, slug: string): Promise<Lesson | null> {
  const file = join(dir, `${slug}.ts`);
  if (!existsSync(file)) return null;
  const mod = (await import(pathToFileURL(file).href)) as { lesson?: Lesson };
  return mod.lesson ?? null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
const inlineCode = (s: string) => (s.match(/`[^`]+`/g) ?? []).sort();

/** Every human-readable string in a block, for markdown and length checks. */
function texts(b: LessonBlock): string[] {
  switch (b.kind) {
    case "prose":
      return [b.md];
    case "heading":
      return [b.text];
    case "list":
      return b.items;
    case "callout":
      return [b.md, b.title ?? ""];
    case "table":
      return [...b.headers, ...b.rows.flat(), b.caption ?? ""];
    case "example":
      return [b.title, b.scenario, b.walkthrough, b.takeaway];
    case "code":
    case "practice":
      return [];
  }
}

function checkMarkdown(slug: string, where: string, en: string, pt: string) {
  if (count(pt, /\*\*/g) % 2 !== 0) fail(slug, `${where}: unbalanced ** in translation`);
  if (count(pt, /`/g) % 2 !== 0) fail(slug, `${where}: unbalanced backtick in translation`);
  if (count(en, /\*\*/g) !== count(pt, /\*\*/g))
    warn(slug, `${where}: bold runs differ (${count(en, /\*\*/g) / 2} → ${count(pt, /\*\*/g) / 2})`);
  if (!same(inlineCode(en), inlineCode(pt)))
    fail(slug, `${where}: inline code must be identical — ${inlineCode(en).join(" ")} vs ${inlineCode(pt).join(" ")}`);
  if (count(en, /\n\n/g) !== count(pt, /\n\n/g))
    warn(slug, `${where}: paragraph breaks differ`);
  if (en.length > 80) {
    const ratio = pt.length / en.length;
    if (ratio < 0.75 || ratio > 1.7)
      warn(slug, `${where}: length ratio ${ratio.toFixed(2)} — check for dropped or padded text`);
    if (en === pt) fail(slug, `${where}: not translated (identical to English)`);
  }
}

// tsx compiles scripts as CJS, which has no top-level await.
async function main() {
  for (const slug of slugs) {
    const en = await load(EN_DIR, slug);
    const pt = await load(PT_DIR, slug);
    if (!en) {
      fail(slug, "no English lesson with this slug");
      continue;
    }
    if (!pt) {
      fail(slug, "translation missing");
      continue;
    }

    for (const key of ["schemaVersion", "id", "slug", "domain", "relatedLessons"] as const) {
      if (!same(en[key], pt[key])) fail(slug, `${key} must match the English lesson`);
    }

    const official = OBJECTIVES_PT_BR[en.id];
    if (pt.objective !== official.text)
      fail(slug, `objective must equal content/i18n/pt-br/domains.ts → "${official.text}"`);
    if (pt.title !== official.title)
      fail(slug, `title must equal content/i18n/pt-br/domains.ts → "${official.title}"`);
    checkMarkdown(slug, "summary", en.summary, pt.summary);

    if (en.body.length !== pt.body.length) {
      fail(slug, `body has ${pt.body.length} blocks, English has ${en.body.length}`);
    } else {
      en.body.forEach((a, i) => {
        const b = pt.body[i];
        const where = `body[${i}] ${a.kind}`;
        if (a.kind !== b.kind) return fail(slug, `${where}: kind is "${b.kind}" in translation`);
        if (a.kind === "list" && b.kind === "list") {
          if (!!a.ordered !== !!b.ordered) fail(slug, `${where}: ordered flag differs`);
          if (a.items.length !== b.items.length) return fail(slug, `${where}: item count differs`);
        }
        if (a.kind === "callout" && b.kind === "callout") {
          if (a.variant !== b.variant) fail(slug, `${where}: variant differs`);
          if (!!a.title !== !!b.title) fail(slug, `${where}: title presence differs`);
        }
        if (a.kind === "table" && b.kind === "table") {
          if (a.headers.length !== b.headers.length || a.rows.length !== b.rows.length ||
              a.rows.some((r, j) => r.length !== b.rows[j].length))
            return fail(slug, `${where}: table dimensions differ`);
          if (!!a.caption !== !!b.caption) fail(slug, `${where}: caption presence differs`);
        }
        if (a.kind === "code" && b.kind === "code") {
          if (a.lang !== b.lang) fail(slug, `${where}: lang differs`);
          if (a.lang !== "text" && a.code !== b.code)
            fail(slug, `${where}: real code must be byte-identical (only lang "text" may be translated)`);
        }
        if (a.kind === "practice" && b.kind === "practice" && !same(a.questionIds, b.questionIds))
          fail(slug, `${where}: questionIds differ`);

        const ta = texts(a);
        const tb = texts(b);
        ta.forEach((s, j) => checkMarkdown(slug, `${where}[${j}]`, s, tb[j] ?? ""));
      });
    }

    if (!same(en.traps.map((t) => t.id), pt.traps.map((t) => t.id))) {
      fail(slug, "trap ids must match, in order");
    } else {
      en.traps.forEach((a, i) => {
        const b = pt.traps[i];
        if (!!a.instead !== !!b.instead) fail(slug, `trap ${a.id}: "instead" presence differs`);
        checkMarkdown(slug, `trap ${a.id}.trap`, a.trap, b.trap);
        checkMarkdown(slug, `trap ${a.id}.why`, a.why, b.why);
        if (a.instead) checkMarkdown(slug, `trap ${a.id}.instead`, a.instead, b.instead ?? "");
      });
    }

    if ((en.keyTerms?.length ?? 0) !== (pt.keyTerms?.length ?? 0))
      fail(slug, "keyTerms count differs");
    if (!same(en.sources.map((s) => [s.url, s.kind]), pt.sources.map((s) => [s.url, s.kind])))
      fail(slug, "sources must keep the same urls and kinds, in order");

    // Accents are spelling, not decoration. A lesson-length Portuguese text with
    // none of them has been through something that stripped them.
    const all = JSON.stringify(pt);
    if (count(all, /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g) < 50)
      fail(slug, "almost no accented characters — accents were stripped or the text is not Portuguese");
  }

  if (!requested.length) {
    const onDisk = readdirSync(PT_DIR).filter((f) => f.endsWith(".ts") && !SKIP.has(f));
    for (const f of onDisk) {
      if (!ALL_SLUGS.includes(f.replace(/\.ts$/, "")))
        fail(f, "translation file has no matching lesson slug");
    }
  }

  console.log(
    `\n${slugs.length} lesson(s) checked — ${fails} failure(s), ${warns} warning(s)`,
  );
  process.exit(fails ? 1 : 0);
}

void main();
