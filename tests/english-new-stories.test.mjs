import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { newEnglishEpisodes, newEnglishStoryTranslations } from "../lib/english/new-episodes.ts";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  englishAnswerAccepted,
} from "../lib/english/progress.ts";

const now = new Date("2026-10-14T09:00:00Z");
const levels = ["starter", "standard", "challenge"];
const byId = (id) => newEnglishEpisodes.find((episode) => episode.id === id);
const findTask = (episodeId, taskId) => byId(episodeId).tasks.find((item) => item.id === taskId);

for (const level of levels) {
  test(`all three new stories complete through the real progress engine at ${level}`, () => {
    let progress = emptyEnglishProgress();
    for (const episode of newEnglishEpisodes) {
      for (const task of episode.tasks) {
        const version = task.versions[level];
        const attempt = {
          episodeId: episode.id,
          taskId: task.id,
          level,
          ...(task.skill === "speaking"
            ? { selfConfirmed: true }
            : { answer: version.correctOption || version.model }),
        };
        const result = advanceEnglishProgress(progress, attempt, episode, now);
        assert.equal(result.correct, true, `${episode.id}/${task.id}/${level}`);
        assert.equal(result.duplicate, false);
        assert.equal(result.consequence, task.consequence);
        progress = result.progress;
        const replay = advanceEnglishProgress(progress, attempt, episode, now);
        assert.equal(replay.duplicate, true);
        assert.equal(replay.progress.xp, progress.xp);
      }
      assert.equal(progress.episodes[episode.id].completedAt, now.toISOString());
    }
    assert.equal(progress.xp, 690);
    assert.deepEqual(progress.skills, { reading: 9, listening: 9, writing: 6, speaking: 6 });
    assert.equal(progress.learnedExpressionIds.length, 15);
    assert.equal(Object.keys(progress.reviews).length, 15);
  });
}

test("every writing model, accepted alternative, and necessary-info checklist is playable", () => {
  for (const episode of newEnglishEpisodes)
    for (const task of episode.tasks.filter((item) => item.skill === "writing"))
      for (const level of levels) {
        const version = task.versions[level];
        for (const answer of [version.model, ...version.accepted]) {
          assert.equal(
            englishAnswerAccepted(answer, version),
            true,
            `${task.id}/${level}: ${answer}`,
          );
          assert.equal(
            englishAnswerAccepted(answer, { keywords: version.keywords }),
            true,
            `${task.id}/${level}: checklist misses authored content`,
          );
        }
      }
});

test("wrong choices neither advance scenes nor reveal a correct consequence", () => {
  for (const episode of newEnglishEpisodes)
    for (const level of levels) {
      let progress = emptyEnglishProgress();
      for (const task of episode.tasks) {
        const version = task.versions[level];
        for (const option of (version.options || []).filter(
          (item) => item.id !== version.correctOption,
        )) {
          const wrong = advanceEnglishProgress(
            progress,
            { episodeId: episode.id, taskId: task.id, level, answer: option.id },
            episode,
            now,
          );
          assert.equal(wrong.correct, false, `${task.id}/${level}/${option.id}`);
          assert.equal(wrong.progress, progress);
          assert.equal(wrong.consequence, "");
        }
        progress = advanceEnglishProgress(
          progress,
          {
            episodeId: episode.id,
            taskId: task.id,
            level,
            ...(task.skill === "speaking"
              ? { selfConfirmed: true }
              : { answer: version.correctOption || version.model }),
          },
          episode,
          now,
        ).progress;
      }
    }
});

test("each story has three coherent chapters, ten globally unique tasks, five expressions, and a transfer activity", () => {
  assert.deepEqual(
    newEnglishEpisodes.map((episode) => episode.id),
    ["raincheck-cafe", "midnight-radio", "glasshouse-garden"],
  );
  const ids = new Set();
  for (const episode of newEnglishEpisodes) {
    assert.equal(episode.chapters.length, 3);
    assert.equal(episode.tasks.length, 10);
    assert.equal(episode.expressions.length, 5);
    assert.ok(episode.cast.length >= 2);
    assert.ok(episode.debrief.question && episode.debrief.model && episode.debrief.modelKo);
    assert.ok(!episode.debrief.model.includes("Correct answer"));
    const counts = Object.fromEntries(
      ["reading", "listening", "writing", "speaking"].map((skill) => [
        skill,
        episode.tasks.filter((task) => task.skill === skill).length,
      ]),
    );
    assert.deepEqual(counts, { reading: 3, listening: 3, writing: 2, speaking: 2 });
    let previousChapter = -1;
    for (const task of episode.tasks) {
      assert.equal(ids.has(task.id), false, task.id);
      ids.add(task.id);
      const chapterIndex = episode.chapters.findIndex((chapter) => chapter.id === task.chapterId);
      assert.ok(chapterIndex >= previousChapter, `${task.id}: chapters must not jump backward`);
      previousChapter = chapterIndex;
      for (const expressionId of task.expressionIds)
        assert.ok(episode.expressions.some((item) => item.id === expressionId));
    }
    for (const expression of episode.expressions) {
      assert.equal(ids.has(expression.id), false);
      ids.add(expression.id);
    }
    for (const chapter of episode.chapters) {
      assert.ok(chapter.story.length > 180);
      assert.ok(chapter.storyEn.split(/\s+/).length >= 65);
      assert.ok(chapter.dialogue.length >= 2 && chapter.dialogue.length <= 4);
      assert.match(chapter.image, /^\/assets\/english\/.+\.webp$/);
    }
    assert.notEqual(episode.chapters[2].image, episode.image);
    assert.equal(new Set(episode.chapters.map((chapter) => chapter.image)).size, 3);
  }
});

test("the English dictionary covers every Korean field and maps passage translations back to their actual English", () => {
  const dictionary = JSON.parse(
    readFileSync(new URL("../lib/i18n/en-stories-new.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(dictionary, newEnglishStoryTranslations);
  const normalized = Object.fromEntries(
    Object.entries(dictionary).map(([key, value]) => [key.replace(/\s+/g, " ").trim(), value]),
  );
  function walk(value, at = "") {
    if (typeof value === "string" && /[가-힣]/.test(value)) {
      const translated = normalized[value.replace(/\s+/g, " ").trim()];
      assert.ok(translated, `Missing translated field: ${at}`);
      assert.equal(/[가-힣]/.test(translated), false, at);
    } else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${at}[${i}]`));
    else if (value && typeof value === "object")
      Object.entries(value).forEach(([key, item]) => walk(item, `${at}.${key}`));
  }
  walk(newEnglishEpisodes);
  for (const episode of newEnglishEpisodes) {
    for (const chapter of episode.chapters)
      assert.equal(dictionary[chapter.story], chapter.storyEn);
    for (const task of episode.tasks)
      for (const version of Object.values(task.versions))
        assert.equal(dictionary[version.translation], version.passage);
    for (const expression of episode.expressions)
      assert.equal(dictionary[expression.ko], expression.en);
  }
});

test("Korean story titles and character names are natural and the radio's east gate is unambiguous", () => {
  assert.deepEqual(
    newEnglishEpisodes.map((episode) => episode.title),
    ["비 오는 날, 카페에서", "여덟 시에 만나요", "온실에 남겨진 지도"],
  );
  function checkKorean(value) {
    if (typeof value === "string" && /[가-힣]/.test(value)) {
      assert.doesNotMatch(value, /\b(?:Leo|June|Nora|Maya|Sam|Iris|Ben|Mae|Ada|Finn)\b/);
      assert.doesNotMatch(value, /East Park|Raincheck Café/);
    } else if (Array.isArray(value)) value.forEach(checkKorean);
    else if (value && typeof value === "object") Object.values(value).forEach(checkKorean);
  }
  checkKorean(newEnglishEpisodes);
  const radio = byId("midnight-radio");
  for (const level of levels) {
    const message = radio.tasks.find((task) => task.id === "radio-write-correction").versions[
      level
    ];
    assert.match(message.model, /the east gate at East Park/);
    assert.doesNotMatch(message.model, /the East Park gate/);
    assert.match(message.translation, /동부공원 동문|동문/);
  }
});

test("café numbers and chronology remain consistent when a guest chooses her own bottle", () => {
  const episode = byId("raincheck-cafe");
  const count = findTask(episode.id, "cafe-count-time");
  const order = findTask(episode.id, "cafe-drinks");
  const update = findTask(episode.id, "cafe-manager-result");
  for (const level of levels) {
    assert.match(
      count.versions[level].passage.toLowerCase(),
      /six|five other people are coming with me/,
    );
    assert.equal(count.versions[level].model, "Six people at four.");
    assert.match(count.versions[level].passage, /four/);
    assert.match(count.versions[level].passage, /five/);
    assert.equal(order.versions[level].model, "Four waters and two lemonades.");
    assert.match(update.versions[level].passage, /four to three/);
    assert.match(update.versions[level].passage, /own snack and bottle|chosen snack and bottle/);
  }
  const text = newEnglishStoryTranslations[episode.ending];
  assert.match(text, /At four, six people/);
  assert.match(text, /three waters and two lemonades/);
  assert.match(newEnglishStoryTranslations[episode.chapters[2].story], /3:20/);
  assert.match(newEnglishStoryTranslations[episode.chapters[2].story], /3:45/);
  const booking = findTask(episode.id, "cafe-correct-booking").versions.challenge;
  assert.equal(
    englishAnswerAccepted("Please change our reservation to five for six people.", booking),
    false,
  );
});

test("all café difficulties keep ingredient/equipment verification and no food preparation if unverified", () => {
  for (const level of levels) {
    const request = findTask("raincheck-cafe", "cafe-food-request").versions[level];
    assert.match(request.passage, /ingredients/);
    assert.match(request.passage, /shared equipment/);
    assert.match(request.passage, /do not prepare/);
    const result = findTask("raincheck-cafe", "cafe-manager-result").versions[level];
    assert.match(result.passage, /can't verify|cannot verify|unable to verify/);
    assert.match(result.passage, /won't prepare|will not prepare/);
  }
  const version = findTask("raincheck-cafe", "cafe-check-message").versions.standard;
  assert.equal(
    englishAnswerAccepted(
      "Please check the ingredients. If you cannot confirm them, do not prepare a snack.",
      version,
    ),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "Please check the ingredients and equipment, then prepare a snack.",
      version,
    ),
    false,
  );
});

test("radio original dates, current poster, organizer confirmation, and correction have one causal timeline", () => {
  assert.equal(new Date("2019-11-08T12:00:00Z").getUTCDay(), 5);
  assert.equal(new Date("2026-11-06T12:00:00Z").getUTCDay(), 5);
  for (const level of levels) {
    const old = findTask("midnight-radio", "radio-old-voice").versions[level];
    assert.match(old.passage, /2019/);
    assert.match(old.passage, /eight/);
    assert.match(old.passage, /north gate/);
    const current = findTask("midnight-radio", "radio-current-poster").versions[level];
    assert.equal(current.model, "Six at the east gate at East Park on November 6, 2026.");
    assert.match(current.passage, /3:30|15:30/);
    const organizer = findTask("midnight-radio", "radio-confirmed-voice").versions[level];
    assert.match(organizer.passage, /six/);
    assert.match(organizer.passage, /east gate at East Park/);
    assert.match(organizer.passage, /2019/);
    assert.equal(
      englishAnswerAccepted(
        "Today's walk starts at eight at the north gate.",
        findTask("midnight-radio", "radio-write-correction").versions[level],
      ),
      false,
    );
  }
  const episode = byId("midnight-radio");
  assert.match(newEnglishStoryTranslations[episode.chapters[2].story], /5:20/);
  assert.match(newEnglishStoryTranslations[episode.ending], /At 5:30/);
  assert.match(newEnglishStoryTranslations[episode.ending], /At six/);
  assert.match(
    newEnglishStoryTranslations[episode.chapters[2].story],
    /not to find someone to blame/,
  );
});

test("garden uses current route rules and individual care instructions, then returns tools before opening", () => {
  for (const level of levels) {
    const map = findTask("glasshouse-garden", "garden-current-map").versions[level];
    assert.equal(map.model, "The open south path.");
    assert.match(map.passage, /east path/);
    assert.match(map.passage, /south/);
    const cards = findTask("glasshouse-garden", "garden-care-cards").versions[level];
    assert.match(cards.passage, /100 mL/);
    assert.match(cards.passage, /DRY|dry/);
    assert.match(cards.passage, /DAMP|damp/);
    assert.equal(cards.model, "Give A one 100 mL measure and leave B without extra water.");
    const checked = findTask("glasshouse-garden", "garden-ada-result").versions[level];
    assert.match(checked.passage, /checked|check/);
    assert.match(checked.passage, /no water|no[- ]watering|Do not water/);
  }
  const episode = byId("glasshouse-garden");
  assert.match(newEnglishStoryTranslations[episode.chapters[2].story], /By 2:40/);
  assert.match(newEnglishStoryTranslations[episode.ending], /At three/);
  assert.match(newEnglishStoryTranslations[episode.ending], /back on its tool shelf/);
  const request = findTask(episode.id, "garden-ask-check").versions.challenge;
  assert.equal(englishAnswerAccepted("Please check pot C.", request), false);
  assert.equal(
    englishAnswerAccepted(
      "The card on pot C is faded. Please inspect it before watering.",
      request,
    ),
    true,
  );
});
