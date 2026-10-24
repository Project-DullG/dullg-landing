import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const retired = [
  "videos/two-keys-trailer-v8.mp4",
  "videos/two-keys-trailer-v8-poster.webp",
  "videos/two-keys-trailer-v8.ko.vtt",
  "academy-remake/rulebook.mp4",
  "academy-remake/rulebook-poster.webp",
  "academy-remake/synopsis.mp4",
  "academy-remake/synopsis-poster.webp",
];

test("replaced media files are no longer publicly served", async () => {
  for (const file of retired) {
    await assert.rejects(access(`public/assets/${file}`), { code: "ENOENT" });
  }
});

test("current course videos and posters remain available in both languages", async () => {
  for (const name of ["intro", "rulebook", "synopsis"]) {
    await access(`public/assets/going-home-20261006/${name}.mp4`);
    await access(`public/assets/going-home-20261006/${name}-poster.webp`);
  }
  for (const prefix of ["", "en/"]) {
    const episode = await readFile(`.test-output/pages/${prefix}episode.html`, "utf8");
    const academy = await readFile(`.test-output/pages/${prefix}academy.html`, "utf8");
    assert.ok(episode.includes("/assets/going-home-20261006/intro.mp4"));
    for (const name of ["intro", "rulebook", "synopsis"]) {
      assert.ok(academy.includes(`/assets/going-home-20261006/${name}.mp4`));
    }
    for (const file of retired) {
      assert.ok(!episode.includes(`/assets/${file}`));
      assert.ok(!academy.includes(`/assets/${file}`));
    }
  }
});
