import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:3082";
const browser = await chromium.launch();
try {
  for (const [width, height] of [[360,780],[390,844],[768,1024],[1440,900],[812,375]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/assets/last-screening/index.html");
    await page.locator("#titleNew").click();
    assert.ok(await page.locator(".intake-card h1").evaluate(e => e.getBoundingClientRect().top >= 0));
    await page.locator("#beginCase").click();
    for (let i=0;i<12;i++) await page.locator('[data-act="advance"]:visible').first().click();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width <= 800) {
      for (const button of await page.locator(".main-nav button").all()) {
        const rect = await button.boundingBox();
        assert.ok(rect.x >= 0 && rect.x + rect.width <= width + 1 && rect.height >= 44);
      }
    }
    await page.locator('.top-controls [data-act="settings"]').click();
    await page.locator("#cfg-instant").check();
    await page.keyboard.press("Escape");
    const before = await page.evaluate(() => GAME_DIAGNOSTICS.snapshot().game);
    await page.reload();
    await page.locator('[data-act="continue"]').click();
    const after = await page.evaluate(() => GAME_DIAGNOSTICS.snapshot().game);
    assert.deepEqual(after.evidence, before.evidence);
    assert.equal(after.location, before.location);
    assert.ok(await page.evaluate(() => GAME_DIAGNOSTICS.snapshot().settings.instant));
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}×${height}: title, intake, dialogue, settings, reload`);
    await page.close();
  }
} finally { await browser.close(); }
