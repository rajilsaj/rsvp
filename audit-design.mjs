import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";

const BASE = "http://localhost:3000";
const OUT  = "audit-screenshots";
mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Mobile viewport (390×844 — iPhone 14) ────────────────────────────────
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mPage  = await mobile.newPage();

  console.log("\n[mobile] /rsvp");
  await mPage.goto(`${BASE}/rsvp`, { waitUntil: "networkidle" });
  await shot(mPage, "mobile-rsvp");

  console.log("[mobile] homepage (cookie gate)");
  await mPage.context().addCookies([{
    name: "wedding_rsvp_name", value: encodeURIComponent("Test User"),
    domain: "localhost", path: "/",
  }]);
  await mPage.route("**/api/guests", r => r.fulfill({ status: 200, body: "[]", contentType: "application/json" }));
  await mPage.route("**/api/wishlist-claims", r => r.fulfill({ status: 200, body: "[]", contentType: "application/json" }));
  await mPage.goto(BASE, { waitUntil: "networkidle" });
  await shot(mPage, "mobile-home-hero");
  await mPage.evaluate(() => document.getElementById("story")?.scrollIntoView());
  await mPage.waitForTimeout(600);
  await shot(mPage, "mobile-home-story");
  await mPage.evaluate(() => document.getElementById("events")?.scrollIntoView());
  await mPage.waitForTimeout(600);
  await shot(mPage, "mobile-home-events");
  await mPage.evaluate(() => document.getElementById("venue-section")?.scrollIntoView());
  await mPage.waitForTimeout(600);
  await shot(mPage, "mobile-home-venue");
  await mPage.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
  await mPage.waitForTimeout(600);
  await shot(mPage, "mobile-home-rsvp-section");
  await mobile.close();

  // ── Desktop viewport (1440×900) ───────────────────────────────────────────
  const desk  = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desk.newPage();
  await dPage.context().addCookies([{
    name: "wedding_rsvp_name", value: encodeURIComponent("Test User"),
    domain: "localhost", path: "/",
  }]);
  await dPage.route("**/api/guests", r => r.fulfill({ status: 200, body: "[]", contentType: "application/json" }));
  await dPage.route("**/api/wishlist-claims", r => r.fulfill({ status: 200, body: "[]", contentType: "application/json" }));

  console.log("\n[desktop] homepage");
  await dPage.goto(BASE, { waitUntil: "networkidle" });
  await shot(dPage, "desktop-home-hero");
  await dPage.evaluate(() => document.getElementById("events")?.scrollIntoView());
  await dPage.waitForTimeout(600);
  await shot(dPage, "desktop-home-events");
  await dPage.evaluate(() => document.getElementById("venue-section")?.scrollIntoView());
  await dPage.waitForTimeout(600);
  await shot(dPage, "desktop-home-venue-rsvp");

  console.log("[desktop] /rsvp");
  const rsvpPage = await desk.newPage();
  await rsvpPage.goto(`${BASE}/rsvp`, { waitUntil: "networkidle" });
  await shot(rsvpPage, "desktop-rsvp");

  console.log("[desktop] /photos");
  const photosPage = await desk.newPage();
  await photosPage.context().addCookies([{
    name: "wedding_rsvp_name", value: encodeURIComponent("Test User"),
    domain: "localhost", path: "/",
  }]);
  await photosPage.goto(`${BASE}/photos`, { waitUntil: "networkidle" });
  await shot(photosPage, "desktop-photos");

  await desk.close();
  await browser.close();
  console.log(`\nAll screenshots saved to ./${OUT}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
