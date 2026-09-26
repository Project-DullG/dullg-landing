import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { byteRange } from "../lib/speaking/byte-range.ts";
import { questions, soundCards } from "../lib/speaking/catalog/speaking/content.ts";
import { emptyState } from "../lib/speaking/catalog/fishing/model.ts";
import { buildStudySnapshot } from "../lib/speaking/catalog/view.ts";
import catalog from "../lib/speaking/catalog/speaking/lesson-audio.json" with { type: "json" };

test("휴대전화 오디오의 일부·후반·끝 구간 요청을 처리하고 잘못된 범위는 거절한다", () => {
  assert.equal(byteRange(null, 1000), null);
  assert.deepEqual(byteRange("bytes=0-1", 1000), { start: 0, end: 1 });
  assert.deepEqual(byteRange("bytes=200-", 1000), { start: 200, end: 999 });
  assert.deepEqual(byteRange("bytes=-200", 1000), { start: 800, end: 999 });
  assert.deepEqual(byteRange("bytes=800-1500", 1000), { start: 800, end: 999 });
  for (const header of [
    "bytes=1000-",
    "bytes=40-30",
    "bytes=-0",
    "bytes=-",
    "bytes=1-2,3-4",
    "bad",
  ])
    assert.equal(byteRange(header, 1000), false, header);
});
test("승인된 제작 음성은 정확한 지문과 존재하는 비공개 파일에 연결된다", async () => {
  const clip = catalog.clips.find((c) => c.text === questions.find((q) => q.id === "R01").passage);
  assert.ok(clip?.reviewed);
  assert.equal(clip.kind, "ai");
  assert.match(clip.src, /^\/audio\/[\w-]+\.mp3$/);
  const file = await readFile(new URL(`../private-assets/speaking${clip.src}`, import.meta.url));
  assert.ok(file.length > 100000);
});

test("64문항의 본문·질문과 8개 발음 카드가 모두 제작 음성에 연결된다", () => {
  assert.equal(catalog.clips.length, 121);
  assert.equal(new Set(catalog.clips.map((clip) => clip.text)).size, 121);
  assert.equal(new Set(catalog.clips.map((clip) => clip.src)).size, 121);
  for (const q of questions) {
    const data = buildStudySnapshot(emptyState(), {
      course: "month",
      day: 0,
      minutes: 60,
      question: q.id,
    });
    assert.ok(data.audio.full, `${q.id}: 본문 음성`);
    assert.equal(data.audio.full.text, q.type === "read" ? q.passage : data.example);
    if (q.type !== "read") {
      assert.ok(data.audio.question, `${q.id}: 질문 음성`);
      assert.equal(data.audio.question.text, q.prompt);
    }
    assert.equal(data.soundCards.length, soundCards.length);
    for (const card of data.soundCards) {
      assert.ok(card.audio, `${card.id}: 발음 카드 음성`);
      assert.equal(card.audio.text, card.phrase);
    }
  }
});

test("배포하는 모든 음성은 내용 확인 시점의 파일과 해시가 같다", async () => {
  for (const clip of catalog.clips) {
    assert.ok(clip.ready && clip.contentChecked);
    assert.ok(clip.durationSeconds > 0 && clip.durationSeconds < 120);
    assert.match(clip.src, /^\/audio\/[\w-]+\.mp3$/);
    const bytes = await readFile(new URL(`../private-assets/speaking${clip.src}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), clip.sha256, clip.src);
  }
});
