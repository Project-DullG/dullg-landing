import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("retired Discharge Day retains recoverable local assets", () => {
  const base = "archive/retired-games/discharge-day/";
  const html = readFileSync(base + "index.html", "utf8");
  assert.match(html, /href="\/games\/discharge-day"/);
  assert.match(html, /noindex/);
  for (const name of ["app.js", "logic.js", "data.js", "style.css", "layout.css"])
    assert.ok(existsSync(base + name), name);
  const data = readFileSync(base + "data.js", "utf8");
  assert.doesNotMatch(data, /data:image/);
  const images = [...data.matchAll(/\.\/art\/([a-z0-9_-]+\.webp)/g)];
  assert.ok(images.length > 10);
  for (const [, file] of images) assert.ok(existsSync(base + "art/" + file), file);
});

test("retired games are absent from published lists, routes and static assets", () => {
  const page = readFileSync("app/mini-projects/page.tsx", "utf8");
  assert.doesNotMatch(page, /DischargeFeature|TideFeature/);
  const feature = readFileSync("lib/featured-games.ts", "utf8");
  assert.doesNotMatch(feature, /discharge-day|tide-room/);
  const routes = readFileSync("lib/routes.ts", "utf8");
  assert.doesNotMatch(routes, /discharge-day|tide-room/);
  for (const file of ["app/games/discharge-day/page.tsx", "app/games/tide-room/page.tsx", "app/play/tide-room/page.tsx", "public/assets/discharge-day", "public/assets/tide-room"])
    assert.ok(!existsSync(file), file);
});
