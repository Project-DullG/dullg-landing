import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeHtml = (route) =>
  new URL(`../.next/server/app/${route}`, import.meta.url);

test("renders the home conversion path with real product evidence", async () => {
  const html = await readFile(routeHtml("index.html"), "utf8");

  assert.match(html, /영어로 단서를 읽고/);
  assert.match(html, /함께 푸는 미스터리 수업/);
  assert.match(html, /무료 샘플 받아보기/);
  assert.match(html, /4차시 수업 흐름/);
  assert.match(html, /제작한 시제품을 보여드립니다/);
  assert.match(html, /파일럿보다 먼저/);
  assert.match(html, /\/assets\/dullg\/mat-game-cards\.png/);
  assert.match(html, /\/assets\/dullg\/mat-workbook\.png/);
  assert.match(html, /id="apply"/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("renders detailed product routes with working navigation targets", async () => {
  const [academy, curriculum, sample, pilot, activity] = await Promise.all([
    readFile(routeHtml("academy.html"), "utf8"),
    readFile(routeHtml("academy/curriculum.html"), "utf8"),
    readFile(routeHtml("academy/sample.html"), "utf8"),
    readFile(routeHtml("academy/pilot.html"), "utf8"),
    readFile(routeHtml("activity.html"), "utf8"),
  ]);

  assert.match(academy, /DULLG PRODUCT OVERVIEW/);
  assert.match(academy, /한눈에 보는 4차시 수업팩/);
  assert.match(academy, /href="\/academy\/curriculum"/);
  assert.match(academy, /href="\/academy\/sample"/);
  assert.match(academy, /href="\/academy\/pilot"/);
  assert.match(curriculum, /4차시 커리큘럼/);
  assert.match(sample, /수업용 시제품/);
  assert.match(pilot, /파일럿/);
  assert.match(activity, /현장 기록을 준비하고 있습니다/);
  assert.match(activity, /영어학원용 수업 제품으로 검토 중인 시제품/);
  assert.match(activity, /사실과 계획을 섞지 않습니다/);
});

test("keeps core navigation and interactions accessible", async () => {
  const [header, explorer, layout, css] = await Promise.all([
    readFile(new URL("../components/header.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../components/curriculum-explorer.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /본문으로 바로가기/);
  assert.match(header, /aria-expanded=\{isOpen\}/);
  assert.match(header, /aria-controls="mobile-navigation"/);
  assert.match(explorer, /role="tablist"/);
  assert.match(explorer, /aria-selected=\{isActive\}/);
  assert.match(explorer, /tabIndex=\{isActive \? 0 : -1\}/);
  assert.match(explorer, /ArrowRight/);
  assert.match(explorer, /ArrowLeft/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("publishes privacy guidance and deployment-aware discovery metadata", async () => {
  const [privacy, sitemap, robots, layout, form] = await Promise.all([
    readFile(routeHtml("privacy.html"), "utf8"),
    readFile(routeHtml("sitemap.xml.body"), "utf8"),
    readFile(routeHtml("robots.txt.body"), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/form-section.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(privacy, /개인정보를 필요한 만큼만 받고/);
  assert.match(privacy, /FormSubmit/);
  assert.match(sitemap, /\/privacy/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(layout, /metadataBase/);
  assert.match(form, /href="\/privacy"/);
  assert.match(form, /aria-invalid/);
});
