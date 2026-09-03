import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("publishes all 15 slide images and the updated PDF", async () => {
  const folder = new URL("../public/assets/materials/ulleung-high-2026-09-05/", import.meta.url);
  const files = (await readdir(folder)).filter((name) => name.endsWith(".webp")).sort();
  assert.deepEqual(files, Array.from({ length: 15 }, (_, i) => `slide-${String(i + 1).padStart(2, "0")}.webp`));
  await access(new URL("../public/assets/materials/ulleung-high-living-lab-2026.pdf", import.meta.url));
});

test("links the September class to a web viewer without forcing download", async () => {
  const html = await readFile(new URL("../.next/server/app/materials.html", import.meta.url), "utf8");
  assert.match(html, /href="\/materials\/ulleung-high-living-lab"/);
  assert.doesNotMatch(html, /13쪽/);
  const viewer = await readFile(new URL("../.next/server/app/materials/ulleung-high-living-lab.html", import.meta.url), "utf8");
  assert.match(viewer, /쪽 선택/);
  assert.match(viewer, /원본 크기로 보기/);
  assert.match(viewer, /PDF 다운로드/);
  assert.match(viewer, /slide-01.webp/);
  assert.match(viewer, /신청 전 정리할 네 가지/);
  assert.match(viewer, /울릉군 생태관광 AI 교육과 별개의 수업 자료/);
});
