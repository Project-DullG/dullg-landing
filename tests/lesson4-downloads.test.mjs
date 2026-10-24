import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { lesson4 } from "../lib/lesson4.ts";

test("session 4 serves the unmodified murder mystery co-creation prompt", async () => {
  assert.equal(
    lesson4.murderMysteryPrompt,
    "/assets/materials/ulleung-high-lesson-4/murder-mystery-co-creation-v1-1.md",
  );
  const file = await readFile(new URL(`../public${lesson4.murderMysteryPrompt}`, import.meta.url));
  assert.equal(
    createHash("sha256").update(file).digest("hex"),
    "a3edda7130a3546641698e9b0d3486ebede076fe0bdeb60f2da9a7676a48c6f1",
    "The published Markdown must match the supplied v1.1 original byte for byte",
  );
  assert.match(file.toString("utf8"), /^# 머더미스터리 함께 만들기\n/);
});

test("session 4 exposes a downloadable Markdown link with Korean and English labels", async () => {
  const page = await readFile(
    new URL("../app/materials/ulleung-high-lesson-4/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /<a href=\{lesson4\.murderMysteryPrompt\} download>/);
  assert.ok(page.includes("머더미스터리 함께 만들기 프롬프트 (MD) ↓"));
  assert.ok(page.includes("Download murder mystery co-creation prompt (MD, Korean) ↓"));
  assert.match(page, /const en = useLocale\(\) === "en"/);
});

test("session 4 serves the unmodified board and mystery game creation prompt", async () => {
  assert.equal(
    lesson4.boardAndMysteryGamePrompt,
    "/assets/materials/ulleung-high-lesson-4/board-and-mystery-game-creation-prompt.md",
  );
  const file = await readFile(new URL(`../public${lesson4.boardAndMysteryGamePrompt}`, import.meta.url));
  assert.equal(
    createHash("sha256").update(file).digest("hex"),
    "a9379f0f856b37391e6017e725f245902bdfc7b3d23c748d2aacc6fe1e02f5c8",
    "The published Markdown must match the supplied v1.0 original byte for byte",
  );
  assert.match(file.toString("utf8"), /^# AI와 함께 만드는 보드게임·추리게임\n/);
});

test("session 4 exposes the board and mystery game prompt download in both languages", async () => {
  const page = await readFile(
    new URL("../app/materials/ulleung-high-lesson-4/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /<a href=\{lesson4\.boardAndMysteryGamePrompt\} download>/);
  assert.ok(page.includes("보드게임·추리게임 통합 제작 프롬프트 (MD) ↓"));
  assert.ok(page.includes("Download board and mystery game creation prompt (MD, Korean) ↓"));
});

test("session 4 retains its existing PDF and editable PPT downloads", async () => {
  for (const href of [lesson4.pdf, lesson4.pptx]) {
    assert.ok((await stat(new URL(`../public${href}`, import.meta.url))).size > 1_000_000);
  }
  const page = await readFile(
    new URL("../app/materials/ulleung-high-lesson-4/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /<a href=\{`\$\{lesson4\.pdf\}\?v=\$\{lesson4\.version\}`\} download>/);
  assert.match(page, /<a href=\{`\$\{lesson4\.pptx\}\?v=\$\{lesson4\.version\}`\} download>/);
});

test("session 4 download links wrap within narrow mobile screens", async () => {
  const css = await readFile(
    new URL("../app/materials/ulleung-high-lesson-4/page.module.css", import.meta.url),
    "utf8",
  );
  const container = css.match(/\.downloads\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(container, /min-width:\s*0\s*;/);
  assert.match(container, /max-width:\s*100%\s*;/);
  assert.match(container, /flex-wrap:\s*wrap\s*;/);
  const links = css.match(/\.downloads\s+a\[download\]\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(links, /max-width:\s*100%\s*;/);
  assert.match(links, /min-width:\s*0\s*;/);
  assert.match(links, /flex-shrink:\s*1\s*;/);
  assert.match(links, /white-space:\s*normal\s*;/);
  assert.match(links, /overflow-wrap:\s*anywhere\s*;/);
});
