import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("demo is reachable without login and clearly labels fictional records", async () => {
  const html = await readFile(new URL("../.next/server/app/demo.html", import.meta.url), "utf8");
  const login = await readFile(new URL("../.next/server/app/login.html", import.meta.url), "utf8");
  assert.match(login, /href="\/demo"/);
  assert.match(html, /가상 데이터 · 체험 모드/);
  assert.match(html, /서버에 저장되지 않으며/);
  assert.match(html, /체험 초기화/);
  assert.match(html, /예시 학생 6/);
  assert.match(html, /noindex/);
});

test("home and academy lead directly to the demo", async () => {
  for (const route of ["index", "academy"]) {
    const html = await readFile(new URL(`../.next/server/app/${route}.html`, import.meta.url), "utf8");
    assert.match(html, /href="\/demo"/);
    assert.match(html, /로그인 없이 체험하기/);
    assert.match(html, /class="dash-preview"/);
  }
});

test("demo remains isolated from persistence and authenticated actions", async () => {
  const source = await readFile(new URL("../app/demo/academy-demo.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /firebase|fetch\(|localStorage|sessionStorage|app\/actions/);
  assert.match(source, /min="0" max="100"/);
  assert.match(source, /Number.isInteger/);
  assert.match(source, /setStudents\(initialStudents\)/);
});
