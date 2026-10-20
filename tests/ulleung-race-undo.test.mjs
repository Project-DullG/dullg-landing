import test from 'node:test';
import assert from 'node:assert/strict';
import { canUndoTransition } from '../public/ulleung-marble/race/undo-policy.mjs';
import { createGame, beginAction, cancelAction, placeBet, useItem, rollMovement, assignDie, rollEvent, continueEvent, acknowledgeItem, nextTurn } from '../public/ulleung-marble/race/engine.mjs';

const fresh = () => createGame(4, { ordered: true });
function positioned(positions) {
  const state = fresh();
  state.positions = [...positions];
  state.highWater = Math.max(0, ...positions);
  state.bettingOpen = state.highWater < 20;
  state.closedAt = state.bettingOpen ? null : { turn: 1, position: state.highWater };
  return state;
}
function withItem(id) {
  const state = fresh();
  state.itemDeck.splice(state.itemDeck.indexOf(id), 1);
  state.players[0].items.push(id);
  return state;
}

test('행동 선택과 아이템 사용 전 취소는 되돌릴 수 있다', () => {
  const state = fresh();
  for (const action of ['bet', 'move']) {
    const opened = beginAction(state, action);
    assert.equal(canUndoTransition(state, opened), true);
    assert.equal(canUndoTransition(opened, cancelAction(opened)), true);
  }
});

test('이미 공개된 두 주사위의 첫 배정만 되돌릴 수 있다', () => {
  const rolled = rollMovement(beginAction(fresh(), 'move'), [3], [6]);
  for (const sign of ['minus', 'plus']) {
    const first = assignDie(rolled, sign, 0);
    assert.equal(first.phase, 'assign');
    assert.equal(canUndoTransition(rolled, first), true);
    const second = assignDie(first, sign === 'minus' ? 'plus' : 'minus', 1);
    assert.equal(canUndoTransition(first, second), false);
  }
});

test('0칸 주사위가 있으면 유일한 배정은 바로 이동이므로 되돌릴 수 없다', () => {
  const rolled = rollMovement(beginAction(fresh(), 'move'), [3], [1]);
  assert.equal(canUndoTransition(rolled, assignDie(rolled, 'plus', 0)), false);
});

test('주사위 굴리기와 비밀 베팅 제출을 되돌릴 수 없다', () => {
  const preparation = beginAction(fresh(), 'move');
  assert.equal(canUndoTransition(preparation, rollMovement(preparation, [3], [6])), false);
  const betting = beginAction(fresh(), 'bet');
  assert.equal(canUndoTransition(betting, placeBet(betting, 2, 'first-5')), false);
});

test('아이템 사용·획득·확인을 되돌릴 수 없다', () => {
  const preparation = beginAction(withItem('item-3'), 'move');
  const used = useItem(preparation, 'item-3');
  assert.equal(canUndoTransition(preparation, used), false);
  assert.equal(canUndoTransition(used, { ...used, phase: 'action' }), false);
  const rolled = rollMovement(beginAction(positioned([9, 1, 3, 12, 21]), 'move'), [2], [1]);
  const found = assignDie(rolled, 'plus', 0);
  assert.equal(found.phase, 'found');
  assert.equal(canUndoTransition(rolled, found), false);
  assert.equal(canUndoTransition(found, acknowledgeItem(found)), false);
});

test('이벤트의 무작위 결과와 적용 이후에 이전 선택으로 돌아갈 수 없다', () => {
  const rolled = rollMovement(beginAction(positioned([4, 1, 3, 12, 21]), 'move'), [1], [1]);
  const event = assignDie(rolled, 'plus', 0);
  const revealed = rollEvent(event, 4);
  assert.equal(event.phase, 'event');
  assert.equal(canUndoTransition(event, revealed), false);
  assert.equal(canUndoTransition(revealed, continueEvent(revealed)), false);
});

test('다음 사람 인계와 경주 종료를 되돌릴 수 없다', () => {
  const betting = beginAction(fresh(), 'bet');
  const result = placeBet(betting, 2, 'first-5');
  assert.equal(canUndoTransition(result, nextTurn(result)), false);
  const rolled = rollMovement(beginAction(positioned([43, 1, 3, 12, 21]), 'move'), [2], [1]);
  const finished = assignDie(rolled, 'plus', 0);
  assert.equal(finished.phase, 'finished');
  assert.equal(canUndoTransition(rolled, finished), false);
  assert.equal(canUndoTransition(finished, rolled), false);
});

test('첫 배정이어도 주사위·위치·덱·비밀 정보가 바뀌면 거부한다', () => {
  const rolled = rollMovement(beginAction(fresh(), 'move'), [3], [6]);
  const assigned = assignDie(rolled, 'minus', 0);
  for (const mutate of [
    state => { state.dice.plus = 6; },
    state => { state.positions[0] = 1; },
    state => { state.eventDeck.reverse(); },
    state => { state.players[0].bets.push({ racer: 1, betId: 'first-5' }); },
    state => { state.current = 1; },
    state => { state.history.unshift({ turn: 1, text: '새로운 정보' }); },
  ]) {
    const changed = structuredClone(assigned);
    mutate(changed);
    assert.equal(canUndoTransition(rolled, changed), false);
  }
});

test('배정 없는 상태·형식이 잘못된 상태는 허용하지 않는다', () => {
  const rolled = rollMovement(beginAction(fresh(), 'move'), [3], [6]);
  assert.equal(canUndoTransition(rolled, structuredClone(rolled)), false);
  assert.equal(canUndoTransition(null, rolled), false);
  assert.equal(canUndoTransition(rolled, null), false);
  const malformed = structuredClone(rolled);
  malformed.assignments.minus = { racer: 0, reduce: true };
  assert.equal(canUndoTransition(rolled, malformed), false);
});
