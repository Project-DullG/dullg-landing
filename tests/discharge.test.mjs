import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("Discharge Day ships local assets and a return link", () => {
  const base = "public/assets/discharge-day/";
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

test("Discharge Day is listed separately from Tide Room", () => {
  const page = readFileSync("app/mini-projects/page.tsx", "utf8");
  assert.match(page, /<DischargeFeature/);
  assert.match(page, /<TideFeature/);
  const feature = readFileSync("lib/featured-games.ts", "utf8");
  assert.match(feature, /\/games\/discharge-day/);
  assert.match(feature, /\/assets\/discharge-day\/index.html/);
});
