import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { lesson2, lesson2Slides } from "../lib/lesson2.ts";

test("September 19 has 58 revised slides and its own PDF and material entry", async () => {
  assert.equal(lesson2.date, "2026-09-19");
  assert.equal(lesson2Slides(false).length, 58);
  assert.ok((await stat(`public${lesson2.pdf}`)).size > 2000000);
  for (const slide of lesson2Slides(false)) {
    assert.ok((await stat(`public${slide.image}`)).size > 1000);
  }
  for (const locale of ["", "en/"]) {
    const page = await readFile(`.test-output/pages/${locale}materials/ulleung-high-lesson-2.html`, "utf8");
    assert.equal((page.match(/id="slide-\d+"/g) || []).length, 58);
    assert.ok(page.includes(lesson2.pdf));
    assert.ok(page.includes(`href="/${locale}materials/ulleung-high-living-lab"`));
    const index = await readFile(`.test-output/pages/${locale}materials.html`, "utf8");
    assert.ok(index.includes(`href="/${locale}materials/ulleung-high-lesson-2"`));
  }
});
