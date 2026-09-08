import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
const html = (path) =>
  readFile(new URL(`../.next/server/app/${path}.html`, import.meta.url), "utf8");
test("mini portfolio gives series context without invented release dates or repeated sales copy", async () => {
  const index = await html("mini-projects");
  assert.match(index, /2026\.02 시작/);
  assert.match(index, /두 달에 한 편/);
  assert.doesNotMatch(index, /2026년 9월 공개|설치·로그인 없이|계속 개발 중/);
  for (const slug of ["block-stack", "bumper-room", "lane-shift"])
    assert.match(index, new RegExp(`href="/mini-projects/${slug}"`));
  assert.match(await html("index"), /href="\/mini-projects"/);
});
test("all game routes have one heading, controls, canvas, local record notice and credits", async () => {
  for (const slug of ["block-stack", "bumper-room", "lane-shift"]) {
    const page = await html(`mini-projects/${slug}`);
    assert.equal((page.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(page, /<canvas[^>]*width="720"[^>]*height="1040"/);
    assert.match(page, /최고 기록은 이 브라우저에만 저장/);
    assert.match(page, /소리 끔/);
    assert.match(page, /전체 화면/);
    assert.match(page, /Kenney/);
    assert.match(page, /CC0/);
    assert.match(
      page,
      new RegExp(
        `rel="canonical" href="https://dullg-landing-one.vercel.app/mini-projects/${slug}"`,
      ),
    );
  }
});
test("two work trailers are user-initiated and use locally hosted assets", async () => {
  for (const [slug, name] of [
    ["professor-rest", "professor-rest"],
    ["slime-soda", "slime-soda"],
  ]) {
    const page = await html(`works/${slug}`),
      video = page.match(/<video\b[^>]*>/)?.[0];
    assert.ok(video);
    assert.match(video, /controls=""/);
    assert.match(video, /preload="none"/);
    assert.doesNotMatch(video, /autoplay/i);
    assert.match(page, new RegExp(`/assets/work-trailers/${name}-v4.mp4`));
    assert.ok(
      (await stat(new URL(`../public/assets/work-trailers/${name}-v4.mp4`, import.meta.url))).size >
        0,
    );
  }
});
test("selected sprite and audio assets retain their original licenses", async () => {
  for (const name of ["puzzle-pack-2", "racing-pack", "interface-sounds"]) {
    assert.match(
      await readFile(
        new URL(`../public/assets/games/licenses/${name}.txt`, import.meta.url),
        "utf8",
      ),
      /CC0/,
    );
  }
  for (const file of ["tiles/blue.png", "bumper.png", "racing/player.png", "audio/click_001.m4a"]) {
    assert.ok((await stat(new URL(`../public/assets/games/${file}`, import.meta.url))).size > 0);
  }
});

test("six classic game routes are linked, playable and accurately described", async () => {
  const slugs = [
    "minesweeper",
    "solitaire",
    "sudoku",
    "number-merge",
    "memory-pairs",
    "sliding-puzzle",
  ];
  const index = await html("mini-projects"),
    home = await html("index");
  for (const slug of slugs) {
    assert.match(index, new RegExp(`href="/mini-projects/${slug}"`));
    const page = await html(`mini-projects/${slug}`);
    assert.equal((page.match(/<h1[\s>]/g) || []).length, 1);
    assert.match(page, /새 게임/);
    assert.match(page, /소리 끔/);
    assert.match(page, /게임판/);
    assert.doesNotMatch(page, /최고 기록 저장, 전체 화면/);
    assert.match(
      page,
      new RegExp(
        `rel="canonical" href="https://dullg-landing-one.vercel.app/mini-projects/${slug}"`,
      ),
    );
  }
  assert.match(home, /href="\/mini-projects\/minesweeper"/);
  assert.match(home, /href="\/mini-projects\/solitaire"/);
  assert.doesNotMatch(home, /href="\/mini-projects\/sudoku"/);
  assert.match(await html("mini-projects/solitaire"), /모두 풀리는 것은 아닙니다/);
});
