import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { miniProjects } from "../lib/mini-projects.ts";

test("English portfolio keeps English routes, canonical URLs and source-language notices", async () => {
  for (const path of [
    "index",
    "works",
    "mini-projects",
    "about",
    "materials",
    "academy",
    "contact",
  ]) {
    const html = await readFile(
      new URL(`../.test-output/pages/en/${path}.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /<html lang="en"/);
    assert.match(html, /hrefLang="en"[^>]*href="https:\/\/dullg-landing-one.vercel.app\/en/i);
    assert.match(html, /rel="canonical" href="https:\/\/dullg-landing-one.vercel.app\/en/);
    assert.match(html, /href="\/en\/works"/);
    assert.match(html, /href="\/en\/materials"/);
  }
  const materials = await readFile(
    new URL("../.test-output/pages/en/materials/ulleung-high-living-lab.html", import.meta.url),
    "utf8",
  );
  assert.match(materials, /original slides, images, and downloadable files are in Korean/);
});

test("all twelve mini projects have English instructions and game controls", async () => {
  assert.equal(miniProjects.length, 12);
  for (const project of miniProjects) {
    const html = await readFile(
      new URL(`../.test-output/pages/en/mini-projects/${project.slug}.html`, import.meta.url),
      "utf8",
    );
    assert.match(html, /<html lang="en"/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.match(html, /href="\/en\/mini-projects"/);
    assert.match(html, /<button/);
  }
});
