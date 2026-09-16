/* 0.8 player comfort rules. Suggestions are NOT proof answers or progress. */
(function(root){'use strict';
 const M=root.MODEL,D=M.D,Guide=root.GUIDE;
 const proofHints={
 broadcast:[
  '목소리가 들린 시각과 실제로 말을 한 시각을 따로 찾아보세요.',
  '안내 원본의 녹음 시각, 예약 기록의 설정·재생 시각을 나란히 읽어보세요.',
  '재생 기록은 소리가 나온 때를 알려 줍니다. 그때 직접 대답했는지는 다른 문제입니다.'
 ],
 lens:[
  '어느 렌즈를 넘기기로 했는지부터 확인해 보세요.',
  '인수 목록의 각인과 원본의 ‘수정 이전’ 부분을 비교하세요.',
  '통에 붙은 번호표, 실제 각인, 통화 뒤 수정한 상태를 서로 구분하면 됩니다.'
 ],
 payments:[
  '출금 합계 대신 사람 이름을 한 줄씩 따라가 보세요.',
  '같은 직원의 지급표 금액과 실제 이체액을 비교하세요. 직원들의 답변도 다시 볼 수 있습니다.',
  '각자의 차액을 합친 다음, 그와 같은 액수가 누구에게 이체됐는지 찾아보세요.'
 ],
 signatures:[
  '서명 모양뿐 아니라, 어떤 내용에 동의한 서명인지 보세요.',
  '촬영 동의서와 수령 확인서의 목적, 작성 파일의 삽입 이미지, 직원들의 답변을 비교하세요.',
  '이미지가 옮겨졌다는 작성 흔적과 사용을 허락했는지는 다른 출처로 확인해야 합니다.'
 ],
 visit:[
  '장부가 현장과 연결되는 것과, 누가 언제 장부를 가지고 있었는지를 함께 보세요.',
  '장부 기록과 검사 결과를 읽고, 발견 이후 기록 및 연속 인수 영상으로 접촉 가능한 시점을 비교하세요.',
  '한 자료만으로 공격 동작까지 정하지 마세요. 장부의 현장 연결과 이후 접촉, 다른 사람들의 동선을 이어 방문 부인을 검토합니다.'
 ]};
 function unread(s){return s.evidence.filter(id=>!s.viewed.includes(id));}
 function peopleStatus(s,id){
  const qs=M.questions(s,id);if(qs.some(t=>M.resumePosition(s,t.id)))return '이어서 대화하기';
  const main=Guide.questions(s,id).main;
  if(main.some(t=>!s.topicsRead.includes(t.id)))return '대화하기';
  return qs.some(t=>!s.topicsRead.includes(t.id))?'더 듣기 · 선택':'지난 이야기 다시 읽기';
 }
 function outcome(s,u){
  const x=u.lastResult;if(!x)return null;
  if(x.kind==='topic'&&s.topicsRead.includes(x.ref)){const t=M.topic(x.ref);return {title:D.people[t.npc].name+'에게 들은 말',text:t.statement||t.label,ids:(t.grant||[]).filter(id=>s.evidence.includes(id)),ref:x.ref,kind:x.kind};}
  if(x.kind==='hotspot'&&s.observed.includes(x.ref)){const h=M.hotspot(x.ref);return {title:h.name,text:'자료를 수첩에 보관했다.',ids:(h.grant||[]).filter(id=>s.evidence.includes(id)),ref:x.ref,kind:x.kind};}
  if(x.kind==='proof'&&s.solved.includes(x.ref)){const d=D.deductions.find(t=>t.id===x.ref);return {title:d.name,text:d.result,ids:d.proof.filter(id=>s.evidence.includes(id)),ref:x.ref,kind:x.kind};}
  return null;
 }
 function help(s,proofId,level=0){
  const t=Guide.next(s),d=D.deductions.find(x=>x.id===proofId),allowed=d&&M.availableDeductions(s).some(x=>x.id===proofId);
  if(allowed&&proofHints[proofId])return proofHints[proofId].slice(0,Math.max(0,Math.min(3,level)));
  if(!t)return [];
  return [t.why||'대사 아래의 다음 버튼으로 이야기를 이어 읽으세요.'];
 }
 function destination(s){const t=Guide.next(s);return t?.loc&&!t.remote?t.loc:null;}
 function proofStatus(p){if(!p.proofs.length&&!p.claim)return '자료를 읽고, 근거와 판단을 골라 주세요.';if(!p.proofs.length)return '판단을 골랐습니다. 근거로 삼을 자료를 선택해 주세요.';if(!p.claim)return '근거를 골랐습니다. 이제 판단할 문장을 선택해 주세요.';return '준비됐습니다. 제출하거나 선택을 더 바꿀 수 있습니다.';}
 const hintSources={broadcast:['recording','schedule'],lens:['packing','original'],payments:['payroll','bank','workers'],signatures:['consents','receipts','signature_file','workers'],visit:['ledger','lab','first_response','original']};
 function helpSources(s,id,level){return level>=2&&M.availableDeductions(s).some(d=>d.id===id)?(hintSources[id]||[]).filter(e=>s.evidence.includes(e)):[];}
 root.PLAYER={unread,peopleStatus,outcome,help,helpSources,destination,proofStatus};
 if(typeof module!=='undefined')module.exports=root.PLAYER;
})(typeof window!=='undefined'?window:globalThis);
