import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { runInNewContext } from "node:vm";

test("Last Screening keeps its ordered modules and locally hosted media", () => {
  const base = "public/assets/last-screening/";
  const html = readFileSync(base + "index.html", "utf8");
  const manifest = JSON.parse(readFileSync(base + "provenance.json", "utf8"));
  assert.equal(manifest.version, "0.10.0");
  assert.ok(statSync(base + "index.html").size < 20000);
  assert.match(html, /href="\/games\/last-screening"/);
  assert.doesNotMatch(html, /base64,/);
  let previous = -1;
  for (const name of manifest.modules) {
    assert.ok(existsSync(base + name + ".js"));
    const index = html.indexOf(`src="./${name}.js"`);
    assert.ok(index > previous, name);
    previous = index;
  }
  const context = { window: {} };
  runInNewContext(readFileSync(base + "assets.js", "utf8"), context);
  assert.equal(Object.keys(context.window.ASSETS).length, manifest.assetCount);
  for (const asset of Object.values(context.window.ASSETS)) {
    assert.match(asset, /^\.\/media\/[a-z0-9_]+\.(webp|mp3|ogg)$/);
    assert.ok(existsSync(base + asset));
  }
});
