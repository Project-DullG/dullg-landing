import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BRAND, emailHref } from "../lib/site-config.ts";
import { primaryNavigation, studioNavigation } from "../lib/navigation.ts";
import { didimterResidency, riseAward } from "../lib/recognition.ts";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const html = (path) => source(`.test-output/pages/${path}.html`);
const visibleDocument = (page) =>
  page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

test("the current brand is Twisdom with its supplied name and meaning", () => {
  assert.equal(BRAND.name, "트위즈덤");
  assert.equal(BRAND.englishName, "Twisdom");
  assert.equal(BRAND.fullName, "트위즈덤(Twisdom)");
  assert.equal(BRAND.meaning, "Twist + Wisdom");
  assert.match(BRAND.description, /반전/);
  assert.match(BRAND.description, /게임/);
  assert.match(BRAND.description, /교육/);
});

test("renaming the brand does not change contact details, hosting, or historical registrations", async () => {
  assert.equal(BRAND.email, "cluedullg@gmail.com");
  assert.equal(emailHref, "mailto:cluedullg@gmail.com");
  assert.equal(BRAND.businessNumber, "689-12-03138");
  assert.match(await source("lib/site.ts"), /https:\/\/dullg-landing-one\.vercel\.app/);
  assert.equal(didimterResidency.registeredName, "Project DullG");
  assert.equal(riseAward.team, "Project DullG");
  assert.equal(didimterResidency.source, "https://www.didimter.or.kr/bbs/board.php?bo_table=company");
  assert.equal(riseAward.source, "https://www.handong.edu/kor/square/inform/news/?id=50859&mode=view");
});

test("navigation names describe destinations under the new brand", () => {
  assert.equal(primaryNavigation.find((item) => item.href === "/studio")?.label, "작품·활동");
  for (const navigation of [primaryNavigation, studioNavigation]) {
    assert.equal(navigation.find((item) => item.href === "/about")?.label, "브랜드 소개");
    assert.ok(navigation.every((item) => !/공방 소개|공방 둘러보기|공방 게임/.test(item.label)));
  }
});

test("Korean and English page chrome and discovery metadata use the current brand", async () => {
  for (const prefix of ["", "en/"]) {
    const name = prefix ? "Twisdom" : "트위즈덤";
    for (const route of ["index", "studio", "about", "works", "academy", "mini-projects", "contact", "privacy"]) {
      const page = visibleDocument(await html(`${prefix}${route}`));
      const header = page.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0];
      const footer = page.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0];
      const title = page.match(/<title>([^<]+)<\/title>/)?.[1];
      const siteName = page.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i)?.[1];
      const context = `${prefix}${route}`;
      assert.ok(header, `${context}: missing header`);
      assert.ok(footer, `${context}: missing footer`);
      assert.ok(title?.includes(name), `${context}: title ${title}`);
      assert.equal(siteName, name, `${context}: og:site_name`);
      assert.ok(header.includes(name), `${context}: header identity`);
      assert.ok(footer.includes(name), `${context}: footer identity`);
      assert.doesNotMatch(header, /단서공방|Project\s?DullG|공방 소개|공방 둘러보기|공방 게임/, context);
      assert.doesNotMatch(footer, /단서공방|Project\s?DullG|공방 소개|공방 둘러보기|공방 게임/, context);
      assert.doesNotMatch(title, /단서공방|Project\s?DullG/, context);
      assert.match(footer, /mailto:cluedullg@gmail\.com/, `${context}: contact link`);
    }
  }
});

test("the about page explains the new name without rewriting the team's history", async () => {
  const about = visibleDocument(await html("about"));
  assert.match(about, /Twist\s*\+\s*Wisdom/);
  assert.match(about, /트위즈덤/);
  assert.match(about, /반전/);
  assert.match(about, /게임/);
  assert.match(about, /교육/);
  assert.match(about, /Project\s?DullG/);
  assert.match(about, /단서공방/);
  assert.match(about, /2025 RISE 창업경진대회 인기상/);
  const footer = visibleDocument(await html("index")).match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0];
  assert.match(footer, /웹게임/);
});
