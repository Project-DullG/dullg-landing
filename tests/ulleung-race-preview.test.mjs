import test from 'node:test';
import assert from 'node:assert/strict';
import { previewMovement } from '../public/ulleung-marble/race/movement-preview.mjs';
import { createGame, validState, beginAction, rollMovement, assignDie } from '../public/ulleung-marble/race/engine.mjs';

const assignment = (racer, reduce = false) => ({ racer, reduce });
const input = (positions, plus, minus, assignments, mods = {}) => ({ positions, dice: { plus, minus }, assignments, mods });

function engineMovement({ positions, plusFace, minusFace, assignments, mods = {} }) {
  let state = createGame(4, { ordered: true });
  state.positions = [...positions];
  state.highWater = Math.max(0, ...positions);
  state.bettingOpen = state.highWater < 20;
  state.closedAt = state.bettingOpen ? null : { turn: 1, position: state.highWater };
  state = beginAction(state, 'move');
  state.mods = { ...mods };
  state = rollMovement(state, [plusFace], [minusFace]);
  const rolled = structuredClone(state);
  if (state.dice.minus) state = assignDie(state, 'minus', assignments.minus.racer, assignments.minus);
  if (state.dice.plus) state = assignDie(state, 'plus', assignments.plus.racer, assignments.plus);
  assert.equal(validState(state), true);
  return { state, preview: previewMovement({ positions, dice: rolled.dice, assignments, mods }) };
}

function compareWithEngine(options) {
  const { state, preview } = engineMovement(options);
  assert.deepEqual(preview.positions, state.positions);
  assert.deepEqual(preview.moves.map(({ group, from, to }) => ({ group, from, to })), state.animations.map(({ group, from, to }) => ({ group, from, to })));
  return { state, preview };
}

test('사동항의 다섯 말은 각각 출발하며 입력을 바꾸지 않는다', () => {
  const value = input([0, 0, 0, 0, 0], 3, 1, { minus: assignment(0), plus: assignment(1) });
  const before = structuredClone(value);
  const preview = previewMovement(value);
  assert.deepEqual(value, before);
  assert.deepEqual(preview.moves.map(move => move.group), [[0], [1]]);
  assert.deepEqual(preview.positions, [-1, 3, 0, 0, 0]);
  assert.equal(preview.complete, true);
  compareWithEngine({ positions: value.positions, plusFace: 3, minusFace: 3, assignments: value.assignments });
});

test('− 이동으로 합류한 무리는 + 이동 때 다시 계산한다', () => {
  const { preview } = compareWithEngine({ positions: [6, 6, 4, 12, 21], plusFace: 3, minusFace: 6, assignments: { minus: assignment(0), plus: assignment(2) } });
  assert.deepEqual(preview.moves.map(move => move.group), [[0, 1], [0, 1, 2]]);
  assert.deepEqual(preview.positions, [7, 7, 7, 12, 21]);
});

test('고른 말만 후진하면 무리를 나누고 + 이동은 남은 위치를 따른다', () => {
  const { preview } = compareWithEngine({ positions: [6, 6, 4, 12, 21], plusFace: 3, minusFace: 6, assignments: { minus: assignment(0), plus: assignment(1) }, mods: { minusSolo: true } });
  assert.deepEqual(preview.moves.map(move => move.group), [[0], [1]]);
  assert.deepEqual(preview.positions, [4, 9, 4, 12, 21]);
});

test('쉼터에서 후진 거리를 줄이며 0칸은 타일을 처리하지 않는다', () => {
  const { preview } = compareWithEngine({ positions: [16, 16, 1, 12, 21], plusFace: 2, minusFace: 3, assignments: { minus: assignment(0), plus: assignment(2) } });
  assert.equal(preview.moves.length, 1);
  assert.equal(preview.moves[0].sign, 'plus');
  assert.deepEqual(preview.positions, [16, 16, 3, 12, 21]);
  const ignored = compareWithEngine({ positions: [16, 16, 1, 12, 21], plusFace: 2, minusFace: 3, assignments: { minus: assignment(0), plus: assignment(2) }, mods: { ignoreShelter: true } }).preview;
  assert.deepEqual(ignored.moves[0].group, [0, 1]);
  assert.equal(ignored.moves[0].to, 15);
});

test('−2 뒤로는 가지 않으며 결승 44에서 멈춘다', () => {
  const { preview, state } = compareWithEngine({ positions: [-1, 42, 10, 12, 21], plusFace: 6, minusFace: 6, assignments: { minus: assignment(0), plus: assignment(1) } });
  assert.deepEqual(preview.positions, [-2, 44, 10, 12, 21]);
  assert.equal(preview.stopReason, 'finish');
  assert.equal(preview.complete, true);
  assert.equal(state.phase, 'finished');
});

test('−만 골라도 확정된 후진은 보이고 +는 배정 전까지 기다린다', () => {
  const preview = previewMovement(input([6, 6, 12, 21, 31], 3, 2, { minus: assignment(0), plus: null }));
  assert.deepEqual(preview.moves.map(move => move.sign), ['minus']);
  assert.deepEqual(preview.positions, [4, 4, 12, 21, 31]);
  assert.equal(preview.complete, false);
  assert.equal(preview.stopReason, 'awaiting-assignment');
  assert.deepEqual(preview.missingAssignments, ['plus']);
  const plusOnly = previewMovement(input([6, 6, 12, 21, 31], 3, 2, { minus: null, plus: assignment(1) }));
  assert.deepEqual(plusOnly.moves, []);
  assert.deepEqual(plusOnly.positions, [6, 6, 12, 21, 31]);
});

test('−가 0이면 + 배정만으로 미리보기와 엔진 결과가 일치한다', () => {
  const { preview } = compareWithEngine({ positions: [1, 3, 10, 12, 21], plusFace: 3, minusFace: 1, assignments: { minus: null, plus: assignment(0) } });
  assert.deepEqual(preview.moves.map(move => move.sign), ['plus']);
  assert.equal(preview.complete, true);
});

test('여기서 내려주세요의 한 칸 적게 이동을 적용한다', () => {
  const { preview } = compareWithEngine({ positions: [1, 10, 12, 21, 31], plusFace: 4, minusFace: 1, assignments: { minus: null, plus: assignment(0, true) }, mods: { flexPlus: true } });
  assert.equal(preview.moves[0].to, 4);
});

test('공개되지 않은 이벤트 뒤의 + 이동을 예상하지 않는다', () => {
  const { preview, state } = compareWithEngine({ positions: [6, 6, 10, 12, 21], plusFace: 3, minusFace: 3, assignments: { minus: assignment(0), plus: assignment(2) } });
  assert.equal(state.phase, 'event');
  assert.equal(preview.moves.length, 1);
  assert.equal(preview.stopReason, 'tile');
  assert.deepEqual(preview.stoppedAt, { sign: 'minus', position: 5, type: 'event' });
  assert.equal(preview.complete, false);
  assert.equal(preview.positions[2], 10);
});

test('아이템·갈림길·환승 도착 뒤에는 미리보기를 멈춘다', () => {
  for (const [from, type] of [[12, 'item'], [9, 'fork'], [28, 'transfer']]) {
    const preview = previewMovement(input([from, 1, 3, 12, 31], 2, 1, { minus: assignment(0), plus: assignment(1) }));
    assert.deepEqual(preview.stoppedAt, { sign: 'minus', position: from - 1, type });
    assert.equal(preview.moves.length, 1);
    assert.equal(preview.positions[1], 1);
  }
});

test('미리보기는 비밀 데이터나 아직 굴리지 않은 결과에 의존하지 않는다', () => {
  const publicInput = input([6, 6, 4, 12, 21], 3, 2, { minus: assignment(0), plus: assignment(2) });
  const expected = previewMovement(publicInput);
  assert.deepEqual(previewMovement({ ...publicInput, players: [{ bets: [{ racer: 4, betId: 'first-5' }] }], eventDeck: ['event-1'], itemDeck: ['item-1'] }), expected);
  assert.throws(() => previewMovement({ ...publicInput, dice: null }), /공개/);
  assert.throws(() => previewMovement({ ...publicInput, assignments: { minus: assignment(0), plus: assignment(0) } }), /서로 다른 말/);
});
