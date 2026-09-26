import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, catches, fishFor, stepsFor, reviewFor } from '../lib/speaking/catalog/fishing/model.ts';
import { courses } from '../lib/speaking/catalog/speaking/courses.ts';
import { quizzes } from '../lib/speaking/catalog/fishing/quizzes.ts';
import { applyCompletion } from '../lib/speaking/catalog/fishing/rules.ts';
import { applyRepeat, repeatDecks } from '../lib/speaking/catalog/speaking/repeat.ts';
import { collectionRecords, catchTraits } from '../lib/speaking/catalog/fishing/collection.ts';
import { buildStudySnapshot } from '../lib/speaking/catalog/view.ts';

test('반복 연습 여섯 묶음의 문항·음성·한글 안내가 모두 존재한다', () => {
 const data=buildStudySnapshot(emptyState(),{course:'week',day:0,minutes:60});
 assert.equal(repeatDecks.length,6);
 for(const deck of repeatDecks)for(const id of deck.ids){const item=data.repeatItems.find(i=>i.question.id===id);assert.ok(item,id);assert.ok(item.audio.full,id);assert.ok(item.sentences.every(s=>s.hangul));}
});
test('반복 연습 단계·회차 재전송은 중복 집계되지 않고 코스 진도를 바꾸지 않고 하루 한 번만 별도 보상을 준다', () => {
 let state=emptyState();state=applyRepeat(state,{action:'begin',deck:'read',expectedRun:1}).state;
 assert.throws(()=>applyRepeat(state,{action:'advance',run:1,step:1,selfReport:true}));
 assert.throws(()=>applyRepeat(state,{action:'advance',run:1,step:0,selfReport:false}));
 for(let step=0;step<6;step++){state=applyRepeat(state,{action:'advance',run:1,step,selfReport:true}).state; const dup=applyRepeat(state,{action:'advance',run:1,step,selfReport:true});assert.equal(dup.duplicate,true);assert.deepEqual(dup.state,state);}
 assert.equal(state.repeat.rounds.read,1);assert.equal(state.repeat.active,undefined);
 assert.deepEqual(state.events,[]);assert.equal(catches(state).length,0);
 assert.throws(()=>applyRepeat(state,{action:'begin',deck:'read',expectedRun:1}));
 state=applyRepeat(state,{action:'begin',deck:'respond',expectedRun:2}).state;
 assert.equal(applyRepeat(state,{action:'advance',run:1,step:5,selfReport:true}).duplicate,true);
 assert.equal(state.repeat.active.run,2);
 const snapshot=buildStudySnapshot(state,{course:'month',day:0,minutes:120});assert.equal(snapshot.repeat.active.run,2);assert.equal(snapshot.totalFish,1);
});
test('담은 문항은 중복되지 않고 진행 중 문항 목록은 이후 변경과 독립이다', () => {
 let a=emptyState(),b=emptyState();for(const id of ['YO06','YR01'])a=applyRepeat(a,{action:'bookmark',question:id,saved:true}).state;
 a=applyRepeat(a,{action:'bookmark',question:'YO06',saved:true}).state;assert.equal(a.repeat.bookmarks.length,2);
 a=applyRepeat(a,{action:'begin',deck:'saved',expectedRun:1}).state;
 const ids=[...a.repeat.active.ids];a=applyRepeat(a,{action:'bookmark',question:'YO06',saved:false}).state;
 assert.deepEqual(a.repeat.active.ids,ids);assert.equal(b.repeat,undefined);
 assert.throws(()=>applyRepeat(a,{action:'bookmark',question:'missing',saved:true}));
 a=applyRepeat(a,{action:'abandon',run:1}).state;assert.equal(a.repeat.active,undefined);assert.deepEqual(a.repeat.rounds,{});
});
test('진행 중인 반복 연습은 같은 시작 요청만 재전송할 수 있고 다른 시작 요청은 진도를 보존하며 거절한다', () => {
 const begin={action:'begin',deck:'read',expectedRun:1};
 let state=applyRepeat(emptyState(),begin).state;
 state=applyRepeat(state,{action:'advance',run:1,step:0,selfReport:true}).state;
 const before=structuredClone(state);
 const duplicate=applyRepeat(state,begin);
 assert.equal(duplicate.duplicate,true);assert.strictEqual(duplicate.state,state);
 for(const request of [
  {...begin,expectedRun:2},
  {...begin,deck:'respond'},
  {action:'begin',deck:'feed',catchId:'0:0',expectedRun:2},
 ]){
  assert.throws(()=>applyRepeat(state,request),/진행 중인 연습/);
  assert.deepEqual(state,before);
 }
 state=applyRepeat(state,{action:'abandon',run:1}).state;
 state=applyRepeat(state,{action:'begin',deck:'respond',expectedRun:2}).state;
 assert.equal(state.repeat.active.deck,'respond');assert.equal(state.repeat.active.run,2);
 assert.deepEqual(state.repeat.rounds,{});assert.equal(state.practiceCatches,undefined);
});
test('먹이 주기 재전송은 같은 회차와 물고기에만 허용하며 다른 물고기 선택은 기록을 바꾸지 않는다', () => {
 let state=emptyState();
 for(let step=0;catches(state).length<2;step++){
  state=applyCompletion(state,{day:0,step,selfReport:true,answer:quizzes[courses[2].days[0].ids[0]].correct}).state;
 }
 const [first,second]=collectionRecords(state);
 const begin={action:'begin',deck:'feed',catchId:first.id,expectedRun:1};
 state=applyRepeat(state,begin).state;
 state=applyRepeat(state,{action:'advance',run:1,step:0,selfReport:true}).state;
 const before=structuredClone(state);
 const duplicate=applyRepeat(state,begin);
 assert.equal(duplicate.duplicate,true);assert.strictEqual(duplicate.state,state);
 for(const request of [
  {...begin,catchId:second.id},
  {...begin,catchId:second.id,expectedRun:2},
  {...begin,expectedRun:2},
  {action:'begin',deck:'read',expectedRun:2},
 ]){
  assert.throws(()=>applyRepeat(state,request),/진행 중인 연습/);
  assert.deepEqual(state,before);
 }
 for(let step=1;step<6;step++)state=applyRepeat(state,{action:'advance',run:1,step,selfReport:true}).state;
 assert.equal(state.feedingLog[first.id].count,1);assert.equal(state.feedingLog[second.id],undefined);
 assert.equal(state.repeat.rounds.feed,1);assert.equal(state.practiceCatches.length,1);
});
test('150개 기존 보상은 그대로이며 크기와 무늬는 계정·획득 위치마다 고정된다', () => {
 let state={...emptyState(),collectionSeed:'test-account-a'};
 for(let day=0;day<30;day++){
  const steps=stepsFor(day,reviewFor(state,day));
  for(let step=0;step<steps.length;step++)state=applyCompletion(state,{day,step,selfReport:true,answer:quizzes[courses[2].days[day].ids[0]].correct,review:courses[2].days[day].ids[0]}).state;
 }
 const records=collectionRecords(state);assert.equal(records.length,150);assert.equal(records.filter(c=>c.star).length,30);assert.equal(new Set(records.map(c=>c.fish)).size,12);
 assert.equal(new Set(records.map(c=>c.grade)).size,4);assert.equal(new Set(records.map(c=>c.pattern)).size,3);
 for(const record of records){assert.equal(record.fish,fishFor(record.day,record.room));assert.ok(record.length>0);assert.deepEqual(record,collectionRecords(state).find(c=>c.id===record.id));}
 for(const day of [6,13,20,27])assert.equal(records.find(c=>c.day===day&&c.room===4).grade,3);
 assert.notDeepEqual(records,collectionRecords({...state,collectionSeed:'test-account-b'}));
 assert.deepEqual(collectionRecords({...state,featured:3}),records);
 assert.ok(records.filter(c=>c.grade===3).length<30);
 assert.deepEqual(catchTraits(0,0,0,'a'),catchTraits(0,0,0,'a'));
});

const finishRepeat = (state, now, deck='read') => {
  const begun=applyRepeat(state,{action:'begin', deck, expectedRun:state.repeat?.nextRun || 1}, now).state;
  const run=begun.repeat.active.run, count=begun.repeat.active.ids.length*2;
  let next=begun;
  for(let step=0;step<count;step++)next=applyRepeat(next,{action:'advance',run,step,selfReport:true},now).state;
  return {state:next, run, step:count-1};
};

test('반복 보상은 한국 시각 하루 한 번이며 자정 이후 옛 회차 재전송은 보상하지 않는다', async () => {
  const {growthSummary}=await import('../lib/speaking/catalog/fishing/growth.ts');
  const before=new Date('2026-09-09T14:59:59Z'), after=new Date('2026-09-09T15:00:01Z');
  const first=finishRepeat({...emptyState(),collectionSeed:'clock-qa'},before);
  assert.equal(first.state.practiceCatches.length,1);
  assert.equal(first.state.practiceCatches[0].date,'2026-09-09');
  const same=finishRepeat(first.state,before,'photo').state;
  assert.equal(same.practiceCatches.length,1);assert.equal(growthSummary(same,before).xp,20);
  const retry=applyRepeat(same,{action:'advance',run:first.run,step:first.step,selfReport:true},after);
  assert.equal(retry.duplicate,true);assert.equal(retry.state.practiceCatches.length,1);
  const second=finishRepeat(same,after,'respond').state;
  assert.equal(second.practiceCatches.length,2);assert.equal(growthSummary(second,after).xp,40);
  assert.deepEqual(collectionRecords(second).slice(0,1),collectionRecords(first.state));
  assert.equal(growthSummary(second,new Date('2026-09-20T12:00:00Z')).xp,40);
  let short=applyRepeat(emptyState(),{action:'bookmark',question:'R02',saved:true},before).state;
  short=finishRepeat(short,before,'saved').state;
  assert.equal(short.repeat.rounds.saved,1);assert.equal(short.practiceCatches,undefined);
});

test('레벨 상승과 수조 꾸미기는 이전 개체를 바꾸지 않으며 잠긴 수조를 선택할 수 없다', async () => {
  const {growthSummary, aquariumSummary, applyAquariumTheme}=await import('../lib/speaking/catalog/fishing/growth.ts');
  let state={...emptyState(),collectionSeed:'growth-qa'};
  state=applyCompletion(state,{day:0,step:0,selfReport:true}).state;
  const original=collectionRecords(state)[0];
  assert.throws(()=>applyAquariumTheme(state,'moon'));assert.throws(()=>applyAquariumTheme(state,'unknown'));
  for(let day=1;day<=75;day++)state=finishRepeat(state,new Date(Date.UTC(2026,8,day))).state;
  const grown=growthSummary(state);
  assert.ok(grown.level>=7);assert.ok(grown.aurora>12);assert.ok(grown.aurora<=30);
  assert.deepEqual(collectionRecords(state).find(c=>c.id===original.id),original);
  assert.equal(aquariumSummary(state).slots,7);
  const styled=applyAquariumTheme(state,'moon');assert.equal(aquariumSummary(styled).selected.id,'moon');
  assert.deepEqual(collectionRecords(styled),collectionRecords(state));
  assert.equal(growthSummary(styled).xp,grown.xp);
  assert.deepEqual(state.events,styled.events);
});

test('일반 포획의 오로라 분포가 레벨별 설정과 맞고 일곱째 날 보장은 별도로 적용된다', async () => {
  const {auroraRate}=await import('../lib/speaking/catalog/fishing/growth.ts');
  for(const level of [1,4,7,10]){
    let auroras=0;
    for(let i=0;i<10000;i++)if(catchTraits(0,0,0,`sample-${i}`,level).pattern===2)auroras++;
    assert.ok(Math.abs(auroras/100 - auroraRate(level))<1.5,`${level}: ${auroras/100}%`);
  }
  for(const day of [6,13,20,27])for(let i=0;i<100;i++){
    const fish=catchTraits(day,4,fishFor(day,4),`weekly-${i}`,1);
    assert.equal(fish.grade,3);assert.equal(fish.pattern,2);
  }
});

test('먹이 주기는 소유한 개체에서만 시작하고 세 문항 완료 때만 기록하며 일반 반복과 보상을 공유한다', () => {
  const now=new Date('2026-09-09T08:00:00Z');
  let state={...emptyState(),collectionSeed:'feeding-qa'};
  assert.throws(()=>applyRepeat(state,{action:'begin',deck:'feed',catchId:'0:0',expectedRun:1},now));
  state=applyCompletion(state,{day:0,step:0,selfReport:true}).state;
  state=applyRepeat(state,{action:'begin',deck:'feed',catchId:'0:0',expectedRun:1},now).state;
  assert.equal(new Set(state.repeat.active.ids).size,3);assert.equal(state.feedingLog,undefined);
  const data=buildStudySnapshot(state,{course:'week',day:0,minutes:60});
  for(const id of state.repeat.active.ids){const q=data.repeatItems.find(q=>q.question.id===id); assert.ok(q.audio.full,id);assert.ok(q.sentences.length);}
  const frozen=collectionRecords(state)[0];
  for(let step=0;step<6;step++)state=applyRepeat(state,{action:'advance',run:1,step,selfReport:true},now).state;
  assert.equal(state.feedingLog['0:0'].count,1);assert.equal(state.practiceCatches.length,1);
  const duplicate=applyRepeat(state,{action:'advance',run:1,step:5,selfReport:true},new Date('2026-09-10T08:00:00Z'));
  assert.deepEqual(duplicate.state,state);
  state=finishRepeat(state,now).state;
  assert.equal(state.practiceCatches.length,1);assert.equal(state.feedingLog['0:0'].count,1);
  assert.deepEqual(collectionRecords(state)[0],frozen);
});

test('추가 여섯 종은 낚시 레벨 조건과 순서에 따라 첫 반복 보상에 확정 등장한다', async () => {
  const {awardPracticeCatch}=await import('../lib/speaking/catalog/fishing/growth.ts');
  let state={...emptyState(),collectionSeed:'all-species-qa'};
  for(let day=0;day<30;day++)for(let step=0;step<stepsFor(day,reviewFor(state,day)).length;step++)state=applyCompletion(state,{day,step,selfReport:true,answer:quizzes[courses[2].days[day].ids[0]].correct,review:courses[2].days[day].ids[0]}).state;
  const original=collectionRecords(state);
  for(let i=0;i<6;i++){
    state=awardPracticeCatch(state,new Date(Date.UTC(2026,9,i+1)));
    assert.equal(state.practiceCatches.at(-1).fish,12+i);
  }
  assert.equal(new Set(collectionRecords(state).map(c=>c.fish)).size,18);
  assert.deepEqual(collectionRecords(state).filter(c=>c.source==='course'),original);
  assert.ok(collectionRecords(state).every(c=>Number.isFinite(c.length)&&c.length>0));
  assert.equal(buildStudySnapshot(state,{course:'month',day:29,minutes:60}).fish.length,18);
});

test('모든 계정별 먹이 주기 추첨은 실제 존재하는 서로 다른 짧은 응답 문항과 음성에 연결된다', () => {
  const base=applyCompletion(emptyState(),{day:0,step:0,selfReport:true}).state;
  for(let i=0;i<100;i++){
    const next=applyRepeat({...base,collectionSeed:`feed-pool-${i}`},{action:'begin',deck:'feed',catchId:'0:0',expectedRun:1}).state;
    assert.equal(new Set(next.repeat.active.ids).size,3);
    const data=buildStudySnapshot(next,{course:'week',day:0,minutes:60});
    for(const id of next.repeat.active.ids){const item=data.repeatItems.find(i=>i.question.id===id);assert.ok(item,id);assert.equal(item.question.type,'respond');assert.ok(item.question.position<7);assert.ok(item.audio.full);}
  }
});
