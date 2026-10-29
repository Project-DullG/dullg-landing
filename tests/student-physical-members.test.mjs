import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhysicalTableState, initialPhysicalState } from '../public/student-games/physical-state.mjs';
import { buildMarketKit } from '../public/student-games/island-market/physical-kit.mjs';

const cards = ['a', 'b', 'c'];
function fixture() {
  const card = (id, extra = {}) => ({ id, type: 'card', x: 100, y: 100, width: 40, height: 56,
    front: 'front', back: 'back', faceDown: true, ...extra });
  return { id: 'pile-members-regression', size: { width: 1000, height: 800 }, pieces: [
    ...cards.map(id => card(id, { pile: 'deck' })), card('d', { x: 300 }),
    card('hidden', { pile: 'deck', hidden: true }),
    { id: 'outer', type: 'envelope', x: 500, y: 100, width: 162, height: 114, front: 'envelope', contains: ['inner', 'record-a'] },
    { id: 'inner', type: 'envelope', x: 500, y: 300, width: 162, height: 114, front: 'envelope', hidden: true, contains: ['record-b'] },
    { id: 'record-a', type: 'paper', x: 700, y: 100, width: 105, height: 148, front: 'record', pile: 'records', hidden: true },
    { id: 'record-b', type: 'paper', x: 700, y: 300, width: 105, height: 148, front: 'record', pile: 'records', hidden: true },
  ] };
}

// Independent observable contract, intentionally slow: it also verifies every
// member of a changed pile, rather than checking only the selected top card.
function expectedMembers(snapshot, id) {
  const piece = snapshot.pieces[id];
  if (!piece || piece.hidden) return [];
  return (piece.pile ? Object.keys(snapshot.pieces).filter(key => {
    const other = snapshot.pieces[key];
    return !other.hidden && other.pile === piece.pile;
  }) : [id]).sort((a, b) => snapshot.pieces[a].z - snapshot.pieces[b].z);
}
function assertAllMembers(table, kit) {
  const snapshot = table.snapshot();
  for (const p of kit.pieces) assert.deepEqual(table.members(p.id), expectedMembers(snapshot, p.id), p.id);
}

test('restored piles preserve stable z ties, hidden/singleton semantics and caller-owned arrays', () => {
  const kit = fixture(), saved = initialPhysicalState(kit);
  saved.pieces.a.z = 30;
  saved.pieces.b.z = saved.pieces.c.z = 10;
  for (const id of cards) saved.pieces[id].pile = '__proto__';
  const table = createPhysicalTableState(kit, saved);
  assert.deepEqual(table.members('a'), ['b', 'c', 'a']);
  assert.deepEqual(table.members('hidden'), []);
  assert.deepEqual(table.members('missing'), []);
  assert.deepEqual(table.members('d'), ['d']);
  const returned = table.members('a');
  returned.reverse(); returned.splice(0, 1); returned.push('not-a-piece');
  assert.deepEqual(table.members('b'), ['b', 'c', 'a']);
  assert.notStrictEqual(table.members('a'), table.members('a'));
  table.get('d').pile = '';
  assert.deepEqual(table.members('d'), ['d']);
  saved.pieces.b.hidden = true; // candidate remains caller-owned too
  assert.deepEqual(table.members('a'), ['b', 'c', 'a']);
  assertAllMembers(table, kit);
});

test('get records and snapshots remain structured-cloneable plain data after restore, undo and reset', () => {
  const kit = fixture(), table = createPhysicalTableState(kit);
  const check = () => {
    assert.equal(Object.getPrototypeOf(table.get('a')), Object.prototype);
    assert.strictEqual(table.get('a'), table.get('a'));
    assert.deepEqual(structuredClone(table.get('a')), table.snapshot().pieces.a);
    assert.deepEqual(structuredClone(table.snapshot()), JSON.parse(JSON.stringify(table.snapshot())));
  };
  check(); table.move('a', 20, 10); check(); table.undo(); check(); table.reset(); check();
});

test('models restored from the same kit keep independent pile indexes', () => {
  const kit = fixture(), saved = initialPhysicalState(kit);
  saved.pieces.b.hidden = true;
  saved.pieces.c.z = 0;
  const first = createPhysicalTableState(kit), second = createPhysicalTableState(kit, saved);
  assert.deepEqual(first.members('a'), cards);
  assert.deepEqual(second.members('a'), ['c', 'a']);
  first.get('b').pile = null;
  assert.deepEqual(first.members('a'), ['a', 'c']);
  assert.deepEqual(second.members('a'), ['c', 'a']);
  second.reset();
  assert.deepEqual(second.members('a'), cards);
  assert.deepEqual(first.members('a'), ['a', 'c']);
});

test('stack, single-card detach, spread and reversed whole-pile flip invalidate cached order', () => {
  const kit = fixture(), table = createPhysicalTableState(kit);
  assert.deepEqual(table.members('a'), cards);
  assert.equal(table.stack(['d'], 'a'), true);
  assert.deepEqual(table.members('a'), ['a', 'b', 'c', 'd']);
  assert.equal(table.move('b', 20, 10), true);
  assert.deepEqual(table.members('a'), ['a', 'c', 'd']);
  assert.deepEqual(table.members('b'), ['b']);
  table.undo(); assert.deepEqual(table.members('a'), ['a', 'b', 'c', 'd']);
  table.undo(); assert.deepEqual(table.members('a'), cards);
  table.spread('a');
  for (const id of cards) assert.deepEqual(table.members(id), [id]);
  table.undo();
  table.flip('a', true);
  assert.deepEqual(table.members('a'), ['c', 'b', 'a']);
  assert.ok(cards.every(id => !table.get(id).faceDown));
  table.undo();
  table.rotate('a', 90, true); table.move('a', 40, 30, true);
  assert.deepEqual(table.members('a'), cards);
  assertAllMembers(table, kit);
});

test('shuffle owns its working array, changes only z order, and undo restores the cached pile', () => {
  const kit = fixture(), table = createPhysicalTableState(kit), before = table.snapshot();
  const returned = table.members('a'); returned.length = 0;
  assert.equal(table.shuffle('a', () => 0), true);
  assert.deepEqual(table.members('a'), ['b', 'c', 'a']);
  for (const id of cards) {
    const { z: oldZ, ...oldPiece } = before.pieces[id], { z: newZ, ...newPiece } = table.get(id);
    assert.deepEqual(newPiece, oldPiece);
    assert.ok(newZ > oldZ);
  }
  assert.equal(table.shuffle('d', () => 0), false);
  assert.equal(table.undo(), true);
  assert.deepEqual(table.snapshot(), before);
  assert.deepEqual(table.members('a'), cards);
});

test('nested batch reads see every mutation immediately and the whole batch remains one undo', () => {
  const kit = fixture(), table = createPhysicalTableState(kit), before = table.snapshot();
  table.members('a');
  assert.equal(table.batch(() => {
    table.stack(['d'], 'a');
    assert.deepEqual(table.members('a'), ['a', 'b', 'c', 'd']);
    table.batch(() => {
      table.move('b', 10, 0);
      assert.deepEqual(table.members('a'), ['a', 'c', 'd']);
    });
    table.flip('a', true);
    assert.deepEqual(table.members('a'), ['d', 'c', 'a']);
    table.get('c').hidden = true;
    assert.deepEqual(table.members('a'), ['d', 'a']);
    table.get('d').pile = null;
    assert.deepEqual(table.members('a'), ['a']);
  }), true);
  table.note('work', 'keep this later note');
  assert.equal(table.undo(), true);
  assert.deepEqual(table.snapshot().pieces, before.pieces);
  assert.equal(table.snapshot().notes.work, 'keep this later note');
  assert.equal(table.canUndo(), false);
  assertAllMembers(table, kit);
});

test('nested envelope visibility, live pile/z writes, reset and reset undo never reuse stale members', () => {
  const kit = fixture(), table = createPhysicalTableState(kit);
  assert.deepEqual(table.members('record-a'), []);
  table.container('outer');
  assert.deepEqual(table.members('record-a'), ['record-a']);
  assert.deepEqual(table.members('record-b'), []);
  table.container('inner');
  assert.deepEqual(table.members('record-b'), ['record-a', 'record-b']);
  table.get('record-b').z = 0;
  assert.deepEqual(table.members('record-a'), ['record-b', 'record-a']);
  table.container('outer', true);
  assert.deepEqual(table.members('record-a'), []);
  assert.deepEqual(table.members('record-b'), []);
  table.undo();
  assert.deepEqual(table.members('record-b'), ['record-b', 'record-a']);
  table.get('b').pile = null;
  assert.deepEqual(table.members('a'), ['a', 'c']);
  table.get('c').z = 0;
  assert.deepEqual(table.members('a'), ['c', 'a']);
  table.note('work', 'reset restores this only when undone');
  const beforeReset = table.snapshot();
  table.reset();
  assert.deepEqual(table.members('a'), cards);
  assert.deepEqual(table.snapshot().notes, {});
  table.undo();
  assert.deepEqual(table.snapshot(), beforeReset);
  table.get('c').pile = null;
  assert.deepEqual(table.members('a'), ['a']);
  assertAllMembers(table, kit);
});

test('a thrown batch still leaves subsequent membership reads coherent', () => {
  const kit = fixture(), table = createPhysicalTableState(kit);
  table.members('a');
  assert.throws(() => table.batch(() => {
    table.get('b').hidden = true;
    assert.deepEqual(table.members('a'), ['a', 'c']);
    throw new Error('interrupted interaction');
  }), /interrupted interaction/);
  assert.deepEqual(table.members('a'), ['a', 'c']);
  table.get('c').pile = null;
  assert.deepEqual(table.members('a'), ['a']);
  assertAllMembers(table, kit);
});

test('actual market: a warmed full-scene sweep does not reread z for every object', () => {
  const kit = buildMarketKit(), table = createPhysicalTableState(kit);
  assert.ok(kit.pieces.length >= 450, 'exercise the real large inventory, including bank piles');
  let zReads = 0;
  for (const p of kit.pieces) {
    const record = table.get(p.id), descriptor = Object.getOwnPropertyDescriptor(record, 'z');
    let value = record.z;
    Object.defineProperty(record, 'z', {
      enumerable: true, configurable: true,
      get() { zReads++; return descriptor.get ? descriptor.get.call(this) : value; },
      set(next) { if (descriptor.set) descriptor.set.call(this, next); else value = next; },
    });
  }
  const sweep = () => kit.pieces.reduce((sum, p) => sum + table.members(p.id).length, 0);
  const expected = sweep();
  assert.ok(zReads > 0, 'the cold sweep really sorted existing piles');
  zReads = 0;
  assert.equal(sweep(), expected); assert.equal(sweep(), expected);
  assert.equal(zReads, 0, 'an unchanged full-scene sweep must reuse pile order');
  const deckCard = kit.pieces.find(p => p.pile === 'material-deck');
  table.get(deckCard.id).z = 0;
  assert.equal(table.members(deckCard.id)[0], deckCard.id);
  assert.ok(zReads > 0, 'changed z rebuilds order before the next read');
  assertAllMembers(table, kit);
});
