import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

test("studio introduction separates its origin from award institutions", async () => {
  for (const locale of ["", "en/"]) {
    const html = await readFile(`.test-output/pages/${locale}about.html`, "utf8");
    const introduction = html.match(/<section id="team-history"[\s\S]*?<\/section>/)?.[0];
    assert.ok(introduction);
    const visible = introduction.replace(/<[^>]*>/g, "");
    assert.doesNotMatch(visible, /한동대학교|Handong Global University/);
    assert.match(visible, /덜지니어스|Deoljinius/);
    assert.match(html, /한동대학교 공식 뉴스|Official Handong Global University news/);
  }
});
