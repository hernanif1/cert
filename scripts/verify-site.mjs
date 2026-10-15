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
 * rather than just toggling a class, that shiki code tokens recolour with the
 * theme, and the reading design itself: the measure, per-domain hues on
 * markers / rules / selection, the curriculum menu and its submenu, and the
 * English ↔ pt-BR switch.
 * Usage: node scripts/verify-site.mjs [baseUrl]
 */
const B = process.argv[2] ?? "http://localhost:3001";
let fails = 0;
const check = (n,p,d="") => { if(!p) fails++; console.log(`${p?"  ok  ":"FAIL  "} ${n}${d?` — ${d}`:""}`); };
const browser = await chromium.launch({ executablePath: shell, headless: true });

const PAGES = ["/", "/learn/", "/learn/3-integration/", "/learn/3-integration/3-5-rag-pipeline-design/",
               "/learn/3-integration/3-4-observability-at-scale/",   // json code block, long lines
               "/learn/2-models-prompting-context/2-2-system-prompts-guardrails/", // text code block
               "/learn/progress/", "/learn/drill/", "/learn/checklist/", "/learn/flagged/", "/mock-exam/",
               // The pt-BR mirror: longer words, so its own overflow risk.
               "/pt-br/", "/pt-br/learn/", "/pt-br/learn/6-stakeholder-lifecycle/",
               "/pt-br/learn/6-stakeholder-lifecycle/6-3-feedback-loops-slas/",
               "/pt-br/learn/progress/", "/pt-br/learn/drill/", "/pt-br/learn/checklist/", "/pt-br/learn/flagged/",
               "/pt-br/mock-exam/"];

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
// The palette at phone width: full-width results, still no page overflow.
{
  const page = await mob.newPage();
  await page.goto(B + "/learn/", { waitUntil: "networkidle" });
  await page.locator("[data-search-trigger]").click();
  await page.waitForSelector('dialog[data-search] [role="option"]');
  await page.locator("dialog[data-search] input").fill("rag");
  await page.waitForSelector("dialog[data-search] mark");
  const over = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const box = await page.locator("dialog[data-search]").boundingBox();
  check("390px: search palette fits the viewport", over <= 1 && box.x >= 0 && box.x + box.width <= 390,
    `${over}px overflow, x=${box.x} w=${box.width}`);
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

// ── Reading design: measure, domain hue, selection, emphasis, key terms ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const perr = [];
  p.on("pageerror", e => perr.push(e.message));
  const RAG = "/learn/3-integration/3-5-rag-pipeline-design/";
  await p.goto(B + RAG, { waitUntil: "networkidle" });

  const measure = await p.locator("#lesson-article").evaluate(el => el.getBoundingClientRect().width);
  check("reading measure is 46rem (736px) at 1440", Math.abs(measure - 736) <= 1, `${measure}px`);
  const body = await p.locator("#lesson-article .prose-reading p").first().evaluate(el => {
    const c = getComputedStyle(el); return [c.fontSize, parseFloat(c.lineHeight) / parseFloat(c.fontSize)];
  });
  check("body text is 18px / 1.8", body[0] === "18px" && Math.abs(body[1] - 1.8) < 0.01, body.join(" / "));

  const probe = () => p.evaluate(() => {
    const li = document.querySelector("#lesson-article .prose-reading li");
    const para = document.querySelector("#lesson-article .prose-reading p");
    return {
      bullet: getComputedStyle(li, "::before").backgroundColor + "|" + getComputedStyle(li, "::before").color,
      selection: getComputedStyle(para, "::selection").backgroundColor,
      rule: getComputedStyle(document.querySelector("main h2"), "::before").backgroundColor,
    };
  });
  const d3 = await probe();
  await p.goto(B + "/learn/5-governance-safety-risk/5-1-guardrails-safety-controls/", { waitUntil: "networkidle" });
  const d5 = await probe();
  check("list markers take the domain hue (D3 ≠ D5)", d3.bullet !== d5.bullet, `${d3.bullet} vs ${d5.bullet}`);
  check("heading rule takes the domain hue (D3 ≠ D5)", d3.rule !== d5.rule, `${d3.rule} vs ${d5.rule}`);
  check("::selection is custom and domain-tinted", d3.selection !== d5.selection && !/^rgba?\(0, 0, 0, 0\)$/.test(d3.selection),
    `${d3.selection} vs ${d5.selection}`);

  await p.goto(B + RAG, { waitUntil: "networkidle" });
  const strongBg = await p.locator("#lesson-article .prose-reading strong:not(.lead-in)").first()
    .evaluate(el => getComputedStyle(el).backgroundImage);
  check("important text carries the marker underline", strongBg.includes("gradient"), strongBg.slice(0, 40));
  const chip = await p.locator("#lesson-article strong.lead-in").first()
    .evaluate(el => { const c = getComputedStyle(el); return [c.borderRadius, c.backgroundColor]; });
  check("opening labels render as rounded chips", parseFloat(chip[0]) > 4 && chip[1] !== "rgba(0, 0, 0, 0)", chip.join(" "));
  const terms = await p.$$eval("a.term, a.term-link", as => as.map(a => a.getAttribute("href").slice(1)));
  const dangling = await p.evaluate(ids => ids.filter(id => !document.getElementById(id)), terms);
  check("key-term tags exist and all resolve", terms.length >= 3 && dangling.length === 0,
    `${terms.length} tags, ${dangling.length} dangling`);
  check("each key term is tagged once", new Set(terms).size === terms.length);
  check("callouts, traps and takeaways use icons", await p.locator("#lesson-article svg.icon").count() >= 8);
  check("on-this-page rail is present at 1440", await p.locator('nav[aria-label="On this page"] a').count() >= 3);

  // Reading progress responds to scroll.
  const bar = p.locator('[role="progressbar"][aria-label="Reading progress"]');
  await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await p.waitForTimeout(250);
  check("reading progress reaches the end", Number(await bar.getAttribute("aria-valuenow")) >= 95,
    await bar.getAttribute("aria-valuenow"));

  // ── Curriculum menu with a lessons submenu ──
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const trigger = p.locator('header nav button[aria-expanded]');
  await trigger.click();
  const panel = p.locator("header nav [id]").filter({ has: p.locator('a[href="/learn/"]') });
  check("curriculum menu lists all seven domains",
    await panel.locator('a[href^="/learn/"]').evaluateAll(as =>
      new Set(as.map(a => a.getAttribute("href")).filter(h => /^\/learn\/\d-[^/]+\/$/.test(h))).size) === 7);
  check("submenu opens on the domain being read (8 lessons of D3)",
    await panel.locator('a[href^="/learn/3-integration/3-"]').count() === 8);
  await panel.locator('a[href="/learn/5-governance-safety-risk/"]').hover();
  check("hovering a domain swaps the submenu (5 lessons of D5)",
    await panel.locator('a[href^="/learn/5-governance-safety-risk/5-"]').count() === 5);
  await p.keyboard.press("Escape");
  check("Escape closes the menu and restores focus",
    await trigger.getAttribute("aria-expanded") === "false" &&
    await trigger.evaluate(el => el === document.activeElement));

  // Sidebar: the active domain is expanded, others can be peeked into.
  const side = p.locator("aside nav").first();
  check("sidebar expands the active domain", await side.locator('a[href^="/learn/3-integration/3-"]').count() === 8);
  await side.locator('li[data-domain="7"] button[aria-expanded]').click();
  check("sidebar can peek into another domain",
    await side.locator('a[href^="/learn/7-developer-productivity/7-"]').count() === 3);

  // ── View modes: fullscreen and focus ──
  const focusBtn = p.getByRole("button", { name: /^Focus mode/ });
  check("fullscreen toggle sits in the top bar, unpressed",
    await p.getByRole("button", { name: "Enter full screen" }).getAttribute("aria-pressed") === "false");
  await focusBtn.click();
  check("focus mode hides the rail, the on-this-page list and the footer",
    await p.$$eval("[data-focus-hide]", els => els.length >= 5 && els.every(e => getComputedStyle(e).display === "none")));
  const gutters = await p.locator("#lesson-article").evaluate(el => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.left), Math.round(innerWidth - r.right)];
  });
  check("focus mode centres the measure", Math.abs(gutters[0] - gutters[1]) <= 1, gutters.join("/"));
  check("focus toggle reports its state",
    await p.getByRole("button", { name: /^Exit focus mode/ }).getAttribute("aria-pressed") === "true");
  const langBtn = p.locator('[data-focus-keep] button[aria-haspopup="menu"]');
  const order = await p.$$eval("[data-focus-keep] button", bs =>
    bs.filter(b => b.getClientRects().length).map(b => Math.round(b.getBoundingClientRect().left)));
  check("focus mode keeps the language menu, left of the view toggles",
    await langBtn.isVisible() && order.length === 3 && order[0] < order[1] && order[1] < order[2], order.join("/"));
  await langBtn.click();
  await p.keyboard.press("Escape");
  check("Escape closes the language menu before it leaves focus mode",
    await langBtn.getAttribute("aria-expanded") === "false" &&
    await p.evaluate(() => document.documentElement.hasAttribute("data-focus")));
  await p.keyboard.press("Escape");
  check("Escape leaves focus mode and brings the rail back",
    await side.isVisible() && await focusBtn.getAttribute("aria-pressed") === "false");

  // ── Language ──
  check("English pages declare lang=en", await p.evaluate(() => document.documentElement.lang) === "en");
  await p.locator('header button[aria-haspopup="menu"]').first().click();
  await p.getByRole("menuitemradio", { name: /Português/ }).click();
  await p.waitForURL("**/pt-br" + RAG);
  await p.waitForLoadState("networkidle");
  check("language menu opens the same lesson under /pt-br", p.url().endsWith("/pt-br" + RAG), p.url());
  // Set by an effect one frame after the client-side navigation commits.
  const langOk = await p.waitForFunction(() => document.documentElement.lang === "pt-BR", null, { timeout: 3000 })
    .then(() => true, () => false);
  check("pt-BR pages declare lang=pt-BR", langOk);
  const h1 = await p.locator("h1").innerText();
  check("lesson title is translated", h1 === "Projetando um Pipeline de RAG", h1);
  const lede = await p.locator("#lesson-article > p").first().innerText();
  check("lesson body is translated, accents intact", /[ãáéíóúçõê]/.test(lede) && !/ is | the /.test(lede), lede.slice(0, 60));
  check("pt-BR chrome is translated", (await p.locator("body > header").innerText()).includes("Currículo"));
  check("pt-BR links stay under /pt-br",
    await p.$$eval('aside nav a, #lesson-article nav a', as =>
      // In-page anchors (the on-this-page rail) are locale-neutral by nature.
      as.map(a => a.getAttribute("href")).filter(h => !h.startsWith("#")).every(h => h.startsWith("/pt-br/"))));
  check("practice items stay in English on purpose",
    await p.locator('#lesson-article [lang="en"]').count() > 0);
  check("exactly one <h1> in pt-BR too", await p.locator("h1").count() === 1);

  // The choice is remembered: an English URL now lands on its pt-BR mirror…
  await p.goto(B + "/learn/", { waitUntil: "networkidle" });
  check("returning reader is sent to their language", p.url().endsWith("/pt-br/learn/"), p.url());
  // …and choosing English sticks just as firmly.
  await p.locator('header button[aria-haspopup="menu"]').first().click();
  await p.getByRole("menuitemradio", { name: "English" }).click();
  await p.waitForURL(u => !u.pathname.startsWith("/pt-br"));
  await p.goto(B + "/learn/", { waitUntil: "networkidle" });
  check("switching back to English sticks", !p.url().includes("/pt-br"), p.url());

  // ── Search palette: a Spotlight over the curriculum ──
  const sBtn = p.locator("[data-search-trigger]");
  check("search trigger names its shortcut", /^Search \(/.test(await sBtn.getAttribute("aria-label") ?? ""));
  await sBtn.click();
  const dlg = p.locator("dialog[data-search][open]");
  await p.waitForSelector('dialog[data-search] [role="option"]');
  check("palette opens as a modal listing the study tools",
    await dlg.isVisible() && await dlg.locator('[role="option"]').count() === 6);
  const dBox = await dlg.boundingBox();
  check("palette is centred horizontally", Math.abs(dBox.x + dBox.width / 2 - 720) <= 2, `x=${dBox.x} w=${dBox.width}`);
  await p.keyboard.type("chunking");
  await p.waitForSelector("dialog[data-search] mark");
  const hrefs = await dlg.locator('[role="option"]').evaluateAll(as => as.map(a => a.getAttribute("href")));
  check("top hit is anchored inside the RAG lesson",
    hrefs[0].startsWith("/learn/3-integration/3-5-rag-pipeline-design#"), hrefs[0]);
  check("results scroll inside the palette, not the page",
    await dlg.locator('[role="listbox"]').evaluate(el => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === "auto"));
  check("matched words are highlighted", await dlg.locator("mark").count() > 0);
  check("the input keeps focus while results are listed",
    await p.evaluate(() => document.activeElement?.tagName === "INPUT"));
  await p.keyboard.press("ArrowDown");
  check("arrow keys move the selection",
    await dlg.locator('[role="option"][aria-selected="true"]').getAttribute("href") === hrefs[1]);
  await p.keyboard.press("Enter");
  await p.waitForURL(u => u.pathname + u.hash === hrefs[1].replace("#", "/#"));
  check("Enter opens the selected hit and closes the palette",
    await p.locator("dialog[data-search][open]").count() === 0);

  // Accent folding and typo tolerance, where they matter most: pt-BR.
  await p.goto(B + "/pt-br/learn/", { waitUntil: "networkidle" });
  await p.locator("[data-search-trigger]").click();
  const input = p.locator("dialog[data-search] input");
  await input.fill("avaliacao");
  await p.waitForSelector("dialog[data-search] mark");
  const first = () => p.locator('dialog[data-search] [role="option"]').first().innerText();
  check("an accent-free query hits accented pt-BR titles", /Avaliação/.test(await first()), (await first()).split("\n")[0]);
  await input.fill("guardrials");
  await p.waitForFunction(() => /Guardrails/.test(document.querySelector('dialog[data-search] [role="option"]')?.textContent ?? ""), null, { timeout: 3000 })
    .then(() => check("a typo still finds Guardrails", true),
          async () => check("a typo still finds Guardrails", false, (await first()).split("\n")[0]));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(100);
  check("Escape closes the palette and returns focus to the trigger",
    await p.locator("dialog[data-search][open]").count() === 0 &&
    await p.locator("[data-search-trigger]").evaluate(el => el === document.activeElement));
  check("no page errors across the design checks", perr.length === 0, perr[0] ?? "");
  await ctx.close();
}

await browser.close();
console.log(fails === 0 ? "\nall final checks passed" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
