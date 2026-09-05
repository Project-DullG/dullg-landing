import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shows one direct reading entry per course instead of file menus", async () => {
  const html = await readFile(new URL("../.next/server/app/materials.html", import.meta.url), "utf8");
  const ecotourism = await readFile(
    new URL("../.next/server/app/materials/ulleung-ecotourism-ai.html", import.meta.url),
    "utf8",
  );
  assert.equal((html.match(/class="course-row"/g) || []).length, 2);
  assert.doesNotMatch(html, /<details|자료 5개|boardgame\.html|class\.html|prompt-guide\.html/);
  assert.match(html, /href="\/materials\/ulleung-ecotourism-ai"/);
  assert.match(html, /href="\/materials\/ulleung-high-living-lab"/);
  assert.match(ecotourism, /href="https:\/\/kanghoon1204.github.io\/ulleung-ecotourism-edu\/"/);
});
