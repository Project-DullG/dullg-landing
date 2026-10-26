// 섬마을 장터 v0.2. Pure state transitions; no clock, storage, network, or UI access.
export const MATERIALS = [
  { id: 'squid', cardId: 'R01', name: '오징어', color: '#b45443' },
  { id: 'greens', cardId: 'R02', name: '명이나물', color: '#638467' },
  { id: 'mussel', cardId: 'R03', name: '홍합', color: '#465969' },
  { id: 'potato', cardId: 'R04', name: '감자', color: '#b98c48' },
  { id: 'shrimp', cardId: 'R05', name: '새우', color: '#d27c61' },
  { id: 'rice', cardId: 'R06', name: '쌀', color: '#9c9477' },
];
export const RECIPES = [
  { id: 'D01', name: '오징어볶음', needs: { squid: 1 }, base: 4, tags: ['single', 'seafood'] },
  { id: 'D02', name: '명이나물장아찌', needs: { greens: 1 }, base: 4, tags: ['single', 'vegetable'] },
  { id: 'D03', name: '명이나물무침', needs: { greens: 1 }, base: 4, tags: ['single', 'vegetable'] },
  { id: 'D04', name: '감자전', needs: { potato: 1 }, base: 4, tags: ['single', 'vegetable'] },
  { id: 'D05', name: '감자조림', needs: { potato: 1 }, base: 4, tags: ['single', 'vegetable'] },
  { id: 'D06', name: '홍합탕', needs: { mussel: 1 }, base: 4, tags: ['single', 'seafood'] },
  { id: 'D07', name: '새우소금구이', needs: { shrimp: 1 }, base: 4, tags: ['single', 'seafood'] },
  { id: 'D08', name: '오징어덮밥', needs: { squid: 1, rice: 1 }, base: 7, tags: ['rice', 'seafood'] },
  { id: 'D09', name: '홍합밥', needs: { mussel: 1, rice: 1 }, base: 7, tags: ['rice', 'seafood'] },
  { id: 'D10', name: '새우볶음밥', needs: { shrimp: 1, rice: 1 }, base: 7, tags: ['rice', 'seafood'] },
  { id: 'D11', name: '명이나물 쌈밥', needs: { greens: 1, rice: 1 }, base: 7, tags: ['rice', 'vegetable'] },
  { id: 'D12', name: '해물볶음밥', needs: { squid: 1, shrimp: 1, rice: 1 }, base: 11, tags: ['rice', 'seafood'] },
];
export const NEWS = [
  { id: 'E01', name: '간편 먹거리 인기', effect: '재료 1장짜리 요리 판매가 +1냥', description: '재료 1장짜리 요리 판매가 +1냥' },
  { id: 'E02', name: '단체 손님 방문', effect: '재료 2장 이상 요리 판매가 +2냥', description: '재료 2장 이상 요리 판매가 +2냥' },
  { id: 'E03', name: '든든한 밥 한 끼', effect: '쌀이 들어간 요리 판매가 +1냥', description: '쌀이 들어간 요리 판매가 +1냥' },
  { id: 'E04', name: '넉넉한 장터', effect: '1냥을 내면 수집을 1장 추가해 최대 3장', description: '수집 기본 2장은 무료. 3장을 한 번에 가져오려면 1냥을 냅니다.' },
  { id: 'E05', name: '재료 도매 장날', effect: '재료 판매가 장당 3냥, 최대 2장', description: '재료 그대로 판매하는 행동만 장당 3냥. 최대 2장입니다.' },
  { id: 'E06', name: '장터 축제', effect: '모든 요리 판매가 +1냥', description: '모든 요리 판매가 +1냥' },
];
export const GOALS = [
  { id: 'G01', name: '메뉴 개척자', description: '서로 다른 음식 3종 판매', reward: 5 },
  { id: 'G02', name: '든든한 밥집', description: '서로 다른 밥 음식 2종 판매', reward: 5 },
  { id: 'G03', name: '해물 전문점', description: '해물 음식 누적 3회 판매', reward: 5 },
  { id: 'G04', name: '채소 맛집', description: '서로 다른 채소 음식 3종 판매', reward: 5 },
  { id: 'G05', name: '큰 주문 해결사', description: '재료 2장 이상 요리 누적 2회 판매', reward: 5 },
  { id: 'G06', name: '성실한 장사꾼', description: '요리 누적 4회 판매', reward: 5 },
];

const materialIds = MATERIALS.map(m => m.id);
const recipeById = Object.fromEntries(RECIPES.map(r => [r.id, r]));
const count = values => Object.values(values).reduce((a, b) => a + b, 0);
const emptyMaterials = () => Object.fromEntries(materialIds.map(id => [id, 0]));
const copy = state => structuredClone(state);
const requireRule = (condition, message) => { if (!condition) throw new Error(message); };
const stock = player => count(player.materials);
const eventId = state => state.news[state.round - 1];
const note = (state, text) => { state.log.push(text); };

function seedNumber(seed) {
  let n = 2166136261;
  for (const char of String(seed ?? 'island-market')) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return n >>> 0 || 1;
}
function random(state) {
  let x = state.rng;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  state.rng = x >>> 0;
  return state.rng / 4294967296;
}
function shuffle(state, cards) {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function refill(state, kind, target) {
  const deck = kind === 'material' ? 'materialDeck' : 'orderDeck';
  const discard = kind === 'material' ? 'materialDiscard' : 'orderDiscard';
  const publicKey = kind === 'material' ? 'market' : 'orders';
  while (state[publicKey].length < target) {
    if (!state[deck].length && state[discard].length) {
      state[deck] = shuffle(state, state[discard]); state[discard] = [];
    }
    if (!state[deck].length) break;
    state[publicKey].push(state[deck].pop());
  }
}

export function createGame({ players = 4, seed = 'island-market' } = {}) {
  const names = Array.isArray(players) ? players : Array.from({ length: players }, (_, i) => `가게 ${i + 1}`);
  requireRule(names.length >= 2 && names.length <= 4, '2~4개 가게로 시작해 주세요.');
  const state = {
    rules: 'island-market-v0.2', seed: String(seed), rng: seedNumber(seed), version: 0,
    players: names.map((name, id) => ({ id, name: String(name || `가게 ${id + 1}`).slice(0, 24), cash: 5, materials: emptyMaterials(), sales: {}, reservationUsed: false, goal: null })),
    round: 1, turn: 1, turnInRound: 0, starter: 0, current: 0,
    phase: 'action', tradeUsed: false, trade: null, goalChoices: [], reservations: {},
    market: [], orders: [], materialDeck: [], materialDiscard: [], orderDeck: [], orderDiscard: [],
    news: [], goals: [], goalOwners: {}, roundCooked: false, settled: false,
    settlement: null, log: [],
  };
  const nonRice = shuffle(state, materialIds.filter(id => id !== 'rice').flatMap(id => Array(20).fill(id)));
  for (const p of state.players) {
    p.materials.rice = 1;
    for (let i = 0; i < 2; i++) p.materials[nonRice.pop()]++;
  }
  state.materialDeck = shuffle(state, [...nonRice, ...Array(20 - names.length).fill('rice')]);
  state.orderDeck = shuffle(state, RECIPES.map(r => r.id));
  state.news = shuffle(state, NEWS.flatMap(n => [n.id, n.id])).slice(0, 10);
  state.goals = shuffle(state, GOALS.map(g => g.id)).slice(0, 3);
  state.starter = state.current = Math.floor(random(state) * names.length);
  refill(state, 'material', 6); refill(state, 'order', 4);
  note(state, `${state.players[state.current].name}부터 장터를 엽니다. 각 가게 5냥, 쌀 1장과 다른 재료 2장.`);
  return state;
}

export function price(state, recipe) {
  const r = typeof recipe === 'string' ? recipeById[recipe] : recipe;
  requireRule(!!r, '없는 음식입니다.');
  const amount = count(r.needs), event = eventId(state);
  return r.base + (event === 'E01' && amount === 1 ? 1 : event === 'E02' && amount >= 2 ? 2 : event === 'E03' && r.needs.rice ? 1 : event === 'E06' ? 1 : 0);
}
export function canCook(state, order, pid = state.current) {
  const recipe = recipeById[order], player = state.players[pid];
  return !!recipe && !!player && state.orders.includes(order) &&
    (state.reservations[order] === undefined || state.reservations[order] === pid) &&
    Object.entries(recipe.needs).every(([id, n]) => player.materials[id] >= n);
}

function goalMet(id, sales) {
  const sold = RECIPES.filter(r => (sales[r.id] || 0) > 0);
  const sum = filter => RECIPES.filter(filter).reduce((n, r) => n + (sales[r.id] || 0), 0);
  if (id === 'G01') return sold.length >= 3;
  if (id === 'G02') return sold.filter(r => r.tags.includes('rice')).length >= 2;
  if (id === 'G03') return sum(r => r.tags.includes('seafood')) >= 3;
  if (id === 'G04') return sold.filter(r => r.tags.includes('vegetable')).length >= 3;
  if (id === 'G05') return sum(r => count(r.needs) >= 2) >= 2;
  if (id === 'G06') return count(sales) >= 4;
  return false;
}
export function eligibleGoals(state, pid = state.current) {
  const player = state.players[pid];
  if (!player || player.goal) return [];
  if (state.phase === 'goal' && pid === state.current) return [...state.goalChoices];
  // Meeting a threshold earlier does not grant a right to claim it on a later turn.
  return [];
}
function finishMain(state) {
  for (const [order, owner] of Object.entries(state.reservations)) {
    if (owner === state.current) {
      delete state.reservations[order];
      note(state, `${state.players[owner].name}의 주문 예약이 종료되었습니다.`);
    }
  }
  state.phase = state.goalChoices.length ? 'goal' : 'after';
}
function materialsBundle(value = {}) {
  requireRule(value && typeof value === 'object' && !Array.isArray(value), '재료 수량을 확인해 주세요.');
  requireRule(Object.keys(value).every(id => materialIds.includes(id)), '없는 재료는 거래할 수 없습니다.');
  const result = emptyMaterials();
  for (const [id, n] of Object.entries(value)) {
    requireRule(Number.isInteger(n) && n >= 0, '재료는 0 이상의 정수 장수여야 합니다.');
    result[id] = n;
  }
  return result;
}
function bundle(value = {}) {
  const cash = value.cash ?? 0;
  requireRule(Number.isInteger(cash) && cash >= 0, '돈은 0 이상의 정수여야 합니다.');
  return { cash, materials: materialsBundle(value.materials) };
}
function validateTrade(state, trade) {
  const a = state.players[trade.from], b = state.players[trade.to];
  requireRule(!!a && !!b && trade.from !== trade.to, '다른 가게 한 곳을 골라 주세요.');
  const { give, receive } = trade;
  requireRule(give.cash + count(give.materials) > 0 && receive.cash + count(receive.materials) > 0, '양쪽 가게가 모두 돈이나 재료를 내야 합니다.');
  requireRule(give.cash !== receive.cash || materialIds.some(id => give.materials[id] !== receive.materials[id]), '아무것도 바뀌지 않는 거래는 할 수 없습니다.');
  requireRule(a.cash >= give.cash && b.cash >= receive.cash, '거래할 돈이 부족합니다.');
  requireRule(materialIds.every(id => a.materials[id] >= give.materials[id] && b.materials[id] >= receive.materials[id]), '거래할 재료가 부족합니다.');
  requireRule(stock(a) - count(give.materials) + count(receive.materials) <= 10 && stock(b) - count(receive.materials) + count(give.materials) <= 10, '거래 후 어느 가게도 재료 10장을 넘을 수 없습니다.');
}
function settle(state) {
  requireRule(!state.settled, '이미 최종 정산을 마쳤습니다.');
  state.settlement = state.players.map(p => ({ player: p.id, cash: p.cash, inventory: stock(p), total: p.cash + stock(p) }));
  for (const p of state.players) p.cash += stock(p);
  state.settled = true; state.phase = 'finished'; state.reservations = {}; state.trade = null;
  const best = Math.max(...state.players.map(p => p.cash));
  note(state, `10라운드 종료. 재료 1장당 1냥 정산. ${state.players.filter(p => p.cash === best).map(p => p.name).join(', ')} ${best}냥으로 ${state.players.filter(p => p.cash === best).length > 1 ? '공동 우승' : '우승'}!`);
}
function endTurn(state) {
  requireRule(state.phase === 'after', '주행동과 목표 처리를 먼저 마쳐 주세요.');
  state.turnInRound++;
  if (state.turnInRound === state.players.length) {
    if (state.round === 10) { settle(state); return; }
    state.materialDiscard.push(...state.market.splice(0, 2));
    refill(state, 'material', 6);
    if (!state.roundCooked) {
      const index = state.orders.findIndex(order => state.reservations[order] === undefined);
      if (index >= 0) state.orderDiscard.push(...state.orders.splice(index, 1));
      refill(state, 'order', 4);
    }
    state.starter = (state.starter + 1) % state.players.length;
    state.round++; state.turnInRound = 0; state.roundCooked = false;
    note(state, `${state.round}라운드. ${NEWS.find(n => n.id === eventId(state)).name}.`);
  }
  state.turn++; state.current = (state.starter + state.turnInRound) % state.players.length;
  state.phase = 'action'; state.tradeUsed = false; state.trade = null; state.goalChoices = [];
}

export function act(previous, action) {
  requireRule(previous && previous.rules === 'island-market-v0.2', '이 장터의 저장 상태가 아닙니다.');
  requireRule(previous.phase !== 'finished', '끝난 장터입니다. 새 판을 시작해 주세요.');
  requireRule(action && typeof action.type === 'string', '행동을 골라 주세요.');
  if (action.version !== undefined) requireRule(action.version === previous.version, '이미 바뀐 차례입니다. 화면을 다시 확인해 주세요.');
  const state = copy(previous), player = state.players[state.current], type = action.type;
  if (type === 'end') endTurn(state);
  else if (type === 'reserve') {
    requireRule(state.phase === 'after', '주행동을 마친 뒤 주문을 예약합니다.');
    requireRule(state.round < 10, '마지막 라운드에는 새 주문을 예약하지 않습니다.');
    requireRule(!player.reservationUsed, '예약권은 한 판에 한 번만 쓸 수 있습니다.');
    requireRule(state.orders.includes(action.order) && state.reservations[action.order] === undefined, '아직 예약되지 않은 공개 주문을 골라 주세요.');
    player.reservationUsed = true; state.reservations[action.order] = state.current;
    note(state, `${player.name}: ${recipeById[action.order].name} 예약. 다음 자기 주행동이 끝날 때까지 유효합니다.`);
  } else if (type === 'claimGoal') {
    requireRule(state.phase === 'goal' && state.goalChoices.includes(action.goal), '이번 판매로 달성한 목표 하나를 골라 주세요.');
    requireRule(!player.goal && state.goalOwners[action.goal] === undefined, '이미 보상받은 목표입니다.');
    player.goal = action.goal; state.goalOwners[action.goal] = state.current; player.cash += 5;
    state.goalChoices = []; state.phase = 'after';
    note(state, `${player.name}: ${GOALS.find(g => g.id === action.goal).name}, 선착순 보상 5냥.`);
  } else if (type === 'offer') {
    requireRule(state.phase === 'action' && !state.tradeUsed, '거래 제안은 주행동 전에 한 번만 할 수 있습니다.');
    requireRule(Number.isInteger(action.to), '거래 상대를 골라 주세요.');
    const now = action.now ?? 0;
    requireRule(Number.isFinite(now), '거래 시각을 확인해 주세요.');
    const trade = { id: `trade-${state.turn}-${state.version}`, from: state.current, to: action.to, give: bundle(action.give), receive: bundle(action.receive), expiresAt: now + 30000 };
    validateTrade(state, trade);
    state.trade = trade; state.tradeUsed = true; state.phase = 'trade';
    note(state, `${player.name} → ${state.players[action.to].name}: 거래 제안. 상대 가게의 응답을 기다립니다.`);
  } else if (type === 'accept' || type === 'reject' || type === 'expireTrade') {
    requireRule(state.phase === 'trade' && state.trade, '응답할 거래가 없습니다.');
    const trade = state.trade, now = action.now ?? 0;
    if (type === 'expireTrade') requireRule(Number.isFinite(now) && now >= trade.expiresAt, '아직 거래 응답 시간이 남아 있습니다.');
    else {
      requireRule(action.id === trade.id, '이미 처리되었거나 다른 거래입니다.');
      requireRule(action.player === trade.to, '제안을 받은 가게만 응답할 수 있습니다.');
    }
    if (type === 'accept' && now < trade.expiresAt) {
      validateTrade(state, trade);
      const other = state.players[trade.to];
      player.cash += trade.receive.cash - trade.give.cash;
      other.cash += trade.give.cash - trade.receive.cash;
      for (const id of materialIds) {
        player.materials[id] += trade.receive.materials[id] - trade.give.materials[id];
        other.materials[id] += trade.give.materials[id] - trade.receive.materials[id];
      }
      note(state, `${other.name}: 거래 수락. 돈과 재료를 동시에 교환했습니다.`);
    } else note(state, `${type === 'expireTrade' || now >= trade.expiresAt ? '30초가 지나' : state.players[trade.to].name + '에서'} 거래를 거절했습니다.`);
    state.trade = null; state.phase = 'action';
  } else {
    requireRule(state.phase === 'action', '현재 거래 응답이나 차례 마무리를 먼저 처리해 주세요.');
    if (type === 'collect') {
      const indices = action.indices;
      requireRule(Array.isArray(indices) && indices.length >= 1 && indices.length <= (eventId(state) === 'E04' ? 3 : 2), '공개 재료를 1~2장 골라 주세요. 넉넉한 장터에서만 최대 3장입니다.');
      requireRule(new Set(indices).size === indices.length && indices.every(i => Number.isInteger(i) && i >= 0 && i < state.market.length), '같은 카드나 없는 카드를 중복 선택할 수 없습니다.');
      requireRule(stock(player) + indices.length <= 10, '재료 보관 한도는 10장입니다.');
      const cost = indices.length === 3 ? 1 : 0;
      requireRule(player.cash >= cost, '추가 수집에 필요한 1냥이 없습니다.');
      const chosen = indices.map(i => state.market[i]);
      for (const id of chosen) player.materials[id]++;
      state.market = state.market.filter((_, i) => !indices.includes(i)); player.cash -= cost;
      refill(state, 'material', 6);
      note(state, `${player.name}: ${chosen.map(id => MATERIALS.find(m => m.id === id).name).join(', ')} ${chosen.length}장 수집${cost ? ' (1냥 지불)' : ' (무료)'}.`);
      finishMain(state);
    } else if (type === 'sell') {
      const selected = materialsBundle(action.materials), amount = count(selected);
      requireRule(amount >= 1 && amount <= 2, '재료 판매는 한 번에 1~2장입니다.');
      requireRule(materialIds.every(id => player.materials[id] >= selected[id]), '팔 재료가 부족합니다.');
      for (const id of materialIds) {
        player.materials[id] -= selected[id]; state.materialDiscard.push(...Array(selected[id]).fill(id));
      }
      const gain = amount * (eventId(state) === 'E05' ? 3 : 2); player.cash += gain;
      note(state, `${player.name}: 재료 ${amount}장 판매, ${gain}냥.`); finishMain(state);
    } else if (type === 'cook') {
      requireRule(canCook(state, action.order), '재료가 충분한 공개 주문을 골라 주세요. 다른 가게의 예약 주문은 팔 수 없습니다.');
      const recipe = recipeById[action.order], beforeSales = { ...player.sales };
      for (const [id, n] of Object.entries(recipe.needs)) {
        player.materials[id] -= n; state.materialDiscard.push(...Array(n).fill(id));
      }
      const gain = price(state, recipe); player.cash += gain; player.sales[recipe.id] = (player.sales[recipe.id] || 0) + 1;
      state.orders.splice(state.orders.indexOf(recipe.id), 1); state.orderDiscard.push(recipe.id);
      delete state.reservations[recipe.id]; refill(state, 'order', 4); state.roundCooked = true;
      state.goalChoices = player.goal ? [] : state.goals.filter(id => state.goalOwners[id] === undefined && !goalMet(id, beforeSales) && goalMet(id, player.sales));
      note(state, `${player.name}: ${recipe.name} 판매, ${gain}냥.`); finishMain(state);
    } else if (type === 'pass') { note(state, `${player.name}: 이번 차례 패스.`); finishMain(state); }
    else throw new Error('지원하지 않는 행동입니다.');
  }
  state.version++;
  return state;
}

export function totals(state) {
  const results = state.players.map(p => ({ id: p.id, name: p.name, cash: p.cash, inventory: stock(p), total: p.cash + (state.settled ? 0 : stock(p)) }));
  const best = Math.max(...results.map(r => r.total));
  return results.map(r => ({ ...r, winner: r.total === best }));
}
export function supplyCounts(state) {
  const materials = emptyMaterials();
  for (const id of [...state.materialDeck, ...state.materialDiscard, ...state.market]) materials[id]++;
  for (const p of state.players) for (const id of materialIds) materials[id] += p.materials[id];
  const orders = Object.fromEntries(RECIPES.map(r => [r.id, 0]));
  for (const id of [...state.orderDeck, ...state.orderDiscard, ...state.orders]) orders[id]++;
  return { materials, orders };
}
