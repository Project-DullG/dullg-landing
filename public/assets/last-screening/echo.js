/* Series framing. The theater's event facts are never mutated by this module.
 * Hub time is current. Investigation is an archival replay of Haeon's past POV.
 * Delivery after report happens now, not by changing the recalled past.
 */
(function(root){'use strict';
 const D=root.ECHO_DATA,M=root.MODEL;const clone=x=>JSON.parse(JSON.stringify(x));
 const screens=['story','hub','cases','report','growth','memories','parallel','episode','case-review','report015','letter015','correspondence015','shortcase','joseon','office-talks','academy','archive079'];
 function initial(){return {version:1,view:'story',node:'rain',index:0,awaiting:false,accepted:false,entered:false,returned:false,reported:false,settled:false,points:0,credits:0,skills:[],read:[],log:[],answers:[],inspected:[],tone:null,parallel:[null,null],lastCaseMode:'visit',lastCaseNpc:'minjae',session:'first'};}
 function attach(s,legacy=false){if(!s.echo){s.echo=initial();if(legacy){Object.assign(s.echo,{view:'episode',accepted:true,entered:true,session:'legacy'});if(s.completed)Object.assign(s.echo,{returned:true,reported:true,view:'hub'});}}root.CONTENT015?.ensure?.(s);root.PROGRESSION?.ensure?.(s);root.SHORT_CASES?.ensure?.(s);return s.echo;}
 const active=s=>!!s?.echo&&s.echo.view!=='episode';
 const current=s=>s?.echo?.view==='story'?D.nodes[s.echo.node]:null;
 const line=s=>current(s)?.lines[s.echo.index]||null;
 function start(s,id){const n=D.nodes[id];if(!n)throw Error('존재하지 않는 사무소 장면입니다.');Object.assign(s.echo,{view:'story',node:id,index:0,awaiting:false});}
 function record(s){const x=s.echo,n=current(s),l=line(s);if(!l)return;const id=n.id+'/'+x.index;if(!x.read.includes(id)){x.read.push(id);x.log.push({id,who:l.who,text:l.text});}}
 function effect(s,id){const x=s.echo;switch(id){
  case 'hub':x.view='hub';break;
  case 'accept':x.accepted=true;x.view='hub';break;
  case 'enter':if(!x.accepted)throw Error('먼저 의뢰를 확인하세요.');x.entered=true;x.view='episode';break;
  case 'report':if(!s.caseClosed||!x.returned)throw Error('조사 기록을 마무리한 뒤 보고할 수 있습니다.');x.view='report';break;
  case 'reported':if(!s.caseClosed)throw Error('보고할 사건이 아직 열려 있습니다.');x.reported=true;x.view='hub';break;
  case 'settle':if(!s.completed||!x.reported)throw Error('보고와 전달 협의가 먼저입니다.');if(!x.settled){if(root.PROGRESSION)root.PROGRESSION.award(s,'case01');else{x.credits+=D.fee;x.points+=D.points;}x.settled=true;}x.view='growth';break;
  case 'memories':x.view='memories';break;
  default:if(root.CONTENT015?.effect(s,id))break;throw Error('알 수 없는 장면 동작입니다.');
 }}
 function advance(s){const n=current(s),x=s.echo;if(!n||x.awaiting)return false;record(s);if(x.index+1<n.lines.length){x.index++;return true;}if(n.choices?.length){x.awaiting=true;return true;}if(n.next)start(s,n.next);else effect(s,n.effect);return true;}
 function choose(s,id){const x=s.echo,n=current(s);if(!n||!x.awaiting)throw Error('현재 선택할 대답이 없습니다.');const c=n.choices?.find(c=>c.id===id);if(!c)throw Error('현재 장면에 없는 선택입니다.');x.answers.push({node:n.id,id});if(x.answers.length>200)x.answers.shift();if(c.tone)x.tone=c.tone;x.awaiting=false;if(c.next)start(s,c.next);else effect(s,c.effect);}
 function observe(s){const x=s?.echo;if(!x||x.view!=='episode')return;
  if(s.caseClosed&&!x.returned){x.returned=true;start(s,'returned');}
  else if(s.completed&&x.reported&&!x.settled)start(s,'closing');
 }
 function resume(s){const x=s.echo;if(root.CONTENT015?.resumeStory(s))return;if(s.completed&&x.settled){x.view='case-review';return;}if(!x.accepted){start(s,'visitor');return;}if(!x.entered){start(s,'entry');return;}if(s.completed&&x.reported&&!x.settled){start(s,'closing');return;}if(s.caseClosed&&!x.reported){x.returned=true;x.view='report';return;}x.view='episode';}
 function inspect(s,id){if(!['desk','self','brief'].includes(id))throw Error('살펴볼 수 없는 곳입니다.');if(!s.echo.inspected.includes(id))s.echo.inspected.push(id);start(s,id);}
 function buy(s,id){const x=s.echo,k=D.skills.find(k=>k.id===id);if(!k||!x.settled)throw Error('의뢰를 마친 뒤 기록을 정리할 수 있습니다.');if(x.skills.includes(id))return false;if(x.points<k.cost)throw Error('사용할 공명 기록이 부족합니다.');x.points-=k.cost;x.skills.push(id);return true;}
 function report(s){if(!s.caseClosed||!s.echo.returned)throw Error('아직 보고서를 제출할 수 없습니다.');start(s,s.echo.tone==='careful'?'report_careful':'report_plain');}
 function summary(s){const x=s.echo;if(!x)return '기존 사건 기록';if(x.view==='story')return current(s)?.title||'사무소';if(x.view==='letter015')return '늦게 도착한 초대 · '+(x.extra15?.letter?.complete?'보고 완료':x.extra15?.letter?.phase==='deduction'?'추리 중':'기록 조사');if(x.view==='shortcase'){const id=x.shortCaseActive,c=root.SHORT_CASES_DATA?.cases?.[id],q=root.SHORT_CASES?.state?.(s,id);return (c?.title||'짧은 의뢰')+' · '+(q?.complete?'보고 완료':q?.phase==='deduction'?'추리 중':'기록 조사');}if(x.view==='case-review')return '마지막 상영 · 종결 기록';if(x.view==='growth')return '공명 도구';if(!x.accepted)return '의뢰인과 상담';if(!x.entered)return '첫 번째 의뢰 준비';if(s.completed)return '의뢰 보고와 기록 정리';if(s.caseClosed)return x.reported?'현재 · 영상 반환 협의':'현재 · 의뢰 보고';return x.view==='episode'?'열람 중 · 마지막 상영':'사무소 · 조사 기록 보관';}
 function music(s,aux,back){if(!active(s))return null;const layers=[...(back||[]),...(aux?[aux]:[])];let key=s.echo.settled?'bgm_17_closing':'bgm_08_office';if(s.echo.view==='story'){const id=String(s.echo.node||'');if(id==='rain')key='bgm_18_entry';else if(id==='entry')key='bgm_11_resonance';else if(id==='self'||id==='return015_pause')key='bgm_08_office';else if(id==='returned'||id==='closing'||id.startsWith('report015')||id.startsWith('report_'))key='bgm_14_report';else if(id.startsWith('letter015_read'))key='bgm_20_archive';else if(id.startsWith('letter015_reply'))key='bgm_15_memory';else key='bgm_10_client';}if(['report','report015'].includes(s.echo.view))key='bgm_14_report';if(['parallel','case-review','letter015','shortcase'].includes(s.echo.view))key='bgm_20_archive';if(['memories','correspondence015','office-talks'].includes(s.echo.view))key='bgm_15_memory';if(layers.some(a=>['echo-log','log','evidence','echo-photo'].includes(a.kind)))key='bgm_20_archive';return {key,paused:layers.some(a=>a.kind==='pause'),reason:'echo-office'};}
 function validate(s){if(s.echo===undefined)return s;const x=s.echo,bad=m=>{throw Error('사무소 저장 상태가 손상되었습니다. '+m);};
  if(!x||x.version!==1||!screens.includes(x.view)||!D.nodes[x.node]||!Number.isInteger(x.index)||x.index<0||x.index>=D.nodes[x.node].lines.length)bad('장면');
  for(const k of ['awaiting','accepted','entered','returned','reported','settled'])if(typeof x[k]!=='boolean')bad(k);
  if(x.awaiting&&(!D.nodes[x.node].choices?.length||x.index!==D.nodes[x.node].lines.length-1))bad('선택');
  for(const k of ['points','credits'])if(!Number.isInteger(x[k])||x[k]<0)bad(k);
  if(!Array.isArray(x.skills)||new Set(x.skills).size!==x.skills.length||x.skills.some(k=>!D.skills.some(t=>t.id===k)))bad('능력');
  if(root.PROGRESSION){const b=root.PROGRESSION.expectedBalances(s);if(x.points!==b.points||x.credits!==b.credits)bad('보상');}else if(x.points!==(x.settled?D.points:0)-x.skills.reduce((a,id)=>a+D.skills.find(k=>k.id===id).cost,0)||x.credits!==(x.settled?D.fee:0)+(x.extra15?.letter?.paid?50000:0))bad('보상');
  if(x.reported&&(!x.returned||!s.caseClosed)||x.returned&&!s.caseClosed||x.settled&&(!x.reported||!s.completed)||x.entered&&!x.accepted)bad('진행 순서');
  if(!Array.isArray(x.read)||x.read.length>1000||new Set(x.read).size!==x.read.length||x.read.some(id=>{const [r,i]=id.split('/');return !D.nodes[r]?.lines[+i];}))bad('열람 기록');
  if(!Array.isArray(x.log)||x.log.length>1000)bad('대화 기록');for(const l of x.log){const [r,i]=String(l.id).split('/'),b=D.nodes[r]?.lines[+i];if(!b||!x.read.includes(l.id))bad('대화 기록');l.who=b.who;l.text=b.text;}
  if(!Array.isArray(x.answers)||x.answers.length>200||x.answers.some(c=>!D.nodes[c.node]?.choices?.some(t=>t.id===c.id)))bad('응답');
  if(!Array.isArray(x.inspected)||x.inspected.some(id=>!['desk','self','brief'].includes(id)))bad('관찰');
  if(!Array.isArray(x.parallel)||x.parallel.length!==2||x.parallel.some(id=>id!==null&&!s.evidence.includes(id)))bad('비교');
  if(!['first','legacy'].includes(x.session)||!['plain','careful',null].includes(x.tone))bad('의뢰');
  if(!['visit','inspect','talk','evidence','people','case','map','reasoning'].includes(x.lastCaseMode)||!root.STORY.people[x.lastCaseNpc])bad('돌아갈 조사');
  if(x.view==='episode'&&!x.entered||x.view==='report'&&(!s.caseClosed||!x.returned)||x.view==='memories'&&!root.PROGRESSION?.hasFeature?.(s,'aftertone')&&!x.skills.includes('aftertone')||x.view==='parallel'&&!root.PROGRESSION?.hasFeature?.(s,'parallel')&&!x.skills.includes('parallel')||x.view==='shortcase'&&!root.SHORT_CASES_DATA?.cases?.[x.shortCaseActive])bad('화면 접근');return s;
 }
 const baseValidate=M.validate;M.validate=function(s){baseValidate(s);return validate(s);};
 root.ECHO={data:D,initial,attach,active,current,line,start,advance,record,choose,observe,resume,inspect,buy,report,summary,music,validate};
})(typeof window!=='undefined'?window:globalThis);
