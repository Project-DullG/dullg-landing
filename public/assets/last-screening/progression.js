(function(root){'use strict';
 const E=()=>root.ECHO_DATA||{},M=root.MODEL;
 const TRACKS=[
  {id:'field',name:'현장형',tag:'현장 확인을 빠르게 정리',description:'이미 조사한 장소와 관찰 내용을 다시 찾기 쉽게 정리한다.',node:{id:'field_index',name:'현장 체크',cost:1,description:'공명 도구에서 이미 확인한 현장 관찰을 장소별로 다시 찾는다. 미발견 단서의 이름은 표시하지 않는다.'},tier2:{id:'field_route',name:'동선 정리',cost:2,requires:'field_index',description:'이미 확인한 관찰만 장소·시각 순서로 묶어 본다. 방문하지 않은 장소나 숨은 단서는 만들지 않는다.'}},
  {id:'dialogue',name:'대화형',tag:'다시 물을 사람을 빠르게 찾기',description:'현재 시점에서 새로 물을 수 있는 사람이 있는지 면담 기록을 정리한다.',node:{id:'dialogue_index',name:'면담 색인',cost:1,description:'공명 도구에서 현재 다시 물을 수 있는 인물과 열린 질문 수를 확인한다. 질문의 정답은 표시하지 않는다.'},tier2:{id:'dialogue_context',name:'진술 맥락',cost:2,requires:'dialogue_index',description:'이미 들은 진술을 화자·질문 맥락별로 다시 묶는다. 모순을 자동 판정하거나 새 질문의 정답을 표시하지 않는다.'}},
  {id:'records',name:'기록형',tag:'사용한 근거를 다시 묶어 보기',description:'입증한 판단에서 사용한 원자료를 다시 찾기 쉽게 묶는다.',node:{id:'record_index',name:'근거 묶음',cost:1,description:'공명 도구에서 이미 제출해 입증한 판단의 근거 자료를 다시 연다. 새로운 근거를 자동 추천하지 않는다.'},tier2:{id:'record_provenance',name:'출처 표식',cost:2,requires:'record_index',description:'이미 읽은 자료를 원본·사본·요약·재인용 같은 출처 층으로 표시한다. 독립성 여부를 자동 결론내리지는 않는다.'}}
 ];
 const REWARDS={
  case01:{id:'case01',title:'마지막 상영',credits:300000,points:2,kind:'장편 의뢰'},
  letter015:{id:'letter015',title:'늦게 도착한 초대',credits:50000,points:1,kind:'짧은 의뢰'},
  spare_key:{id:'spare_key',title:'두 번째 열쇠',credits:40000,points:1,kind:'짧은 의뢰'}
 };
 const GROWTH_NODES=TRACKS.flatMap(t=>[{...t.node,track:t.id},...(t.tier2?[{...t.tier2,track:t.id,tier:2}]:[])]);
 function base(){return {version:1,focus:null,nodes:[],rewardLedger:[],officeSeen:[]};}
 function ensure(s){if(!s?.echo)return null;const x=s.echo;if(!x.progression||typeof x.progression!=='object'||Array.isArray(x.progression))x.progression=base();const p=x.progression;
  if(p.version!==1)p.version=1;if(!['field','dialogue','records',null].includes(p.focus))p.focus=null;if(!Array.isArray(p.nodes))p.nodes=[];if(!Array.isArray(p.rewardLedger))p.rewardLedger=[];if(!Array.isArray(p.officeSeen))p.officeSeen=[];
  // Old saves already contain the cash/points from these commissions. Create ledger entries without paying twice.
  if(x.settled&&!p.rewardLedger.some(r=>r.id==='case01'))p.rewardLedger.push({...REWARDS.case01,migrated:true});
  const letter=x.extra15?.letter;
  if(letter?.paid&&!p.rewardLedger.some(r=>r.id==='letter015')){p.rewardLedger.push({...REWARDS.letter015,migrated:true});x.points+=REWARDS.letter015.points;}
  const sc=x.shortCases?.spare_key;
  if(sc?.paid&&!p.rewardLedger.some(r=>r.id==='spare_key'))p.rewardLedger.push({...REWARDS.spare_key,migrated:true});
  return p;
 }
 function tracks(){return TRACKS;}
 function node(id){return GROWTH_NODES.find(n=>n.id===id)||null;}
 function hasNode(s,id){return !!ensure(s)?.nodes.includes(id);}
 function setFocus(s,id){const p=ensure(s);if(!TRACKS.some(t=>t.id===id))throw Error('선택할 수 없는 성장 방향입니다.');p.focus=id;return true;}
 function buyNode(s,id){const p=ensure(s),n=node(id);if(!n)throw Error('존재하지 않는 성장 항목입니다.');if(!s.echo.settled)throw Error('첫 의뢰를 마친 뒤 성장 항목을 선택할 수 있습니다.');if(n.tier===2){if(!root.ACADEMY?.state(s)?.complete)throw Error('세 번째 장편을 마친 뒤 2단계 정리 기능을 열 수 있습니다.');if(!p.nodes.includes(n.requires))throw Error('같은 분야의 1단계 정리 기능이 먼저 필요합니다.');}if(p.nodes.includes(id))return false;if(s.echo.points<n.cost)throw Error('공명 포인트가 부족합니다.');s.echo.points-=n.cost;p.nodes.push(id);if(!p.focus)p.focus=n.track;return true;}
 function hasFeature(s,id){const x=s?.echo;if(!x)return false;if(id==='parallel')return x.skills?.includes('parallel')||hasNode(s,'record_index');if(id==='aftertone')return x.skills?.includes('aftertone');return hasNode(s,id);}
 function award(s,id){const x=s.echo,p=ensure(s),r=REWARDS[id];if(!r)throw Error('알 수 없는 의뢰 보상입니다.');if(p.rewardLedger.some(v=>v.id===id))return false;x.credits+=r.credits;x.points+=r.points;p.rewardLedger.push({...r});return true;}
 function expectedBalances(s){const x=s.echo,p=ensure(s);let credits=0,points=0;
  for(const r of p.rewardLedger){const def=REWARDS[r.id];if(def){credits+=def.credits;points+=def.points;}}
  // Legacy office extensions still spend the old point cost.
  for(const id of x.skills||[]){const k=E().skills?.find(k=>k.id===id);if(k)points-=k.cost;}
  for(const id of p.nodes){const n=node(id);if(n)points-=n.cost;}
  return {credits,points};
 }
 function officeLevel(s){const x=s?.echo,p=ensure(s);if(!x)return 1;let level=1;if(x.settled)level=2;if(p.rewardLedger.length>=2)level=3;if(p.nodes.length>=2||p.rewardLedger.length>=3)level=4;return level;}
 function officeMilestones(s){const x=s.echo,p=ensure(s),level=officeLevel(s);return [
  {id:'casefile',open:level>=2,title:'첫 종결 사건함',text:'〈마지막 상영〉 보고서와 원본 사본을 분리해 보관했다.'},
  {id:'shorts',open:level>=3,title:'짧은 의뢰 보관함',text:'작은 의뢰도 장편과 같은 기준으로 기록하고 보상 내역을 남긴다.'},
  {id:'resonance',open:level>=4,title:'공명 정리판',text:'선택한 성장 항목과 다음에 시험할 조사 방식을 한곳에 정리한다.'}
 ];}
 function mainEvaluation(s){const core=root.DEDUCTION?.core||['broadcast','lens','payments','signatures','visit'];const accepted=(s.reasoning?.records||[]).filter(r=>r.code==='accepted');const proofs=[...new Set(accepted.flatMap(r=>r.proofs||[]))];const rechecks=Math.max(0,(s.reasoning?.attempt||0)-1);return {title:'마지막 상영',status:s.caseClosed?'진상 정리 완료':'조사 진행 중',rows:[['핵심 논점',`${core.filter(id=>s.solved.includes(id)).length}/${core.length} 확인`],['판단에 사용한 원자료',`${proofs.length}건`],['재조사 회차',`${rechecks}회`],['후속 검사',s.viewed.includes('lab')?'확인':'미확인']],note:'힌트를 사용하거나 재조사했다고 보수가 줄어들지 않는다. 보고서에는 확인한 사실과 아직 알 수 없는 부분을 나눠 적는다.'};}
 function letterEvaluation(s){const l=s.echo?.extra15?.letter;if(!l)return null;const total=root.CONTENT015_DATA?.letter?.issues?.length||3;return {title:'늦게 도착한 초대',status:l.complete?'보고 완료':l.accepted?'확인 중':'미수락',rows:[['확인한 질문',`${l.solved.length}/${total}`],['읽은 기록',`${l.read.length}/${root.CONTENT015_DATA?.letter?.records?.length||4}`],['추리 시도',`${l.attempt}회`]],note:'확인할 수 없는 마음이나 의도는 추정으로 채우지 않는다.'};}
 function shortEvaluation(s,id){return root.SHORT_CASES?.evaluation(s,id)||null;}
 function evaluations(s){return [mainEvaluation(s),letterEvaluation(s),shortEvaluation(s,'spare_key')].filter(Boolean);}
 function fieldSummary(s){if(!hasNode(s,'field_index'))return null;const D=root.STORY;return Object.entries(D.places).filter(([id])=>s.visited?.includes(id)).map(([id,p])=>({id,name:p.name,seen:p.hotspots.filter(h=>s.observed.includes(h.id)).map(h=>h.name)}));}
 function dialogueSummary(s){if(!hasNode(s,'dialogue_index'))return null;const M=root.MODEL,D=root.STORY,out=[];for(const [id,p] of Object.entries(D.people)){const q=D.topics.filter(t=>t.npc===id&&M.available(s,t)&&!s.topicsRead.includes(t.id));if(q.length)out.push({id,name:p.name,count:q.length,loc:M.locationOf(s,id)});}return out;}
 function recordSummary(s){if(!hasNode(s,'record_index'))return null;const by={};for(const r of s.reasoning?.records||[]){if(r.code!=='accepted')continue;by[r.issue]=[...new Set([...(by[r.issue]||[]),...(r.proofs||[])])];}return Object.entries(by).map(([issue,proofs])=>({issue,name:root.STORY.deductions.find(d=>d.id===issue)?.name||issue,proofs}));}
 function validate(s){if(!s.echo)return s;const p=ensure(s),bad=m=>{throw Error('성장·보상 기록이 손상되었습니다. '+m);};if(p.version!==1||!['field','dialogue','records',null].includes(p.focus))bad('성장 방향');if(new Set(p.nodes).size!==p.nodes.length||p.nodes.some(id=>!node(id)))bad('성장 항목');for(const id of p.nodes){const n=node(id);if(n?.tier===2&&(!p.nodes.includes(n.requires)||!root.ACADEMY?.state(s)?.complete))bad('2단계 성장 조건');}if(new Set(p.rewardLedger.map(r=>r.id)).size!==p.rewardLedger.length||p.rewardLedger.some(r=>!REWARDS[r.id]||r.credits!==REWARDS[r.id].credits||r.points!==REWARDS[r.id].points||r.title!==REWARDS[r.id].title))bad('보상 내역');if(!Array.isArray(p.officeSeen)||new Set(p.officeSeen).size!==p.officeSeen.length||p.officeSeen.some(id=>!['casefile','shorts','resonance'].includes(id)))bad('사무소 변화');const b=expectedBalances(s);if(s.echo.credits!==b.credits||s.echo.points!==b.points)bad('잔액');return s;}
 const old=M.validate;M.validate=function(s){old(s);return validate(s);};
 root.PROGRESSION={tracks,node,ensure,hasNode,setFocus,buyNode,hasFeature,award,expectedBalances,officeLevel,officeMilestones,mainEvaluation,letterEvaluation,shortEvaluation,evaluations,fieldSummary,dialogueSummary,recordSummary,validate,rewards:REWARDS};
})(typeof window!=='undefined'?window:globalThis);
