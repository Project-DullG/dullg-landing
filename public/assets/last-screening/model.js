(function(root){
'use strict';
const D=root.STORY||(typeof require!=='undefined'?require('./story.js'):null);
if(typeof module!=='undefined'&&typeof window==='undefined'){require('./expansion.js');require('./activities.js');require('./editorial.js');require('./narrative.js');}
const all=(a,b=[])=>Array.isArray(a)&&b.every(x=>a.includes(x));
const unique=a=>[...new Set(a)];
const CORE=['broadcast','lens','payments','signatures','visit'];
const baseTopic=id=>D.topics.find(t=>t.id===id);
const hotspot=id=>Object.values(D.places).flatMap(p=>p.hotspots).find(h=>h.id===id);
const expanded=s=>s.campaign!=='classic';
function fresh(){return {schema:2,campaign:'expanded',guideVersion:1,phase:'night',location:'lobby',visited:['lobby'],evidence:[],viewed:[],topicsRead:[],observed:[],solved:[],statements:[],readLines:[],log:[],scenesRead:[],dialogue:{kind:'scene',ref:'arrival_v7',index:0},elapsed:0,caseClosed:false,completed:false,consents:{},delivery:{plan:null,previews:[]},activitiesDone:[],activityDrafts:{},bookmarks:[],notes:'',ending:null,conversationBookmarks:{}};}
function migrate(s){
 if(!s||![1,2].includes(s.schema))throw Error('지원하지 않는 저장 형식입니다.');
 if(s.schema===1){s.schema=2;s.campaign='classic';s.scenesRead=[];s.delivery={plan:s.caseClosed?'private':null,previews:[]};s.activitiesDone=[];s.activityDrafts={};s.bookmarks=[];s.notes='';s.ending=s.completed?'B':null;}
 return s;
}
function locationOf(s,id){const p=D.people[id];if(!p)return null;if(s.caseClosed&&id==='jisu')return null;if(p.contact)return s.phase==='night'?null:p.laterLoc;return p.loc;}
function available(s,t){return !!t&&all(s.evidence,t.need)&&all(s.solved,t.solvedNeed)&&(!expanded(s)&&t.id==='visit'||all(s.topicsRead,t.topicNeed))&&(!expanded(s)||(s.guideVersion===1&&['payments','signatures'].includes(t.id))||all(s.activitiesDone,t.workNeed))&&(!t.phases||t.phases.includes(s.phase));}
function questions(s,id){return D.topics.filter(t=>t.npc===id&&available(s,t)&&(!s.caseClosed||t.phases?.includes('epilogue'))&&(!t.phone||s.phase==='night'));}
function topic(id){return baseTopic(id);}
function effectiveData(s,q=s.dialogue){if(!q)return null;const d=q.kind==='scene'?D.scenes[q.ref]:q.kind==='topic'?baseTopic(q.ref):hotspot(q.ref);if(!d)return null;if(q.variant>=0){const v=d.variants?.[q.variant];if(!v)return null;return {...d,lines:v.lines};}return d;}
function lineId(s){const q=s.dialogue;return q?`${q.kind}/${q.ref}/${q.variant>=0?'v'+q.variant+'/':''}${q.index}`:null;}
function currentLine(s){return effectiveData(s)?.lines[s.dialogue.index]||null;}
function seeLine(s){const l=currentLine(s),id=lineId(s);if(!l)return;s.readLines=unique([...s.readLines,id]);if(!s.log.length||s.log.at(-1).id!==id)s.log.push({id,who:l.who,text:l.text,location:s.location,phase:s.phase,via:s.dialogue.remote?'phone':'onsite'});}
function grant(s,ids=[]){const got=[];for(const id of ids){if(!D.evidence[id])throw Error('알 수 없는 자료: '+id);if(id==='lab'&&s.phase==='night')throw Error('검사 결과는 후속 조사에서 확인합니다.');if(!s.evidence.includes(id)){s.evidence.push(id);got.push(id);}}return got;}
function advance(s){
 if(s.dialogue?.awaitingChoice)return {done:false,got:[],choice:true};
 if(!s.dialogue)return {done:false,got:[]};seeLine(s);const d=effectiveData(s),q=s.dialogue;
 if(q.index+1<d.lines.length){q.index++;return {done:false,got:[]};}
 if(d.choices?.length){q.awaitingChoice=true;return {done:false,got:[],choice:true};}
 const got=grant(s,d.grant),finished={...q};
 if(q.kind==='topic'){if(s.conversationBookmarks)delete s.conversationBookmarks[q.ref];s.topicsRead=unique([...s.topicsRead,q.ref]);if(d.statement&&!s.statements.some(t=>t.id===q.ref))s.statements.push({id:q.ref,npc:d.npc,text:d.statement,phase:s.phase,location:q.remote?'phone':s.location});if(all(s.topicsRead,['y_payment','h_payment','p_payment']))got.push(...grant(s,['workers']));}
 if(q.kind==='hotspot')s.observed=unique([...s.observed,q.ref]);
 if(q.kind==='scene')s.scenesRead=unique([...s.scenesRead,q.ref]);
 s.dialogue=null;
 if(d.next)enterScene(s,d.next);
 if(d.interview&&s.interview)s.interview.sections=unique([...s.interview.sections,q.ref]);
 if(d.finish==='startFollowup'){s.phase='followup';s.location='lobby';s.visited=unique([...s.visited,'lobby']);s.dialogue={kind:'scene',ref:'followup_open',index:0};}
 if(d.finish==='caseClosed'){s.caseClosed=true;s.phase='epilogue';if(d.interview&&s.interview)s.interview.status='complete';}
 if(d.finish==='ending'){s.completed=true;s.phase='finished';s.ending=q.ref==='ending_a'?'A':'B';}
 return {done:true,got,finished};
}
function enterScene(s,ref){
 const d=D.scenes[ref];if(!d)throw Error('없는 면담 장면입니다.');
 const variant=d.variants?.findIndex(v=>all(s.evidence,v.need)&&all(s.topicsRead,v.topicNeed));
 s.dialogue={kind:'scene',ref,index:0,variant:variant??-1};
}
function pendingChoices(s){const d=effectiveData(s);return s.dialogue?.awaitingChoice?(d?.choices||[]).filter(c=>available(s,c)):[];}
function chooseDialogue(s,id){
 const q=s.dialogue,d=effectiveData(s),option=pendingChoices(s).find(c=>c.id===id);
 if(!q||q.kind!=='scene'||!d?.interview||!option||!s.interview)throw Error('지금 선택할 수 없는 질문입니다.');
 s.interview.sections=unique([...s.interview.sections,q.ref]);s.scenesRead=unique([...s.scenesRead,q.ref]);
 s.interview.decisions.push({scene:q.ref,choice:id,next:option.next});enterScene(s,option.next);
 return {done:true,got:[],branch:true,finished:{...q}};
}
function validateInterview(s){
 if(s.interview===undefined)return;
 const x=s.interview,ids=D.narrative.sceneIds;
 if(!x||x.version!==1||!['active','complete'].includes(x.status)||!Array.isArray(x.sections)||!Array.isArray(x.decisions)||x.decisions.length>3||unique(x.sections).length!==x.sections.length||x.sections.some(id=>!ids.includes(id))||x.decisions.some(c=>!D.scenes[c.scene]?.choices?.some(o=>o.id===c.choice&&o.next===c.next)))throw Error('면담 기록이 손상되었습니다.');
 // Replay only the authored node graph. A saved choice cannot jump to the closing admission.
 let ref=D.narrative.start,n=0,decision=0,path=[];
 while(ref&&n++<30){
  const d=D.scenes[ref];path.push(ref);
  if(x.status==='active'&&s.dialogue?.ref===ref)break;
  if(!x.sections.includes(ref))throw Error('면담 장면 연결이 누락되었습니다.');
  if(d.choices){const c=x.decisions[decision++];if(!c||c.scene!==ref)throw Error('면담 질문 순서가 손상되었습니다.');ref=c.next;}
  else ref=d.next||null;
 }
 if(x.sections.some(id=>!path.includes(id))||decision!==x.decisions.length)throw Error('면담 선택이 실제 경로와 다릅니다.');
 if(x.status==='complete'&&(!s.caseClosed||ref!==null))throw Error('완료되지 않은 면담입니다.');
 if(x.status==='active'&&(s.phase!=='followup'||s.caseClosed||!ids.includes(s.dialogue?.ref)))throw Error('진행 중인 면담의 단계가 다릅니다.');
}
function suspendTopic(s){
 const q=s.dialogue;if(q?.kind!=='topic')return;
 s.conversationBookmarks=s.conversationBookmarks||{};
 s.conversationBookmarks[q.ref]={index:q.index,variant:q.variant??-1,remote:!!q.remote,phase:s.phase};
}
function resumePosition(s,id){
 const t=baseTopic(id),b=s.conversationBookmarks?.[id];if(!t||!b||b.phase!==s.phase||!available(s,t))return null;
 const v=t.variants?.findIndex(x=>all(s.evidence,x.need)&&all(s.topicsRead,x.topicNeed))??-1;
 return b.variant===v?b:null;
}
function validateBookmarks(s){
 const bs=s.conversationBookmarks;if(bs===undefined)return;
 if(!bs||typeof bs!=='object'||Array.isArray(bs)||Object.keys(bs).length>D.topics.length)throw Error('대화 이어듣기 기록이 손상되었습니다.');
 const catalog=lineCatalog();
 for(const [id,b] of Object.entries(bs)){
  const t=baseTopic(id);if(!t||!b||!Number.isInteger(b.index)||!Number.isInteger(b.variant)||b.variant< -1||typeof b.remote!=='boolean'||!['night','followup','epilogue'].includes(b.phase))throw Error('대화 이어듣기 위치를 확인할 수 없습니다.');
  if(b.remote!== (!!t.phone||!!(D.people[t.npc].contact&&b.phase==='night')))throw Error('전화와 현장 면담 기록이 다릅니다.');
  const d=b.variant>=0?t.variants?.[b.variant]:t;
  if(!d||b.index<0||b.index>=d.lines.length||(['night','followup','epilogue','finished'].indexOf(b.phase)>['night','followup','epilogue','finished'].indexOf(s.phase))||!available({...s,phase:b.phase},t))throw Error('대화 이어듣기 자료가 진행과 다릅니다.');
  if(b.index>0){const prev=`topic/${id}/${b.variant>=0?'v'+b.variant+'/':''}${b.index-1}`;if(!catalog.has(prev)||!s.readLines.includes(prev))throw Error('읽지 않은 대화로 건너뛸 수 없습니다.');}
 }
}
function startTopic(s,id){
 if(s.dialogue?.kind==='scene')throw Error('진행 중인 장면을 먼저 확인해 주세요.');const t=baseTopic(id);
 if(!available(s,t))throw Error('현재 확인할 수 없는 질문입니다.');
 const remote=!!t.phone||!!(D.people[t.npc].contact&&s.phase==='night');
 if(!remote&&locationOf(s,t.npc)!==s.location)throw Error('해당 인물이 있는 장소에서 대화할 수 있습니다.');
 const variant=t.variants?.findIndex(v=>all(s.evidence,v.need)&&all(s.topicsRead,v.topicNeed));
 suspendTopic(s);const resume=resumePosition(s,id);
 s.dialogue={kind:'topic',ref:id,index:resume?.index||0,remote,variant:variant??-1};
}
function inspect(s,id){if(s.dialogue?.kind==='scene')throw Error('진행 중인 장면을 먼저 확인해 주세요.');const h=hotspot(id);if(!D.places[s.location].hotspots.some(x=>x.id===id)||!available(s,h))throw Error('이곳에서 조사할 수 없는 대상입니다.');suspendTopic(s);s.dialogue={kind:'hotspot',ref:id,index:0};}
function move(s,id){if(s.dialogue?.kind==='scene')throw Error('진행 중인 장면을 먼저 확인해 주세요.');if(!D.places[id])throw Error('없는 장소입니다.');suspendTopic(s);s.location=id;s.visited=unique([...s.visited,id]);s.dialogue=null;}
function availableDeductions(s){return D.deductions.filter(d=>available(s,d)&&all(s.viewed,d.viewNeed));}
function prove(s,id,claim,proof){const d=D.deductions.find(d=>d.id===id);if(!d||!availableDeductions(s).some(x=>x.id===id))return {ok:false,message:'관련 자료와 대조 작업을 먼저 확인해야 합니다.'};if(!Array.isArray(proof)||new Set(proof).size!==proof.length)return {ok:false,message:'같은 자료는 한 번만 선택하세요.'};const picked=unique(proof);if(!all(s.evidence,picked)||picked.some(x=>!D.evidence[x]))return {ok:false,message:'확보한 자료만 제출할 수 있습니다.'};
 if(claim!==d.correct)return {ok:false,message:d.feedback};
 const extra=picked.filter(x=>!d.proof.includes(x)),relevant=picked.filter(x=>d.proof.includes(x));
 if(extra.length>(s.guideVersion===1?1:0))return {ok:false,message:'이 주장과 직접 연결되지 않는 자료가 함께 선택되어 있습니다. 각 자료가 무엇을 증명하는지 좁혀 보세요.'};
 if(!all(relevant,d.required)||relevant.length<d.min)return {ok:false,message:'근거가 충분하지 않습니다. '+d.feedback};
 s.solved=unique([...s.solved,id]);return {ok:true,message:d.result+(extra.length?' 관련 없는 자료는 이 판단의 근거에서 제외했습니다.':'')};
}
function activities(s){return Object.entries(D.activities).filter(([id,a])=>available(s,a)).map(([id,a])=>({...a,id}));}
function checkActivity(s,id,draft){const a=D.activities[id];if(!a||!available(s,a))return {ok:false,message:'아직 이 작업에 필요한 자료가 없습니다.'};let ok=false;
 if(a.kind==='number')ok=a.fields.every(f=>String(draft[f.id]??'').trim()!==''&&Number(draft[f.id])===f.answer);
 else if(a.kind==='select')ok=a.fields.every(f=>draft[f.id]===f.answer);
 else if(a.kind==='order')ok=Array.isArray(draft.order)&&draft.order.join('|')===a.answer.join('|');
 else if(a.kind==='claims')ok=a.fields.every(f=>draft[f.id]===f.answer&&Array.isArray(draft[f.id+'_sources'])&&draft[f.id+'_sources'].length>=(f.min||1)&&draft[f.id+'_sources'].every(e=>f.evidence.includes(e)&&s.evidence.includes(e)));
 if(!ok)return {ok:false,message:a.feedback};
 s.activitiesDone=unique([...s.activitiesDone,id]);s.activityDrafts[id]=JSON.parse(JSON.stringify(draft));const got=grant(s,a.grant);return {ok:true,got,message:'대조 내용을 기록했습니다. 연결된 질문과 사건 정리에서 사용할 수 있습니다.'};
}
function labReady(s){if(s.phase!=='night')return false;
 const core=all(s.solved,['broadcast','lens','payments','signatures'])&&all(s.evidence,['cloth','ledger','prior_photo','original','loan','message','first_response']);
 if(s.guideVersion===1)return core&&all(s.topicsRead,['j_boundary','j_ownbook','e_access'])&&s.evidence.includes('custody');
 return core&&(!expanded(s)||(all(s.solved,D.requiredNight)&&all(s.activitiesDone,['accounts','documents','timeline'])&&all(s.topicsRead,['j_boundary','j_ownbook','e_access'])&&all(s.evidence,['custody','return_route'])));
}
function beginFollowup(s){if(!labReady(s))throw Error('검사 의뢰 전 남은 면담과 자료 대조를 마쳐 주세요.');if(s.dialogue)throw Error('현재 대화를 먼저 마쳐 주세요.');s.dialogue={kind:'scene',ref:expanded(s)?'night_closure':'followup',index:0};if(!expanded(s)){s.phase='followup';s.location='office';}else s.location='lobby';}
function finalReady(s){const core=!s.caseClosed&&s.phase==='followup'&&all(s.solved,CORE)&&all(s.viewed,['lab'])&&s.evidence.includes('loan');if(s.loopVersion===1)return core;if(s.guideVersion===1)return core&&all(s.topicsRead,['e_lab','j_followup','m_followup']);return core&&(!expanded(s)||(all(s.solved,D.requiredFollowup)&&all(s.activitiesDone,['claims'])&&all(s.topicsRead,['e_lab','j_followup','m_followup','y_followup','h_followup','p_followup'])));}
function beginFinal(s){if(!finalReady(s))throw Error(s.guideVersion===1?'먼저 위쪽 할 일 안내에 따라 검사 결과와 방문 기록을 확인해 주세요.':'재면담 전에 직원 확인과 주장 대조를 마쳐 주세요.');if(s.dialogue)throw Error('현재 대화를 먼저 마쳐 주세요.');s.location='office';if(expanded(s)){s.interview={version:1,status:'active',sections:[],decisions:[]};enterScene(s,D.narrative.start);}else s.dialogue={kind:'scene',ref:'conclusion',index:0};}
function setDelivery(s,plan){if(!s.caseClosed||s.completed||!['private','screening'].includes(plan))throw Error('지금 전달 방식을 정할 수 없습니다.');s.delivery={plan,previews:[]};s.consents={};}
function preview(s,id){if(!s.caseClosed||s.delivery.plan!=='screening'||!D.previews[id])throw Error('먼저 전달안을 확인해 주세요.');s.delivery.previews=unique([...s.delivery.previews,id]);}
function consent(s,id){if(!s.caseClosed||s.completed||!D.endConsent[id])throw Error('지금 의사를 기록할 수 없습니다.');if(!s.delivery.plan){if(expanded(s))throw Error('먼저 어떤 전달을 제안할지 확인해 주세요.');s.delivery.plan='private';}if(s.delivery.plan==='screening'&&!s.delivery.previews.includes(id))throw Error('해당 직원의 확인본과 조건부터 읽어 주세요.');s.consents[id]=D.deliveryResponses[s.delivery.plan][id];}
function endingReady(s){return s.caseClosed&&!s.completed&&!!s.delivery.plan&&Object.keys(D.endConsent).every(id=>s.consents[id]===D.deliveryResponses[s.delivery.plan][id])&&(s.delivery.plan!=='screening'||all(s.delivery.previews,Object.keys(D.endConsent)));}
function beginEnding(s){if(!endingReady(s))throw Error('직원별 확인과 의사를 먼저 기록해 주세요.');if(s.dialogue)throw Error('현재 대화를 먼저 마쳐 주세요.');s.location='auditorium';s.dialogue={kind:'scene',ref:s.delivery.plan==='screening'?'ending_a':expanded(s)?'ending_b_more':'ending',index:0};}
function chapter(s){if(s.guideVersion===1&&root.GUIDE){const t=root.GUIDE.next(s);return [String(t.ch||1).padStart(2,'0'),t.chapter];}if(s.completed)return ['12',s.ending==='A'?'작은 상영회':'각자의 인터뷰'];if(s.caseClosed)return ['11','남겨진 일'];if(s.phase==='followup'){if(s.activitiesDone.includes('claims'))return ['10','맞는 말과 틀린 말'];if(all(s.evidence,['worker_review_y','worker_review_h','worker_review_p']))return ['09','세 사람의 확인'];return ['08','며칠 뒤'];}if(labReady(s))return ['07','밤의 기록'];if(s.solved.includes('signatures'))return ['06','장부의 행방'];if(s.solved.includes('payments'))return ['05','서명한 문서'];if(s.solved.includes('lens'))return ['04','같은 합계'];if(s.solved.includes('broadcast'))return ['03','두 개의 번호'];if(s.evidence.includes('recording'))return ['02','예약된 목소리'];return ['01','마감이 끝난 극장'];}
function nextTasks(s){
 const tasks=[];const add=(ok,text,mode='case',loc=null,person=null,topicId=null)=>{if(!ok)tasks.push({text,mode,loc,person,topicId});};
 if(s.completed)return [{text:'사건 기록과 전달 결과를 다시 확인할 수 있다.',mode:'case'}];
 if(s.caseClosed){add(!!s.delivery.plan,'영상 전달안을 먼저 정한다.','people');for(const id of Object.keys(D.endConsent))add(!!s.consents[id],D.people[id].name+'의 확인본과 답변을 기록한다.','people');if(!tasks.length)tasks.push({text:'확인한 의사에 맞춰 영상 전달을 마친다.',mode:'people'});return tasks;}
 if(s.phase==='followup'){
  add(s.viewed.includes('lab'),'도착한 검사 결과를 읽는다.','evidence');
  for(const [id,npc] of [['e_lab','eunchae'],['j_followup','jisu'],['m_followup','minjae'],['s_followup','seoa'],['y_followup','youngsook'],['h_followup','hocheol'],['p_followup','sookyoung']])add(s.topicsRead.includes(id),D.people[npc].name+'에게 후속 확인을 한다.','talk',locationOf(s,npc),npc,id);
  for(const id of D.requiredFollowup)add(s.solved.includes(id),D.deductions.find(d=>d.id===id).name+'의 근거를 정리한다.');
  add(s.activitiesDone.includes('claims'),'세 주장을 근거와 함께 대조한다.');if(!tasks.length)tasks.push({text:'한지수와 마지막 재면담을 시작한다.',mode:'case'});return tasks;
 }
 add(s.evidence.includes('recording'),'영사실에서 재생 기록과 방송 지시를 확인한다.','inspect','projection');
 if(expanded(s))add(s.topicsRead.includes('e_access'),'박은채에게 물품 보관과 접근 경위를 확인한다.','talk','lobby','eunchae');
 add(s.evidence.includes('original'),'이민재에게 연속 인수 원본을 확인한다.','talk','lobby','minjae');
 add(s.evidence.includes('packing'),'이민재의 장비 인수 목록을 확인한다.','talk','lobby','minjae','m_visit');
 add(s.evidence.includes('scene'),'영사실 작업대의 현장 기록을 확인한다.','inspect','projection');
 add(s.evidence.includes('bank'),'사무실 책상의 지급 자료를 확인한다.','inspect','office');
 add(s.evidence.includes('workers'),'세 직원에게 입금과 서명을 각각 확인한다.','people');
 add(s.evidence.includes('loan'),'한지수에게 자신의 계좌로 받은 돈을 묻는다.','talk','office','jisu','j_money');
 add(s.evidence.includes('message'),'한지수에게 대표의 원본 요구 연락을 확인한다.','talk','office','jisu','j_message');
 add(s.evidence.includes('ledger'),'한지수에게 빠진 서류와 장부 보관을 묻는다.','talk','office','jisu','j_ledger');
 add(s.evidence.includes('consents')&&s.evidence.includes('prior_photo'),'자료실의 동의서와 사무실 촬영 기록을 확인한다.','inspect','archive');
 add(s.evidence.includes('signature_file'),'사무실에 남은 확인서 작성 파일을 확인한다.','inspect','office');
 if(expanded(s)){
  for(const [ev,npc,loc,label] of [['live_call','minjae','lobby','실시간 통화'],['return_route','minjae','lobby','로비 귀환'],['media_scope','minjae','lobby','원본과 사본'],['rescue_detail','taeo','projection','소매 흔적'],['unconfirmed_sale','jisu','office','추가 매각 계획'],['file_inventory','eunchae','lobby','빠진 원본과 남은 사본']])add(s.evidence.includes(ev),D.people[npc].name+'에게 '+label+'을 확인한다.','talk',loc,npc);
  for(const [id,npc,loc] of [['j_boundary','jisu','office'],['j_ownbook','jisu','office']])add(s.topicsRead.includes(id),baseTopic(id).label,'talk',loc,npc,id);

  for(const id of ['accounts','documents','timeline'])add(s.activitiesDone.includes(id),D.activities[id].name+' 작업을 마친다.');
 }
 for(const id of expanded(s)?D.requiredNight:['broadcast','lens','payments','signatures'])add(s.solved.includes(id),D.deductions.find(d=>d.id===id).name+'의 근거를 정리한다.');
 if(!tasks.length)tasks.push({text:'자료를 검사 의뢰와 함께 정리하고 며칠 뒤로 진행한다.',mode:'case'});
 return tasks.slice(0,3);
}
function objective(s){return nextTasks(s)[0]?.text||'확보한 자료를 정리한다.';}
function lineCatalog(){const map=new Map();for(const [ref,d] of Object.entries(D.scenes)){d.lines.forEach((l,i)=>map.set(`scene/${ref}/${i}`,l));(d.variants||[]).forEach((v,j)=>v.lines.forEach((l,i)=>map.set(`scene/${ref}/v${j}/${i}`,l)));}for(const t of D.topics){t.lines.forEach((l,i)=>map.set(`topic/${t.id}/${i}`,l));(t.variants||[]).forEach((v,j)=>v.lines.forEach((l,i)=>map.set(`topic/${t.id}/v${j}/${i}`,l)));}for(const p of Object.values(D.places))for(const h of p.hotspots)h.lines.forEach((l,i)=>map.set(`hotspot/${h.id}/${i}`,l));return map;}
function validate(raw){const s=migrate(raw);if(s.guideVersion!==undefined&&s.guideVersion!==1)throw Error('안내 진행 정보가 손상되었습니다.');if(!D.places[s.location]||!['night','followup','epilogue','finished'].includes(s.phase)||!['expanded','classic'].includes(s.campaign))throw Error('진행 단계가 손상되었습니다.');
 const refs={visited:Object.keys(D.places),evidence:Object.keys(D.evidence),viewed:Object.keys(D.evidence),topicsRead:D.topics.map(t=>t.id),observed:Object.values(D.places).flatMap(p=>p.hotspots.map(h=>h.id)),solved:D.deductions.map(d=>d.id),scenesRead:Object.keys(D.scenes),activitiesDone:Object.keys(D.activities),bookmarks:Object.keys(D.evidence)};
 for(const [k,ids] of Object.entries(refs))if(!Array.isArray(s[k])||s[k].some(x=>!ids.includes(x))||unique(s[k]).length!==s[k].length)throw Error('저장 목록이 손상되었습니다: '+k);
 if(!all(s.evidence,s.viewed)||!all(s.evidence,s.bookmarks)||!Array.isArray(s.statements)||!Array.isArray(s.readLines)||!Array.isArray(s.log)||s.log.length>18000||!Number.isFinite(s.elapsed)||s.elapsed<0||typeof s.notes!=='string'||s.notes.length>12000)throw Error('저장 정보가 손상되었습니다.');
 if(s.statements.some(x=>!baseTopic(x.id)||x.text!==baseTopic(x.id).statement||x.npc!==baseTopic(x.id).npc))throw Error('진술 정보가 일치하지 않습니다.');
 root.EDITORIAL?.migrateLog(s.log);root.NARRATIVE?.migrateLog(s.log);
 const catalog=lineCatalog();if(s.readLines.some(id=>!catalog.has(id))||s.log.some(l=>!catalog.has(l.id)||l.text!==catalog.get(l.id).text||l.who!==catalog.get(l.id).who))throw Error('대화 기록이 손상되었습니다.');
 if(s.dialogue){const d=effectiveData(s);if(!['scene','topic','hotspot'].includes(s.dialogue.kind)||!d||!Number.isInteger(s.dialogue.index)||s.dialogue.index<0||s.dialogue.index>=d.lines.length)throw Error('대화 위치가 잘못되었습니다.');}
 if(s.dialogue?.awaitingChoice&&(!effectiveData(s)?.choices?.length||s.dialogue.index!==effectiveData(s).lines.length-1))throw Error('질문 선택 위치가 잘못되었습니다.');
 if(s.dialogue?.ref?.startsWith('conclusion_v7_')&&!s.interview)throw Error('면담 기록이 없습니다.');
 validateInterview(s);validateBookmarks(s);
 if(typeof s.caseClosed!=='boolean'||typeof s.completed!=='boolean'||(s.evidence.includes('lab')&&s.phase==='night'))throw Error('진행 플래그가 일치하지 않습니다.');
 if(s.caseClosed&&(!all(s.solved,CORE)||!s.viewed.includes('lab')))throw Error('사건 종료 근거가 부족합니다.');
 if(['epilogue','finished'].includes(s.phase)!==s.caseClosed)throw Error('후일담 단계가 일치하지 않습니다.');
 if(s.completed!==(s.phase==='finished'))throw Error('결말 상태가 일치하지 않습니다.');
 if(!s.delivery||![null,'private','screening'].includes(s.delivery.plan)||!Array.isArray(s.delivery.previews)||s.delivery.previews.some(id=>!D.previews[id]))throw Error('전달안이 손상되었습니다.');
 if(!s.consents||Object.entries(s.consents).some(([id,t])=>!D.endConsent[id]||!s.delivery.plan||D.deliveryResponses[s.delivery.plan][id]!==t))throw Error('동의 기록이 일치하지 않습니다.');
 if(s.delivery.plan==='screening'&&Object.keys(s.consents).some(id=>!s.delivery.previews.includes(id)))throw Error('확인본 확인 없이 상영 동의를 기록할 수 없습니다.');
 if(s.completed&&(!['A','B'].includes(s.ending)||Object.keys(D.endConsent).some(id=>!s.consents[id])))throw Error('결말의 의사 확인이 누락되었습니다.');
 if(!s.activityDrafts||typeof s.activityDrafts!=='object'||Array.isArray(s.activityDrafts)||JSON.stringify(s.activityDrafts).length>40000)throw Error('대조 초안이 손상되었습니다.');
 for(const [id,v] of Object.entries(s.activityDrafts)){
  const a=D.activities[id];if(!a||!v||typeof v!=='object'||Array.isArray(v))throw Error('대조 초안 형식이 잘못되었습니다.');
  if(a.kind==='order'&&(!Array.isArray(v.order)||v.order.length!==a.answer.length||unique(v.order).length!==a.answer.length||v.order.some(x=>!a.answer.includes(x))))throw Error('시간 배열 초안이 손상되었습니다.');
  if(a.kind==='number'&&Object.entries(v).some(([k,n])=>!a.fields.some(f=>f.id===k)||!['string','number'].includes(typeof n)||String(n).length>20))throw Error('금액 초안이 손상되었습니다.');
  if(a.kind==='select'&&Object.entries(v).some(([k,n])=>!a.fields.some(f=>f.id===k&&(n===''||f.options.some(o=>o[0]===n)))))throw Error('문서 대조 초안이 손상되었습니다.');
  if(a.kind==='claims')for(const [k,n] of Object.entries(v)){
   if(k.endsWith('_sources')){if(!a.fields.some(f=>f.id+'_sources'===k)||!Array.isArray(n)||n.some(e=>!s.evidence.includes(e)))throw Error('주장 근거 초안이 손상되었습니다.');}
   else if(!a.fields.some(f=>f.id===k)||!['','supported','conflict','unknown'].includes(n))throw Error('주장 분류 초안이 손상되었습니다.');
  }
 }
 if(unique(s.delivery.previews).length!==s.delivery.previews.length)throw Error('확인본 기록이 중복되었습니다.');
 if(s.completed&&((s.ending==='A')!==(s.delivery.plan==='screening')))throw Error('결말과 전달안이 일치하지 않습니다.');

 return s;
}
const M={D,suspendTopic,resumePosition,validateBookmarks,enterScene,pendingChoices,chooseDialogue,validateInterview,fresh,migrate,topic,hotspot,available,questions,grant,dialogueData:effectiveData,currentLine,lineId,seeLine,advance,startTopic,inspect,move,availableDeductions,prove,activities,checkActivity,labReady,beginFollowup,finalReady,beginFinal,consent,preview,setDelivery,endingReady,beginEnding,chapter,nextTasks,objective,validate,all,locationOf};root.MODEL=M;if(typeof module!=='undefined')module.exports=M;
})(typeof window!=='undefined'?window:globalThis);
