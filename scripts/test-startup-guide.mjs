import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readFile } from "node:fs/promises";

const origin = process.argv[2] || "http://localhost:3087";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${origin}/materials/modoo-startup`);
    await page.getByRole("button", { name: "통합 프롬프트 전체 복사" }).click();
    await page.getByRole("status").filter({ hasText: "복사했습니다" }).waitFor();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied, await readFile("public/assets/materials/modoo-startup/master-prompt-v2.0.md", "utf8"));
    for (const example of await page.locator("details[data-idea]").all()) {
      if (!(await example.evaluate(el => el.open))) await example.locator("summary").click();
      assert.equal(await example.locator("dt").count(), 6);
    }
    await page.locator("#manual summary").click();
    await page.locator("figure").last().scrollIntoViewIfNeeded();
    assert.equal(await page.locator("figure").count(), 12);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator("figure").first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const image = document.querySelector("figure img");
      return image?.complete && image.naturalWidth > 0;
    });
    for (const link of await page.locator("a[download]").all()) {
      const href = await link.getAttribute("href");
      const response = await context.request.get(`${origin}${href}`);
      assert.equal(response.status(), 200);
      assert.ok((await response.body()).length > 1000);
    }
    console.log(`PASS ${width}px: copy, downloads, manual and overflow`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/materials/modoo-startup`);
  await page.screenshot({ path: "/tmp/dullg-startup-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/materials/modoo-startup`);
  await page.screenshot({ path: "/tmp/dullg-startup-desktop.png" });
} finally { await browser.close(); }
