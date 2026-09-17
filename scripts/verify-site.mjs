import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const root = join(homedir(), "Library/Caches/ms-playwright");
const shell = readdirSync(root).filter(d=>d.startsWith("chromium_headless_shell-"))
  .sort((a,b)=>Number(b.split("-").pop())-Number(a.split("-").pop()))
  .map(d=>join(root,d,"chrome-headless-shell-mac-arm64/chrome-headless-shell")).find(existsSync);
/**
 * Whole-site checks against a SERVED EXPORT (npm run serve): responsive
 * behaviour at phone width, landmark and labelling basics, heading order
 * (h1 then h2, never skipping a level), that the theme actually repaints
 * rather than just toggling a class, and that shiki code tokens recolour
 * with the theme.
 * Usage: node scripts/verify-site.mjs [baseUrl]
 */
const B = process.argv[2] ?? "http://localhost:3001";
let fails = 0;
const check = (n,p,d="") => { if(!p) fails++; console.log(`${p?"  ok  ":"FAIL  "} ${n}${d?` — ${d}`:""}`); };
const browser = await chromium.launch({ executablePath: shell, headless: true });

const PAGES = ["/", "/learn/", "/learn/3-integration/", "/learn/3-integration/3-5-rag-pipeline-design/",
               "/learn/3-integration/3-4-observability-at-scale/",   // json code block, long lines
               "/learn/2-models-prompting-context/2-2-system-prompts-guardrails/", // text code block
               "/learn/progress/", "/learn/drill/", "/mock-exam/"];

// Mobile: no horizontal overflow anywhere.
const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
for (const path of PAGES) {
  const page = await mob.newPage();
  await page.goto(B + path, { waitUntil: "networkidle" });
  const over = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`390px: no horizontal scroll ${path}`, over <= 1, over ? `${over}px overflow` : "");
  await page.close();
}
await mob.close();

// Desktop: dark mode, headings, a11y basics.
const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await desk.newPage();
const errs = [];
page.on("pageerror", e => errs.push(e.message));
await page.goto(B + "/learn/3-integration/3-5-rag-pipeline-design/", { waitUntil: "networkidle" });

check("exactly one <main> landmark", await page.locator("main").count() === 1);
check("exactly one <h1>", await page.locator("h1").count() === 1);
const levels = await page.$$eval("main :is(h1,h2,h3,h4,h5,h6)",
  els => els.map(e => Number(e.tagName[1])));
check("first heading is the h1", levels[0] === 1, levels.join(">"));
check("in-body subtitle is an h2", levels[1] === 2, levels.join(">"));
check("heading levels never skip a level",
  levels.every((l, i) => i === 0 || l - levels[i - 1] <= 1), levels.join(">"));
// Proves the base-layer fix: an unlayered `font-weight:400` would win here.
const h2Weight = await page.locator("main h2").first().evaluate(el => getComputedStyle(el).fontWeight);
check("section headings render at weight 500", h2Weight === "500", h2Weight);
const imgsOk = await page.$$eval("img", els => els.every(e => e.hasAttribute("alt")));
check("every img has alt text", imgsOk);
const svgLabelled = await page.$$eval('svg[role="img"]', els => els.every(e => e.hasAttribute("aria-label")));
check("every role=img svg is labelled", svgLabelled);

// Dark mode actually repaints.
const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
await page.evaluate(() => {
  const k = "ccarp:v1";
  const b = JSON.parse(localStorage.getItem(k) ?? "{}");
  localStorage.setItem(k, JSON.stringify({ ...b, settings: { ...(b.settings ?? {}), theme: "dark" } }));
});
await page.reload({ waitUntil: "networkidle" });
const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check("dark theme repaints the page", lightBg !== darkBg, `${lightBg} -> ${darkBg}`);
check("dark class applied before paint",
  await page.evaluate(() => document.documentElement.classList.contains("dark")));
check("no page errors", errs.length === 0, errs[0] ?? "");

// Syntax highlighting: tokens exist, and they recolour with the theme.
// 3-4 is used rather than 2-2 because 2-2's only code block is `lang: "text"`,
// which deliberately bypasses shiki and has no tokens to assert on.
const codeCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const cpage = await codeCtx.newPage();
await cpage.goto(B + "/learn/3-integration/3-4-observability-at-scale/", { waitUntil: "networkidle" });
const tokens = cpage.locator('pre code span[style*="--shiki-light"]');
const tokenCount = await tokens.count();
check("code block emits shiki tokens", tokenCount > 0, `${tokenCount} tokens`);
const tokenLight = tokenCount ? await tokens.first().evaluate(el => getComputedStyle(el).color) : "";
await cpage.evaluate(() => {
  const k = "ccarp:v1";
  const b = JSON.parse(localStorage.getItem(k) ?? "{}");
  localStorage.setItem(k, JSON.stringify({ ...b, settings: { ...(b.settings ?? {}), theme: "dark" } }));
});
await cpage.reload({ waitUntil: "networkidle" });
const tokenDark = tokenCount ? await tokens.first().evaluate(el => getComputedStyle(el).color) : "";
check("shiki tokens recolour in dark mode",
  tokenCount > 0 && tokenLight !== tokenDark, `${tokenLight} -> ${tokenDark}`);
await codeCtx.close();

await browser.close();
console.log(fails === 0 ? "\nall final checks passed" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
