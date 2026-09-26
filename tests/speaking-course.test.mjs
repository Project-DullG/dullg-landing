import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../lib/speaking/catalog/speaking/content.ts";
import { courses } from "../lib/speaking/catalog/speaking/courses.ts";
import {
  pronunciationFor,
  pronunciationSentences,
} from "../lib/speaking/catalog/speaking/pronunciation-guides.ts";
import { patternFor } from "../lib/speaking/catalog/speaking/learning.ts";
import { quizzes } from "../lib/speaking/catalog/fishing/quizzes.ts";
import previousPlans from "./fixtures/speaking-course-plans-v1.json" with { type: "json" };
import {
  emptyState,
  catches,
  stepsFor,
  studyIds,
  minutesForDay,
  reviewFor,
  clearedDays,
} from "../lib/speaking/catalog/fishing/model.ts";
import { applyCompletion } from "../lib/speaking/catalog/fishing/rules.ts";
import { buildStudySnapshot, studySelection } from "../lib/speaking/catalog/view.ts";

test("전체 64문항과 문장별 한글 안내는 영어 원문을 빠짐없이 한 번씩 표시한다", () => {
  assert.equal(questions.length, 64);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  for (const q of questions) {
    const sentences = pronunciationSentences(pronunciationFor(q));
    assert.equal(
      sentences.map((s) => s.english).join(" "),
      q.type === "read" ? q.passage : patternFor(q).example,
      q.id,
    );
    assert.ok(sentences.every((s) => s.hangul));
    assert.ok(
      questions.some((item) => item.id === q.transfer),
      q.id,
    );
  }
});
test("등록 안내의 a.m. 약어 뒤 장소를 같은 문장 아래 표시한다", () => {
  const q = questions.find((q) => q.id === "I01");
  const sentences = pronunciationSentences(pronunciationFor(q));
  assert.equal(sentences.length, 1);
  assert.equal(sentences[0].english, "Registration begins at nine a.m. in the main lobby.");
  assert.equal(
    sentences[0].hangul,
    pronunciationFor(q)
      .map((s) => s.hangul)
      .join(" "),
  );
});
test("7·14·30일의 모든 분량에 존재하는 문항만 연결한다", () => {
  assert.deepEqual(
    courses.map((c) => c.days.length),
    [7, 14, 30],
  );
  for (let day = 0; day < 30; day++)
    for (const minutes of [60, 90, 120]) {
      for (const step of stepsFor(day, undefined, minutes))
        assert.ok(questions.some((q) => q.id === step.questionId));
      assert.ok(quizzes[courses[2].days[day].ids[0]]);
    }
});
test("추가 연습 문항이 생겨도 기존에 시작한 코스의 90개 계획은 바뀌지 않는다", () => {
  for (const plan of previousPlans.plans)
    for (const minutes of [60, 90, 120])
      assert.deepEqual(studyIds(plan.day, minutes), plan.minutes[minutes]);
});
test("서버 순서 검사는 건너뛰기·거짓 완료·오답 보상을 차단하며 중복은 멱등 처리한다", () => {
  let state = emptyState();
  assert.throws(() => applyCompletion(state, { day: 1, step: 0, selfReport: true }));
  assert.throws(() => applyCompletion(state, { day: 0, step: 1, selfReport: true }));
  assert.throws(() => applyCompletion(state, { day: 0, step: 0, selfReport: false }));
  const input = { day: 0, step: 0, selfReport: true, minutes: 90 };
  state = applyCompletion(state, input).state;
  assert.equal(catches(state).length, 1);
  assert.equal(minutesForDay(state, 0, 120), 90);
  const again = applyCompletion(state, input);
  assert.equal(again.duplicate, true);
  assert.equal(again.state.events.length, 1);
});
test("30일을 모두 마치면 보상 150마리·별 30마리·12종이며 서버 응답에 퀴즈 정답은 없다", () => {
  let state = emptyState();
  for (let day = 0; day < 30; day++) {
    const resumed = studySelection(state);
    assert.equal(resumed.day, day, `진행 중 ${day + 1}일차로 재접속`);
    assert.ok(courses.find((c) => c.id === resumed.course).days.length > day);
    const minutes = [60, 90, 120][day % 3];
    const steps = stepsFor(day, reviewFor(state, day), minutes);
    for (let step = 0; step < steps.length; step++) {
      const quiz = quizzes[courses[2].days[day].ids[0]];
      if (steps[step].mode === "quiz") {
        const before = state.events.length;
        state = applyCompletion(state, { day, step, answer: (quiz.correct + 1) % 3 }).state;
        assert.equal(state.events.length, before);
      }
      state = applyCompletion(state, {
        day,
        step,
        minutes,
        selfReport: true,
        answer: quiz.correct,
        review: courses[2].days[day].ids[0],
      }).state;
    }
  }
  const fish = catches(state);
  assert.equal(clearedDays(state).length, 30);
  assert.equal(fish.length, 150);
  assert.equal(fish.filter((f) => f.star).length, 30);
  assert.equal(new Set(fish.map((f) => f.fish)).size, 12);
  const snapshot = buildStudySnapshot(state, studySelection(state, { course: "month", day: 29 }));
  assert.equal(snapshot.finished, true);
  assert.equal("correct" in snapshot.quiz, false);
  assert.equal("explanation" in snapshot.quiz, false);
  assert.throws(() => studySelection(state, { day: 99 }));
  assert.throws(() => studySelection(state, { question: "missing" }));
  assert.throws(() => studySelection(state, { course: "missing" }));
});
