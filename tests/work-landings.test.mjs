import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

test("publishes official landing sections for six individual funded works", async () => {
  const data = JSON.parse(await readFile(new URL("../lib/work-landings.json", import.meta.url), "utf8"));
  assert.equal(Object.keys(data).length, 6);
  const seen = new Set();
  for (const [slug, landing] of Object.entries(data)) {
    assert.match(landing.source, /^https:\/\/tumblbug.com\/projectdg[012]$/);
    assert.ok(landing.images.length > 0);
    for (const image of landing.images) {
      assert.ok(image.src.startsWith(`/assets/works/landing/${slug}/`));
      assert.ok(!seen.has(image.src));
      seen.add(image.src);
      assert.equal(image.width, 1240);
      assert.ok(image.height > 0 && image.height <= 2000);
      await access(new URL(`../public${image.src}`, import.meta.url));
    }
    const html = await readFile(new URL(`../.next/server/app/works/${slug}.html`, import.meta.url), "utf8");
    assert.match(html, /텀블벅 원문/);
    assert.ok(html.includes(landing.images[0].src));
    assert.ok(html.includes(landing.images.at(-1).src));
    assert.doesNotMatch(html, /이 작품에서/);
  }
});
