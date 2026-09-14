import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:3070";
const source = await readFile("games/discharge-day/tests/original_routes.py", "utf8");
let routeScript = source.match(/SCRIPT=r'''([\s\S]*?)'''/)[1];
routeScript = routeScript.replace(
  "const r=b.getBoundingClientRect()",
  "if(!b.getClientRects().length)continue;const r=b.getBoundingClientRect()",
);
routeScript = routeScript.replace(
  "G.finishReading();\n  for",
  "G.finishReading();window.checkGameLayout(node);\n  for",
);
const routes = JSON.parse(
  await readFile("games/discharge-day/qa/logic_test_report.json", "utf8"),
).routes;
const browser = await chromium.launch();
const report = [];
await mkdir("/private/tmp/discharge-qa", { recursive: true });
try {
  for (const [width, height] of [
    [360, 780],
    [390, 844],
    [768, 1024],
    [1440, 900],
    [812, 375],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${base}/assets/discharge-day/index.html`);
    await page.evaluate(() => {
      DischargeGame.setTestMode();
      window.checkGameLayout = (node) => {
        if (document.documentElement.scrollWidth > innerWidth)
          throw Error("Horizontal overflow: " + node);
        const rects = ["stage", "narrative", "conversation-choices", "dock"]
          .map((id) => document.getElementById(id))
          .filter((e) => !e.hidden)
          .map((e) => ({ id: e.id, r: e.getBoundingClientRect() }));
        for (let i = 1; i < rects.length; i++)
          if (rects[i].r.top < rects[i - 1].r.bottom - 1)
            throw Error("Overlap " + node + ": " + rects[i - 1].id + " / " + rects[i].id);
        for (const b of document.querySelectorAll("#conversation-choices button"))
          if (b.getBoundingClientRect().height < 44) throw Error("Small touch target");
      };
    });
    await page.locator("#new-game").click();
    const initial = await page.evaluate(() => DischargeGame.pack());
    for (const route of routes) {
      const result = await page.evaluate(({ script, args }) => (0, eval)(script)(args), {
        script: routeScript,
        args: { route, initial },
      });
      assert.equal(result.passed, true);
      assert.deepEqual(result.hit_issues, [], JSON.stringify(result.hit_issues));
    }
    await page.evaluate((initial) => {
      DischargeGame.restoreSave(initial);
      DischargeGame.finishReading();
    }, initial);
    await page.locator('#conversation-choices [data-choice="begin"]').click();
    await page.evaluate(() => DischargeGame.finishReading());
    await page.locator('#conversation-choices [data-choice="belong"]').click();
    assert.equal(await page.evaluate(() => DischargeGame.getState().node), "BELONG");
    await page.reload();
    await page.locator("#continue-game").click();
    assert.equal(await page.evaluate(() => DischargeGame.getState().node), "BELONG");
    await page.locator("#settings-open").click();
    await page.screenshot({ path: `/private/tmp/discharge-qa/settings-${width}.png` });
    assert.equal(await page.locator("#modal").evaluate((e) => e.open), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#modal").evaluate((e) => e.open), false);
    await page.screenshot({ path: `/private/tmp/discharge-qa/game-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    report.push({
      width,
      height,
      routes: routes.length,
      layout: "passed",
      pointer: "passed",
      reload: "passed",
      errors,
    });
    console.log(`PASS ${width}×${height}: ${routes.length} routes, pointer, reload, dialog`);
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile("/private/tmp/discharge-qa/report.json", JSON.stringify(report, null, 2));
