import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

test("the restored course preview keeps its two-column image layout", async () => {
  const css = await readFile("styles/pages/home.css", "utf8");
  assert.match(css, /\.brand-education-cards\s*\{[^}]*display: grid;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.brand-education-cards img\s*\{[^}]*width: 100%;[^}]*height: auto;/);
});

test("recovery preserves new films while retaining the revised home and course", async () => {
  for (const prefix of ["", "en/"]) {
    const home = await readFile(`.test-output/pages/${prefix}index.html`, "utf8");
    const episode = await readFile(`.test-output/pages/${prefix}episode.html`, "utf8");
    assert.ok(home.includes("project-dullg-brand-film-v1.mp4"));
    assert.ok(home.indexOf('id="brand-works-title"') < home.indexOf('id="brand-film-title"'));
    assert.ok(home.includes("academy-remake/cover.webp"));
    assert.ok(!home.includes("two-keys-trailer-v8.mp4"));
    assert.ok(episode.includes("two-keys-trailer-v8.mp4"));
    assert.ok(episode.includes(prefix ? "Some story details differ" : "현재 수업팩과 일부 설정이 다릅니다."));
    assert.ok(episode.includes("academy-remake/yoonjiwon.webp"));
    assert.ok(!home.includes('href="/games/tide-room"'));
    assert.ok(!home.includes('href="/games/discharge-day"'));
    assert.ok(home.includes('href="/speaking"'));
  }
});

test("source-only games have no fictional English sitemap entries", async () => {
  const xml = await readFile(".test-output/pages/sitemap.xml.body", "utf8");
  for (const slug of ["ulleung-marble", "wallbreak"]) {
    assert.ok(xml.includes(`/games/${slug}`));
    assert.ok(!xml.includes(`/en/games/${slug}`));
  }
  assert.ok(!xml.includes("/speaking"));
  for (const file of [
    "app/speaking/api/access/route.ts",
    "app/speaking/api/study/route.ts",
    "app/speaking/assets/[...path]/route.ts",
    "public/wallbreak/index.html",
  ]) await access(file);
});
