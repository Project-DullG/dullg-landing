import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = (route) =>
  readFile(new URL(`../.test-output/pages/${route}.html`, import.meta.url), "utf8");

test("directory pages use one compact heading before their content", async () => {
  for (const route of ["works", "mini-projects", "activity", "materials", "about", "contact"]) {
    const page = await html(route);
    assert.equal((page.match(/<h1\b/g) || []).length, 1, route);
    assert.match(page, /<h1 id="page-title">/);
  }
});

test("about retains real team history and process without repeating full portfolios", async () => {
  const page = await html("about");
  for (const value of [
    'id="team-history"',
    'id="process"',
    "didimter.or.kr",
    "2025 RISE",
    "정식 출시 전",
  ])
    assert.ok(page.includes(value), value);
  assert.doesNotMatch(page, /class="about-scope|class="about-beliefs|class="about-now-dark/);
  for (const href of ["/works", "/activity", "/academy"])
    assert.ok(page.includes(`href="${href}"`));
});

test("academy explains pilot status before its materials and keeps working tools", async () => {
  const page = await html("academy");
  assert.ok(page.indexOf("파일럿 준비 중") < page.indexOf('id="academy-details-title"'));
  assert.match(page, /현재 공개한 자료는 수업용 시제품/);
  assert.match(page, /id="tools"/);
  assert.match(page, /class="dash-preview"/);
  assert.match(page, /href="\/demo"/);
  assert.match(page, /href="\/login"/);
  assert.doesNotMatch(page, /href="#tools"|academy-overview-pilot/);
});

test("footer groups destinations without duplicate links and desktop nav omits redundant home", async () => {
  const page = await html("index");
  const nav = page.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(nav);
  assert.doesNotMatch(nav, /href="\/"/);
  assert.match(nav, /공방 소개/);
  const footer = page.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1];
  assert.ok(footer);
  const hrefs = [...footer.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(hrefs.length, new Set(hrefs).size);
  for (const href of [
    "/works",
    "/mini-projects",
    "/activity",
    "/academy",
    "/materials",
    "/about",
    "/contact",
    "/login",
  ])
    assert.ok(hrefs.includes(href), href);
});

test("ecotourism resources have one primary material link", async () => {
  const page = await html("materials/ulleung-ecotourism-ai");
  assert.equal(
    (page.match(/href="https:\/\/kanghoon1204.github.io\/ulleung-ecotourism-edu\/"/g) || []).length,
    1,
  );
  assert.match(page, /href="\/activity\/ulleung-ecotourism-ai"/);
});

test("menu button and expanded menu share the same responsive breakpoint", async () => {
  const source = await readFile(new URL("../styles/site.css", import.meta.url), "utf8");
  const header = await readFile(new URL("../components/header.tsx", import.meta.url), "utf8");
  assert.match(source, /@media\s*\(max-width: 1200px\)/);
  assert.match(source, /\.mobile-navigation\.is-open/);
  assert.match(header, /max-width: 1200px/);
  assert.match(header, /!compact.matches/);
  assert.match(header, /inert=\{!isOpen\}/);
  assert.match(header, /e.key === "Tab"/);
});
