import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const records = [
  ["ulsan-youth-arts-2026", "2026-09-12", "/works/snake-carnival"],
  ["ulleung-high-living-lab", "2026-09-05", "/materials/ulleung-high-living-lab"],
  ["ulleung-ecotourism-ai", "2026-07-04", "/materials/ulleung-ecotourism-ai"],
];

test("activity articles have one title, dated bylines, captioned photos and related links", async () => {
  for (const [slug, date, related] of records) {
    for (const locale of ["", "en/"]) {
      const html = await readFile(`.test-output/pages/${locale}activity/${slug}.html`, "utf8");
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.ok(html.includes(`<time dateTime="${date}">`));
      assert.ok(html.includes("<article"));
      assert.ok(html.includes("<figcaption>"));
      assert.ok(html.includes(`href="/${locale}${related.slice(1)}"`));
      assert.ok(html.indexOf("<figcaption>") < html.indexOf('id="related-title"'));
      if (slug === "ulleung-high-living-lab") {
        assert.ok(!html.includes('href="/materials/ulleung-ecotourism-ai"'));
      }
    }
  }
});
