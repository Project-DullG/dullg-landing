import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("presents the UZU synopsis, characters and difficulty guidance with attribution", async () => {
  const html = await readFile(new URL("../.next/server/app/works/gray-girl-memory.html", import.meta.url), "utf8");
  for (const text of ["UZU 공식 소개 요약", "공식 줄거리 원문 발췌", "붉은 머리의 묘인", "노란 머리의 드워프", "파란 머리의 인간", "초록 머리의 엘프", "숙련자", "소지품", "Nano Banana"]) assert.ok(html.includes(text), text);
  assert.match(html, /https:\/\/www.uzu-app.com\/ko\/scenario\/15536/);
  assert.doesNotMatch(html, /이 작품에서/);
});
