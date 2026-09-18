/* 0.60 — Episode 3 intake: 규격 안의 사고.
 * This release intentionally stops at commission acceptance. The full academy
 * investigation starts in 0.61 after its ability rules are taught in-world. */
(function(root){'use strict';
 const E=root.ECHO,EV=root.ECHO_VIEW,J=root.JOSEON,R39=root.RELEASE039,D=root.STORY,ED=root.ECHO_DATA;
 if(!E||!EV||!J||!R39||!D||!ED)return;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hasRead=(g,id)=>R39.hasReadNode?.(g,id)||false;
 const eligible=g=>!!J.state(g)?.complete&&!!g?.echo?.read?.includes('meta056/7');
 const accepted=g=>!!g?.echo?.read?.includes('academy060_accept/3');
 const stage=g=>accepted(g)?'접수 완료 · 원본 자료 인계 대기':eligible(g)?'접수 검토':'접수 전';

 D.release='0.60.0';ED.release='0.60.0';root.STORY.release='0.60.0';if(root.CONTENT015_DATA)root.CONTENT015_DATA.release='0.60.0';
 D.names.raon='정라온';
 D.people.raon={name:'정라온',role:'해람 능력교육원 학생보호관',asset:null,contact:true,bio:'학생의 권리와 안전 문제를 교직 평가와 별도로 검토하는 학생보호관. 중대 실습 사고의 외부 사실검토를 의뢰했다.'};
 const academyFuture=(ED.futureCases||[]).find(x=>x.id==='academy');
 if(academyFuture)Object.assign(academyFuture,{status:'접수 검토',title:'규격 안의 사고',setting:'해람 능력교육원',hook:'감독 실습 중 학생이 중상을 입었다. 사고 시점의 능력 발동 기록은 학생 본인만 가리키지만, 그 기록이 사고 원인까지 설명하는지는 별개의 문제다.',question:'누가 능력을 썼는지와 누가 위험한 조건을 만들었는지를 구분하는 사건.',materials:['개인 운용 규격서','실습 장치 원본 로그','세션 설정 이력','학생·교직원 진술']});

 const nodes={
  academy060_intake:{id:'academy060_intake',title:'세 번째 장편 의뢰 · 규격 안의 사고',bg:'echo_office_cg',actor:null,lines:[
   {who:'raon',text:'해람 능력교육원 학생보호관 정라온입니다. 어제 오후 2시 23분, 감독 실습 중 2학년 학생 한 명이 의식을 잃었습니다.'},
   {who:'raon',text:'학생은 살아 있습니다. 다만 아직 안정이 우선이라 사고 경위를 길게 묻지는 못하고 있어요. 문제는 그 사이 내부 사고 요약이 거의 완성됐다는 겁니다.'},
   {who:'haeon',text:'요약에는 어떻게 적혀 있습니까?'},
   {who:'raon',text:'사고 순간 등록된 능력 발동은 다친 학생 한 명뿐이고, 장치 요약에는 세션이 설정된 허용 범위 안이었다고 적혀 있습니다. 그래서 현재 결론은 학생의 자기 과부하입니다.'},
   {who:'haeon',text:'능력 발동 기록과 사고 원인은 같은 항목이 아닙니다. 허용 범위가 무엇을 기준으로 한 말인지도 봐야 하고요.'},
   {who:'raon',text:'그래서 왔습니다. 내부에는 능력 전문가가 충분합니다. 대신 자기 능력으로 본 장면도 증거라고 쓰지 않는 사람이 필요했어요.'},
   {who:'raon',text:'원본을 넘겨받으면 어디부터 보시겠습니까?'}
  ],choices:[
   {id:'scope',label:'“학생들이 능력으로 확인했다는 범위부터 적겠습니다.”',next:'academy060_focus_witness'},
   {id:'system',label:'“장치가 무엇을 기록하고, 무엇을 기록하지 않는지부터 보죠.”',next:'academy060_focus_system'},
   {id:'setup',label:'“사고 순간보다 앞선 준비 절차부터 확인하겠습니다.”',next:'academy060_focus_setup'}
  ]},
  academy060_focus_witness:{id:'academy060_focus_witness',title:'능력 진술의 범위',bg:'echo_desk',lines:[
   {who:'haeon',text:'능력으로 확인했다는 말도 먼저 범위를 적겠습니다. 무엇을 감지했고, 무엇은 감지할 수 없는지 분리해야 합니다.'},
   {who:'raon',text:'맞아요. 학생 한 명이 장치에 남은 능력 흔적을 확인했습니다. 그 아이가 거짓말한다고 생각하지는 않아요.'},
   {who:'haeon',text:'거짓말인지부터 볼 필요도 없습니다. 진술이 사실이어도 그 능력이 관측하지 못하는 원인은 남을 수 있으니까요.'},
   {who:'raon',text:'그 기준으로 외부 검토서를 부탁드리겠습니다.'}
  ],next:'academy060_authority'},
  academy060_focus_system:{id:'academy060_focus_system',title:'장치 로그의 범위',bg:'echo_desk',lines:[
   {who:'haeon',text:'원본 로그와 사람이 읽기 좋게 만든 사고 요약을 따로 받겠습니다. 요약에 없는 항목이 원본에도 없다는 뜻은 아니니까요.'},
   {who:'raon',text:'실습 장치는 능력 발동과 안전장치 작동을 남깁니다. 설정 변경은 별도 관리 기록이라 사고 요약에는 한 줄로만 들어갑니다.'},
   {who:'haeon',text:'그 둘을 합치지 말고 주세요. 시스템이 내린 결론보다 시스템이 실제로 기록한 항목을 먼저 보겠습니다.'},
   {who:'raon',text:'그렇게 준비하겠습니다.'}
  ],next:'academy060_authority'},
  academy060_focus_setup:{id:'academy060_focus_setup',title:'사고 전의 준비 절차',bg:'echo_desk',lines:[
   {who:'haeon',text:'사고가 난 2시 23분만 보면 마지막으로 버튼을 누른 사람만 남기 쉽습니다. 실습실을 열고, 학생 프로필을 불러오고, 장치를 점검한 순서부터 보겠습니다.'},
   {who:'raon',text:'내부 요약은 사고 10분 전부터 시작합니다. 준비실 기록까지 포함하면 범위가 두 시간 정도 더 늘어납니다.'},
   {who:'haeon',text:'그 두 시간을 먼저 보죠. 결과가 아니라 조건이 언제 만들어졌는지 확인해야 합니다.'},
   {who:'raon',text:'제가 외부 검토를 요청한 이유도 그겁니다.'}
  ],next:'academy060_authority'},
  academy060_authority:{id:'academy060_authority',title:'외부 검토 범위',bg:'echo_desk',lines:[
   {who:'haeon',text:'학생 자료를 제가 열람할 권한부터 확인하겠습니다. 미성년자 기록이면 보호자 동의와 학교 쪽 승인 범위가 필요합니다.'},
   {who:'raon',text:'보호자 동의서와 사고검토위원회 승인서를 가져왔습니다. 진료기록은 제외하고, 실습 원본 기록과 동의한 관계자 진술까지만 넘깁니다.'},
   {who:'haeon',text:'좋습니다. 저는 징계를 결정하지 않습니다. 어떤 사실이 어떤 기록으로 확인되는지와, 현재 자료로는 말할 수 없는 부분까지 적겠습니다.'},
   {who:'raon',text:'그 구분이 필요합니다. 사고를 학생 개인의 무리한 선택으로 확정하기 전에요.'}
  ],next:'academy060_accept'},
  academy060_accept:{id:'academy060_accept',title:'의뢰 접수',bg:'echo_office_cg',lines:[
   {who:'haeon',text:'의뢰를 맡겠습니다. 먼저 다친 학생의 운용 규격서, 장치 원본 로그, 세션 설정 이력, 실습 전후 진술을 같은 시간축에 놓겠습니다.'},
   {who:'raon',text:'원본 동결은 끝냈습니다. 자료 인계가 승인되는 대로 다시 연락드리죠.'},
   {who:'haeon',text:'그전에는 결론을 세우지 않겠습니다. 사고 순간에 능력을 쓴 사람과, 그 순간이 위험해진 이유를 따로 보겠습니다.'},
   {who:'raon',text:'그렇게 해주세요. 이번엔 학생이 무엇을 잘못했는지부터 묻지 않았으면 합니다.'}
  ],effect:'hub'},
  academy060_casefile:{id:'academy060_casefile',title:'해람 능력교육원 · 접수 기록',bg:'echo_desk',lines:[
   {who:'n',text:'의뢰명은 ‘규격 안의 사고’. 해람 능력교육원 감독 실습 중 발생한 학생 중상 사고의 외부 사실검토다.'},
   {who:'n',text:'현재 확인된 것은 사고 시점에 다친 학생의 능력이 발동했다는 것, 장치 요약이 세션을 ‘설정 범위 안’이라고 분류했다는 것뿐이다.'},
   {who:'n',text:'아직 확인하지 않은 것은 그 범위가 누구의 어떤 기준으로 설정됐는지, 사고 전에 어떤 준비 절차가 있었는지, 능력 진술이 실제로 무엇까지 관측했는지다.'},
   {who:'n',text:'원본 자료가 인계되기 전까지는 학생의 책임도, 다른 사람의 개입도 단정하지 않는다.'}
  ],effect:'hub'}
 };
 Object.assign(ED.nodes,nodes);

 const oldInspect=E.inspect;
 E.inspect=function(g,id){
  if(String(id).startsWith('academy060_')){
   if(!eligible(g))throw Error('아직 이 의뢰를 열 수 없습니다.');
   E.start(g,id);return;
  }
  return oldInspect(g,id);
 };

 function academyCard(ctx){const {g,img,btn}=ctx,a=accepted(g);return `<article class="series-card-v059 academy"><div class="series-art">${img('future_academy','','해람 능력교육원 의뢰 기록')}</div><div class="series-body"><span class="eyebrow">의뢰 03 · 현재 · 해람 능력교육원</span><h3>규격 안의 사고</h3><p>감독 실습 중 학생이 중상을 입었다. 사고 시점의 능력 기록은 학생 본인만 가리키지만, 그 기록이 사고 원인까지 설명하는지는 별개의 문제다.</p><div class="series-stage series-stage-v059"><span>현재 단계</span><b>${esc(stage(g))}</b></div><div class="series-method-v059"><span>능력 운용 규격</span><span>장치 원본 로그</span><span>사고 조건</span></div><div class="series-actions">${btn(a?'접수 기록 다시 보기':'의뢰 상담','echo-inspect',`data-id="${a?'academy060_casefile':'academy060_intake'}"`,a?'secondary':'primary')}</div></div></article>`;}

 function academyPriority(ctx){const {btn}=ctx;return `<section class="hub-priority-v059 academy-priority-v060"><span class="eyebrow">새 장편 의뢰</span><h2>규격 안의 사고</h2><p>해람 능력교육원에서 감독 실습 중 학생이 중상을 입었습니다. 능력 발동 기록과 장치 요약은 이미 한 결론을 가리키지만, 학생보호관은 그 기록이 실제로 무엇까지 증명하는지 외부 검토를 요청했습니다.</p><div class="academy-method-v060"><article><b>능력 진술</b><span>무엇을 감지했고 무엇은 감지할 수 없는지</span></article><article><b>장치 로그</b><span>시스템이 남긴 값과 요약이 붙인 해석을 분리</span></article><article><b>준비 절차</b><span>사고 순간보다 앞서 위험한 조건이 만들어졌는지</span></article></div>${btn('의뢰 상담 시작 →','echo-inspect','data-id="academy060_intake"','primary')}</section>`;}
 function academyStatus(ctx){const {btn}=ctx;return `<section class="academy-status-v060"><div><span class="eyebrow">장편 의뢰 03 · 접수 완료</span><h3>해람 능력교육원 · 외부 사실검토</h3><p>원본 자료 동결 완료. 학생 보호자 동의와 기관 인계 승인 범위 안에서 실습 기록을 넘겨받는 중입니다. 아직 사고 원인이나 책임을 단정하지 않습니다.</p></div>${btn('접수 기록','echo-inspect','data-id="academy060_casefile"','secondary')}</section>`;}

 const oldView=EV.html;
 EV.html=function(ctx){
  let html=oldView(ctx),x=ctx.g?.echo;
  if(!html||!eligible(ctx.g))return html;
  if(x?.view==='cases'&&x.settled){
   html=html.replace('class="series-episode-grid-v059"','class="series-episode-grid-v059 academy-grid-v060"');
   const marker='</div><section class="short-commission-shelf-v059">';
   if(html.includes(marker))html=html.replace(marker,academyCard(ctx)+marker);
  }
  if(x?.view==='hub'&&x.settled){
   if(!accepted(ctx.g)){const a=html.indexOf('<section class="hub-priority-v059">'),b=a>=0?html.indexOf('</section>',a):-1;if(a>=0&&b>=0)html=html.slice(0,a)+academyPriority(ctx)+html.slice(b+10);}
   else if(!html.includes('academy-status-v060')){html=html.replace('<div class="hub-secondary-v059">',academyStatus(ctx)+'<div class="hub-secondary-v059">');}
  }
  return html;
 };

 root.RELEASE060={eligible,accepted,stage,title:'규격 안의 사고',client:'정라온',institution:'해람 능력교육원'};
})(typeof window!=='undefined'?window:globalThis);
