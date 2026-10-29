import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhysicalTableState, initialPhysicalState, restorePhysicalState, validateKit } from '../public/student-games/physical-state.mjs';

const kit = {
  id: 'test-physical-only', title:'구성품', size:{width:1000,height:800},
  pieces:[
    {id:'a',label:'비밀 A',type:'card',x:100,y:100,width:100,height:150,front:'A',back:'같은 뒷면',faceDown:true,pile:'deck'},
    {id:'b',label:'비밀 B',type:'card',x:100,y:100,width:100,height:150,front:'B',back:'같은 뒷면',faceDown:true,pile:'deck'},
    {id:'c',label:'비밀 C',type:'card',x:100,y:100,width:100,height:150,front:'C',back:'같은 뒷면',faceDown:true,pile:'deck'},
    {id:'envelope',label:'봉투',type:'envelope',x:600,y:50,width:200,height:140,front:'봉투',contains:['clue','answer']},
    {id:'clue',label:'문서',type:'paper',x:500,y:400,width:100,height:160,front:'자료',hidden:true},
    {id:'answer',label:'정답',type:'card',x:620,y:400,width:100,height:150,front:'정답',back:'봉인',faceDown:true,hidden:true},
    {id:'coin-a',label:'1냥',type:'token',x:800,y:400,width:40,height:40,front:'1'},
    {id:'coin-b',label:'1냥',type:'token',x:850,y:400,width:40,height:40,front:'1'},
    {id:'mat',label:'매트',type:'board',x:20,y:20,width:300,height:300,front:'매트',locked:true},
  ],
};

test('한 장 인출과 더미 이동은 개수와 나머지 카드의 앞뒷면을 보존한다',()=>{
  const table=createPhysicalTableState(kit);
  table.move('c',200,100);
  assert.deepEqual(table.members('b'),['a','b']);
  assert.equal(table.get('c').pile,null);
  assert.deepEqual([table.get('c').x,table.get('c').y],[300,200]);
  table.move('b',30,40,true);
  assert.deepEqual([table.get('a').x,table.get('a').y],[130,140]);
  assert.deepEqual([table.get('b').x,table.get('b').y],[130,140]);
  assert.equal(table.get('c').x,300);
  assert.equal(Object.keys(table.snapshot().pieces).length,9);
  assert.ok(['a','b','c'].every(id=>table.get(id).faceDown));
});

test('이동과 포개기를 한 손동작으로 되돌리고, 섞기는 면을 열지 않는다',()=>{
  const table=createPhysicalTableState(kit);
  table.move('c',200,100);
  const before=table.snapshot();
  table.batch(()=>{table.move('c',-200,-100);table.stack(['c'],'b');});
  assert.equal(table.members('b').length,3);
  table.undo();
  assert.deepEqual(table.snapshot(),before);
  table.stack(['c'],'b');
  const ids=table.members('b');
  table.shuffle('b',()=>0);
  assert.deepEqual(table.members('b').toSorted(),ids.toSorted());
  assert.notDeepEqual(table.members('b'),ids);
  assert.ok(ids.every(id=>table.get(id).faceDown));
});

test('같은 규격 동전을 포개도 수량이나 금액을 자동으로 만들지 않는다',()=>{
  const table=createPhysicalTableState(kit);
  assert.equal(table.stack(['coin-b'],'coin-a'),true);
  assert.equal(table.members('coin-a').length,2);
  table.move('coin-b',-200,0);
  assert.equal(table.members('coin-a').length,1);
  assert.equal(table.snapshot().pieces['coin-b'].x,600);
  assert.equal(Object.keys(table.snapshot().pieces).length,kit.pieces.length);
  assert.deepEqual(Object.keys(table.snapshot()).sort(),['kit','notes','pieces','version']);
});

test('봉투 개봉은 문서만 꺼내고 정답을 뒤집거나 질문을 판정하지 않는다',()=>{
  const table=createPhysicalTableState(kit);
  assert.equal(table.get('clue').hidden,true);
  table.container('envelope');
  assert.equal(table.get('clue').hidden,false);
  assert.equal(table.get('answer').hidden,false);
  assert.equal(table.get('answer').faceDown,true);
  table.flip('answer');
  assert.equal(table.get('answer').faceDown,false);
  assert.equal(table.get('a').faceDown,true);
  table.container('envelope',true);
  assert.ok(['clue','answer'].every(id=>table.get(id).hidden));
  table.undo();
  assert.equal(table.get('clue').hidden,false);
});

test('저장은 물건과 필기만 복원하고 잘못된 좌표와 다른 키트는 거부한다',()=>{
  const table=createPhysicalTableState(kit);
  table.move('a',200,80); table.note('record','첫날의 근거');
  const restored=createPhysicalTableState(kit,table.snapshot());
  assert.deepEqual(restored.snapshot(),table.snapshot());
  const corrupt=table.snapshot(); corrupt.pieces.a.x=Infinity;
  assert.deepEqual(restorePhysicalState(kit,corrupt),initialPhysicalState(kit));
  const wrongKit=table.snapshot();wrongKit.kit='old-assisted-game';
  assert.deepEqual(restorePhysicalState(kit,wrongKit),initialPhysicalState(kit));
  table.reset();assert.equal(table.snapshot().notes.record,undefined);
  table.undo();assert.equal(table.snapshot().notes.record,'첫날의 근거');
});

test('카드 흩어놓기와 이동은 테이블 범위와 구성품 보존을 지킨다',()=>{
  const table=createPhysicalTableState(kit);
  table.spread('c');
  for(const id of ['a','b','c']){
    assert.equal(table.get(id).pile,null);
    assert.ok(table.get(id).x>=0&&table.get(id).x+table.spec(id).width<=kit.size.width);
    assert.ok(table.get(id).y>=0&&table.get(id).y+table.spec(id).height<=kit.size.height);
  }
  table.move('a',-10000,10000);
  assert.equal(table.get('a').x,0);assert.equal(table.get('a').y,650);
  assert.equal(table.move('mat',500,300),false);
});

test('중복 구성품과 순환 봉투는 잘못된 키트로 거부한다',()=>{
  assert.throws(()=>validateKit({...kit,pieces:[...kit.pieces,kit.pieces[0]]}),/겹칩니다/);
  const circular=structuredClone(kit);circular.pieces.find(p=>p.id==='clue').contains=['envelope'];
  assert.throws(()=>validateKit(circular),/서로 포함/);
});

test('물건 배치를 되돌려도 나중에 작성한 종이 메모를 지우지 않는다',()=>{
  const table=createPhysicalTableState(kit);
  table.move('a',100,0);table.note('record','이동 후 적은 근거');table.undo();
  assert.equal(table.get('a').x,100);
  assert.equal(table.snapshot().notes.record,'이동 후 적은 근거');
  table.reset();assert.deepEqual(table.snapshot().notes,{});
  table.undo();assert.equal(table.snapshot().notes.record,'이동 후 적은 근거');
});

test('탁자 모서리의 카드도 회전한 실제 외곽 전체가 안쪽에 남는다',()=>{
  const table=createPhysicalTableState(kit);
  table.move('a',-1000,-1000);table.rotate('a',90);
  assert.ok(table.get('a').x>=25);
  table.move('a',-1000,10000);
  assert.ok(table.get('a').x>=25);
  const restored=createPhysicalTableState(kit,table.snapshot());
  assert.deepEqual(restored.snapshot(),table.snapshot());
});

test('더미 전체를 뒤집으면 실제 카드처럼 순서도 반대로 되고 두 번이면 돌아온다',()=>{
  const table=createPhysicalTableState(kit),before=table.members('c');
  table.flip('c',true);
  assert.deepEqual(table.members('a'),before.toReversed());
  assert.ok(before.every(id=>!table.get(id).faceDown));
  table.flip('a',true);
  assert.deepEqual(table.members('c'),before);
  assert.ok(before.every(id=>table.get(id).faceDown));
});
