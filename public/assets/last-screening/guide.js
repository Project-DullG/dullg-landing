/* A small, deterministic next-action guide. It suggests actions, NEVER answers.
 * Future task text is not rendered. Old saves retain their old progression rules. */
(function(root){'use strict';
 const M=root.MODEL,D=M.D; const has=(s,id)=>s.evidence.includes(id),read=(s,id)=>s.topicsRead.includes(id),solved=(s,id)=>s.solved.includes(id);
 const steps=[];
 function topic(ch,id,why){const t=M.topic(id);steps.push({ch,kind:'topic',id,title:t.label,why,done:s=>read(s,id),available:s=>M.available(s,t)});}
 function inspect(ch,loc,id,why){const h=M.hotspot(id);steps.push({ch,kind:'inspect',id,loc,title:h.name,why,done:s=>s.observed.includes(id)||h.grant?.length&&h.grant.every(e=>has(s,e)),available:s=>M.available(s,h)});}
 function proof(ch,id,why){const d=D.deductions.find(x=>x.id===id);steps.push({ch,kind:'proof',id,title:d.name,why,done:s=>solved(s,id),available:s=>M.availableDeductions(s).some(x=>x.id===id)});}
 const chapters=['현장','영사실에서 있었던 일','마지막 통화와 렌즈','직원들에게 간 돈','다른 문서의 서명','장부가 옮겨진 곳','며칠 뒤, 다시 확인','영사실에서 내린 선택','남은 사람들'];
 topic(1,'t_discovery','대표를 처음 발견한 영사기사에게 당시 상황을 듣는다.');
 inspect(1,'projection','r_desk','서도윤이 쓰러져 있던 자리와 책상에 남은 것을 확인한다.');
 inspect(1,'projection','r_device','태오가 말한 녹음과 예약 기록을 확인한다.');
 proof(1,'broadcast','밤 9시의 목소리가 무엇을 알려 주는지 정리한다.');
 topic(2,'m_visit','통화를 확인하기 전에 인수할 물건과 방문 목적을 듣는다.');
 topic(2,'m_original','서도윤이 직접 답한 마지막 통화가 영상에 남아 있다.');
 topic(2,'t_lens','인수 목록과 영상의 번호가 달랐다. 번호표를 붙인 사람에게 묻는다.');
 proof(2,'lens','인수 목록과 포장 수정 전 영상을 나란히 비교한다.');
 topic(2,'t_admit','확인한 번호 차이를 태오에게 직접 묻는다.');
 topic(2,'t_after_admit','확인하면 들킬 일을 왜 했는지 듣는다.');
 topic(3,'j_work','대표가 마지막으로 확인하던 정산이 누구의 돈인지 알아본다.');
 inspect(3,'office','o_table','지급표에 적힌 금액과 실제 이체 내역을 확인한다.');
 topic(3,'y_payment','지급표에 있는 첫 직원에게 실제 받은 금액을 묻는다.');
 topic(3,'h_payment','두 번째 직원의 수령액과 서명 여부를 본인에게 확인한다.');
 topic(3,'p_payment','마지막 직원에게 약속한 금액과 실제 입금액을 확인한다.');
 proof(3,'payments','합계만 보지 말고 사람별 지급액을 비교한다.');
 topic(3,'j_money','한지수 계좌로 간 돈에 대해 설명을 듣는다.');
 topic(3,'j_explaining','직원들이 지수의 말을 믿고 기다린 사정을 듣는다.');
 topic(4,'s_consent','직원들이 원래 어떤 목적으로 서명했는지 편집자에게 묻는다.');
 inspect(4,'office','o_files','동의서와 수령 확인서가 어떻게 연결됐는지 작성 파일을 확인한다.');
 proof(4,'signatures','문서의 목적, 실제 지급, 직원들의 답변을 함께 확인한다.');
 topic(4,'j_receipt','직원들이 허락하지 않은 서명을 왜 사용했는지 묻는다.');
 topic(5,'j_message','서도윤이 죽기 전 어떤 서류를 요구했는지 확인한다.');
 topic(5,'j_ledger','영사실 파일에서 빠진 종이가 어디로 갔는지 찾는다.');
 topic(5,'s_book','사건 전 장부 상태가 남은 촬영 기록을 확인한다.');
 topic(5,'j_boundary','사진을 본 뒤에도 마지막 상영 후의 방문을 부인하는지 확인한다.');
 topic(5,'j_ownbook','현장과 연결될 장부를 누가 가지고 있었는지 묻는다.');
 topic(5,'e_arrival','장부와 가방이 확보된 과정을 현장 경찰관에게 확인한다.');
 topic(5,'e_access','발견 뒤 다른 사람이 그 물건을 옮길 수 있었는지 확인한다.');
 const later=[];
 function laterTopic(id,why){const t=M.topic(id);later.push({ch:6,kind:'topic',id,title:t.label,why,done:s=>read(s,id),available:s=>M.available(s,t)});}
 laterTopic('e_lab','현장의 천 조각과 장부를 비교한 결과, 보관 과정을 함께 확인한다.');
 laterTopic('m_followup','원본의 통화와 그 뒤 동선이 앞선 설명과 일치하는지 다시 확인한다.');
 laterTopic('j_followup','검사 결과가 도착했다. 한지수가 방문을 부인한 말을 유지하는지 묻는다.');
 function task(s,t){let loc=t.loc,person=null;
  if(t.kind==='topic'){person=M.topic(t.id).npc;loc=M.locationOf(s,person);}
  return {...t,title:t.kind==='topic'?D.people[person].name+(D.people[person].contact&&s.phase==='night'?'에게 전화해 확인한다.':'와 대화한다.'):t.title,loc,person,chapter:chapters[t.ch],remote:t.kind==='topic'&&D.people[person].contact&&s.phase==='night'};
 }
 function next(s){
  if(!s)return null;
  if(s.dialogue)return {kind:'resume',id:s.dialogue.ref,ch:s.interview?7:s.phase==='followup'?6:steps.find(t=>t.id===s.dialogue.ref)?.ch||0,chapter:s.interview?'영사실에서 내린 선택':D.scenes[s.dialogue.ref]?.section||'현재 대화',title:s.dialogue.awaitingChoice?'다음에 물을 말을 고른다.':'진행 중인 이야기를 이어 듣는다.',why:'',remote:!!s.dialogue.remote};
  if(s.completed)return {kind:'complete',ch:8,chapter:chapters[8],title:'이야기를 마쳤습니다.',why:'사건 기록과 남은 사람들의 이야기를 다시 읽을 수 있습니다.'};
  if(s.caseClosed){
   if(!s.delivery.plan)return {kind:'delivery',ch:8,chapter:chapters[8],title:'직원 영상을 어떻게 돌려줄지 정한다.',why:'상영과 개인 반환 중 제안할 방식을 고른다. 각자의 의사는 따로 묻는다.'};
   for(const id of Object.keys(D.endConsent)){
    if(s.delivery.plan==='screening'&&!s.delivery.previews.includes(id))return {kind:'preview',id,ch:8,chapter:chapters[8],title:D.people[id].name+'의 확인본을 본다.',why:'상영 전에 본인의 장면과 요청을 확인한다.'};
    if(!s.consents[id])return {kind:'consent',id,ch:8,chapter:chapters[8],title:D.people[id].name+'에게 전달 의사를 묻는다.',why:'열람했다는 것과 동의했다는 것은 다르다. 답변을 확인한다.'};
   }
   return {kind:'ending',ch:8,chapter:chapters[8],title:s.delivery.plan==='screening'?'작은 상영회를 연다.':'각자의 인터뷰를 돌려준다.',why:'당사자가 요청한 범위로만 전달한다.'};
  }
  if(s.guideVersion!==1){const t=M.nextTasks(s)[0];return {kind:'legacy',ch:0,chapter:'기존 진행',title:t.text,why:'사건 정리에서 남은 확인을 볼 수 있습니다.'};}
  if(s.phase==='followup'){
   if(!s.viewed.includes('lab'))return {kind:'evidence',id:'lab',ch:6,chapter:chapters[6],title:'도착한 검사 결과를 읽는다.',why:'검사 의뢰 이후 며칠이 지났다. 이제 결과를 확인할 수 있다.'};
   for(const t of later)if(!t.done(s)&&t.available(s))return task(s,t);
   if(!solved(s,'visit'))return task(s,{kind:'proof',id:'visit',ch:6,title:'장부의 이동',why:'장부와 현장, 발견 뒤 동선을 함께 놓고 방문 부인을 검토한다.'});
   return {kind:'final',ch:7,chapter:chapters[7],title:'한지수와 마지막으로 대면한다.',why:'확인한 자료를 바탕으로 영사실에서의 행동을 묻는다.'};
  }
  for(const t of steps)if(!t.done(s)&&t.available(s))return task(s,t);
  if(M.labReady(s))return {kind:'followup',ch:5,chapter:chapters[5],title:'장부와 천 조각의 검사를 의뢰한다.',why:'당일에 확인할 기록을 모았다. 검사 결과는 며칠 뒤 도착한다.'};
  return {kind:'blocked',ch:5,chapter:'남은 확인',title:'사건 기록을 다시 살핀다.',why:'아직 확인하지 않은 자료가 있다.'};
 }
 const coreProofs=['broadcast','lens','payments','signatures','visit'];
 function questions(s,npc){const all=M.questions(s,npc),n=next(s),essential=new Set(steps.filter(t=>t.kind==='topic').map(t=>t.id));later.forEach(t=>essential.add(t.id));
  const main=all.filter(t=>essential.has(t.id)&&!read(s,t.id));
  return {main:main.slice(0,3),extra:all.filter(t=>!main.slice(0,3).includes(t))};
 }
 root.GUIDE={next,questions,steps,later,coreProofs,chapters};if(typeof module!=='undefined')module.exports=root.GUIDE;
})(typeof window!=='undefined'?window:globalThis);
