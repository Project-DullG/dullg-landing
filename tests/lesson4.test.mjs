import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { lesson4, lesson4Slides } from "../lib/lesson4.ts";

test("session 4 publishes the 32-slide deck with PDF and editable PPT downloads", async () => {
  assert.equal(lesson4Slides(false).length, 32);
  assert.equal(lesson4Slides(true).length, 32);
  for (const file of [lesson4.pdf, lesson4.pptx]) {
    assert.ok((await stat(`public${file}`)).size > 1_000_000);
  }
  for (const slide of lesson4Slides(false)) {
    const image = await sharp(`public${slide.image}`).metadata();
    assert.equal(image.width, 1920);
    assert.equal(image.height, 1080);
  }
  for (const locale of ["", "en/"]) {
    const page = await readFile(
      `.test-output/pages/${locale}materials/ulleung-high-lesson-4.html`,
      "utf8",
    );
    assert.equal((page.match(/id="slide-\d+"/g) || []).length, 32);
    assert.ok(page.includes(lesson4.pdf));
    assert.ok(page.includes(lesson4.pptx));
    assert.ok(page.includes(`href="/${locale}materials/ulleung-high-lesson-2"`));
    const index = await readFile(`.test-output/pages/${locale}materials.html`, "utf8");
    assert.ok(index.includes(`href="/${locale}materials/ulleung-high-lesson-4"`));
  }
});
