import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { test } from "node:test";
import {
  englishEpisodes,
  getEnglishEpisode,
  getEnglishExpression,
} from "../lib/english/catalog.ts";
import { englishLevels } from "../lib/english/types.ts";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  englishAnswerAccepted,
} from "../lib/english/progress.ts";

const now = new Date("2026-10-14T09:00:00Z");
const skills = ["listening", "reading", "speaking", "writing"];

for (const { id: level } of englishLevels) {
  test(`the whole authored season is playable at ${level} without writing dead ends`, () => {
    let progress = emptyEnglishProgress();
    for (const episode of englishEpisodes) {
      assert.deepEqual([...new Set(episode.tasks.map((t) => t.skill))].sort(), skills);
      for (const task of episode.tasks) {
        const version = task.versions[level];
        const result = advanceEnglishProgress(
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
        );
        assert.equal(
          result.correct,
          true,
          `${episode.id}/${task.id}/${level}: authored answer rejected`,
        );
        assert.equal(result.duplicate, false);
        assert.equal(result.consequence, task.consequence);
        progress = result.progress;
      }
      assert.equal(progress.episodes[episode.id].completedAt, now.toISOString());
    }
    assert.equal(progress.xp, 1440);
    assert.deepEqual(progress.skills, { reading: 19, listening: 18, writing: 13, speaking: 13 });
    assert.equal(progress.learnedExpressionIds.length, 33);
    assert.equal(Object.keys(progress.reviews).length, 33);
  });
}

test("all published writing examples and their accepted alternatives pass the real content checker", () => {
  for (const episode of englishEpisodes)
    for (const task of episode.tasks) {
      if (task.skill !== "writing") continue;
      for (const [level, version] of Object.entries(task.versions)) {
        assert.equal(
          englishAnswerAccepted(version.model, version),
          true,
          `${task.id}/${level} model`,
        );
        for (const answer of version.accepted || []) {
          assert.equal(
            englishAnswerAccepted(answer, version),
            true,
            `${task.id}/${level}: ${answer}`,
          );
        }
      }
    }
});

test("real writing requests require the information needed to act, including challenge conditions", () => {
  const book = getEnglishEpisode("closed-bookshop").tasks.find((t) => t.id === "bookshop-message");
  assert.equal(englishAnswerAccepted("Could you help me?", book.versions.starter), false);
  assert.equal(
    englishAnswerAccepted("Could you help me open the door?", book.versions.standard),
    false,
  );
  assert.equal(
    englishAnswerAccepted("I'm at the front door. Could you help me?", book.versions.challenge),
    false,
  );
  assert.equal(
    englishAnswerAccepted("Please don't help me with the door.", book.versions.starter),
    false,
  );
  const request = getEnglishEpisode("locker-seven").tasks.find((t) => t.id === "locker-request");
  assert.equal(
    englishAnswerAccepted("Please check the receipt.", request.versions.standard),
    false,
  );
  assert.equal(
    englishAnswerAccepted("Please check the receipt for a lemon bun.", request.versions.challenge),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "Please check the lemon bun receipt from after 3 p.m.",
      request.versions.challenge,
    ),
    true,
  );
  const address = getEnglishEpisode("moonlight-post").tasks.find(
    (t) => t.id === "moonpost-address",
  );
  assert.equal(englishAnswerAccepted("To Grandma Willow.", address.versions.starter), false);
  assert.equal(
    englishAnswerAccepted(
      "Please deliver the letter to Willow at the East Lighthouse.",
      address.versions.challenge,
    ),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "This letter is for Willow at the East Lighthouse before dawn.",
      address.versions.challenge,
    ),
    true,
  );
});

test("no authored wrong choice skips evidence or rewards a guess in any difficulty", () => {
  for (const episode of englishEpisodes)
    for (const { id: level } of englishLevels) {
      let progress = emptyEnglishProgress();
      for (const task of episode.tasks) {
        const version = task.versions[level];
        for (const wrong of version.options?.filter((o) => o.id !== version.correctOption) || []) {
          const result = advanceEnglishProgress(
            progress,
            {
              episodeId: episode.id,
              taskId: task.id,
              level,
              answer: wrong.id,
            },
            episode,
            now,
          );
          assert.equal(result.correct, false, `${task.id}/${level}/${wrong.id}`);
          assert.equal(result.progress, progress);
          assert.equal(result.consequence, "");
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

test("the lost-property solution preserves the same independent identifying evidence at every level", () => {
  const episode = getEnglishEpisode("locker-seven");
  const letter = episode.tasks.find((t) => t.id === "locker-letter");
  const records = episode.tasks.find((t) => t.id === "locker-records");
  for (const { id: level } of englishLevels) {
    const request = letter.versions[level].passage;
    assert.match(request, /silver star/i, `${level}: missing physical identifier`);
    assert.match(request, /lemon bun/i, `${level}: missing purchased item`);
    assert.match(request, /after three/i, `${level}: missing purchase-time condition`);
    assert.match(request, /rain started/i, `${level}: missing fact used by later feedback`);
    const source = records.versions[level].passage;
    assert.match(source, /(?:Bag )?A[^\n]*red tag[^\n]*14:10/i);
    assert.match(source, /(?:Bag )?B[^\n]*silver star[^\n]*15:20/i);
    assert.match(records.versions[level].model, /(?:Bag )?B/);
  }
  assert.match(episode.ending, /초록색 공책/);
  const resolution = [
    episode.ending,
    ...episode.tasks.map((task) => task.feedback + " " + task.consequence),
  ].join(" ");
  assert.match(resolution, /미공개|공개하지 않은/);
  assert.match(resolution, /주인.{0,12}확인|확인.{0,12}주인/);
});

test("the bookshop door opens through the stated mechanism after staff clears the route", () => {
  const episode = getEnglishEpisode("closed-bookshop");
  assert.match(episode.intro, /초록색 비상문.*언제든/);
  const messageIndex = episode.tasks.findIndex((t) => t.id === "bookshop-message");
  const confirmationIndex = episode.tasks.findIndex((t) => t.id === "bookshop-intercom");
  const releaseIndex = episode.tasks.findIndex((t) => t.id === "bookshop-release");
  assert.ok(messageIndex < confirmationIndex && confirmationIndex < releaseIndex);
  for (const { id: level } of englishLevels) {
    const confirmation = episode.tasks[confirmationIndex].versions[level].passage;
    assert.match(confirmation, /(?:path[^.]*clear|sign has been removed)/i);
    const instructions = episode.tasks[releaseIndex].versions[level].passage;
    assert.match(instructions, /lift[^.]*cover/i);
    assert.match(instructions, /pull[^.]*red lever down/i);
    assert.match(instructions, /push(?:ed)?[^.]*open|push the door/i);
  }
  assert.match(episode.tasks[releaseIndex].consequence, /정문.*열/);
});

test("the fairy-tale's declared route and departure rules hold across all versions and the ending", () => {
  const episode = getEnglishEpisode("moonlight-post");
  assert.match(episode.intro, /흰 등불 배.*동쪽 등대/);
  assert.match(episode.intro, /두 번째 종/);
  assert.match(episode.intro, /해가 뜨면 다음 밤까지/);
  const boat = episode.tasks.find((t) => t.id === "moonpost-boat");
  const route = episode.tasks.find((t) => t.id === "moonpost-route");
  for (const { id: level } of englishLevels) {
    assert.match(boat.versions[level].model, /white/i);
    assert.match(boat.versions[level].model, /second bell/i);
    assert.match(route.versions[level].passage, /stone path/i);
    assert.match(route.versions[level].passage, /shell signs/i);
    assert.match(route.versions[level].passage, /wooden bridge[^.]*orchard/i);
  }
  assert.match(episode.ending, /두 번째 종.*흰 등불 배/);
  assert.match(episode.ending, /조개 표지.*돌길/);
  assert.match(
    episode.tasks.find((task) => task.id === "moonpost-deliver").versions.challenge.passage,
    /before sunrise/,
  );
});

test("every collected expression resolves to exactly one original episode and every target is practiced", () => {
  const ids = new Set(),
    taskIds = new Set();
  for (const episode of englishEpisodes) {
    assert.equal(getEnglishEpisode(episode.id), episode);
    const linked = new Set(episode.tasks.flatMap((task) => task.expressionIds));
    for (const expression of episode.expressions) {
      assert.ok(!ids.has(expression.id), `duplicate expression: ${expression.id}`);
      ids.add(expression.id);
      assert.equal(getEnglishExpression(expression.id), expression);
      assert.ok(linked.has(expression.id), `unpracticed expression: ${expression.id}`);
    }
    for (const task of episode.tasks) {
      assert.ok(!taskIds.has(task.id), `duplicate task: ${task.id}`);
      taskIds.add(task.id);
      for (const id of task.expressionIds)
        assert.ok(episode.expressions.some((expression) => expression.id === id));
    }
  }
  assert.equal(getEnglishEpisode("not-a-story"), undefined);
  assert.equal(getEnglishExpression("not-a-target"), undefined);
});

test("all authored story versions, practice UI, growth labels, and feedback have English translations", () => {
  const dictionary = Object.assign(
    {},
    ...[
      "en-english.json",
      "en-interface.json",
      "en-stories-revised.json",
      "en-stories-new.json",
      "en-player-story.json",
      "en-study.json",
      "en-review-queue.json",
      "en-study-navigation.json",
      "en-library.json",
      "en-home-v2.json",
      "en-player-v2.json",
      "en-discovery-v2.json",
      "en-story-polish.json",
    ].map((file) =>
      JSON.parse(readFileSync(new URL(`../lib/i18n/${file}`, import.meta.url), "utf8")),
    ),
  );
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  const missing = [];
  function check(text, source) {
    if (typeof text !== "string" || !/[가-힣]/.test(text)) return;
    const key = normalize(text);
    if (!dictionary[key] || /[가-힣]/.test(dictionary[key])) missing.push(`${source}: ${key}`);
  }
  function walk(value, source) {
    if (typeof value === "string") check(value, source);
    else if (Array.isArray(value)) value.forEach((item, index) => walk(item, `${source}.${index}`));
    else if (value && typeof value === "object")
      for (const [field, item] of Object.entries(value)) walk(item, `${source}.${field}`);
  }
  walk(englishEpisodes, "catalog");
  for (const episode of englishEpisodes) {
    check(`${episode.title} · 영어 학습`, "episode metadata");
    for (const task of episode.tasks)
      for (const version of Object.values(task.versions)) {
        assert.equal(
          dictionary[normalize(version.translation)],
          version.passage,
          `${task.id}: clue changed in translation`,
        );
      }
  }
  for (const file of [
    "components/english/player.tsx",
    "components/english/hub.tsx",
    "components/english/review.tsx",
    "components/english/courses.tsx",
    "components/english/journal.tsx",
    "components/english/study-navigation.tsx",
    "components/english/use-study-progress.ts",
    "components/english/library-browser.tsx",
    "components/english/practice-player.tsx",
    "lib/english/types.ts",
    "lib/english/progress.ts",
  ]) {
    const sourceFile = ts.createSourceFile(
      file,
      readFileSync(new URL(`../${file}`, import.meta.url), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node) {
      if (
        ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isJsxText(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)
      )
        check(node.text, file);
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
  }
  assert.deepEqual(missing, [], "English routes would show untranslated authored Korean");
  for (const [key, value] of Object.entries(dictionary)) {
    assert.equal(key, normalize(key), "dictionary keys must match normalized text");
    assert.ok(value.trim().length > 0, `${key}: empty translation`);
    assert.doesNotMatch(value, /[가-힣]/, `${key}: translation is still Korean`);
  }
});
