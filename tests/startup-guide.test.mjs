import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { startupGuide, guideSteps, manualTitles } from "../lib/startup-guide.ts";
import { startupExamples } from "../lib/startup-examples.ts";

test("startup guide provides bilingual instructions, downloads and all manual pages", async () => {
  assert.equal(guideSteps.length, 5);
  assert.equal(manualTitles.length, 12);
  assert.equal(startupExamples.length, 7);
  assert.equal(startupExamples.filter(item => item.track === "local").length, 4);
  assert.ok(startupExamples.some(item => item.id === "ulleung-magazine"));
  for (const locale of ["", "en/"]) {
    const html = await readFile(`.test-output/pages/${locale}materials/modoo-startup.html`, "utf8");
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const id of ["review", "tracks", "examples", "practice", "files", "manual", "check"]) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes(startupGuide.previousPrompt));
    assert.ok(!html.includes("<video"));
    assert.ok(!html.includes("00:00"));
    assert.ok(!html.includes("재생 위치로 이동하는 링크는 아닙니다"));
    if (!locale) {
      assert.ok(html.includes("울산광역시 → 이노빌드랩 선택"));
      assert.ok(html.includes("로컬 분야: 경북창조경제혁신센터 선택"));
    }
    for (const example of startupExamples) assert.ok(html.includes(`data-idea="${example.id}"`));
    assert.ok(html.includes("235011/artclView.do"));
    assert.ok(html.includes("366822/artclView.do"));
    assert.ok(html.includes(startupGuide.pdf));
    assert.ok(html.includes(startupGuide.prompt));
    assert.equal((html.match(/<figure>/g) || []).length, 12);
    assert.ok(html.includes(`href="/${locale}activity/ulleung-online-startup-2026"`));
  }
  for (const file of [startupGuide.pdf, startupGuide.prompt]) assert.ok((await stat(`public${file}`)).size > 1000);
  for (let i = 1; i <= 12; i++) assert.ok((await stat(`public/assets/materials/modoo-startup/page-${String(i).padStart(2, "0")}.webp`)).size > 1000);
});
