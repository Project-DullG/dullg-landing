import assert from "node:assert/strict";
import { test } from "node:test";
import {
  englishPracticePacks,
  getEnglishPracticePack,
  practiceCollections,
  practiceEnglishDictionary,
} from "../lib/english/practice.ts";
import { getEnglishEpisode, getEnglishExpression } from "../lib/english/catalog.ts";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  englishAnswerAccepted,
  getEnglishGrowth,
} from "../lib/english/progress.ts";

const now = new Date("2026-10-14T09:00:00Z");
const levels = ["starter", "standard", "challenge"];
const pack = (id) => getEnglishPracticePack(id);
const task = (id, suffix) => pack(id).tasks.find((item) => item.id === `${id}-${suffix}`);
const normal = (value) => value.replace(/\s+/g, " ").trim();
function attempt(episode, item, level) {
  const version = item.versions[level];
  return {
    episodeId: episode.id,
    taskId: item.id,
    level,
    ...(item.skill === "speaking"
      ? { selfConfirmed: true }
      : {
          answer:
            version.correctOption || (version.tokens ? version.tokens.join(" ") : version.model),
        }),
  };
}

for (const level of levels) {
  test(`all 18 practice packs are completable with real answers at ${level}`, () => {
    let progress = emptyEnglishProgress();
    for (const episode of englishPracticePacks) {
      assert.equal(episode.format, "practice");
      assert.equal(episode.tasks.length, 4);
      for (const item of episode.tasks) {
        const result = advanceEnglishProgress(
          progress,
          attempt(episode, item, level),
          episode,
          now,
        );
        assert.equal(result.correct, true, `${item.id}/${level}: practice dead end`);
        assert.equal(result.duplicate, false);
        progress = result.progress;
      }
      assert.equal(progress.episodes[episode.id].completedAt, now.toISOString());
      assert.equal(progress.episodes[episode.id].format, "practice");
    }
    assert.equal(progress.xp, 1980);
    assert.deepEqual(progress.skills, { reading: 6, listening: 12, writing: 30, speaking: 24 });
    assert.equal(progress.learnedExpressionIds.length, 30);
    const growth = getEnglishGrowth(progress, now);
    assert.equal(growth.completedEpisodes, 0, "practice packs must not inflate story completion");
    assert.equal(growth.completedPractices, 18);
  });
}

test("sentence chunks produce the promised sentence, and reversed orders cannot complete an assembly task", () => {
  let assembled = 0;
  for (const episode of englishPracticePacks.filter((item) => item.practiceFormat === "sentence")) {
    for (const level of levels) {
      let progress = emptyEnglishProgress();
      for (const item of episode.tasks) {
        const version = item.versions[level];
        if (version.tokens) {
          assembled++;
          assert.equal(
            version.tokens.join(" "),
            version.model,
            `${item.id}: chunks changed the target`,
          );
          assert.equal(englishAnswerAccepted(version.tokens.join(" "), version), true);
          const reversed = [...version.tokens].reverse().join(" ");
          assert.notEqual(reversed, version.model);
          assert.equal(
            englishAnswerAccepted(reversed, version),
            false,
            `${item.id}: reverse order accepted`,
          );
          const failed = advanceEnglishProgress(
            progress,
            { ...attempt(episode, item, level), answer: reversed },
            episode,
            now,
          );
          assert.equal(failed.correct, false);
          assert.equal(failed.progress, progress);
          const swapped = [...version.tokens];
          [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
          assert.equal(
            englishAnswerAccepted(swapped.join(" "), version),
            false,
            `${item.id}: misplaced chunks accepted`,
          );
        }
        progress = advanceEnglishProgress(
          progress,
          attempt(episode, item, level),
          episode,
          now,
        ).progress;
      }
    }
  }
  assert.equal(assembled, 54);
});

test("sentence difficulty changes support rather than secretly changing the practiced expression", () => {
  for (const episode of englishPracticePacks.filter((item) => item.practiceFormat === "sentence")) {
    for (const item of episode.tasks.filter((t) => t.versions.starter.tokens)) {
      assert.equal(item.versions.starter.starter, item.versions.starter.tokens[0]);
      assert.equal(item.versions.standard.starter, undefined);
      assert.equal(item.versions.challenge.starter, undefined);
      assert.equal(new Set(levels.map((level) => item.versions[level].model)).size, 1);
      assert.deepEqual(item.versions.standard.tokens, item.versions.challenge.tokens);
    }
  }
});

test("updated conversations require the final gate, time, place, portion, and condition rather than obsolete information", () => {
  const missing = {
    "conversation-airport": [
      "I'll go to Gate 14.",
      "Boarding is at 3:20.",
      "I'll go to Gate 12 at 3:20.",
    ],
    "conversation-hotel": ["Breakfast is from 7 to 10 a.m.", "Breakfast is served downstairs."],
    "conversation-cafe": [
      "A small portion in a large cup is fine.",
      "A small portion at the same price is fine.",
    ],
    "conversation-meeting": [
      "I'll join online on Friday.",
      "I'll attend on Friday at 11 a.m.",
      "I'll join online on Friday at 10 a.m.",
    ],
    "conversation-library": [
      "I'll return it by Friday.",
      "I'll use the drop box.",
      "I'll return it using the drop box.",
    ],
    "conversation-plans": ["Let's meet at the cafe on Saturday.", "Let's meet at two on Saturday."],
  };
  for (const [id, answers] of Object.entries(missing))
    for (const level of levels) {
      const version = task(id, "update").versions[level];
      assert.equal(
        englishAnswerAccepted(version.model, version),
        true,
        `${id}/${level}: published reply rejected`,
      );
      for (const answer of answers)
        assert.equal(englishAnswerAccepted(answer, version), false, `${id}/${level}: ${answer}`);
    }
});

test("conversation checks preserve chronological and quantity roles, rather than just matching the same words", () => {
  for (const level of levels) {
    const hotel = task("conversation-hotel", "update").versions[level];
    assert.equal(englishAnswerAccepted("Breakfast is downstairs from 10 to 7 a.m.", hotel), false);
    assert.equal(
      englishAnswerAccepted("Breakfast is downstairs from seven to ten in the morning.", hotel),
      true,
    );
    const cafe = task("conversation-cafe", "update").versions[level];
    assert.equal(
      englishAnswerAccepted("A large portion in a small cup at the same price is fine.", cafe),
      false,
    );
    assert.equal(
      englishAnswerAccepted("A small portion in a large cup for the same price is fine.", cafe),
      true,
    );
  }
});

// Facts needed by the questions must remain explicit when text gets shorter.
// These assertions caught a Starter answer that originally inferred permission
// from merely being told a price; the missing condition now appears in the text.
const readingEvidence = {
  "reading-repair": [
    /library/i,
    /Saturday/i,
    /(?:cost|price)/i,
    /(?:permission|agree|consent)/i,
    /(?:free|cost money)/i,
  ],
  "reading-library": [
    /one tool/i,
    /seven days/i,
    /(?:reservation|reserve)/i,
    /free/i,
    /(?:staff member|staff)/i,
  ],
  "reading-walk": [/Sunday/i, /nine/i, /short route/i, /ramp/i, /benches/i, /(?:stairs|steps)/i],
  "reading-market": [
    /container/i,
    /empty weight|empty container/i,
    /(?:content|food)/i,
    /(?:weight|weighed)/i,
  ],
  "reading-notice": [
    /Monday/i,
    /two/i,
    /Thursday/i,
    /three/i,
    /(?:place is unchanged|without changing its location)/i,
  ],
  "reading-quiet": [
    /green room/i,
    /quiet/i,
    /corridor/i,
    /blue room/i,
    /book/i,
    /(?:talk|conversation|discussion)/i,
  ],
};

test("each reading has genuinely different level texts while preserving the facts needed for the same answer", () => {
  for (const [id, evidence] of Object.entries(readingEvidence)) {
    const item = task(id, "read");
    assert.equal(
      new Set(levels.map((level) => item.versions[level].passage)).size,
      3,
      `${id}: duplicate level text`,
    );
    assert.equal(new Set(levels.map((level) => item.versions[level].correctOption)).size, 1);
    for (const level of levels) {
      const version = item.versions[level];
      for (const fact of evidence)
        assert.match(version.passage, fact, `${id}/${level}: lost source evidence ${fact}`);
      assert.equal(
        version.options.find((option) => option.id === version.correctOption).text,
        version.model,
      );
    }
    assert.ok(item.versions.starter.passage.length < item.versions.standard.passage.length);
    assert.ok(item.versions.standard.passage.length < item.versions.challenge.passage.length);
  }
});

test("reading choices do not reward unsupported permissions or conditions", () => {
  const unsupported = {
    "reading-repair": ["Buy it without asking.", "Reject every item."],
    "reading-library": ["Put it in the book box.", "Leave it outside overnight."],
    "reading-walk": ["Only hill steps.", "A different starting time."],
    "reading-market": ["So every jar receives a discount.", "So all stalls must accept it."],
    "reading-notice": ["Two o'clock.", "The place has changed."],
    "reading-quiet": ["The green room without a booking.", "Any empty seat."],
  };
  for (const [id, answers] of Object.entries(unsupported))
    for (const level of levels) {
      const episode = pack(id),
        item = task(id, "read"),
        version = item.versions[level];
      for (const answer of answers) {
        const wrong = version.options.find((option) => option.text === answer);
        assert.ok(wrong, `${id}: missing reviewable distractor`);
        const result = advanceEnglishProgress(
          emptyEnglishProgress(),
          { episodeId: id, taskId: item.id, level, answer: wrong.id },
          episode,
          now,
        );
        assert.equal(result.correct, false, `${id}/${level}: unsupported inference accepted`);
        assert.equal(result.progress.xp, 0);
        assert.deepEqual(result.progress.learnedExpressionIds, []);
      }
    }
});

test("listening instructions do not print the answer, and all three response positions are used", () => {
  const positions = { conversation: new Set(), reading: new Set() };
  for (const episode of englishPracticePacks)
    for (const item of episode.tasks.filter((t) => t.skill === "listening")) {
      const version = item.versions.standard;
      const contextEn = practiceEnglishDictionary[item.context] || item.context;
      const promptEn = practiceEnglishDictionary[version.prompt] || version.prompt;
      const modelEn = practiceEnglishDictionary[version.model] || version.model;
      for (const instruction of [item.context, contextEn, version.prompt, promptEn]) {
        assert.ok(
          !normal(instruction).toLowerCase().includes(normal(version.passage).toLowerCase()),
          `${item.id}: transcript exposed as an instruction`,
        );
        assert.ok(
          !normal(instruction).toLowerCase().includes(normal(modelEn).toLowerCase()),
          `${item.id}: answer exposed as an instruction`,
        );
      }
      assert.equal(version.options.length, 3);
      assert.equal(new Set(version.options.map((option) => option.text)).size, 3);
      for (const option of version.options) {
        const label = practiceEnglishDictionary[option.text] || option.text;
        assert.ok(label.length > 4, `${item.id}: empty or dummy distractor`);
        assert.doesNotMatch(
          label,
          /all of the above|none of the above|option [abc123]|correct answer|dummy/i,
        );
      }
      positions[episode.practiceFormat].add(
        version.options.findIndex((option) => option.id === version.correctOption),
      );
    }
  assert.equal(positions.conversation.size, 3);
  assert.equal(positions.reading.size, 3);
});

test("every practice target resolves through the shared content catalogue and remains locally linked", () => {
  assert.equal(englishPracticePacks.length, 18);
  for (const format of ["sentence", "conversation", "reading"])
    assert.equal(englishPracticePacks.filter((item) => item.practiceFormat === format).length, 6);
  const ids = new Set(),
    taskIds = new Set(),
    expressionIds = new Set();
  for (const episode of englishPracticePacks) {
    assert.ok(!ids.has(episode.id));
    ids.add(episode.id);
    assert.equal(getEnglishPracticePack(episode.id), episode);
    assert.equal(getEnglishEpisode(episode.id), episode);
    assert.equal(
      episode.chapters,
      undefined,
      "practice does not require a fictional chapter structure",
    );
    for (const expression of episode.expressions) {
      assert.ok(!expressionIds.has(expression.id));
      expressionIds.add(expression.id);
      assert.equal(getEnglishExpression(expression.id), expression);
      assert.ok(episode.tasks.some((item) => item.expressionIds.includes(expression.id)));
    }
    for (const item of episode.tasks) {
      assert.ok(!taskIds.has(item.id));
      taskIds.add(item.id);
      for (const id of item.expressionIds)
        assert.ok(episode.expressions.some((expression) => expression.id === id));
    }
  }
  assert.equal(taskIds.size, 72);
  assert.equal(expressionIds.size, 30);
  assert.equal(getEnglishPracticePack("missing-practice-pack"), undefined);
});

test("all practice text, choice labels, meaning cues, and dynamic metadata titles have English mappings", () => {
  const dictionary = Object.fromEntries(
    Object.entries(practiceEnglishDictionary).map(([key, value]) => [normal(key), value]),
  );
  const missing = [];
  function walk(value, path) {
    if (typeof value === "string" && /[가-힣]/.test(value)) {
      const translated = dictionary[normal(value)];
      if (!translated || /[가-힣]/.test(translated)) missing.push(path);
    } else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${path}.${i}`));
    else if (value && typeof value === "object")
      for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`);
  }
  walk(englishPracticePacks, "practice");
  walk(practiceCollections, "collections");
  assert.deepEqual(missing, []);
  for (const episode of englishPracticePacks) {
    assert.equal(
      dictionary[normal(`${episode.title} · 영어 연습`)],
      `${episode.englishTitle} · English practice`,
    );
    for (const item of episode.tasks)
      for (const level of levels) {
        const version = item.versions[level];
        if (!/[가-힣]/.test(version.passage))
          assert.equal(
            dictionary[normal(version.translation)],
            version.passage,
            `${item.id}: bilingual source changed meaning`,
          );
        if (version.tokens)
          assert.equal(
            dictionary[normal(version.passage)],
            version.model,
            `${item.id}: assembly meaning differs from its model`,
          );
      }
    for (const expression of episode.expressions)
      assert.equal(dictionary[normal(expression.ko)], expression.en);
  }
});
