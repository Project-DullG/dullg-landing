/* 0.17: Office report and an optional, independent paper-trail case.
 * No new cinema facts; no paid hints. Models are deterministic and saveable.
 */
(function(root){'use strict';
 const M=root.MODEL,E=root.ECHO,D=root.STORY,X=root.CONTENT015_DATA;
 Object.assign(E.data.nodes,X.nodes);D.names.yujin='차유진';D.people.yujin={name:'차유진',role:'전시 기획자 · 전화 의뢰',asset:'yujin',contact:true,bio:'추가 의뢰를 맡긴 전시 기획자. 개막식 초대장이 실제로 언제 전달됐는지 확인을 요청했다.'};D.release='0.50.0';
 const clone=x=>JSON.parse(JSON.stringify(x)),uniq=a=>new Set(a).size===a.length;
 const pages=['report015','letter015','correspondence015','case-review'];
 function fresh(){return {version:1,reportRead:[],reportFocus:null,suspended:null,letter:{accepted:false,read:[],topics:[],solved:[],issue:null,phase:'investigation',selected:null,proofs:[],mistakes:0,attempt:0,submissions:[],feedback:null,doc:null,hints:{},complete:false,paid:false,ending:null,legacy017:false},correspondenceRead:[]};}
 function ensure(s){if(!s?.echo)return null;if(s.echo.extra15===undefined)s.echo.extra15=fresh();const c=s.echo.extra15,l=c?.letter;if(l&&l.legacy017===undefined)l.legacy017=!!l.complete&&!l.solved.includes('intent');return c;}
 const ext=s=>ensure(s),mini=s=>ext(s)?.letter;
 const available=s=>!!s?.echo?.settled;
 const reportAllowed=s=>!!s?.caseClosed&&!!s?.echo?.returned;
 function at(s){return E.active(s)?s.echo.view:null;}
 function suspendStory(s){const z=ext(s);if(s.echo.view==='story'){z.suspended={node:s.echo.node,index:s.echo.index,awaiting:s.echo.awaiting};}}
 function resumeStory(s){const z=ext(s);if(!z?.suspended)return false;Object.assign(s.echo,{view:'story',...z.suspended});z.suspended=null;return true;}
 function open(s,id){const x=s.echo,c=ext(s);if(!x||!pages.includes(id))throw Error('열 수 없는 기록입니다.');
  if(id==='report015'&&!reportAllowed(s)||id==='letter015'&&!available(s)||id==='correspondence015'&&!x.reported||id==='case-review'&&!s.completed)throw Error('이 기록은 아직 열리지 않았습니다.');
  if(id==='letter015'&&!c.letter.accepted){E.start(s,'letter015_arrival');return;}
  x.view=id;
 }
 function startReport(s,id){if(!reportAllowed(s))throw Error('사건을 확인한 뒤 이야기할 수 있습니다.');const q=X.report.find(q=>q.id===id);if(!q)throw Error('확인할 질문이 아닙니다.');ext(s).reportFocus=id;E.start(s,q.node);}
 function reportSources(s,id){const q=X.report.find(q=>q.id===id);return [...new Set([...(q?.sources||[]),...(q?.fallback||[])])].filter(k=>D.evidence[k]&&s.evidence.includes(k));}
 function effect(s,id){const x=s.echo,c=ext(s),l=c.letter;
  if(id.startsWith('report015:')){const k=id.split(':')[1];if(!reportAllowed(s)||!X.report.some(q=>q.id===k))throw Error('보고할 기록이 없습니다.');if(!c.reportRead.includes(k))c.reportRead.push(k);x.view='report015';c.reportFocus=k;return true;}
  if(id==='correspondence015'){if(!c.correspondenceRead.includes('seoa'))c.correspondenceRead.push('seoa');x.view='correspondence015';return true;}
  if(!id.startsWith('letter015:'))return false;
  if(!available(s))throw Error('먼저 의뢰를 마무리해 주세요.');
  const [_,act,value]=id.split(':');
  if(act==='accept'){l.accepted=true;x.view='letter015';}
  else if(act==='shelve'){x.view='hub';}
  else if(act==='workspace'){x.view='letter015';}
  else if(act==='read'){read(s,value);x.view='letter015';}
  else if(act==='topic'){if(!l.topics.includes(value))l.topics.push(value);x.view='letter015';}
  else if(act==='complete'){
   if(!X.letter.issues.every(q=>l.solved.includes(q.id))||!['dates','comfort'].includes(value))throw Error('아직 전달할 결론이 정리되지 않았습니다.');
   l.complete=true;l.ending=value;l.phase='archive';l.issue=null;l.selected=null;l.proofs=[];l.feedback=null;
   if(!l.paid){if(root.PROGRESSION)root.PROGRESSION.award(s,'letter015');else x.credits+=X.letter.fee;l.paid=true;}
   x.view='letter015';
  }else if(act==='archive'){if(!l.complete)throw Error('아직 답장이 오지 않았습니다.');if(!c.correspondenceRead.includes('yujin'))c.correspondenceRead.push('yujin');x.view='correspondence015';}
  else throw Error('알 수 없는 기록 처리입니다.');return true;
 }
 function read(s,id){const l=mini(s);if(!l?.accepted||!X.letter.records.some(r=>r.id===id))throw Error('확인할 자료가 없습니다.');if(!l.read.includes(id))l.read.push(id);l.doc=id;return X.letter.records.find(r=>r.id===id);}
 function letterAction(s,act,id){const x=s.echo,l=mini(s);if(!available(s)||!l.accepted)throw Error('의뢰를 먼저 확인하세요.');
  if(act==='start'){
   if(l.complete)return;l.phase='deduction';l.attempt++;l.mistakes=0;l.submissions=[];l.feedback=null;l.issue=X.letter.issues.find(q=>!l.solved.includes(q.id))?.id||null;l.doc=null;
  }else if(act==='leave'){l.phase='investigation';l.feedback=null;l.mistakes=0;}
  else if(act==='issue'){if(!X.letter.issues.some(q=>q.id===id))return;l.issue=id;l.selected=null;l.proofs=[];l.feedback=null;l.mistakes=0;l.submissions=[];}
  else if(act==='claim'){const q=issue(s);if(!q||!q.options.some(o=>o.id===id)||l.solved.includes(q.id))return;l.selected=id;l.feedback=null;}
  else if(act==='proof'){if(!l.read.includes(id)||!issue(s)||l.solved.includes(l.issue))return;const i=l.proofs.indexOf(id);if(i<0)l.proofs.push(id);else l.proofs.splice(i,1);l.feedback=null;}
  else if(act==='next'){l.issue=X.letter.issues.find(q=>!l.solved.includes(q.id))?.id||null;l.selected=null;l.proofs=[];l.feedback=null;l.mistakes=0;l.submissions=[];}
  else if(act==='hint'){const q=issue(s);if(q)l.hints[q.id]=Math.min(3,(l.hints[q.id]||0)+1);}
  else if(act==='topic'){if(!l.read.includes('receipt'))return;E.start(s,'letter015_receipt');}
  else if(act==='report'){if(!X.letter.issues.every(q=>l.solved.includes(q.id))||l.complete)return;E.start(s,'letter015_report');}
  else if(act==='trace'){if(!l.read.includes(id))return;E.start(s,'letter015_read_'+id);}
  else throw Error('알 수 없는 조사 행동입니다.');
 }
 function issue(s){const l=mini(s);return X.letter.issues.find(q=>q.id===l?.issue)||null;}
 function submit(s){const l=mini(s),q=issue(s);if(!available(s)||l.phase!=='deduction'||!q)throw Error('지금 제출할 판단이 없습니다.');
  if(l.solved.includes(q.id))return {code:'solved',text:q.result};
  const reply=(code,text)=>l.feedback={code,text};
  if(!l.selected||!l.proofs.length)return reply('empty','생각과 근거를 하나씩 선택해 주세요. 조사로 돌아가도 읽은 기록은 남습니다.');
  if(q.need.some(k=>!l.read.includes(k)))return reply('insufficient','아직 읽지 않은 기록이 있습니다. 받은 자료를 더 살펴본 뒤 다시 이야기해 봅시다.');
  if(l.selected!==q.correct){
   const signature=[q.id,l.selected,...[...l.proofs].sort()].join('|');
   if(!l.submissions.includes(signature)){l.submissions.push(signature);l.mistakes++;}
   if(l.mistakes>=3){l.phase='investigation';return reply('return','잠시 기록을 더 살펴보자. 이미 알아낸 내용과 자료는 남아 있다.');}
   return reply('wrong',q.wrong);
  }
  if(!q.need.every(k=>l.proofs.includes(k)))return reply('partial','그 판단을 뒷받침할 다른 기록도 함께 골라 주세요. 이미 고른 근거는 유지됩니다.');
  l.solved.push(q.id);l.mistakes=0;return reply('correct',q.result);
 }
 function hintedSources(s){const l=mini(s),q=issue(s);return (l.hints[q?.id]||0)>=2?(q?.need||[]).filter(k=>l.read.includes(k)):[];}
 function hintText(s){const l=mini(s),q=issue(s);if(!q)return[];const level=l.hints[q.id]||0;
  // The last hint names only records that the player has actually opened.
  return q.hints.slice(0,level).map((h,i)=>i===2&&q.need.some(k=>!l.read.includes(k))?'받은 자료를 더 읽은 뒤 날짜와 이름을 다시 연결해 보세요.':h);
 }
 function correspondence(s,id){const c=ext(s);if(id==='yujin'&&c.letter.complete)E.start(s,'letter015_reply');else if(id==='seoa'&&s.echo.reported)E.start(s,'report015_reply');else throw Error('아직 도착하지 않은 답장입니다.');}
 function tracking(s){const l=mini(s);return !!l?.accepted&&!l.complete&&(s.echo.view==='letter015'||s.echo.view==='story'&&s.echo.node.startsWith('letter015'));}
 function validate(s){if(!s.echo)return s;const x=s.echo,c=ensure(s),bad=m=>{throw Error('추가 의뢰 기록이 손상되었습니다. '+m);};
  if(!c||c.version!==1||!Array.isArray(c.reportRead)||!uniq(c.reportRead)||c.reportRead.some(k=>!X.report.some(q=>q.id===k))||c.reportFocus!==null&&!X.report.some(q=>q.id===c.reportFocus))bad('보고');
  if(!Array.isArray(c.correspondenceRead)||!uniq(c.correspondenceRead)||c.correspondenceRead.some(k=>!['seoa','yujin'].includes(k)))bad('답장');
  const h=c.suspended;if(h!==null&&(!h||!X.nodes[h.node]&&!E.data.nodes[h.node]||!Number.isInteger(h.index)||h.index<0||h.index>=E.data.nodes[h.node]?.lines.length||typeof h.awaiting!=='boolean'||h.awaiting&&(!E.data.nodes[h.node]?.choices?.length||h.index!==E.data.nodes[h.node].lines.length-1)))bad('대화 책갈피');
  const l=c.letter;if(!l||typeof l!=='object')bad('단편');
  for(const k of ['accepted','complete','paid','legacy017'])if(typeof l[k]!=='boolean')bad(k);
  const sources=X.letter.records.map(r=>r.id),issues=X.letter.issues.map(q=>q.id);
  for(const [k,allowed] of [['read',sources],['solved',issues],['topics',['receipt','delay']]])if(!Array.isArray(l[k])||!uniq(l[k])||l[k].some(v=>!allowed.includes(v)))bad(k);
  if(!['investigation','deduction','archive'].includes(l.phase)||!Number.isInteger(l.mistakes)||l.mistakes<0||l.mistakes>3||!Number.isInteger(l.attempt)||l.attempt<0||l.attempt>1e6)bad('시도');
  if(l.issue!==null&&!issues.includes(l.issue)||l.doc!==null&&!l.read.includes(l.doc))bad('선택 자료');
  const q=X.letter.issues.find(q=>q.id===l.issue);
  if(l.selected!==null&&!q?.options.some(o=>o.id===l.selected)||!Array.isArray(l.proofs)||!uniq(l.proofs)||l.proofs.some(k=>!l.read.includes(k)))bad('초안');
  if(!Array.isArray(l.submissions)||l.submissions.length>20||l.submissions.some(k=>typeof k!=='string'||k.length>200))bad('제출');
  if(!l.hints||typeof l.hints!=='object'||Array.isArray(l.hints)||Object.entries(l.hints).some(([id,v])=>!issues.includes(id)||!Number.isInteger(v)||v<0||v>3))bad('힌트');
  if(l.feedback!==null&&(!l.feedback||!['empty','insufficient','solved','partial','wrong','return','correct'].includes(l.feedback.code)||typeof l.feedback.text!=='string'||l.feedback.text.length>500))bad('피드백');
  if(![null,'dates','comfort'].includes(l.ending)||l.paid!==l.complete||l.complete&&(!l.accepted||(!l.legacy017&&!issues.every(id=>l.solved.includes(id)))||(l.legacy017&&!['recipient','arrival'].every(id=>l.solved.includes(id)))||!l.ending)||l.legacy017&&!l.complete||l.phase==='archive'&&!l.complete)bad('완료');
  if(l.accepted&&!x.settled||l.read.length&&!l.accepted||l.solved.some(id=>!X.letter.issues.find(q=>q.id===id).need.every(k=>l.read.includes(k))))bad('조사 순서');
  if(c.reportRead.length&&!reportAllowed(s)||c.correspondenceRead.includes('seoa')&&!x.reported||c.correspondenceRead.includes('yujin')&&!l.complete)bad('공개');
  if(x.view==='letter015'&&(!available(s)||!l.accepted)||x.view==='case-review'&&!s.completed||x.view==='report015'&&!reportAllowed(s)||x.view==='correspondence015'&&!x.reported)bad('화면');
  if(x.view==='story'&&x.node.startsWith('letter015')&&!available(s))bad('단편 접근');
  return s;
 }
 const oldAttach=E.attach;E.attach=function(s,legacy){oldAttach(s,legacy);ensure(s);return s.echo;};
 const oldValidate=M.validate;M.validate=function(s){oldValidate(s);return validate(s);};
 root.CONTENT015={data:X,fresh,ensure,ext,mini,at,available,reportAllowed,suspendStory,resumeStory,open,startReport,reportSources,effect,read,letterAction,issue,submit,hintedSources,hintText,correspondence,tracking,validate};
})(typeof window!=='undefined'?window:globalThis);
