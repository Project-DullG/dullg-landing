/* 0.7 — Apply the authored narrative patch after the 0.6.2 exact-text editorial edits.
 * The companion narrative_data.js is generated from project/narrative/narrative_patch.json.
 * No original source manuscript is changed. New crime-window details are Jisu's later account.
 */
(function(root){'use strict';
 if(typeof module!=='undefined'&&typeof window==='undefined')require('./narrative_data.js');
 const D=root.STORY,X=root.NARRATIVE_DATA,aliases=new Map();
 if(!D||!X)throw Error('서사 자료를 읽을 수 없습니다.');
 for(const e of X.edits){
  const d=e.kind==='topic'?D.topics.find(t=>t.id===e.ref):D.scenes[e.ref];
  const line=e.variant===null?d?.lines[e.index]:d?.variants?.[e.variant]?.lines[e.index];
  if(!line||line.who!==e.who||line.text!==e.before)throw Error('Narrative baseline mismatch: '+e.id);
  line.text=e.after;aliases.set(e.id,e);
 }
 for(const [id,label] of Object.entries(X.labels))D.topics.find(t=>t.id===id).label=label;
 for(const [id,scene] of Object.entries(X.scenes)){if(D.scenes[id])throw Error('Duplicate narrative scene '+id);D.scenes[id]=scene;}
 // A personal memory / distribution preference is not payment for access to the murder case.
 const laterOptional=['s_film','s_workers','s_cut','s_followup','s_fileorder','s_quietroom','s_result','y_work','y_people','y_family','h_work','h_privacy','h_anonymity','h_belongings','p_work','p_tomorrow','p_silence','p_nextday'];
 for(const id of laterOptional){const t=D.topics.find(t=>t.id===id);t.phases=[...new Set([...(t.phases||['night','followup']), 'followup','epilogue'])];}
 D.release=X.release;D.narrative={version:X.version,start:X.interviewStart,sceneIds:Object.keys(X.scenes),onboardingStart:X.onboardingStart,record:X.record};
 function migrateLog(log){for(const l of log||[]){const e=aliases.get(l.id);if(e&&l.who===e.who&&l.text===e.before)l.text=e.after;}}
 root.NARRATIVE={migrateLog,edits:X.edits,optionalTopicIds:laterOptional};
})(typeof window!=='undefined'?window:globalThis);
