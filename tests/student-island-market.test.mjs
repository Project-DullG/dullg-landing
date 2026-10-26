import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATERIALS, RECIPES, NEWS, GOALS, createGame, act, price,
  canCook, eligibleGoals, totals, supplyCounts,
} from '../public/student-games/island-market/engine.mjs';

const names = ['해뜰 가게', '바람 가게', '파도 가게', '달빛 가게'];
const materialCount = p => Object.values(p.materials).reduce((n, x) => n + x, 0);
function fresh(n = 4) {
  const s = createGame({ players: names.slice(0, n), seed: 'market-tests' });
  s.current = s.starter = 0;
  return s;
}
function invariant(s) {
  const counts = supplyCounts(s);
  for (const m of MATERIALS) assert.equal(counts.materials[m.id], 20, `${m.id}: material conservation`);
  for (const r of RECIPES) assert.equal(counts.orders[r.id], 1, `${r.id}: order conservation`);
  for (const p of s.players) {
    assert.ok(p.cash >= 0 && Number.isInteger(p.cash));
    assert.ok(materialCount(p) <= 10);
    for (const n of Object.values(p.materials)) assert.ok(n >= 0 && Number.isInteger(n));
  }
}
// Construct rule scenarios without creating or deleting a material card.
function inventory(s, pid, wanted) {
  const p = s.players[pid];
  for (const [id, n] of Object.entries(p.materials)) {
    s.materialDeck.push(...Array(n).fill(id)); p.materials[id] = 0;
  }
  for (const [id, n] of Object.entries(wanted)) for (let i = 0; i < n; i++) {
    let source = ['materialDeck', 'materialDiscard', 'market'].find(key => s[key].includes(id));
    if (source) s[source].splice(s[source].indexOf(id), 1);
    else {
      const owner = s.players.find(q => q.id !== pid && q.materials[id] > 0);
      assert.ok(owner, `fixture has ${id}`); owner.materials[id]--;
    }
    p.materials[id]++;
  }
}
function publicOrder(s, id, slot = 0) {
  if (s.orders.includes(id)) return;
  const key = ['orderDeck', 'orderDiscard'].find(k => s[k].includes(id));
  assert.ok(key);
  const index = s[key].indexOf(id);
  [s.orders[slot], s[key][index]] = [s[key][index], s.orders[slot]];
}
function event(s, id) { s.news[s.round - 1] = id; }
function finish(s) {
  if (s.phase === 'goal') s = act(s, { type: 'claimGoal', goal: s.goalChoices[0] });
  return act(s, { type: 'end' });
}

test('v0.2 exact content and deterministic setup preserve all 120 materials and 12 orders', () => {
  assert.equal(MATERIALS.length, 6); assert.equal(RECIPES.length, 12);
  assert.equal(NEWS.length, 6); assert.equal(GOALS.length, 6);
  assert.deepEqual(RECIPES.find(r => r.id === 'D12').needs, { squid: 1, shrimp: 1, rice: 1 });
  assert.equal(RECIPES.find(r => r.id === 'D12').base, 11);
  assert.deepEqual(createGame({ seed: 'fixed' }), createGame({ seed: 'fixed' }));
  assert.notDeepEqual(createGame({ seed: 'first' }).market, createGame({ seed: 'second' }).market);
  for (const n of [2, 3, 4]) {
    const s = createGame({ players: n, seed: n });
    assert.equal(s.market.length, 6); assert.equal(s.orders.length, 4); assert.equal(s.news.length, 10);
    assert.equal(s.goals.length, 3); assert.equal(new Set(s.goals).size, 3);
    for (const id of NEWS.map(n => n.id)) assert.ok(s.news.filter(n => n === id).length <= 2);
    for (const p of s.players) { assert.equal(p.cash, 5); assert.equal(p.materials.rice, 1); assert.equal(materialCount(p), 3); }
    invariant(s);
  }
  assert.throws(() => createGame({ players: 1 })); assert.throws(() => createGame({ players: 5 }));
});

test('collection is a single atomic selection with no intermediate refill or mutation on failure', () => {
  let s = fresh(); event(s, 'E01');
  const original = structuredClone(s), chosen = s.market.slice(0, 2);
  assert.throws(() => act(s, { type: 'collect', indices: [0, 0] }));
  assert.throws(() => act(s, { type: 'collect', indices: [0, 1, 2] }));
  assert.throws(() => act(s, { type: 'collect', indices: [-1] }));
  assert.deepEqual(s, original);
  const before = { ...s.players[0].materials };
  s = act(s, { type: 'collect', indices: [0, 1] });
  assert.equal(s.phase, 'after'); assert.equal(s.players[0].cash, 5);
  for (const m of MATERIALS) assert.equal(s.players[0].materials[m.id] - before[m.id], chosen.filter(id => id === m.id).length);
  assert.throws(() => act(s, { type: 'pass' })); invariant(s);
});

test('storage cap and E04 paid third card are enforced before changing anything', () => {
  let s = fresh(); inventory(s, 0, { rice: 9 }); event(s, 'E04');
  assert.throws(() => act(s, { type: 'collect', indices: [0, 1] }));
  inventory(s, 0, { rice: 3 }); s.players[0].cash = 0;
  assert.throws(() => act(s, { type: 'collect', indices: [0, 1, 2] }));
  s.players[0].cash = 1;
  s = act(s, { type: 'collect', indices: [0, 1, 2] });
  assert.equal(s.players[0].cash, 0); assert.equal(materialCount(s.players[0]), 6); invariant(s);
});

test('news affects only the specified bank income, with D12 E02 price exactly 13', () => {
  const s = fresh();
  event(s, 'E01'); assert.equal(price(s, 'D01'), 5); assert.equal(price(s, 'D08'), 7);
  event(s, 'E02'); assert.equal(price(s, 'D12'), 13); assert.equal(price(s, 'D01'), 4);
  event(s, 'E03'); assert.equal(price(s, 'D11'), 8); assert.equal(price(s, 'D04'), 4);
  event(s, 'E06'); assert.equal(price(s, 'D12'), 12);
  inventory(s, 0, { squid: 2 }); event(s, 'E05');
  const sold = act(s, { type: 'sell', materials: { squid: 2 } });
  assert.equal(sold.players[0].cash, 11); invariant(sold);
  assert.throws(() => act(s, { type: 'sell', materials: { squid: 1.5 } }));
  assert.throws(() => act(s, { type: 'sell', materials: { imaginary: 1 } }));
  assert.throws(() => act(s, { type: 'sell', materials: { squid: 3 } }));
});

test('trade is simultaneous, conserves cash/materials, validates authority, and cannot be accepted twice', () => {
  let s = fresh(); inventory(s, 0, { rice: 2 }); inventory(s, 1, { squid: 1 });
  const cash = s.players.reduce((n, p) => n + p.cash, 0);
  s = act(s, { type: 'offer', to: 1, give: { cash: 2, materials: { rice: 1 } }, receive: { materials: { squid: 1 } }, now: 100 });
  const id = s.trade.id;
  assert.throws(() => act(s, { type: 'accept', id, player: 2, now: 200 }));
  assert.throws(() => act(s, { type: 'collect', indices: [0] }));
  s = act(s, { type: 'accept', id, player: 1, now: 200 });
  assert.equal(s.players[0].cash, 3); assert.equal(s.players[1].cash, 7);
  assert.equal(s.players[0].materials.squid, 1); assert.equal(s.players[1].materials.rice, 1);
  assert.equal(s.players.reduce((n, p) => n + p.cash, 0), cash);
  assert.throws(() => act(s, { type: 'accept', id, player: 1, now: 300 }));
  assert.throws(() => act(s, { type: 'offer', to: 2, give: { cash: 1 }, receive: { cash: 2 } }));
  invariant(s);
});

test('rejected or expired offer consumes the opportunity, and invalid offers cannot create resources', () => {
  let s = fresh();
  assert.throws(() => act(s, { type: 'offer', to: 1, give: {}, receive: { cash: 1 } }));
  assert.throws(() => act(s, { type: 'offer', to: 1, give: { cash: 1 }, receive: { cash: 1 } }));
  assert.throws(() => act(s, { type: 'offer', to: 1, give: { cash: 99 }, receive: { cash: 1 } }));
  inventory(s, 0, { rice: 10 }); inventory(s, 1, { squid: 2 });
  assert.throws(() => act(s, { type: 'offer', to: 1, give: { cash: 1 }, receive: { materials: { squid: 1 } } }));
  s = act(s, { type: 'offer', to: 1, give: { materials: { rice: 1 } }, receive: { cash: 1 }, now: 20 });
  assert.throws(() => act(s, { type: 'expireTrade', now: 30019 }));
  s = act(s, { type: 'accept', id: s.trade.id, player: 1, now: 30020 });
  assert.equal(s.phase, 'action'); assert.equal(s.tradeUsed, true);
  assert.equal(s.players[0].cash, 5); assert.equal(s.players[0].materials.rice, 10);
  assert.throws(() => act(s, { type: 'offer', to: 1, give: { materials: { rice: 1 } }, receive: { cash: 1 } }));
  invariant(s);
});

test('reservation lasts through the owner’s next main action, prevents others cooking, and is single-use', () => {
  let s = fresh(2); publicOrder(s, 'D08'); inventory(s, 0, { squid: 1, rice: 1 }); inventory(s, 1, { squid: 1, rice: 1 });
  assert.throws(() => act(s, { type: 'reserve', order: 'D08' }));
  s = act(s, { type: 'pass' }); s = act(s, { type: 'reserve', order: 'D08' });
  s = act(s, { type: 'end' });
  assert.equal(s.reservations.D08, 0); assert.equal(canCook(s, 'D08', 1), false);
  assert.throws(() => act(s, { type: 'cook', order: 'D08' }));
  s = finish(act(s, { type: 'pass' }));
  // Rotating the round starter means player 1 acts again before player 0.
  assert.equal(s.current, 1); assert.equal(s.reservations.D08, 0);
  s = finish(act(s, { type: 'pass' })); assert.equal(s.current, 0);
  s = act(s, { type: 'pass' }); assert.equal(s.reservations.D08, undefined);
  assert.throws(() => act(s, { type: 'reserve', order: s.orders[0] })); invariant(s);
  const last = fresh(); last.round = 10;
  assert.throws(() => act(act(last, { type: 'pass' }), { type: 'reserve', order: last.orders[0] }));
});

test('round cleanup discards two oldest materials, skips reserved order, and rotates starter', () => {
  let s = fresh(2); const old = s.market.slice(0, 2), reserved = s.orders[0], stale = s.orders[1];
  s.reservations[reserved] = 0; s.players[0].reservationUsed = true;
  // Set the fixture immediately before the round’s final player finishes.
  s.current = 1; s.turnInRound = 1;
  s = finish(act(s, { type: 'pass' }));
  assert.equal(s.round, 2); assert.equal(s.current, 1); assert.equal(s.starter, 1);
  assert.ok(s.orders.includes(reserved)); assert.ok(!s.orders.includes(stale));
  for (const id of old) assert.ok(s.materialDiscard.includes(id)); invariant(s);
  let cooked = fresh(2); const existing = [...cooked.orders];
  cooked.current = 1; cooked.turnInRound = 1; cooked.roundCooked = true;
  cooked = finish(act(cooked, { type: 'pass' })); assert.deepEqual(cooked.orders, existing);
});

test('goal is claimed only on its first qualifying sale; choose one and never reward twice', () => {
  let s = fresh(); s.goals = ['G01', 'G02', 'G05'];
  s.players[0].sales = { D01: 1, D08: 1 }; inventory(s, 0, { shrimp: 1, rice: 1 });
  publicOrder(s, 'D10'); event(s, 'E02');
  s = act(s, { type: 'cook', order: 'D10' });
  assert.equal(s.phase, 'goal'); assert.deepEqual(eligibleGoals(s).sort(), ['G01', 'G02', 'G05']);
  assert.equal(s.players[0].cash, 14);
  assert.throws(() => act(s, { type: 'end' }));
  s = act(s, { type: 'claimGoal', goal: 'G02' });
  assert.equal(s.players[0].cash, 19); assert.equal(s.goalOwners.G02, 0); assert.equal(s.players[0].goal, 'G02');
  assert.throws(() => act(s, { type: 'claimGoal', goal: 'G01' })); invariant(s);
  const late = fresh(); late.goals = ['G01', 'G02', 'G05']; late.players[0].sales = { D01: 1, D04: 1, D06: 1 };
  publicOrder(late, 'D01'); inventory(late, 0, { squid: 1 });
  const result = act(late, { type: 'cook', order: 'D01' });
  assert.equal(result.phase, 'after'); assert.throws(() => act(result, { type: 'claimGoal', goal: 'G01' }));
});

test('stale state versions and second main actions cannot be replayed', () => {
  const s = fresh(); const next = act(s, { type: 'pass', version: s.version });
  assert.throws(() => act(next, { type: 'end', version: s.version }));
  assert.throws(() => act(next, { type: 'pass' }));
  assert.equal(s.phase, 'action'); assert.equal(s.version, 0);
});

test('4-player game completes exactly 40 main actions with conservation through every transition', () => {
  for (const seed of ['complete-one', 'complete-two', 'complete-three']) {
    let s = createGame({ players: names, seed }); let mainActions = 0;
    const starting = s.starter, roundStarters = [];
    while (s.phase !== 'finished') {
      if (s.turnInRound === 0) roundStarters.push(s.current);
      const p = s.players[s.current], recipe = s.orders.find(id => canCook(s, id));
      if (recipe) s = act(s, { type: 'cook', order: recipe });
      else if (materialCount(p) <= 8 && s.market.length) s = act(s, { type: 'collect', indices: Array.from({ length: Math.min(2, s.market.length, 10 - materialCount(p)) }, (_, i) => i) });
      else {
        const id = MATERIALS.find(m => p.materials[m.id] > 0)?.id;
        s = id ? act(s, { type: 'sell', materials: { [id]: Math.min(2, p.materials[id]) } }) : act(s, { type: 'pass' });
      }
      mainActions++; invariant(s); s = finish(s); invariant(s);
      assert.ok(mainActions <= 40);
    }
    assert.equal(mainActions, 40); assert.equal(s.round, 10); assert.equal(s.settled, true);
    assert.deepEqual(roundStarters, Array.from({ length: 10 }, (_, i) => (starting + i) % 4));
    for (const record of s.settlement) assert.equal(s.players[record.player].cash, record.cash + record.inventory);
    assert.deepEqual(totals(s).map(r => r.total), s.players.map(p => p.cash));
    assert.throws(() => act(s, { type: 'end' })); assert.throws(() => act(s, { type: 'pass' }));
  }
});

test('final settlement does not run cleanup or double-count stock and allows joint victory', () => {
  let s = fresh(2); s.round = 10; s.current = 1; s.turnInRound = 1;
  inventory(s, 0, { rice: 3 }); inventory(s, 1, { squid: 1 });
  s.players[0].cash = 31; s.players[1].cash = 33;
  s.reservations[s.orders[0]] = 0;
  const market = [...s.market], orders = [...s.orders];
  s = finish(act(s, { type: 'pass' }));
  assert.deepEqual(s.market, market); assert.deepEqual(s.orders, orders); assert.deepEqual(s.reservations, {});
  assert.deepEqual(totals(s).map(r => r.total), [34, 34]); assert.ok(totals(s).every(r => r.winner));
  const before = structuredClone(s); assert.throws(() => act(s, { type: 'end' })); assert.deepEqual(s, before); invariant(s);
});
