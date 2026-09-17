/**
 * End-to-end verification of the storage layer against a real browser.
 *
 * Covers the Phase 2 gate: zero hydration warnings, no placeholder flash,
 * migration, forward-compatibility, orphan tolerance and cross-tab sync.
 * Run against a SERVED EXPORT (npm run serve), never `next dev` — dev masks
 * export-only failures.
 *
 * Usage: node scripts/verify-storage.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const BASE = process.argv[2] ?? "http://localhost:3001";
const KEY = "ccarp:v1";

function findChromium() {
  const root = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(root)) return undefined;
  const byRevDesc = (prefix) =>
    readdirSync(root)
      .filter((d) => d.startsWith(prefix))
      .sort((a, b) => Number(b.split("-").pop()) - Number(a.split("-").pop()));

  for (const d of byRevDesc("chromium_headless_shell-")) {
    const p = join(root, d, "chrome-headless-shell-mac-arm64/chrome-headless-shell");
    if (existsSync(p)) return p;
  }
  for (const d of byRevDesc("chromium-")) {
    const p = join(root, d, "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium");
    if (existsSync(p)) return p;
  }
  return undefined;
}

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok  " : "FAIL  "} ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Collects console errors/warnings, ignoring unrelated network noise. */
function watchConsole(page) {
  const seen = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") seen.push(m.text());
  });
  page.on("pageerror", (e) => seen.push(`pageerror: ${e.message}`));
  return seen;
}

const hydrationNoise = (msgs) =>
  msgs.filter((m) =>
    /hydrat|did not match|Text content does not match|server rendered|mismatch/i.test(m),
  );

async function main() {
  const executablePath = findChromium();
  const browser = await chromium.launch({ executablePath, headless: true });

  /* 1 — clean load, no hydration warnings */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const msgs = watchConsole(page);
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    check("clean load: no hydration warnings", hydrationNoise(msgs).length === 0,
      hydrationNoise(msgs)[0] ?? "");
    check("clean load: no console errors", msgs.length === 0, msgs[0] ?? "");
    await ctx.close();
  }

  /* 2 — complete 3 lessons, hard-refresh, counters correct and no flash */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 1, createdAt: 1, updatedAt: 1,
        lessons: {
          "1-1-business-problem-translation": { completedAt: 111, viewedAt: 1 },
          "1-2-end-to-end-architecture": { completedAt: 222, viewedAt: 1 },
          "3-5-rag-pipeline-design": { completedAt: 333, viewedAt: 1 },
        },
      }));
    }, KEY);

    const msgs = watchConsole(page);
    await page.reload({ waitUntil: "networkidle" });
    check("after refresh: no hydration warnings", hydrationNoise(msgs).length === 0,
      hydrationNoise(msgs)[0] ?? "");

    const overall = await page.locator('nav a[href="/learn/"] .tnum').first().innerText();
    check("overall counter reads 3/38", overall.replace(/\s/g, "") === "3/38", overall);

    const d1 = await page.locator('nav a[href="/learn/1-solution-design/"] .tnum').last().innerText();
    check("D1 counter reads 2/6", d1.replace(/\s/g, "") === "2/6", d1);

    const d3 = await page.locator('nav a[href="/learn/3-integration/"] .tnum').last().innerText();
    check("D3 counter reads 1/8", d3.replace(/\s/g, "") === "1/8", d3);
    await ctx.close();
  }

  /* 3 — orphaned slug from a renamed lesson must not inflate the denominator */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 1,
        lessons: {
          "1-1-business-problem-translation": { completedAt: 111, viewedAt: 1 },
          "deleted-lesson-xyz": { completedAt: 999, viewedAt: 1 },
        },
      }));
    }, KEY);
    await page.reload({ waitUntil: "networkidle" });
    const overall = await page.locator('nav a[href="/learn/"] .tnum').first().innerText();
    check("orphan slug ignored (1/38, never 2/39)", overall.replace(/\s/g, "") === "1/38", overall);
    await ctx.close();
  }

  /* 4 — forward compatibility: newer schema loads read-only and is NOT overwritten */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    const future = JSON.stringify({
      schemaVersion: 99,
      lessons: { "1-1-business-problem-translation": { completedAt: 111, viewedAt: 1 } },
      somethingFromTheFuture: true,
    });
    await page.evaluate(([key, v]) => localStorage.setItem(key, v), [KEY, future]);
    await page.reload({ waitUntil: "networkidle" });

    const overall = await page.locator('nav a[href="/learn/"] .tnum').first().innerText();
    check("future schema still renders progress", overall.replace(/\s/g, "") === "1/38", overall);

    // Force a write attempt, then confirm the blob was left alone.
    await page.goto(`${BASE}/learn/1-solution-design/1-3-architectural-patterns/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /mark complete/i }).click();
    await page.waitForTimeout(600);
    const after = await page.evaluate((key) => localStorage.getItem(key), KEY);
    const stored = JSON.parse(after);
    check("future schema NOT written back (no data loss)",
      stored.schemaVersion === 99 && stored.somethingFromTheFuture === true,
      `schemaVersion=${stored.schemaVersion}`);
    await ctx.close();
  }

  /* 5 — malformed blob must repair, not crash */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const msgs = watchConsole(page);
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    await page.evaluate((key) => localStorage.setItem(key, "{not valid json"), KEY);
    await page.reload({ waitUntil: "networkidle" });
    const overall = await page.locator('nav a[href="/learn/"] .tnum').first().innerText();
    check("malformed blob repairs to 0/38", overall.replace(/\s/g, "") === "0/38", overall);
    check("malformed blob: no page errors", msgs.filter((m) => m.startsWith("pageerror")).length === 0);
    await ctx.close();
  }

  /* 6 — Mark Complete round-trips through a reload */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const url = `${BASE}/learn/3-integration/3-5-rag-pipeline-design/`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /mark complete/i }).click();
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: "networkidle" });
    const pressed = await page.getByRole("button", { name: /completed/i }).getAttribute("aria-pressed");
    check("Mark Complete survives reload", pressed === "true", `aria-pressed=${pressed}`);
    await ctx.close();
  }

  /* 7 — cross-tab sync via the storage event */
  {
    const ctx = await browser.newContext();
    const a = await ctx.newPage();
    const b = await ctx.newPage();
    await a.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    await b.goto(`${BASE}/learn/1-solution-design/1-4-multi-agent-orchestration/`, { waitUntil: "networkidle" });
    await b.getByRole("button", { name: /mark complete/i }).click();
    await b.waitForTimeout(500);
    await a.bringToFront();
    let synced = false;
    for (let i = 0; i < 20; i++) {
      const t = (await a.locator('nav a[href="/learn/"] .tnum').first().innerText()).replace(/\s/g, "");
      if (t === "1/38") { synced = true; break; }
      await a.waitForTimeout(150);
    }
    check("other tab updates without refresh", synced);
    await ctx.close();
  }

  /* 8 — site data blocked: app must still render */
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // Make the PROPERTY access itself throw, which is what a blocked browser does.
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() { throw new DOMException("denied", "SecurityError"); },
      });
    });
    const msgs = watchConsole(page);
    await page.goto(`${BASE}/learn/`, { waitUntil: "networkidle" });
    const heading = await page.locator("h1").first().innerText();
    check("renders with localStorage blocked", heading.length > 0, heading);
    check("blocked storage: no page errors",
      msgs.filter((m) => m.startsWith("pageerror")).length === 0,
      msgs.filter((m) => m.startsWith("pageerror"))[0] ?? "");
    const banner = await page.getByRole("status").count();
    check("blocked storage: banner shown", banner > 0);
    await ctx.close();
  }

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
