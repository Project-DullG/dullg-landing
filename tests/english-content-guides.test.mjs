import assert from "node:assert/strict";
import { test } from "node:test";
import { allEnglishContent } from "../lib/english/catalog.ts";
import { englishDiscoveryLibrary } from "../lib/english/discovery-library.ts";
import {
  englishContentGuides,
  getEnglishContentGuide,
  guidesEnglishDictionary,
} from "../lib/english/content-guides.ts";
import { normalizeEnglishAnswer } from "../lib/english/progress.ts";

const levels = ["starter", "standard", "challenge"];
const sorted = (values) => [...values].sort();

test("all 25 registered contents have exactly one discoverable guide, without adding works or changing activities", () => {
  const contentSnapshot = structuredClone(allEnglishContent);
  assert.equal(allEnglishContent.length, 25);
  assert.equal(englishContentGuides.length, 25);
  assert.equal(new Set(englishContentGuides.map((item) => item.contentId)).size, 25);
  assert.deepEqual(
    sorted(englishContentGuides.map((item) => item.contentId)),
    sorted(allEnglishContent.map((item) => item.id)),
  );
  for (const content of allEnglishContent) {
    const guide = getEnglishContentGuide(content.id);
    assert.ok(guide);
    assert.equal(guide.contentId, content.id);
    assert.deepEqual(sorted(Object.keys(guide)), ["contentId", "fit", "goal", "sample", "tags"]);
    assert.equal(getEnglishContentGuide(content.id), guide);
  }
  assert.equal(getEnglishContentGuide("missing-content"), undefined);
  assert.deepEqual(
    allEnglishContent,
    contentSnapshot,
    "reading guides must not alter the registry or activity order",
  );
});

test("learning-area tags describe actual activities, including the limited skill sets in sentence and conversation practice", () => {
  for (const content of allEnglishContent) {
    const guide = getEnglishContentGuide(content.id);
    const actualSkills = new Set(content.tasks.map((task) => task.skill));
    assert.equal(new Set(guide.tags).size, guide.tags.length);
    assert.deepEqual(
      sorted(guide.tags),
      sorted(actualSkills),
      `${content.id}: unsupported or missing learning-area label`,
    );
  }
  assert.deepEqual(sorted(getEnglishContentGuide("sentence-requests").tags), [
    "speaking",
    "writing",
  ]);
  assert.deepEqual(sorted(getEnglishContentGuide("sentence-relationships").tags), [
    "listening",
    "reading",
    "writing",
  ]);
  assert.deepEqual(sorted(getEnglishContentGuide("conversation-airport").tags), [
    "listening",
    "speaking",
    "writing",
  ]);
});

test("every preview has two distinct English sentences with progressively longer support, plus complete Korean and English metadata", () => {
  let pairCount = 0;
  for (const guide of englishContentGuides) {
    assert.deepEqual(sorted(Object.keys(guide.sample)), sorted(levels));
    assert.equal(new Set(levels.map((level) => guide.sample[level].en)).size, 3);
    const pairs = [guide.goal, guide.fit, ...levels.map((level) => guide.sample[level])];
    pairCount += pairs.length;
    for (const pair of pairs) {
      assert.match(pair.ko, /[가-힣]/);
      assert.doesNotMatch(pair.en, /[가-힣]/);
      assert.ok(pair.ko.trim() && pair.en.trim());
      assert.equal(
        guidesEnglishDictionary[pair.ko],
        pair.en,
        `${guide.contentId}: missing bilingual guidance`,
      );
      assert.doesNotMatch(
        `${pair.ko} ${pair.en}`,
        /\bCEFR\b|\b[ABC][12]\b|실력.*보장|점수.*보장|guaranteed (?:fluency|improvement)/i,
      );
    }
    const lengths = levels.map((level) => {
      const sample = guide.sample[level].en;
      assert.equal(
        sample.split(/(?<=[.!?])\s+/).length,
        2,
        `${guide.contentId}/${level}: the preview should stay at two sentences`,
      );
      return sample.split(/\s+/).length;
    });
    assert.ok(
      lengths[0] < lengths[1] && lengths[1] < lengths[2],
      `${guide.contentId}: difficulty samples differ in length`,
    );
  }
  assert.equal(pairCount, 125);
  assert.equal(Object.keys(guidesEnglishDictionary).length, 125);
});

// Authored semantic anchors, checked in all levels: longer wording may not
// silently change the people, objects, requested action, or example schedule.
const previewFacts = {
  "closed-bookshop": [/bookshop/i, /book/i, /nearby/i, /read/i, /listen/i],
  "locker-seven": [/two/i, /bags/i, /station/i, /staff/i, /record/i, /owner|owns/i, /one/i],
  "moonlight-post": [/young rabbit/i, /invitation/i, /grandmother/i, /night/i, /post office/i],
  "raincheck-cafe": [/rain/i, /reading group/i, /café/i, /prepar|ready/i, /guest/i],
  "midnight-radio": [/old(?:er)? recording/i, /new/i, /notice/i, /date/i, /current/i],
  "glasshouse-garden": [/garden/i, /visitor/i, /notes/i, /staff/i, /prepar|ready/i],
  "conversation-airport": [/gate/i, /board/i, /\bten\b/i],
  "conversation-hotel": [/suitcase/i, /here/i, /collect/i, /lunch/i],
  "conversation-cafe": [/large/i, /ice(?:d)?/i, /coffee/i, /syrup/i, /leave out|without/i],
  "conversation-meeting": [/meet/i, /Tuesday/i, /home/i],
  "conversation-library": [/borrow/i, /guidebook/i, /return/i, /when/i],
  "conversation-plans": [/bakery/i, /Sunday/i, /eleven/i],
  "sentence-requests": [/bag/i, /help|hand/i, /carry/i, /by the door/i],
  "sentence-directions": [/museum/i, /opposite/i, /hotel/i, /straight/i],
  "sentence-plans": [/Wednesday/i, /five/i, /meet/i, /start|begin/i],
  "sentence-clarify": [/west entrance/i, /again|once more/i, /mean|referring/i],
  "sentence-preferences": [/sandwich/i, /warm/i, /tomato/i, /leave out|without/i],
  "sentence-reasons": [/hall/i, /nois/i, /outside/i, /bench/i],
  "sentence-relationships": [/Mina/i, /Leo/i, /window/i, /asks|asking|request/i],
  "reading-repair": [/lamp/i, /work/i, /cost/i, /before/i, /repair/i],
  "reading-library": [/telescope/i, /three days/i, /borrow/i, /return/i],
  "reading-walk": [/path/i, /flat|level ground/i, /stop/i, /rest/i],
  "reading-market": [/cloth bag/i, /apples/i, /carry/i, /use/i],
  "reading-notice": [/invitation/i, /concert/i, /Tuesday/i, /latest|most recent|newer/i],
  "reading-quiet": [/room/i, /video call/i, /book|reserve/i],
};

test("all three samples preserve each preview's communicative facts rather than introducing a different story or answer", () => {
  assert.deepEqual(
    sorted(Object.keys(previewFacts)),
    sorted(englishContentGuides.map((item) => item.contentId)),
  );
  for (const guide of englishContentGuides) {
    for (const level of levels) {
      for (const fact of previewFacts[guide.contentId]) {
        assert.match(
          guide.sample[level].en,
          fact,
          `${guide.contentId}/${level}: changed preview fact ${fact}`,
        );
      }
    }
  }
});

test("the fairy-tale preview describes the actual rabbit sender, rather than the fox postmaster", () => {
  const story = allEnglishContent.find((content) => content.id === "moonlight-post");
  assert.match(story.cast.find((character) => character.name === "미로").role, /토끼/);
  assert.match(story.cast.find((character) => character.name === "솔").role, /여우/);
  for (const level of levels) {
    const preview = getEnglishContentGuide(story.id).sample[level];
    assert.match(preview.en, /young rabbit/i);
    assert.match(preview.ko, /어린 토끼/);
    assert.doesNotMatch(preview.en, /young fox/i);
  }
});

test("previews do not copy authored models, accepted answers, or the answer to a story's first activity", () => {
  for (const content of allEnglishContent) {
    const guide = getEnglishContentGuide(content.id);
    for (const level of levels) {
      const preview = normalizeEnglishAnswer(guide.sample[level].en);
      for (const task of content.tasks) {
        const version = task.versions[level];
        const correctChoice = version.options?.find(
          (option) => option.id === version.correctOption,
        )?.text;
        const targets = [
          version.model,
          ...(version.accepted || []),
          ...(correctChoice ? [correctChoice] : []),
        ];
        for (const target of targets) {
          const normalized = normalizeEnglishAnswer(target);
          // Very short labels such as a person's name are covered by the
          // story-specific clue checks below, rather than substring guesses.
          if (normalized.length >= 12)
            assert.equal(
              preview.includes(normalized),
              false,
              `${content.id}/${level}: copied answer from ${task.id}`,
            );
        }
      }
    }
  }
});

const revealingStoryClues = {
  "closed-bookshop": /\b(?:Jo|Hana)\b|blue book|red lever|covered walkway|front door|on the right/i,
  "locker-seven":
    /\b(?:Lena|Kai|Mina)\b|silver star|lemon bun|15:20|bag b|green notebook|platform two|blue bench/i,
  "moonlight-post":
    /\b(?:Willow|Miro|Sol|Fern)\b|east lighthouse|white.lantern|second bell|shell.marked|stone path|clock tower|amber/i,
  "raincheck-cafe": /\b(?:Maya|Jun|Nora|six|four)\b|lemonade|back window|ingredients|equipment/i,
  "midnight-radio": /\b(?:2019|2026|November|six|eight)\b|east gate|north gate|east park/i,
  "glasshouse-garden":
    /\b(?:Ada|Finn)\b|south path|blue can|100\s*mL|one hundred|pot [abc]|courtyard shade|tool shelf/i,
};

test("story introductions withhold decisive clues and practice previews use parallel examples", () => {
  for (const [contentId, forbidden] of Object.entries(revealingStoryClues)) {
    for (const level of levels)
      assert.doesNotMatch(
        getEnglishContentGuide(contentId).sample[level].en,
        forbidden,
        `${contentId}/${level}: preview reveals a clue`,
      );
  }
  for (const level of levels) {
    const relationship = getEnglishContentGuide("sentence-relationships").sample[level].en;
    assert.doesNotMatch(relationship, /\b(?:Nia|Riley|Sam)\b|address|map|parcel/i);
    assert.doesNotMatch(
      relationship,
      /Leo (?:will open|opens)/i,
      "being asked to act must not guarantee that the action has happened",
    );
    assert.doesNotMatch(
      getEnglishContentGuide("reading-library").sample[level].en,
      /seven days|hand.*staff/i,
    );
    assert.doesNotMatch(
      getEnglishContentGuide("reading-notice").sample[level].en,
      /three o.clock|Thursday|Monday/i,
    );
    assert.doesNotMatch(
      getEnglishContentGuide("conversation-cafe").sample[level].en,
      /small portion|same price|large cup/i,
    );
  }
});

test("public discovery introductions and cast do not reveal the recipient, destination, route, or identifying marks", () => {
  const snapshot = structuredClone(allEnglishContent);
  const library = englishDiscoveryLibrary();
  const forbiddenPublicClues = {
    "closed-bookshop": /낭독실|마지막 이야기|조에게|파란 책|빨간 손잡이|오른쪽 통로/,
    "locker-seven": /은색 별|레몬 빵|15:20|B 가방|초록색 공책|레나|카이/,
    "moonlight-post": /윌로|동쪽 등대|조개 표지|돌길|흰 등불|두 번째 종/,
    "raincheck-cafe": /여섯|네 시|4시|창가|레모네이드/,
    "midnight-radio": /2019|2026|동쪽 입구|북쪽 입구|여섯 시/,
    "glasshouse-garden": /남쪽 길|파란 물뿌리개|100\s*mL|100밀리|백 밀리|화분 [ABC]/,
  };
  for (const [contentId, forbidden] of Object.entries(forbiddenPublicClues)) {
    const item = library.find((content) => content.id === contentId);
    const visible = [
      item.synopsis,
      ...item.cast.flatMap((person) => [person.name, person.role, person.motivation]),
    ].join(" ");
    assert.doesNotMatch(
      visible,
      forbidden,
      `${contentId}: public introduction gives away a decisive clue`,
    );
    assert.ok(item.cast.length > 0, `${contentId}: a helper still introduces the story`);
    assert.equal("tasks" in item, false);
    assert.equal("ending" in item, false);
  }
  assert.deepEqual(
    library.find((item) => item.id === "moonlight-post").cast.map((person) => person.name),
    ["솔"],
  );
  assert.deepEqual(
    library.find((item) => item.id === "closed-bookshop").cast.map((person) => person.name),
    ["하나"],
  );
  for (const contentId of ["closed-bookshop", "locker-seven", "moonlight-post", "raincheck-cafe"]) {
    assert.equal(
      library.find((item) => item.id === contentId).synopsis,
      getEnglishContentGuide(contentId).sample.standard.ko,
    );
  }
  assert.deepEqual(
    allEnglishContent,
    snapshot,
    "safe public copy must not rewrite original stories or cast",
  );
});
