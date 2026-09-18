/* 0.71–0.79 — Meta progression and archive. No answers are purchased. */
(function(root){'use strict';
 const M=root.MODEL,P=root.PROGRESSION,E=root.ECHO,EV=root.ECHO_VIEW,J=root.JOSEON,A=root.ACADEMY,R39=root.RELEASE039;
 if(!M||!P||!E||!EV||!J||!A)return;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const DATA={
  methods:{
   time_axis:{id:'time_axis',name:'시간의 종류',case:'마지막 상영',question:'이 시각은 사건 시각인가, 기록 생성 시각인가, 예약된 실행 시각인가?',deep:'표시된 시각을 곧바로 사건 시각으로 읽지 않고 무엇의 시각인지 먼저 구분한다.'},
   source_independence:{id:'source_independence',name:'출처의 독립성',case:'두 번 기록된 죽음',question:'여러 기록은 정말 서로 독립적으로 확인된 것인가?',deep:'같은 문장이 여러 번 나타나도 하나의 원문에서 파생됐는지 먼저 확인한다.'},
   observation_scope:{id:'observation_scope',name:'관측 범위',case:'규격 안의 사고',question:'이 사람·센서·시스템은 정확히 무엇을 관측하고 무엇은 관측하지 못하는가?',deep:'정확한 관측이라도 관측 범위를 넘어선 결론까지 보증하지 않는다고 전제한다.'}
  },
  reports:{
   case01:{title:'마지막 상영',learned:'시간 기록을 사건 그 자체로 읽지 않는다.',cards:[
    {id:'c1_time',title:'서로 다른 시각을 분리한다',text:'20:57의 실제 응답과 21:00의 예약 방송을 같은 사건 시각으로 합치지 않는다.'},
    {id:'c1_sources',title:'원자료를 연결한다',text:'통화·영상·정산·확인서가 각각 무엇을 직접 확인하는지 맞춘다.'},
    {id:'c1_act',title:'확인된 행위를 적는다',text:'서도윤 사건에서 입증된 공격·서류 회수와 별개 비위를 나누어 기록한다.'},
    {id:'c1_limit',title:'별개의 잘못과 한계를 남긴다',text:'채무·렌즈 바꿔치기 같은 사실을 살인의 단일 원인으로 억지로 묶지 않는다.'}
   ],order:['c1_time','c1_sources','c1_act','c1_limit']},
   case02:{title:'두 번 기록된 죽음',learned:'기록 수보다 기록 계보를 먼저 본다.',cards:[
    {id:'c2_object',title:'소유와 현장 존재를 분리한다',text:'위탁물의 주인이라는 사실과 그 사람이 사건 밤 물건을 들고 왔다는 주장을 구분한다.'},
    {id:'c2_lineage',title:'진술과 검험의 계보를 추적한다',text:'초검·복검·재공초가 독립 확인인지 한 전제의 반복인지 확인한다.'},
    {id:'c2_gap',title:'야간 이동과 문서 삭제를 연결한다',text:'경첨이 보증하는 구간과 백도겸에게 남은 이동 공백, 차용문기 흔적을 맞춘다.'},
    {id:'c2_limit',title:'입증 범위를 넘지 않는다',text:'백도겸 개입은 강하게 설명되지만 계획살인 여부와 정확한 몸싸움 동작은 단정하지 않는다.'}
   ],order:['c2_object','c2_lineage','c2_gap','c2_limit']},
   case03:{title:'규격 안의 사고',learned:'정확한 기록도 기준과 관측 범위를 넘겨 읽으면 위험하다.',cards:[
    {id:'c3_trigger',title:'방아쇠를 적는다',text:'14:23 임태윤이 압력편향을 사용했다는 사실을 지우지 않는다.'},
    {id:'c3_condition',title:'위험 조건을 분리한다',text:'개인 승인 P-6과 세션 P-8의 불일치가 차단 기준을 바꿨음을 적는다.'},
    {id:'c3_layers',title:'직접 행위와 관리 조건을 나눈다',text:'문지혁의 P-8 설정과 공용 토큰·약한 이중 승인·분리된 화면을 별개 층으로 기록한다.'},
    {id:'c3_limit',title:'의도와 동의의 한계를 남긴다',text:'무승인 설정은 확인되지만 고의적 위해와 태윤의 완전한 위험 인지는 확정하지 않는다.'}
   ],order:['c3_trigger','c3_condition','c3_layers','c3_limit']}
  },
  main3:{
   title:'세 번째 확인 · 사본의 범위',
   intro:['아카데미 사건을 마친 뒤 정해온은 두 번째 봉투의 증인 진술 복사본을 다시 꺼냈다.','두 장의 아래 여백에는 이전에는 대수롭지 않게 넘긴 같은 분류 표기가 있었다. “사본철 B-14 · 정리본”. 이것은 두 증인이 같은 말을 했다는 증거가 아니라, 지금 손에 있는 두 장이 같은 정리 단계에서 복사·편철됐다는 사실만 말한다.','원본 채록지나 음성이 없으므로 과거 사건의 결론은 아직 뒤집을 수 없다. 이제 물어야 할 것은 두 증인의 기억이 아니라 이 두 정리본이 어떤 원자료에서 만들어졌는가다.'],
   options:[
    {id:'collusion',text:'같은 오기까지 있으므로 두 증인이 미리 말을 맞췄다고 결론낸다.',ok:false,feedback:'같은 문장은 사본 단계에서 생겼을 수도 있다. 증인끼리의 공모를 직접 확인하는 자료는 없다.'},
    {id:'originals_same',text:'두 정리본이 같으므로 원래 두 진술도 완전히 같았다고 확정한다.',ok:false,feedback:'정리본의 동일성은 원본 채록의 독립성을 보증하지 않는다. 오히려 원자료를 찾아야 한다.'},
    {id:'source_layer',text:'현재 두 장은 같은 정리 단계의 사본일 수 있다. 원본 채록·음성·작성 순서를 찾아야 두 증언의 독립성을 판단할 수 있다고 기록한다.',ok:true,feedback:'사본의 공통 표기는 출처 추적의 시작점이지 과거 판결을 뒤집는 증거가 아니다. 다음 목표는 원자료의 존재와 작성 계보다.'}
   ]
  },
  hidden:{
   id:'quote_review',title:'세 번 인용된 한 문장',client:'한소미 · 독립출판 편집자',reward:{credits:30000,points:1},
   intro:['작은 회고집의 사실 검토를 맡은 편집자 한소미가 오래된 문의를 보냈다. 사건 기록에 ‘확인한 것과 확인하지 못한 것’을 나눠 적는 사무소의 공개 안내를 보고 정해온에게 보낸 메일이었지만, 제목이 “자료 검토 문의”라 일반 자료함으로 자동 분류되어 눈에 띄지 않았다.','한 사진가의 문장 하나가 2017년 인터뷰, 2019년 전시 소개, 2021년 보도자료에 세 번 등장한다. 편집자는 회고집에 “생전 여러 인터뷰에서 반복해서 말했다”라고 쓰기 전에 세 문장이 실제로 서로 다른 발언인지 확인하고 싶어 한다.','범죄도 실종도 아니다. 세 번 보이는 문장이 세 번 말해진 문장인지 확인하는 출처 검토다.'],
   records:[
    {id:'r2017',title:'2017년 녹취 인터뷰',type:'원본 녹취',body:'2017년 6월 12일 녹음 인터뷰 전사. 질문 18번 답변에 “사진은 답보다 기다리는 시간을 남긴다”라는 문장이 직접 기록되어 있다. 원본 음성 파일 번호도 함께 적혀 있다.',facts:['직접 녹취된 원발언','원본 음성 파일 번호 존재','문장 1회 확인']},
    {id:'r2019',title:'2019년 전시 소개문',type:'2차 글',body:'전시 소개문은 같은 문장을 따옴표로 싣고 각주에 “2017년 인터뷰 녹취, 자료번호 I-17-0612”라고 적었다. 별도의 2019년 인터뷰를 했다는 표시는 없다.',facts:['2017 녹취 자료번호를 각주로 인용','2019년 별도 인터뷰 표기 없음']},
    {id:'r2021',title:'2021년 보도자료',type:'보도자료',body:'보도자료의 인물 소개에 같은 문장이 다시 들어 있다. 내부 메타데이터에는 “인용문 verified”가 표시되어 있고 출처 칸에는 “2019 전시 프로필”이 적혀 있다.',facts:['같은 문장 반복','verified 표시','출처는 2019 전시 프로필']},
    {id:'source_sheet',title:'편집부 출처 확인표',type:'출처 시트',body:'편집부 지침에서 verified는 “출처 칸·자료번호·인명·날짜의 형식 확인 완료”를 뜻한다. 인용문이 독립된 별도 인터뷰에서 다시 발언되었는지를 확인했다는 상태는 아니다.',facts:['verified의 범위는 서지·메타데이터 완결성','독립 발언 여부 검증과는 별개']}
   ],
   issues:[
    {id:'origin',question:'같은 문장이 세 문서에 있다는 사실은 무엇을 말하는가?',need:['r2017','r2019','r2021'],correct:'derived',options:[{id:'three',text:'세 해에 각각 같은 말을 다시 했다는 뜻이다.'},{id:'derived',text:'직접 확인되는 원발언은 2017년이고, 2019·2021 문서는 앞선 출처를 재인용한 계보가 보인다.'},{id:'fake',text:'세 문장이 같으므로 모두 편집부가 만들어 낸 가짜다.'}],result:'세 번 나타난 문장은 세 번의 독립 인터뷰가 아니다. 현재 자료에서는 2017년 직접 발언이 뒤 문서로 인용된 계보가 확인된다.'},
    {id:'verified',question:'2021년의 “verified” 표시는 무엇까지 보증하는가?',need:['r2021','source_sheet'],correct:'metadata',options:[{id:'truth',text:'사진가가 2021년에도 같은 말을 직접 했다는 사실.'},{id:'metadata',text:'출처 칸과 자료번호 등 편집 메타데이터가 채워졌다는 사실.'},{id:'none',text:'아무 의미 없는 장식 표시.'}],result:'verified는 출처 표기의 형식 확인이다. 문장의 독립적 재발언을 검증했다는 뜻으로 넓혀 읽을 수 없다.'},
    {id:'wording',question:'회고집에는 이 문장을 어떻게 적는 것이 가장 책임 있는가?',need:['r2017','r2019','r2021','source_sheet'],correct:'scoped',options:[{id:'repeated',text:'“그는 생전 여러 인터뷰에서 반복해서 이 말을 했다.”'},{id:'uncertain',text:'“그가 실제로 이 말을 했는지는 알 수 없다.”'},{id:'scoped',text:'“이 문장은 2017년 녹취 인터뷰에서 직접 확인되며, 2019년과 2021년 자료는 그 발언을 재인용했다.”'}],result:'원발언과 재인용을 분리하면 문장을 지우지 않으면서도 존재 횟수를 발언 횟수로 과장하지 않는다.'}
   ],
   report:['2017년 녹취 인터뷰에서 해당 문장의 직접 발언을 확인했다.','2019년 전시 소개문은 2017년 녹취를 명시적으로 인용한다.','2021년 보도자료는 2019년 전시 프로필을 출처로 삼는다. “verified” 표시는 서지 메타데이터 검토 상태이며 독립 재발언을 뜻하지 않는다.','따라서 회고집에는 2017년 직접 발언과 이후 재인용의 계보를 구분해 적는다.']
  }
 };
 function blankHidden(){return {accepted:false,phase:'brief',read:[],doc:null,solved:[],issue:null,selected:null,proofs:[],feedback:null,complete:false,paid:false};}
 function blank(){return {version:1,archiveTab:'cases',resonancePins:[],reportOrders:{case01:[],case02:[],case03:[]},reportVerified:{case01:false,case02:false,case03:false},reportFeedback:{case01:null,case02:null,case03:null},main3Choice:null,main3Solved:false,main3Feedback:null,hidden:blankHidden()};}
 function ensure(s){if(!s?.echo)return null;let z=s.echo.meta079;if(!z||typeof z!=='object'||Array.isArray(z))z=s.echo.meta079=blank();if(z.version!==1)z.version=1;if(!['cases','reports','methods','personal','hidden'].includes(z.archiveTab))z.archiveTab='cases';if(!Array.isArray(z.resonancePins))z.resonancePins=[];for(const id of ['case01','case02','case03']){if(!Array.isArray(z.reportOrders?.[id])){z.reportOrders=z.reportOrders||{};z.reportOrders[id]=[];}if(typeof z.reportVerified?.[id]!=='boolean'){z.reportVerified=z.reportVerified||{};z.reportVerified[id]=false;}if(!(id in (z.reportFeedback||{}))){z.reportFeedback=z.reportFeedback||{};z.reportFeedback[id]=null;}}
  if(!z.hidden||typeof z.hidden!=='object'||Array.isArray(z.hidden))z.hidden=blankHidden();for(const [k,v] of Object.entries(blankHidden()))if(!(k in z.hidden))z.hidden[k]=Array.isArray(v)?[]:v;return z;}
 const caseComplete=(s,id)=>id==='case01'?!!s?.completed:id==='case02'?!!J.state(s)?.complete:id==='case03'?!!A.state(s)?.complete:false;
 function unlockedMethods(s){return Object.keys(DATA.methods).filter(id=>id==='time_axis'?caseComplete(s,'case01'):id==='source_independence'?caseComplete(s,'case02'):caseComplete(s,'case03'));}
 function pin(s,id){const z=ensure(s),un=unlockedMethods(s);if(!un.includes(id))throw Error('아직 배운 조사 질문이 아닙니다.');const n=z.resonancePins.indexOf(id);if(n>=0){z.resonancePins.splice(n,1);return false;}if(z.resonancePins.length>=2)throw Error('심층 공명 준비는 두 가지까지만 고정할 수 있습니다.');z.resonancePins.push(id);return true;}
 function reportPick(s,caseId,cardId){const z=ensure(s),r=DATA.reports[caseId];if(!r||!caseComplete(s,caseId))throw Error('아직 재구성할 수 없는 보고서입니다.');if(!r.cards.some(c=>c.id===cardId))throw Error('없는 보고 카드입니다.');if(z.reportOrders[caseId].includes(cardId))return;z.reportOrders[caseId].push(cardId);z.reportFeedback[caseId]=null;}
 function reportReset(s,caseId){const z=ensure(s);if(!DATA.reports[caseId])return;z.reportOrders[caseId]=[];z.reportVerified[caseId]=false;z.reportFeedback[caseId]=null;}
 function reportSubmit(s,caseId){const z=ensure(s),r=DATA.reports[caseId],o=z.reportOrders[caseId];if(!r||!caseComplete(s,caseId))throw Error('아직 재구성할 수 없는 보고서입니다.');const ok=o.length===r.order.length&&o.every((x,i)=>x===r.order[i]);z.reportVerified[caseId]=ok;z.reportFeedback[caseId]=ok?'사실 → 연결 → 결론 → 한계의 순서가 복원됐다. 사건의 정답보다 보고서가 어디까지 말할 수 있는지를 다시 확인했다.':'내용 자체가 틀린 것은 아닐 수 있다. 무엇을 먼저 확인해야 다음 결론이 과장되지 않는지 순서를 다시 생각해 보자.';return ok;}
 const allReports=s=>Object.values(ensure(s).reportVerified).every(Boolean);
 function main3Available(s){return caseComplete(s,'case03')&&!!s.echo?.read?.includes('meta056/7');}
 function main3Choose(s,id){const z=ensure(s);if(!main3Available(s))throw Error('아직 이 개인 기록을 다시 검토할 수 없습니다.');if(!DATA.main3.options.some(o=>o.id===id))return;z.main3Choice=id;z.main3Feedback=null;}
 function main3Submit(s){const z=ensure(s),o=DATA.main3.options.find(x=>x.id===z.main3Choice);if(!o){z.main3Feedback={ok:false,text:'판단을 하나 고르세요.'};return false;}z.main3Solved=!!o.ok;z.main3Feedback={ok:!!o.ok,text:o.feedback};return !!o.ok;}
 function hiddenUnlocked(s){const z=ensure(s);return z.main3Solved&&allReports(s);}
 function hiddenIssue(z){return DATA.hidden.issues.find(i=>i.id===z.hidden.issue)||DATA.hidden.issues.find(i=>!z.hidden.solved.includes(i.id))||null;}
 function hiddenAccept(s){const z=ensure(s);if(!hiddenUnlocked(s))throw Error('아직 이 문의를 발견하지 못했습니다.');z.hidden.accepted=true;z.hidden.phase='records';return true;}
 function hiddenRead(s,id){const z=ensure(s),r=DATA.hidden.records.find(x=>x.id===id);if(!z.hidden.accepted||!r)throw Error('열 수 없는 자료입니다.');if(!z.hidden.read.includes(id))z.hidden.read.push(id);z.hidden.doc=id;return r;}
 function hiddenStart(s){const z=ensure(s);if(!z.hidden.accepted)throw Error('먼저 문의를 확인하세요.');z.hidden.phase='deduction';z.hidden.issue=(DATA.hidden.issues.find(i=>!z.hidden.solved.includes(i.id))||{}).id||null;z.hidden.selected=null;z.hidden.proofs=[];z.hidden.feedback=null;}
 function hiddenAct(s,kind,value){const z=ensure(s),i=hiddenIssue(z);if(kind==='claim'){if(i?.options.some(o=>o.id===value))z.hidden.selected=value;z.hidden.feedback=null;return;}if(kind==='proof'){if(!z.hidden.read.includes(value))return;const n=z.hidden.proofs.indexOf(value);if(n>=0)z.hidden.proofs.splice(n,1);else z.hidden.proofs.push(value);z.hidden.feedback=null;return;}if(kind==='leave'){z.hidden.phase='records';z.hidden.feedback=null;return;}if(kind==='next'){z.hidden.issue=(DATA.hidden.issues.find(x=>!z.hidden.solved.includes(x.id))||{}).id||null;z.hidden.selected=null;z.hidden.proofs=[];z.hidden.feedback=null;return;}}
 function hiddenSubmit(s){const z=ensure(s),i=hiddenIssue(z);if(!i)return false;if(!z.hidden.selected||!z.hidden.proofs.length){z.hidden.feedback={code:'empty',text:'판단 하나와 근거 자료를 함께 고르세요.'};return false;}if((i.need||[]).some(id=>!z.hidden.read.includes(id))){z.hidden.feedback={code:'research',text:'이 질문과 직접 연결되는 원자료를 더 읽을 수 있습니다.'};return false;}if(z.hidden.selected!==i.correct){z.hidden.feedback={code:'wrong',text:'문장의 존재 횟수와 발언 횟수, 또는 검증 표시가 확인한 범위를 다시 분리해 보자.'};return false;}if((i.need||[]).some(id=>!z.hidden.proofs.includes(id))){z.hidden.feedback={code:'partial',text:'판단은 맞지만 이 결론을 직접 보여 주는 자료가 근거에서 빠져 있습니다.'};return false;}if(!z.hidden.solved.includes(i.id))z.hidden.solved.push(i.id);z.hidden.feedback={code:'correct',text:i.result};return true;}
 function hiddenComplete(s){const z=ensure(s);if(!DATA.hidden.issues.every(i=>z.hidden.solved.includes(i.id)))throw Error('남은 질문을 먼저 정리하세요.');z.hidden.complete=true;z.hidden.phase='complete';if(!z.hidden.paid){P.award(s,'quote_review');z.hidden.paid=true;}return true;}
 function setTab(s,id){const z=ensure(s);if(!['cases','reports','methods','personal','hidden'].includes(id))return;if(id==='hidden'&&!hiddenUnlocked(s))return;z.archiveTab=id;}
 function tier2Summary(s,id){const D=root.STORY||{};if(id==='field_route'){const names=(s.visited||[]).map(k=>D.places?.[k]?.name).filter(Boolean);return names.length?'확인 동선 · '+names.join(' → '):'아직 직접 확인한 장소가 없습니다.';}if(id==='dialogue_context'){const counts={};for(const tid of s.topicsRead||[]){const t=D.topics?.find(x=>x.id===tid);if(!t?.npc)continue;const n=D.people?.[t.npc]?.name||t.npc;counts[n]=(counts[n]||0)+1;}const rows=Object.entries(counts);return rows.length?'면담 맥락 · '+rows.map(([n,c])=>`${n} ${c}건`).join(' · '):'아직 읽은 면담 기록이 없습니다.';}if(id==='record_provenance'){const counts={};for(const eid of s.evidence||[]){const e=D.evidence?.[eid];const k=e?.type||'기타';counts[k]=(counts[k]||0)+1;}const rows=Object.entries(counts);return rows.length?'확보 자료 층 · '+rows.map(([n,c])=>`${n} ${c}건`).join(' · '):'아직 확보한 원자료가 없습니다.';}return '';}
 P.tier2Summary=tier2Summary;
 function validate(s){if(!s?.echo)return s;const z=ensure(s),bad=m=>{throw Error('0.79 메타 기록이 손상되었습니다. '+m);};const un=unlockedMethods(s);if(new Set(z.resonancePins).size!==z.resonancePins.length||z.resonancePins.length>2||z.resonancePins.some(id=>!un.includes(id)))bad('심층 공명');for(const [cid,r] of Object.entries(DATA.reports)){const o=z.reportOrders[cid];if(new Set(o).size!==o.length||o.some(id=>!r.cards.some(c=>c.id===id)))bad('보고서 순서');const exact=o.length===r.order.length&&o.every((x,i)=>x===r.order[i]);if(z.reportVerified[cid]&&!exact)bad('보고서 검증');if(z.reportVerified[cid]&&!caseComplete(s,cid))bad('미종결 보고서');}
  if(z.main3Choice!==null&&!DATA.main3.options.some(o=>o.id===z.main3Choice))bad('개인 기록 선택');if(z.main3Solved&&z.main3Choice!=='source_layer')bad('개인 기록 결론');const h=z.hidden;if(!Array.isArray(h.read)||new Set(h.read).size!==h.read.length||h.read.some(id=>!DATA.hidden.records.some(r=>r.id===id)))bad('숨은 의뢰 자료');if(!Array.isArray(h.solved)||new Set(h.solved).size!==h.solved.length||h.solved.some(id=>!DATA.hidden.issues.some(i=>i.id===id)))bad('숨은 의뢰 논점');if(h.accepted&&!hiddenUnlocked(s))bad('숨은 의뢰 해금');if(h.complete&&(!h.accepted||!h.paid||!DATA.hidden.issues.every(i=>h.solved.includes(i.id))))bad('숨은 의뢰 완료');const paid=P.ensure(s)?.rewardLedger?.some(r=>r.id==='quote_review');if(!!paid!==!!h.paid)bad('숨은 의뢰 보상');return s;}
 root.META079={data:DATA,ensure,caseComplete,unlockedMethods,pin,reportPick,reportReset,reportSubmit,allReports,main3Available,main3Choose,main3Submit,hiddenUnlocked,hiddenIssue,hiddenAccept,hiddenRead,hiddenStart,hiddenAct,hiddenSubmit,hiddenComplete,setTab,validate};
 P.rewards.quote_review={id:'quote_review',title:DATA.hidden.title,credits:DATA.hidden.reward.credits,points:DATA.hidden.reward.points,kind:'숨겨진 의뢰'};
 const oldValidate=M.validate;M.validate=function(s){if(s?.echo)ensure(s);oldValidate(s);return validate(s);};
 const oldAttach=E.attach;E.attach=function(s,legacy){const r=oldAttach(s,legacy);ensure(s);return r;};
 if(root.STORY)root.STORY.release='0.79.0';if(root.ECHO_DATA)root.ECHO_DATA.release='0.79.0';if(root.CONTENT015_DATA)root.CONTENT015_DATA.release='0.79.0';
})(typeof window!=='undefined'?window:globalThis);
