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
 * behaviour at phone width, landmark and labelling basics, and that the theme
 * actually repaints rather than just toggling a class.
 * Usage: node scripts/verify-site.mjs [baseUrl]
 */
const B = process.argv[2] ?? "http://localhost:3001";
let fails = 0;
const check = (n,p,d="") => { if(!p) fails++; console.log(`${p?"  ok  ":"FAIL  "} ${n}${d?` — ${d}`:""}`); };
const browser = await chromium.launch({ executablePath: shell, headless: true });

const PAGES = ["/", "/learn/", "/learn/3-integration/", "/learn/3-integration/3-5-rag-pipeline-design/",
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

await browser.close();
console.log(fails === 0 ? "\nall final checks passed" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
