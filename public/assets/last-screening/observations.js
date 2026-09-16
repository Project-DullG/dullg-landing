/* Presentation copy only. None of these observations grants facts or changes progress. */
(function(root){'use strict';
 const IDLE={
  jisu:'지수는 서류철을 안은 채 내 쪽을 바라봤다.',
  taeo:'태오는 작업대 옆에 서 있었다.',
  seoa:'서아가 노트를 넘기다 손을 멈췄다.',
  minjae:'나는 민재에게 다시 시선을 돌렸다.',
  eunchae:'은채는 방금 적은 내용을 훑어보았다.',
  youngsook:'영숙 씨에게 다시 시선을 돌렸다.',
  hocheol:'나는 호철 씨 앞에서 수첩을 펼쳤다.',
  sookyoung:'수경 씨의 말을 기다렸다.'
 };
 function idle(s,npc){
  if(s?.dialogue?.remote)return '통화는 아직 끝나지 않았다.';
  if(!s)return '';
  if(s.completed)return '수첩을 덮었다. 다음에 연락할 날짜는 따로 적어 두었다.';
  return IDLE[npc]||'수첩을 펼치고 주변을 둘러봤다.';
 }
 function role(person){return person?.role?.replace(' · 전화 확인','')||'';}
 function phase(value){return ({night:'사건 당일',followup:'며칠 뒤',epilogue:'조사 뒤',finished:'조사 뒤'})[value]||'';}
 function ending(s){return s.ending==='A'?'영사기가 멎었다. 직원들은 가져갈 물건을 챙겼다.':'각자의 인터뷰를 보냈다. 수첩에는 다음 연락 날짜가 남았다.';}
 function timeline(s){
  const entries=[
   {id:'recording',order:1100,stage:0,time:'18:20',text:'안내 음성 녹음',source:'음성 파일'},
   {id:'prior_photo',order:1112,stage:0,time:'18:32',text:'사무실 촬영 당시 장부 모서리는 온전함',source:'촬영 원본 확인'},
   {id:'schedule',order:1115,stage:0,time:'18:35',text:'21시 안내 재생 예약',source:'장치 기록'},
   {id:'message',order:1250,stage:0,time:'20:50~20:54',text:'원본 요구와 한지수의 회신',source:'메시지'},
   {id:'original',order:1254,stage:0,time:'20:54~21:06',text:'세 사람의 하역장 인수 작업',source:'연속 영상 확인'},
   {id:'original',order:1257,stage:0,time:'20:57:16',text:'서도윤이 새 렌즈 질문에 응답',source:'영상 속 통화'},
   {id:'schedule',order:1260,stage:0,time:'21:00',text:'예약한 안내 음성 재생',source:'장치 기록'},
   {id:'arrival',order:1268,stage:0,time:'21:08',text:'정태오 발견 · 윤서아 신고',source:'초동 기록'},
   {id:'first_response',order:0,stage:1,time:'발견 이후',text:'한지수는 로비에 남음 · 영사실 미진입',source:'초동·목격 확인'},
   {id:'lab',order:0,stage:2,time:'며칠 뒤',text:'장부와 천 조각, 얼룩 검사 결과 접수',source:'검사 결과'}
  ];
  return entries.filter(e=>s.evidence.includes(e.id)).sort((a,b)=>a.stage-b.stage||a.order-b.order);
 }
 function objective(text){
  const labels={
   '자료를 검사 의뢰와 함께 정리하고 며칠 뒤로 진행한다.':'검사 의뢰와 현장 기록',
   '사건 기록과 전달 결과를 다시 확인할 수 있다.':'남은 지급 확인 일정',
   '영상 전달안을 먼저 정한다.':'직원 영상 전달안',
   '확인한 의사에 맞춰 영상 전달을 마친다.':'직원들의 요청에 따른 영상 전달',
   '도착한 검사 결과를 읽는다.':'도착한 검사 결과',
   '한지수와 마지막 재면담을 시작한다.':'한지수의 방문과 당시 행동',
   '영사실에서 재생 기록과 방송 지시를 확인한다.':'안내 음성과 재생 기록',
   '박은채에게 물품 보관과 접근 경위를 확인한다.':'박은채 · 현장 보존 경위',
   '이민재에게 연속 인수 원본을 확인한다.':'이민재 · 장비 인수 원본',
   '이민재의 장비 인수 목록을 확인한다.':'인수 품목과 번호',
   '영사실 작업대의 현장 기록을 확인한다.':'영사실의 현장 기록',
   '사무실 책상의 지급 자료를 확인한다.':'직원별 지급 자료',
   '세 직원에게 입금과 서명을 각각 확인한다.':'직원들의 수령액과 서명',
   '한지수에게 자신의 계좌로 받은 돈을 묻는다.':'한지수 계좌로 간 돈',
   '한지수에게 대표의 원본 요구 연락을 확인한다.':'대표의 원본 요구 연락',
   '한지수에게 빠진 서류와 장부 보관을 묻는다.':'한지수 · 서류와 장부의 행방',
   '자료실의 동의서와 사무실 촬영 기록을 확인한다.':'촬영 동의서와 사무실 촬영 기록',
   '사무실에 남은 확인서 작성 파일을 확인한다.':'수령 확인서 작성 파일',
   '세 주장을 근거와 함께 대조한다.':'한지수의 세 가지 설명',
   '이호철의 영상 공개 범위 요청을 확인한다.':'이호철 · 영상 공개 범위',
   '박수경의 장면 확인 요청을 듣는다.':'박수경 · 인터뷰 확인 요청'
  };
  if(labels[text])return labels[text];
  return text.replace('에게 후속 확인을 한다.',' · 후속 면담').replace('의 근거를 정리한다.',' · 근거 대조').replace(' 작업을 마친다.','').replace('의 확인본과 답변을 기록한다.',' · 확인본과 답변').replace(/에게 (.+)을 확인한다\.$/,' · $1').replace(/에게 (.+)를 확인한다\.$/,' · $1');
 }
 root.UI_COPY={version:'0.6.2',idle,role,phase,ending,timeline,objective};
 if(typeof module!=='undefined')module.exports=root.UI_COPY;
})(typeof window!=='undefined'?window:globalThis);
