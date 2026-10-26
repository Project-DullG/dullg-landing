import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS, SOLUTION, CREDITS, FINAL_EVIDENCE } from '../public/student-games/missing-log/content.mjs';
import { createGame, validState, visitLocation, answerLocation, useHint, setFinalAnswer, submitFinal, canSubmitFinal, restartGame } from '../public/student-games/missing-log/engine.mjs';

const solveSites = (order = LOCATIONS.map(location => location.id)) => order.reduce((state, id) => answerLocation(visitLocation(state, id), id, LOCATIONS.find(location => location.id === id).question.answerId), createGame(4));
const fillFinal = state => [['travelOrder', SOLUTION.travelOrder], ['exhibitionOrder', SOLUTION.exhibitionOrder], ['causeId', SOLUTION.causeId], ['evidenceIds', SOLUTION.evidenceIds], ['correctionId', SOLUTION.correctionId]].reduce((current, [field, value]) => setFinalAnswer(current, field, value), state);

test('학생 이름과 네 장소의 독립적인 자료·문제·힌트가 갖춰진다', () => {
  assert.deepEqual(CREDITS.students, ['손예령', '한효원']);
  assert.equal(LOCATIONS.length, 4);
  assert.equal(new Set(LOCATIONS.flatMap(location => location.documents.map(document => document.id))).size, 12);
  for (const location of LOCATIONS) {
    assert.equal(location.documents.length, 3);
    assert.equal(location.hints.length, 2);
    assert.equal(location.question.options.filter(option => option.id === location.question.answerId).length, 1);
    for (const id of location.question.evidenceIds) assert.ok(LOCATIONS.some(site => site.documents.some(document => document.id === id)));
  }
});

test('2–4명이 시작하며 원본 상태와 입력 배열을 바꾸지 않는다', () => {
  for (const count of [2, 3, 4]) assert.equal(validState(createGame(count)), true);
  for (const count of [1, 5, 2.5]) assert.throws(() => createGame(count));
  const state = createGame(2), copy = structuredClone(state), order = [...SOLUTION.travelOrder];
  const next = setFinalAnswer(visitLocation(state, 'nari'), 'travelOrder', order);
  order.reverse();
  assert.deepEqual(state, copy);
  assert.deepEqual(next.finalAnswer.travelOrder, SOLUTION.travelOrder);
});

test('네 장소의 조사 순서를 바꿔도 모두 완주할 수 있다', () => {
  for (const order of [['jeodong', 'samseonam', 'taeha', 'nari'], ['nari', 'taeha', 'samseonam', 'jeodong']]) {
    const state = solveSites(order);
    assert.deepEqual(state.visited, order);
    assert.equal(canSubmitFinal(state), true);
    const finished = submitFinal(fillFinal(state));
    assert.equal(finished.outcome, 'independent');
    assert.equal(validState(finished), true);
  }
});

test('오답은 탈락시키지 않으며 같은 장소에서 근거를 보고 수정한다', () => {
  let state = visitLocation(createGame(), 'jeodong');
  state = answerLocation(state, 'jeodong', 'same-person');
  assert.equal(state.answers.jeodong.correct, false);
  assert.equal(state.phase, 'investigation');
  assert.equal(canSubmitFinal(state), false);
  state = answerLocation(state, 'jeodong', 'writer-and-story');
  assert.equal(state.answers.jeodong.correct, true);
  assert.equal(state.answers.jeodong.attempts, 2);
  assert.equal(validState(state), true);
});

test('여섯 힌트 토큰 소진 후에도 두 무료 도움으로 조사를 계속한다', () => {
  let state = createGame();
  for (const location of LOCATIONS) {
    state = visitLocation(state, location.id);
    state = useHint(useHint(state, location.id), location.id);
    assert.equal(validState(state), true);
  }
  assert.equal(state.hintTokens, 0);
  assert.equal(state.freeHints, 2);
  assert.throws(() => useHint(state, 'jeodong'));
});

test('최종 제출은 질문 완료와 모든 답안 작성을 요구한다', () => {
  assert.throws(() => submitFinal(createGame()), /네 장소/);
  assert.throws(() => submitFinal(solveSites()), /모두 골라/);
  assert.throws(() => setFinalAnswer(createGame(), 'travelOrder', ['jeodong', 'jeodong']));
  assert.throws(() => answerLocation(createGame(), 'jeodong', 'writer-and-story'), /먼저/);
});

test('오류 원인과 근거를 정확히 대조하며 최종 재검토로 완성한다', () => {
  let state = fillFinal(solveSites());
  state = setFinalAnswer(state, 'evidenceIds', FINAL_EVIDENCE.map(option => option.id));
  state = submitFinal(state);
  assert.equal(state.finalFeedback.correct, false);
  assert.equal(state.finalFeedback.checks.evidence, false);
  assert.equal(state.phase, 'investigation');
  state = setFinalAnswer(state, 'evidenceIds', [...SOLUTION.evidenceIds].reverse());
  state = submitFinal(state);
  assert.equal(state.outcome, 'reviewed');
  assert.equal(state.finalAttempts, 2);
  assert.equal(validState(state), true);
  assert.throws(() => visitLocation(state, 'jeodong'));
});

test('방문 순서와 전시 순서를 혼동한 오답을 정답으로 처리하지 않는다', () => {
  let state = fillFinal(solveSites());
  state = setFinalAnswer(state, 'travelOrder', SOLUTION.exhibitionOrder);
  state = submitFinal(state);
  assert.equal(state.finalFeedback.checks.travelOrder, false);
  assert.equal(state.finalFeedback.checks.exhibitionOrder, true);
  assert.equal(state.outcome, null);
});

test('저장 복구와 재시작, 변조된 진행 거부를 확인한다', () => {
  const state = solveSites();
  assert.equal(validState(JSON.parse(JSON.stringify(state))), true);
  assert.deepEqual(restartGame(state), createGame(4));
  for (const edit of [state => { state.version = 2; }, state => { state.hintTokens = 99; }, state => { state.answers.jeodong.correct = false; }, state => { state.visited.push('unknown'); }, state => { state.phase = 'finished'; }, state => { state.finalAnswer.travelOrder = ['jeodong', 'jeodong']; }]) {
    const changed = structuredClone(state); edit(changed); assert.equal(validState(changed), false);
  }
});
