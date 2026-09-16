/* 0.10 — Investigation / deduction / reinvestigation.
   Owns attempts, not the story's culprit or evidence. Source evidence and solved
   propositions remain MODEL state; leaving a phase never removes them. */
(function(root){'use strict';
 const M=root.MODEL,D=M.D,Gd=root.GUIDE;
 const CORE=['broadcast','lens','payments','signatures','visit'];
 const all=(a,b)=>(b||[]).every(x=>(a||[]).includes(x));
 const known=(s,id)=>s.evidence.includes(id);
 const rules={
  broadcast:{premise:[],title:'밤 9시의 목소리',lead:'지수는 밤 9시의 안내를 들었다. 태오는 미리 녹음한 안내라고 말했다. 그 시각의 생존까지 확인한 걸까?',research:'방송을 들었다는 말과, 그때 대표가 직접 대답했다는 말을 구분할 자료가 필요하다.',missing:'지금 가진 자료로는 안내가 어떻게 준비되고 재생됐는지 충분히 확인하기 어렵다.',wrong:{live:'목소리가 들렸다는 기록만으로 그때 직접 말했는지 알 수는 없다. 준비된 음성이었는지 먼저 살펴보자.',planned:'안내를 준비했다는 일과 사람을 공격했다는 일은 연결되지 않는다. 이 자료가 직접 보여 주는 행동부터 확인하자.'}},
  lens:{premise:['packing'],title:'인수한 렌즈',lead:'넘길 물건의 목록은 있다. 실제로 포장을 열었을 때 안에 있던 물건과 일치했을까?',research:'인수할 목록과 포장을 열었을 때의 기록을 함께 확인하자. 이미 받은 영상은 다시 받을 필요가 없다.',missing:'포장 안쪽의 상태나 수정 순서를 확인할 내용이 부족하다. 인수 과정을 더 물어볼 수 있다.',wrong:{still:'지금 제출한 자료는 수정 전후를 구분한다. 어느 시점의 포장을 말하고 있는지 다시 읽자.',killer:'렌즈를 남기려 한 행동만으로 공격까지 설명되지는 않는다. 인수 기록에서 확인한 일부터 정리하자.'}},
  payments:{premise:['payroll','bank'],title:'직원들에게 간 돈',lead:'지급표와 계좌에서 빠진 돈의 합계는 같다. 그렇다면 직원들은 적힌 대로 돈을 받은 걸까?',research:'각 직원에게 얼마가 갔는지, 실제 받은 사람이 뭐라고 답했는지 확인하자.',missing:'지급표·실제 입금·직원들의 답변이 아직 충분히 모이지 않았다. 확보한 자료는 그대로 두고 나머지를 확인하자.',wrong:{all:'총액이 같아도 돈을 받은 사람이 다를 수 있다. 같은 이름의 행을 따라가 보자.',zero:'직원 계좌로 간 돈이 있다. 못 받은 부분을 밝히더라도 이미 받은 금액을 빼면 안 된다.'}},
  signatures:{premise:['receipts','consents'],title:'서명한 문서',lead:'돈을 받았다는 문서와 촬영에 동의한 문서. 서명의 모양이 같다면, 두 문서 모두 허락한 것일까?',research:'어떤 문서에 서명했는지와 다른 용도로 사용해도 된다고 했는지를 각각 확인하자.',missing:'서명을 사용한 경위와 직원들의 허락 여부를 더 확인해야 한다. 모양이 닮았다는 것만으로 끝내지 말자.',wrong:{permission:'같은 모양의 서명이 있다고 해서 다른 내용에도 동의했다는 뜻은 아니다. 무엇에 서명했는지 살펴보자.',murder:'확인서를 만든 일을 밝혀도 공격의 실행자까지 바로 정해지지는 않는다. 지금은 그 서명이 사용된 경위를 묻고 있다.'}},
  visit:{premise:['lab'],title:'장부와 방문 부인',lead:'한지수는 마지막 상영 뒤 장부를 들고 영사실에 가지 않았다고 말했다. 확보한 물건과 그 뒤의 동선은 그 설명과 맞을까?',research:'장부가 현장과 연결되는지, 발견 뒤 누가 접근했는지, 다른 사람들은 어디에 있었는지 함께 확인하자.',missing:'장부의 상태와 이동, 다른 사람들의 동선을 함께 확인할 근거가 더 필요하다.',wrong:{agree:'장부가 가방에 있었다는 사실은 그전에 어디 있었는지 알려 주지 않는다. 현장과의 연결도 함께 살펴보자.',second:'이 자료들은 연결과 행적을 확인한다. 공격의 정확한 초 단위 시각을 알려 주는 기록은 아니다.'}}
 };
 function isLoop(s){return !!s&&s.loopVersion===1;}
 function baseState(){return {version:1,status:'investigation',issue:null,attempt:0,mistakes:0,records:[],last:null,returnReason:null,returnIssue:null,returnLocation:null,introSeen:false,briefed:true,returnReviewed:false};}
 function enable(s){if(s.guideVersion!==1)return false;if(!isLoop(s)){s.loopVersion=1;s.reasoning=baseState();}return true;}
 function round(s){return s.phase==='night'?CORE.slice(0,4):s.phase==='followup'?CORE:[];}
 function exposed(s,id){return round(s).includes(id)&&all(s.evidence,rules[id].premise);}
 function issues(s){return round(s).filter(id=>exposed(s,id));}
 function nextIssue(s){return issues(s).find(id=>!s.solved.includes(id))||null;}
 function started(s){return isLoop(s)&&s.reasoning.status==='active';}
 function canStart(s){return isLoop(s)&&s.reasoning.briefed&&!s.caseClosed&&!s.completed&&!s.interview&&(!s.dialogue||s.dialogue.kind==='topic');}
 function start(s){
  if(!canStart(s))throw Error('진행 중인 장면을 먼저 읽은 뒤 추리를 시작하세요.');
  const r=s.reasoning;if(started(s))return r;
  M.suspendTopic(s);s.dialogue=null;r.status='active';r.attempt++;r.mistakes=0;r.introSeen=true;r.returnLocation=s.location;
  r.issue=r.issue&&exposed(s,r.issue)&&!s.solved.includes(r.issue)?r.issue:nextIssue(s);r.last=null;r.returnReason=null;return r;
 }
 function choose(s,id){if(!started(s)||!exposed(s,id)||s.solved.includes(id))throw Error('지금 이어갈 수 없는 논점입니다.');if(s.reasoning.issue!==id){s.reasoning.issue=id;s.reasoning.last=null;s.reasoning.mistakes=s.reasoning.records.filter(x=>x.issue===id&&x.attempt===s.reasoning.attempt&&x.code==='wrong').length;}return id;}
 function leave(s,reason='voluntary'){
  if(!isLoop(s))return;
  const r=s.reasoning;r.status='investigation';r.returnReason=reason;r.returnIssue=r.issue;r.returnReviewed=false;
  // Source state, solved propositions, conversation bookmarks and draft choices
  // are deliberately not touched here.
  return {location:r.returnLocation||s.location,issue:r.issue,reason};
 }
 function progress(s){return {done:round(s).filter(id=>s.solved.includes(id)),open:issues(s).filter(id=>!s.solved.includes(id)),allDone:round(s).length>0&&all(s.solved,round(s))};}
 function advance(s){if(!started(s))throw Error('추리 페이즈가 아닙니다.');s.reasoning.issue=nextIssue(s);s.reasoning.mistakes=0;s.reasoning.last=null;return s.reasoning.issue;}
 function fingerprint(id,claim,proofs){return [id,claim,[...proofs].sort().join(',')].join('|');}
 function prerequisite(s,d){
  // Preserve evidence and testimony prerequisites, without reinstating optional
  // arithmetic/timeline minigames as a toll before a phase can be entered.
  return all(s.evidence,d.required)&&d.proof.filter(id=>known(s,id)).length>=d.min&&all(s.topicsRead,d.topicNeed)&&all(s.solved,d.solvedNeed)&&all(s.viewed,d.viewNeed);
 }
 function evaluate(s,id,claim,proofs){
  const d=D.deductions.find(x=>x.id===id),r=rules[id];
  if(!r||!d||!exposed(s,id))return {ok:false,code:'unavailable',message:'아직 듣지 못한 일은 단정하지 않는다. 먼저 현장에서 이야기를 들어보자.'};
  if(!d.claims.some(c=>c.id===claim)||!Array.isArray(proofs)||!proofs.length||proofs.some(e=>!s.evidence.includes(e))||new Set(proofs).size!==proofs.length)return {ok:false,code:'input',message:'판단과 확보한 근거를 선택해 주세요. 같은 자료는 한 번만 쓸 수 있습니다.'};
  // Do not disclose whether a guess is correct before the supporting information
  // has been collected; insufficient evidence never consumes an attempt.
  if(!prerequisite(s,d))return {ok:false,code:'research',message:r.missing};
  if(claim!==d.correct)return {ok:false,code:'wrong',message:r.wrong[claim]||d.feedback};
  const valid=proofs.filter(e=>d.proof.includes(e)),extra=proofs.filter(e=>!d.proof.includes(e));
  if(extra.length>1)return {ok:false,code:'revise',message:'자료를 많이 모았어도 모두 같은 내용을 말해 주는 것은 아니다. 이 판단과 연결되는 근거만 남겨 보자.'};
  if(!all(valid,d.required)||valid.length<d.min)return {ok:false,code:'incomplete',message:'판단을 뒷받침할 연결이 아직 빠져 있다. 선택한 자료가 설명하는 부분을 읽고 다른 근거를 보태 보자.'};
  return {ok:true,code:'accepted',message:d.result+(extra.length?' 이 판단과 무관한 자료는 근거에서 제외했다.':'')};
 }
 function submit(s,id,claim,proofs){
  if(!started(s)||s.reasoning.issue!==id)return {ok:false,code:'inactive',message:'추리를 시작한 뒤 현재 논점에 근거를 제시해 주세요.'};
  if(s.solved.includes(id))return {ok:true,code:'accepted',message:D.deductions.find(d=>d.id===id).result,duplicate:true};
  const r=s.reasoning,result=evaluate(s,id,claim,proofs);
  if(result.code==='input'||result.code==='unavailable')return result;
  const fp=fingerprint(id,claim,proofs);
  const duplicate=r.records.some(x=>x.attempt===r.attempt&&x.issue===id&&x.fingerprint===fp&&x.code===result.code);
  if(result.code==='wrong'&&!duplicate)r.mistakes++;
  if(result.ok)s.solved=[...new Set([...s.solved,id])];
  r.last={issue:id,claim,proofs:[...proofs],code:result.code};
  if(!duplicate){r.records.push({...r.last,attempt:r.attempt,fingerprint:fp});if(r.records.length>200)r.records.shift();}
  if(r.mistakes>=3&&!result.ok){leave(s,'mistakes');return {...result,returned:true,duplicate};}
  return {...result,duplicate,message:duplicate&&!result.ok?'방금 검토한 것과 같은 내용이다. 근거와 판단을 바꾸거나, 조사를 더 해보자.':result.message};
 }
 function replayResult(s){
  const x=s.reasoning?.last;if(!x||x.issue!==s.reasoning.issue)return null;
  return x.code==='accepted'&&s.solved.includes(x.issue)?{ok:true,code:x.code,message:D.deductions.find(d=>d.id===x.issue).result}:evaluate(s,x.issue,x.claim,x.proofs);
 }
 function researchText(s){const r=s.reasoning,id=r.returnIssue||r.issue;return id&&exposed(s,id)?rules[id].research:'사람들에게 묻고 현장의 기록을 모아 보자. 준비됐다고 느끼면 언제든 추리를 시작할 수 있다.';}
 function validate(s){
  if(s.loopVersion===undefined)return s;
  if(s.loopVersion!==1||s.guideVersion!==1)throw Error('조사·추리 진행 버전을 확인할 수 없습니다.');
  const r=s.reasoning;
  if(r&&r.returnReviewed===undefined)r.returnReviewed=false;
  if(!r||typeof r.returnReviewed!=='boolean'||r.version!==1||!['investigation','active'].includes(r.status)||!Number.isInteger(r.attempt)||r.attempt<0||r.attempt>100000||!Number.isInteger(r.mistakes)||r.mistakes<0||r.mistakes>3||typeof r.briefed!=='boolean'||typeof r.introSeen!=='boolean'||!Array.isArray(r.records)||r.records.length>200)throw Error('추리 시도 기록이 손상되었습니다.');
  if(r.issue!==null&&(!CORE.includes(r.issue)||!exposed(s,r.issue)&&!s.solved.includes(r.issue)))throw Error('현재 추리 논점이 확인한 자료와 다릅니다.');
  if(r.returnIssue!==null&&!CORE.includes(r.returnIssue)||r.returnLocation!==null&&!D.places[r.returnLocation]||![null,'voluntary','mistakes','round','story','lack','loaded'].includes(r.returnReason))throw Error('재조사 복귀 정보가 잘못되었습니다.');
  if(r.status==='active'&&(s.dialogue||s.caseClosed||s.completed||s.interview||r.attempt<1||r.mistakes>=3))throw Error('조사와 추리 단계가 겹쳤습니다.');
  const codes=['accepted','wrong','research','revise','incomplete'];
  function entry(x){const d=D.deductions.find(d=>d.id===x?.issue);return x&&CORE.includes(x.issue)&&d.claims.some(c=>c.id===x.claim)&&Array.isArray(x.proofs)&&x.proofs.length>0&&all(s.evidence,x.proofs)&&new Set(x.proofs).size===x.proofs.length&&codes.includes(x.code);}
  if(r.last!==null&&!entry(r.last)||r.records.some(x=>!entry(x)||!Number.isInteger(x.attempt)||x.attempt<1||x.attempt>r.attempt||x.fingerprint!==fingerprint(x.issue,x.claim,x.proofs)))throw Error('제출했던 판단 기록이 일치하지 않습니다.');
  if(r.last?.code==='accepted'&&!s.solved.includes(r.last.issue))throw Error('입증된 논점이 누락되었습니다.');
  return s;
 }
 // Core integration is additive. Old unguided campaigns retain their rules.
 const prior={fresh:M.fresh,validate:M.validate,prove:M.prove,beginFollowup:M.beginFollowup,beginFinal:M.beginFinal,chapter:M.chapter};
 M.fresh=function(){const s=prior.fresh();enable(s);s.reasoning.briefed=false;return s;};
 M.validate=function(s){prior.validate(s);validate(s);return s;};
 M.prove=function(s,id,claim,proofs){return isLoop(s)&&CORE.includes(id)?submit(s,id,claim,proofs):prior.prove(s,id,claim,proofs);};
 for(const name of ['move','inspect','startTopic']){const old=M[name];M[name]=function(s,...args){if(started(s))throw Error('조사로 돌아간 뒤 현장을 확인할 수 있습니다.');return old(s,...args);};}
 for(const name of ['beginFollowup','beginFinal'])M[name]=function(s,...args){const answer=prior[name](s,...args);if(isLoop(s))leave(s,'story');return answer;};
 M.chapter=function(s){if(!isLoop(s))return prior.chapter(s);if(M.dialogueData(s)?.opening)return ['01','모서리 극장 사건'];if(s.completed)return ['05','남은 사람들'];if(s.caseClosed)return ['05','영상의 주인에게'];if(s.interview)return ['04','영사실에서 내린 선택'];if(s.phase==='followup')return ['03','며칠 뒤의 확인'];return ['02','마지막 영업일의 조사'];};
 function researchTask(s){
  const issue=s.reasoning?.returnIssue;if(s.reasoning?.returnReviewed||!issue||s.solved.includes(issue))return null;
  const candidates={
   broadcast:[['inspect','r_device','projection',['recording','schedule','director_order']]],
   lens:[['topic','m_visit','lobby',['packing']],['topic','m_original','lobby',['original']]],
   payments:[['inspect','o_table','office',['payroll','bank']],['topic','y_payment',null],['topic','h_payment',null],['topic','p_payment',null]],
   signatures:[['topic','s_consent','archive',['consents']],['inspect','o_files','office',['signature_file']],['topic','y_payment',null],['topic','h_payment',null],['topic','p_payment',null]],
   visit:[['topic','m_original','lobby',['original']],['topic','j_ledger','office',['ledger']]]
  }[issue]||[];
  for(const [kind,id,place,evidence] of candidates){
   const data=kind==='topic'?M.topic(id):M.hotspot(id);
   if(evidence?all(s.evidence,evidence):s.topicsRead.includes(id))continue;
   if(!M.available(s,data))continue;
   const person=kind==='topic'?data.npc:null;
   return {kind,id,loc:person?M.locationOf(s,person):place,person,remote:!!(person&&D.people[person].contact&&s.phase==='night'),title:kind==='topic'?data.label:data.name,why:rules[issue].research,ch:s.phase==='night'?2:3,chapter:'막힌 논점 보충'};
  }
  const d=D.deductions.find(d=>d.id===issue),id=d.required.find(e=>known(s,e));
  return id?{kind:'evidence',id,title:'이미 가진 원문을 다시 살핀다.',why:rules[issue].research,ch:s.phase==='night'?2:3,chapter:'근거 다시 읽기'}:null;
 }
 const oldNext=Gd.next;
 Gd.next=function(s){
  if(!isLoop(s)||s.dialogue||s.caseClosed||s.completed)return oldNext(s);
  if(started(s))return {kind:'reasoning',title:'확보한 자료로 생각을 정리한다.',why:'막히면 현재 논점을 보류하고 조사로 돌아갈 수 있다.',chapter:'추리 페이즈',ch:s.phase==='night'?2:3};
  const returned=researchTask(s);if(returned)return returned;
  if(s.phase==='followup'){
   if(M.finalReady(s))return {kind:'final',title:'한지수에게 영사실의 일을 묻는다.',why:'입증한 논점을 되풀이하지 않고 실제 행동을 확인한다.',ch:4,chapter:'마지막 면담'};
   if(!s.viewed.includes('lab'))return {kind:'evidence',id:'lab',title:'도착한 검사 결과를 읽는다.',why:'검사 의뢰 뒤 며칠이 지났다.',chapter:'후속 조사',ch:3};
   for(const t of Gd.later)if(!t.done(s)&&t.available(s))return {...t,person:M.topic(t.id).npc,loc:M.locationOf(s,M.topic(t.id).npc),chapter:'후속 조사'};
   if(M.finalReady(s))return {kind:'final',title:'한지수에게 영사실의 일을 묻는다.',why:'앞서 입증한 내용은 다시 풀지 않는다.',ch:4,chapter:'마지막 면담'};
   return {kind:'reasoning',title:'확보한 자료로 방문 부인을 검토한다.',why:'준비가 됐다고 느끼면 추리를 이어간다.',ch:3,chapter:'후속 조사'};
  }
  for(const t of Gd.steps){if(t.kind==='proof'||t.done(s)||!t.available(s))continue;const person=t.kind==='topic'?M.topic(t.id).npc:null;return {...t,person,loc:person?M.locationOf(s,person):t.loc,remote:person&&D.people[person].contact&&s.phase==='night',chapter:'자유 조사'};}
  if(M.labReady(s))return {kind:'followup',title:'확보한 장부와 천 조각의 검사를 의뢰한다.',why:'현장 기록을 넘기고 며칠 뒤 결과를 확인한다.',ch:2,chapter:'밤의 조사'};
  return {kind:'reasoning',title:'지금까지 모은 자료로 추리한다.',why:'선택과 근거 제시로 생각을 검토한다. 막히면 조사로 돌아온다.',ch:2,chapter:'자유 조사'};
 };
 // The old guide does not become a checklist: questions remain freely ordered.
 const RUN={rules,core:CORE,isLoop,baseState,enable,round,exposed,issues,nextIssue,started,canStart,start,choose,leave,progress,advance,evaluate,submit,replayResult,researchText,researchTask,validate};
 root.DEDUCTION=RUN;if(typeof module!=='undefined')module.exports=RUN;
})(typeof window!=='undefined'?window:globalThis);
