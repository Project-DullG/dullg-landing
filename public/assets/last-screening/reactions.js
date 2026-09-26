/* 0.19 — Authored mid-topic conversation flow.
 * The player can answer reverse questions, press a point, present only relevant owned evidence,
 * then ask an optional follow-up unlocked by the response. No affinity, guilt or mistake score.
 * Stable base dialogue indices are never shifted. Responses and follow-ups have their own line IDs.
 */
(function(root){'use strict';
 const M=root.MODEL,D=root.STORY,X=root.REACTIONS_DATA;
 if(!M||!X)throw Error('면담 선택 자료를 읽을 수 없습니다.');
 const nodes=new Map(X.nodes.map(n=>[n.id,n])),byTopic=new Map(X.nodes.map(n=>[n.topic,n]));
 for(const n of nodes.values()){
  const t=M.topic(n.topic);n.anchor=root.TIME_STYLE.format(n.anchor);
  if(!t||t.npc!==n.npc||t.lines[n.after]?.text!==n.anchor)throw Error('Reaction anchor mismatch: '+n.id);
  for(const r of n.replies){
   for(const l of r.lines)l.text=root.TIME_STYLE.format(l.text);
   if(r.followupPrompt)r.followupPrompt=root.TIME_STYLE.format(r.followupPrompt);
   for(const f of r.followups||[])for(const l of f.lines)l.text=root.TIME_STYLE.format(l.text);
  }
 }
 const record=s=>s.responses||(s.responses={version:1,notes:[],drafts:{}});
 function point(s,q=s.dialogue){const n=byTopic.get(q?.ref);return q?.kind==='topic'&&s.guideVersion===1&&(q.variant??-1)===-1&&n&&q.index===n.after?n:null;}
 function mode(s){return s.dialogue?.reaction?.mode||null;}
 function pending(s){return ['choice','followup'].includes(mode(s));}
 function active(s){return !!s.dialogue?.reaction;}
 function node(s){return nodes.get(s.dialogue?.reaction?.node)||null;}
 function getReply(s){const a=s.dialogue?.reaction;return a?nodes.get(a.node)?.replies.find(r=>r.id===a.reply):null;}
 function getFollowup(s){const a=s.dialogue?.reaction,r=getReply(s);return a&&r?(r.followups||[]).find(f=>f.id===a.followup):null;}
 function followupsRemaining(s){const a=s.dialogue?.reaction,r=getReply(s),asked=a?.asked||[];return (r?.followups||[]).filter(f=>!asked.includes(f.id));}
 function currentLine(s){
  const a=s.dialogue?.reaction,n=node(s),r=getReply(s);
  if(a?.mode==='reply')return r?.lines[a.index]||null;
  if(a?.mode==='choice'&&n?.question)return {who:n.npc,text:n.question};
  if(a?.mode==='followup'&&r?.followupPrompt)return {who:n.npc,text:r.followupPrompt};
  if(a?.mode==='followup-reply')return getFollowup(s)?.lines[a.index]||null;
  return null;
 }
 function lineId(s){
  const q=s.dialogue,a=q?.reaction;if(!a)return null;
  if(a.mode==='reply')return `topic/${q.ref}/reaction/${a.node}/${a.reply}/${a.index}`;
  if(a.mode==='choice'&&node(s)?.question)return `topic/${q.ref}/reaction/${a.node}/question/0`;
  if(a.mode==='followup'&&getReply(s)?.followupPrompt)return `topic/${q.ref}/reaction/${a.node}/${a.reply}/followup/prompt`;
  if(a.mode==='followup-reply')return `topic/${q.ref}/reaction/${a.node}/${a.reply}/followup/${a.followup}/${a.index}`;
  return null;
 }
 function catalog(){
  const map=new Map();
  for(const n of nodes.values()){
   if(n.question)map.set(`topic/${n.topic}/reaction/${n.id}/question/0`,{who:n.npc,text:n.question});
   for(const r of n.replies){
    r.lines.forEach((l,i)=>map.set(`topic/${n.topic}/reaction/${n.id}/${r.id}/${i}`,l));
    if(r.followupPrompt)map.set(`topic/${n.topic}/reaction/${n.id}/${r.id}/followup/prompt`,{who:n.npc,text:r.followupPrompt});
    for(const f of r.followups||[])f.lines.forEach((l,i)=>map.set(`topic/${n.topic}/reaction/${n.id}/${r.id}/followup/${f.id}/${i}`,l));
   }
  }
  return map;
 }
 function pauseAt(s){
  const n=point(s);if(!n||(s.dialogue.reactionPassed||[]).includes(n.id))return false;
  record(s);s.dialogue.reaction={node:n.id,mode:'choice',reply:null,index:0,evidence:null,followup:null,asked:[]};s.dialogue.awaitingChoice=true;return true;
 }
 function interactable(s){const n=node(s);return mode(s)==='choice'&&n?s.evidence.filter(id=>!!route(s,n,id)):[];}
 function optionStyle(n,o){if(o.style)return o.style;if(o.kind==='evidence')return'evidence';if(o.kind==='continue')return'continue';if(o.id==='press')return'press';return n.question?'response':'question';}
 function options(s){
  const n=node(s),a=s.dialogue?.reaction;if(!n||!pending(s))return[];
  if(a.mode==='followup')return followupsRemaining(s).map(f=>({id:f.id,label:f.label,kind:'followup',style:'followup',seen:false}));
  return n.options.filter(o=>o.kind!=='evidence'||interactable(s).length>0).map(o=>({...o,style:optionStyle(n,o),seen:o.reply&&record(s).notes.some(x=>x.id===n.id+'/'+o.reply)}));
 }
 function route(s,n,id){return n.evidenceRoutes.find(r=>r.evidence.includes(id)&&(!r.phases||r.phases.includes(s.phase)));}
 function setReply(s,id,evidence=null){const a=s.dialogue.reaction;a.mode='reply';a.reply=id;a.index=0;a.evidence=evidence;a.followup=null;a.asked=[];s.dialogue.awaitingChoice=false;}
 function finishReaction(s,n){const q=s.dialogue;q.reactionPassed=[...new Set([...(q.reactionPassed||[]),n.id])];delete q.reaction;q.awaitingChoice=false;return M.advance(s,true);}
 function choose(s,id,evidence=null){
  if(!pending(s))throw Error('현재는 대답을 고르는 중이 아닙니다.');
  const n=node(s),a=s.dialogue.reaction;
  if(a.mode==='followup'){
   if(getReply(s)?.followupPrompt)M.seeLine(s);
   if(id==='continue')return finishReaction(s,n);
   const f=followupsRemaining(s).find(x=>x.id===id);if(!f)throw Error('지금 이어서 물을 수 없는 질문입니다.');
   a.mode='followup-reply';a.followup=f.id;a.index=0;s.dialogue.awaitingChoice=false;
   return {done:false,got:[],reactionSelected:true,followupSelected:true};
  }
  if(n.question)M.seeLine(s);
  const o=n.options.find(x=>x.id===id);if(!o||!options(s).some(x=>x.id===id))throw Error('이 대화에서 선택할 수 없는 말입니다.');
  if(o.kind==='continue')return finishReaction(s,n);
  if(o.kind==='evidence'){
   if(!D.evidence[evidence]||!s.evidence.includes(evidence)||!interactable(s).includes(evidence))throw Error('이 대화에서 확인할 수 있는 보유 자료만 제시할 수 있습니다.');
   setReply(s,route(s,n,evidence)?.reply||'not_fit',evidence);
  }else setReply(s,o.reply);
  return {done:false,got:[],reactionSelected:true};
 }
 function recordNote(s,n,r,a){
  if(!r.note)return null;const state=record(s),id=n.id+'/'+r.id;if(state.notes.some(x=>x.id===id))return null;
  const note={id,node:n.id,reply:r.id,evidence:a.evidence,phase:s.phase,location:s.dialogue.remote?'phone':s.location};state.notes.push(note);return note;
 }
 function advance(s,ops){
  if(pending(s))return {done:false,got:[],choice:true};
  const q=s.dialogue,a=q.reaction,n=node(s),r=getReply(s);
  if(a.mode==='followup-reply'){
   const f=getFollowup(s);if(!f)throw Error('추가 질문의 답변을 찾을 수 없습니다.');
   ops.seeLine(s);
   if(a.index+1<f.lines.length){a.index++;return {done:false,got:[]};}
   a.asked=[...new Set([...(a.asked||[]),f.id])];a.followup=null;a.index=0;
   if(followupsRemaining(s).length){a.mode='followup';q.awaitingChoice=true;return {done:false,got:[],choice:true,followupUnlocked:true};}
   return {...finishReaction(s,n),reactionDone:true,followupDone:true};
  }
  ops.seeLine(s);
  if(a.index+1<r.lines.length){a.index++;return {done:false,got:[]};}
  if(r.id==='not_fit'){
   q.reaction={node:n.id,mode:'choice',reply:null,index:0,evidence:null,followup:null,asked:[]};q.awaitingChoice=true;
   return {done:false,got:[],choice:true,reactionMismatch:true};
  }
  const note=recordNote(s,n,r,a);
  if((r.followups||[]).length){a.mode='followup';a.index=0;a.followup=null;a.asked=a.asked||[];q.awaitingChoice=true;return {done:false,got:[],choice:true,followupUnlocked:true,...(note?{newNote:note.id}:{})};}
  const result=finishReaction(s,n);return {...result,...(note?{newNote:note.id}:{}),reactionDone:true};
 }
 function notes(s,npc=null){return (s.responses?.notes||[]).filter(x=>!npc||nodes.get(x.node)?.npc===npc).map(x=>{const n=nodes.get(x.node),r=n.replies.find(r=>r.id===x.reply);return {...x,npc:n.npc,topic:n.topic,...r.note};});}
 function hasRoute(n,r,id,phase){if(id===null)return n.options.some(o=>o.reply===r.id);return n.evidenceRoutes.some(x=>x.reply===r.id&&x.evidence.includes(id)&&(!x.phases||x.phases.includes(phase)));}
 function validateCursor(s,q,phase){
  const n=byTopic.get(q.ref);const passes=q.reactionPassed;
  if(passes!==undefined&&(!Array.isArray(passes)||new Set(passes).size!==passes.length||passes.some(id=>id!==n?.id||q.index<n.after)))throw Error('면담 선택의 진행 위치가 다릅니다.');
  const a=q.reaction;if(!a)return;
  if(s.guideVersion!==1||!n||q.index!==n.after||(q.variant??-1)!==-1||a.node!==n.id||passes?.includes(n.id)||!['choice','reply','followup','followup-reply'].includes(a.mode)||!Number.isInteger(a.index))throw Error('면담 선택 위치가 손상되었습니다.');
  const base=`topic/${q.ref}/${q.index}`;if(!s.readLines.includes(base))throw Error('질문 앞의 답변을 먼저 들어야 합니다.');
  const asked=a.asked||[];if(!Array.isArray(asked)||new Set(asked).size!==asked.length)throw Error('추가 질문 기록이 손상되었습니다.');
  if(a.mode==='choice'){
   if(!q.awaitingChoice||a.reply!==null||a.evidence!==null||a.index!==0||(a.followup??null)!==null||asked.length)throw Error('선택 대기 상태가 손상되었습니다.');
   return;
  }
  const r=n.replies.find(r=>r.id===a.reply);if(!r)throw Error('추가 답변 위치가 손상되었습니다.');
  if(r.id==='not_fit'){
   if(a.mode!=='reply'||q.awaitingChoice||!D.evidence[a.evidence]||!s.evidence.includes(a.evidence)||n.evidenceRoutes.some(x=>x.evidence.includes(a.evidence)&&(!x.phases||x.phases.includes(phase))))throw Error('제시한 자료의 반응이 다릅니다.');
  }else if(!hasRoute(n,r,a.evidence,phase)||a.evidence!==null&&!s.evidence.includes(a.evidence))throw Error('추가 답변의 근거가 다릅니다.');
  if(asked.some(id=>!(r.followups||[]).some(f=>f.id===id)))throw Error('열리지 않은 추가 질문이 기록되어 있습니다.');
  const baseReplyIds=r.lines.map((_,i)=>`topic/${n.topic}/reaction/${n.id}/${r.id}/${i}`);
  if(a.mode==='reply'){
   if(q.awaitingChoice||a.index<0||a.index>=r.lines.length||(a.followup??null)!==null)throw Error('추가 답변 위치가 손상되었습니다.');
   if(a.index>0&&!s.readLines.includes(baseReplyIds[a.index-1]))throw Error('듣지 않은 추가 답변으로 이동할 수 없습니다.');
  }else{
   if(baseReplyIds.some(id=>!s.readLines.includes(id)))throw Error('답변을 끝까지 듣기 전에 추가 질문으로 갈 수 없습니다.');
   if(a.mode==='followup'){
    if(!q.awaitingChoice||a.index!==0||(a.followup??null)!==null||!followupsRemaining({...s,dialogue:{...q,reaction:a}}).length)throw Error('추가 질문 선택 상태가 손상되었습니다.');
   }else{
    const f=(r.followups||[]).find(f=>f.id===a.followup);
    if(q.awaitingChoice||!f||asked.includes(f.id)||a.index<0||a.index>=f.lines.length)throw Error('추가 질문 답변 위치가 손상되었습니다.');
    if(a.index>0&&!s.readLines.includes(`topic/${n.topic}/reaction/${n.id}/${r.id}/followup/${f.id}/${a.index-1}`))throw Error('듣지 않은 추가 질문 답변으로 이동할 수 없습니다.');
   }
  }
 }
 function validate(s){
  if(s.responses!==undefined){const x=s.responses;
   if(x?.drafts!==undefined&&(!x.drafts||typeof x.drafts!=='object'||Array.isArray(x.drafts)||Object.entries(x.drafts).some(([id,e])=>!nodes.has(id)||!s.evidence.includes(e))))throw Error('선택 중인 면담 자료가 다릅니다.');
   if(!x||x.version!==1||!Array.isArray(x.notes)||x.notes.length>40||new Set(x.notes.map(n=>n.id)).size!==x.notes.length)throw Error('추가 면담 기록이 손상되었습니다.');
   for(const note of x.notes){const n=nodes.get(note.node),r=n?.replies.find(r=>r.id===note.reply);
    if(!n||!r?.note||note.id!==n.id+'/'+r.id||!['night','followup','epilogue'].includes(note.phase)||(!D.places[note.location]&&note.location!=='phone')||!hasRoute(n,r,note.evidence,note.phase)||note.evidence!==null&&!s.evidence.includes(note.evidence))throw Error('추가 면담의 출처가 다릅니다.');
    if(!s.readLines.includes(`topic/${n.topic}/${n.after}`)||r.lines.some((_,i)=>!s.readLines.includes(`topic/${n.topic}/reaction/${n.id}/${r.id}/${i}`)))throw Error('끝까지 듣지 않은 답변을 기록할 수 없습니다.');
   }
  }
  if(s.dialogue?.reaction||s.dialogue?.reactionPassed)validateCursor(s,s.dialogue,s.phase);
  for(const [ref,b] of Object.entries(s.conversationBookmarks||{}))if(b.reaction||b.reactionPassed)validateCursor(s,{...b,kind:'topic',ref},b.phase);
 }
 function cue(s){const r=getReply(s);return r?.confrontation&&s.dialogue?.reaction?.mode==='reply'&&s.dialogue.reaction.evidence&&s.evidence.includes(s.dialogue.reaction.evidence)?r:null;}
 function flow(s){const a=s.dialogue?.reaction,n=node(s);if(!a||!n)return null;return {mode:a.mode,reverse:!!n.question,evidence:interactable(s).length,followups:a.mode==='followup'?followupsRemaining(s).length:(getReply(s)?.followups||[]).length};}
 root.REACTIONS={nodes,point,mode,pending,active,node,getReply,getFollowup,currentLine,lineId,catalog,pauseAt,options,interactable,choose,advance,notes,validate,cue,flow};
 const priorNext=root.GUIDE.next;root.GUIDE.next=function(s){const t=priorNext(s);if(!pending(s)||!t)return t;return {...t,title:mode(s)==='followup'?'답변에서 이어 물을 말을 고른다.':'다음에 할 말을 고른다.',chapter:'현재 면담'};};
 if(typeof module!=='undefined')module.exports=root.REACTIONS;
})(typeof window!=='undefined'?window:globalThis);
