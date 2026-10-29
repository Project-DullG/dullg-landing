import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createPhysicalTableState } from '../public/student-games/physical-state.mjs';

// Run the shipped hand/focus functions with the real physical model. The small
// element doubles below are only event/focus sinks; no browser or renderer runs.
const source = readFileSync(new URL('../public/student-games/physical-table.mjs', import.meta.url), 'utf8');
const ast = ts.createSourceFile('physical-table.mjs', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const names = new Set(['paint', 'focusPiece', 'restoreTableFocus', 'openDialog', 'closeDialog', 'select', 'handlePieceKey', 'setSceneState']);
const functions = [];
let closeHandlers = '', fallback = '';
function collect(node) {
  if (ts.isFunctionDeclaration(node) && names.has(node.name?.text)) functions.push(node.getText(ast));
  if (ts.isForOfStatement(node) && node.getText(ast).startsWith('for (const dialog of [inspection,helpDialog,resetDialog])') && node.statement.getText(ast).startsWith("on(dialog,'close'")) closeHandlers = node.getText(ast);
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'sceneFallback') fallback = `const sceneFallback = ${node.initializer.getText(ast)};`;
  ts.forEachChild(node, collect);
}
collect(ast);
assert.equal(functions.length, names.size);
assert.ok(closeHandlers && fallback);

class Element {
  constructor(kind, document) {
    this.kind = kind; this.document = document; this.dataset = {}; this.attributes = new Map();
    this.disabled = false; this.isConnected = true; this.listeners = {}; this.children = [];
    this.style = { setProperty() {} }; this.focuses = []; this.textWrites = 0;
    const classes = new Set();
    this.classList = { contains: name => classes.has(name), add: name => classes.add(name), toggle: (name, value) => value ? classes.add(name) : classes.delete(name) };
  }
  set textContent(value) { this.text = value; this.textWrites++; }
  get textContent() { return this.text; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  contains(node) { for (; node; node = node.parent) if (node === this) return true; return false; }
  closest(selector) {
    if (selector === '.physical-piece' && this.kind === 'piece') return this;
    if (selector === 'button[data-hand]' && this.kind === 'tool') return this;
    if (selector.startsWith('textarea,input,select,a') && this.editable) return this;
    if (selector.startsWith('[hidden]') && (this.blocked || this.attributes.get('aria-hidden') === 'true' || this.kind === 'dialog' && !this.open)) return this;
    return this.parent?.closest(selector) ?? null;
  }
  querySelector(selector) { return ({ '.physical-front': this.front, '.physical-back': this.back, '.physical-pile-count': this.badge })[selector]; }
  querySelectorAll() { return this.notes || []; }
  focus(options) { this.focuses.push(options); this.document.activeElement = this; }
  showModal() { this.open = true; this.document.modal = this; }
  close() { this.open = false; if (this.document.modal === this) this.document.modal = null; this.listeners.close?.(); }
}

function harness() {
  const document = { activeElement: null, modal: null, querySelector: () => document.modal };
  const world = new Element('world', document), toolbar = new Element('toolbar', document), viewport = new Element('viewport', document);
  const shell = new Element('shell', document), sceneStatus = new Element('status', document), instructions = new Element('instructions', document);
  const inspection = new Element('dialog', document), helpDialog = new Element('dialog', document), resetDialog = new Element('dialog', document);
  const inspectionBody = { clears: 0, replaceChildren() { this.clears++; } };
  const kit = { id:'physical-hands-test', title:'구성품', size:{width:1000,height:800}, pieces:[
    {id:'a',label:'A',type:'card',x:100,y:100,width:100,height:150,front:'A',back:'같은 뒷면',faceDown:true,pile:'deck'},
    {id:'b',label:'B',type:'card',x:100,y:100,width:100,height:150,front:'B',back:'같은 뒷면',faceDown:true,pile:'deck'},
    {id:'c',label:'C',type:'card',x:400,y:100,width:100,height:150,front:'C',back:'같은 뒷면',faceDown:true},
  ] };
  const model = createPhysicalTableState(kit), nodes = new Map();
  for (const p of kit.pieces) {
    const node = new Element('piece', document); node.dataset.piece = p.id; node.parent = world;
    node.front = {}; node.back = {}; node.badge = {}; nodes.set(p.id, node);
  }
  const tool = new Element('tool', document); tool.parent = toolbar;
  const calls = [], focusCalls = [];
  const setup = { document, world, toolbar, viewport, shell, sceneStatus, instructions, inspection, helpDialog, resetDialog, inspectionBody, kit, model, nodes, tool, calls, focusCalls };
  const make = Function('setup', `
    const {document,world,toolbar,viewport,shell,sceneStatus,instructions,inspection,helpDialog,resetDialog,inspectionBody,kit,model,nodes,calls,focusCalls} = setup;
    const camera={getState:()=>({scale:1})};
    const host={querySelector:selector=>selector==='.tabletop-instructions'?instructions:null};
    const dialogReturnFocus=new Map();
    const on=(node,event,handler)=>{node.listeners[event]=handler;};
    const touchEditing=target=>target.closest('textarea,input,select,a,[contenteditable="true"]');
    const visibleLabel=id=>model.get(id).faceDown?'카드 뒷면':model.spec(id).label;
    const countLabel=(id,count)=>count+'장';
    let selected='b',pileMode=true,destroyed=false,sceneState=null,scene=null,inspectId=null;
    let disableTool=false;
    const updateTools=()=>{if(disableTool)setup.tool.disabled=true;};
    const run=action=>calls.push(['run',action,selected]);
    const inspect=id=>calls.push(['inspect',id]);
    const change=fn=>{fn();paint();};
    ${functions.join('\n')}
    ${closeHandlers}
    ${fallback}
    return {select,paint,handlePieceKey,openDialog,closeDialog,restoreTableFocus,setSceneState,sceneFallback,
      state:()=>({selected,pileMode,sceneState,inspectId}),
      setState:value=>{if('selected'in value)selected=value.selected;if('pileMode'in value)pileMode=value.pileMode;if('inspectId'in value)inspectId=value.inspectId;if('destroyed'in value)destroyed=value.destroyed;if('scene'in value)scene=value.scene;},
      disableToolOnPaint:()=>{disableTool=true;}};
  `);
  return { ...setup, ...make(setup) };
}
function key(target, value, options = {}) {
  return { target, key:value, prevented:0, stopped:0, preventDefault(){this.prevented++;}, stopPropagation(){this.stopped++;}, ...options };
}

test('같은 카드나 같은 더미를 다시 잡아도 더미째 이동 설정은 유지한다', () => {
  const h = harness();
  h.select('b',true); assert.equal(h.state().pileMode,true);
  h.select('a',true); assert.equal(h.state().pileMode,true);
  assert.equal(h.document.activeElement,h.nodes.get('b'));
  h.select('c'); assert.equal(h.state().pileMode,false);
});

test('선택한 물건이 사라지면 더미째 이동 설정도 함께 비운다', () => {
  const h=harness();h.setState({selected:null,pileMode:true});h.paint();
  assert.equal(h.state().selected,null);assert.equal(h.state().pileMode,false);
});

test('더미를 뒤집어 맨 위가 바뀌면 초점도 실제 맨 위 카드로 옮긴다', () => {
  const h = harness(); h.nodes.get('b').focus({preventScroll:true});
  h.model.flip('b',true); h.paint();
  assert.equal(h.state().selected,'a');
  assert.equal(h.document.activeElement,h.nodes.get('a'));
  assert.equal(h.nodes.get('b').attributes.get('aria-hidden'),'true');
  assert.deepEqual(h.nodes.get('a').focuses.at(-1),{preventScroll:true});
});

test('이전 아래 카드에서 온 방향키와 Enter도 현재 맨 위 카드만 조작한다', () => {
  const h = harness(); h.setState({pileMode:false}); h.model.flip('b',true);
  h.handlePieceKey(key(h.nodes.get('b'),'Enter'));
  assert.deepEqual(h.calls.at(-1),['inspect','a']);
  h.handlePieceKey(key(h.nodes.get('b'),'ArrowRight'));
  assert.equal(h.model.get('a').x,110); assert.equal(h.model.get('b').x,100);
});

test('툴바 F/R은 선택물을 조작하고 Enter/Space와 입력·대화상자는 본래 동작을 유지한다', () => {
  const h = harness();
  for (const value of ['Enter',' ','ArrowRight']) { const e=key(h.tool,value); h.handlePieceKey(e); assert.equal(e.prevented,0); }
  h.handlePieceKey(key(h.tool,'f')); h.handlePieceKey(key(h.tool,'R',{shiftKey:true}));
  assert.deepEqual(h.calls,[['run','flip','b'],['run','rotate-left','b']]);
  const input = new Element('input',h.document); input.editable=true; input.parent=h.nodes.get('b');
  h.handlePieceKey(key(input,'f')); h.handlePieceKey(key(h.tool,'f',{isComposing:true}));
  h.document.modal=h.helpDialog; h.handlePieceKey(key(h.tool,'f'));
  assert.equal(h.calls.length,2);
});

test('실행 후 비활성화된 도구에 초점을 남기지 않는다', () => {
  const h=harness();h.tool.focus();h.disableToolOnPaint();h.paint();
  assert.equal(h.document.activeElement,h.nodes.get('b'));
});

test('확대 읽기의 Escape와 닫기는 같은 정리·초점 복원 경로를 사용한다', () => {
  for (const escape of [false,true]) {
    const h=harness();h.nodes.get('b').focus();h.setState({inspectId:'b'});h.openDialog(h.inspection);
    h.model.flip('b',true);
    if(escape)h.inspection.close();else h.closeDialog(h.inspection);
    assert.equal(h.state().inspectId,null);assert.equal(h.inspectionBody.clears,1);
    assert.equal(h.document.activeElement,h.nodes.get('a'));
  }
});

test('열린 대화상자를 겹쳐 열지 않으며 다른 대화상자의 초점을 빼앗지 않는다', () => {
  const h=harness();h.tool.focus();assert.equal(h.openDialog(h.inspection),true);
  assert.equal(h.openDialog(h.helpDialog),false);assert.equal(h.helpDialog.open,undefined);
  h.document.modal=h.helpDialog;h.restoreTableFocus(h.tool);assert.equal(h.tool.focuses.length,1);
});

test('3D에서 읽기를 닫을 때 숨은 원본 입력칸에 커서를 돌려주지 않는다', () => {
  const h=harness();h.viewport.classList.add('physical-scene-ready');
  const input=new Element('input',h.document);input.editable=true;input.parent=h.nodes.get('b');
  h.restoreTableFocus(input);assert.equal(h.document.activeElement,h.nodes.get('b'));assert.equal(input.focuses.length,0);
});

test('3D 준비·실패 상태를 명확히 표시하고 실패 중복 콜백은 중복 안내하지 않는다', () => {
  const h=harness();let destroys=0;const before=h.model.snapshot();
  h.setSceneState('loading');h.setSceneState('loading');assert.equal(h.sceneStatus.textWrites,1);
  h.setState({scene:{destroy(){destroys++;}}});h.sceneFallback();h.sceneFallback();
  assert.equal(destroys,1);assert.equal(h.sceneStatus.textWrites,2);
  assert.equal(h.shell.dataset.sceneState,'fallback');assert.equal(h.viewport.dataset.sceneState,'fallback');
  assert.match(h.sceneStatus.textContent,/계속 사용할 수/);assert.deepEqual(h.model.snapshot(),before);
  h.setState({destroyed:true});h.setSceneState('ready');assert.equal(h.state().sceneState,'fallback');
});
