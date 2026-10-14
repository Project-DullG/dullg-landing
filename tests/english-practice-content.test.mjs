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
  test(`all 19 practice packs are completable with real answers at ${level}`, () => {
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
    assert.equal(progress.xp, 2090);
    assert.deepEqual(progress.skills, { reading: 7, listening: 13, writing: 32, speaking: 24 });
    assert.equal(progress.learnedExpressionIds.length, 32);
    const growth = getEnglishGrowth(progress, now);
    assert.equal(growth.completedEpisodes, 0, "practice packs must not inflate story completion");
    assert.equal(growth.completedPractices, 19);
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
  assert.equal(assembled, 57);
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

test("relationship comparison and listening keep the desiring person, acting person, sender, and recipient distinct", () => {
  const episode = pack("sentence-relationships");
  const compare = episode.tasks.find((item) => item.id === "relationship-compare");
  const receiver = episode.tasks.find((item) => item.id === "relationship-receiver");
  const build = episode.tasks.find((item) => item.id === "relationship-build");
  assert.equal(compare.skill, "reading");
  assert.equal(receiver.skill, "listening");
  assert.equal(build.skill, "writing");
  assert.equal(new Set(levels.map((level) => compare.versions[level].passage)).size, 3);
  const mapped = (ko) => practiceEnglishDictionary[ko] || ko;
  for (const level of levels) {
    const first = compare.versions[level];
    for (const sentence of ["Riley wants to check the map", "Riley wants Sam to check the map"]) {
      assert.ok(first.passage.includes(sentence), `${level}: comparison lost an actor`);
      assert.ok(
        mapped(first.translation).includes(sentence),
        `${level}: bilingual comparison lost an actor`,
      );
    }
    assert.equal(first.options.find((option) => option.id === first.correctOption).text, "Sam.");
    assert.deepEqual(Object.fromEntries(first.structure.map((part) => [part.role, part.text])), {
      subject: "Riley",
      action: "wants",
      person: "Sam",
      purpose: "to check the map.",
    });
    assert.equal(
      mapped(first.structure.find((part) => part.role === "person").label),
      "The person who would do it",
    );
    let progress = emptyEnglishProgress();
    for (const wrong of first.options.filter((option) => option.id !== first.correctOption)) {
      const result = advanceEnglishProgress(
        progress,
        { episodeId: episode.id, taskId: compare.id, level, answer: wrong.id },
        episode,
        now,
      );
      assert.equal(result.correct, false, `${level}: wrong acting person accepted`);
      assert.equal(result.progress, progress);
    }
    progress = advanceEnglishProgress(
      progress,
      attempt(episode, compare, level),
      episode,
      now,
    ).progress;
    const heard = receiver.versions[level];
    assert.equal(heard.passage, "We sent the parcel to Nia.");
    assert.equal(mapped(heard.translation), heard.passage);
    assert.equal(
      heard.options.find((option) => option.id === heard.correctOption).text,
      "Who did you send the parcel to?",
    );
    assert.deepEqual(Object.fromEntries(heard.structure.map((part) => [part.role, part.text])), {
      subject: "We",
      action: "sent the parcel",
      person: "to Nia.",
    });
    assert.equal(
      mapped(heard.structure.find((part) => part.role === "person").label),
      "The recipient",
    );
    assert.ok(heard.options.some((option) => option.text === "Who sent the parcel to you?"));
    assert.ok(heard.options.some((option) => option.text === "What did you send to Nia?"));
    for (const wrong of heard.options.filter((option) => option.id !== heard.correctOption)) {
      const result = advanceEnglishProgress(
        progress,
        { episodeId: episode.id, taskId: receiver.id, level, answer: wrong.id },
        episode,
        now,
      );
      assert.equal(
        result.correct,
        false,
        `${level}: sender or item question accepted as recipient question`,
      );
      assert.equal(result.progress, progress);
    }
    const assembled = build.versions[level];
    assert.deepEqual(
      Object.fromEntries(assembled.structure.map((part) => [part.role, part.text])),
      {
        subject: "I",
        action: "'d like",
        person: "you",
        purpose: "to check the address.",
      },
    );
    assert.equal(mapped(assembled.translation), assembled.model);
    assert.equal(
      englishAnswerAccepted("I'd like to check your address.", assembled),
      false,
      "the speaker checking is different from requesting the listener to check",
    );
    assert.equal(
      mapped(episode.tasks.at(-1).versions[level].translation),
      episode.tasks.at(-1).versions[level].model,
    );
  }
});

test("relationship requests preserve who is being asked, what they should check, and the requested object", () => {
  const episode = pack("sentence-relationships");
  assert.ok(episode, "the relationship practice must be available");
  assert.deepEqual(
    episode.tasks.map((item) => item.id),
    ["relationship-compare", "relationship-receiver", "relationship-build", "relationship-request"],
  );
  const request = episode.tasks.at(-1);
  assert.equal(request.skill, "writing");
  for (const level of levels) {
    const version = request.versions[level];
    for (const answer of [
      "Please ask Nia to check the address.",
      "Could you ask Nia to check the address?",
      "Ask Nia to check the address, please.",
    ]) {
      assert.equal(
        englishAnswerAccepted(answer, version),
        true,
        `${level}: equivalent request rejected`,
      );
    }
    const wrongRoles = [
      "I will check Nia's address.",
      "Nia will ask me to check the address.",
      "Please ask me to check Nia's address.",
      "Please ask Nia about the address.",
      "Please ask Nia to check the name.",
      "Please don't ask Nia to check the address.",
    ];
    let progress = emptyEnglishProgress();
    for (const item of episode.tasks.slice(0, -1)) {
      const result = advanceEnglishProgress(progress, attempt(episode, item, level), episode, now);
      assert.equal(result.correct, true);
      progress = result.progress;
    }
    for (const answer of wrongRoles) {
      assert.equal(
        englishAnswerAccepted(answer, version),
        false,
        `${level}: changed relationship accepted: ${answer}`,
      );
      const result = advanceEnglishProgress(
        progress,
        { ...attempt(episode, request, level), answer },
        episode,
        now,
      );
      assert.equal(result.correct, false);
      assert.equal(result.progress, progress, "wrong actor or purpose must not advance practice");
    }
    const result = advanceEnglishProgress(
      progress,
      { ...attempt(episode, request, level), answer: "Could you ask Nia to check the address?" },
      episode,
      now,
    );
    assert.equal(result.correct, true);
    assert.equal(result.progress.episodes[episode.id].completedAt, now.toISOString());
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
  const positions = { conversation: new Set(), reading: new Set(), sentence: new Set() };
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
  assert.equal(englishPracticePacks.length, 19);
  for (const [format, count] of [
    ["sentence", 7],
    ["conversation", 6],
    ["reading", 6],
  ])
    assert.equal(
      englishPracticePacks.filter((item) => item.practiceFormat === format).length,
      count,
    );
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
  assert.equal(taskIds.size, 76);
  assert.equal(expressionIds.size, 32);
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
        // Relationship tasks translate the target sentence separately from their
        // English instructions; their actors and meanings are checked above.
        if (!/[가-힣]/.test(version.passage) && episode.id !== "sentence-relationships")
          assert.equal(
            dictionary[normal(version.translation)],
            version.passage,
            `${item.id}: bilingual source changed meaning`,
          );
        if (version.tokens) {
          assert.equal(
            dictionary[normal(version.translation)],
            version.model,
            `${item.id}: assembly meaning differs from its model`,
          );
          if (/[가-힣]/.test(version.passage)) {
            assert.equal(dictionary[normal(version.passage)], version.model);
          }
        }
      }
    for (const expression of episode.expressions)
      assert.equal(dictionary[normal(expression.ko)], expression.en);
  }
});
