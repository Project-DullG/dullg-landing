import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { homeFeaturedWorks } from "../lib/works.ts";
import { activityRecords } from "../lib/activities.ts";

const html = (route) =>
  readFile(new URL(`../.test-output/pages/${route}.html`, import.meta.url), "utf8");

test("home distinguishes a featured work from two related works and keeps real work details", async () => {
  const page = await html("index");
  const featured = page.match(
    /<article[^>]*aria-labelledby="featured-work-title"[\s\S]*?<\/article>/,
  )?.[0];
  assert.ok(featured);
  const [work, ...related] = homeFeaturedWorks;
  for (const value of [
    work.title,
    work.synopsis,
    work.players,
    work.duration,
    work.platform,
    work.alt,
  ]) {
    assert.ok(featured.includes(value), value);
  }
  for (const other of related) {
    assert.ok(page.includes(`href="/works/${other.slug}"`));
    assert.ok(!featured.includes(other.title));
  }
  const sectionIds = [
    "brand-works-title",
    "home-mini-title",
    "home-activity-title",
    "brand-education-title",
    "apply",
  ];
  const positions = sectionIds.map((id) => page.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
  );
});

test("home shows existing education descriptions without merging the two courses", async () => {
  const page = await html("index");
  for (const record of activityRecords.filter((r) => r.type === "교육" && r.image).slice(0, 2)) {
    assert.ok(page.includes(record.title));
    assert.ok(page.includes(record.body));
    assert.match(page, new RegExp(`dateTime="${record.date}"`, "i"));
    assert.ok(page.includes(`href="${record.href}"`));
  }
  assert.match(page, /준비 중 · 영어 미스터리 수업팩/);
});

test("production process lives on about, while home retains company and education paths", async () => {
  const [home, about, academy] = await Promise.all([html("index"), html("about"), html("academy")]);
  assert.doesNotMatch(home, /id="brand-method-title"|id="home-tools-title"|class="dash-preview"/);
  assert.match(home, /href="\/about"/);
  assert.match(home, /href="\/academy"/);
  assert.match(home, /href="\/demo"/);
  assert.match(about, /id="process"/);
  for (const stage of [
    "사건의 시작과 끝을 정합니다",
    "정보를 인물마다 나눕니다",
    "플레이하며 반복해서 고칩니다",
  ]) {
    assert.ok(about.includes(stage));
  }
  assert.match(academy, /class="dash-preview"/);
});

test("mini portfolio groups eight puzzle games and four arcade games without duplicate entries", async () => {
  const page = await html("mini-projects");
  for (const [id, title, count] of [
    ["puzzle-games", "퍼즐·카드 게임", 8],
    ["arcade-games", "아케이드 게임", 4],
  ]) {
    const section = page.match(
      new RegExp(`<section[^>]*aria-labelledby="${id}"[\\s\\S]*?</section>`),
    )?.[0];
    assert.ok(section);
    assert.ok(section.includes(title));
    assert.ok(section.includes(`${count}`));
    const links = [...section.matchAll(/href="(\/mini-projects\/[^"#]+)"/g)].map((m) => m[1]);
    assert.equal(links.length, count);
    assert.equal(new Set(links).size, count);
  }
});
