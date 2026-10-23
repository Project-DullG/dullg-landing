import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const visibleDocument = (page) =>
  page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

test("the approved folded-W identity has shared vector components", async () => {
  const component = await read("components/brand-mark.tsx");
  assert.match(component, /export function BrandMark\b/);
  assert.match(component, /export function BrandWordmark\b/);
  assert.match(component, /brand-artwork\.json/);
  assert.match(component, /brand-wordmark/);
  assert.match(component, /aria-hidden="true"/);
  assert.doesNotMatch(component, /M23 7C33 7 41 14 41 24/);
  assert.doesNotMatch(component, /<image\b|<text\b|<foreignObject\b/);
});

test("current brand touchpoints reuse the wordmark without old decorative bars", async () => {
  for (const path of [
    "components/header.tsx",
    "components/site.tsx",
    "components/speaking/study-app.tsx",
    "app/login/login-form.tsx",
    "app/opengraph-image.tsx",
  ]) {
    const source = await read(path);
    assert.match(source, /<BrandWordmark\b/, path);
  }
  assert.doesNotMatch(await read("components/speaking/study-app.tsx"), /<span className="brand-mark"/);
  assert.doesNotMatch(await read("styles/site.css"), /\.brand-mark\s+i(?:\s|:|\{)/);
});

test("public Twisdom logo originals are outlined SVGs with no font or raster dependencies", async () => {
  const directory = new URL("../public/assets/brand/", import.meta.url);
  const names = (await readdir(directory)).filter((name) => /^twisdom-.*\.svg$/.test(name));
  assert.ok(names.length >= 6, "wordmark, symbol and bilingual black/white originals must be available");
  for (const name of names) {
    const svg = await readFile(new URL(name, directory), "utf8");
    assert.match(svg, /<svg\b/, name);
    assert.match(svg, /viewBox="[\d. -]+"/, name);
    assert.match(svg, /<path\b/, name);
    assert.doesNotMatch(svg, /<image\b|<text\b|<foreignObject\b|@font-face|data:image|(?:href|src)="https?:/i, name);
    assert.ok(Buffer.byteLength(svg) < 100_000, `${name}: keep logo vectors lightweight`);
  }
});

test("downloadable marks and the favicon use the same master outline paths", async () => {
  const artwork = JSON.parse(await read("lib/brand-artwork.json"));
  for (const name of ["symbol", "wordmark"]) {
    const shape = artwork[name];
    assert.ok(shape.width > 0 && shape.height > 0, `${name}: dimensions`);
    assert.ok(shape.paths.length > 0, `${name}: outlined artwork`);
    assert.equal(shape.viewBox, `0 0 ${shape.width} ${shape.height}`);
    for (const variant of ["black", "white"]) {
      const svg = await read(`public/assets/brand/twisdom-${name}-${variant}.svg`);
      for (const path of shape.paths) assert.ok(svg.includes(path.d), `${name}-${variant}: master path`);
    }
  }
  const icon = await read("app/icon.svg");
  const exportedIcon = await read("public/assets/brand/twisdom-app-icon.svg");
  for (const path of artwork.symbol.paths) {
    assert.ok(icon.includes(path.d), "site favicon: approved W silhouette");
    assert.ok(exportedIcon.includes(path.d), "exported app icon: approved W silhouette");
  }
  assert.doesNotMatch(icon, /M23 7C33 7 41 14 41 24|#c96645/);
});

test("black and white PNG logos have real transparency and Apple icon has the correct size", async () => {
  for (const name of ["symbol", "wordmark", "lockup-ko"]) {
    for (const variant of ["black", "white"]) {
      const path = new URL(`../public/assets/brand/twisdom-${name}-${variant}.png`, import.meta.url);
      const image = sharp(await readFile(path));
      const metadata = await image.metadata();
      assert.ok(metadata.hasAlpha, `${name}-${variant}: transparent PNG`);
      const stats = await image.stats();
      const alpha = stats.channels.at(-1);
      assert.equal(alpha.min, 0, `${name}-${variant}: includes clear background`);
      assert.equal(alpha.max, 255, `${name}-${variant}: includes opaque artwork`);
    }
  }
  const apple = await sharp(await readFile(new URL("../app/apple-icon.png", import.meta.url))).metadata();
  assert.equal(apple.width, 180);
  assert.equal(apple.height, 180);
});

test("Korean and English home links have one wordmark and an explicit accessible name", async () => {
  for (const prefix of ["", "en/"]) {
    for (const route of ["index", "about", "studio"]) {
      const page = visibleDocument(await read(`.test-output/pages/${prefix}${route}.html`));
      for (const region of ["header", "footer"]) {
        const fragment = page.match(new RegExp(`<${region}\\b[^>]*>[\\s\\S]*?<\\/${region}>`))?.[0];
        assert.ok(fragment, `${prefix}${route}: ${region}`);
        const brandLink = fragment.match(/<a\b[^>]*class="brand(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/a>/)?.[0];
        assert.ok(brandLink, `${prefix}${route}: ${region} brand home link`);
        assert.match(brandLink, /aria-label="(?:트위즈덤|twisdom)[^"]*"/i);
        assert.match(brandLink, /aria-hidden="true"/);
        assert.equal((brandLink.match(/class="[^"]*\bbrand-wordmark\b[^"]*"/g) || []).length, 1);
        assert.doesNotMatch(brandLink, /<small\b|class="brand-name"/);
      }
    }
  }
});

test("social sharing uses both approved logo components", async () => {
  const source = await read("app/opengraph-image.tsx");
  assert.match(source, /<BrandMark\b/);
  assert.match(source, /<BrandWordmark\b/);
  assert.match(source, /width:\s*1200/);
  assert.match(source, /height:\s*630/);
});
