import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { activityRecords } from "../lib/activities.ts";
import { youthArtsFestival as festival } from "../lib/festival.ts";

test("festival record is linked from home, activity and both language sitemaps", async () => {
  assert.equal(activityRecords[0].href, festival.href);
  assert.equal(activityRecords[0].type, "전시");
  for (const locale of ["", "en/"]) {
    for (const page of ["index", "activity"]) {
      const html = await readFile(`.test-output/pages/${locale}${page}.html`, "utf8");
      assert.ok(html.includes(`href="/${locale}activity/ulsan-youth-arts-2026"`));
    }
    const detail = await readFile(`.test-output/pages/${locale}activity/ulsan-youth-arts-2026.html`, "utf8");
    assert.ok(detail.includes(festival.image.src));
    for (const slug of ["snake-carnival", "red-lab", "gourmet-master", "too-many-doctors"])
      assert.ok(detail.includes(`href="/${locale}works/${slug}"`));
  }
  const sitemap = await readFile(".test-output/pages/sitemap.xml.body", "utf8");
  assert.ok(sitemap.includes(festival.href));
  assert.ok(sitemap.includes(`/en${festival.href}`));
  assert.ok((await stat(`public${festival.image.src}`)).size < 250000);
});

test("header, footer and social image use the shared vector mark", async () => {
  for (const path of ["components/header.tsx", "components/site.tsx", "app/opengraph-image.tsx"]) {
    const source = await readFile(path, "utf8");
    assert.match(source, /<BrandMark/);
  }
  const icon = await readFile("app/icon.svg", "utf8");
  assert.match(icon, /M23 7C33 7 41 14 41 24/);
});
