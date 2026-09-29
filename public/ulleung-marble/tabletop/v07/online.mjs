import {LABELS,TYPES,effectText,optionCondition} from './engine.mjs';
const API='/api/ulleung/rooms',KEY='ulleung-online-sessions-v1';
const app=document.querySelector('#online-app'),connection=document.querySelector('#connection');
const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=(file)=>'/ulleung-marble/assets/v07/'+file;
const colors=['#2d7b80','#d59139','#a96875','#667b88','#476d92','#b76d3d','#748b48','#8d8466'];
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>alphabet[n%32]).join('');
const newToken=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
let data,room=null,credentials=null,pending=false,polling=false,timer,noticeTimer,connected=true,selectedDestination=null;
const sessions=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return {};}};
function saveSession(code,token,name){const all=sessions();all[code]={token,name,at:Date.now()};localStorage.setItem(KEY,JSON.stringify(Object.fromEntries(Object.entries(all).sort((a,b)=>b[1].at-a[1].at).slice(0,8))));credentials={code,token,name};}
function notify(message){const el=document.querySelector('#online-notice');el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.hidden=true,6500);}
function setConnection(ok){connected=ok;connection.textContent=room?(ok?'접속됨 · 자동 저장':'연결 확인 중'):'대기실';connection.classList.toggle('disconnected',!ok);}
async function request(body=null){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(API+(body?'':'?code='+credentials.code),{method:body?'POST':'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+credentials.token},body:body?JSON.stringify({...body,code:credentials.code}):undefined,cache:'no-store',signal:controller.signal});
  const raw=await response.text();let result;try{result=JSON.parse(raw);}catch{throw Error('온라인 방은 운영 사이트에서 이용할 수 있습니다. 아래 운영 사이트 링크로 접속해 주세요.');}
  if(!response.ok){const error=new Error(result.error||'접속을 확인해 주세요.');error.status=response.status;throw error;}
  setConnection(true);return result;
 }catch(error){if(!error.status)setConnection(false);if(error.name==='AbortError')throw Error('연결에 시간이 걸리고 있습니다. 다시 연결하면 저장된 진행을 불러옵니다.');throw error;}finally{clearTimeout(timeout);}
}
function accept(next){if(!next||next.left)return;if(room&&next.code===room.code&&next.revision<room.revision)return;const changed=!room||next.revision!==room.revision;room=next;setConnection(true);if(changed)render();}
async function poll(){if(!credentials||!room||pending||polling||document.hidden)return;polling=true;try{accept(await request());}catch(err){if([403,404,410].includes(err.status)){room=null;clearInterval(timer);renderJoin();notify(err.message);}else{setConnection(false);}}finally{polling=false;}}
function startPolling(){clearInterval(timer);timer=setInterval(poll,2200);}
async function command(type,value){
 if(pending||!room)return;pending=true;lock();
 const requestId=crypto.randomUUID(),revision=room.revision;
 try{const next=await request({type,value,revision,requestId});if(next.left){const all=sessions();delete all[credentials.code];localStorage.setItem(KEY,JSON.stringify(all));credentials=null;room=null;history.replaceState(null,'',location.pathname);clearInterval(timer);renderJoin();}else accept(next);}
 catch(err){notify(err.message);if(err.status===409)try{accept(await request());}catch{} }
 finally{pending=false;unlock();}
}
function lock(){app.setAttribute('aria-busy','true');app.querySelectorAll('[data-command],#ready,#start,#character-select,#arrival-select,.map-stop,.destination-list button').forEach(b=>b.disabled=true);}
function unlock(){app.removeAttribute('aria-busy');if(room)render();}
function bindCommands(){app.querySelectorAll('[data-command]').forEach(button=>button.onclick=()=>command(button.dataset.command,button.dataset.value===undefined?undefined:JSON.parse(button.dataset.value)));bindInspect(app);}
const action=(text,type,value,cls='primary full',disabled=false)=>`<button class="${cls}" data-command="${type}" ${value!==undefined?`data-value="${e(JSON.stringify(value))}"`:''} ${disabled?'disabled':''}>${text}</button>`;
function renderJoin(){
 setConnection(true);const code=new URLSearchParams(location.search).get('room')||'',saved=sessions(),recent=Object.entries(saved).sort((a,b)=>b[1].at-a[1].at).slice(0,3);
 app.innerHTML=`<div class="join-shell"><section class="join-story"><p class="eyebrow">친구들과 함께 · 4–8명</p><h1>같은 섬에서,<br>서로 다른 여행을.</h1><p>방을 만들고 초대 코드를 보내 주세요.<br>각자의 화면에서 여행자를 고르면 준비 끝.</p><img src="${asset('promo/coast-bright.webp')}" alt="울릉도의 바다와 해안"></section><section class="join-form"><label for="nickname">친구들이 알아볼 닉네임</label><input id="nickname" maxlength="16" autocomplete="nickname" placeholder="예: 바다여행자"><button id="create-room" class="primary">새 여행방 만들기 →</button><div class="join-divider"><label for="room-code">받은 초대 코드</label><input id="room-code" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${e(code)}" placeholder="6자리 코드"><button id="join-room">친구의 방에 참가</button></div><p class="join-help">회원가입 없이 함께합니다. 진행은 자동 저장되며, 같은 기기·브라우저에서 다시 접속할 수 있어요. 음성 대화는 친구들과 평소 쓰는 통화를 이용해 주세요.</p>${recent.map(([c,s])=>`<div class="resume-room"><b>${e(s.name)} · ${c}</b><button data-resume="${c}">이 방 이어 하기</button></div>`).join('')}${location.hostname==='localhost'||location.hostname==='127.0.0.1'?'<p class="join-help"><a href="https://dullg-landing-one.vercel.app/ulleung-marble/ulleung-marble/tabletop/v07/online.html">운영 사이트에서 온라인 방 열기 ↗</a></p>':''}</section></div>`;
 async function enter(type){
  if(pending)return;const name=app.querySelector('#nickname').value.trim(),code=type==='create'?newCode():app.querySelector('#room-code').value.trim().toUpperCase();
  if(!name||name.length>16){notify('닉네임을 1~16자로 입력해 주세요.');app.querySelector('#nickname').focus();return;}
  if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code)){notify('초대 코드 6자리를 확인해 주세요.');app.querySelector('#room-code').focus();return;}
  const existing=sessions()[code];saveSession(code,existing?.token||newToken(),name);pending=true;
  app.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const next=await request({type,name});history.replaceState(null,'',location.pathname+'?room='+code);accept(next);startPolling();}catch(err){notify(err.message);renderJoin();}finally{pending=false;if(room)render();}
 }
 app.querySelector('#create-room').onclick=()=>enter('create');app.querySelector('#join-room').onclick=()=>enter('join');
 app.querySelector('#room-code').onkeydown=evt=>{if(evt.key==='Enter')enter('join');};
 app.querySelectorAll('[data-resume]').forEach(b=>b.onclick=()=>resume(b.dataset.resume));
}
async function resume(code){const saved=sessions()[code];if(!saved)return;credentials={code,...saved};try{const next=await request();saveSession(code,saved.token,saved.name);history.replaceState(null,'',location.pathname+'?room='+code);accept(next);startPolling();}catch(err){renderJoin();notify(err.message);}}
function shareLink(){const url=new URL(location.href);url.search='?room='+room.code;return url.href;}
async function copyInvite(){try{await navigator.clipboard.writeText(shareLink());notify('초대 링크를 복사했습니다. 친구에게 보내 주세요.');}catch{notify('주소창의 링크 또는 초대 코드 '+room.code+'를 친구에게 알려 주세요.');}}
function renderLobby(){
 const me=room.members.find(m=>m.id===room.me),host=room.host===room.me,ready=room.members.length>=4&&room.members.every(m=>m.ready);
 app.innerHTML=`<section class="lobby"><header class="lobby-top"><div><p class="eyebrow">함께 떠날 여행자 ${room.members.length} / 8</p><h1>친구들이 모이면 출발해요.</h1><p>각자 여행자와 출발 항구를 고르고 준비를 눌러 주세요.</p></div><div class="invite-code"><div><small>초대 코드</small><strong>${room.code}</strong></div><button id="copy-invite">링크 복사</button></div></header><div class="lobby-grid"><div class="lobby-members">${room.members.map(m=>`<article class="lobby-member ${m.id===room.me?'mine':''}"><img src="${asset('portraits/traveler-'+m.character+'.jpg')}" alt="${e(data.characters[m.character].name)}"><div><b>${e(m.name)} ${m.id===room.me?'· 나':''}</b><small>${e(data.characters[m.character].name)} · ${m.arrival==='cruise'?'사동항':'도동항'}</small><small class="${m.ready?'ready':''}">${m.ready?'✓ 준비 완료':'여행 준비 중'}${m.id===room.host?' · 방장':''}</small>${host&&m.id!==room.me?`<button class="quiet" data-remove="${m.id}">대기실에서 내보내기</button>`:''}</div></article>`).join('')}${Array.from({length:Math.max(0,4-room.members.length)},()=>'<div class="lobby-empty">친구를 기다리는 자리</div>').join('')}</div><aside class="lobby-sidebar"><h2>나의 여행 준비</h2><label for="character-select">여행자</label><select id="character-select">${data.characters.map(c=>`<option value="${c.id}" ${me.character===c.id?'selected':''} ${room.members.some(m=>m.id!==room.me&&m.character===c.id)?'disabled':''}>${e(c.name)} · ${e(c.job)}</option>`).join('')}</select><label for="arrival-select">울릉도로 들어가는 배</label><select id="arrival-select"><option value="cruise" ${me.arrival==='cruise'?'selected':''}>크루즈 · 사동항 출발</option><option value="fast" ${me.arrival==='fast'?'selected':''}>쾌속선 · 도동항 출발</option></select><p class="arrival-info">${me.arrival==='cruise'?'피로 0장 · 첫 이동 주사위 1개':'피로 1장 · 첫 이동 주사위 2개'}<br>모두 여행 예산 50만원으로 시작합니다.</p><button data-inspect="sheets&character=${me.character}">여행자북 읽어 보기</button>${action(me.ready?'준비 취소':'준비 완료','ready',!me.ready,'primary full')}${host?action('모두 함께 출발','start',undefined,'full',!ready):'<p class="join-help">모두 준비하면 방장이 여행을 시작합니다.</p>'}<p class="join-help">4~8명이 모두 준비해야 시작할 수 있습니다. 출발 후에는 현재 멤버로 7라운드를 진행해요.</p>${action('방 나가기','leave',undefined,'quiet full')}</aside></div></section>`;
 app.querySelector('#copy-invite').onclick=copyInvite;
 for(const selector of ['#character-select','#arrival-select'])app.querySelector(selector).onchange=()=>command('configure',{character:Number(app.querySelector('#character-select').value),arrival:app.querySelector('#arrival-select').value});
 app.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('이 여행자를 대기실에서 내보낼까요?'))command('remove',b.dataset.remove);});bindCommands();
}
function mapMarkup(g,interactive=true){
 return `<div class="online-map"><img src="${asset('board-map.svg?v=20260929h')}" alt="울릉도 이동 지도. 연결된 길을 따라 이동합니다."><svg viewBox="0 0 1400 1050"><polyline class="online-route" fill="none" stroke="#ffcd6c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>${interactive?g.destinations.map(r=>{const n=data.nodes.find(n=>n.id===r.node);return `<button class="map-stop" data-stop="${n.id}" style="left:${n.x/14}%;top:${n.y/10.5}%" aria-label="${e(n.name)} ${r.path.length}칸 이동"></button>`;}).join(''):''}${g.players.map(p=>{const n=data.nodes.find(n=>n.id===p.node),same=g.players.filter(q=>q.node===p.node),offset=(same.findIndex(q=>q.id===p.id)-(same.length-1)/2)*23;return `<span class="map-pawn" style="left:${(n.x+offset)/14}%;top:${n.y/10.5}%;--pawn:${colors[p.meeple]}" title="${e(room.members[p.id].name)} · ${e(n.name)}">${p.id+1}</span>`;}).join('')}</div>`;
}
function highlight(route){
 if(!route)return;let from=room.game.players[room.game.turn].node,points=[];
 for(const to of route.path){const edge=data.geography.edges.find(edge=>edge.from===from&&edge.to===to||edge.from===to&&edge.to===from);if(edge)points.push(...(edge.from===from?edge.points:[...edge.points].reverse()));from=to;}
 document.querySelectorAll('.online-route').forEach(line=>line.setAttribute('points',points.map(p=>p.join(',')).join(' ')));
}
function turnMarkup(g){
 const own=g.turn===room.seat,p=g.players[g.turn],name=room.members[g.turn].name,node=data.nodes.find(n=>n.id===p.node),reader=room.members[(g.turn+1)%room.members.length];
 const phases=['mode','move','draw','choose','result'],current=['guide'].includes(g.stage)?3:g.stage==='resolve'?4:g.stage==='bonusmove'?1:phases.indexOf(g.stage);
 let html=`<div class="turn-steps">${['준비','이동','조우','선택','마침'].map((t,i)=>`<span class="${i===current?'active':''}">${t}</span>`).join('')}</div><p class="eyebrow">${own?'나의 차례':e(name)+'의 차례'}</p>`;
 if(g.stage==='mode'){
  html+=`<h2>${own?'어느 길로 떠날까요?':'다음 여행을 준비해요.'}</h2><p class="turn-context">${e(node.name)} · 예산 ${p.budget}만원<br>${own?'주사위 눈 안에서 원하는 곳에 멈출 수 있어요.':e(name)+' 님이 이동 방법을 고르고 있습니다.'}</p>`;
  if(own){if(!p.progress)html+=`<p>해안을 도는 방향</p><div class="direction-choice">${[1,-1].map(d=>action(data.nodes.find(n=>n.id===data.loop[(data.loop.indexOf(p.node)+d+data.loop.length)%data.loop.length]).name+' 방면','direction',d,'direction '+((p.direction||1)===d?'selected':''))).join('')}</div>`;
   html+=action('걸어서 주사위 굴리기','roll',false)+action('택시 타기 · 1만원','roll',true,'full',p.budget<1||!data.loop.includes(p.node))+'<p class="muted-note">택시는 주사위 2개로 해안길만 이동합니다. 예산이 0이어도 걸을 수 있어요.</p>';
  }
 }else if(['move','bonusmove'].includes(g.stage)){
  html+=`<h2>최대 ${g.steps}칸, ${own?'목적지를 골라요.':'어디에 멈출까요?'}</h2><div class="dice-values" aria-label="주사위 ${g.dice.join(', ')}">${g.dice.map(d=>`<span>${['','⚀','⚁','⚂','⚃','⚄','⚅'][d]}</span>`).join('')}</div><p>${g.taxi?'해안길을 따라 이동합니다.':'연결된 길을 따라 이동합니다.'} ${own?'이름을 누르면 도착합니다.':e(name)+' 님의 선택을 기다립니다.'}</p>`;
  if(own)html+=`<div class="destination-list">${g.destinations.sort((a,b)=>a.path.length-b.path.length).map(r=>`<button data-destination="${r.node}"><b>${e(data.nodes.find(n=>n.id===r.node).name)}</b><small>${r.path.length}칸${r.lap?' · 일주':''}</small></button>`).join('')}</div>`;
 }else if(g.stage==='draw'){
  const region=data.regions.find(r=>r.id===node.region);html+=`<h2>${e(node.name)}에 도착!</h2><p>${e(region.title)} 조우 카드에서 어떤 일을 만나게 될까요?</p>`+(own?action('조우 카드 한 장 뽑기','draw'):'<p class="muted-note">'+e(name)+' 님이 카드를 뽑습니다.</p>');
 }else if(['guide','choose','resolve'].includes(g.stage)){
  const card=data.encounters.find(c=>c.id===g.encounter),entry=card.entries.find(x=>(x.applies||[x.node]).includes(p.node));
  html+=`<h2>${g.stage==='resolve'?'여행에 남은 것':g.stage==='guide'?'함께 읽어 주세요.':'어떤 여행을 할까요?'}</h2><p class="encounter-title">${e(card.title||entry.title||card.name||data.regions.find(r=>r.id===card.region).title)}</p><p>${e(entry.scenario||entry.text||entry.situation||card.situation||'')}</p>`;
  if(g.stage==='guide')html+=`<p class="muted-note">${e(reader.name)} 님이 상황과 두 선택을 읽어 주세요.</p>`;
  const options=g.stage==='resolve'?[{o:entry.options[g.selection],i:g.selection}]:entry.options.map((o,i)=>({o,i}));
  html+=options.map(({o,i})=>`<article class="encounter-option"><h3>${i?'B':'A'} · ${e(o.label||o.title)}</h3>${optionCondition(data,o)?`<p class="condition">선택 조건 · ${e(optionCondition(data,o))}</p>`:''}<p>${e(o.result||o.outcome||o.description||'')}</p><p class="effect">${e(g.stage==='resolve'?effectText(g.applied):effectText(o.effect))}</p>${g.stage==='choose'&&own?action(g.options[i]?.allowed?(i?'B 선택하기':'A 선택하기'):'조건이 맞지 않아요','choose',i,'primary',!g.options[i]?.allowed):''}</article>`).join('');
  html+=`<button class="quiet full" data-inspect="cards&id=${g.encounter}">카드 원본 크게 보기</button>`;
  if(g.stage==='guide'&&(own||reader.id===room.me))html+=action('모두 읽었어요 · 선택하기','listen');
  if(g.stage==='resolve'){if(g.effectDie)html+='<p class="muted-note">결과 주사위 '+g.effectDie+' · 카드의 해당 결과 적용</p>';if(own)html+=action('결과 확인 · 카드 정리','putCard');}
 }else if(g.stage==='fallback'){
  html+='<h2>잠시 쉬어갈까요?</h2><p>지금 고를 수 있는 조우가 없어 대체 행동을 합니다.</p>';
  if(own){if(p.cards.fatigue.length)html+=action('쉬기 · 피로 1장 반납','fallback','rest');for(const t of TYPES.slice(0,3))if(g.supplies[t])html+=action(LABELS[t]+' 1장 획득','fallback',t,'full');if(!p.cards.fatigue.length&&!TYPES.slice(0,3).some(t=>g.supplies[t]))html+=action('차례 마치기','fallback','pass');}
 }else if(g.stage==='result')html+=`<h2>다음 여행자에게.</h2><p>${e(g.notice)}</p>`+(own?action('차례 마치기 →','endTurn'):'');
 return html;
}
function renderGame(){
 const g=room.game,my=g.players[room.seat],c=data.characters[my.character],active=room.members[g.turn];
 app.innerHTML=`<section class="game-shell"><header class="game-top"><div><p class="eyebrow">일곱 번의 차례, 나만의 여행</p><h1>${g.round} / 7 라운드 · ${g.turn===room.seat?'내 차례':e(active.name)+'의 차례'}</h1></div><div><p class="room-small">방 ${room.code} · 나: ${e(room.members[room.seat].name)}</p><button data-inspect="sheets&character=${c.id}">나의 여행자북</button></div></header><div class="travelers-bar">${g.players.map(p=>`<div class="traveler-chip ${g.turn===p.id?'active':''}"><img src="${asset('portraits/traveler-'+p.character+'.jpg')}" alt=""><div><b>${p.id+1}. ${e(room.members[p.id].name)}${p.id===room.seat?' · 나':''}</b><small>${e(data.nodes.find(n=>n.id===p.node).name)} · ${p.budget}만원</small></div></div>`).join('')}</div><div class="online-board-grid"><section class="online-map-panel"><header class="online-map-toolbar"><b>같이 보는 여행 지도</b><button id="enlarge-map">지도 확대 ↗</button></header>${mapMarkup(g)}<p class="map-status">${e(g.notice)}</p></section><aside class="turn-panel">${turnMarkup(g)}</aside></div><section class="my-journey"><article class="journey-card"><h2>${e(c.name)}의 여행 코스</h2><div class="course-stops">${g.course.nodes.map(id=>`<span class="${my.visited.includes(id)?'visited':''}">${my.visited.includes(id)?'✓ ':''}${e(data.nodes.find(n=>n.id===id).name)}</span>`).join('')}</div><p class="small-copy">한 곳 2점 · 두 곳 4점 · 세 곳 모두 8점. 도착한 곳만 방문으로 셉니다.</p><ul class="goal-list">${g.goals.map(goal=>`<li><span>${goal.done?'✓':'○'} +3점</span>${e(goal.text)}</li>`).join('')}</ul></article><article class="journey-card"><h2>내 앞에 모인 여행 기록</h2><div class="record-row">${TYPES.map(t=>`<button data-record="${t}"><small>${LABELS[t]}</small><strong>${my.cards[t].length}</strong></button>`).join('')}</div><p class="small-copy">일주 ${my.lapRegions.length} / 5권역${my.lapsCompleted?' · 일주 완료':' · 모든 권역 방문 후 아무 항구로 돌아오면 7점'}</p><p class="small-copy">남은 예산 <b>${my.budget}만원</b> · 피로 ${my.cards.fatigue.length}장</p><p class="small-copy">최종 점수는 모두 7라운드를 마친 뒤 계산합니다.</p></article></section><details class="activity-log"><summary>함께 남긴 여행 기록</summary><ol>${g.log.map(l=>`<li>${l.round}R · ${e(room.members[l.player]?.name)} · ${e(l.text)}</li>`).join('')}</ol></details></section>`;
 bindCommands();
 for(const b of app.querySelectorAll('[data-destination],[data-stop]')){const id=b.dataset.destination||b.dataset.stop,route=g.destinations.find(r=>r.node===id);b.onclick=()=>command('move',id);b.onmouseenter=b.onfocus=()=>highlight(route);}
 app.querySelector('#enlarge-map').onclick=()=>{openCustom('여행 지도 · 끌어서 둘러보기',`<div class="map-enlarged">${mapMarkup(g,false)}</div>`);};
 app.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>{const t=b.dataset.record,ids=my.cards[t];openCustom('내 '+LABELS[t]+' 카드',`<div class="online-record-images">${ids.length?ids.map(id=>`<img src="${asset('cards/'+t+'-'+Number(id.split('@')[0].split('-')[1])+'-front.svg')}" alt="${LABELS[t]} 카드">`).join(''):'<p>아직 모은 카드가 없습니다.</p>'}</div>`);});
}
function renderScores(){
 const g=room.game,scores=[...g.scores].sort((a,b)=>b.total-a.total),max=scores[0].total,labels={records:'여행 기록',goals:'개인 목표',course:'여행 코스',leaders:'종류별 달인',lap:'일주',budget:'남은 예산',fatigue:'피로',port:'항구 귀환'};
 app.innerHTML=`<section class="score-list"><p class="eyebrow">일곱 라운드의 여행을 마쳤습니다</p><h1>${scores.filter(s=>s.total===max).map(s=>e(room.members[s.id].name)).join(' · ')}${scores.filter(s=>s.total===max).length>1?' 공동':''} 승리!</h1>${scores.map(s=>`<article class="score-row ${s.total===max?'winner':''}"><header><span>${e(room.members[s.id].name)} · ${e(s.name)}</span><span>${s.total}점</span></header><div class="score-breakdown">${Object.entries(s.detail).map(([key,value])=>`<span>${labels[key]}<b>${value}점</b></span>`).join('')}</div></article>`).join('')}<p>모든 여행자가 7라운드를 마친 순간의 기록으로 계산했습니다. 같은 총점은 공동 승리입니다.</p><p class="join-help">이 방의 결과는 같은 브라우저에서 다시 볼 수 있습니다.</p><a class="mode-button primary" href="${location.pathname}">새 여행 준비하기 →</a></section>`;
}
function render(){if(!room)return renderJoin();const focused=document.activeElement?.id;if(!room.game)renderLobby();else if(room.game.stage==='end')renderScores();else renderGame();if(pending)lock();if(focused)document.getElementById(focused)?.focus({preventScroll:true});}
const dialog=document.querySelector('#inspection');
function closeInspect(){dialog.close();const frame=dialog.querySelector('iframe');if(frame)frame.removeAttribute('src');}
function inspect(section){dialog.innerHTML='<header><h2>구성품 살펴보기</h2><button aria-label="닫기">닫기 ×</button></header><iframe title="게임 구성품"></iframe>';dialog.querySelector('iframe').src='/ulleung-marble/tabletop/components.html?embedded=1#'+section;dialog.querySelector('button').onclick=closeInspect;if(!dialog.open)dialog.showModal();}
function openCustom(title,content){dialog.innerHTML=`<header><h2>${e(title)}</h2><button aria-label="닫기">닫기 ×</button></header>${content}`;dialog.querySelector('button').onclick=closeInspect;if(!dialog.open)dialog.showModal();}
function bindInspect(root){root.querySelectorAll('[data-inspect]').forEach(b=>b.onclick=()=>inspect(b.dataset.inspect));}
window.addEventListener('message',evt=>{if(evt.origin===location.origin&&evt.source===dialog.querySelector('iframe')?.contentWindow&&evt.data?.type==='ulleung-close-inspection')closeInspect();});
window.addEventListener('online',poll);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
bindInspect(document.querySelector('.mode-header'));
try{const response=await fetch('/ulleung-marble/tabletop/v07/data.json?v=20260929h');if(!response.ok)throw Error('여행 데이터를 불러오지 못했습니다.');data=await response.json();renderJoin();const code=new URLSearchParams(location.search).get('room');if(code&&sessions()[code])await resume(code);}catch(err){app.innerHTML='<p class="loading-copy">여행 정보를 불러오지 못했습니다. 새로고침해 주세요.</p>';notify(err.message);}
