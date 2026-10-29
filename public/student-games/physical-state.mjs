/** Positions and faces of objects. No game rules, turns, money or answers live here. */
const finite = n => Number.isFinite(n);
const copy = value => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const margins = (p, angle) => {
  const a = angle * Math.PI / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
  return { x:Math.max(0,(p.width*c+p.height*s-p.width)/2), y:Math.max(0,(p.width*s+p.height*c-p.height)/2) };
};
export const geometryKey = kit => `${kit.id}:${kit.version || 1}:${kit.pieces.map(p => `${p.id}/${p.width}/${p.height}`).join('|')}`;

export function validateKit(kit) {
  if (!kit || !kit.id || !finite(kit.size?.width) || !finite(kit.size?.height) || !Array.isArray(kit.pieces)) throw new TypeError('구성품 목록과 탁자 크기가 필요합니다.');
  const ids = new Set();
  for (const p of kit.pieces) {
    if (!p.id || ids.has(p.id)) throw new TypeError(`구성품 번호가 겹칩니다: ${p.id}`);
    ids.add(p.id);
    if (![p.x, p.y, p.width, p.height].every(finite) || p.width <= 0 || p.height <= 0 || p.width > kit.size.width || p.height > kit.size.height) throw new TypeError(`구성품 크기를 확인해 주세요: ${p.id}`);
    if (p.x < 0 || p.y < 0 || p.x + p.width > kit.size.width + 1 || p.y + p.height > kit.size.height + 1) throw new TypeError(`구성품이 탁자 밖에 놓였습니다: ${p.id}`);
    if (typeof p.front !== 'string' || (p.back != null && typeof p.back !== 'string')) throw new TypeError(`구성품 면이 필요합니다: ${p.id}`);
  }
  const parents = new Set();
  for (const p of kit.pieces) for (const id of p.contains || []) {
    if (!ids.has(id) || id === p.id || parents.has(id)) throw new TypeError(`봉투 안 구성품을 확인해 주세요: ${id}`);
    parents.add(id);
  }
  // A real envelope cannot contain itself through another envelope either.
  const visit = (id, seen = new Set()) => {
    if (seen.has(id)) throw new TypeError(`봉투가 서로 포함되어 있습니다: ${id}`);
    const next = new Set(seen).add(id);
    for (const child of kit.pieces.find(p => p.id === id)?.contains || []) visit(child, next);
  };
  kit.pieces.forEach(p => visit(p.id));
  return true;
}

export function initialPhysicalState(kit) {
  validateKit(kit);
  return { version: 1, kit: geometryKey(kit), pieces: Object.fromEntries(kit.pieces.map((p, i) => [p.id, {
    x: p.x, y: p.y, angle: p.angle || 0, faceDown: Boolean(p.faceDown && p.back), hidden: Boolean(p.hidden), pile: p.pile || null, z: i + 1,
  }])), notes: {} };
}

export function restorePhysicalState(kit, candidate) {
  const fresh = initialPhysicalState(kit);
  if (!candidate || candidate.version !== 1 || candidate.kit !== fresh.kit || !candidate.pieces || Array.isArray(candidate.pieces)) return fresh;
  const keys = Object.keys(candidate.pieces);
  if (keys.length !== kit.pieces.length || keys.some(id => !Object.hasOwn(fresh.pieces, id))) return fresh;
  for (const p of kit.pieces) {
    const s = candidate.pieces[p.id];
    if (!s || ![s.x, s.y, s.angle, s.z].every(finite) || Math.abs(s.angle) > 360 || s.z < 0 || s.z > 1e9 || s.x < 0 || s.y < 0 || s.x > kit.size.width - p.width + 1 || s.y > kit.size.height - p.height + 1 || typeof s.faceDown !== 'boolean' || typeof s.hidden !== 'boolean' || !(s.pile === null || typeof s.pile === 'string' && s.pile.length < 200)) return fresh;
    const m=margins(p,s.angle);
    if(s.x<m.x-.01 || s.y<m.y-.01 || s.x+p.width+m.x>kit.size.width+.01 || s.y+p.height+m.y>kit.size.height+.01) return initialPhysicalState(kit);
    fresh.pieces[p.id] = { x: s.x, y: s.y, angle: s.angle, z: s.z, faceDown: Boolean(s.faceDown && p.back), hidden: s.hidden, pile: s.pile };
  }
  if (candidate.notes && typeof candidate.notes === 'object' && !Array.isArray(candidate.notes)) {
    for (const [key, value] of Object.entries(candidate.notes)) if (typeof value === 'string' && key.length < 180 && !['__proto__','constructor','prototype'].includes(key)) fresh.notes[key] = value.slice(0, 16000);
  }
  return fresh;
}

export function createPhysicalTableState(kit, candidate) {
  let state = restorePhysicalState(kit, candidate);
  const specs = new Map(kit.pieces.map(p => [p.id, p]));
  const history = [];
  let batching = false;
  const get = id => state.pieces[id];
  const spec = id => specs.get(id);
  const members = id => {
    const p = get(id);
    if (!p || p.hidden) return [];
    return (p.pile ? Object.keys(state.pieces).filter(key => !get(key).hidden && get(key).pile === p.pile) : [id]).sort((a, b) => get(a).z - get(b).z);
  };
  const remember = (restoreNotes = false) => { history.push({data:copy(state),restoreNotes}); if (history.length > 30) history.shift(); };
  const nextZ = () => Math.max(0, ...Object.values(state.pieces).map(p => p.z)) + 1;
  const lift = ids => { let z = nextZ(); ids.forEach(id => { get(id).z = z++; }); };
  function movable(id) { return Boolean(get(id) && !get(id).hidden && !spec(id).locked); }
  function transact(fn) { const before = copy(state); fn(); if (JSON.stringify(before) !== JSON.stringify(state)) { if (!batching) { history.push({data:before,restoreNotes:false}); if (history.length > 30) history.shift(); } return true; } return false; }
  function batch(fn) {
    if (batching) return fn();
    const before = copy(state); batching = true;
    try { fn(); } finally { batching = false; }
    if (JSON.stringify(before) !== JSON.stringify(state)) { history.push({data:before,restoreNotes:false}); if (history.length > 30) history.shift(); return true; }
    return false;
  }
  function move(id, dx, dy, wholePile = false) {
    if (!movable(id) || !finite(dx) || !finite(dy)) return false;
    const ids = wholePile ? members(id).filter(movable) : [id];
    return transact(() => {
      if (!wholePile) get(id).pile = null;
      const minX = Math.min(...ids.map(key => get(key).x-margins(spec(key),get(key).angle).x)), minY = Math.min(...ids.map(key => get(key).y-margins(spec(key),get(key).angle).y));
      const maxX = Math.max(...ids.map(key => get(key).x+spec(key).width+margins(spec(key),get(key).angle).x)), maxY = Math.max(...ids.map(key => get(key).y+spec(key).height+margins(spec(key),get(key).angle).y));
      const x = clamp(dx, -minX, kit.size.width - maxX), y = clamp(dy, -minY, kit.size.height - maxY);
      ids.forEach(key => { get(key).x += x; get(key).y += y; }); lift(ids);
    });
  }
  function rotate(id, degrees, wholePile = false) {
    if (!movable(id) || !finite(degrees)) return false;
    const ids=(wholePile ? members(id) : [id]).filter(movable);
    if(ids.some(key=>{const p=spec(key),m=margins(p,((get(key).angle+degrees+540)%360)-180);return p.width+2*m.x>kit.size.width||p.height+2*m.y>kit.size.height;})) return false;
    return transact(() => ids.forEach(key => { const s=get(key),p=spec(key);s.angle=((s.angle+degrees+540)%360)-180;const m=margins(p,s.angle);s.x=clamp(s.x,m.x,kit.size.width-p.width-m.x);s.y=clamp(s.y,m.y,kit.size.height-p.height-m.y); }));
  }
  function flip(id, wholePile = false) {
    if (!get(id) || get(id).hidden || !spec(id).back) return false;
    return transact(() => {
      const ids=wholePile?members(id):[id];
      ids.forEach(key=>{if(spec(key).back)get(key).faceDown=!get(key).faceDown;});
      if(wholePile&&ids.length>1)lift(ids.toReversed());
    });
  }
  function stack(ids, target) {
    const targetSpec = spec(target), destination = get(target);
    if (!destination || destination.hidden || !movable(target) || !['card','token'].includes(targetSpec.type)) return false;
    const eligible = [...new Set(ids)].filter(id => id !== target && movable(id) && spec(id).type === targetSpec.type && Math.abs(spec(id).width - targetSpec.width) < 1 && Math.abs(spec(id).height - targetSpec.height) < 1);
    if (!eligible.length) return false;
    return transact(() => {
      const pile = destination.pile || `pile-${target}`;
      destination.pile = pile;
      for (const id of eligible) Object.assign(get(id), { x: destination.x, y: destination.y, angle: destination.angle, pile });
      lift(eligible);
    });
  }
  function shuffle(id, random = Math.random) {
    const ids = members(id);
    if (ids.length < 2 || !ids.every(movable)) return false;
    return transact(() => {
      for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(clamp(random(), 0, .9999999999) * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
      lift(ids);
    });
  }
  function spread(id) {
    const ids = members(id);
    if (ids.length < 2 || !ids.every(movable)) return false;
    return transact(() => {
      const start = get(id), w = spec(id).width, h = spec(id).height;
      const cols = Math.max(1, Math.min(6, Math.floor((kit.size.width - 48) / (w + 14))));
      const rows = Math.ceil(ids.length / cols), maxY = Math.max(0, kit.size.height - Math.min(rows, 3) * (h + 18));
      const x = clamp(start.x, 16, Math.max(16, kit.size.width - cols * (w + 14))), y = clamp(start.y, 16, Math.max(16, maxY));
      ids.forEach((key, i) => Object.assign(get(key), { x: clamp(x + (i % cols) * (w + 14), 0, kit.size.width - w), y: clamp(y + Math.floor(i / cols) * Math.min(h + 18, Math.max(34, (kit.size.height - y - h) / Math.max(1, rows - 1))), 0, kit.size.height - h), angle: 0, pile: null })); lift(ids);
    });
  }
  function container(id, close = false) {
    const contents = spec(id)?.contains;
    if (!contents?.length) return false;
    return transact(() => {
      const apply = child => {
        get(child).hidden = close;
        if (close) (spec(child).contains || []).forEach(apply);
      };
      contents.forEach(apply);
      if (!close) lift(contents);
    });
  }
  function note(key, value) { if (typeof key !== 'string' || ['__proto__','constructor','prototype'].includes(key)) return; state.notes[key] = String(value).slice(0,16000); }
  return {
    get, spec, members, move, rotate, flip, stack, shuffle, spread, container, note, batch,
    snapshot: () => copy(state),
    undo: () => { if (!history.length) return false; const previous=history.pop(),notes=state.notes; state=previous.data; if(!previous.restoreNotes)state.notes=notes;return true; },
    reset: () => { remember(true); state = initialPhysicalState(kit); },
    canUndo: () => history.length > 0,
    isMovable: movable,
  };
}
