import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/**
 * Mock-exam UI, driven against a SERVED EXPORT (npm run serve).
 * Usage: node scripts/verify-exam-ui.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3001";
const root = join(homedir(), "Library/Caches/ms-playwright");
const shell = readdirSync(root).filter(d => d.startsWith("chromium_headless_shell-"))
  .sort((a,b)=>Number(b.split("-").pop())-Number(a.split("-").pop()))
  .map(d => join(root, d, "chrome-headless-shell-mac-arm64/chrome-headless-shell"))
  .find(existsSync);

let fails = 0;
const check = (n, p, d="") => { if(!p) fails++; console.log(`${p?"  ok  ":"FAIL  "} ${n}${d?` — ${d}`:""}`); };

const browser = await chromium.launch({ executablePath: shell, headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", e => errs.push(e.message));
page.on("console", m => { if (m.type()==="error") errs.push(m.text()); });

await page.goto(`${BASE}/mock-exam/`, { waitUntil: "networkidle" });
check("mock exam start screen renders", (await page.locator("h1").innerText()).includes("Mock Exam"));
check("start button enabled with a non-empty bank",
  await page.getByRole("button", { name: /start the exam/i }).isEnabled());

await page.getByRole("button", { name: /start the exam/i }).click();
await page.waitForTimeout(600);

const stem = await page.locator("main").innerText();
check("an item is presented", /question 1 of \d+/i.test(stem), stem.split("\n").slice(0, 3).join(" | "));
check("timer is running", /\d\d:\d\d/.test(stem));
check(
  "the form is assembled to the blueprint size",
  /question 1 of 63/i.test(stem),
  (stem.match(/question 1 of \d+/i) ?? ["?"])[0],
);
check("answers are not revealed during the exam", !/Correct|Not quite/.test(stem));

// Answer via keyboard, flag, navigate.
await page.keyboard.press("2");
await page.waitForTimeout(250);
check("keyboard 1-6 selects a choice",
  /\b1\/\d+ answered/.test(await page.locator("main").innerText()));
await page.keyboard.press("f");
await page.waitForTimeout(200);
check("F flags the item", (await page.getByRole("button", { name: /remove review flag/i }).count()) > 0);
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(250);
check("arrow keys navigate", /question 2 of \d+/i.test(await page.locator("main").innerText()));

// Refresh mid-exam: must offer the same attempt, not restart.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
const afterReload = await page.locator("main").innerText();
check(
  "attempt survives a refresh",
  /answered/i.test(afterReload) && /question \d+ of \d+/i.test(afterReload),
);
check("answered count survives a refresh", /\b1\/\d+ answered/.test(afterReload), afterReload.match(/\d+\/\d+ answered/)?.[0] ?? "");
check("no page errors during the exam", errs.length === 0, errs[0] ?? "");

// Submit.
await page.getByRole("button", { name: /submit exam/i }).click();
await page.waitForTimeout(300);
check("submit panel summarises progress",
  /\b1 answered/.test(await page.locator("main").innerText()));
await page.getByRole("button", { name: /^submit$/i }).click();
await page.waitForURL(/results/, { timeout: 5000 });
await page.waitForTimeout(600);

const report = await page.locator("main").innerText();
check("score report renders", /Pass|Fail/.test(report));
check("report shows an estimated scaled score", /estimated scaled score/i.test(report));
check("report carries the non-comparability disclaimer",
  /not a Pearson VUE score/i.test(report));
check("report shows a per-domain breakdown", /By domain/.test(report));

// Results page survives a refresh (reads from history by id).
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("results survive a refresh", /Pass|Fail/.test(await page.locator("main").innerText()));

// An expired deadline must auto-submit on mount rather than grant free time.
// The edit has to happen from a page that has NOT loaded the exam module:
// otherwise its pagehide flush writes the live attempt back over our change,
// which is the app behaving correctly.
await page.goto(`${BASE}/mock-exam/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /start the exam/i }).click();
await page.waitForTimeout(400);
await page.close();

const editor = await ctx.newPage();
await editor.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
const expired = await editor.evaluate(() => {
  const k = "ccarp:exam:v1";
  const raw = localStorage.getItem(k);
  if (!raw) return false;
  const a = JSON.parse(raw);
  a.deadlineAt = Date.now() - 1000;
  localStorage.setItem(k, JSON.stringify(a));
  return true;
});
check("an in-flight attempt was persisted to its own key", expired);

const examPage = await ctx.newPage();
await examPage.goto(`${BASE}/mock-exam/`, { waitUntil: "networkidle" });
await examPage.waitForURL(/results/, { timeout: 8000 }).catch(() => {});
check("an expired deadline auto-submits on mount", examPage.url().includes("results"), examPage.url());
check(
  "the auto-submitted attempt is marked as timed out",
  /time expired/i.test(await examPage.locator("main").innerText()),
);

await browser.close();
console.log(fails === 0 ? "\nall exam UI checks passed" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
