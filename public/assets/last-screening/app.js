(function(){
'use strict';
const D=STORY,M=MODEL,S=STORAGE,A=ASSETS,P=PRESENTATION,RUN=DEDUCTION,$=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=id=>A[id]||'';
const img=(id,cls='',alt='')=>`<img class="${cls}" src="${esc(asset(id))}" alt="${esc(alt)}" data-asset="${esc(id)}" draggable="false">`;
const btn=(label,act,data='',cls='',disabled=false)=>`<button type="button" data-act="${act}" ${data} class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
const eventName=(p)=>p==='n'?'정해온':D.names[p]||D.people[p]?.name||'정해온';
function currentSoundscape(){if(!G)return 'title';if(G.phase==='followup')return 'followup';return ['lobby','office','archive','projection','auditorium'].includes(G.location)?G.location:'lobby';}
function updateAmbient(){SOUND.sync(currentSoundscape(),G?.phase||'night',C,BGM_POLICY.resolve(G,U,aux,auxBack,A));}

function evidenceAudioText(id){if(id==='recording')return '정산 확인이 조금 더 걸리겠습니다. 먼저 영상을 보고 계세요. 끝나는 대로 내려가겠습니다.';if(id==='director_order')return '정산이 늦어질 경우를 대비해 미리 녹음한 안내를 밤 아홉 시에 재생하라는 지시가 남아 있다.';if(id==='original')return '이민재: 목록대로 214를 받으면 됩니까? 서도윤: 네. 각인이 214인 걸 가져가세요. 표가 잘못 붙었나 보네요.';return ''; }
function compareIdForEvidence(id){const k=compareViews[id]?id:({consents:'receipts',packing:'original',schedule:'recording'})[id];return k&&M.all(G.evidence,compareViews[k].ids)?k:'';}

function lineTone(){return ['calm',''];}

function maybeSpeakCurrentLine(keyOverride=''){
 if(!G?.dialogue||!C.voice)return;const line=M.currentLine(G),key=keyOverride||M.lineId(G);if(!line||spokenKey===key)return;
 spokenKey=key;SOUND.speak(line.text,{enabled:C.voice,rate:C.voiceRate,key,volume:C.voiceVolume});
}

let G=null,C=S.config(),U={mode:'talk',npc:'minjae',rail:false,goal:true,scrolls:{}},aux=null,auxBack=[],returnFocus=null,returnScroll={},auto=false,autoTimer=null,typeTimer=null,type={key:null,shown:0,full:'',wasRead:false},lastTick=Date.now(),storageWarning='',toastTimer;
const app=$('#app'),overlay=$('#overlay'),notifications=$('#notifications');
const nav=[['inspect','현장 조사'],['evidence','자료 열람'],['people','인물 정보'],['case','사건 정리'],['map','지도']];
const compareViews={receipts:{title:'서명이 사용된 두 문서',ids:['receipts','consents']},signature_file:{title:'작성 파일과 직원들의 확인',ids:['signature_file','workers','consents']},lab:{title:'검사 결과와 장부 기록',ids:['lab','ledger','cloth']},original:{title:'인수 목록과 연속 원본',ids:['original','packing']},recording:{title:'안내 원본과 예약 기록',ids:['recording','schedule']}};
let layoutFrame=0;
function syncLayoutMetrics(){
 const top=$('.topbar');document.documentElement.style.setProperty('--topbar-height',(top?.offsetHeight||76)+'px');syncActor();
}
function requestLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{resizeWorld();syncActor();});}
function syncActor(){
 const stage=$('.actor-stage'),visual=$('.actor-visual'),im=visual?.querySelector('.actor'),dialogue=$('.dialogue');
 if(!stage||!visual||!im?.naturalWidth||!dialogue)return;
 const box=stage.getBoundingClientRect(),d=dialogue.getBoundingClientRect();
 const available=Math.max(64,d.top-box.top),focus=CAST_FRAMING[im.dataset.asset.replace('_bust','')]?.safeBottom||.86;
 const scale=Math.min(Math.max(50,box.width-24)/im.naturalWidth,Math.max(64,available-16)/(im.naturalHeight*focus));
 const w=im.naturalWidth*scale,h=im.naturalHeight*scale;
 // The waist intentionally continues behind the opaque dialogue. Hair and hands stay above it.
 const y=Math.max(9,available+26-h);
 Object.assign(visual.style,{left:Math.round((box.width-w)/2)+'px',top:Math.round(y)+'px',width:w.toFixed(3)+'px',height:h.toFixed(3)+'px'});
 visual.dataset.safeBottom=focus;visual.dataset.join='under-dialogue';
}
function visualContext(){return {scope:G?U.mode:'title',chapter:G?M.chapter(G).join(' '):null,location:G?.location||null,phase:G?.phase||null,actor:G&&U.mode==='talk'?getActor():null,speaker:G?M.currentLine(G)?.who:null,scene:G?.dialogue?.kind==='scene'?G.dialogue.ref:null,ending:G?.completed?G.ending:null,directed:G?DIRECTION.resolve(G,U,aux):null,slate:G?DIRECTION.chapter(G,U):null,revealed:!!G?.dialogue&&type.key===M.lineId(G)&&type.shown>=Array.from(M.currentLine(G)?.text||'').length,bg:G?asset(D.places[G.location].bg):asset('title_keyart')};}
function actorVisual(actor){return `<div class="actor-visual" data-person="${actor}">${img(D.people[actor].asset+'_bust','actor',D.people[actor].name)}</div>`;}
function atmosphereMarkup(){return `<div class="scene-atmosphere" aria-hidden="true"><div class="projector-beam"></div>${[0,1,2,3,4,5,6,7,8].map(i=>`<i class="film-mote" style="--mx:${26+(i*17)%54}%;--my:${12+(i*13)%60}%;--mt:${12+i%5}s;--md:-${i*2.3}s"></i>`).join('')}</div>`;}


let spokenKey='';
function sound(kind='click'){SOUND.play(kind,C.volume);}
function toast(message,error=false){clearTimeout(toastTimer);notifications.innerHTML=`<div class="toast ${error?'error':''}">${esc(message)}</div>`;P.notice();toastTimer=setTimeout(()=>notifications.replaceChildren(),error?9000:4200);}

function applySettings(){
 document.documentElement.style.setProperty('--font-mult',C.textSize);document.body.classList.toggle('large-text',C.textSize>1);document.body.classList.toggle('reduced',C.reduced);document.body.classList.toggle('high-contrast',C.contrast);document.body.classList.toggle('hints-off',!C.hints);
 document.documentElement.style.setProperty('--choice',`url("${asset('choice')}")`);P.configure(C);updateAmbient();requestLayout();
}

function pauseAuto(){auto=false;clearTimeout(autoTimer);document.querySelectorAll('[data-act="auto"]').forEach(b=>b.setAttribute('aria-pressed','false'));document.querySelectorAll('.inline-dialogue-controls [data-act=auto]').forEach(b=>b.textContent='자동');}
function syncStorageNotice(){
 const el=$('#storageNotice');if(!el)return;el.hidden=!storageWarning;
 el.innerHTML=storageWarning?`<span>저장하지 못했습니다.</span>${btn('진행 파일 보관','export-save','','small')}`:'';
}
function persist(){if(!G)return;try{S.put('auto',G,U);storageWarning='';}catch(e){if(!storageWarning)toast(e.message,true);storageWarning=e.message;}syncStorageNotice();}
function captureScroll(){const out={};document.querySelectorAll('[data-scroll]').forEach(el=>out[el.dataset.scroll]=[el.scrollLeft,el.scrollTop]);return out;}
function restoreScroll(values){document.querySelectorAll('[data-scroll]').forEach(el=>{const p=values[el.dataset.scroll];if(p){el.scrollLeft=p[0];el.scrollTop=p[1];}});}
function latest(){return S.slots().filter(x=>x.value).sort((a,b)=>Date.parse(b.value.savedAt)-Date.parse(a.value.savedAt))[0]?.value;}
function isFieldMode(mode){return ['talk','visit','inspect'].includes(mode);}
function rememberField(){if(G&&isFieldMode(U.mode)){U.returnContext={mode:U.mode,npc:D.people[U.npc]?U.npc:null,loc:G.location};U.scrolls={...(U.scrolls||{}),...captureScroll()};}}
function returnToField(){
 if(RUN.started(G)){leaveReasoning('voluntary');return;}
 if(!G)return;pauseAuto();SOUND.stopSpeech();const c=U.returnContext;
 if(G.dialogue?.remote){openAux('phone',{npc:M.topic(G.dialogue.ref).npc});return;}
 if(G.dialogue)U.mode=G.dialogue.kind==='hotspot'?'inspect':'talk';
 else if(c&&c.loc===G.location){U.mode=c.mode;U.npc=c.npc||roomPeople()[0]||'minjae';}
 else U.mode='visit';
 render();persist();requestAnimationFrame(()=>($('#lineButton')?.matches('button')?$('#lineButton'):$('#placePeople')||$('#entry-'+U.npc)||$('#main'))?.focus({preventScroll:true}));
}
function readerShortcuts(){if(!G)return '';const ids=PLAYER.unread(G),o=PLAYER.outcome(G,U);return `${ids.length?btn('새로 얻은 자료','new-evidence','id="newEvidence"','small'):''}${o?btn('최근 확인','last-result','id="lastResult"','small'):''}`;}
function recentModal(){const o=PLAYER.outcome(G,U);if(!o)return templateModal('최근 확인','<p>아직 마친 조사가 없습니다.</p>');return templateModal('최근 확인',`<section class="recent-result"><span class="tag">${o.kind==='topic'?'들은 진술':o.kind==='proof'?'기록한 판단':'현장 조사'}</span><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p>${o.ids.length?`<h3>관련 자료</h3><div class="stack">${o.ids.map(id=>btn(esc(D.evidence[id].name),'evidence',`data-id="${id}"`)).join('')}</div>`:''}${o.kind==='topic'?btn('대화 다시 읽기','topic-log',`data-id="${o.ref}"`):''}</section>`,`${btn('닫기','close-aux')}${btn('다음 조사','help-go','','primary')}`,'compact');}
function evidenceReceipt(ids){
 const owned=ids.filter(id=>G.evidence.includes(id));if(!owned.length)return;
 clearTimeout(toastTimer);U.receiptIds=owned;
 notifications.innerHTML=`<div class="toast evidence-receipt"><span class="receipt-kind">자료 확보</span><strong>${esc(owned.length===1?D.evidence[owned[0]].name:D.evidence[owned[0]].name+' 외 '+(owned.length-1)+'건')}</strong>${btn('펼쳐 보기','receipt-open','aria-label="방금 확보한 자료 펼쳐 보기"','small')}</div>`;
 P.notice();
 // This actionable announcement lasts until the next action; it never steals focus.
}
function receiptModal(){const ids=(U.receiptIds||[]).filter(id=>G.evidence.includes(id));return templateModal('방금 확보한 자료',`<div class="stack">${ids.map(id=>`<article class="receipt-item"><span class="tag">${esc(D.evidence[id].type)}</span><h3>${esc(D.evidence[id].name)}</h3><p>${esc(D.evidence[id].source)}</p>${btn('자료 읽기','evidence',`data-id="${id}"`,'secondary')}</article>`).join('')}</div>`,btn('돌아가기','close-aux'));}
function interviewAside(choices){
 const refs={conclusion_v7_open:['loan','message'],conclusion_v7_debt:['loan','bank'],conclusion_v7_visit:['lab','ledger'],conclusion_v7_table:['message','original'],conclusion_v7_names:['workers','receipts'],conclusion_v7_repay:['bank','receipts'],conclusion_v7_grip:['scene','lab'],conclusion_v7_after:['first_response'],conclusion_v7_call:['first_response'],conclusion_v7_door:['first_response','door'],conclusion_v7_papers:['ledger','signature_file'],conclusion_v7_stairs:['schedule','first_response'],conclusion_v7_close:['loan','ledger']};
 const ids=(refs[G.dialogue.ref]||[]).filter(id=>G.evidence.includes(id));
 return `<aside class="questions interview-questions dramatic-aside"><div class="dramatic-heading"><small>마지막 면담</small><strong>${esc(M.dialogueData(G).section)}</strong></div>${choices.length?`<div class="question-list">${choices.map(c=>btn(esc(c.label),'dialogue-choice',`data-id="${c.id}"`,'question')).join('')}</div>`:''}${ids.length?`<details class="interview-records"><summary>앞서 확인한 기록</summary><div class="stack">${ids.map(id=>btn(esc(D.evidence[id].name),'evidence',`data-id="${id}"`,'small')).join('')}</div></details>`:''}</aside>`;
}
function acceptedProofModal(){
 const p=aux.data,d=D.deductions.find(x=>x.id===p.id),a=DIRECTION.accepted(G,p.id,p.proofs);if(!a)return null;
 const next=GUIDE.next(G);
 return templateModal(a.title,`<section class="insight-page"><header class="insight-header"><span class="insight-emblem" aria-hidden="true">✓</span><div><small>근거를 연결했다</small><h3>${esc(a.headline)}</h3></div></header><div class="insight-sources">${a.sources.map(id=>`<article class="insight-source">${img('paper','paper-decor','')}<small>${esc(D.evidence[id].type)}</small><h4>${esc(D.evidence[id].name)}</h4><p>${esc(D.evidence[id].facts[0])}</p>${btn('원문 다시 읽기','evidence',`data-id="${id}"`,'small')}</article>`).join('')}</div><section class="insight-conclusion"><h3>지금 확인한 것</h3><div class="feedback success" role="status">${esc(a.text)}</div></section><div class="insight-next"><span>이어 확인할 일</span><p>${esc(next?.why||next?.title||'남은 이야기를 확인한다.')}</p></div></section>`,`${btn('선택한 근거 다시 보기','proof-edit')}${btn('사건 정리로','close-aux')}${btn('다음 조사로','proof-next','','primary')}`,'wide');
}
function contextHelp(){
 const proof=auxBack.slice().reverse().find(x=>x.kind==='proof'),id=aux.data.proof||proof?.data.id,t=GUIDE.next(G),levels=RUN.isLoop(G)&&id?loopHints(id,aux.data.level||0):PLAYER.help(G,id,aux.data.level||0),isProof=!!id,sources=RUN.isLoop(G)&&id?(aux.data.level>=2?(D.deductions.find(d=>d.id===id)?.proof||[]).filter(e=>G.evidence.includes(e)):[]):PLAYER.helpSources(G,id,aux.data.level||0);
 return templateModal(isProof?'추리 도움':'지금 할 일',`<section class="context-help"><h3>${esc(isProof?D.deductions.find(d=>d.id===id)?.question:t?.title||'이야기 시작')}</h3>${isProof?'<p>필요한 만큼만 펼쳐 보세요. 도움을 봐도 진행이나 후일담은 달라지지 않습니다.</p>':`<p>${esc(t?.why||'다음 버튼으로 이야기를 이어 읽으세요.')}</p>`}${isProof?levels.map((text,i)=>`<article class="hint-step"><span>${['방향','살펴볼 부분','연결할 점'][i]}</span><p>${esc(text)}</p></article>`).join(''):''}${sources.length?`<section class="hint-sources"><h3>이 자료에서 확인할 수 있어요</h3><div class="stack">${sources.map(e=>btn(esc(D.evidence[e].name),'evidence',`data-id="${e}"`,'secondary')).join('')}</div></section>`:''}<details><summary>조작이 헷갈릴 때</summary><p>대사: 한 번 누르면 문장 전체, 다음 입력은 다음 말입니다.</p><p>자료나 지도를 다녀와도 대화는 그대로 남습니다. ‘돌아가기’로 복귀하세요. 다른 질문을 듣다 돌아와도 이어 읽을 수 있습니다.</p><p>추리: 자료를 읽고 근거와 판단을 선택합니다. 제출 전에는 얼마든지 바꿀 수 있습니다.</p></details></section>`,`${isProof&&(aux.data.level||0)<3?btn((aux.data.level||0)?'다음 도움 보기':'방향만 보기','hint-more','','secondary'):''}${btn('돌아가기','close-aux')}${!isProof?btn(guideLabel(t),'help-go','','primary'):''}`,'compact');
}
function title(){
 const cont=latest();
 return `<section class="title-screen title-keyart" aria-labelledby="titleHeading">
  <div class="title-art-stage">${img('title_keyart','title-image','마지막 상영 · 영사기와 객석 앞에 모인 극장 관계자들의 타이틀 일러스트')}</div>
  <div class="title-content">
   <h1 id="titleHeading" class="sr-only">마지막 상영</h1>
   <nav class="title-menu" aria-label="시작 메뉴">
    ${btn('<span class="title-action-index" aria-hidden="true">01</span><span class="title-action-label">처음부터</span>','new','id="titleNew"','primary')}
    ${btn('<span class="title-action-index" aria-hidden="true">02</span><span class="title-action-label">이어하기</span>','continue','id="titleContinue"','',!cont)}
    ${btn('<span class="title-action-index" aria-hidden="true">03</span><span class="title-action-label">불러오기</span>','load-menu','id="titleLoad"')}
    ${btn('<span class="title-action-index" aria-hidden="true">04</span><span class="title-action-label">설정</span>','settings','id="titleSettings"')}
   </nav>
   ${cont?`<div class="continue-context"><span>이어갈 기록</span><p>${esc(D.places[cont.game.location]?.name||'')} · ${esc(cont.game.dialogue?M.dialogueData(cont.game)?.section||M.dialogueData(cont.game)?.label||'읽던 이야기':GUIDE.next(cont.game)?.title||'사건 기록')}</p></div>`:''}
   <div class="title-subrow">
    <div class="title-utilities">${btn('이용 안내','about','id="titleAbout"','plain')}</div>
    <div class="title-sound">${btn('타이틀 음악 듣기','sound-enable','id="titleSound"')}</div>
   </div>
   <div class="title-status" id="notificationSlot"></div>
  </div>
 </section>`;
}
function clock(){return G.phase==='night'?'10월 18일 밤 · 도착 21:26':G.phase==='followup'?'며칠 뒤 · 후속 면담':'조사 뒤 · 영상과 물품 반환';}

function shell(){if(RUN.isLoop(G)&&!G.reasoning.briefed)return intakePage();const ch=RUN.isLoop(G)?M.chapter(G):guided()?[String(GUIDE.next(G)?.ch||1).padStart(2,'0'),GUIDE.next(G)?.chapter||'사건 조사']:M.chapter(G);return `<div class="game-shell ${guided()?'guided-game':''}"><header class="topbar"><div class="row"><div class="chapter-num"><span>CHAPTER</span><b>${ch[0]}</b></div><div><p class="location-label">${esc(D.places[G.location].name)} <span class="chapter-name">/ ${esc(ch[1])}</span></p><div class="time-label">${clock()}</div></div></div><div class="top-controls">${guided()?`${G.dialogue&&(G.dialogue.remote||!['talk','inspect'].includes(U.mode))?btn(G.dialogue.remote?'통화 이어하기':'대화로','resume-talk','','secondary'):''}${btn('대화 기록','log')}${btn('저장','save-menu')}${btn('설정','settings')}${btn('메뉴','pause')}`:`${G.dialogue&&(G.dialogue.remote||!['talk','inspect'].includes(U.mode))?btn(G.dialogue.remote?'통화 이어하기':'대화로 돌아가기','resume-talk','','secondary'):''}${btn('자동','auto','aria-label="대사 자동 진행" aria-pressed="'+auto+'"')}${btn('읽은 대사 넘기기','skip')}${btn('대화 기록','log')}${btn('저장','save-menu')}${btn('불러오기','load-menu')}${btn('설정','settings')}${btn(C.audioMuted?'소리 켜기':'음소거','audio-mute',`aria-label="${C.audioMuted?'전체 소리 켜기':'전체 소리 끄기'}" aria-pressed="${C.audioMuted}"`)}${btn('일시정지','pause')}`}</div></header><div class="status-strip"><div id="notificationSlot" class="notification-slot"></div><div id="readerShortcuts" class="reader-shortcuts">${readerShortcuts()}</div><div id="storageNotice" class="storage-notice" role="status" hidden></div></div>${guided()?guideBar():''}<main class="game-main" id="main" tabindex="-1" aria-label="게임 화면">${mainView()}</main><nav class="main-nav" aria-label="활동 메뉴">${RUN.started(G)?reasoningNav():nav.map(([id,label],i)=>btn(`<span>0${i+1}</span>${label}`,'mode',`data-mode="${id}" aria-current="${U.mode===id?'page':'false'}"`,U.mode===id?'active':'')).join('')}</nav></div>`;}

function mainView(){if(RUN.started(G))return reasoningPage();if(U.mode==='visit')return visitPage();if(U.mode==='talk'||U.mode==='inspect')return scene();if(U.mode==='evidence')return evidencePage();if(U.mode==='people')return peoplePage();if(U.mode==='case')return casePage();return mapPage();}
function roomPeople(){if(G.dialogue?.ref==='intro'||M.dialogueData(G)?.opening)return ['minjae','taeo','seoa','jisu'];return Object.keys(D.people).filter(p=>M.locationOf(G,p)===G.location);}

function getActor(){
 if(G.dialogue?.remote)return null;
 if(G.dialogue?.kind==='topic')return M.topic(G.dialogue.ref).npc;
 if(G.dialogue?.kind==='scene'){
  const ref=G.dialogue.ref;if(ref.startsWith('conclusion'))return 'jisu';
  const w=M.currentLine(G)?.who;if(D.people[w])return w;
  const prior=M.dialogueData(G).lines.slice(0,G.dialogue.index).reverse().find(l=>D.people[l.who]);return prior?.who||null;
 }
 return roomPeople().includes(U.npc)?U.npc:null;
}

function legacyScene(){
 const inspect=U.mode==='inspect',actor=getActor(),npc=actor&&G.dialogue?.kind==='scene'?actor:U.npc,q=M.questions(G,npc),active=G.dialogue?.kind==='topic'?G.dialogue.ref:null,dialogueOn=G.dialogue&&!G.dialogue.remote,room=roomPeople();
 const idle=!dialogueOn,observation=idle||M.currentLine(G)?.who==='n';
 const dialogue=`<section class="dialogue ${idle?'idle-dialogue':''}" data-line-kind="${observation?'observation':'speech'}" aria-label="${observation?'정해온의 관찰':'대사창'}">${img('dialogue','frame-image','')}<div class="dialogue-heading"><span class="speaker" id="speaker">${idle?'정해온':esc(eventName(M.currentLine(G)?.who))}</span></div><${idle?'div':'button'} class="line-button ${idle?'idle':''}" ${idle?'':'type="button" data-act="advance"'} id="lineButton" ${idle?'':'aria-label="대사 표시 또는 다음 문장"'}><span id="lineText" aria-hidden="true"></span><span class="sr-only" id="lineAccessible" aria-live="polite"></span><span class="next-mark" id="nextMark" hidden>▸</span></${idle?'div':'button'}><div class="dialogue-status"><span id="lineStatus" ${!C.controlHints?'hidden':''}></span><span class="reading-track" aria-hidden="true" ${idle?'hidden':''}><i id="lineProgress"></i></span></div></section>`;
 return `<section data-place="${G.location}" class="scene ${inspect?'inspect':'talk'} ${C.hotspots?'show-hotspots':''}"><div class="world" id="world">${img(D.places[G.location].bg,'bg','')}${inspect?D.places[G.location].hotspots.filter(h=>M.available(G,h)).map(h=>`<button class="hotspot ${G.observed.includes(h.id)?'seen':''}" data-act="inspect" data-id="${h.id}" id="hot-${h.id}" aria-label="${esc(h.name)}${G.observed.includes(h.id)?' · 확인함':''}" ${G.dialogue?'disabled':''} style="left:${h.x-h.w/2}%;top:${h.y-h.h/2}%;width:${h.w}%;height:${h.h}%"><span class="target-name">${esc(h.name)}</span></button>`).join(''):''}</div>
 ${atmosphereMarkup()}<div class="scene-layout"><div class="scene-toolbar"><div class="objective">${U.goal&&C.hints?`<span class="objective-label">확인할 일</span><p>${esc(UI_COPY.objective(M.objective(G)))}</p>`:''}${btn(U.goal?'접기':'목표 보기','goal','','plain')}</div>${inspect?`<div class="inspect-tools">${btn(C.hotspots?'위치 표시 켜짐':'위치 표시 꺼짐','hotspot-toggle','aria-pressed="'+C.hotspots+'"')}${room.map(p=>btn(esc(D.people[p].name)+'와 대화','person',`data-id="${p}"`)).join('')}</div>`:`<div id="sceneCue" class="scene-cue" aria-hidden="true"><span class="cue-kicker">${G.phase==='night'?'현장 기록':'후속 면담'}</span><span>${esc(D.places[G.location].name)}</span></div>${btn('인물 목록','rail-toggle','aria-expanded="'+U.rail+'"','rail-toggle')}`}</div>
 ${inspect?'<div class="inspection-space" aria-hidden="true"></div>':`<div class="conversation-stage"><aside class="rail ${U.rail?'expanded':''}" aria-label="현재 장소 인물" data-scroll="rail"><h2>이곳에 있는 사람</h2>${room.map(p=>{const person=D.people[p],newq=M.questions(G,p).some(t=>!G.topicsRead.includes(t.id));return `<button class="person-button ${npc===p?'selected':''}" data-act="person" data-id="${p}" aria-pressed="${npc===p}" id="person-${p}" ${G.dialogue?.kind==='scene'?'disabled':''}>${img(person.asset+'_portrait','portrait',person.name)}<span class="person-meta"><span class="p-name">${person.name}</span><span class="p-role">${esc(UI_COPY.role(person))}</span><span class="newmark">${newq?'＋ 새 대화':'✓ 읽음'}</span></span></button>`}).join('')}</aside><div class="actor-stage" aria-label="대화 상대">${actor?actorVisual(actor):''}</div><aside class="questions" aria-label="질문 목록"><div class="question-heading"><h2>질문</h2>${btn('도움말','help','aria-label="대화 조작 도움말"','plain small')}</div><div class="question-list" data-scroll="questions-${npc}">${q.map(t=>`<button id="q-${t.id}" class="question ${G.topicsRead.includes(t.id)?'read':'unread'} ${active===t.id?'current':''}" data-act="topic" data-id="${t.id}" ${G.dialogue?.kind==='scene'?'disabled':''}>${esc(t.label)}<span class="qstate">${active===t.id?'대화 중':G.topicsRead.includes(t.id)?'✓ 읽음':'＋ 새 질문'}</span></button>`).join('')||'<p class="help-text">지금 더 물을 말은 없다.</p>'}</div></aside></div>`}
 ${dialogueOn||!inspect?dialogue:`<div class="inspect-description">${esc(D.places[G.location].description)}</div>`}</div></section>`;
}

// The guide only selects an action. Progress changes still go through MODEL.
function guided(){return G?.guideVersion===1;}
function guideLabel(t){
 if(!t)return '사건 정리';
 if(t.kind==='evidence'&&t.id!=='lab')return '원문 다시 읽기';
 if(t.kind==='reasoning')return G.reasoning?.attempt?'추리 이어하기':'추리 시작';
 if(t.kind==='resume')return t.remote?'통화 이어 듣기':G.dialogue?.awaitingChoice?'질문 선택으로':'이야기 이어 보기';
 if(t.loc&&t.loc!==G.location&&!t.remote)return D.places[t.loc].name+'로 이동';
 return ({topic:t.remote?D.people[t.person].name+'에게 전화':D.people[t.person]?.name+'에게 묻기',inspect:'물건 살펴보기',proof:'자료 비교하기',evidence:'검사 결과 읽기',followup:'검사 의뢰하기',final:'마지막 면담 시작',delivery:'전달 방식 보기',preview:'확인본 보기',consent:'답변 확인',ending:'이야기 마무리',complete:'사건 기록 보기'})[t.kind]||'사건 정리';
}
function guideBar(){
 if(RUN.isLoop(G)&&G.reasoning.briefed&&!M.dialogueData(G)?.opening&&!G.caseClosed&&!G.interview)return phaseBar();
 const t=GUIDE.next(G);if(!t)return '';const active=t.kind==='resume',away=!isFieldMode(U.mode);
 if(!C.hints&&!active)return `<section class="guide-bar collapsed-guide" aria-label="접어 둔 다음 행동 안내"><div class="guide-actions">${away?btn('← 돌아가기','return-field','id="returnField"','secondary'):''}${btn('다음에 할 일','context-help','id="contextHelp"','secondary')}${btn('사건 요약','recap','id="recapButton"','plain')}</div></section>`;
 const title=active?(M.dialogueData(G)?.section||GUIDE.chapters[t.ch]||'현재의 이야기'):t.kind==='topic'?M.topic(t.id).label:t.title;
 const where=t.person?D.people[t.person].name+' · '+(t.remote?'전화':D.places[t.loc]?.name||''):t.chapter;
 return `<section class="guide-bar ${active?'reading-guide':''}" aria-label="현재 할 일"><div class="guide-copy"><span class="guide-stage">${active?'듣는 이야기':esc(where)}</span><h2>${esc(title)}</h2>${!active&&U.goal!==false?`<p>${esc(t.why)}</p>`:''}</div><div class="guide-actions">${away?btn('← 돌아가기','return-field','id="returnField"','secondary'):''}${(!active||away||t.remote)?btn(guideLabel(t),'guide-next','id="guideNext"','primary'):''}${btn('사건 요약','recap','id="recapButton"','secondary')}${!active?btn('막혔나요?','context-help','id="contextHelp"','plain small'):''}</div></section>`;
}
function guidedToolbar(){return `<div class="scene-toolbar friendly-toolbar">${btn('이 장소의 사람들','visit-place','id="placePeople"','secondary')}${U.mode==='inspect'?btn(C.hotspots?'조사 표시 켜짐':'조사 표시 꺼짐','hotspot-toggle',`aria-pressed="${C.hotspots}"`):btn('주변 조사','mode','data-mode="inspect"')}${btn('조작 안내','help','','plain small')}</div>`;}
function openingPanel(){const section=M.dialogueData(G)?.section||'사건 접수';return `<aside class="opening-brief"><span class="guide-stage">10월 18일 · 모서리 극장</span><h2>접수된 내용</h2><div class="brief-victim">${img('doyun_portrait','portrait','서도윤')}<div><strong>서도윤</strong><span>극장 대표 · 피해자</span></div></div><p>마지막 영업일 밤, 영사실에서 대표가 숨진 채 발견됐다.</p><dl><dt>나는</dt><dd>사건을 맡은 형사 정해온</dd><dt>먼저 알아낼 것</dt><dd>누가 마지막으로 대표와 대화했는가.</dd></dl><p class="help-text">아래 대사를 읽고 ‘다음’을 누르세요.</p></aside>`;}
function guidedDialogue(){
 const on=G.dialogue&&!G.dialogue.remote,idle=!on,obs=idle||M.currentLine(G)?.who==='n',waiting=!!G.dialogue?.awaitingChoice;
 return `<section class="dialogue ${idle?'idle-dialogue':''}" data-line-kind="${obs?'observation':'speech'}" aria-label="${obs?'정해온의 관찰':'대사창'}">${img('dialogue','frame-image','')}<div class="dialogue-heading"><span class="speaker" id="speaker">${idle?'정해온':esc(eventName(M.currentLine(G)?.who))}</span>${on?`<div class="inline-dialogue-controls">${btn(auto?'자동 켜짐':'자동','auto',`aria-pressed="${auto}" aria-label="대사 자동 진행"`,'small',waiting)}${btn(waiting?'질문 선택 대기':'다음 →','advance','id="explicitNext"','small',waiting)}</div>`:''}</div><${idle?'div':'button'} class="line-button ${idle?'idle':''}" ${idle?'':'type="button" data-act="advance" aria-label="대사 표시 또는 다음 문장"'} id="lineButton"><span id="lineText" aria-hidden="true"></span><span id="lineAccessible" class="sr-only" aria-live="polite"></span><span id="nextMark" class="next-mark" hidden>▸</span></${idle?'div':'button'}><div class="dialogue-status"><span id="lineStatus" ${!C.controlHints?'hidden':''}></span><span class="reading-track" aria-hidden="true" ${idle?'hidden':''}><i id="lineProgress"></i></span></div></section>`;
}
function questionButton(t,active){
 const resume=M.resumePosition(G,t.id),label=active===t.id?'듣는 중':resume?'이어서 듣기':G.topicsRead.includes(t.id)?'✓ 다시 읽기':'질문하기';
 return `<button id="q-${t.id}" class="question ${G.topicsRead.includes(t.id)?'read':'unread'} ${active===t.id?'current':''}" data-act="topic" data-id="${t.id}" aria-pressed="${active===t.id}">${esc(t.label)}<span class="qstate">${label}</span></button>`;
}
function scene(){
 if(!guided()&&!M.dialogueData(G)?.interview)return legacyScene();
 const inspect=U.mode==='inspect',actor=getActor(),npc=G.dialogue?.kind==='topic'?M.topic(G.dialogue.ref).npc:U.npc,opening=!!M.dialogueData(G)?.opening,choices=M.pendingChoices(G),q=GUIDE.questions(G,npc),active=G.dialogue?.kind==='topic'?G.dialogue.ref:null,room=roomPeople();
 const recommended=GUIDE.next(G);
 const people=`<aside class="rail ${U.rail?'expanded':''}" data-scroll="rail" aria-label="대화할 사람"><h2>대화할 사람</h2>${room.map(p=>`<button id="person-${p}" data-act="person" data-id="${p}" class="person-button ${npc===p?'selected':''}" ${G.dialogue?.kind==='scene'?'disabled':''}>${img(D.people[p].asset+'_portrait','portrait',D.people[p].name)}<span class="person-meta"><span class="p-name">${D.people[p].name}</span><span class="p-role">${esc(UI_COPY.role(D.people[p]))}</span><span class="newmark">${active&&npc===p?'듣는 중':PLAYER.peopleStatus(G,p)}</span></span></button>`).join('')}</aside>`;
 let questionPanel;
 if(opening)questionPanel=openingPanel();
 else if(M.dialogueData(G)?.interview)questionPanel=interviewAside(choices);
 else questionPanel=`<aside class="questions" aria-label="질문 목록"><div class="question-heading"><h2>${esc(D.people[npc]?.name||'상대')}에게 묻기</h2></div><div class="question-list" data-scroll="questions-${npc}">${q.main.map(t=>questionButton(t,active)).join('')||`<div class="question-complete"><p>여기서 먼저 확인할 이야기는 들었다.</p>${btn('다음 할 일 보기','guide-next','','secondary')}</div>`}${q.extra.length?`<details class="extra-questions" ${U.moreQuestions?.[npc]?'open':''} data-npc="${npc}"><summary>선택 이야기 · 지난 질문</summary>${q.extra.map(t=>questionButton(t,active)).join('')}</details>`:''}</div></aside>`;
 return `<section class="scene ${inspect?'inspect':'talk'} guided-scene ${opening?'opening-scene':''} ${C.hotspots?'show-hotspots':''}" data-place="${G.location}"><div class="world" id="world">${img(D.places[G.location].bg,'bg','')}${inspect?D.places[G.location].hotspots.filter(h=>M.available(G,h)).map(h=>`<button class="hotspot ${G.observed.includes(h.id)?'seen':''} ${recommended?.id===h.id?'recommended-hotspot':''}" id="hot-${h.id}" data-act="inspect" data-id="${h.id}" aria-label="${esc(h.name)}" ${G.dialogue?'disabled':''} style="left:${h.x-h.w/2}%;top:${h.y-h.h/2}%;width:${h.w}%;height:${h.h}%"><span class="target-name">${esc(h.name)}</span></button>`).join(''):''}</div>${atmosphereMarkup()}<div class="scene-layout">${opening?'<div class="scene-toolbar"></div>':guidedToolbar()}${inspect?`<div class="inspection-space"></div>`:`<div class="conversation-stage">${opening?'<aside class="rail opening-role"><span>플레이어</span><h2>정해온</h2><p>사건을 맡은 형사</p></aside>':people}<div class="actor-stage" aria-label="대화 상대">${actor?actorVisual(actor):''}</div>${questionPanel}</div>`}${G.dialogue||!inspect?guidedDialogue():`<section class="investigation-tray" aria-label="조사할 물건"><span>눈앞의 물건을 누르거나 여기서 선택하세요.</span><div>${D.places[G.location].hotspots.filter(h=>M.available(G,h)).map(h=>btn((G.observed.includes(h.id)?'✓ ':'')+esc(h.name),'inspect',`data-id="${h.id}"`)).join('')}</div></section>`}</div></section>`;
}
function visitPage(){const room=roomPeople(),p=D.places[G.location];return `<section class="place-entry"><div class="world" id="world">${img(p.bg,'bg','')}</div><div class="entry-scrim"></div><div class="entry-content"><span class="guide-stage">${G.phase==='night'?'10월 18일 밤':'며칠 뒤'}</span><h1>${p.name}</h1><p class="entry-description">${esc(p.description)}</p><h2>${room.length?'이곳에서 만날 사람':'지금은 사람이 없다'}</h2><div class="entry-people">${room.map(id=>`<button class="entry-person" data-act="person" data-id="${id}" id="entry-${id}">${img(D.people[id].asset+'_portrait','portrait',D.people[id].name)}<span><strong>${D.people[id].name}</strong><small>${esc(UI_COPY.role(D.people[id]))}</small><b>${PLAYER.peopleStatus(G,id)} →</b></span></button>`).join('')}</div>${RUN.isLoop(G)&&!G.reasoning.introSeen?loopIntro():''}<div class="entry-actions">${btn('주변을 둘러본다','mode','data-mode="inspect"','secondary')}${btn('다른 장소','mode','data-mode="map"')}</div></div></section>`;}
function recapContent(){const items=[['지금 무슨 사건인가','폐관일 밤, 모서리 극장 대표 서도윤이 영사실에서 숨진 채 발견됐다. 머리 옆에는 금속 손잡이가 있었다.'],['나는 왜 왔는가','나는 형사 정해온이다. 서도윤이 숨진 경위를 밝히고, 그를 마지막으로 만난 사람들의 행동을 확인하러 왔다.'],['왜 사람들이 남아 있었는가','대표와 회계 담당은 직원 정산을 확인하고, 영사기사와 인수 기사는 장비를 넘기고 있었다. 편집자는 직원 영상을 함께 보려고 남았다.']];
 if(G.evidence.includes('original'))items.push(['마지막으로 살아 있던 근거','인수 영상에는 20시 57분 16초, 새 렌즈 질문에 서도윤이 대답한 내용이 남아 있다.']);
 if(G.solved.includes('payments'))items.push(['정산에서 드러난 일','직원들은 각 600만 원을 덜 받았고, 부족액 합계 1,800만 원은 한지수 계좌로 갔다.']);
 if(G.solved.includes('signatures'))items.push(['서명에서 드러난 일','촬영 동의서의 서명이 직원들의 허락 없이 전액 수령 확인서에 사용됐다.']);
 if(G.evidence.includes('ledger'))items.push([G.viewed.includes('lab')?'확보한 장부와 서류':'다음에 확인할 물건',G.viewed.includes('lab')?'한지수의 가방에서 장부와 빠진 정산 서류를 확보했다. 장부와 현장의 연결은 검사 결과와 함께 확인했다.':'한지수의 가방에서 장부와 빠진 정산 서류를 확보했다. 현장의 천 조각과 연결되는지 확인해야 한다.']);
 if(G.viewed.includes('lab'))items.push(['검사로 확인한 일','현장 천 조각이 장부의 모서리와 이어지고 장부 안쪽 얼룩은 서도윤의 혈액으로 확인됐다.']);
 if(G.caseClosed)items.push(['마지막 면담','한지수는 방문, 공격, 도움을 부르지 않은 일, 서류 회수를 인정했다. 구체적인 이유와 전화기를 잡았다는 내용은 본인의 후속 진술이다.']);
 return `<div class="recap-grid">${items.map(([h,t])=>`<article><h3>${h}</h3><p>${t}</p></article>`).join('')}</div>`;
}
function casePage(){if(RUN.isLoop(G)&&!G.caseClosed)return U.advancedCase?legacyCasePage():loopCasePage();if(!guided())return legacyCasePage();if(U.caseTab==='timeline'||U.caseTab==='notebook'||U.advancedCase)return legacyCasePage().replace('<div class="workspace-head">','<div class="workspace-head">'+btn('간단한 사건 요약으로','simple-case','','secondary'));const done=GUIDE.coreProofs.filter(id=>G.solved.includes(id));return `<section class="workspace friendly-case" data-scroll="casePage"><div class="workspace-head"><h2>사건 기록</h2>${btn('시간표 · 개인 수첩 · 추가 대조','advanced-case','','plain')}</div>${G.completed?`<div class="end-note">${esc(UI_COPY.ending(G))}</div>${btn('시작 화면','title','','primary')}`:''}${recapContent()}<details class="past-judgments" ${U.pastJudgments?'open':''}><summary>마친 추리 다시 보기${done.length?' · '+done.length+'건':''}</summary>${done.map(id=>`<article class="case-task"><h3>${D.deductions.find(d=>d.id===id).name}</h3><p>${D.deductions.find(d=>d.id===id).result}</p>${btn('근거 다시 보기','deduction',`data-id="${id}"`)}</article>`).join('')}</details>${G.caseClosed&&!G.completed?deliveryPanel():''}</section>`;}
const proofPools={broadcast:['recording','schedule','director_order','arrival','scene'],lens:['packing','original','recording','scene'],payments:['payroll','bank','workers','loan','packing'],signatures:['receipts','consents','signature_file','workers','loan'],visit:['ledger','lab','original','first_response','message','prior_photo','loan','custody']};
function guidedProofModal(){
 if(aux.data.session)return phaseProofModal();
 if(aux.data.result?.ok){const result=acceptedProofModal();if(result)return result;}
 const p=aux.data,d=D.deductions.find(x=>x.id===p.id),term=(p.search||'').trim();
 const pool=[...new Set([...(proofPools[d.id]||d.need),...p.proofs])].filter(id=>G.evidence.includes(id));
 const source=p.allSources?G.evidence:pool;
 const ids=source.filter(id=>{const e=D.evidence[id];return ((p.filter||'all')==='all'||p.filter==='pins'&&G.bookmarks.includes(id)||e.type===p.filter)&&(!term||(e.name+' '+e.facts.join(' ')).includes(term));});
 const types=[...new Set(source.map(id=>D.evidence[id].type))];
 return templateModal(d.name,`<p class="proof-question">${esc(d.question)}</p><div class="proof-ready" role="status">${esc(PLAYER.proofStatus(p))}</div><div class="friendly-proof"><section class="proof-library"><div class="proof-tools"><label class="sr-only" for="proofSearch">근거 검색</label><input id="proofSearch" maxlength="200" data-ui-search="proof" value="${esc(p.search||'')}" placeholder="자료 제목·내용 검색"><select id="proofFilter" data-ui-filter="proof" aria-label="근거 분류">${[['all','모든 종류'],['pins','표시한 자료'],...types.map(t=>[t,t])].map(([id,label])=>`<option value="${id}" ${p.filter===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="source-scope">${btn(p.allSources?'이 질문의 자료로 좁히기':'다른 확보 자료도 보기','proof-scope','','plain small')}${term||p.filter&&p.filter!=='all'?btn('검색 지우기','proof-filter-reset','','small'):''}</div><section class="friendly-sources" data-scroll="proof-sources-${p.id}" aria-label="비교할 자료" tabindex="0">${ids.map(id=>`<article class="friendly-source"><div class="row"><strong>${esc(D.evidence[id].name)}</strong>${btn(p.proofs.includes(id)?'✓ 선택됨':'근거로 선택','proof-evidence',`data-id="${id}" aria-pressed="${p.proofs.includes(id)}"`,p.proofs.includes(id)?'selected small':'small')}</div><details data-source="${id}" ${p.sourceOpen?.[id]?'open':''}><summary>자료 읽기</summary>${documentMarkup(D.evidence[id])}${btn('크게 열기','evidence',`data-id="${id}"`,'small')}</details></article>`).join('')||'<p class="empty">이 조건에 맞는 자료가 없습니다. 검색을 지우거나 다른 확보 자료를 보세요.</p>'}</section></section><section class="proof-decision"><section class="selected-sources" aria-label="선택한 근거"><h3>선택한 근거</h3>${p.proofs.length?`<div class="source-chips">${p.proofs.map(id=>`<div class="source-chip"><span>${esc(D.evidence[id].name)}</span>${btn('읽기','evidence',`data-id="${id}" aria-label="${esc(D.evidence[id].name)} 원문 열기"`,'small')}${btn('빼기','proof-remove',`data-id="${id}" aria-label="${esc(D.evidence[id].name)} 선택 해제"`,'small')}</div>`).join('')}</div>`:'<p class="help-text">읽은 자료에서 근거로 쓸 것을 고르세요.</p>'}</section><section class="proof-claims"><h3>내 판단</h3>${d.claims.map(c=>btn(esc(c.text),'claim',`data-id="${c.id}" aria-pressed="${p.claim===c.id}"`,p.claim===c.id?'selected':'')).join('')}</section>${p.result?`<div class="feedback ${p.result.ok?'success':''}" role="status">${esc(p.result.message)}</div>`:''}</section></div>`,`${btn('도움 받기','context-help','','secondary')}${btn('나중에 이어하기','close-aux')}${p.result?.ok?btn('다음 조사로','proof-next','','primary'):btn('이 근거로 판단','submit-proof','','primary',!p.claim||!p.proofs.length)}`,'wide');
}
function guideNext(){const t=GUIDE.next(G);if(!t)return;if(t.kind==='resume'){if(t.remote)openAux('phone',{npc:M.topic(G.dialogue.ref).npc});else {U.mode='talk';render();}return;}
 if(t.loc&&t.loc!==G.location&&!t.remote){switchPlace(t.loc);return;}
 switch(t.kind){
 case 'topic': rememberField();startTopic(t.id);break;
 case 'inspect': U.mode='inspect';M.inspect(G,t.id);type.key=null;pauseAuto();persist();render();break;
 case 'proof':actions.deduction({dataset:{id:t.id}});break;
 case 'reasoning':actions['reasoning-start']();break;
 case 'evidence':openEvidence(t.id);break;
 case 'followup':actions.followup();break;case 'final':actions.final();break;
 case 'delivery':U.mode='people';render();requestAnimationFrame(()=>$('.delivery-panel')?.scrollIntoView({block:'start'}));break;
 case 'preview':actions.preview({dataset:{id:t.id}});break;case 'consent':actions.consent({dataset:{id:t.id}});break;
 case 'ending':actions.ending();break;default:U.caseTab='overview';setMode('case');
 }
}

function pageHead(kicker,title,desc,extra=''){return `<div class="workspace-head"><div><h2>${title}</h2>${desc?`<p>${desc}</p>`:''}</div>${extra}</div>`;}
function evidencePage(){
 const term=(U.evidenceSearch||'').trim(),filter=U.evidenceFilter||'all',types=[...new Set(G.evidence.map(id=>D.evidence[id].type))],unread=PLAYER.unread(G);
 const list=G.evidence.filter(id=>(filter==='all'||filter==='new'&&!G.viewed.includes(id)||filter==='pins'&&G.bookmarks.includes(id)||D.evidence[id].type===filter)&&(!term||(D.evidence[id].name+' '+D.evidence[id].facts.join(' ')).includes(term)));
 if((U.evidenceOrder||'recent')==='recent')list.reverse();
 return `<section class="workspace" data-scroll="evidencePage">${pageHead('ARCHIVE','확보한 자료','')}<div class="archive-tools"><label class="sr-only" for="evidenceSearch">자료 검색</label><input id="evidenceSearch" data-ui-search="evidence" value="${esc(term)}" placeholder="제목 또는 내용 검색"><select id="evidenceFilter" aria-label="자료 분류" data-ui-filter="evidence">${[['all','전체'],['new','새 자료'+(unread.length?' · '+unread.length:'')],['pins','표시한 자료'],...types.map(t=>[t,t])].map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label}</option>`).join('')}</select><select id="evidenceOrder" aria-label="자료 정렬"><option value="recent" ${U.evidenceOrder!=='oldest'?'selected':''}>최근 얻은 순</option><option value="oldest" ${U.evidenceOrder==='oldest'?'selected':''}>처음 얻은 순</option></select>${term||filter!=='all'?btn('전체 자료로','clear-filter'):''}</div><div class="card-grid">${list.map(id=>{const e=D.evidence[id];return `<button class="evidence-card" id="ev-${id}" data-act="evidence" data-id="${id}"><span class="file-number">${G.bookmarks.includes(id)?'◆ ':''}${e.type}</span><strong>${esc(e.name)}</strong><span class="place">${esc(e.place)}</span><span class="tag ${G.viewed.includes(id)?'':'new'}">${G.viewed.includes(id)?'다시 읽기':'＋ 아직 읽지 않은 자료'}</span></button>`}).join('')||`<div class="empty"><p>${filter==='new'&&!term?'새로 얻은 자료를 모두 읽었습니다.':G.evidence.length?'찾는 자료가 없습니다. 검색어나 분류를 바꿔보세요.':'아직 확보한 자료가 없습니다.'}</p>${G.evidence.length?btn('전체 자료 보기','clear-filter'):''}${btn('조사로 돌아가기','return-field')}</div>`}</div></section>`;
}

function peoplePage(){const visible=Object.keys(D.people).filter(p=>!D.people[p].contact||G.evidence.includes('payroll'));return `<section class="workspace" data-scroll="peoplePage">${pageHead('PEOPLE','인물과 진술','')}<div class="people-grid">${visible.map(id=>{const p=D.people[id],stat=G.statements.filter(x=>x.npc===id),loc=M.locationOf(G,id);return `<article class="profile-card"><div class="row">${img(p.asset+'_portrait','portrait',p.name)}<div><h3>${p.name}</h3><div class="muted">${esc(UI_COPY.role(p))}</div></div></div><p><span class="bio-label">확인한 정보</span><br>${esc(p.bio)}</p>${stat.length?btn(`진술 ${stat.length}건 읽기`,'statements',`data-id="${id}" id="statements-${id}"`):''}${p.contact&&G.phase==='night'?btn('전화로 확인','phone',`data-id="${id}" id="phone-${id}"`,'primary',!G.evidence.includes('bank')):loc?btn(G.location===loc?'이곳에서 대화하기':`${D.places[loc].name}로 이동해 대화`,'go-talk',`data-id="${id}"`):'<span class="tag">기록 열람</span>'}</article>`}).join('')}</div>${G.caseClosed?deliveryPanel():''}</section>`;}
function deliveryPanel(){const plan=G.delivery.plan,done=G.completed;return `<section class="delivery-panel"><span class="eyebrow">AFTER THE CASE</span><h2>영상은 누구에게 돌아가는가</h2><p>서아는 직원들에게 각자의 영상이 어떻게 전달되기를 바라는지 물었다.</p>${!plan?`<div class="delivery-options">${btn('<strong>각자의 파일부터 반환</strong><span>다른 사람의 인터뷰를 포함하지 않고 본인 부분을 돌려준다.</span>','delivery-plan','data-id="private"')}${btn('<strong>직원 비공개 상영안 제안</strong><span>각자 확인한 장면을 직원들끼리만 본다. 얼굴 처리와 상영 범위는 본인에게 먼저 묻는다.</span>','delivery-plan','data-id="screening"')}</div>`:`<p class="tag">${plan==='screening'?'직원끼리 한 번 보는 비공개 상영안':'개인 인터뷰 반환안'}</p><div class="delivery-grid">${Object.keys(D.endConsent).map(id=>`<article><h3>${D.people[id].name}</h3>${plan==='screening'?btn(G.delivery.previews.includes(id)?'✓ 확인본 다시 읽기':'본인 확인본과 요청 확인','preview',`data-id="${id}"`,'secondary'):''}${btn(G.consents[id]?'✓ 기록한 답변':'답변을 확인하고 기록','consent',`data-id="${id}" id="consent-${id}"`,'primary',plan==='screening'&&!G.delivery.previews.includes(id))}${G.consents[id]?`<p>${esc(G.consents[id])}</p>`:''}</article>`).join('')}</div><div class="row wrap">${btn(done?'전달 완료':plan==='screening'?'확인한 범위로 작은 상영회를 연다':'각자의 인터뷰를 돌려준다','ending','','primary',!M.endingReady(G))}${!done?btn('전달안 다시 작성','delivery-reset'):''}</div>`}</section>`;}

function timeline(){return UI_COPY.timeline(G).map(e=>`<div class="timeline-item" data-time-stage="${e.stage}"><strong>${e.time}</strong> <span class="tag">${e.source}</span><p>${e.text}</p>${btn('근거 열기','evidence',`data-id="${e.id}"`)}</div>`).join('');}
function legacyCasePage(){const tasks=M.availableDeductions(G),tab=U.caseTab||'overview';return `<section class="workspace" data-scroll="casePage">${pageHead('CASE NOTES','사건 정리','')}<div class="case-tabs" role="tablist" aria-label="사건 기록 종류">${[['overview','대조할 일'],['timeline','시간과 진술'],['notebook','개인 수첩']].map(([id,label])=>btn(label,'case-tab',`data-id="${id}" role="tab" id="case-tab-${id}" aria-controls="casePanel" tabindex="${tab===id?0:-1}" aria-selected="${tab===id}"`,tab===id?'selected':'')).join('')}</div><div id="casePanel" role="tabpanel" aria-labelledby="case-tab-${tab}" tabindex="0">${G.completed?`<div class="end-note">${G.ending==='A'?'작은 상영회':'각자의 인터뷰'}<br><small>${esc(UI_COPY.ending(G))}</small></div><div class="end-actions">${btn('진행 파일 보관','export-save')}${btn('시작 화면','title')}</div>`:''}${tab==='notebook'?`<section class="notebook"><h3>내가 적는 수첩</h3><textarea id="personalNotes" maxlength="12000" aria-label="개인 메모" placeholder="메모">${esc(G.notes)}</textarea><p id="notesStatus" class="help-text">${G.notes.length} / 12,000자</p><h3>표시한 자료</h3><div class="stack">${G.bookmarks.map(id=>btn(esc(D.evidence[id].name),'evidence',`data-id="${id}"`)).join('')||'<p class="help-text">표시한 자료가 없다.</p>'}</div></section>`:tab==='timeline'?`<div class="case-layout"><section><h3>시간대별 확인</h3><div class="timeline">${timeline()}</div></section><section><h3>듣고 확인한 진술</h3>${G.statements.map(s=>`<article class="statement-card"><span class="tag">${D.people[s.npc].name}의 진술</span><p>${esc(s.text)}</p><div class="help-text">${s.location==='phone'?'전화':D.places[s.location]?.name} · ${s.phase==='night'?'사건 당일':'후속 면담'}</div>${btn('해당 대화 읽기','topic-log',`data-id="${s.id}"`)}</article>`).join('')||'<p class="empty">아직 확인한 진술이 없다.</p>'}</section></div>`:`${C.hints&&!G.completed?`<details class="next-tasks"><summary>수사 메모</summary>${(guided()?[{text:GUIDE.next(G).why}]:M.nextTasks(G)).map(t=>`<p>${esc(t.text)}</p>`).join('')}</details>`:''}<div class="case-layout"><section><h3>직접 대조하기</h3>${M.activities(G).map(a=>`<article class="case-task"><span class="tag ${G.activitiesDone.includes(a.id)?'checked':'new'}">${G.activitiesDone.includes(a.id)?'✓ 대조 완료':'직접 확인'}</span><h3>${a.name}</h3><p>${a.description}</p>${btn(G.activitiesDone.includes(a.id)?'대조 내용 다시 보기':'대조 작업 시작','activity',`data-id="${a.id}"`,'secondary')}</article>`).join('')||'<div class="empty">지금 대조할 자료가 없다.</div>'}</section><section><h3>근거로 판단하기</h3>${tasks.map(d=>`<article class="case-task"><span class="tag ${G.solved.includes(d.id)?'checked':'new'}">${G.solved.includes(d.id)?'✓ 판단 기록':'비교 가능'}</span><h3>${d.name}</h3><p>${esc(G.solved.includes(d.id)?d.result:d.question)}</p>${btn(G.solved.includes(d.id)?'근거 다시 대조':'자료 비교하기','deduction',`data-id="${d.id}" id="case-${d.id}"`,'primary')}</article>`).join('')||'<div class="empty">아직 정리할 근거가 부족하다.</div>'}</section></div>`}${M.labReady(G)?`<article class="case-task"><h3>그날 밤의 기록을 마친다</h3><p>확보한 장부와 천 조각을 검사 의뢰서에 함께 적었다.</p>${btn('검사를 의뢰한다','followup','id="begin-followup"','primary')}</article>`:''}${M.finalReady(G)?`<article class="case-task"><h3>한지수의 행동을 다시 묻는다</h3>${btn('마지막 재면담 시작','final','id="begin-final"','primary')}</article>`:''}${G.caseClosed&&!G.completed?`<article class="case-task"><h3>남은 사람들</h3>${btn('영상 전달과 의사 확인','mode','data-mode="people"','primary')}</article>`:''}</div></section>`;}

function mapPage(){return `<section class="workspace" data-scroll="mapPage">${pageHead('THEATER MAP','장소 이동',G.phase==='night'?'현재 면담 장소':'후속 면담 장소')}<div class="map-grid">${Object.entries(D.places).map(([id,p])=>`<button class="map-card" data-act="move" data-id="${id}" id="map-${id}" ${G.location===id?'aria-current="location"':''}>${img(p.bg,'',p.name)}${G.location===id?'<span class="current-location">현재 위치</span>':''}<div><h3>${p.name}</h3><p>${Object.keys(D.people).filter(k=>M.locationOf(G,k)===id).map(k=>D.people[k].name).join(' · ')||'현장 기록 확인'}</p><small>${G.visited.includes(id)?'방문한 장소':'이동 가능'}</small></div></button>`).join('')}</div></section>`;}

function render(){
 const scroll=captureScroll(),focus=document.activeElement?.id,oldActor=$('.actor-visual'),oldBg=$('#world .bg');
 U.scrolls={...(U.scrolls||{}),...scroll};clearTimeout(typeTimer);
 app.innerHTML=G?shell():title();
 // Retain identical decoded raster nodes rather than blinking the character every line.
 const newActor=$('.actor-visual'),newBg=$('#world .bg');
 if(oldActor&&newActor&&oldActor.dataset.person===newActor.dataset.person)newActor.replaceWith(oldActor);
 if(oldBg&&newBg&&oldBg.dataset.asset===newBg.dataset.asset)newBg.replaceWith(oldBg);
 ($('#notificationSlot')||document.body).appendChild(notifications);app.inert=!!aux;
 applySettings();resizeWorld();restoreScroll(U.scrolls);
 if(!aux&&focus)document.getElementById(focus)?.focus({preventScroll:true});
 if(G&&!aux)paintLine();syncStorageNotice();syncLayoutMetrics();P.render(visualContext());
}

function resizeWorld(){const world=$('#world');if(!world)return;const parent=world.parentElement.getBoundingClientRect(),picture=world.querySelector('img'),ratio=picture?.naturalWidth&&picture.naturalHeight?picture.naturalWidth/picture.naturalHeight:1672/941;let w=parent.width,h=w/ratio;if(h>parent.height){h=parent.height;w=h*ratio;}Object.assign(world.style,{width:w+'px',height:h+'px',left:(parent.width-w)/2+'px',top:(parent.height-h)/2+'px'});syncLayoutMetrics();}

let textRun=null;
function paintLine(){
 clearTimeout(typeTimer);const text=$('#lineText');if(!text)return;
 if(!G.dialogue||G.dialogue.remote){
  const message=UI_COPY.idle(G,roomPeople().includes(U.npc)?U.npc:null);
  text.textContent=message;$('#lineAccessible').textContent=message;syncActor();return;
 }
 const l=M.currentLine(G);if(!l)return;const key=M.lineId(G),chars=Array.from(l.text);
 if(type.key!==key){type={key,shown:C.instant?chars.length:0,full:l.text,wasRead:G.readLines.includes(key)};maybeSpeakCurrentLine(key);}
 if(C.instant)type.shown=chars.length;
 textRun=P.readingMarkup(text,l.text,type.shown);const direction=DIRECTION.resolve(G,U,aux);if(C.impactEffects!==false&&direction?.phrase){const start=l.text.indexOf(direction.phrase);if(start>=0){const from=Array.from(l.text.slice(0,start)).length,end=from+Array.from(direction.phrase).length;for(let i=from;i<end;i++)textRun.glyphs[i]?.classList.add('beat-word');}}let recorded=false;
 const update=(instant=false)=>{
  if(!text.isConnected||aux||key!==M.lineId(G))return;
  P.reveal(textRun,type.shown,instant);const full=type.shown>=chars.length;
  $('#nextMark').hidden=!full;const next=$('#explicitNext');if(next&&!G.dialogue.awaitingChoice)next.textContent=full?(G.dialogue.index===M.dialogueData(G).lines.length-1?'답변 마치기': '다음 →'):'한 번에 보기';if(next?.textContent==='답변 마치기')next.textContent=M.dialogueData(G)?.next?'이야기 계속':'답변 마치기';$('#lineStatus').textContent=C.controlHints?(full?'클릭 / Space · 다음':'클릭 / Space · 문장 전체 보기'):'';
  $('#lineProgress').style.width=(type.shown/chars.length*100)+'%';
  if(full&&!recorded){recorded=true;M.seeLine(G);$('#lineAccessible').textContent=eventName(l.who)+'. '+l.text;P.beat?.(direction);scheduleAuto();}
 };
 update(true);syncActor();
 const tick=()=>{
  if(document.hidden||aux||!text.isConnected||key!==M.lineId(G))return;
  type.shown=Math.min(chars.length,type.shown+1);update();
  if(type.shown<chars.length)typeTimer=setTimeout(tick,C.speed+P.pauseFor(chars[type.shown-1]));
 };
 if(type.shown<chars.length&&!document.hidden)typeTimer=setTimeout(tick,C.speed);
}

function scheduleAuto(){clearTimeout(autoTimer);if(!auto||aux||!G?.dialogue||G.dialogue.awaitingChoice||G.dialogue.remote||type.shown<Array.from(M.currentLine(G).text).length)return;autoTimer=setTimeout(()=>{if(auto&&!aux&&G?.dialogue){if(C.voice&&SOUND.speaking())scheduleAuto();else advanceDialogue();}},Math.max(C.autoInterval,Array.from(M.currentLine(G).text).length*65));}

function completeLine(){if(!G?.dialogue)return;type.shown=Array.from(M.currentLine(G).text).length;paintLine();}
function afterAdvance(result){if(result.done&&['topic','hotspot'].includes(result.finished?.kind))U.lastResult={kind:result.finished.kind,ref:result.finished.ref};if(result.got.length){evidenceReceipt(result.got);sound('evidence');}if(result.choice)pauseAuto();if(result.done){pauseAuto();spokenKey='';SOUND.stopSpeech();if(result.finished?.ref==='intro')U.npc='minjae';if(['followup','followup_open'].includes(result.finished?.ref)){U.npc='eunchae';U.mode='evidence';}if(G.caseClosed&&result.finished?.ref?.startsWith('conclusion'))U.mode='people';else if(G.dialogue?.kind==='scene')U.mode='talk';if(result.finished?.ref==='first_question_v7'){U.mode='visit';U.npc='eunchae';}if(result.finished?.ref?.startsWith('ending'))U.mode='case';}persist();}

function advanceDialogue(){if(!G?.dialogue||G.dialogue.remote||G.dialogue.awaitingChoice||aux)return;if(type.shown<Array.from(M.currentLine(G).text).length){completeLine();return;}clearTimeout(autoTimer);spokenKey='';SOUND.stopSpeech();const result=M.advance(G);afterAdvance(result);render();if(result.done&&result.finished?.kind==='hotspot'&&P.active()&&C.sceneEffects){document.getElementById('hot-'+result.finished.ref)?.classList.add('confirmed');}}
function setMode(mode){if(RUN.started(G)){if(mode==='evidence'){openAux('run-library');return;}if(mode==='case'){U.mode='reasoning';render();return;}leaveReasoning('voluntary',false);}clearTimeout(searchTimer);if(!nav.some(x=>x[0]===mode)&&!['talk','visit'].includes(mode))return;rememberField();if(['inspect','visit'].includes(mode)&&G.dialogue?.kind==='topic'){M.suspendTopic(G);G.dialogue=null;}pauseAuto();SOUND.stopSpeech();U.scrolls={...(U.scrolls||{}),...captureScroll()};U.mode=mode;render();persist();}
function newGame(){P.reset?.();G=M.fresh();U={mode:'talk',npc:'minjae',rail:false,goal:true,scrolls:{},caseTab:'overview',evidenceFilter:'all',evidenceSearch:'',docViews:{}};type.key=null;spokenKey='';pauseAuto();persist();render();}

function loaded(v){SOUND.stopSpeech();G=M.validate(v.game);if(G.guideVersion===1&&!RUN.isLoop(G)){RUN.enable(G);G.reasoning.briefed=true;G.reasoning.introSeen=true;}U={mode:nav.some(x=>x[0]===v.ui?.mode)||['talk','visit'].includes(v.ui?.mode)?v.ui.mode:'talk',npc:D.people[v.ui?.npc]?v.ui.npc:roomPeople()[0],rail:false,goal:true,scrolls:v.ui?.scrolls||{},caseTab:['overview','timeline','notebook'].includes(v.ui?.caseTab)?v.ui.caseTab:'overview',evidenceFilter:v.ui?.evidenceFilter||'all',evidenceSearch:v.ui?.evidenceSearch||'',docViews:v.ui?.docViews||{},proofDrafts:v.ui?.proofDrafts||{},returnContext:v.ui?.returnContext||null,lastResult:v.ui?.lastResult||null,moreQuestions:v.ui?.moreQuestions||{},evidenceOrder:v.ui?.evidenceOrder||'recent'};if(!roomPeople().includes(U.npc)&&G.dialogue?.kind!=='scene')U.npc=roomPeople()[0]||'minjae';if(RUN.started(G))U.mode='reasoning';type.key=null;spokenKey='';pauseAuto();app.replaceChildren();render();if(RUN.started(G)&&G.reasoning.issue)openRunProof(G.reasoning.issue,false);if(G.dialogue?.remote||G.dialogue?.kind==='topic'&&M.topic(G.dialogue.ref)?.phone)openAux('phone',{npc:M.topic(G.dialogue.ref).npc});persist();toast(v.game.campaign==='classic'?'이전 저장을 불러왔습니다.':'읽던 위치로 돌아왔습니다.');}

function switchPlace(id,person=null){
 if(G.dialogue?.kind==='scene'){U.mode='talk';pauseAuto();render();toast('진행 중인 장면을 확인한 뒤 이동할 수 있습니다.');return;}
 rememberField();const paused=G.dialogue?.kind==='topic';M.move(G,id);U.npc=person||Object.keys(D.people).find(p=>M.locationOf(G,p)===id)||'minjae';U.mode=person?'talk':guided()?'visit':'inspect';type.key=null;spokenKey='';SOUND.stopSpeech();pauseAuto();persist();render();if(paused)toast('읽던 대화는 보관했습니다. 돌아오면 이어 들을 수 있습니다.');
}
function startTopic(id){
 if(G.dialogue?.kind==='scene'){U.mode='talk';render();toast('진행 중인 장면을 먼저 확인해 주세요.');return;}
 if(G.dialogue?.kind==='topic'&&G.dialogue.ref===id){if(G.dialogue.remote)openAux('phone',{npc:M.topic(id).npc});else {U.mode='talk';render();}return;}
 const t=M.topic(id),resuming=M.resumePosition(G,id);rememberField();M.startTopic(G,id);type.key=null;spokenKey='';pauseAuto();SOUND.stopSpeech();
 if(G.dialogue.remote){persist();openAux('phone',{npc:t.npc});}else {U.npc=t.npc;U.mode='talk';persist();render();}
 if(resuming)toast('읽던 부분부터 이어집니다.');
}

/* Auxiliary state and focus restoration */
function openAux(kind,data={},back=false){
 clearTimeout(searchTimer);saveProofDraft();
 clearTimeout(toastTimer);notifications.replaceChildren();pauseAuto();clearInterval(typeTimer);SOUND.stopSpeech();
 if(!aux){returnFocus=document.activeElement;returnScroll=captureScroll();auxBack=[];}
 else if(back){rememberDocument();auxBack.push({kind:aux.kind,data:aux.data,scroll:$('.modal-body')?.scrollTop||0,focus:focusSelector(document.activeElement)});if(auxBack.length>10)auxBack.shift();}
 aux={kind,data};overlay.hidden=false;app.inert=true;document.body.classList.add('ui-paused');P.suspend(true);renderAux();
}
function focusSelector(el){if(!el)return null;if(el.id)return '#'+CSS.escape(el.id);if(el.dataset?.act)return `[data-act="${el.dataset.act}"]${el.dataset.id?`[data-id="${el.dataset.id}"]`:''}`;return null;}
function rememberDocument(){if(aux?.kind==='evidence'){U.docViews=U.docViews||{};const vp=$('#docViewport');const view={zoom:aux.data.zoom,left:vp?.scrollLeft||0,top:vp?.scrollTop||0};U.docViews[aux.data.id]=view;Object.assign(aux.data,view);}}

function closeAux(){clearTimeout(searchTimer);saveProofDraft();pauseAuto();SOUND.stopSpeech();rememberDocument();
 if(auxBack.length){const prev=auxBack.pop();aux={kind:prev.kind,data:prev.data};renderAux();$('.modal-body').scrollTop=prev.scroll;if(prev.focus)overlay.querySelector(prev.focus)?.focus({preventScroll:true});return;}
 const focus=focusSelector(returnFocus);aux=null;overlay.hidden=true;overlay.replaceChildren();app.inert=false;document.body.classList.remove('ui-paused');P.suspend(false);P.modal(null);render();restoreScroll(returnScroll);if(focus){const opener=document.querySelector(focus);(opener||$('#returnField')||$('#guideNext')||$('#main'))?.focus({preventScroll:true});}returnFocus=null;
}

function closeAll(){auxBack=[];closeAux();}
function confirm(title,text,action){openAux('confirm',{title,text,action},!!aux);}
function templateModal(title,body,footer='',cls=''){return `<section class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><h2 id="modalTitle" tabindex="-1">${esc(title)}</h2><div class="row modal-utilities">${!['settings','confirm'].includes(aux.kind)?btn('설정','settings','id="modalSettings" aria-label="현재 화면 위에서 설정 열기"'): ''}${btn(auxBack.length?'뒤로':'닫기','close-aux','id="modalClose" aria-label="'+(auxBack.length?'이전 보조 화면으로':'보조 화면 닫기')+'"')}</div></header><div class="modal-body" data-scroll="aux-${aux.kind}">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:''}</section>`;}
function documentMarkup(e){const d=e.doc;return `<article class="document">${img('paper','paper-decor','')}<div class="doc-kicker">모서리 극장 / ${esc(e.type)} / 자료 확인</div><h3>${esc(d.heading)}</h3>${d.rows?`<table>${d.columns?`<thead><tr>${d.columns.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead>`:''}<tbody>${d.rows.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}${(d.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</article>`;}
function evidenceModal(id){const proof=auxBack.slice().reverse().find(x=>x.kind==='proof');const e=D.evidence[id],compareId=compareIdForEvidence(id),audioText=evidenceAudioText(id);return templateModal(e.name,`<div class="doc-layout"><section><div class="doc-toolbar"><span class="tag">${esc(e.type)}</span>${btn('−','zoom','data-delta="-0.2" aria-label="자료 축소"')}${btn('＋','zoom','data-delta="0.2" aria-label="자료 확대"')}${btn('맞춤','zoom-reset')}<span id="zoomLabel">100%</span><span class="help-text">확대 뒤 스크롤·드래그로 이동</span></div><div class="doc-viewport" id="docViewport" tabindex="0" aria-label="자료 원문. 방향키 또는 스크롤로 이동"><div id="docSizer"><div class="doc-scale" id="docScale">${documentMarkup(e)}</div></div></div></section><aside class="doc-facts"><span class="eyebrow">출처</span><p class="doc-source">${esc(e.source)}<br>확인 장소 · ${esc(e.place)}</p>${e.image?img(e.image,'doc-asset','관련 소품 이미지'):''}<h3>${e.type==='진술'?'당사자가 한 설명':'자료에서 확인한 내용'}</h3>${e.facts.map(f=>`<div class="fact">${esc(f)}</div>`).join('')}<h3>추가로 확인할 점</h3><div class="limitation">${esc(e.limit)}</div></aside></div>`,`${proof?btn(proof.data.proofs.includes(id)?'✓ 근거 선택됨 · 비교로':'근거로 선택하고 비교로','source-for-proof',`data-id="${id}"`,'primary'):''}${btn(G.bookmarks.includes(id)?'◆ 수첩 표시 해제':'수첩에 표시','bookmark',`data-id="${id}"`)}${audioText?btn('전사 읽어주기','play-evidence-audio',`data-id="${id}"`,'secondary',!SOUND.hasKoreanVoice()):''}${compareId?btn('관련 대조 보기','compare-view',`data-id="${compareId}"`,'secondary'):''}${G&&U.mode==='talk'&&!G.dialogue?.remote&&(!G.dialogue||G.dialogue.kind==='topic')&&M.locationOf(G,U.npc)===G.location?btn(`${D.people[U.npc].name}에게 근거로 제시`,'present-evidence',`data-id="${id}"`,'secondary'):''}${btn('닫기','close-aux')}`,'wide');}
function fitDoc(){
 const vp=$('#docViewport'),scale=$('#docScale');if(!vp||!scale)return;
 const zoom=aux.data.zoom||1,width=Math.min(660,Math.max(320,vp.clientWidth-12));aux.data.zoom=zoom;
 // Real text reflows to the reader. It is not shrunk below legible size on entry.
 scale.style.width=width+'px';scale.querySelector('.document').style.width=width+'px';scale.style.transform=`scale(${zoom})`;
 $('#docSizer').style.width=width*zoom+'px';$('#docSizer').style.height=scale.scrollHeight*zoom+'px';$('#zoomLabel').textContent=Math.round(zoom*100)+'%';
 let dragging=false,sx,sy,sl,st;vp.onpointerdown=e=>{if(e.button!==0||e.target.closest('button,a,input,select'))return;dragging=true;sx=e.clientX;sy=e.clientY;sl=vp.scrollLeft;st=vp.scrollTop;vp.setPointerCapture(e.pointerId);vp.style.cursor='grabbing';};
 vp.onpointermove=e=>{if(dragging){vp.scrollLeft=sl-(e.clientX-sx);vp.scrollTop=st-(e.clientY-sy);}};
 const release=()=>{dragging=false;vp.style.cursor='grab';};vp.onpointerup=release;vp.onpointercancel=release;vp.onlostpointercapture=release;
}
function saveProofDraft(){
 if(!G||aux?.kind!=='proof')return;
 const p=aux.data;if($('.friendly-sources'))p.sourceTop=$('.friendly-sources').scrollTop;U.proofDrafts=U.proofDrafts||{};
 U.proofDrafts[p.id]={claim:p.claim||null,proofs:[...p.proofs],compare:!!p.compare,search:p.search||'',filter:p.filter||'all',allSources:!!p.allSources,sourceOpen:p.sourceOpen||{},sourceTop:Math.max(0,p.sourceTop||0),hintLevel:p.hintLevel||0};
 persist();
}
function aboutModal(){return templateModal('이용 안내',`<section class="about-section"><h3>작품 안내</h3><p>범죄와 사망에 관한 묘사가 포함되어 있습니다.</p></section><section class="about-section"><h3>조작과 읽기</h3><p>대사 도중 한 번 누르면 문장 전체가 보이고, 다시 누르면 다음 말로 넘어갑니다. 질문은 오른쪽 목록에서 고릅니다.</p><p>자료·인물·지도는 하단 메뉴에서 엽니다. 조작 안내는 대화 화면의 도움말과 일시정지 메뉴에서 다시 확인할 수 있습니다.</p><p>글자 크기와 대사 출력 속도, 조작 힌트는 설정에서 바꿀 수 있습니다.</p></section><section class="about-section"><h3>저장과 소리</h3><p>자동 저장과 수동 저장을 지원합니다. 브라우저의 저장 권한에 문제가 있으면 진행 파일을 내보내 보관하세요.</p><p>전사 읽어주기는 기기의 음성 합성 기능입니다. 원본 녹음이나 성우 연기가 아닙니다. 소리 없이도 모든 대사와 자료를 읽을 수 있습니다.</p></section><details class="about-version"><summary>버전 정보</summary><p>마지막 상영 · 0.10.0</p><p>이전 저장은 이어서 불러올 수 있습니다. 0.1~0.3의 진행은 기존 경로로 보존되며, 확장 경로는 처음부터 시작할 때 적용됩니다.</p></details>`,btn('조작 안내','help'),'compact');}
function proofModal(){
 const d=D.deductions.find(x=>x.id===aux.data.id),p=aux.data,term=(p.search||'').trim(),filter=p.filter||'all';
 const types=[...new Set(G.evidence.map(id=>D.evidence[id].type))];
 const list=G.evidence.filter(id=>{const e=D.evidence[id];return (filter==='all'||filter==='pins'&&G.bookmarks.includes(id)||e.type===filter)&&(!term||(e.name+' '+e.facts.join(' ')).includes(term));});
 return templateModal(d.name,`<p class="proof-question">${esc(d.question)}</p><div class="proof-layout"><section class="proof-claims"><h3>판단</h3>${d.claims.map(c=>btn(esc(c.text),'claim',`data-id="${c.id}" aria-pressed="${p.claim===c.id}"`,p.claim===c.id?'selected':'')).join('')}</section><section class="proof-library"><h3>근거</h3><div class="proof-tools"><label class="sr-only" for="proofSearch">근거 검색</label><input id="proofSearch" maxlength="200" data-ui-search="proof" value="${esc(p.search||'')}" placeholder="자료 제목·내용 검색"><select id="proofFilter" data-ui-filter="proof" aria-label="근거 분류">${[['all','전체'],['pins','표시한 자료'],...types.map(t=>[t,t])].map(([id,label])=>`<option value="${id}" ${filter===id?'selected':''}>${label}</option>`).join('')}</select>${term||filter!=='all'?btn('초기화','proof-filter-reset','','small'):''}</div><div class="proof-evidence">${list.map(id=>btn(`${p.proofs.includes(id)?'✓ ':''}${esc(D.evidence[id].name)}`,'proof-evidence',`data-id="${id}" aria-pressed="${p.proofs.includes(id)}"`,p.proofs.includes(id)?'selected':'')).join('')||'<p class="empty">검색 결과가 없습니다.</p>'}</div></section></div><section class="selected-sources" aria-label="선택한 근거"><h3>선택한 근거</h3>${p.proofs.length?`<div class="source-chips">${p.proofs.map(id=>`<div class="source-chip"><span>${esc(D.evidence[id].name)}</span>${btn('원문','evidence',`data-id="${id}" aria-label="${esc(D.evidence[id].name)} 원문 열기"`,'small')}${btn('제외','proof-evidence',`data-id="${id}" aria-label="${esc(D.evidence[id].name)} 선택 해제"`,'small')}</div>`).join('')}</div>`:'<p class="help-text">아직 선택한 근거가 없습니다.</p>'}</section>${p.compare?`<section class="proof-selected">${p.proofs.map(id=>`<article class="proof-excerpt"><h4>${esc(D.evidence[id].name)}</h4>${D.evidence[id].facts.map(f=>`<p class="proof-fact">${esc(f)}</p>`).join('')}</article>`).join('')}</section>`:''}${p.result?`<div role="status" class="feedback ${p.result.ok?'success':''}">${esc(p.result.message)}</div>`:''}`,`${btn('근거 비교','compare','','secondary',!p.proofs.length)}${btn(p.result?.ok?'사건 정리로':'판단 제출',p.result?.ok?'close-aux':'submit-proof','','primary',!p.claim||!p.proofs.length)}`,'wide');
}
function compareModal(id){const c=compareViews[id];if(!c||!M.all(G.evidence,c.ids))return templateModal('자료 대조','<p>관련 자료를 먼저 확보해야 한다.</p>');return templateModal(c.title,`<div class="compare-view">${c.ids.map(id=>`<section class="compare-panel"><span class="eyebrow">${esc(D.evidence[id].type)}</span><h3>${esc(D.evidence[id].name)}</h3>${D.evidence[id].facts.map(f=>`<p>${esc(f)}</p>`).join('')}<p class="help-text">출처 · ${esc(D.evidence[id].source)}</p>${btn('이 자료 원문 읽기','evidence',`data-id="${id}"`)}</section>`).join('')}</div>`,btn('이전 자료로','close-aux'),'wide');}
function activityModal(){const id=aux.data.id,a=D.activities[id],v=aux.data.draft,r=aux.data.result;const options=(list,value)=>'<option value="">선택</option>'+list.map(([val,text])=>`<option value="${val}" ${value===val?'selected':''}>${esc(text)}</option>`).join('');let fields='';
 if(a.kind==='number')fields=`<div class="reconcile-table"><div class="help-text">금액 단위 · 만 원</div>${a.fields.map(f=>`<label class="work-field"><span>${f.label}</span><input type="number" inputmode="numeric" min="0" step="1" data-work="${f.id}" value="${esc(v[f.id]??'')}" aria-label="${f.label}"><span>만 원</span></label>`).join('')}</div>`;
 if(a.kind==='select')fields=a.fields.map(f=>`<label class="work-field select-field"><span>${f.label}</span><select data-work="${f.id}" aria-label="${f.label}">${options(f.options,v[f.id])}</select></label>`).join('');
 if(a.kind==='order')fields=`<div class="order-list">${v.order.map((x,i)=>`<div class="order-row"><span class="order-index">${i+1}</span><span>${a.cards.find(c=>c.id===x).text}</span><div>${btn('위로','order-up',`data-id="${x}" id="order-up-${x}" aria-label="${a.cards.find(c=>c.id===x).text} 앞 순서로"`,'small',i===0)}${btn('아래로','order-down',`data-id="${x}" id="order-down-${x}" aria-label="${a.cards.find(c=>c.id===x).text} 뒤 순서로"`,'small',i===v.order.length-1)}</div></div>`).join('')}</div>`;
 if(a.kind==='claims')fields=a.fields.map(f=>`<section class="claim-work"><h3>${f.label}</h3><label>자료와의 관계 <select data-work="${f.id}" aria-label="${esc(f.label)} 판단">${options([['supported','자료와 맞는다'],['conflict','자료와 충돌한다'],['unknown','아직 판단할 수 없다']],v[f.id])}</select></label><fieldset><legend>이 판단의 근거 선택</legend>${a.sources.map(e=>`<label><input type="checkbox" data-work-proof="${f.id}" value="${e}" ${(v[f.id+'_sources']||[]).includes(e)?'checked':''}>${D.evidence[e].name}</label>`).join('')}</fieldset></section>`).join('');
 return templateModal(a.name,`<p>${a.description}</p><div class="work-layout"><section>${fields}</section><aside class="work-sources"><h3>확보한 원문</h3>${a.sources.filter(e=>G.evidence.includes(e)).map(e=>`<details><summary>${esc(D.evidence[e].name)}</summary><div class="source-excerpt">${documentMarkup(D.evidence[e])}</div>${btn('확대해서 읽기','evidence',`data-id="${e}"`,'small')}</details>`).join('')}</aside></div>${r?`<p class="feedback ${r.ok?'success':''}" role="status">${esc(r.message)}</p>`:''}`,`${btn('초안 초기화','activity-reset')}${btn(r?.ok?'대조 마침':'대조 결과 제출',r?.ok?'close-aux':'activity-submit','','primary')}`,'wide');
}
function previewModal(){const d=aux.data,p=D.previews[d.id],l=p.lines[d.index||0];return templateModal(p.title,`<div class="phone-pane"><div>${img(D.people[d.id].asset+'_portrait','portrait',D.people[d.id].name)}</div><div><span class="tag">개인 확인본 전사</span><h3>${esc(eventName(l.who))}</h3><p>${esc(l.text)}</p><span class="help-text">${(d.index||0)+1} / ${p.lines.length}</span></div></div>`,btn((d.index||0)===p.lines.length-1?'확인 내용 기록':'다음 내용','preview-next','','primary'),'compact');}

function savedDescription(v){const ch=M.chapter(v.game),minutes=Math.floor(v.game.elapsed/60),date=new Date(v.savedAt);return `${ch[0]}장 ${ch[1]} · ${D.places[v.game.location].name}<br>플레이 ${minutes}분 · 저장 ${date.toLocaleString('ko-KR')}`;}
function savesModal(){const saving=aux.data.mode==='save';return templateModal(saving?'진행 저장':'진행 불러오기',`${storageWarning?`<p class="storage-warning">${esc(storageWarning)}</p>`:''}<div class="slot-list">${S.slots().map(slot=>`<article class="slot"><div><div class="slot-label">${slot.id==='auto'?'자동 저장':'SLOT '+slot.id}</div><h3>${slot.error?'읽을 수 없는 저장':slot.value?M.chapter(slot.value.game)[1]:'빈 슬롯'}</h3><p>${slot.error?esc(slot.error):slot.value?savedDescription(slot.value):'아직 저장한 진행이 없습니다.'}</p></div>${saving&&slot.id!=='auto'?btn('여기에 저장','save-slot',`data-id="${slot.id}"`,'primary'):btn('불러오기','load-slot',`data-id="${slot.id}"`,'secondary',!slot.value)}</article>`).join('')}</div><p class="help-text" style="margin:22px 0 0">실제 저장 시각은 작품 속 시간과 다릅니다. 브라우저가 달라지거나 파일 위치를 옮길 때는 진행 파일을 내보내 보관하세요.</p>`,`${G?btn('진행 파일 내보내기','export-save'):''}${btn('진행 파일 가져오기','import-save')}`);}
function settingsModal(){const voices=SOUND.hasKoreanVoice();const select=(id,label,choices,value)=>`<div class="setting-row"><label for="cfg-${id}">${label}</label><select id="cfg-${id}" data-config="${id}">${choices.map(([v,t])=>`<option value="${v}" ${value===v?'selected':''}>${t}</option>`).join('')}</select></div>`;const toggle=(id,label)=>`<div class="setting-row"><label for="cfg-${id}">${label}</label><input type="checkbox" id="cfg-${id}" data-config="${id}" ${C[id]?'checked':''}></div>`;const slider=(id,label)=>`<div class="setting-row"><label for="cfg-${id}">${label}</label><div class="range-group"><input type="range" id="cfg-${id}" min="0" max="1" step=".05" value="${C[id]}" data-config="${id}"><output id="out-${id}">${Math.round(C[id]*100)}%</output></div></div>`;
 return templateModal('설정',`<section class="reading-presets" aria-label="읽기 방식 빠른 설정"><h3>어떻게 읽을까요?</h3><div>${btn('<strong>이야기를 따라 천천히</strong><span>글자가 차분히 나타나고 장면이 부드럽게 이어집니다.</span>','reading-preset','data-id="cinematic"','secondary')}${btn('<strong>기다림 없이 편하게</strong><span>조금 큰 글자로 문장을 바로 읽습니다. 다음 말은 직접 넘깁니다.</span>','reading-preset','data-id="comfortable"','secondary')}</div><p>음량·음소거와 기기의 움직임 줄이기는 바꾸지 않습니다.</p></section><h3>읽기와 화면</h3>${select('textSize','글자 크기',[[1,'기본'],[1.15,'크게 · 115%'],[1.3,'더 크게 · 130%'],[1.5,'최대 · 150%']],C.textSize)}${toggle('instant','대사 즉시 표시')}<div class="setting-row"><label for="cfg-speed">글자 출력 간격 · 짧을수록 빠름</label><input id="cfg-speed" type="range" min="5" max="80" value="${C.speed}" data-config="speed"></div>${select('autoInterval','자동 진행 최소 대기',[[2000,'2초'],[3500,'3.5초'],[5000,'5초'],[7000,'7초']],C.autoInterval)}${toggle('contrast','본문 대비 강화')}${toggle('reduced','움직임 줄이기')}${toggle('hotspots','조사 위치 표시')}${toggle('hints','다음 행동 안내 펼치기')}${toggle('controlHints','대사창 조작 힌트')}<h3 class="setting-section">시각 연출</h3>${toggle('sceneEffects','장면·인물·패널 전환')}${toggle('impactEffects','주요 장면과 추리 결과 강조')}${toggle('atmosphere','영사 빛과 먼지 입자')}${toggle('characterMotion','인물의 미세한 움직임')}${toggle('textEffects','대사 잉크가 나타나는 효과')}${toggle('punctuationPause','문장 부호에서 잠시 쉬기')}<div class="fx-preview"><span class="help-text">대사 출력 미리보기</span><p id="effectSample">남은 기록을 한 장씩 확인한다.</p>${btn('현재 효과 미리보기','effects-preview')}</div><p class="help-text">움직임 줄이기 또는 기기의 동작 줄이기가 켜져 있으면 시각 애니메이션이 우선 꺼집니다.</p><h3 class="setting-section">소리</h3>${btn('소리 켜기 / 재시도','sound-enable')}${toggle('audioMuted','전체 소리 끄기')}${slider('musicVolume','배경 음악')}${slider('ambientVolume','장소 환경음')}${slider('volume','인터페이스 효과음')}${btn('효과음 시험','sound-test')}<div class="setting-row"><label for="cfg-voice">한국어 전사 읽어주기<br><span class="help-text" id="voiceAvailability">성우 연기가 아닌 기기의 읽기 기능${voices?'':' · 이 환경에 한국어 음성이 없음'}</span></label><input type="checkbox" id="cfg-voice" data-config="voice" ${C.voice?'checked':''} ${voices?'':'disabled'}></div>${slider('voiceVolume','읽어주기 음량')}${select('voiceRate','읽어주기 속도',[[.9,'0.9배'],[1,'기본'],[1.1,'1.1배']],C.voiceRate)}${toggle('unfocusedMute','다른 창으로 전환하면 소리 멈추기')}<p class="help-text">설정은 진행 파일과 별도로 저장됩니다. 음성이 없어도 모든 자료와 대사를 읽을 수 있습니다.</p>`,`${btn('설정 기본값 복원','settings-reset')}${btn('게임으로 돌아가기','close-aux')}`);
}

function phoneModal(){const p=D.people[aux.data.npc],line=M.currentLine(G);if(!line)return templateModal(p.name+' · 전화 확인',`<div class="row">${img(p.asset+'_portrait','portrait',p.name)}<p>통화 내용을 기록했습니다.</p></div>`,btn('확인 마침','close-aux'));M.seeLine(G);return templateModal(p.name+' · 전화 확인',`<div class="phone-pane"><div>${img(p.asset+'_portrait','portrait',p.name)}<p class="help-text">${esc(UI_COPY.role(p))}</p></div><div><div class="phone-speaker">${esc(eventName(line.who))}</div><p>${esc(line.text)}</p><div class="phone-progress">${G.dialogue.index+1} / ${M.dialogueData(G).lines.length}</div></div></div>`,btn('다음 말','phone-next','id="phoneNext"','primary'),'compact');}
function renderAux(){if(!aux)return;if(aux.kind==='proof'&&$('.friendly-sources'))aux.data.sourceTop=$('.friendly-sources').scrollTop;const focusId=document.activeElement?.id,focusSel=focusSelector(document.activeElement),oldBodyTop=$('.modal-body')?.scrollTop||0;let html='';const data=aux.data;
 switch(aux.kind){
  case 'run-library':html=runLibraryModal();break;
 case 'run-return':html=returnModal();break;
 case 'judgment-record':html=judgmentRecord(data.id);break;
 case 'evidence':html=evidenceModal(data.id);break;
  case 'proof':html=guided()&&GUIDE.coreProofs.includes(data.id)?guidedProofModal():proofModal();break;
  case 'activity':html=activityModal();break;
  case 'preview':html=previewModal();break;
  case 'phone-menu':html=templateModal(D.people[data.id].name+' · 전화로 확인할 말',`<div class="stack">${M.questions(G,data.id).map(t=>btn((G.topicsRead.includes(t.id)?'✓ ':'＋ ')+esc(t.label),'phone-topic',`data-id="${t.id}"`)).join('')}</div>`);break;
  case 'compare':html=compareModal(data.id);break;
  case 'saves':html=savesModal();break;
  case 'settings':html=settingsModal();break;
  case 'confirm':html=templateModal(data.title,`<p>${esc(data.text)}</p>`,`${btn('취소','close-aux')}${btn('확인','confirm-action','id="confirmAction"','primary')}`,'compact');break;
  case 'phone':html=phoneModal();break;
  case 'log':{const term=aux.data.search||'',list=G?.log.filter(l=>!term||(eventName(l.who)+' '+l.text).includes(term))||[];html=templateModal('대화 기록',`<div class="archive-tools"><label for="logSearch">대사 검색</label><input id="logSearch" value="${esc(term)}" placeholder="인물 이름 또는 대사"></div>${list.map(x=>`<article class="log-entry"><b>${esc(eventName(x.who))}</b><span>${x.via==='phone'?'전화':esc(D.places[x.location]?.name||'전화')} · ${UI_COPY.phase(x.phase)}</span><p>${esc(x.text)}</p></article>`).join('')||'<div class="empty">표시할 대화 기록이 없습니다.</div>'}`);break;}
  case 'statements':html=templateModal(D.people[data.id].name+' · 주요 진술',G.statements.filter(x=>x.npc===data.id).map(x=>`<article class="statement-card"><div class="tag">본인의 주장</div><p>${esc(x.text)}</p><div class="metadata">${esc(D.places[x.location]?.name||'전화 확인')} · ${UI_COPY.phase(x.phase)}</div>${btn('해당 대화 기록','topic-log',`data-id="${x.id}"`,'small')}</article>`).join(''));break;
  case 'topic-log':html=templateModal('해당 대화 기록',G.log.filter(l=>l.id.startsWith('topic/'+data.id+'/')).map(x=>`<article class="log-entry"><b>${esc(eventName(x.who))}</b><p>${esc(x.text)}</p></article>`).join('')||'<p>아직 표시된 대화가 없습니다.</p>');break;
  case 'consent':{const p=D.people[data.id],response=D.deliveryResponses[G.delivery.plan]?.[data.id];html=templateModal(p.name+' · 전달 의사 확인',`<div class="row">${img(p.asset+'_portrait','portrait',p.name)}<div><span class="tag">당사자 답변</span><p>${esc(response||'전달안을 먼저 선택해 주세요.')}</p></div></div><p>다른 대상에게 공개하려면 다시 허락을 받아야 한다.</p>`,btn(G.consents[data.id]?'기록 확인':'답변 그대로 기록',G.consents[data.id]?'close-aux':'record-consent',`data-id="${data.id}"`,'primary',!response),'compact');break;}
  case 'pause':html=templateModal('일시정지',`<div class="stack">${btn('게임으로 돌아가기','close-aux','','primary')}${btn('저장','save-menu')}${btn('불러오기','load-menu')}${btn('자동 진행','auto')}${btn('읽은 대사 넘기기','skip')}${btn(C.audioMuted?'소리 켜기':'음소거','audio-mute')}${btn('조작 안내','help')}${btn('시작 화면으로','title')}</div>`,'','compact');break;
  case 'receipt':html=receiptModal();break;
 case 'recent':html=recentModal();break;
  case 'context-help':html=contextHelp();break;
  case 'recap':html=templateModal('사건 요약',recapContent(),btn('조사로 돌아가기','close-aux'),'wide');break;
  case 'about':html=aboutModal();break;
  case 'help':html=templateModal('조작 안내',`<p><strong>길을 잃었을 때:</strong> 위쪽 ‘지금 할 일’의 버튼을 누르세요. 장소 이동, 대화, 자료 비교를 차례로 안내합니다. ‘다른 이야기’와 추가 대조는 필수가 아닙니다.</p><p>대사 영역을 누르면 출력 중인 문장을 먼저 모두 표시합니다. 한 번 더 누르면 다음 말로 넘어갑니다.</p><p>질문은 답변을 끝까지 들은 뒤 확인함으로 기록됩니다. 이미 확인한 질문도 다시 읽을 수 있습니다.</p><p>Tab으로 항목을 이동하고 Enter로 선택합니다. 목록에서는 방향키도 사용할 수 있습니다. Space는 대사창이 활성일 때만 대사를 진행합니다.</p><p>Esc는 보조 창 닫기, 현장 복귀, 일시정지 순서로 동작합니다. 자료나 설정을 열면 자동 진행은 멈춥니다.</p><p>자료 확대 뒤에는 스크롤이나 드래그로 이동합니다. 추리에서는 판단과 근거를 골라 비교한 뒤 제출합니다.</p>`,'','compact');break;
  case 'message':html=templateModal(data.title,`<p>${esc(data.text)}</p>`,btn('확인','close-aux'),'compact');break;
 }
 overlay.innerHTML=html;if(aux.kind==='proof'&&$('.friendly-sources'))$('.friendly-sources').scrollTop=aux.data.sourceTop||0;updateAmbient();if(aux.kind==='phone'&&G?.dialogue?.remote)maybeSpeakCurrentLine();P.modal(aux.kind,aux.data.id||aux.data.npc||'');const same=(focusId&&document.getElementById(focusId))||(focusSel&&overlay.querySelector(focusSel));if(same&&overlay.contains(same)){same.focus({preventScroll:true});$('.modal-body').scrollTop=oldBodyTop;}else (aux.kind==='phone'?$('#phoneNext'):$('#modalTitle'))?.focus({preventScroll:true});if(aux.kind==='evidence'){fitDoc();$('#docViewport').scrollTo(aux.data.left||0,aux.data.top||0);}if(aux.kind==='log'&&!aux.data.search&&!focusId)$('.modal-body').scrollTop=$('.modal-body').scrollHeight;
}
function openEvidence(id,back=false){if(RUN.isLoop(G)&&G.reasoning.returnIssue&&RUN.researchTask(G)?.id===id)G.reasoning.returnReviewed=true;if(!G.evidence.includes(id)){toast('확보하지 않은 자료는 열 수 없습니다.');return;}G.viewed=[...new Set([...G.viewed,id])];persist();const view=U.docViews?.[id]||{};openAux('evidence',{id,...view},back);}

function skipRead(){pauseAuto();if(!G?.dialogue||!['talk','inspect'].includes(U.mode))return;let skipped=0;while(G.dialogue&&!G.dialogue.awaitingChoice&&G.readLines.includes(M.lineId(G))&&skipped<100){const r=M.advance(G);afterAdvance(r);skipped++;if(r.done)break;}type.key=null;render();toast(skipped?'읽은 대사를 넘겼습니다. 새 대사나 질문에서는 멈춥니다.':'읽지 않은 대사에서는 건너뛰지 않습니다.');}
function exportSave(){if(!G)return;rememberDocument();saveProofDraft();const blob=new Blob([S.encode(G,U)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='마지막상영_진행.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('진행 파일을 내보냈습니다.');}
let sampleTimer=null;
function showEffectSample(){
 clearTimeout(sampleTimer);const el=$('#effectSample');if(!el)return;const message='잠깐, 이 기록부터 확인하겠습니다.';
 const run=P.readingMarkup(el,message,0),letters=Array.from(message);let shown=0;
 const next=()=>{if(!el.isConnected)return;shown++;P.reveal(run,shown,C.instant);if(shown<letters.length)sampleTimer=setTimeout(next,C.speed+P.pauseFor(letters[shown-1]));};
 if(C.instant){P.reveal(run,letters.length,true);}else next();
}

/* Explicit player-controlled phase loop, using the same evidence reader. */
function intakePage(){return `<section class="case-intake"><div class="intake-background">${img('lobby','','')}</div><main class="intake-card"><span class="eyebrow">모서리 극장 · 10월 18일 밤</span><h1>마지막 영업일의<br>사망 신고</h1><div class="intake-victim">${img('doyun_portrait','portrait','서도윤')}<div><strong>서도윤</strong><span>극장 대표 · 영사실에서 발견</span></div></div><p>나는 형사 정해온이다. 신고를 받고 극장에 도착했다.<br>대표가 숨진 경위와, 마지막으로 그를 만난 사람의 행동을 밝혀야 한다.</p><div class="intake-loop"><section><b>조사</b><span>사람에게 묻고<br>현장과 자료를 살핀다.</span></section><section><b>추리</b><span>충분히 알았다고 느끼면<br>판단과 근거를 제시한다.</span></section><section><b>재조사</b><span>막히면 돌아와 더 알아본다.<br>모은 단서와 입증한 내용은 남는다.</span></section></div><div class="intake-actions">${btn('현장으로 들어간다 →','begin-case','id="beginCase"','primary')}${btn('읽기 설정','settings','','plain')}</div></main></section>`;}
function loopIntro(){return `<aside class="loop-intro"><p><strong>조사할 순서는 정해져 있지 않습니다.</strong> 사람과 물건을 살펴본 뒤 ‘추리 시작’을 눌러 보세요. 언제든 조사로 돌아올 수 있습니다.</p>${btn('알겠어요','loop-intro-close','','small')}</aside>`;}
function phaseBar(){
 const active=RUN.started(G),t=GUIDE.next(G),r=G.reasoning;
 const label=r.attempt?'추리 이어하기':'추리 시작';
 const reading=!!G.dialogue;
 return `<section class="guide-bar phase-bar ${active?'deduction-bar':''}" aria-label="현재 페이즈"><div class="guide-copy"><span class="guide-stage">${active?'추리 페이즈':r.returnIssue?'재조사':'조사 페이즈'}</span><h2>${active?'판단을 세우고 근거를 제시한다':reading?'이야기를 듣는 중':r.returnIssue&&RUN.exposed(G,r.returnIssue)?RUN.rules[r.returnIssue].title+' · 더 확인할 점': '충분히 알아봤다고 느끼면 추리를 시작하세요'}</h2></div><div class="guide-actions">${active?btn('조사로 돌아가기','reasoning-leave','id="leavePhase"','secondary'):btn(label,'reasoning-start','id="startDeduction"','primary',!RUN.canStart(G))}${btn(active?'사건 요약':'어디부터 볼까? ',active?'recap':'context-help','id="contextHelp"','plain small')}${!active&&r.returnIssue?btn('막힌 점','return-note','','plain small'):''}</div></section>`;
}
function reasoningNav(){return `${btn('확보한 자료','run-library','','secondary')}${btn('사건 요약','recap')}${btn('저장','save-menu')}${btn('조사로 돌아가기','reasoning-leave','','primary')}`;}
function loopHints(id,level){
 if(M.availableDeductions(G).some(d=>d.id===id))return PLAYER.help(G,id,level);
 const rule=RUN.rules[id],owned=(D.deductions.find(d=>d.id===id)?.proof||[]).filter(e=>G.evidence.includes(e));
 return [rule.research,owned.length?'지금 가지고 있는 자료를 먼저 읽어보세요. 다른 설명을 확인할 수 없다면 아직 듣지 않은 이야기가 있는지 살펴보면 됩니다.':'아직 이 질문에 쓸 기록이 없습니다. 조사로 돌아가 관계자에게 직접 묻거나 눈앞의 물건을 살펴보세요.', '모르는 내용을 추측으로 메우지 않아도 됩니다. 논점을 보류한 뒤, 새로 확인한 부분만 보태 다시 도전할 수 있습니다.'].slice(0,level);
}
function beginReasoning(){
 if(!RUN.canStart(G)){toast('진행 중인 장면을 먼저 읽은 뒤 추리를 시작하세요.');return;}
 rememberField();pauseAuto();SOUND.stopSpeech();RUN.start(G);U.mode='reasoning';type.key=null;persist();render();$('#reasoningHeading')?.focus({preventScroll:true});
}
function openRunProof(id,choose=true){
 if(!RUN.started(G)||!RUN.exposed(G,id))return;
 if(G.solved.includes(id)&&G.reasoning.issue!==id){openAux('judgment-record',{id});return;}
 if(choose&&!G.solved.includes(id))RUN.choose(G,id);
 const draft=U.proofDrafts?.[id]||{};
 openAux('proof',{id,session:true,claim:draft.claim||null,proofs:[...(draft.proofs||[])],search:draft.search||'',filter:draft.filter||'all',compare:!!draft.compare,allSources:!!draft.allSources,sourceOpen:draft.sourceOpen||{},sourceTop:draft.sourceTop||0,hintLevel:draft.hintLevel||0,result:RUN.replayResult(G)});persist();
}
function leaveReasoning(reason='voluntary',notice=true){
 if(!RUN.isLoop(G))return;
 saveProofDraft();pauseAuto();SOUND.stopSpeech();RUN.leave(G,reason);closeAll();U.mode='visit';type.key=null;persist();render();
 if(notice)openAux('run-return');
}
function reasoningPage(){
 const r=G.reasoning,progress=RUN.progress(G),id=r.issue&&!G.solved.includes(r.issue)?r.issue:progress.open[0];
 const headline=id?RUN.rules[id].title:progress.allDone?'이번에 입증한 내용':'다음 이야기를 더 알아볼 때';
 const lead=id?RUN.rules[id].lead:progress.allDone?(G.phase==='night'?'밤의 네 논점을 정리했다. 남은 현장 확인을 마치면 검사 결과를 기다릴 수 있다.':'방문 부인과 자료의 충돌을 확인했다. 한지수에게 실제 행동을 묻는다.'):'아직 살펴보지 않은 일은 현장에서 찾아보자. 끝낸 논점은 그대로 남는다.';
 return `<section class="reasoning-workspace" data-scroll="reasoning"><header class="reasoning-hero"><span class="eyebrow">정해온의 수첩 · ${G.phase==='night'?'그날 밤':'며칠 뒤'}</span><h1 tabindex="-1" id="reasoningHeading">${esc(headline)}</h1><p>${esc(lead)}</p><div class="reasoning-hero-actions">${id?btn('이 논점에서 추리하기 →','reasoning-issue',`data-id="${id}"`,'primary'):G.phase==='night'&&M.labReady(G)?btn('검사 의뢰를 마친다','followup','','primary'):M.finalReady(G)?btn('마지막 면담으로','final','','primary'):btn('더 조사하기','reasoning-leave','','primary')}${id?btn('먼저 더 조사하기','reasoning-leave','','secondary'):''}</div><p class="loop-note">추리 중에도 돌아갈 수 있습니다. 틀린 판단을 세 번 제출하면 잠시 재조사로 전환됩니다. 단서와 입증한 내용은 사라지지 않습니다.</p></header><div class="reasoning-notebook"><section><h2>다른 논점</h2>${progress.open.filter(key=>key!==id).map(key=>`<article class="issue-card"><h3>${esc(RUN.rules[key].title)}</h3><p>${esc(RUN.rules[key].lead)}</p>${btn('여기서 추리','reasoning-issue',`data-id="${key}"`,'secondary')}</article>`).join('')||'<p class="empty">위의 논점부터 살펴보세요. 다른 이야기는 관련 내용을 조사하면 추가됩니다.</p>'}</section><section><h2>입증한 내용</h2>${progress.done.map(key=>`<article class="issue-card resolved"><span class="tag checked">✓ 확인 완료</span><h3>${esc(RUN.rules[key].title)}</h3><p>${esc(D.deductions.find(d=>d.id===key).result)}</p>${btn('기록 읽기','judgment-record',`data-id="${key}"`,'small')}</article>`).join('')||'<p class="empty">판단과 근거가 맞으면 이곳에 남습니다. 재도전해도 다시 풀지 않습니다.</p>'}</section></div></section>`;
}
function phaseProofModal(){
 const p=aux.data,r=G.reasoning,d=D.deductions.find(x=>x.id===p.id),rule=RUN.rules[p.id];
 if(G.solved.includes(p.id)){return templateModal(rule.title,`<section class="loop-accepted"><span class="eyebrow">✓ 논점을 입증했다</span><h3>${esc(d.result)}</h3><div class="loop-source-tags">${p.proofs.filter(id=>G.evidence.includes(id)).map(id=>btn(esc(D.evidence[id].name),'evidence',`data-id="${id}"`,'small')).join('')}</div><p>이 내용은 기록에 남습니다. 다음 논점에서 막혀도 다시 풀지 않습니다.</p></section>`,`${btn('여기서 조사로 돌아가기','reasoning-leave')}${btn('다음 논점으로 →','proof-next','','primary')}`,'wide phase-modal');}
 // Reuse the established library, selection and keyboard implementation, not
 // another independent proof editor. Only visible acquired sources are included.
 const saved=p.session;p.session=false;const html=guidedProofModal();p.session=saved;
 const strip=`<div class="phase-proof-strip"><span>추리 페이즈</span><span>틀린 판단 <b>${r.mistakes} / 3</b></span></div>`;
 return html.replace('class="modal wide"','class="modal wide phase-modal"')
  .replace('<p class="proof-question">',strip+'<p class="proof-question">')
  .replace(/<div class="proof-ready"[^>]*>.*?<\/div>/,'')
  .replace('<div class="row modal-utilities">','<div class="row modal-utilities">'+btn('저장','save-menu','','small'))
  .replace('나중에 이어하기','추리 목록으로')
  .replace('이 근거로 판단','이 근거를 제시한다')
  .replace('<footer class="modal-footer">','<footer class="modal-footer">'+btn('조사로 돌아가기','reasoning-leave','','secondary'))
  .replace('<div class="proof-ready"','<div class="proof-ready"');
}
function returnModal(){const r=G.reasoning,id=r.returnIssue,valid=id&&RUN.exposed(G,id);return templateModal(r.returnReason==='mistakes'?'잠시, 현장을 더 살펴보자':'조사로 돌아왔다',`<section class="return-note"><span class="eyebrow">재조사</span><h3>${valid?esc(RUN.rules[id].title):'아직 확인하지 않은 이야기'}</h3><p>${esc(RUN.researchText(G))}</p><div class="preserved"><strong>단서·진술·완료한 조사와 논점은 유지됩니다.</strong><p>중단한 답변은 이어서 듣고, 새로 열린 질문만 확인해도 됩니다. 준비되면 ‘추리 이어하기’로 돌아오세요.</p></div>${r.records.filter(x=>x.code==='wrong'&&x.issue===id).length?`<details><summary>내가 제출했던 판단</summary>${r.records.filter(x=>x.code==='wrong'&&x.issue===id).slice(-3).map(x=>`<p>${esc(D.deductions.find(d=>d.id===id).claims.find(c=>c.id===x.claim).text)}</p>`).join('')}</details>`:''}</section>`,`${btn('조사할 곳 추천','loop-guide','','secondary')}${btn('현장 살펴보기','resume-investigation','','primary')}`,'compact');}
function runLibraryModal(){return templateModal('수집한 자료',`<div class="stack">${G.evidence.map(id=>btn(esc(D.evidence[id].name),'evidence',`data-id="${id}"`)).join('')||'<p>아직 모은 자료가 없습니다. 조사로 돌아가 사람과 현장을 확인하세요.</p>'}</div>`);}
function judgmentRecord(id){if(!G.solved.includes(id))return templateModal('사건 기록','<p>아직 입증하지 않은 내용입니다.</p>');const d=D.deductions.find(d=>d.id===id);return templateModal(d.name,`<p>${esc(d.result)}</p><div class="stack">${d.proof.filter(e=>G.evidence.includes(e)).map(e=>btn(esc(D.evidence[e].name),'evidence',`data-id="${e}"`)).join('')}</div><p class="help-text">이미 입증한 기록입니다. 다시 제출할 필요가 없습니다.</p>`);}
function loopCasePage(){return `<section class="workspace friendly-case" data-scroll="casePage"><div class="workspace-head"><div><span class="eyebrow">사건 수첩</span><h2>알아낸 것과 남은 질문</h2></div>${btn(G.reasoning.attempt?'추리 이어하기':'추리 시작','reasoning-start','','primary',!RUN.canStart(G))}</div>${recapContent()}<section class="loop-summary"><h3>입증한 내용</h3><div class="stack">${G.solved.filter(id=>RUN.core.includes(id)).map(id=>btn('✓ '+esc(RUN.rules[id].title),'judgment-record',`data-id="${id}"`)).join('')||'<p>모은 자료를 바탕으로 추리 페이즈에서 판단을 제시할 수 있습니다.</p>'}</div></section><details><summary>시간표·개인 수첩·추가 대조</summary>${btn('자세한 기록 열기','advanced-case','','secondary')}</details></section>`;}

const actions={
 'begin-case'(){G.reasoning.briefed=true;type.key=null;U.mode='talk';persist();render();},
 'reasoning-start':beginReasoning,
 'reasoning-issue'(b){openRunProof(b.dataset.id);},
 'reasoning-leave'(){leaveReasoning('voluntary');},
 'reasoning-lack'(){leaveReasoning('lack');},
 'run-library'(){openAux('run-library');},
 'return-note'(){openAux('run-return');},
 'resume-investigation'(){closeAll();U.mode='visit';render();persist();},
 'judgment-record'(b){openAux('judgment-record',{id:b.dataset.id},!!aux);},
 'loop-guide'(){if(RUN.started(G))leaveReasoning('voluntary',false);closeAll();guideNext();},
 'loop-intro-close'(){G.reasoning.introSeen=true;persist();render();},

 'reading-preset'(b){
  const comfortable=b.dataset.id==='comfortable';
  const values=comfortable?{textSize:1.15,instant:true,textEffects:false,punctuationPause:false,characterMotion:false,atmosphere:false}:{textSize:1,instant:false,speed:25,textEffects:true,punctuationPause:true,sceneEffects:true,impactEffects:true,characterMotion:true,atmosphere:true};
  Object.assign(C,values);pauseAuto();SOUND.stopSpeech();applySettings();S.saveConfig(C);renderAux();toast(comfortable?'문장을 바로 읽는 설정으로 바꿨습니다.':'차분한 장면과 대사 출력으로 바꿨습니다.');
 },
 'receipt-open'(){if((U.receiptIds||[]).length===1)openEvidence(U.receiptIds[0]);else openAux('receipt');},
 'proof-edit'(){if(aux.data.session&&G.solved.includes(aux.data.id)){openAux('judgment-record',{id:aux.data.id},true);return;}aux.data.result=null;renderAux();},
 'return-field':returnToField,
 'new-evidence'(){rememberField();U.evidenceFilter='new';U.evidenceSearch='';U.evidenceOrder='recent';setMode('evidence');},
 'last-result'(){openAux('recent');},
 'context-help'(){const proof=aux?.kind==='proof'?aux.data.id:null,level=proof?(aux.data.hintLevel||U.proofDrafts?.[proof]?.hintLevel||0):0;openAux('context-help',{proof,level},!!aux);},
 'hint-more'(){
  aux.data.level=Math.min(3,(aux.data.level||0)+1);const id=aux.data.proof;
  const prev=auxBack.slice().reverse().find(x=>x.kind==='proof'&&x.data.id===id);
  if(prev)prev.data.hintLevel=aux.data.level;
  if(id&&U.proofDrafts?.[id]){U.proofDrafts[id].hintLevel=aux.data.level;persist();}
  renderAux();$('.hint-step:last-of-type')?.scrollIntoView({block:'nearest'});
 },
 'help-go'(){closeAll();guideNext();},
 'proof-next'(){if(aux?.data.session){closeAll();RUN.advance(G);U.mode='reasoning';persist();render();return;}closeAll();guideNext();},
 'source-for-proof'(b){const q=auxBack.slice().reverse().find(x=>x.kind==='proof');if(!q||!G.evidence.includes(b.dataset.id))return;q.data.proofs=[...new Set([...q.data.proofs,b.dataset.id])];q.data.result=null;while(auxBack.length&&aux.kind!=='proof')closeAux();saveProofDraft();},

 'guide-next':guideNext,
 recap(){openAux('recap');},
 'visit-place'(){if(RUN.started(G)){leaveReasoning('voluntary');return;}if(G.dialogue?.kind==='scene'){toast('진행 중인 장면을 먼저 확인해 주세요.');return;}rememberField();M.suspendTopic(G);G.dialogue=null;pauseAuto();SOUND.stopSpeech();U.mode='visit';render();persist();},
 'advanced-case'(){U.advancedCase=true;render();},
 'simple-case'(){U.advancedCase=false;U.caseTab='overview';render();},
 'dialogue-choice'(b){pauseAuto();SOUND.stopSpeech();const r=M.chooseDialogue(G,b.dataset.id);type.key=null;afterAdvance(r);render();},

 about(){openAux('about',{},!!aux);},

 'case-tab'(b){U.caseTab=b.dataset.id;render();$('#case-tab-'+U.caseTab)?.focus({preventScroll:true});persist();},
 'clear-filter'(){U.evidenceSearch='';U.evidenceFilter='all';render();},
 bookmark(b){const id=b.dataset.id;if(!G.evidence.includes(id))return;G.bookmarks=G.bookmarks.includes(id)?G.bookmarks.filter(e=>e!==id):[...G.bookmarks,id];persist();renderAux();},
 activity(b){const id=b.dataset.id,a=D.activities[id];if(!M.available(G,a))return;const draft=JSON.parse(JSON.stringify(G.activityDrafts[id]||(a.kind==='order'?{order:[...a.initial]}:{})));openAux('activity',{id,draft,result:null});},
 'activity-submit'(){const a=aux.data;const result=M.checkActivity(G,a.id,a.draft);a.result=result;G.activityDrafts[a.id]=JSON.parse(JSON.stringify(a.draft));persist();if(result.ok)sound('solve');renderAux();P.result(result.ok);$('.feedback')?.scrollIntoView({block:'nearest'});},
 'activity-reset'(){const a=aux.data;confirm('대조 초안을 비울까요?','획득한 자료와 이미 완료한 판단은 유지됩니다.',()=>{const rule=D.activities[a.id],draft=rule.kind==='order'?{order:[...rule.initial]}:{};G.activityDrafts[a.id]=draft;openAux('activity',{id:a.id,draft,result:null});persist();});},
 'order-up'(b){reorderActivity(b.dataset.id,-1);},'order-down'(b){reorderActivity(b.dataset.id,1);},
 'delivery-plan'(b){const plan=b.dataset.id;confirm('이 전달안을 제안할까요?',plan==='screening'?'본인 확인본과 요청을 먼저 확인하고 직원들의 명시적인 답변을 기록합니다. 무응답이나 다른 범위의 허락을 동의로 처리하지 않습니다.':'합본 상영이나 외부 공개 없이 본인의 인터뷰부터 돌려주는 안입니다.',()=>{M.setDelivery(G,plan);persist();render();});},
 'delivery-reset'(){confirm('전달안을 다시 작성할까요?','아직 전달 전입니다. 이전 안에 대한 답변을 새 안의 동의로 옮기지 않으며 새롭게 확인해야 합니다.',()=>{G.delivery={plan:null,previews:[]};G.consents={};persist();render();});},
 preview(b){openAux('preview',{id:b.dataset.id,index:0});},
 'preview-next'(){const d=aux.data;if(d.index<D.previews[d.id].lines.length-1){d.index++;renderAux();}else{M.preview(G,d.id);persist();closeAll();}},
 'settings-reset'(){confirm('설정을 기본값으로 복원할까요?','게임 진행, 메모와 저장 슬롯은 유지됩니다.',()=>{C={...S.defaults};S.saveConfig(C);applySettings();render();openAux('settings');});},
 'delete-slot'(b){const id=b.dataset.id;confirm('이 저장 슬롯을 삭제할까요?','다른 슬롯과 현재 진행은 유지됩니다.',()=>{S.remove(id);openAux('saves',{mode:'load'});});},
 new(){if(latest()||G)confirm('처음부터 시작할까요?','자동 저장은 새 진행으로 바뀝니다. 수동 저장 슬롯은 유지됩니다.',newGame);else newGame();},
 continue(){const v=latest();if(v)loaded(v);},
 mode(b){setMode(b.dataset.mode);},
 person(b){const id=b.dataset.id;if(G.dialogue?.kind==='scene'){toast('진행 중인 장면을 먼저 확인해 주세요.');return;}if(M.locationOf(G,id)!==G.location)return;rememberField();if(G.dialogue&&M.dialogueData(G)?.npc!==id){M.suspendTopic(G);G.dialogue=null;}U.npc=id;U.mode='talk';U.rail=false;if(!G.dialogue)type.key=null;pauseAuto();SOUND.stopSpeech();render();persist();},
 topic(b){startTopic(b.dataset.id);},
 advance(b,e){if(e?.detail>1)return;advanceDialogue();},
 inspect(b){const id=b.dataset.id;if(G.dialogue)return;M.inspect(G,id);type.key=null;pauseAuto();persist();render();},
 goal(){U.goal=!U.goal;render();},'rail-toggle'(){U.rail=!U.rail;render();},
 'hotspot-toggle'(){C.hotspots=!C.hotspots;try{S.saveConfig(C)}catch(e){toast(e.message,true);}render();},
 auto(){if(aux?.kind==='pause')closeAll();if(!G?.dialogue||G.dialogue.remote||G.dialogue.awaitingChoice){toast('질문과 선택은 자동으로 진행하지 않습니다.');return;}auto=!auto;document.querySelectorAll('[data-act="auto"]').forEach(b=>b.setAttribute('aria-pressed',auto));document.querySelectorAll('.inline-dialogue-controls [data-act=auto]').forEach(b=>b.textContent=auto?'자동 켜짐':'자동');if(auto)scheduleAuto();else pauseAuto();},
 skip(){if(aux?.kind==='pause')closeAll();skipRead();},
 evidence(b){openEvidence(b.dataset.id,!!aux);},
 'compare-view'(b){if(M.all(G.evidence,compareViews[b.dataset.id]?.ids||['missing']))openAux('compare',{id:b.dataset.id},true);},
 'play-evidence-audio'(b){if(!G.evidence.includes(b.dataset.id))return;const txt=evidenceAudioText(b.dataset.id),ok=SOUND.speak(txt,{enabled:true,rate:C.voiceRate,key:'evidence-'+b.dataset.id,volume:C.voiceVolume,channel:'evidence'});if(!ok)toast('이 기기에서 한국어 읽어주기를 사용할 수 없습니다. 전사로 확인해 주세요.',true);},
 move(b){switchPlace(b.dataset.id);},
 'go-talk'(b){const id=b.dataset.id;switchPlace(M.locationOf(G,id),id);},
 statements(b){openAux('statements',{id:b.dataset.id});},
 'topic-log'(b){openAux('topic-log',{id:b.dataset.id},true);},
 phone(b){if(G.dialogue?.kind==='scene'){U.mode='talk';render();toast('진행 중인 장면을 먼저 확인해 주세요.');return;}const id=b.dataset.id,first=D.topics.find(t=>t.npc===id&&t.phone);if(!G.topicsRead.includes(first.id)){startTopic(first.id);}else openAux('phone-menu',{id});},
 'phone-topic'(b){const id=b.dataset.id;closeAll();startTopic(id);},
 'resume-talk'(){if(G.dialogue?.remote)openAux('phone',{npc:M.topic(G.dialogue.ref).npc});else{U.mode='talk';render();}},
 'phone-next'(){if(!G.dialogue)return;const r=M.advance(G);afterAdvance(r);renderAux();persist();},
 deduction(b){const id=b.dataset.id;if(RUN.isLoop(G)&&RUN.core.includes(id)){if(G.solved.includes(id)){openAux('judgment-record',{id});return;}if(!RUN.exposed(G,id))return;if(!RUN.started(G))beginReasoning();openRunProof(id);return;}if(!M.availableDeductions(G).some(d=>d.id===id))return;const draft=U.proofDrafts?.[id]||{};openAux('proof',{id,claim:draft.claim||null,proofs:[...(draft.proofs||[])],search:draft.search||'',filter:draft.filter||'all',compare:!!draft.compare,allSources:!!draft.allSources,sourceOpen:draft.sourceOpen||{},sourceTop:Math.max(0,draft.sourceTop||0),hintLevel:draft.hintLevel||0,result:null});},
 claim(b){aux.data.claim=b.dataset.id;aux.data.result=null;saveProofDraft();renderAux();},
 'proof-scope'(){aux.data.allSources=!aux.data.allSources;aux.data.search='';aux.data.filter='all';saveProofDraft();renderAux();},
 'proof-remove'(b){actions['proof-evidence'](b);},
 'proof-evidence'(b){const p=aux.data,id=b.dataset.id;p.proofs=p.proofs.includes(id)?p.proofs.filter(x=>x!==id):[...p.proofs,id];p.result=null;saveProofDraft();const panel=$('.friendly-sources')||$('.proof-evidence'),st=panel?.scrollTop||0;renderAux();const next=$('.friendly-sources')||$('.proof-evidence');if(next)next.scrollTop=st;},
 compare(){aux.data.compare=true;saveProofDraft();renderAux();},
 'proof-filter-reset'(){aux.data.search='';aux.data.filter='all';saveProofDraft();renderAux();},
 'submit-proof'(){const p=aux.data,wasSolved=G.solved.includes(p.id);saveProofDraft();p.result=M.prove(G,p.id,p.claim,p.proofs);const result=p.result;if(result.ok){U.lastResult={kind:'proof',ref:p.id};if(!wasSolved)sound('solve');}persist();if(result.returned){leaveReasoning('mistakes');return;}renderAux();P.result(result.ok);$('.feedback')?.scrollIntoView({block:'nearest'});if(result.ok)overlay.querySelector('[data-act=proof-next]')?.focus({preventScroll:true});},
 'present-evidence'(b){const id=b.dataset.id,npc=U.npc,candidates=M.questions(G,npc).filter(t=>t.need?.includes(id));if(candidates.length){const chosen=candidates.find(t=>!G.topicsRead.includes(t.id))||candidates[0];closeAll();startTopic(chosen.id);}else openAux('message',{title:'지금 제시할 질문',text:'이 자료만으로 새로운 질문이 열리지는 않습니다. 관련 진술과 다른 자료를 더 확인할 수 있습니다.'},true);},
 followup(){if(RUN.started(G))leaveReasoning('round',false);confirm('검사 의뢰를 마칠까요?','현장 기록과 물품의 비교 결과는 며칠 뒤 확인합니다. 기존 자료와 진술은 그대로 남습니다.',()=>{M.beginFollowup(G);U.mode='talk';U.npc='jisu';type.key=null;persist();render();});},
 final(){if(RUN.started(G))leaveReasoning('story',false);confirm('한지수와 재면담할까요?','확보한 자료를 토대로 맞는 설명과 실제 행동을 구분해 묻습니다.',()=>{M.beginFinal(G);U.mode='talk';U.npc='jisu';type.key=null;persist();render();});},
 consent(b){openAux('consent',{id:b.dataset.id});},
 'record-consent'(b){M.consent(G,b.dataset.id);persist();closeAll();toast('당사자가 답한 범위 그대로 기록했습니다.');},
 ending(){M.beginEnding(G);U.mode='talk';U.npc='seoa';type.key=null;persist();render();},
 log(){openAux('log');},settings(){openAux('settings',{},!!aux);},pause(){openAux('pause');},help(){openAux('help',{},true);},
 'save-menu'(){openAux('saves',{mode:'save'},!!aux);},'load-menu'(){openAux('saves',{mode:'load'},!!aux);},
 'save-slot'(b){const id=b.dataset.id;let exists;try{exists=S.get(id);}catch(e){exists=true;}const save=()=>{try{S.put(id,G,U);toast('슬롯 '+id+'에 저장했습니다.');openAux('saves',{mode:'save'});}catch(e){toast(e.message,true);}};if(exists)confirm('슬롯 '+id+'을 덮어쓸까요?','이 슬롯의 이전 진행은 현재 진행으로 바뀝니다.',save);else save();},
 'load-slot'(b){const id=b.dataset.id;let value;try{value=S.get(id);}catch(e){toast(e.message,true);return;}if(!value)return;const load=()=>{closeAll();loaded(value);};if(G)confirm('저장한 진행을 불러올까요?','현재 진행은 이 슬롯의 상태로 바뀝니다. 필요한 진행은 먼저 다른 슬롯이나 파일로 저장하세요.',load);else load();},
 'export-save':exportSave,'import-save'(){pauseAuto();$('#importFile').click();},
 title(){const leave=()=>{persist();G=null;pauseAuto();type.key=null;render();};if(G)confirm('시작 화면으로 돌아갈까요?',storageWarning?'브라우저 저장에 문제가 있습니다. 먼저 진행을 파일로 내보내는 것이 안전합니다.':'현재 진행은 자동 저장됩니다. 수동 저장 슬롯도 유지됩니다.',leave);else closeAll();},
 'close-aux':closeAux,
 'confirm-action'(){const fn=aux.data.action;auxBack=[];closeAll();fn();},
 zoom(b){aux.data.zoom=Math.min(2.8,Math.max(.4,(aux.data.zoom||1)+Number(b.dataset.delta)));fitDoc();},
 'zoom-reset'(){aux.data.zoom=1;$('#docViewport').scrollTo(0,0);fitDoc();},
 'audio-mute'(){C.audioMuted=!C.audioMuted;pauseAuto();try{S.saveConfig(C);}catch(e){toast(e.message,true);}render();updateAmbient();if(!C.audioMuted)SOUND.unlock();},
 'sound-enable'(){updateAmbient();SOUND.unlock();toast(C.audioMuted?'음소거가 켜져 있습니다.':'음악을 재생합니다.');},
 'sound-test'(){updateAmbient();SOUND.unlock();sound('evidence');},
 'effects-preview'(){showEffectSample();}
};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b||b.disabled)return;if(aux&&!overlay.contains(b))return;e.stopPropagation();try{
 const act=b.dataset.act;actions[act]?.(b,e);updateAmbient();
 // Activate AFTER the start/load action resolved its destination. Never prime a title sting first.
 if(G&&!SOUND.status().unlocked&&['new','continue','load-slot','confirm-action'].includes(act))SOUND.unlock();
 if(!['advance','phone-next','sound-test','sound-enable','submit-proof','activity-submit'].includes(act))sound();
}catch(error){console.error(error);toast(error.message||'동작 중 오류가 발생했습니다.',true);}});
function reorderActivity(id,direction){const d=aux.data,order=d.draft.order,index=order.indexOf(id),next=index+direction;if(next<0||next>=order.length)return;[order[index],order[next]]=[order[next],order[index]];d.result=null;G.activityDrafts[d.id]=JSON.parse(JSON.stringify(d.draft));const y=$('.modal-body').scrollTop;renderAux();$('.modal-body').scrollTop=y;document.getElementById((direction<0?'order-up-':'order-down-')+id)?.focus({preventScroll:true});persist();}
let noteTimer=null,searchTimer=null,composing=false;
function searchInput(target){
 const isLog=target.id==='logSearch',isProof=target.dataset.uiSearch==='proof';
 if(!isLog&&!isProof&&target.dataset.uiSearch!=='evidence')return false;
 const value=target.value.slice(0,200),position=target.selectionStart;
 if(isLog&&aux?.kind==='log')aux.data.search=value;
 else if(isProof&&aux?.kind==='proof')aux.data.search=value;
 else if(!isLog&&!isProof)U.evidenceSearch=value;else return true;
 clearTimeout(searchTimer);
 searchTimer=setTimeout(()=>{
  if(composing||!target.isConnected)return;
  if(isLog){if(aux?.kind!=='log')return;renderAux();}
  else if(isProof){if(aux?.kind!=='proof')return;saveProofDraft();renderAux();}
  else {if(U.mode!=='evidence'||aux)return;render();}
  const el=document.getElementById(target.id);if(el){el.focus({preventScroll:true});el.setSelectionRange(position,position);}
 },180);return true;
}
document.addEventListener('compositionstart',()=>{composing=true;clearTimeout(searchTimer);});
document.addEventListener('compositionend',e=>{composing=false;if(!searchInput(e.target)&&e.target.id==='personalNotes')e.target.dispatchEvent(new Event('input',{bubbles:true}));});
document.addEventListener('input',e=>{
 if(e.isComposing||composing)return;
 if(searchInput(e.target))return;
 if(e.target.id==='personalNotes'){G.notes=e.target.value.slice(0,12000);$('#notesStatus').textContent=G.notes.length+' / 12,000자 · 저장 중';clearTimeout(noteTimer);noteTimer=setTimeout(()=>{persist();if($('#notesStatus'))$('#notesStatus').textContent=G.notes.length+' / 12,000자'+(storageWarning?' · 파일로 보관 필요':' · 저장됨');},400);return;}
 if(e.target.dataset.work&&aux?.kind==='activity'){aux.data.draft[e.target.dataset.work]=e.target.value;aux.data.result=null;G.activityDrafts[aux.data.id]=JSON.parse(JSON.stringify(aux.data.draft));persist();return;}
 if(e.target.type==='range'&&e.target.dataset.config){C[e.target.dataset.config]=Number(e.target.value);const out=$('#out-'+e.target.dataset.config);if(out)out.textContent=Math.round(Number(e.target.value)*100)+'%';applySettings();}
});
document.addEventListener('change',e=>{if(e.target.id==='evidenceOrder'){U.evidenceOrder=e.target.value;render();persist();return;}
 if(e.target.dataset.uiFilter==='proof'&&aux?.kind==='proof'){aux.data.filter=e.target.value;saveProofDraft();renderAux();return;}
 if(e.target.dataset.uiFilter==='evidence'){U.evidenceFilter=e.target.value;render();persist();return;}
 if(e.target.dataset.workProof&&aux?.kind==='activity'){const key=e.target.dataset.workProof+'_sources',arr=aux.data.draft[key]||[];aux.data.draft[key]=e.target.checked?[...new Set([...arr,e.target.value])]:arr.filter(v=>v!==e.target.value);aux.data.result=null;G.activityDrafts[aux.data.id]=JSON.parse(JSON.stringify(aux.data.draft));persist();return;}
 if(e.target.dataset.work&&aux?.kind==='activity'){aux.data.draft[e.target.dataset.work]=e.target.value;aux.data.result=null;G.activityDrafts[aux.data.id]=JSON.parse(JSON.stringify(aux.data.draft));persist();return;}
 const key=e.target.dataset.config;if(!key)return;C[key]=e.target.type==='checkbox'?e.target.checked:Number(e.target.value);if((key==='voice'&&!C.voice)||(key==='voiceVolume'&&!C.voiceVolume))SOUND.stopSpeech();applySettings();try{S.saveConfig(C);}catch(error){toast(error.message,true);}
});
$('#importFile').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{if(file.size>2*1024*1024)throw Error('진행 파일이 너무 큽니다. 올바른 저장 파일인지 확인하세요.');const v=S.decode(await file.text());const load=()=>{closeAll();loaded(v);updateAmbient();SOUND.unlock();};if(G)confirm('진행 파일을 불러올까요?','현재 진행은 가져온 파일의 상태로 바뀝니다.',load);else load();}catch(error){toast(error.message,true);}});
document.addEventListener('keydown',e=>{
 if(e.isComposing)return;if(e.repeat&&[' ','Enter'].includes(e.key)&&!e.target.matches('input,select,textarea,[contenteditable=true]')){e.preventDefault();return;}const target=e.target,editing=target.matches('input,select,textarea,[contenteditable=true]');
 if(aux){if(e.key==='Escape'){e.preventDefault();closeAux();return;}if(e.key==='Tab'){const focus=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>x.getClientRects().length>0&&getComputedStyle(x).visibility!=='hidden'&&!x.closest('[hidden],[inert]'));const first=focus[0],last=focus[focus.length-1];if(e.shiftKey&&(document.activeElement===first||!focus.includes(document.activeElement))){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||!focus.includes(document.activeElement))){e.preventDefault();first?.focus();}return;}if(editing)return;
 }else{if(editing)return;if(e.key==='Escape'){e.preventDefault();if(!G)return;if(!isFieldMode(U.mode))returnToField();else if(U.mode==='inspect')setMode('visit');else openAux('pause');return;}if(e.code==='Space'&&G&&['talk','inspect'].includes(U.mode)&&(target===document.body||target.id==='lineButton'||target.id==='main')){e.preventDefault();advanceDialogue();return;}}
 if(!aux&&target.matches('[role="tab"][data-act="case-tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
  const tabs=[...document.querySelectorAll('.case-tabs [role="tab"]')],i=tabs.indexOf(target);
  const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  e.preventDefault();actions['case-tab'](tabs[next]);return;
 }
 if(['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)&&target.tagName==='BUTTON'){
  const list=target.closest('.question-list,.rail,.main-nav,.proof-evidence,.proof-claims,.title-menu,.card-grid,.map-grid,.stack');if(list){const buttons=[...list.querySelectorAll('button:not(:disabled)')].filter(b=>b.getClientRects().length&&(!b.closest('details:not([open])')||b.closest('summary'))),i=buttons.indexOf(target),next=e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1;e.preventDefault();buttons[(i+next+buttons.length)%buttons.length]?.focus();}
 }
});
document.addEventListener('load',e=>{if(e.target.matches?.('.actor,.bg'))requestLayout();},true);
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'){e.target.classList.add('lost-asset');e.target.alt='이미지를 읽지 못했습니다: '+(e.target.dataset.asset||'자료');toast('일부 이미지를 읽지 못했습니다. 압축을 풀고 에셋 폴더가 함께 있는지 확인하세요.',true);}},true);
window.addEventListener('resize',()=>{requestLayout();if(aux?.kind==='evidence')fitDoc();});
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();if(document.hidden){pauseAuto();clearTimeout(typeTimer);SOUND.stopSpeech();persist();}else if(!aux)paintLine();P.configure(C);updateAmbient();});
setInterval(()=>{const now=Date.now(),delta=Math.min((now-lastTick)/1000,2);lastTick=now;if(G&&!G.completed&&!document.hidden&&!['pause','saves','settings'].includes(aux?.kind))G.elapsed+=delta;},1000);
window.addEventListener('beforeunload',()=>persist());
window.addEventListener('pageshow',()=>{lastTick=Date.now();P.configure(C);updateAmbient();if(!document.hidden&&!aux&&G)paintLine();});
function refreshVoiceSupport(){const available=SOUND.hasKoreanVoice(),control=$('#cfg-voice');if(control)control.disabled=!available;const label=$('#voiceAvailability');if(label)label.textContent='성우 연기가 아닌 기기의 읽기 기능'+(available?'':' · 이 환경에 한국어 음성이 없음');document.querySelectorAll('[data-act="play-evidence-audio"]').forEach(b=>b.disabled=!available);}
window.speechSynthesis?.addEventListener?.('voiceschanged',refreshVoiceSupport);setInterval(()=>{if(G&&!document.hidden)persist();},30000);

document.addEventListener('toggle',e=>{const el=e.target;if(el.isConnected&&el.matches?.('details[data-source]')&&aux?.kind==='proof'){aux.data.sourceOpen=aux.data.sourceOpen||{};aux.data.sourceOpen[el.dataset.source]=el.open;saveProofDraft();}if(el.matches?.('details[data-source]')&&el.open&&G?.evidence.includes(el.dataset.source)&&!G.viewed.includes(el.dataset.source)){G.viewed.push(el.dataset.source);persist();}if(el.matches?.('details.past-judgments'))U.pastJudgments=el.open;if(el.matches?.('details.extra-questions')){U.moreQuestions=U.moreQuestions||{};U.moreQuestions[el.dataset.npc]=el.open;}},true);
// Read-only automation diagnostics. No player-facing debug screens or mutable cheats.
window.GAME_DIAGNOSTICS={snapshot:()=>JSON.parse(JSON.stringify({game:G,ui:{mode:U.mode,npc:U.npc,modal:aux?.kind||null,returnContext:U.returnContext||null,lastResult:U.lastResult||null,proof:aux?.kind==='proof'?aux.data:null},auto,settings:C})),assets:()=>Object.keys(A),audio:()=>SOUND.status(),presentation:()=>P.stats()};
window.addEventListener('game-audio-warning',e=>toast(e.detail.message,true));
window.addEventListener('pageshow',()=>updateAmbient());
applySettings();render();
})();
