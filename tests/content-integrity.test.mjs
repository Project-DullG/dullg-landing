import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const captures = (text, pattern) => [...text.matchAll(pattern)].map((match) => match[1]);

test("keeps work records unique and every referenced image available", async () => {
  const works = await source("lib/works.ts");
  const slugs = captures(works, /slug: "([^"]+)"/g);
  const images = captures(works, /image: "(\/assets\/[^"]+)"/g);
  const externalUrls = captures(works, /externalUrl: "([^"]+)"/g);

  assert.ok(slugs.length > 0, "작품 데이터가 비어 있습니다.");
  assert.equal(new Set(slugs).size, slugs.length, "작품 주소가 중복됩니다.");
  assert.equal(images.length, slugs.length, "모든 작품에 대표 이미지가 필요합니다.");
  assert.equal(externalUrls.length, slugs.length, "모든 작품에 공식 출처가 필요합니다.");
  assert.ok(externalUrls.every((url) => url.startsWith("https://")), "외부 작품 링크는 HTTPS여야 합니다.");

  await Promise.all(images.map((image) => access(new URL(`../public${image}`, import.meta.url))));
});

test("keeps primary navigation destinations distinct", async () => {
  const navigation = await source("lib/navigation.ts");
  const primaryBlock = navigation.split("export const studioNavigation")[0];
  const hrefs = captures(primaryBlock, /\{ href: "([^"]+)", label:/g);

  assert.ok(hrefs.length > 0, "내비게이션이 비어 있습니다.");
  assert.equal(new Set(hrefs).size, hrefs.length, "서로 다른 메뉴가 같은 페이지를 가리킵니다.");
  assert.ok(hrefs.every((href) => href.startsWith("/")), "사이트 메뉴는 내부 경로여야 합니다.");
});

test("keeps public contact and business information valid", async () => {
  const config = await source("lib/site-config.ts");
  const email = captures(config, /email: "([^"]+)"/g)[0];
  const businessNumber = captures(config, /businessNumber: "([^"]+)"/g)[0];

  assert.match(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  assert.match(businessNumber, /^\d{3}-\d{2}-\d{5}$/);
});
