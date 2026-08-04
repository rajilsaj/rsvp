import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DIR = process.argv[2];

for (let i = 0; i < 90; i++) {
  try {
    const res = await fetch(BASE + "/rsvp");
    if (res.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 1000));
}

const browser = await chromium.launch({ headless: true });

const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: "wedding_rsvp_name", value: "Test Guest", url: BASE }]);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(6000);
await page.screenshot({ path: `${DIR}/strip-final.png` });

const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await mctx.addCookies([{ name: "wedding_rsvp_name", value: "Test Guest", url: BASE }]);
const mpage = await mctx.newPage();
await mpage.goto(BASE, { waitUntil: "networkidle" }).catch(() => {});
await mpage.waitForTimeout(6000);
await mpage.screenshot({ path: `${DIR}/strip-final-mobile.png` });

await browser.close();
console.log("done");
