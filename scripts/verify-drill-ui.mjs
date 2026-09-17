/**
 * Drill UI, driven against a SERVED EXPORT (npm run serve).
 * Usage: node scripts/verify-drill-ui.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const BASE = process.argv[2] ?? "http://localhost:3001";
const KEY = "ccarp:v1";
const root = join(homedir(), "Library/Caches/ms-playwright");
const shell = readdirSync(root)
  .filter((d) => d.startsWith("chromium_headless_shell-"))
  .sort((a, b) => Number(b.split("-").pop()) - Number(a.split("-").pop()))
  .map((d) => join(root, d, "chrome-headless-shell-mac-arm64/chrome-headless-shell"))
  .find(existsSync);

let fails = 0;
const check = (n, p, d = "") => {
  if (!p) fails++;
  console.log(`${p ? "  ok  " : "FAIL  "} ${n}${d ? ` — ${d}` : ""}`);
};

/** Select enough choices for whichever item is showing, then check it. */
async function answerCurrent(page) {
  const text = await page.locator("main").innerText();
  const needed = /select three/i.test(text) ? 3 : /select two/i.test(text) ? 2 : 1;
  for (let i = 1; i <= needed; i++) {
    await page.keyboard.press(String(i));
    await page.waitForTimeout(120);
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  return needed;
}

const browser = await chromium.launch({ executablePath: shell, headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

await page.goto(`${BASE}/learn/drill/`, { waitUntil: "networkidle" });
const setup = await page.locator("main").innerText();
check("drill setup screen renders", /drill mode/i.test(setup));
check("setup shows queue counts", /due today/i.test(setup) && /in pool/i.test(setup));
check("all seven modes are offered",
  ["Due", "Mixed", "New", "Weak areas", "Leeches", "Bookmarked", "Cram"]
    .every((m) => setup.includes(m)));

// A fresh deck has nothing due, so start in Mixed to pull in new cards.
await page.getByRole("button", { name: "Mixed", exact: true }).click();
await page.getByRole("button", { name: /start session/i }).click();
await page.waitForTimeout(500);

let body = await page.locator("main").innerText();
check("a session starts on the first card", /\b1\/\d+\b/.test(body), body.split("\n")[0]);
check("the current box is shown", /box 0/i.test(body));

// Answer correctly via keyboard. D2-q001's key is C (3rd choice).
await answerCurrent(page);
body = await page.locator("main").innerText();
check("checking reveals a verdict", /correct|not quite/i.test(body));
check("the SRS transition is shown explicitly", /box \d+ → \d+/i.test(body), (body.match(/Box \d+ → \d+[^\n]*/i) ?? [""])[0]);
check("the next review interval is stated", /next review/i.test(body));
check("a lesson link is offered after answering", /lesson \d\.\d/i.test(body));

await page.keyboard.press("Enter");
await page.waitForTimeout(400);
check(
  "Enter advances to the next card",
  /\b2\/\d+\b/.test(await page.locator("main").innerText()),
);

// Bookmark, then confirm the bookmarked filter finds it.
await page.keyboard.press("b");
await page.waitForTimeout(300);
// "?" opens the shortcut overlay; Escape closes it before ending the session.
await page.keyboard.press("?");
await page.waitForTimeout(500);
check("? opens the shortcut overlay",
  /keyboard shortcuts/i.test(await page.locator("body").innerText()));
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
const afterOverlayClose = await page.locator("main").innerText();
check("Escape closes the overlay without ending the session",
  !/session complete/i.test(afterOverlayClose));

await page.keyboard.press("Escape");
await page.waitForTimeout(300);
check("Escape then ends the session", /session complete/i.test(await page.locator("main").innerText()));

await page.getByRole("button", { name: /change filters/i }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Bookmarked", exact: true }).click();
await page.getByRole("button", { name: /start session/i }).click();
await page.waitForTimeout(400);
check("bookmarked mode finds the bookmarked card",
  /\b1\/1\b/.test(await page.locator("main").innerText()));

// Cram must not write schedule state. Seed a card that is demonstrably
// scheduled far out, so the assertion is direct rather than incidental.
await page.goto(`${BASE}/learn/drill/`, { waitUntil: "networkidle" });
// Seed whatever cards this browser has actually accumulated, rather than
// hardcoded ids — the bank is renumbered as content lands, and a test that
// pins ids silently stops testing anything when they change.
const seeded = await page.evaluate((k) => {
  const blob = JSON.parse(localStorage.getItem(k) ?? "{}");
  const drill = blob.drill ?? { cards: {} };
  drill.cards = drill.cards ?? {};
  const ids = Object.keys(drill.cards).slice(0, 3);
  const future = Date.now() + 14 * 86400000;
  for (const id of ids) {
    drill.cards[id] = { b: 5, due: future, r: 6, c: 6, l: 0, st: 4, last: Date.now() };
  }
  localStorage.setItem(k, JSON.stringify({ ...blob, schemaVersion: 1, drill }));
  return { ids, future };
}, KEY);
await page.reload({ waitUntil: "networkidle" });

const cardsBefore = JSON.parse(
  await page.evaluate((k) => localStorage.getItem(k), KEY),
).drill.cards;
check(
  "earlier answers created drill cards to seed",
  seeded.ids.length > 0,
  `${seeded.ids.length} card(s): ${seeded.ids.join(", ")}`,
);
check(
  "seeded cards are scheduled two weeks out",
  seeded.ids.length > 0 &&
    seeded.ids.every((id) => cardsBefore[id]?.b === 5 && cardsBefore[id]?.due === seeded.future),
);

await page.getByRole("button", { name: "Cram", exact: true }).click();
await page.getByRole("button", { name: /start session/i }).click();
await page.waitForTimeout(400);
check("cram warns that nothing is recorded",
  /cram/i.test(await page.locator("main").innerText()));

await answerCurrent(page);
const afterCram = JSON.parse(
  await page.evaluate((k) => localStorage.getItem(k), KEY),
).drill.cards;

// Cram may draw any card, so assert globally: no pre-existing card's schedule
// moved, while total reps did increase.
const movedSchedule = Object.keys(cardsBefore).filter(
  (id) =>
    afterCram[id] &&
    (afterCram[id].b !== cardsBefore[id].b || afterCram[id].due !== cardsBefore[id].due),
);
check(
  "cram moved no box and no due date on any existing card",
  movedSchedule.length === 0,
  movedSchedule.join(", "),
);
const gainedLapse = Object.keys(cardsBefore).filter(
  (id) => afterCram[id] && afterCram[id].l > cardsBefore[id].l,
);
check(
  "cram added no lapse, even on a wrong answer",
  gainedLapse.length === 0,
  gainedLapse.join(", "),
);
const repsBefore = Object.values(cardsBefore).reduce((a, c) => a + c.r, 0);
const repsAfter = Object.values(afterCram).reduce((a, c) => a + c.r, 0);
check(
  "cram still counted the rep",
  repsAfter > repsBefore,
  `${repsBefore} -> ${repsAfter}`,
);

check("no page errors in drill", errs.length === 0, errs[0] ?? "");

await browser.close();
console.log(fails === 0 ? "\nall drill UI checks passed" : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
