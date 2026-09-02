import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeHtml = (route) =>
  new URL(`../.next/server/app/${route}`, import.meta.url);

test("renders the brand portfolio path with real work and education evidence", async () => {
  const html = await readFile(routeHtml("index.html"), "utf8");

  assert.match(html, /이야기를 만들고/);
  assert.match(html, /단서를 엮습니다/);
  assert.match(html, /공개한 머더미스터리/);
  assert.match(html, /영어 단서를 읽고/);
  assert.match(html, /함께 사건을 해결합니다/);
  assert.match(html, /href="\/works"/);
  assert.match(html, /href="\/academy"/);
  assert.match(html, /\/assets\/works\/slime-soda-cover\.webp/);
  assert.match(html, /\/assets\/dullg\/mat-game-cards\.webp/);
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

  assert.match(academy, /제품 한눈에 보기/);
  assert.match(academy, /한눈에 보는 4차시 수업팩/);
  assert.match(academy, /href="\/academy\/curriculum"/);
  assert.match(academy, /href="\/academy\/sample"/);
  assert.match(academy, /href="\/academy\/pilot"/);
  assert.match(curriculum, /판단을 남기는 네 장면/);
  assert.match(sample, /수업용 시제품/);
  assert.match(pilot, /파일럿/);
  assert.match(activity, /현재 공개 가능한 자료/);
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
  const [privacy, sitemapPage, sitemap, robots, layout, form, footer] = await Promise.all([
    readFile(routeHtml("privacy.html"), "utf8"),
    readFile(routeHtml("sitemap.html"), "utf8"),
    readFile(routeHtml("sitemap.xml.body"), "utf8"),
    readFile(routeHtml("robots.txt.body"), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/form-section.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(privacy, /개인정보를 필요한 만큼만 받고/);
  assert.match(privacy, /FormSubmit/);
  assert.match(sitemapPage, /필요한 내용을/);
  assert.match(sitemapPage, /전체 페이지/);
  assert.match(sitemapPage, /처음 방문하셨다면/);
  assert.match(sitemap, /\/privacy/);
  assert.match(sitemap, /\/sitemap/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(layout, /metadataBase/);
  assert.match(form, /href="\/privacy"/);
  assert.match(form, /aria-invalid/);
  assert.match(footer, /href="\/sitemap"/);
  assert.doesNotMatch(footer, /href="\/sitemap\.xml"/);
});
