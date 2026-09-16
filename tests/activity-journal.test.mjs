import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const records = [
  ["ulsan-youth-arts-2026", "2026-09-12", "/works/snake-carnival"],
  ["ulleung-high-living-lab", "2026-09-05", "/materials/ulleung-high-living-lab"],
  ["ulleung-ecotourism-ai", "2026-07-04", "/materials/ulleung-ecotourism-ai"],
];

test("September 16 online class has a dated bilingual record and privacy-edited image", async () => {
  for (const locale of ["", "en/"]) {
    const html = await readFile(`.test-output/pages/${locale}activity/ulleung-online-startup-2026.html`, "utf8");
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes('<time dateTime="2026-09-16">'));
    assert.ok(html.includes("ulleung-online-startup-2026-09-16-meeting.webp"));
    assert.ok(html.includes("<figcaption>"));
    assert.ok(html.includes(`href="/${locale}activity/ulleung-high-living-lab"`));
  }
});

test("activity articles have one title, dated bylines, captioned photos and related links", async () => {
  for (const [slug, date, related] of records) {
    for (const locale of ["", "en/"]) {
      const html = await readFile(`.test-output/pages/${locale}activity/${slug}.html`, "utf8");
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.ok(html.includes(`<time dateTime="${date}">`));
      assert.ok(html.includes("<article"));
      const article = html.match(/<article\b[\s\S]*?<\/article>/)?.[0] || "";
      if (!locale) {
        for (const phrase of ["사진 속 책상에는", "아래 사진은", "사진 뒤쪽에는", "이 글에서는"])
          assert.ok(!article.includes(phrase), `${slug}: ${phrase}`);
      }
      assert.ok((article.match(/<section\b/g) || []).length >= (slug === "ulsan-youth-arts-2026" ? 3 : 4));
      if (slug === "ulsan-youth-arts-2026" && !locale) {
        assert.ok(article.includes("작품 네 편을 챙겨 행사장으로"));
        assert.ok(!article.includes("사진 뒤쪽에는"));
        assert.ok(!article.includes("이 글에서는"));
      }
      assert.ok(html.includes("<figcaption>"));
      assert.ok(html.includes(`href="/${locale}${related.slice(1)}"`));
      assert.ok(html.indexOf("<figcaption>") < html.indexOf('id="related-title"'));
      if (slug === "ulleung-high-living-lab") {
        assert.ok(!html.includes('href="/materials/ulleung-ecotourism-ai"'));
      }
    }
  }
});
