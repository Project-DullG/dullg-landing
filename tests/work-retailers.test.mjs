import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { workRetailers } from "../lib/work-retailers.ts";

test("four verified works link to individual Naver products in both languages", async () => {
  assert.equal(Object.keys(workRetailers).length, 4);
  assert.equal(new Set(Object.values(workRetailers).map(r => r.url)).size, 4);
  for (const locale of ["", "en/"]) {
    const list = await readFile(`.test-output/pages/${locale}works.html`, "utf8");
    for (const [slug, retailer] of Object.entries(workRetailers)) {
      assert.match(retailer.url, /^https:\/\/smartstore\.naver\.com\/bottlingcp\/products\/\d+$/);
      const page = await readFile(`.test-output/pages/${locale}works/${slug}.html`, "utf8");
      assert.ok(page.includes(`href="${retailer.url}"`));
      assert.ok(list.includes(`href="${retailer.url}"`));
      assert.match(page, /보틀링컴퍼니|Bottling Company/);
      assert.ok(page.includes("https://tumblbug.com/"));
    }
  }
});
