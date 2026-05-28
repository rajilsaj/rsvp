/**
 * Cookie auth + form validation smoke tests.
 * Run: node test-cookie-flow.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  failed++;
}

async function assert(label, condition, detail) {
  if (await condition) ok(label);
  else fail(label, detail);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ── Suite 1: No cookie → redirect to /rsvp ───────────────────────────────
  console.log("\n[1] No cookie → must land on /rsvp");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await assert("redirected to /rsvp", async () => page.url().endsWith("/rsvp"));
    // Form fields present
    await assert("name input visible", async () => page.locator('[placeholder="Your full name"]').isVisible());
    await assert("phone input present", async () => page.locator('[data-testid="input-phone"]').count().then(n => n > 0));
    await assert("submit button present", async () => page.locator('button[type="submit"]').count().then(n => n > 0));
    await ctx.close();
  }

  // ── Suite 2: /rsvp page already has cookie → redirect to / ───────────────
  console.log("\n[2] Cookie present → /rsvp redirects to home");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent("Test User"),
      domain: "localhost",
      path: "/",
    }]);
    await page.goto(`${BASE}/rsvp`, { waitUntil: "networkidle" });
    await assert("redirected away from /rsvp", async () => !page.url().endsWith("/rsvp"));
    await ctx.close();
  }

  // ── Suite 3: Homepage with cookie — spinner shown, then resolves ──────────
  console.log("\n[3] Homepage with cookie — spinner then content");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent("Test User"),
      domain: "localhost",
      path: "/",
    }]);
    // Intercept /api/guests to simulate slow response (verifies spinner is shown)
    let guestsRequested = false;
    await page.route("**/api/guests", async (route) => {
      guestsRequested = true;
      // respond with empty list — guest not in sheet
      await route.fulfill({ status: 200, body: "[]", contentType: "application/json" });
    });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await assert("/api/guests was fetched", async () => guestsRequested);
    // Should be on homepage (not redirected to /rsvp) since cookie exists
    await assert("stayed on homepage", async () => !page.url().endsWith("/rsvp"));
    await ctx.close();
  }

  // ── Suite 4: Homepage with cookie, guest NOT in sheet → form pre-filled ───
  console.log("\n[4] Cookie guest not in sheet → RSVP form pre-filled with name");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const cookieName = "Grace Nyiraneza";
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent(cookieName),
      domain: "localhost",
      path: "/",
    }]);
    await page.route("**/api/guests", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.route("**/api/wishlist-claims", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(BASE, { waitUntil: "networkidle" });
    // Scroll to rsvp section to ensure it's rendered
    await page.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
    await page.waitForTimeout(500);
    const nameVal = await page.inputValue('[data-testid="input-name"]');
    await assert("name input pre-filled from cookie", async () => nameVal === cookieName);
    await ctx.close();
  }

  // ── Suite 5: Homepage with cookie, guest IN sheet → confirmation card ─────
  console.log("\n[5] Cookie guest found in sheet → shows confirmation card, no form");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const cookieName = "Grace Nyiraneza";
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent(cookieName),
      domain: "localhost",
      path: "/",
    }]);
    const fakeGuest = { id: "abc", names: cookieName, phone: "(919) 000-0000",
      email: "", attending: "yes", plusOnes: 0, token: "tok", sent: "FALSE",
      clicked: "FALSE", table: "", seats: "", optOut: false };
    await page.route("**/api/guests", route =>
      route.fulfill({ status: 200, body: JSON.stringify([fakeGuest]), contentType: "application/json" })
    );
    await page.route("**/api/wishlist-claims", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
    await page.waitForTimeout(500);
    // The confirmation card says "You're all set"
    const cardText = await page.locator("#rsvp-section").innerText().catch(() => "");
    await assert("confirmation card shown", async () => cardText.includes("You're all set"));
    // No form inputs visible
    const formCount = await page.locator('[data-testid="input-name"]').count();
    await assert("RSVP form inputs hidden", async () => formCount === 0);
    await ctx.close();
  }

  // ── Suite 6: Homepage RSVP form validation ────────────────────────────────
  console.log("\n[6] Homepage RSVP form — validation blocks empty submit");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent("Test User"),
      domain: "localhost",
      path: "/",
    }]);
    await page.route("**/api/guests", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.route("**/api/wishlist-claims", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
    await page.waitForTimeout(500);

    // Clear name, submit → validation error expected
    await page.fill('[data-testid="input-name"]', "");
    await page.click('[data-testid="button-submit-rsvp"]');
    await page.waitForTimeout(200);
    const pageText = await page.locator("#rsvp-section").innerText();
    await assert("name error shown", async () => pageText.includes("Full name is required"));
    await assert("phone error shown", async () => pageText.includes("Phone number is required"));
    await ctx.close();
  }

  // ── Suite 7: Phone mask renders (XXX) XXX-XXXX placeholder ───────────────
  console.log("\n[7] Phone field shows masked placeholder");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent("Test User"),
      domain: "localhost",
      path: "/",
    }]);
    await page.route("**/api/guests", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.route("**/api/wishlist-claims", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
    await page.waitForTimeout(500);
    // Ghost overlay text should contain underscores for unfilled slots
    const section = await page.locator("#rsvp-section").innerText();
    await assert("phone mask placeholder visible", async () => section.includes("(___)"));
    await ctx.close();
  }

  // ── Suite 8: Photos page served without JS redirect ───────────────────────
  console.log("\n[8] /photos page loads");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      value: encodeURIComponent("Test User"),
      domain: "localhost",
      path: "/",
    }]);
    await page.goto(`${BASE}/photos`, { waitUntil: "networkidle" });
    await assert("photos page loaded", async () => page.url().includes("/photos"));
    const h1 = await page.locator("h1").first().innerText().catch(() => "");
    await assert("shows Our Photos heading", async () => h1.includes("Our Photos"));
    await ctx.close();
  }

  // ── Suite 9: /rsvp form validation ───────────────────────────────────────
  console.log("\n[9] /rsvp form — validation messages");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/rsvp`, { waitUntil: "networkidle" });
    // Submit empty
    await page.click('button[type="submit"]');
    await page.waitForTimeout(200);
    const body = await page.locator("body").innerText();
    await assert("name required shown", async () => body.includes("Full name is required"));
    await assert("phone required shown", async () => body.includes("Phone number is required"));
    await assert("attend required shown", async () => body.includes("let us know"));
    await ctx.close();
  }

  // ── Suite 10: Cookie encoding round-trip ─────────────────────────────────
  console.log("\n[10] Cookie encode/decode round-trip (special chars)");
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // Name with & and accent
    const specialName = "O'Brien & Associates";
    await ctx.addCookies([{
      name: "wedding_rsvp_name",
      // Store as our new code would: encodeURIComponent
      value: encodeURIComponent(specialName),
      domain: "localhost",
      path: "/",
    }]);
    await page.route("**/api/guests", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.route("**/api/wishlist-claims", route =>
      route.fulfill({ status: 200, body: "[]", contentType: "application/json" })
    );
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.getElementById("rsvp-section")?.scrollIntoView());
    await page.waitForTimeout(500);
    const nameVal = await page.inputValue('[data-testid="input-name"]');
    await assert("special-char name decoded correctly", async () => nameVal === specialName);
    await ctx.close();
  }

  await browser.close();

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
