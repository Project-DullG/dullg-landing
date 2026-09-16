/* BGM scene policy. No story mutation, keyword heuristics, or answer scoring here.
 * Reviewed against the final 0.5.0 dialogue (see project/bgm_cues.json).
 */
(function(root){'use strict';
 const tracks={
  title:'bgm_01_title',investigation:'bgm_02_investigation',crime:'bgm_03_crime_scene',
  interview:'bgm_04_interview',documents:'bgm_05_documents',contradiction:'bgm_06_contradiction',ending:'music_return'
 };
 const cues=[
  {kind:'topic',ref:'t_admit',from:0,to:3,evidence:['packing','original'],viewed:['packing','original'],topics:['t_lens'],reason:'착오라는 앞선 설명을 수정 전 인수 영상과 대조하는 질문/답변 구간'},
  {kind:'topic',ref:'j_receipt',from:0,to:4,evidence:['receipts','consents','signature_file','workers'],viewed:['receipts','consents','signature_file','workers'],topics:['j_money'],reason:'전액 수령이라는 서류와 실제 수령/서명 허락의 불일치를 직접 제시'},
  {kind:'topic',ref:'j_totals',from:1,to:7,evidence:['payroll','bank','workers'],viewed:['payroll','bank','workers'],topics:['j_money'],reason:'같은 출금 합계로 수취인별 지급 불일치를 설명할 수 없다고 재질문'},
  {kind:'scene',ref:'conclusion_expanded',from:18,to:27,evidence:['lab','ledger','message','original','first_response','prior_photo'],viewed:['lab','ledger','message','original','first_response','prior_photo'],solved:['visit'],reason:'최종 대면 전체가 아니라 방문 부인과 물증/보관/동선을 실제로 대조하는 구간만'},
  {kind:'scene',ref:'conclusion',from:2,to:4,evidence:['lab','ledger','message','original','first_response','prior_photo'],viewed:['lab','ledger','message','original','first_response','prior_photo'],solved:['visit'],reason:'구판 호환 경로의 방문 부인 재질문 구간'}
 ];
 cues.push({kind:'scene',ref:'conclusion_v7_visit',from:2,to:7,evidence:['ledger','lab','original','first_response'],viewed:['ledger','lab','original','first_response'],solved:['visit'],reason:'최종 면담에서 이미 입증한 장부·현장·동선의 충돌을 직접 제시하는 구간'});
 const documents=new Set(['evidence','compare','proof','activity','log','topic-log','statements','preview','recap','recent','receipt','run-library','judgment-record']);
 const neutral=new Set(['settings','saves','confirm','help','about','message','pause','context-help']);
 const all=(have,need)=>(need||[]).every(id=>(have||[]).includes(id));
 function activeCue(g){
  const d=g?.dialogue;if(!d||!Number.isInteger(d.index))return null;
  return cues.find(c=>c.kind===d.kind&&c.ref===d.ref&&d.index>=c.from&&d.index<=c.to&&all(g.evidence,c.evidence)&&all(g.viewed,c.viewed)&&all(g.topicsRead,c.topics)&&all(g.solved,c.solved))||null;
 }
 function resolve(g,u={},aux=null,back=[],assets=null){
  const layers=[...(back||[]),...(aux?[aux]:[])],paused=layers.some(x=>x.kind==='pause');
  const result=(key,reason)=>({key:key===tracks.ending&&assets&&!assets[key]?null:key,paused,reason});
  if(!g)return result(tracks.title,'title');
  if(['epilogue','finished'].includes(g.phase)||g.completed||g.caseClosed)return result(tracks.ending,'epilogue');
  // Closest genuine foreground task underneath neutral utilities; pause anywhere wins.
  for(let i=layers.length-1;i>=0;i--){
   const x=layers[i];if(neutral.has(x.kind))continue;
   if(documents.has(x.kind))return result(tracks.documents,'foreground-document');
   if(x.kind==='phone'||x.kind==='phone-menu'){
    const cue=x.kind==='phone'&&g.dialogue?.remote?activeCue(g):null;
    return result(cue?tracks.contradiction:tracks.interview,cue?'explicit-cue':'foreground-interview');
   }
  }
  if(['evidence','case','reasoning'].includes(u.mode))return result(tracks.documents,'document-workspace');
  if(['map','people'].includes(u.mode))return result(tracks.investigation,'navigation');
  if(u.mode==='talk'){
   if(g.dialogue?.remote)return result(tracks.investigation,'closed-phone');
   if(g.dialogue?.kind==='hotspot')return result(g.location==='projection'?tracks.crime:tracks.investigation,'object-observation');
   if(['followup','followup_open'].includes(g.dialogue?.ref))return result(tracks.documents,'lab-reading');
   const cue=activeCue(g);if(cue)return result(tracks.contradiction,'explicit-cue');
   return result(tracks.interview,'interview');
  }
  return result(g.location==='projection'?tracks.crime:tracks.investigation,'investigation');
 }
 const api={tracks,cues,resolve,activeCue};root.BGM_POLICY=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
