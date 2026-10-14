import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { initialEnglishEpisodes } from "../lib/english/initial-episodes.ts";
import { revisedEnglishEpisodes, revisedEnglishMessages } from "../lib/english/revised-episodes.ts";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  englishAnswerAccepted,
} from "../lib/english/progress.ts";

const now = new Date("2026-10-14T09:00:00Z");
const levels = ["starter", "standard", "challenge"];
const find = (id) => revisedEnglishEpisodes.find((episode) => episode.id === id);
const task = (episode, id) => episode.tasks.find((item) => item.id === id);
function attempt(episode, item, level) {
  const version = item.versions[level];
  return {
    episodeId: episode.id,
    taskId: item.id,
    level,
    ...(item.skill === "speaking"
      ? { selfConfirmed: true }
      : { answer: version.correctOption || version.model }),
  };
}

for (const level of levels) {
  test(`all three revised stories can be completed through the real engine at ${level}`, () => {
    let progress = emptyEnglishProgress();
    for (const episode of revisedEnglishEpisodes) {
      for (const item of episode.tasks) {
        const result = advanceEnglishProgress(
          progress,
          attempt(episode, item, level),
          episode,
          now,
        );
        assert.equal(result.correct, true, `${episode.id}/${item.id}/${level} is a dead end`);
        assert.equal(result.duplicate, false);
        assert.equal(result.consequence, item.consequence);
        progress = result.progress;
      }
      assert.equal(progress.episodes[episode.id].completedAt, now.toISOString());
      assert.equal(progress.episodes[episode.id].completedTasks.length, 11);
    }
    assert.equal(progress.xp, 750);
    assert.deepEqual(progress.skills, { reading: 10, listening: 9, writing: 7, speaking: 7 });
    assert.equal(progress.learnedExpressionIds.length, 18);
    assert.equal(Object.keys(progress.reviews).length, 18);
    assert.equal("voiceScore" in progress, false);
  });
}

test("existing task and expression identities and task order survive the expansion without changing initial stories", () => {
  for (const original of initialEnglishEpisodes) {
    const episode = find(original.id);
    assert.equal(original.tasks.length, 5, "the initial story must remain independent");
    assert.equal(original.expressions.length, 3);
    assert.equal(original.chapters, undefined);
    assert.equal(
      episode.title,
      original.id === "closed-bookshop" ? "서점에 남겨진 부탁" : original.title,
    );
    const oldIds = new Set(original.tasks.map((item) => item.id));
    assert.deepEqual(
      episode.tasks.filter((item) => oldIds.has(item.id)).map((item) => item.id),
      original.tasks.map((item) => item.id),
    );
    for (const expression of original.expressions) {
      const retained = episode.expressions.find((item) => item.id === expression.id);
      for (const key of ["id", "en", "accepted"]) {
        assert.deepEqual(retained[key], expression[key]);
      }
    }
    assert.notEqual(episode.intro, original.intro);
    assert.notEqual(episode.ending, original.ending);
  }
});

test("each chapter has its own coherent introduction, dialogue, tasks, and an arrival scene", () => {
  const taskIds = new Set(),
    expressionIds = new Set();
  for (const episode of revisedEnglishEpisodes) {
    assert.equal(episode.tasks.length, 11);
    assert.equal(episode.chapters.length, 3);
    assert.equal(episode.expressions.length, 6);
    assert.ok(episode.cast.length >= 3);
    assert.ok(episode.debrief.question && episode.debrief.model && episode.debrief.modelKo);
    assert.deepEqual([...new Set(episode.tasks.map((item) => item.skill))].sort(), [
      "listening",
      "reading",
      "speaking",
      "writing",
    ]);
    for (const [index, chapter] of episode.chapters.entries()) {
      assert.ok(chapter.story.length > 100 && chapter.storyEn.length > 100);
      assert.ok(chapter.location && chapter.objective);
      assert.ok(chapter.dialogue.length >= 2 && chapter.dialogue.length <= 4);
      for (const turn of chapter.dialogue) assert.ok(turn.speaker && turn.en && turn.ko);
      assert.equal(
        episode.tasks.filter((item) => item.chapterId === chapter.id).length,
        index < 2 ? 4 : 3,
      );
      assert.match(chapter.image, /^\/assets\/english\/.+\.webp$/);
    }
    assert.notEqual(episode.chapters[2].image, episode.image);
    const last = episode.tasks.at(-1);
    assert.match(last.id, /-transfer$/);
    assert.equal(last.skill, "speaking");
    for (const item of episode.tasks) {
      assert.ok(!taskIds.has(item.id), `duplicate task ${item.id}`);
      taskIds.add(item.id);
      assert.ok(episode.chapters.some((chapter) => chapter.id === item.chapterId));
      for (const id of item.expressionIds)
        assert.ok(episode.expressions.some((expression) => expression.id === id));
    }
    for (const expression of episode.expressions) {
      assert.ok(!expressionIds.has(expression.id), `duplicate expression ${expression.id}`);
      expressionIds.add(expression.id);
      assert.ok(
        episode.tasks.some((item) => item.expressionIds.includes(expression.id)),
        `unpracticed expression ${expression.id}`,
      );
    }
  }
});

test("every writing example is accepted and each difficulty changes the language or response demand", () => {
  for (const episode of revisedEnglishEpisodes)
    for (const item of episode.tasks) {
      assert.equal(
        new Set(levels.map((level) => item.versions[level].passage)).size,
        3,
        `${item.id}: repeated difficulty text`,
      );
      for (const level of levels) {
        const version = item.versions[level];
        assert.ok(version.passage && version.translation && version.prompt && version.model);
        if (item.skill === "writing") {
          assert.equal(
            englishAnswerAccepted(version.model, version),
            true,
            `${item.id}/${level}: model rejected`,
          );
          for (const variant of version.accepted)
            assert.equal(englishAnswerAccepted(variant, version), true);
        }
        if (item.skill === "reading" || item.skill === "listening") {
          assert.equal(version.options.length, 3);
          assert.equal(new Set(version.options.map((option) => option.id)).size, 3);
          assert.equal(
            version.options.filter((option) => option.id === version.correctOption).length,
            1,
          );
        }
      }
    }
});

test("every wrong choice in every difficulty leaves story progress and collected expressions unchanged", () => {
  for (const episode of revisedEnglishEpisodes)
    for (const level of levels) {
      let progress = emptyEnglishProgress();
      for (const item of episode.tasks) {
        const version = item.versions[level];
        for (const wrong of version.options?.filter(
          (option) => option.id !== version.correctOption,
        ) || []) {
          const result = advanceEnglishProgress(
            progress,
            { ...attempt(episode, item, level), answer: wrong.id },
            episode,
            now,
          );
          assert.equal(result.correct, false, `${item.id}/${level}/${wrong.id}`);
          assert.equal(result.progress, progress);
          assert.equal(result.consequence, "");
        }
        progress = advanceEnglishProgress(
          progress,
          attempt(episode, item, level),
          episode,
          now,
        ).progress;
      }
    }
});

test("the bookshop goal justifies the covered route while keeping the emergency exit available", () => {
  const episode = find("closed-bookshop");
  assert.match(episode.intro, /초록색 비상문은 안에서 언제든/);
  assert.match(episode.intro, /지붕 없는 안뜰/);
  assert.match(episode.intro, /책을 젖지 않게/);
  const purpose = task(episode, "bookshop-delivery-note");
  const route = task(episode, "bookshop-route-choice");
  const selection = task(episode, "bookshop-find-book");
  const confirmation = task(episode, "bookshop-confirm-label");
  const releaseIndex = episode.tasks.findIndex((item) => item.id === "bookshop-release");
  assert.ok(episode.tasks.indexOf(selection) < episode.tasks.indexOf(confirmation));
  assert.ok(episode.tasks.indexOf(confirmation) < releaseIndex);
  for (const level of levels) {
    assert.match(purpose.versions[level].passage, /Jo/);
    assert.match(purpose.versions[level].passage, /reading room/);
    assert.match(route.versions[level].passage, /(?:no roof|open courtyard|exposed to the rain)/);
    assert.match(selection.versions[level].passage, /(?:Blue|blue)[^.]*Jo/);
    assert.match(confirmation.versions[level].model, /check the label/i);
  }
  assert.match(episode.ending, /초록색 비상문/);
  assert.match(episode.ending, /조에게 책을 건넸[\s\S]*마지막 낭독.*시작/);
  assert.match(episode.tasks.at(-1).context, /박물관.*종이 작품/);
});

test("the bag's physical and purchase evidence remains unchanged, and owner verification precedes delivery permission", () => {
  const episode = find("locker-seven");
  const letter = task(episode, "locker-letter");
  const records = task(episode, "locker-records");
  for (const level of levels) {
    assert.match(letter.versions[level].passage, /silver star/);
    assert.match(letter.versions[level].passage, /lemon bun/);
    assert.match(letter.versions[level].passage, /after three/);
    assert.match(records.versions[level].passage, /(?:Bag )?A[^\n]*red tag[^\n]*14:10/);
    assert.match(records.versions[level].passage, /(?:Bag )?B[^\n]*silver star[^\n]*15:20/);
    assert.match(
      task(episode, "locker-owner-check").versions[level].passage,
      /green (?:sketch )?notebook/,
    );
  }
  const reportIndex = episode.tasks.findIndex((item) => item.id === "locker-report");
  const ownerIndex = episode.tasks.findIndex((item) => item.id === "locker-owner-check");
  const permissionIndex = episode.tasks.findIndex((item) => item.id === "locker-letter-permission");
  const recipientIndex = episode.tasks.findIndex((item) => item.id === "locker-recipient-location");
  assert.ok(
    reportIndex < ownerIndex && ownerIndex < permissionIndex && permissionIndex < recipientIndex,
  );
  assert.match(episode.tasks[reportIndex].consequence, /바로.*않고/);
  assert.match(episode.tasks[ownerIndex].consequence, /확인을 마치고 B 가방/);
  assert.match(episode.tasks[permissionIndex].consequence, /레나가.*가져다줘도 된다고/);
  assert.match(episode.ending, /카이는 혼자 편지를 읽고/);
  assert.match(episode.debrief.model, /authorised lost-property report.*sealed personal letter/);
});

test("the private letter is delivered to the confirmed recipient rather than left at a matching landmark", () => {
  const episode = find("locker-seven");
  const location = task(episode, "locker-recipient-location");
  const delivery = task(episode, "locker-explain-delivery");
  for (const level of levels) {
    assert.match(
      location.versions[level].passage,
      /(?:Platform Two[^.]*blue bench|blue bench[^.]*Platform Two)/,
    );
    assert.match(location.versions[level].passage, /Platform One/);
    assert.match(delivery.versions[level].model, /Lena asked me/);
    assert.match(delivery.versions[level].model, /letter/);
  }
  assert.match(delivery.consequence, /카이가.*이름을 확인/);
  assert.match(delivery.consequence, /봉인된 편지를.*건넵니다/);
  assert.match(episode.tasks.at(-1).versions.standard.model, /wallet/);
  assert.doesNotMatch(episode.tasks.at(-1).versions.standard.model, /describe your bag/);
});

test("the fairy-tale adds emotional purpose without changing the boat, bell, or path rules", () => {
  const episode = find("moonlight-post");
  const purpose = task(episode, "moonpost-miro-purpose");
  const boat = task(episode, "moonpost-boat");
  const route = task(episode, "moonpost-route");
  const map = task(episode, "moonpost-map-check");
  assert.match(episode.intro, /윌로 할머니.*함께/);
  assert.match(episode.intro, /해가 뜨면 다음 밤까지/);
  for (const level of levels) {
    assert.match(purpose.versions[level].passage, /(?:Grandma|grandmother)/);
    assert.match(purpose.versions[level].passage, /(?:lantern|festival)/);
    assert.match(boat.versions[level].model, /white/);
    assert.match(boat.versions[level].model, /second bell/);
    assert.match(route.versions[level].passage, /stone path/);
    assert.match(route.versions[level].passage, /shell signs/);
    assert.match(
      map.versions[level].passage,
      /(?:Orchard[^.]*wooden bridge|wooden bridge[^.]*orchard)/i,
    );
  }
  assert.match(episode.chapters[2].story, /윌로 할머니[\s\S]*토끼/);
  assert.match(episode.ending, /조개 표지.*돌길/);
  assert.match(episode.ending, /축제에 쓸 종이를 준비/);
  for (const level of levels) {
    assert.match(episode.tasks.at(-1).versions[level].model, /amber/);
    assert.doesNotMatch(episode.tasks.at(-1).versions[level].model, /white/);
  }
});

test("new writing tasks require the actor, purpose, route, or sealed condition appropriate to difficulty", () => {
  const label = task(find("closed-bookshop"), "bookshop-confirm-label");
  assert.equal(englishAnswerAccepted("Could you check the label?", label.versions.standard), false);
  assert.equal(
    englishAnswerAccepted(
      "I found the blue book for Jo. Could you check the label?",
      label.versions.challenge,
    ),
    false,
  );
  assert.equal(
    englishAnswerAccepted("Please don't check the label.", label.versions.starter),
    false,
  );
  const permission = task(find("locker-seven"), "locker-letter-permission");
  assert.equal(
    englishAnswerAccepted("May I take this letter?", permission.versions.starter),
    false,
  );
  assert.equal(
    englishAnswerAccepted("May I take this letter to Kai?", permission.versions.standard),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "May I take this letter to Kai? I will keep it sealed.",
      permission.versions.challenge,
    ),
    false,
  );
  const route = task(find("moonlight-post"), "moonpost-route-log");
  assert.equal(
    englishAnswerAccepted("I'll follow the stone path.", route.versions.standard),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "I'll follow the stone path to the East Lighthouse.",
      route.versions.challenge,
    ),
    false,
  );
  assert.equal(
    englishAnswerAccepted(
      "From the clock tower, I'll take the stone path to the East Lighthouse.",
      route.versions.challenge,
    ),
    true,
  );
});

test("returning learners can finish the inserted scenes without losing old identities or earning the completion bonus twice", () => {
  let progress = emptyEnglishProgress();
  for (const episode of initialEnglishEpisodes) {
    for (const item of episode.tasks)
      progress = advanceEnglishProgress(
        progress,
        attempt(episode, item, "standard"),
        episode,
        now,
      ).progress;
    delete progress.episodes[episode.id].completionRewarded; // Legacy records used completedAt only.
  }
  assert.equal(progress.xp, 390);
  const oldExpressionIds = [...progress.learnedExpressionIds];
  for (const episode of revisedEnglishEpisodes)
    for (const item of episode.tasks) {
      progress = advanceEnglishProgress(
        progress,
        attempt(episode, item, "standard"),
        episode,
        now,
      ).progress;
    }
  assert.equal(progress.xp, 390 + 18 * 20);
  assert.equal(progress.learnedExpressionIds.length, 18);
  for (const id of oldExpressionIds) assert.ok(progress.learnedExpressionIds.includes(id));
  for (const episode of revisedEnglishEpisodes) {
    assert.equal(progress.episodes[episode.id].completedTasks.length, 11);
    assert.equal(progress.episodes[episode.id].completionRewarded, true);
  }
});

test("every new story field is translated, and paired clues and dialogue retain their authored English", () => {
  const original = JSON.parse(
    readFileSync(new URL("../lib/i18n/en-english.json", import.meta.url), "utf8"),
  );
  const revised = JSON.parse(
    readFileSync(new URL("../lib/i18n/en-stories-revised.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    revised,
    revisedEnglishMessages,
    "Regenerate the story dictionary after editing bilingual source",
  );
  const messages = { ...original, ...revised };
  const normalize = (value) => value.replace(/\s+/g, " ").trim();
  const missing = [];
  function walk(value, path) {
    if (typeof value === "string" && /[가-힣]/.test(value)) {
      const translated = messages[normalize(value)];
      if (!translated || /[가-힣]/.test(translated)) missing.push(path);
    } else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`));
    else if (value && typeof value === "object")
      for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`);
  }
  walk(revisedEnglishEpisodes, "episodes");
  assert.deepEqual(missing, []);
  for (const episode of revisedEnglishEpisodes) {
    for (const chapter of episode.chapters) {
      assert.equal(messages[normalize(chapter.story)], chapter.storyEn);
      for (const turn of chapter.dialogue) assert.equal(messages[normalize(turn.ko)], turn.en);
    }
    for (const item of episode.tasks)
      for (const version of Object.values(item.versions)) {
        assert.equal(messages[normalize(version.translation)], version.passage);
      }
    assert.equal(messages[normalize(episode.debrief.modelKo)], episode.debrief.model);
  }
});
