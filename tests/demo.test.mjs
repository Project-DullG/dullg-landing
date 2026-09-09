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
    const html = await readFile(
      new URL(`../.next/server/app/${route}.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /href="\/demo"/);
    if (route === "index") {
      assert.match(html, /학원 관리 체험/);
      assert.match(html, /가상 학생 데이터로/);
      assert.doesNotMatch(html, /class="dash-preview"/);
    } else {
      assert.match(html, /학원 관리 체험/);
      assert.match(html, /가상 학생 데이터를 사용합니다/);
      assert.match(html, /class="dash-preview"/);
    }
  }
});

test("demo remains isolated from persistence and authenticated actions", async () => {
  const source = await readFile(new URL("../app/demo/academy-demo.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /firebase|fetch\(|localStorage|sessionStorage|app\/actions/);
  assert.match(source, /min="0"\s+max="100"/);
  assert.match(source, /Number.isInteger/);
  assert.match(source, /setStudents\(initialStudents\)/);
});

test("demo uses the same student workspace as the authenticated page", async () => {
  const [demo, live, workspace, html] = await Promise.all([
    readFile(new URL("../app/demo/academy-demo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/students/live-students.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/dashboard/student-workspace.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.next/server/app/demo.html", import.meta.url), "utf8"),
  ]);
  for (const source of [demo, live]) assert.match(source, /StudentWorkspace/);
  assert.doesNotMatch(workspace, /firebase|fetch\(|app\/actions/);
  assert.match(workspace, /삭제 확인/);
  assert.match(workspace, /validateStudent/);
  assert.match(html, /차시별 성적/);
  assert.match(html, /미입력/);
});
