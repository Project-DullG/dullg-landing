import assert from "node:assert/strict";
import test from "node:test";
import { getFundingStatus, fundingProjects, formatFundingSummary } from "../lib/funding.ts";
import { isUpcoming, activityRecords } from "../lib/activities.ts";
import { publicRoutes } from "../lib/routes.ts";
import { episodeFullTitle, episodeTitle, episodeSubtitle } from "../lib/education.ts";
import { getWorkStatus, works } from "../lib/works.ts";

test("funding status is derived from endsOn", () => {
  const dg2 = fundingProjects.find((p) => p.id === "projectdg2");
  assert.equal(getFundingStatus(dg2, new Date("2026-09-10")), "진행 중");
  assert.equal(getFundingStatus(dg2, new Date("2026-09-12")), "종료");
  assert.match(formatFundingSummary(fundingProjects[1]), /2026\.03\.16–04\.20 · 19,296,000원 · 193명 · 1,929%/);
});

test("works flagged 펀딩 중 only while the campaign runs", () => {
  const slime = works.find((w) => w.slug === "slime-soda");
  assert.equal(getWorkStatus(slime, new Date("2026-09-10")), "펀딩 중");
  assert.equal(getWorkStatus(slime, new Date("2026-09-12")), "출시");
});

test("activities distinguish upcoming records", () => {
  const ulleung = activityRecords.find((r) => r.title === "울릉고 리빙랩 특강");
  assert.equal(isUpcoming(ulleung, new Date("2026-09-03")), true);
  assert.equal(isUpcoming(ulleung, new Date("2026-09-06")), false);
  assert.ok(activityRecords.every((r) => /^\d{4}-\d{2}-\d{2}(\/\d{4}-\d{2}-\d{2})?$/.test(r.date)), "dates must be ISO");
});

test("public routes are unique and cover the app tree", () => {
  const paths = publicRoutes.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of ["/", "/academy", "/academy/curriculum", "/academy/sample", "/academy/pilot", "/episode", "/works", "/materials", "/materials/ulleung-high-living-lab", "/about", "/activity", "/activity/ulleung-high-living-lab", "/contact", "/privacy", "/sitemap"]) {
    assert.ok(paths.includes(p), `missing ${p}`);
  }
});

test("episode title constants", () => {
  assert.equal(episodeTitle, "8시까지 두 열쇠");
  assert.equal(episodeSubtitle, "보충반의 사라진 열쇠");
  assert.equal(episodeFullTitle, "8시까지 두 열쇠 — 보충반의 사라진 열쇠");
});

test("navigation hrefs exist in publicRoutes", async () => {
  const { primaryNavigation, studioNavigation } = await import("../lib/navigation.ts");
  const paths = publicRoutes.map((r) => r.path);
  for (const n of [...primaryNavigation, ...studioNavigation]) assert.ok(paths.includes(n.href), n.href);
});
