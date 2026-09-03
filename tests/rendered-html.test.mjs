import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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
  assert.match(html, /\/assets\/dullg\/card-cover-1\.png/);
  assert.match(html, /id="apply"/);
  assert.match(html, /href="\/academy#tools"/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("renders detailed product routes with working navigation targets", async () => {
  const [academy, curriculum, sample, pilot, activity, activityCase, materials, workDetail] = await Promise.all([
    readFile(routeHtml("academy.html"), "utf8"),
    readFile(routeHtml("academy/curriculum.html"), "utf8"),
    readFile(routeHtml("academy/sample.html"), "utf8"),
    readFile(routeHtml("academy/pilot.html"), "utf8"),
    readFile(routeHtml("activity.html"), "utf8"),
    readFile(routeHtml("activity/ulleung-high-living-lab.html"), "utf8"),
    readFile(routeHtml("materials.html"), "utf8"),
    readFile(routeHtml("works/snake-carnival.html"), "utf8"),
  ]);

  assert.match(academy, /영어 미스터리 수업팩/);
  assert.match(academy, /영어 단서를 읽고/);
  assert.match(academy, /href="\/academy\/curriculum"/);
  assert.match(academy, /href="\/academy\/sample"/);
  assert.match(academy, /href="\/academy\/pilot"/);
  assert.match(academy, /id="tools"/);
  assert.match(academy, /학원 운영까지 함께 정리합니다/);
  assert.match(academy, /class="dash-preview"/);
  assert.match(academy, /href="\/login"/);
  assert.match(curriculum, /판단을 남기는 네 장면/);
  assert.match(sample, /수업용 시제품/);
  assert.match(pilot, /파일럿/);
  assert.match(activity, /제작·활동 기록/);
  assert.match(activity, /울릉고 리빙랩 특강/);
  assert.match(activity, /href="\/activity\/ulleung-high-living-lab"/);
  assert.match(activity, /확인된 내용만 공개합니다/);
  assert.match(activityCase, /2026년 9월 5일/);
  assert.match(activityCase, /울릉군 생태관광 AI 교육과 별개의 수업 자료/);
  assert.match(activityCase, /ulleung-high-living-lab-2026\.pdf/);
  assert.match(materials, /울릉고 리빙랩 특강/);
  assert.match(materials, /2026년 9월 5일/);
  assert.match(materials, /울릉군 생태관광 AI 교육/);
  assert.match(materials, /2026년 4월 18일/);
  assert.match(materials, /href="\/materials\/ulleung-high-living-lab"/);
  assert.match(workDetail, /뱀이 죽은 축제/);
  assert.match(workDetail, /4인/);
  assert.match(workDetail, /120분/);
  assert.match(workDetail, /텀블벅 프로젝트.*보기/);
});

test("keeps core navigation and interactions accessible", async () => {
  const cssFiles = (await readdir(new URL("../styles/", import.meta.url), { recursive: true }))
    .filter((f) => f.endsWith(".css"));
  const [header, layout, css] = await Promise.all([
    readFile(new URL("../components/header.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    Promise.all(cssFiles.map((f) => readFile(new URL(`../styles/${f}`, import.meta.url), "utf8"))).then((parts) =>
      parts.join("\n"),
    ),
  ]);

  assert.match(layout, /본문으로 바로가기/);
  assert.match(header, /aria-expanded=\{isOpen\}/);
  assert.match(header, /aria-controls="mobile-navigation"/);
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
  assert.match(sitemap, /\/works\/snake-carnival/);
  assert.match(sitemap, /\/activity\/ulleung-high-living-lab/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(layout, /metadataBase/);
  assert.match(form, /href="\/privacy"/);
  assert.match(form, /aria-invalid/);
  assert.match(footer, /href="\/sitemap"/);
  assert.doesNotMatch(footer, /href="\/sitemap\.xml"/);
});

test("every public page has a unique templated title and its own canonical", async () => {
  const routes = [
    "academy",
    "academy/curriculum",
    "academy/sample",
    "academy/pilot",
    "episode",
    "works",
    "about",
    "contact",
    "activity",
    "materials",
    "privacy",
    "sitemap",
  ];
  const titles = new Set();
  for (const r of routes) {
    const html = await readFile(routeHtml(`${r}.html`), "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title?.endsWith(" | 단서공방"), `${r}: ${title}`);
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    titles.add(title);
    assert.match(
      html,
      new RegExp(`rel="canonical" href="[^"]*/${r.replace("/", "\\/")}"`),
      `${r} canonical`,
    );
    assert.doesNotMatch(html, /(?<!Project)DullG/, `${r} uses DullG standalone`);
    assert.match(html, /property="og:image"/, `${r} og:image`);
  }
});
