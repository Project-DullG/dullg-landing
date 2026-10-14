import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { englishEpisodes, allEnglishContent } from "../lib/english/catalog.ts";
import { revisedEnglishMessages } from "../lib/english/revised-episodes.ts";
import { newEnglishStoryTranslations } from "../lib/english/new-episodes.ts";
import { advanceEnglishProgress, emptyEnglishProgress } from "../lib/english/progress.ts";

// Baselines captured before this prose-only revision: every task field except
// feedback/consequence, every expression, and the existing chapter order.
const protectedBanks = {
  "closed-bookshop": "9991a6b0183d321cd152f7e644aa72fcf3f18b3c4fc2613ebc98db72e0b8c8c2",
  "locker-seven": "cd116677151dcee251b925fea58bc46ee2426547fd00690dedf27115712dcabc",
  "moonlight-post": "fbd9339b011453cebc3767be6cc11fdd361b65416e224ab5e3e43b290488c461",
  "raincheck-cafe": "e770d263ca30bb5fb206a3a1dde3d2dc60983526b0f561669aa3f9fd8aabea46",
  "midnight-radio": "011836f4960b4db7c34ed52494b34fc09751f7e69797e892d2323e2d57aa4b93",
  "glasshouse-garden": "df60a67ee2c6e5b52e6825236862ecab2c5cb228a209860d9ff26ab1766af50b",
};
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, stable(value[key])]),
    );
  }
  return value;
}
const story = (id) => englishEpisodes.find((episode) => episode.id === id);
const task = (id, taskId) => story(id).tasks.find((item) => item.id === taskId);
const normalize = (text) => text.replace(/\s+/g, " ").trim();
const polishDictionary = JSON.parse(
  readFileSync(new URL("../lib/i18n/en-story-polish.json", import.meta.url), "utf8"),
);
const originalDictionary = JSON.parse(
  readFileSync(new URL("../lib/i18n/en-english.json", import.meta.url), "utf8"),
);
const messages = Object.fromEntries(
  Object.entries({
    ...originalDictionary,
    ...revisedEnglishMessages,
    ...newEnglishStoryTranslations,
    ...polishDictionary,
  }).map(([ko, en]) => [normalize(ko), en]),
);

test("six story banks retain all original tasks, levels, clues, scoring patterns, expressions, and order", () => {
  assert.equal(englishEpisodes.length, 6);
  for (const episode of englishEpisodes) {
    const bank = {
      id: episode.id,
      chapterIds: episode.chapters.map((chapter) => chapter.id),
      tasks: episode.tasks.map((item) =>
        Object.fromEntries(
          Object.entries(item).filter(([key]) => key !== "feedback" && key !== "consequence"),
        ),
      ),
      expressions: episode.expressions,
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(stable(bank)))
      .digest("hex");
    assert.equal(
      fingerprint,
      protectedBanks[episode.id],
      `${episode.id}: a teaching or identity field changed during prose revision`,
    );
  }
  assert.equal(allEnglishContent.length, 25);
  assert.equal(
    allEnglishContent.reduce((sum, item) => sum + item.tasks.length, 0),
    139,
  );
  assert.equal(
    allEnglishContent.reduce((sum, item) => sum + item.expressions.length, 0),
    65,
  );
});

test("all six revised narratives still close through the real progress engine at every difficulty", () => {
  const now = new Date("2026-10-15T09:00:00Z");
  for (const level of ["starter", "standard", "challenge"]) {
    let progress = emptyEnglishProgress();
    for (const episode of englishEpisodes) {
      for (const item of episode.tasks) {
        const version = item.versions[level];
        const result = advanceEnglishProgress(
          progress,
          {
            episodeId: episode.id,
            taskId: item.id,
            level,
            ...(item.skill === "speaking"
              ? { selfConfirmed: true }
              : { answer: version.correctOption || version.model }),
          },
          episode,
          now,
        );
        assert.equal(result.correct, true, `${item.id}/${level}: story dead end`);
        assert.equal(result.consequence, item.consequence);
        progress = result.progress;
      }
      assert.equal(progress.episodes[episode.id].completedAt, now.toISOString());
    }
    assert.equal(Object.keys(progress.episodes).length, 6);
    assert.equal(progress.learnedExpressionIds.length, 33);
  }
});

test("the bookshop gives a reason to cooperate without trapping the visitor or choosing the book before its clue activity", () => {
  const episode = story("closed-bookshop");
  assert.match(episode.intro, /초록색 비상문은 안에서 언제든/);
  assert.match(episode.intro, /지붕 없는 안뜰/);
  assert.match(episode.intro, /책을 젖지 않게/);
  assert.doesNotMatch(episode.chapters[1].story, /파란.*도서관|도서관.*파란/);
  assert.match(episode.chapters[1].story, /반납표.*이름.*장소/);
  assert.match(task(episode.id, "bookshop-find-book").consequence, /파란 도서관 책/);
  assert.match(task(episode.id, "bookshop-confirm-label").consequence, /하나.*함께.*맞는 책/);
  assert.match(episode.ending, /조에게 책을 건넸[\s\S]*마지막 낭독.*시작/);
  assert.match(episode.ending, /다음 날 박물관[\s\S]*먼저 갈 길을 물어/);
});

test("the bag story preserves staff authority, owner verification, sealed delivery, and the recipient's own reading", () => {
  const episode = story("locker-seven");
  assert.match(episode.chapters[0].story, /가방 안의 확인은 미나가/);
  assert.match(episode.chapters[1].story, /단서가 맞는 것.*주인이 확인된 것.*다른/);
  assert.match(
    task(episode.id, "locker-report").consequence,
    /바로 돌려주지 않고[\s\S]*주인을 확인/,
  );
  assert.match(
    task(episode.id, "locker-owner-check").consequence,
    /초록색 공책[\s\S]*주인 확인[\s\S]*B 가방/,
  );
  assert.match(
    task(episode.id, "locker-letter-permission").consequence,
    /레나가 카이에게 가져다줘도 된다고/,
  );
  assert.match(episode.chapters[2].story, /동료에게 안내소를 맡긴 뒤/);
  assert.match(episode.ending, /15시 20분[\s\S]*B 가방/);
  assert.match(episode.ending, /2번 승강장 파란 벤치/);
  assert.match(episode.ending, /카이는 혼자 편지를 읽고/);
});

test("the post-office second chapter starts before departure, and asking again causes the boat journey to advance", () => {
  const episode = story("moonlight-post");
  assert.match(episode.intro, /흰 등불 배.*동쪽 등대/);
  assert.match(episode.intro, /호박빛 등불 배.*사과 과수원/);
  assert.match(episode.intro, /두 번째 종[\s\S]*해가 뜨면 다음 밤까지/);
  assert.match(episode.chapters[1].story, /배가 떠나는 때는 아직 아니/);
  assert.match(episode.chapters[1].storyEn, /before boarding/);
  assert.doesNotMatch(episode.chapters[1].story, /배가 떠나자|출항한 뒤|이미 떠/);
  const departure = task(episode.id, "moonpost-repeat-plan").consequence;
  assert.match(departure, /안내를 다시 들려[\s\S]*두 번째 종[\s\S]*흰 등불 배가 떠나/);
  assert.match(episode.ending, /축제에 쓸 종이를 준비/);
  assert.match(episode.ending, /다음 편지는 과수원행[\s\S]*호박빛 등불 배/);
  assert.doesNotMatch(episode.intro + episode.ending, /세 번째 종|주문을 외우면|비밀 암호/);
});

test("café preparations stay pending in chapter introductions, with verified changes and a welcoming response in consequences", () => {
  const episode = story("raincheck-cafe");
  assert.doesNotMatch(episode.chapters[0].story, /여섯|4시|5시|뒤쪽 창가/);
  assert.match(episode.chapters[0].story, /허락한 자리[\s\S]*인원과 시간/);
  assert.match(task(episode.id, "cafe-correct-booking").consequence, /여섯 명, 4시부터 5시까지/);
  assert.match(
    task(episode.id, "cafe-manager-result").consequence,
    /준비하지 않기로[\s\S]*물은 세 잔[\s\S]*간식과 물병/,
  );
  assert.match(episode.chapters[2].story, /3시 20분[\s\S]*3시 45분/);
  assert.match(task(episode.id, "cafe-invite-sam").consequence, /샘이 카페로 가겠다고 답/);
  assert.match(
    task(episode.id, "cafe-welcome-choice").consequence,
    /노라가 고맙다며[\s\S]*4시, 여섯 사람/,
  );
  assert.match(episode.ending, /물 세 잔과 레모네이드 두 잔/);
  assert.match(episode.ending, /노라는 자기 간식과 물병/);
});

test("the radio resolves a source-date misunderstanding while retaining both event records and not blaming the listener", () => {
  const episode = story("midnight-radio");
  assert.match(episode.chapters[0].story, /오늘.*날짜[\s\S]*녹음한 날이 따로/);
  assert.match(episode.chapters[1].story, /2026년 11월 6일[\s\S]*5시[\s\S]*3시 30분/);
  assert.match(episode.chapters[2].story, /5시 20분[\s\S]*5시 30분/);
  assert.match(episode.chapters[2].story, /질문한 사람을 탓하지 않고/);
  assert.match(episode.ending, /2026년 11월 6일[\s\S]*6시 동부공원 동문[\s\S]*2019년 11월 8일/);
  assert.match(episode.ending, /옛 방송도 지우지 않고/);
});

test("the garden checks the route and tool before fetching, and records individual care before passing it to the next visitor", () => {
  const episode = story("glasshouse-garden");
  assert.doesNotMatch(episode.chapters[0].story, /남쪽 길|파란.*물뿌리개/);
  assert.match(episode.chapters[0].story, /1시 50분[\s\S]*지금 갈 수 있는 길/);
  assert.match(task(episode.id, "garden-route-message").consequence, /남쪽 길[\s\S]*파란 물뿌리개/);
  assert.match(episode.chapters[1].story, /C의 글자는 흐려[\s\S]*물.*주기 전에 에이다/);
  assert.match(episode.chapters[2].story, /2시 40분[\s\S]*마지막 정리/);
  assert.match(
    episode.ending,
    /A에 100mL를 한 번[\s\S]*B는 축축해 물을 더 주지[\s\S]*C는 에이다가 확인/,
  );
  assert.match(episode.ending, /파란 물뿌리개도 도구 선반/);
  assert.match(task(episode.id, "garden-explain-care").consequence, /핀이[\s\S]*다른 화분도 먼저/);
});

test("all revised narrative pairs are translated without overriding the unchanged teaching passages", () => {
  assert.equal(Object.keys(polishDictionary).length, 132);
  for (const episode of englishEpisodes) {
    for (const chapter of episode.chapters) {
      assert.equal(messages[normalize(chapter.story)], chapter.storyEn);
      for (const line of chapter.dialogue) assert.equal(messages[normalize(line.ko)], line.en);
    }
    for (const item of episode.tasks) {
      assert.ok(messages[normalize(item.consequence)]);
      for (const version of Object.values(item.versions))
        assert.equal(messages[normalize(version.translation)], version.passage);
    }
    for (const person of episode.cast) assert.ok(messages[normalize(person.motivation)]);
    for (const field of ["intro", "ending", "takeaway"])
      assert.ok(messages[normalize(episode[field])]);
  }
  for (const [ko, en] of Object.entries(polishDictionary)) {
    assert.match(ko, /[가-힣]/);
    assert.doesNotMatch(en, /[가-힣ぁ-んァ-ヶ]/);
    assert.doesNotMatch(ko, /[ぁ-んァ-ヶ]/);
  }
});
