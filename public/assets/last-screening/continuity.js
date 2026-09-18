/* 0.51–0.59: series cohesion, optional continuity and rhythm cleanup. */
(function(root){'use strict';
 const E=root.ECHO,EV=root.ECHO_VIEW,J=root.JOSEON,JV=root.JOSEON_VIEW,S=root.SHORT_CASES,P=root.PROGRESSION,R39=root.RELEASE039,D=root.STORY,ED=root.ECHO_DATA;
 if(!E||!EV||!J||!JV||!S||!P||!D||!ED)return;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const readNode=(g,id)=>R39?.hasReadNode?.(g,id)||false;
 D.release='0.59.0';ED.release='0.59.0';root.STORY.release='0.59.0';if(root.CONTENT015_DATA)root.CONTENT015_DATA.release='0.59.0';

 // 0.55 — a third short commission with a different reasoning skill: absence of
 // recorded audio is not proof of editing, nor proof of what was said off-mic.
 root.SHORT_CASES_DATA.cases.dead_air={id:'dead_air',title:'녹음되지 않은 4분',client:'박서진 · 지역 라디오 제작자',fee:60000,points:1,summary:'공개를 앞둔 인터뷰 원본의 4분 12초 무음이 편집인지 장비 입력 손실인지 확인하는 의뢰.',intro:[
  '지역 라디오 제작자 박서진은 공개를 앞둔 옛 인터뷰 원본에서 4분 12초 동안 목소리가 완전히 사라지는 구간을 발견했다.',
  '그 공백 직후 인터뷰이가 민감한 질문에 답했기 때문에, 제작진 안에서는 누군가 앞부분을 의도적으로 삭제했다는 말이 돌기 시작했다. 방송 예고문에도 ‘삭제된 4분’이라는 표현이 들어갈 뻔했다.',
  '인터뷰이 측은 공개 전에 그 표현의 근거를 확인해 달라고 요청했다. 박서진도 다음 날 아카이브 공개 전에 문구를 고칠지 결정해야 한다. 확인할 것은 “무음이 수상한가”가 아니라 원본 파일이 실제로 잘렸는지, 당시 장비에는 무슨 일이 있었는지, 그리고 녹음되지 않은 동안의 대화를 어디까지 말할 수 있는지다.'
 ],records:[
  {id:'wave',title:'원본 WAV 속성·파형 기록',type:'원본 파일',facts:['31분 48초 단일 파일','16:42:11~16:46:23 입력 신호 0에 가까움','파일 길이와 샘플 타임라인은 끊기지 않음'],body:'보존된 원본 WAV는 31분 48초짜리 하나의 연속 파일이다. 문제 구간에서도 파일의 샘플 타임라인은 계속 이어지지만 외부 입력 신호만 거의 0으로 내려간다. 후반을 잘라 다시 붙인 흔적이나 별도 파일 결합 표시는 확인되지 않는다.'},
  {id:'recorder',title:'휴대 녹음기 이벤트 로그',type:'장비 로그',facts:['16:42:09 외부 입력 신호 상실','기록 동작은 중단되지 않음','16:46:20 외부 입력 복귀'],body:'녹음기는 문제 구간 내내 REC 상태를 유지했다. 16시 42분 09초 외부 입력 신호가 사라졌고 16시 46분 20초 다시 잡혔다는 이벤트가 남아 있다. 파일 자체의 녹화/녹음 정지는 없다.'},
  {id:'techcall',title:'조정실 통화·출입 메모',type:'업무 기록',facts:['16:42 조정실에서 스튜디오로 전화','“핀마이크 수신 안 됨” 기재','16:44 기술 담당자가 스튜디오에 들어감'],body:'조정실 메모에는 16시 42분 “핀마이크 수신 안 됨”이라고 적혀 있다. 기술 담당자는 곧바로 스튜디오로 전화한 뒤 16시 44분 안으로 들어가 송신기와 배터리를 확인했다.'},
  {id:'transcript',title:'현장 속기 초안',type:'속기 초안',facts:['공백 위치에 “[마이크 점검 — 기록 없음]” 표기','16:46 이후 질의응답 재개','공백 동안의 실제 발언은 적혀 있지 않음'],body:'당시 보조 작가의 속기 초안은 같은 위치에 “[마이크 점검 — 기록 없음]”이라고 남겼다. 16시 46분 이후 대화 내용은 다시 이어지지만, 그 전 4분여 동안 누가 무슨 말을 했는지는 기록돼 있지 않다.'}
 ],issues:[
  {id:'edit',question:'4분 12초의 무음은 누군가 원본에서 대화를 삭제한 흔적일까?',lead:'파일의 연속성과 장비가 기록한 입력 상태를 함께 본다.',need:['wave','recorder'],correct:'loss',options:[{id:'cut',text:'민감한 답변 앞이므로 누군가 그 부분만 삭제했다.'},{id:'loss',text:'원본 파일은 이어져 있고 외부 입력만 사라졌다. 현재 자료는 편집보다 입력 신호 상실을 지지한다.'},{id:'unknown',text:'무음은 원인이 무엇이든 분석할 수 없다.'}],wrong:'무음의 존재보다 파일 시간이 실제로 끊겼는지, REC 상태가 멈췄는지 먼저 보자.',result:'원본 파일과 녹음기 로그는 문제 구간 동안 기록 동작이 계속됐고 외부 입력만 사라졌음을 함께 보여 준다. 의도적 삭제보다 현장 입력 손실과 맞는다.',hints:['원본 파일의 전체 길이와 샘플 타임라인이 끊겼는지 본다.','녹음기 이벤트 로그에서 REC가 멈췄는지 확인한다.','파일은 계속 기록됐는데 입력만 사라졌다면 “잘라냈다”와는 다른 현상이다.']},
  {id:'cause',question:'입력 신호 상실은 현장 기록과 어떻게 연결되는가?',lead:'장비 로그만으로 사람의 행동을 상상하지 말고 같은 시각의 업무 기록을 맞춘다.',need:['recorder','techcall'],correct:'equipment',options:[{id:'equipment',text:'같은 시각 조정실이 수신 불량을 확인하고 기술 담당자가 들어갔다. 장비 문제 대응 기록과 맞는다.'},{id:'interviewee',text:'인터뷰이가 일부러 마이크를 껐다고 볼 수 있다.'},{id:'producer',text:'제작자가 녹음 버튼을 눌러 중지했다.'}],wrong:'누가 일부러 껐다고 추측하기 전에, 같은 시각에 기술 담당자가 무엇을 기록했는지 보자.',result:'입력 신호가 사라진 직후 조정실이 핀마이크 수신 불량을 확인했고 기술 담당자가 스튜디오에 들어갔다. 현재 자료에서는 장비 문제 대응이 공백의 가장 직접적인 설명이다.',hints:['16시 42분 조정실 메모를 확인한다.','기술 담당자의 출입 시각을 장비 로그와 겹쳐 본다.','동기보다 먼저 같은 시각의 물리적 문제 기록을 연결한다.']},
  {id:'missing',question:'그 4분 동안 실제로 어떤 말이 오갔는지 복원할 수 있을까?',lead:'“녹음이 없었다”와 “아무 말도 없었다”를 구분한다.',need:['wave','techcall','transcript'],correct:'limit',options:[{id:'silence',text:'녹음에 소리가 없으므로 방 안에서도 아무도 말하지 않았다.'},{id:'prompt',text:'공백 직후의 답변을 보면 그 전에 같은 민감한 질문을 했다고 확정할 수 있다.'},{id:'limit',text:'장비가 소리를 받지 못한 동안 실제 발언은 남아 있지 않다. 대화가 있었는지, 어떤 질문이 있었는지는 현재 기록으로 복원할 수 없다.'}],wrong:'공백 직후의 내용으로 빈 구간을 채워 넣지 말자. 현장 속기에는 그 구간을 어떻게 적었는지 확인한다.',result:'무음은 “그 방에서 아무도 말하지 않았다”는 증거가 아니다. 반대로 특정 질문이 있었다고 복원할 수도 없다. 현존 기록으로 확정할 수 있는 것은 장비 입력이 사라졌다는 사실까지다.',hints:['현장 속기 초안이 공백 동안 발언을 받아 적었는지 본다.','녹음 장치의 입력 손실과 방 안의 실제 소리는 같은 것이 아니다.','기록되지 않은 내용을 뒤의 답변만 보고 채워 넣지 않는다.']}
 ],report:['문제의 4분 12초 동안 원본 파일은 끊기지 않았고, 외부 입력 신호만 사라졌다.','같은 시각 조정실은 핀마이크 수신 불량을 기록했고 기술 담당자가 스튜디오에 들어가 장비를 확인했다.','현재 자료는 의도적인 오디오 삭제보다 현장 입력 손실을 지지한다.','그 시간 동안 실제로 어떤 말이 오갔는지는 기록되어 있지 않으므로, 민감한 답변의 사전 질문을 추정으로 복원하지 않는다.']};
 P.rewards.dead_air={id:'dead_air',title:'녹음되지 않은 4분',credits:60000,points:1,kind:'짧은 의뢰'};
 const oldEvals=P.evaluations;P.evaluations=function(s){const list=oldEvals(s),e=P.shortEvaluation(s,'dead_air');return e&& !list.some(x=>x.title===e.title)?[...list,e]:list;};

 // 0.53 — Episode 2 enters through layered records rather than a film-like scene.
 const oldAccept=J.accept;J.accept=function(s){const r=oldAccept(s);const q=J.state(s);q.entryPending=true;return r;};
 const oldTab=J.tab;J.tab=function(s,id){const q=J.state(s);q.entryPending=false;q.recovery=false;return oldTab(s,id);};
 const oldSubmit=J.submit;J.submit=function(s){const r=oldSubmit(s),q=J.state(s);if(r?.code==='return')q.recovery=true;return r;};

 // 0.56–0.58 — main thread #2 and returning NPC conversations. These nodes
 // carry consequences and questions, never new mandatory evidence.
 D.names.seorin='남서린';D.names.seojin='박서진';
 ED.nodes.meta056={id:'meta056',title:'두 번째 봉투 · 같은 문장',bg:'echo_desk',lines:[
  {who:'n',text:'두 번 기록된 죽음의 보고서를 덮은 다음 날, 첫 번째 봉투를 넣어 둔 개인 사건함 위에 또 다른 서류봉투가 놓여 있었다.'},
  {who:'n',text:'이번에도 발신인은 없었다. 안에는 형사 시절 종결 사건의 증인 진술 두 장이 복사되어 있었다.'},
  {who:'n',text:'서로 다른 날, 서로 다른 장소에서 받은 진술이라고 적혀 있는데 이상하게도 세 문장이 조사 순서까지 똑같았다. 한 장에만 있던 맞춤법 오류까지 같았다.'},
  {who:'haeon',text:'그때는 둘이 같은 장면을 봤다고 생각했다.'},
  {who:'n',text:'하지만 조선 기록을 보고 돌아온 지금은 질문이 달랐다. 두 사람이 같은 말을 한 걸까, 아니면 하나의 정리 문장이 두 기록으로 갈라진 걸까.'},
  {who:'n',text:'복사본 아래에는 원본 음성의 존재 여부도, 누가 먼저 작성했는지도 적혀 있지 않았다. 이것만으로 과거 사건의 결론을 뒤집을 수는 없다.'},
  {who:'haeon',text:'다음에 찾아야 할 건 범인이 아니라 이 두 문장의 출처다.'},
  {who:'n',text:'두 번째 봉투를 첫 번째 봉투 옆에 넣었다. 누가 보내는지는 여전히 알 수 없다.'}
 ],effect:'hub'};
 ED.nodes.office_seoa_057={id:'office_seoa_057',title:'윤서아 · 편집본을 들고',bg:'echo_office_cg',actor:'seoa',lines:[
  {who:'n',text:'윤서아가 사무소에 다시 찾아왔다. 이번에는 의뢰 파일이 아니라 새로 편집한 영상의 확인본을 들고 있었다.'},
  {who:'seoa',text:'사건을 전부 설명하는 자막은 뺐어요. 대신 그 장면을 누가 언제 찍었는지, 확인할 수 없는 건 뭔지만 붙였어요.'},
  {who:'haeon',text:'그 정도면 영상이 증언 대신 결론을 말하는 일은 없겠네요.'},
  {who:'seoa',text:'처음엔 답을 더 많이 적어야 친절한 줄 알았는데, 지금은 어디까지 아는지도 같이 보여 주는 편이 낫다는 생각이 들어요.'},
  {who:'n',text:'윤서아는 커피를 반쯤 남긴 채 돌아갔다. 첫 의뢰는 끝났지만 그 뒤의 사람들은 계속 자기 방식으로 정리하고 있었다.'}
 ],effect:'hub'};
 ED.nodes.office_seorin_057={id:'office_seorin_057',title:'남서린 · 전시 설명문',bg:'echo_desk',voice:'남서린 · 전화',lines:[
  {who:'n',text:'남서린에게서 전시 설명문 초안이 도착했다. 통화 화면 옆으로 짧은 문장이 함께 떠 있었다.'},
  {who:'seorin',text:'“당시 한채령이 범인으로 지목되었으나, 관련 기록의 의존 관계 때문에 그 결론에는 재검토가 필요하다.” 이렇게 적었습니다.'},
  {who:'seorin',text:'남지헌의 여백 메모도 같이 공개하려고요. 선조가 완전히 옳았다고 꾸미는 것보다, 어디서 멈췄는지 보여 주는 게 기록에 맞겠죠.'},
  {who:'haeon',text:'확인한 것과 남은 한계를 같은 자리에서 보여 주면 됩니다.'},
  {who:'n',text:'통화가 끝난 뒤 전시 초안을 조선 사건 파일의 후속 기록으로 보관했다.'}
 ],effect:'hub'};
 ED.nodes.office_seojin_058={id:'office_seojin_058',title:'박서진 · 방송 전날',bg:'echo_desk',voice:'박서진 · 전화',lines:[
  {who:'n',text:'〈녹음되지 않은 4분〉을 마친 뒤 박서진이 방송 전날 다시 전화를 걸었다.'},
  {who:'seojin',text:'공백을 “삭제된 4분”이라고 예고하려던 문구는 뺐습니다. 장비 문제로 기록되지 않은 구간이라고만 설명하려고요.'},
  {who:'seojin',text:'무슨 말을 했는지 모르는 건 답답하지만, 모르는 걸 자극적인 이야기로 채우는 것보단 낫겠죠.'},
  {who:'haeon',text:'그 공백까지 기록의 일부입니다. 없는 음성을 대신 만들어낼 필요는 없습니다.'},
  {who:'n',text:'전화를 끊고 단편 의뢰 파일에 방송 전 확인이라는 메모를 덧붙였다.'}
 ],effect:'hub'};

 const meta056Available=g=>!!g?.completed&&!!J.state(g)?.complete&&readNode(g,'meta038');
 const officeTalks=g=>[
  {id:'office_seoa_057',name:'윤서아',case:'마지막 상영',available:!!g.completed&&!!g.echo?.reported,asset:'seoa_portrait',copy:'첫 사건 이후의 편집본과 기록 방식에 대해 이야기한다.'},
  {id:'office_seorin_057',name:'남서린',case:'두 번 기록된 죽음',available:!!J.state(g)?.complete,asset:null,copy:'전시 설명문에 당시 결론과 한계를 어떻게 함께 적을지 확인한다.'},
  {id:'office_seojin_058',name:'박서진',case:'녹음되지 않은 4분',available:!!S.state(g,'dead_air')?.complete,asset:null,copy:'공백을 자극적인 이야기로 채우지 않기로 한 방송 전 연락이다.'}
 ].map(x=>({...x,read:readNode(g,x.id)}));
 const oldInspect=E.inspect;E.inspect=function(s,id){
  if(id==='meta056'){if(!meta056Available(s))throw Error('아직 이어서 볼 개인 기록이 없습니다.');E.start(s,'meta056');return;}
  if(['office_seoa_057','office_seorin_057','office_seojin_058'].includes(id)){const t=officeTalks(s).find(x=>x.id===id);if(!t?.available)throw Error('아직 도착하지 않은 후속 대화입니다.');E.start(s,id);return;}
  return oldInspect(s,id);
 };
 const oldSummary=E.summary;E.summary=function(s){if(s?.echo?.view==='office-talks')return '사건 뒤의 사람들';return oldSummary(s);};
 const oldMusic=E.music;E.music=function(s,aux,back){if(s?.echo?.view==='office-talks')return {key:'bgm_15_memory',paused:false,reason:'office-conversations'};return oldMusic(s,aux,back);};

 // 0.53/0.54 Episode 2 presentation wrapper.
 const oldJView=JV.html;JV.html=function(ctx){const q=J.state(ctx.g),{btn,esc}=ctx;if(ctx.g.echo?.view==='joseon'&&q?.entryPending){
   const content=`<section class="joseon-entry-v059"><div class="joseon-entry-copy-v059"><span class="eyebrow">공명 진입 · 고문서 기록층</span><h2>한 장면이 아니라, 서로 다른 기록의 겹침으로 들어간다.</h2><p>모서리 극장에서는 남아 있던 공간과 영상이 한밤의 흐름을 붙잡았다. 이번 공명은 다르다. 1795년의 객주를 직접 보는 것이 아니라, 위탁책·공초·검안·복검 초안을 서로 겹쳐 같은 사건의 기록층을 만든다.</p><p>기록이 비어 있는 곳은 비어 있는 채 남고, 서로 충돌하는 문장은 어느 쪽도 자동으로 정답이 되지 않는다.</p>${btn('기록층을 연다 →','joseon-tab','data-id="overview"','primary')}</div><div class="joseon-entry-layers-v059" aria-label="겹쳐 읽을 기록"><article><span>민간 거래책</span><p>한채령의 약재 꾸러미가 언제 객주에 들어왔는지 적힌 위탁물 인계책.</p></article><article><span>공식 검험 기록</span><p>초검과 복검이 같은 죽음을 어떻게 적었는지 남은 검안·공초.</p></article><article><span>개인 초안</span><p>남지헌이 복검 문목 여백에 남긴 짧은 의심과 수정 흔적.</p></article></div></section>`;
   return `<section class="echo-shell joseon-shell v059-entry"><div class="echo-background"><div class="echo-backdrop"></div></div><header class="echo-header"><div><small>잔향 탐정 · 의뢰 02 · 기록층 진입</small><h1>${esc(J.data.title)}</h1></div><nav>${btn('저장','save-menu')}${btn('설정','settings')}${btn('사무소','echo-page','data-id="hub"')}</nav></header><div class="echo-status"><div id="notificationSlot"></div><div id="storageNotice" class="storage-notice" role="status" hidden></div></div><main id="main" class="echo-main" tabindex="-1">${content}</main><nav class="echo-nav">${btn('사무소','echo-page','data-id="hub"')}</nav></section>`;
  }
  let raw=oldJView(ctx);if(ctx.g.echo?.view==='joseon'&&q?.recovery){const panel=`<section class="joseon-recovery-v059"><span class="eyebrow">공명 정리 · 추리 보류</span><h3>같은 판단을 밀어붙이기보다 기록층으로 돌아간다.</h3><p>세 번의 제출이 맞지 않아 현재 논점을 잠시 보류했습니다. 이미 읽은 원자료와 해결한 논점은 사라지지 않습니다. 이 사건은 “실패 횟수”로 끝나지 않고, 빠진 기록이나 전제가 무엇인지 다시 확인하는 구조입니다.</p><div class="row wrap">${btn('사건 질문으로 돌아가기','joseon-tab','data-id="overview"','primary')}${btn('원자료부터 다시 보기','joseon-tab','data-id="records"','secondary')}</div></section>`;raw=raw.replace(/(<main[^>]*>)/,`$1${panel}`);}return raw;
 };

 function shell(ctx,title,content,bg='echo_office_cg',active=''){const {img,btn,esc}=ctx;const nav=`<nav class="echo-nav" aria-label="사무소 이동">${btn('사무소','echo-page','data-id="hub"',active==='hub'?'selected':'')}${btn('의뢰함','echo-page','data-id="cases"',active==='cases'?'selected':'')}${btn('사건 뒤의 사람들','echo-page','data-id="office-talks"',active==='office-talks'?'selected':'')}${btn('공명 도구','echo-page','data-id="growth"')}</nav>`;return `<section class="echo-shell echo-workspace-shell v059-shell"><div class="echo-background" aria-hidden="true">${img(bg,'echo-backdrop','')}</div><header class="echo-header"><div><small>잔향 탐정 사무소</small><h1>${esc(title)}</h1></div><nav>${btn('기록','echo-log')}${btn('저장','save-menu')}${btn('설정','settings')}${btn('메뉴','pause')}</nav></header><div class="echo-status"><div id="notificationSlot"></div><div id="storageNotice" class="storage-notice" role="status" hidden></div></div><main id="main" class="echo-main" tabindex="-1">${content}</main>${nav}</section>`;}
 const statusShort=(g,id)=>{const q=S.state(g,id);return q.complete?'완료':q.accepted?'진행 중':'대기';};
 const ep1Stage=g=>g.completed?'종결 · 보고 완료':g.caseClosed?'조사 완료 · 보고 준비':g.phase==='followup'?'후속 확인':g.echo?.entered?(root.MODEL.chapter(g)?.[1]||'조사 중'):'의뢰 접수';
 const ep2Stage=g=>{const q=J.state(g);if(q.complete)return '종결 · 보고 완료';if(!q.accepted)return '의뢰 접수';if(q.phase==='confrontation')return '최종 재구성';if(q.phase==='deduction')return `추리 · ${q.solved.length}/${J.data.issues.length} 논점 확인`;return '기록 조사';};
 function shortCard(ctx,id,kind){const {g,btn,esc}=ctx,c=root.SHORT_CASES_DATA.cases[id],q=S.state(g,id),status=statusShort(g,id);return `<article class="short-card-v059" data-status="${status}"><small>${esc(kind)} · ${status}</small><h4>${esc(c.title)}</h4><p>${esc(c.summary)}</p>${btn(q.complete?'기록 보기':q.accepted?'이어가기':'의뢰 확인','shortcase-open',`data-id="${id}"`,q.accepted&&!q.complete?'primary':'secondary')}</article>`;}
 function casesPage(ctx){const {g,img,btn,esc}=ctx,q2=J.state(g),letter=root.CONTENT015.mini(g);const ep1Action=btn(g.completed?'종결 기록 보기':g.echo.entered?'의뢰 이어가기':'의뢰 시작','echo-resume','',g.completed?'secondary':'primary');const ep2Action=btn(q2.complete?'종결 기록 보기':q2.accepted?'의뢰 이어가기':'의뢰 시작','joseon-open','',q2.accepted&&!q2.complete?'primary':'secondary');const shortCards=[`<article class="short-card-v059" data-status="${letter.complete?'완료':letter.accepted?'진행 중':'대기'}"><small>전화 기록 · ${letter.complete?'완료':letter.accepted?'진행 중':'대기'}</small><h4>늦게 도착한 초대</h4><p>도착일과 실제 전달일, 기록으로 알 수 없는 의도를 구분한다.</p>${btn(letter.complete?'기록 보기':letter.accepted?'이어가기':'의뢰 확인','echo-page','data-id="letter015"',letter.accepted&&!letter.complete?'primary':'secondary')}</article>`,shortCard(ctx,'spare_key','생활 기록')];if(q2.complete)shortCards.push(shortCard(ctx,'dead_air','음성 기록'));
 const content=`<section class="series-library-v059"><header><span class="eyebrow">장편 의뢰</span><h2>사건마다 남아 있는 기록은 다르다.</h2><p>모서리 극장은 영상과 현장 기록을, 두 번째 의뢰는 검험·공초·민간 장부를 중심으로 조사합니다. 어느 사건이든 충분히 확인한 뒤 추리하고, 부족하면 필요한 곳만 다시 보면 됩니다.</p></header><div class="series-episode-grid-v059"><article class="series-card-v059 film"><div class="series-art">${img('echo_victim_scene','','마지막 상영 영사실 현장')}</div><div class="series-body"><span class="eyebrow">의뢰 01 · 현대 · 모서리 극장</span><h3>마지막 상영</h3><p>대표 서도윤이 영사실에서 발견된 밤. 방송, 통화, 정산 장부, 인수 영상이 서로 무엇을 실제로 증명하는지 확인한다.</p><div class="series-stage series-stage-v059"><span>현재 단계</span><b>${esc(ep1Stage(g))}</b></div><div class="series-method-v059"><span>현장 조사</span><span>영상·음성</span><span>정산 기록</span></div><div class="series-actions">${ep1Action}</div></div></article><article class="series-card-v059 archive"><div class="series-art">${img('future_joseon','','두 번 기록된 죽음의 기록층')}</div><div class="series-body"><span class="eyebrow">의뢰 02 · ${esc(J.data.year)} · 한성</span><h3>${esc(J.data.title)}</h3><p>두 검험과 여러 진술이 정말 서로 독립된 확인이었는지, 위탁책·공초·복검 문목·경첨을 겹쳐 기록의 계보를 추적한다.</p><div class="series-stage series-stage-v059"><span>현재 단계</span><b>${esc(ep2Stage(g))}</b></div><div class="series-method-v059"><span>고문서 기록층</span><span>초검·복검</span><span>기록 계보</span></div><div class="series-actions">${ep2Action}</div></div></article></div><section class="short-commission-shelf-v059"><header><div><span class="eyebrow">짧은 의뢰</span><h3>장편 사이에 확인할 작은 사건</h3></div><p class="help-text">들어온 짧은 의뢰는 원하는 순서로 맡을 수 있습니다.</p></header><div class="short-cards-v059">${shortCards.join('')}</div></section></section>`;return shell(ctx,'의뢰함',content,'echo_desk','cases');}
 function priority(ctx){
  const {g,btn}=ctx,q2=J.state(g),letter=root.CONTENT015.mini(g),sp=S.state(g,'spare_key'),da=S.state(g,'dead_air');
  const oldUnread=(R39?.followups?.(g)||[]).filter(x=>!x.read);
  const meta1Unread=!!R39?.metaAvailable?.(g)&&!readNode(g,'meta038');
  if(letter.accepted&&!letter.complete)return ['진행 중인 짧은 의뢰','늦게 도착한 초대','이미 읽은 기록과 끝낸 질문을 유지한 채 이어갑니다.',btn('이어가기 →','echo-page','data-id="letter015"','primary')];
  if(sp.accepted&&!sp.complete)return ['진행 중인 짧은 의뢰','두 번째 열쇠','열쇠·잠금장치·출입 기록을 이어서 확인합니다.',btn('이어가기 →','shortcase-open','data-id="spare_key"','primary')];
  if(da.accepted&&!da.complete)return ['진행 중인 짧은 의뢰','녹음되지 않은 4분','원본 파일의 공백과 장비 로그를 이어서 확인합니다.',btn('이어가기 →','shortcase-open','data-id="dead_air"','primary')];
  if(q2.accepted&&!q2.complete)return ['장편 의뢰 02','두 번 기록된 죽음','조선 기록층에서 해결한 논점과 읽은 원자료를 그대로 유지합니다.',btn('조선 사건 이어가기 →','joseon-open','','primary')];
  if(oldUnread.length)return ['사건 뒤의 연락',`읽지 않은 후속 연락 ${oldUnread.length}건`,`${oldUnread.map(x=>x.name).join(' · ')}에게서 이미 끝난 의뢰의 후속 연락이 도착했습니다. 새 추리의 필수 단서는 아닙니다.`,btn('후속 연락 확인 →','echo-page','data-id="correspondence015"','primary')];
  if(meta1Unread)return ['정해온 개인 기록','발신인 없는 봉투','형사 시절 종결 사건의 기록 일부가 발신인 없이 사무소에 들어왔습니다. 현재 자료만으로 의미를 단정하지 않고 먼저 출처를 확인합니다.',btn('첫 번째 봉투 확인 →','echo-inspect','data-id="meta038"','primary')];
  if(!q2.accepted)return ['새 장편 의뢰','두 번 기록된 죽음','동명서고가 조선 후기 살인 사건 기록들이 정말 서로 독립된 확인인지 검토해 달라고 의뢰했습니다.',btn('조선 사건 확인 →','joseon-open','','primary')];
  if(meta056Available(g)&&!readNode(g,'meta056'))return ['정해온 개인 기록','두 번째 봉투 · 같은 문장','과거 사건의 두 증인 진술에서 똑같은 문장이 발견됐습니다. 결론을 뒤집기보다 그 문장이 어디서 왔는지 확인할 차례입니다.',btn('두 번째 봉투 확인 →','echo-inspect','data-id="meta056"','primary')];
  const unread=officeTalks(g).filter(x=>x.available&&!x.read);
  if(unread.length)return ['사건 뒤의 사람들',`새 후속 대화 ${unread.length}건`,'종결된 사건의 사람들이 각자의 자리에서 기록을 어떻게 이어 가는지 확인할 수 있습니다.',btn('대화 보기 →','echo-page','data-id="office-talks"','primary')];
  if(q2.complete&&!da.accepted)return ['새 짧은 의뢰','녹음되지 않은 4분','공개를 앞둔 인터뷰 원본의 무음이 편집인지 장비 입력 손실인지 기록으로 확인합니다.',btn('의뢰 확인 →','shortcase-open','data-id="dead_air"','primary')];
  return ['현재 사무소','다음 의뢰를 고른다','종결 기록을 다시 보거나, 남아 있는 짧은 의뢰와 다음 장편 후보를 확인할 수 있습니다.',btn('의뢰함 보기 →','echo-page','data-id="cases"','primary')];
 }
 function hubPage(ctx){
  const {g,btn}=ctx,q2=J.state(g),[kind,title,copy,action]=priority(ctx),talks=officeTalks(g),unread=talks.filter(x=>x.available&&!x.read).length;
  const meta1=!!R39?.metaAvailable?.(g),meta1Read=readNode(g,'meta038'),meta2=meta056Available(g),meta2Read=readNode(g,'meta056');
  const completedShort=['spare_key','dead_air'].filter(id=>S.state(g,id)?.complete).length+(root.CONTENT015.mini(g)?.complete?1:0);
  let personal='';
  if(meta2){personal=`<section class="meta-thread-v059"><span class="eyebrow">정해온 개인 기록</span><h3>발신인 없는 봉투 · 두 번째 기록 ${meta2Read?'확인':'새 기록'}</h3><p>첫 번째 봉투의 시간 공백에 이어, 이번에는 서로 다른 증인 진술에 같은 문장이 남아 있다. 아직 발신인도, 문장의 출처도 확정하지 않는다.</p><div class="row wrap">${btn('첫 번째 봉투','echo-inspect','data-id="meta038"','secondary')}${btn(meta2Read?'두 번째 봉투 다시 읽기':'두 번째 봉투 확인','echo-inspect','data-id="meta056"',meta2Read?'secondary':'primary')}</div></section>`;}
  else if(meta1){personal=`<section class="meta-thread-v059"><span class="eyebrow">정해온 개인 기록</span><h3>발신인 없는 봉투 ${meta1Read?'· 첫 기록 보관':'· 새 기록'}</h3><p>${meta1Read?'형사 시절 종결 기록의 시간 공백이 왜 다시 사무소에 왔는지는 아직 모른다.':'현재 의뢰와 별개인 오래된 종결 기록이 발신인 없이 들어왔다. 지금은 출처와 기록 범위만 확인한다.'}</p>${btn(meta1Read?'첫 번째 봉투 다시 읽기':'첫 번째 봉투 확인','echo-inspect','data-id="meta038"',meta1Read?'secondary':'primary')}</section>`;}
  const content=`<section class="hub-v059"><div class="hub-identity-v059"><span class="eyebrow">잔향 탐정 사무소</span><h2>정해온</h2><p>남아 있는 기록의 범위를 넘지 않고, 서로 다른 자료가 무엇을 독립적으로 확인하는지 정리해 의뢰인에게 돌려준다.</p><div class="hub-stat-v059"><span>장편 종결 <b>${(g.completed?1:0)+(q2.complete?1:0)}</b></span><span>짧은 의뢰 종결 <b>${completedShort}</b></span><span>공명 포인트 <b>${g.echo.points}P</b></span></div>${personal}</div><div><section class="hub-priority-v059"><span class="eyebrow">${kind}</span><h2>${title}</h2><p>${copy}</p>${action}</section><div class="hub-secondary-v059"><article><span class="eyebrow">의뢰 선택</span><h3>사건 카드</h3><p>두 장편과 현재 들어온 짧은 의뢰를 한 화면에서 확인합니다.</p>${btn('의뢰함','echo-page','data-id="cases"','secondary')}</article><article><span class="eyebrow">사건 뒤의 시간 ${unread?`· 새 대화 ${unread}`:''}</span><h3>다시 만난 사람들</h3><p>후속 대화는 새 추리 단서를 주지 않고 사건의 여파와 관계만 보여 줍니다.</p>${btn('사건 뒤의 사람들','echo-page','data-id="office-talks"','secondary')}</article></div><details><summary>사무소 변화와 보상 장부 보기</summary>${root.PROGRESSION_VIEW.office(ctx)}${root.PROGRESSION_VIEW.rewardLedger(ctx)}</details></div></section>`;
  return shell(ctx,'잔향 탐정 사무소',content,'echo_office_cg','hub');
 }
 function talksPage(ctx){const {g,img,btn,esc}=ctx,talks=officeTalks(g),cards=talks.map(t=>`<article class="office-talk-v059 ${t.available?(t.read?'read':'unread'):'unavailable'}">${t.asset?img(t.asset,'portrait',t.name):`<span class="office-talk-mark">${esc(t.name.slice(0,1))}</span>`}<div><span class="eyebrow">${esc(t.case)} · ${t.available?(t.read?'다시 읽기':'새 연락'):'아직 도착 전'}</span><h3>${esc(t.name)}</h3><p>${esc(t.copy)}</p></div>${t.available?btn(t.read?'다시 대화하기':'대화 확인','echo-inspect',`data-id="${t.id}"`,t.read?'secondary':'primary'):''}</article>`).join('');const content=`<section class="office-talks-v059"><header><span class="eyebrow">사건 뒤의 사람들 · 사무소 대화</span><h2>사건이 끝난 뒤에도 사람들은 자기 삶을 이어 간다.</h2><p>여기에는 새 사건의 필수 단서가 숨겨져 있지 않습니다. 이미 끝난 사건이 사람들에게 어떻게 남았는지, 의뢰인과 관계자들이 이후 무엇을 선택했는지만 보여 줍니다.</p></header><div class="office-talk-grid-v059">${cards}</div></section>`;return shell(ctx,'사건 뒤의 사람들',content,'echo_office_cg','office-talks');}
 const oldView=EV.html;EV.html=function(ctx){const x=ctx.g.echo;if(x?.view==='hub'&&x.settled)return hubPage(ctx);if(x?.view==='cases'&&x.settled)return casesPage(ctx);if(x?.view==='office-talks')return talksPage(ctx);return oldView(ctx);};

 root.RELEASE059={meta056Available,officeTalks,ep1Stage,ep2Stage};
})(typeof window!=='undefined'?window:globalThis);
