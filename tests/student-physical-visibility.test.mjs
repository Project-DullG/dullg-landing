import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createPhysicalTableState } from '../public/student-games/physical-state.mjs';
import marketKit from '../public/student-games/island-market/physical-kit.mjs';

// Exercise the shipped visibility/focus code with the actual physical model.
// This verifies DOM boundaries, not a browser's accessibility-tree rendering.
const source = readFileSync(new URL('../public/student-games/physical-table.mjs', import.meta.url), 'utf8');
const ast = ts.createSourceFile('physical-table.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const functions = [], bindings = [];
function collect(node) {
  if (ts.isFunctionDeclaration(node) && ['paint', 'focusPiece'].includes(node.name?.text)) functions.push(node.getText(ast));
  if (ts.isVariableDeclaration(node) && ['visibleLabel', 'countLabel'].includes(node.name.getText(ast))) bindings.push(`const ${node.getText(ast)};`);
  ts.forEachChild(node, collect);
}
collect(ast);
assert.equal(functions.length, 2); assert.equal(bindings.length, 2);

class Element {
  constructor(doc, parent = null) {
    this.document = doc; this.parent = parent; this.dataset = {}; this.attributes = new Map();
    this.style = {}; this.notes = []; this.front = {}; this.back = {}; this.badge = {};
    const classes = new Set();
    this.classList = { contains: name => classes.has(name), add: name => classes.add(name),
      toggle: (name, value) => value ? classes.add(name) : classes.delete(name) };
  }
  set inert(value) { if (value) this.attributes.set('inert', ''); else this.attributes.delete('inert'); }
  get inert() { return this.attributes.has('inert'); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  contains(node) { for (; node; node = node.parent) if (node === this) return true; return false; }
  closest(selector) { return selector === '.physical-piece' && this.dataset.piece ? this : this.parent?.closest(selector) || null; }
  querySelector(selector) { return { '.physical-front': this.front, '.physical-back': this.back, '.physical-pile-count': this.badge }[selector]; }
  querySelectorAll() { return this.notes; }
  focus() { this.document.activeElement = this; }
}

function harness(kit, saved = null, three = false) {
  const document = { activeElement: null }, world = new Element(document), toolbar = new Element(document), viewport = new Element(document);
  if (three) viewport.classList.add('physical-scene-ready');
  const model = createPhysicalTableState(kit, saved), nodes = new Map();
  for (const p of kit.pieces) {
    const node = new Element(document, world); node.dataset.piece = p.id;
    node.setAttribute('role', p.front.includes('data-note=') ? 'group' : 'button');
    for (const match of p.front.matchAll(/data-note="([^"]+)"/g)) {
      const field = new Element(document, node); field.dataset.note = match[1]; field.defaultValue = ''; field.value = '';
      node.notes.push(field);
    }
    nodes.set(p.id, node);
  }
  const setup = { document, world, toolbar, viewport, model, nodes, kit };
  const api = Function('setup', `
    const {document,world,toolbar,viewport,model,nodes,kit}=setup;
    let selected=null,pileMode=false;
    const camera={getState:()=>({scale:1})},scene=null,updateTools=()=>{};
    ${bindings.join('\n')}
    ${functions.join('\n')}
    return {paint,setSelected:id=>{selected=id;},selected:()=>selected};
  `)(setup);
  return { ...setup, ...api };
}

const kit = { id: 'visibility-test', size: { width: 1100, height: 800 }, pieces: [
  ...['a', 'b', 'c'].map(id => ({ id, label: id.toUpperCase(), backLabel: '같은 카드 뒷면', type: 'card',
    x: 100, y: 100, width: 100, height: 150, front: id, back: '공통 뒷면', faceDown: true, pile: 'deck' })),
  { id: 'envelope', label: '봉투', type: 'envelope', x: 450, y: 100, width: 200, height: 150, front: '봉투', contains: ['secret'] },
  { id: 'secret', label: '기록지', type: 'paper', x: 700, y: 100, width: 200, height: 220,
    front: '<textarea data-note="secret-note"></textarea>', hidden: true },
] };

function assertBoundaries(h) {
  for (const p of h.kit.pieces) {
    const state = h.model.get(p.id), node = h.nodes.get(p.id);
    const exposed = !state.hidden && h.model.members(p.id).at(-1) === p.id;
    assert.equal(node.inert, !exposed, p.id + ': pointer/keyboard/AT subtree boundary');
    assert.equal(node.getAttribute('aria-hidden'), String(!exposed), p.id + ': aria state');
    assert.equal(node.tabIndex, exposed ? 0 : -1, p.id + ': tab order');
    assert.equal(node.getAttribute('role'), p.front.includes('data-note=') ? 'group' : 'button', p.id + ': identity role');
    if (exposed) assert.ok(node.getAttribute('aria-label'), p.id + ': usable top name');
    assert.equal(node.dataset.piece, p.id);
  }
}

test('실제 장터의 더미 아래 물건은 inert이고 맨 위 물건의 이름·수량·역할은 유지한다', () => {
  const h = harness(marketKit, null, true), before = h.model.snapshot(); h.paint();
  assertBoundaries(h);
  const blocked = [...h.nodes.values()].filter(node => node.inert);
  assert.ok(blocked.length > 300, '실제 큰 더미들의 아래 구성품을 검사해야 한다');
  for (const p of marketKit.pieces) {
    const members = h.model.members(p.id);
    if (!h.nodes.get(p.id).inert && members.length > 1) {
      assert.ok(h.nodes.get(p.id).getAttribute('aria-label').includes(`${members.length}${p.type === 'token' ? '개' : '장'} 더미`));
    }
  }
  assert.deepEqual(h.model.snapshot(), before, 'visibility cannot move, flip or save model data');
});

test('한 장 인출·되돌리기·더미 뒤집기는 새 맨 위의 inert를 풀고 현재 면으로 초점을 옮긴다', () => {
  const h = harness(kit); h.setSelected('c'); h.paint();
  assert.equal(h.nodes.get('c').getAttribute('aria-label'), '같은 카드 뒷면 3장 더미');
  h.nodes.get('c').focus(); h.model.move('c', 150, 0); h.paint(); assertBoundaries(h);
  assert.equal(h.nodes.get('b').inert, false); assert.equal(h.nodes.get('c').inert, false);
  h.model.undo(); h.paint(); assertBoundaries(h); assert.equal(h.nodes.get('b').inert, true);
  h.model.flip('c', true); const flipped = h.model.snapshot(); h.paint();
  assertBoundaries(h); assert.equal(h.document.activeElement, h.nodes.get('a'));
  assert.equal(h.nodes.get('a').getAttribute('aria-label'), 'A 3장 더미');
  assert.deepEqual(h.model.snapshot(), flipped);
});

test('펼치기와 저장 복원에서도 DOM 노출 상태만 바뀌며 물건 데이터에 inert를 저장하지 않는다', () => {
  const h = harness(kit); h.model.spread('c'); const spread = h.model.snapshot(); h.paint();
  assertBoundaries(h); for (const id of ['a', 'b', 'c']) assert.equal(h.nodes.get(id).inert, false);
  assert.deepEqual(h.model.snapshot(), spread);
  const restored = harness(kit, JSON.parse(JSON.stringify(spread))); restored.paint(); assertBoundaries(restored);
  assert.deepEqual(restored.model.snapshot(), spread);
  h.model.undo(); h.paint(); assertBoundaries(h);
  assert.equal(h.nodes.get('a').inert, true); assert.equal(h.nodes.get('c').inert, false);
  for (const state of Object.values(h.model.snapshot().pieces)) assert.equal(Object.hasOwn(state, 'inert'), false);
});

test('봉투를 닫으면 기록칸까지 inert로 묶고 다시 열면 필기와 group 역할을 복구한다', () => {
  const h = harness(kit); h.paint();
  const note = h.nodes.get('secret').notes[0]; assert.equal(note.tabIndex, -1);
  h.model.container('envelope'); h.model.note('secret-note', '남겨 둔 기록'); h.paint();
  assertBoundaries(h); assert.equal(h.nodes.get('secret').inert, false); assert.equal(note.tabIndex, 0);
  assert.equal(note.value, '남겨 둔 기록');
  h.model.container('envelope', true); h.paint(); assertBoundaries(h); assert.equal(note.tabIndex, -1);
  h.model.undo(); h.paint(); assertBoundaries(h); assert.equal(note.value, '남겨 둔 기록'); assert.equal(note.tabIndex, 0);
});
