import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { featuredGames } from "../lib/featured-games.ts";
import { getWorkRetailer, retailers, retailListings } from "../lib/work-retailers.ts";

test("retailer lookup resolves catalog data and rejects unknown or inherited keys", () => {
  for (const slug of ["unknown", "constructor", "__proto__"])
    assert.equal(getWorkRetailer(slug), undefined);
  for (const [slug, listing] of Object.entries(retailListings)) {
    const source = retailers[listing.retailerId];
    const resolved = getWorkRetailer(slug);
    assert.equal(resolved.seller, source.name);
    assert.equal(resolved.actionLabel, source.actionLabel);
    assert.equal(resolved.url, source.productBaseUrl + listing.productId);
    assert.match(listing.productId, /^\d+$/);
  }
});

test("featured game data retains local assets and locale-aware page links", async () => {
  for (const [id, game] of Object.entries(featuredGames)) {
    assert.ok(existsSync("public" + game.image.src));
    assert.ok(game.image.width > 0 && game.image.height > 0);
    assert.ok(game.paragraphs.every((lines) => lines.length && lines.every(Boolean)));
    for (const locale of ["", "en/"]) {
      const html = await readFile(`.test-output/pages/${locale}games/${id}.html`, "utf8");
      const expected =
        game.play.kind === "document" ? game.play.href : `/${locale}${game.play.href.slice(1)}`;
      assert.ok(html.includes(`href="${expected}"`));
      if (game.play.kind === "document") assert.ok(existsSync("public" + game.play.href));
    }
  }
});
