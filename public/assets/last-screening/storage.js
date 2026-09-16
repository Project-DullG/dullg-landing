(function(root){'use strict';
const PREFIX='last_screening_v1_';
const defaults={textSize:1,speed:25,instant:false,autoInterval:3500,volume:.35,musicVolume:.2,audioMuted:false,ambientVolume:.15,voiceVolume:.8,voice:false,voiceRate:1,reduced:false,hotspots:true,unfocusedMute:true,contrast:false,hints:true,controlHints:false,impactEffects:true,sceneEffects:true,atmosphere:true,characterMotion:true,textEffects:true,punctuationPause:true};
function sum(t){let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}
function encode(s,ui){const payload=JSON.stringify({game:s,ui:{mode:ui.mode,npc:ui.npc,scrolls:ui.scrolls||{},evidenceFilter:ui.evidenceFilter||'all',evidenceSearch:ui.evidenceSearch||'',caseTab:ui.caseTab||'overview',proofDrafts:ui.proofDrafts||{},docViews:ui.docViews||{},returnContext:ui.returnContext||null,lastResult:ui.lastResult||null,moreQuestions:ui.moreQuestions||{},evidenceOrder:ui.evidenceOrder||'recent'},savedAt:new Date().toISOString()});return JSON.stringify({format:'last-screening-save',version:2,checksum:sum(payload),payload});}
function decode(raw){let w,v;try{w=JSON.parse(raw);}catch(e){throw Error('저장 파일의 JSON 형식이 손상되었습니다.');}if(!w||w.format!=='last-screening-save'||![1,2].includes(w.version)||typeof w.payload!=='string'||w.checksum!==sum(w.payload))throw Error('저장 파일 형식이나 무결성을 확인할 수 없습니다.');try{v=JSON.parse(w.payload);root.MODEL.validate(v.game);}catch(e){throw Error('저장 진행을 복원할 수 없습니다. '+e.message);}if(typeof v.savedAt!=='string'||!Number.isFinite(Date.parse(v.savedAt)))throw Error('저장 시각이 잘못되었습니다.');v.ui=v.ui&&typeof v.ui==='object'?v.ui:{};for(const k of ['mode','npc','evidenceFilter','evidenceSearch','caseTab'])if(v.ui[k]!==undefined&&typeof v.ui[k]!=='string')throw Error('저장한 화면 상태가 손상되었습니다.');if(v.ui.scrolls&&Object.values(v.ui.scrolls).some(a=>!Array.isArray(a)||a.length!==2||a.some(n=>!Number.isFinite(n)||n<0)))throw Error('화면 스크롤 기록이 손상되었습니다.');validateProofDrafts(v.ui.proofDrafts,v.game);validateReaderState(v.ui,v.game);return v;}
function validateProofDrafts(drafts,game){
 if(drafts===undefined)return;
 if(!drafts||typeof drafts!=='object'||Array.isArray(drafts)||Object.keys(drafts).length>root.STORY.deductions.length)throw Error('추리 초안 형식이 손상되었습니다.');
 for(const [id,p] of Object.entries(drafts)){
  const d=root.STORY.deductions.find(x=>x.id===id);
  if(p?.sourceTop!==undefined&&(!Number.isFinite(p.sourceTop)||p.sourceTop<0||p.sourceTop>1000000))throw Error('근거 목록 위치가 손상되었습니다.');
  if(p?.hintLevel!==undefined&&(!Number.isInteger(p.hintLevel)||p.hintLevel<0||p.hintLevel>3))throw Error('힌트 열람 상태가 손상되었습니다.');
  if(p?.allSources!==undefined&&typeof p.allSources!=='boolean')throw Error('근거 목록 상태가 손상되었습니다.');
  if(p?.sourceOpen!==undefined&&(!p.sourceOpen||typeof p.sourceOpen!=='object'||Array.isArray(p.sourceOpen)||Object.entries(p.sourceOpen).some(([e,v])=>!game.evidence.includes(e)||typeof v!=='boolean')))throw Error('펼친 자료 정보가 손상되었습니다.');
  if(!d||!p||typeof p!=='object'||Array.isArray(p)||!(p.claim===null||d.claims.some(c=>c.id===p.claim))||!Array.isArray(p.proofs)||p.proofs.some(e=>!game.evidence.includes(e))||new Set(p.proofs).size!==p.proofs.length||typeof p.compare!=='boolean'||typeof p.search!=='string'||p.search.length>200||typeof p.filter!=='string'||!['all','pins',...Object.values(root.STORY.evidence).map(e=>e.type)].includes(p.filter))throw Error('추리 초안이 저장된 자료와 일치하지 않습니다.');
 }
}
function validateReaderState(u,g){
 if(u.evidenceOrder!==undefined&&!['recent','oldest'].includes(u.evidenceOrder))throw Error('자료 순서가 손상되었습니다.');
 const r=u.returnContext;if(r!==undefined&&r!==null&&(!r||typeof r!=='object'||!['talk','inspect','visit'].includes(r.mode)||!root.STORY.places[r.loc]||r.npc!==null&&!root.STORY.people[r.npc]))throw Error('돌아갈 화면 정보가 손상되었습니다.');
 const o=u.lastResult;if(o!==undefined&&o!==null){const allowed=o&&((o.kind==='topic'&&g.topicsRead.includes(o.ref))||(o.kind==='hotspot'&&g.observed.includes(o.ref))||(o.kind==='proof'&&g.solved.includes(o.ref)));if(!allowed)throw Error('최근 확인 기록이 손상되었습니다.');}
 if(u.docViews!==undefined){if(!u.docViews||typeof u.docViews!=='object'||Array.isArray(u.docViews)||Object.keys(u.docViews).length>100)throw Error('자료 보기 정보가 손상되었습니다.');for(const [id,v] of Object.entries(u.docViews)){if(!g.evidence.includes(id)||!v||!Number.isFinite(v.zoom)||v.zoom<.05||v.zoom>2.8||!Number.isFinite(v.left)||!Number.isFinite(v.top)||v.left<0||v.top<0||v.left>1e6||v.top>1e6)throw Error('자료 확대 정보가 손상되었습니다.');}}
 if(u.moreQuestions!==undefined&&(!u.moreQuestions||typeof u.moreQuestions!=='object'||Array.isArray(u.moreQuestions)||Object.entries(u.moreQuestions).some(([id,v])=>!root.STORY.people[id]||typeof v!=='boolean')))throw Error('질문 펼침 정보가 손상되었습니다.');
}
function put(slot,s,ui){const raw=encode(s,ui),validated=decode(raw);try{localStorage.setItem(PREFIX+slot,raw);if(localStorage.getItem(PREFIX+slot)!==raw)throw Error('불일치');}catch(e){throw Error('브라우저에 저장하지 못했습니다. 저장 공간·권한을 확인하거나 진행을 파일로 내보내세요.');}return validated;}
function get(slot){let raw;try{raw=localStorage.getItem(PREFIX+slot);}catch(e){throw Error('브라우저 저장 공간에 접근할 수 없습니다.');}return raw?decode(raw):null;}
function slots(){return ['auto','1','2','3','4','5','6'].map(id=>{try{return{id,value:get(id)}}catch(e){return{id,error:e.message}}});}
const clamp=(v,lo,hi,d)=>Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):d;
function config(){try{const x=JSON.parse(localStorage.getItem(PREFIX+'settings')||'{}');const c={...defaults};for(const k of ['audioMuted','instant','voice','reduced','hotspots','unfocusedMute','contrast','hints','controlHints','impactEffects','sceneEffects','atmosphere','characterMotion','textEffects','punctuationPause'])if(typeof x[k]==='boolean')c[k]=x[k];c.textSize=[1,1.15,1.3,1.5].includes(x.textSize)?x.textSize:1;c.speed=clamp(x.speed,5,80,defaults.speed);c.autoInterval=clamp(x.autoInterval,1500,9000,3500);for(const k of ['volume','musicVolume','ambientVolume','voiceVolume'])c[k]=clamp(x[k],0,1,defaults[k]);c.voiceRate=clamp(x.voiceRate,.8,1.2,1);return c;}catch(e){return {...defaults};}}
function saveConfig(c){try{localStorage.setItem(PREFIX+'settings',JSON.stringify(c));}catch(e){throw Error('설정을 저장하지 못했습니다. 이번 실행에만 적용됩니다.');}}
function remove(slot){try{localStorage.removeItem(PREFIX+slot);}catch(e){throw Error('슬롯을 삭제하지 못했습니다.');}}
root.STORAGE={validateReaderState,encode,decode,put,get,slots,config,saveConfig,defaults,remove};
})(typeof window!=='undefined'?window:globalThis);
