import {CARD_TYPES,CHANT,createGame,flip,respond,wrongReaction,nextTurn} from './engine.mjs';
import {cardHTML,escapeHTML as esc} from './art.mjs?v=physical-20261029b';
import {mountTabletop} from '../tabletop.mjs?v=physical-20261029b';
import {TABLE_SIZE,CENTER_PILE,seatPositions} from './tabletop-layout.mjs?v=physical-20261029b';

const $=selector=>document.querySelector(selector);
const keys=['a','s','d','j','k','l'];
const storeKey='twisdom-island-snap-v1';
let state=null,practice=false,botTimers=[],announcement='',setupCount=3,resumed=false,setupNames=[],setupPractice=false,storageWarning='',dialogReturn=null,skipNextDialogResume=false;
const movingCards=new Set();
const camera=mountTabletop({viewport:'#snap-viewport',world:'#snap-world',controls:'#snap-camera-controls',width:TABLE_SIZE.width,height:TABLE_SIZE.height,fullscreenTarget:'.snap-tabletop-column'});

function announce(text){if(text!==announcement){$('#announcer').textContent=text;announcement=text;}}
function save(){try{localStorage.setItem(storeKey,JSON.stringify({state,practice}));}catch{announce('저장 공간을 확인해 주세요. 이 화면에서는 계속 플레이할 수 있어요.');}}
function stopBots(){botTimers.forEach(clearTimeout);botTimers=[];}
function scheduleBots(){
  stopBots();if(!state||!practice||state.phase!=='reaction'||document.querySelector('dialog[open]'))return;
  const serial=state.serial;
  state.players.slice(1).forEach(player=>{
    const first=550+Math.random()*1250,second=180+Math.random()*550;
    for(let step=0;step<state.reaction.presses-state.reaction.progress[player.id];step++)botTimers.push(setTimeout(()=>{
      if(state?.phase==='reaction'&&state.serial===serial)transitionTo(respond(state,player.id));
    },first+step*second));
  });
}
function transitionTo(next){const before=state;if(next===before)return;state=next;save();render();animateCards(before,state);if(state.phase!=='reaction')stopBots();if(state.phase==='finished'&&before?.phase!=='finished')openPreparation();}
function act(action,player){
  if(!state)return;
  try{
    const next=action==='flip'?flip(state):action==='next'?nextTurn(state):action==='wrong'?wrongReaction(state,player):respond(state,player);
    transitionTo(next);if(action==='flip')scheduleBots();
  }catch(error){announce(error.message);const target=$('#sidebar-notice');if(target)target.textContent=error.message;}
}
function rememberSetup(){document.querySelectorAll('.name-inputs input').forEach((input,i)=>setupNames[i]=input.value);const checkbox=$('#practice-mode');if(checkbox)setupPractice=checkbox.checked;}
function focusSnapshot(){
  const active=document.activeElement;
  if(!active?.closest?.('#center-copy,#center-card,#players,#reaction-controls,#reader-content,#winner-area,#turn-rail'))return null;
  return{selector:active.id?'#'+active.id:null,action:active.dataset.action||null,start:typeof active.selectionStart==='number'?active.selectionStart:null,end:typeof active.selectionEnd==='number'?active.selectionEnd:null};
}
function restoreFocus(snapshot){
  if(!snapshot)return;
  let target=snapshot.selector?$(snapshot.selector):null;
  if(snapshot.action==='flip'&&state?.phase!=='turn')target=null;
  if(!target||target.disabled)target=primaryAction()||$('#reaction-controls button:not(:disabled)')||($('#setup-dialog').open?$('#player-count'):$('#setup-open'));
  if(!target)return;target.focus({preventScroll:true});
  if(snapshot.start!==null&&target.setSelectionRange)target.setSelectionRange(snapshot.start,snapshot.end);
}
function primaryAction(){return $('#setup-dialog').open?$('#center-copy [data-action]'):$('#turn-rail [data-action]');}
function physicalBackHTML(){return cardHTML({kind:'squid'},{back:true}).replace('<span>울릉도 탐험대</span>','').replace('<strong>오징어 호박엿<br>명이나물 독도 성인봉</strong>','<strong>울릉도<br>탐험대</strong>');}
function namesForm(count){return `<label class="setup-label" for="player-count">함께할 탐험가</label><select id="player-count">${[3,4,5,6].map(n=>`<option value="${n}" ${n===count?'selected':''}>${n}명</option>`).join('')}</select><div class="name-inputs">${Array.from({length:count},(_,i)=>`<input type="text" id="name-${i}" maxlength="12" value="${esc(setupNames[i]??`탐험가 ${i+1}`)}" aria-label="${i+1}번째 탐험가 이름">`).join('')}</div><label class="mode-toggle"><input id="practice-mode" type="checkbox" ${setupPractice?'checked':''}><span>혼자 연습할게요<br><small>나는 A 키, 나머지는 자동으로 반응해요.</small></span></label><button class="reader-action" id="start-game">카드 나누고 시작하기 →</button>`;}
function layers(count){return `<span class="pile-layers" aria-hidden="true">${Array.from({length:Math.min(9,Math.max(0,count-1))},(_,i)=>`<i class="pile-layer" style="--layer:${i+1}"></i>`).reverse().join('')}</span>`;}
function responseInfo(player){
  const phase=state?.phase||'setup',progress=state?.reaction?.progress[player.id]||0,needed=state?.reaction?.presses||1;
  const done=phase==='reaction'&&progress>=needed,order=state?.reaction?.order.indexOf(player.id)??-1;
  const enabled=['reaction','quiet'].includes(phase)&&!(practice&&player.id>0)&&!done;
  const text=done?`${order+1}번째 완료`:phase==='reaction'&&progress?'한 번 더':phase==='reaction'&&needed===2?state.lastCard.kind==='gull'?'퍼덕!':'똑똑!':['setup','turn','result','finished'].includes(phase)?'준비':'반응!';
  return{phase,progress,needed,done,order,enabled,text};
}
function render(){
  const focused=focusSnapshot(),phase=state?.phase||'setup';
  const players=state?.players||Array.from({length:setupCount},(_,id)=>({id,name:setupNames[id]?.trim()||`탐험가 ${id+1}`,cards:Array(60/setupCount)}));
  const selected=state?(phase==='turn'?CHANT[state.chantIndex]:state.lastChant)||CHANT[0]:CHANT[0];
  $('#chant-track').innerHTML=CHANT.map(kind=>`<span class="${kind===selected?'current':''}">${CARD_TYPES[kind].name}</span>`).join('');
  renderPile();renderSeats(players);renderReactions(players);renderReader();renderRail();
  $('#session-summary').innerHTML=`<strong>${players.length}명 ${state?practice?'혼자 연습':'함께 플레이':'준비 중'}</strong><span>${state?resumed?'저장한 게임을 이어갑니다.':`${state.round}번째 카드 공개`:'모두 뒷면으로 나누어 가질 카드 60장'}</span>`;
  $('#reaction-helper').textContent=phase==='reaction'?state.reaction.presses===2?'실제 동작 후 내 키나 버튼을 두 번 눌러요.':'그림과 이름이 같아요. 내 키나 버튼을 한 번 눌러요.':phase==='quiet'?'그림과 이름이 다르면 기다려요. 잘못 누르면 더미를 받아요.':state?'다음 카드가 공개되면 반응할 준비!':'테이블의 내 자리와 같은 키를 사용해요.';
  if(state)announce(state.notice);
  restoreFocus(focused);
}
function renderPile(){
  const pile=state?.center||[],card=pile.at(-1);
  $('#card-center').dataset.phase=state?'playing':'setup';
  $('#center-card').innerHTML=card?`<button class="public-pile-button" id="center-card-button" data-read-kind="${card.kind}" aria-label="가운데 ${CARD_TYPES[card.kind].name} 카드 크게 읽기">${layers(pile.length)}${cardHTML(card)}</button>`:state?'<div class="empty-public-pile"><b>가운데 더미</b><small>다음 카드를 이곳에 공개해요.</small></div>':`<button class="table-card-box" id="table-setup-open" aria-label="카드 상자를 열고 탐험대 준비하기">${physicalBackHTML()}<span>상자를 열고 준비하기</span></button>`;
  $('#pile-count').textContent=pile.length?`${pile.length}장 쌓임`:state?'가운데 0장':'';
}
function renderSeats(players){
  const positions=seatPositions(players.length);
  $('#players').innerHTML=players.map((player,i)=>{
    const seat=positions[i],r=responseInfo(player),canFlip=!!state&&state.phase==='turn'&&state.turn===i;
    const label=state?`${player.name}, 비공개 카드 ${player.cards.length}장${canFlip?', 맨 위 카드 공개하기':', 뒷면 크게 보기'}`:`${player.name}의 카드 뒷면 보기`;
    return `<section class="physical-seat ${state?.turn===i?'is-turn':''} ${r.done?'is-done':''}" id="seat-${i}" style="left:${seat.left}px;top:${seat.top}px" aria-label="${esc(player.name)}의 자리"><div class="seat-heading"><span class="seat-name">${esc(player.name)}${practice&&i>0?'<small>자동</small>':''}</span><span class="seat-count">${player.cards.length}<small>장</small></span></div><button class="private-deck ${canFlip?'can-flip':''}" id="deck-${i}" ${canFlip?'data-action="flip"':'data-read-back'} aria-label="${esc(label)}">${player.cards.length?`${layers(player.cards.length)}${physicalBackHTML()}`:'<span class="empty-private-deck">카드를<br>다 냈어요</span>'}</button><button class="world-reaction-pad ${r.progress&&!r.done?'is-partial':''} ${r.done?'is-complete':''}" id="react-world-${i}" data-player="${i}" ${r.enabled?'':'disabled'} aria-label="테이블의 ${esc(player.name)} 반응, ${keys[i].toUpperCase()} 키"><span>${r.done?`${r.order+1}번째<br>완료`:r.progress&&!r.done?'한 번<br>더!':r.text}</span><kbd>${keys[i].toUpperCase()}</kbd></button><button class="world-wrong" id="wrong-world-${i}" data-wrong="${i}" ${['reaction','quiet'].includes(r.phase)?'':'disabled'} aria-label="${esc(player.name)}의 오반응 처리">오반응</button><span class="pickup-marker" id="pickup-${i}" aria-hidden="true"></span></section>`;
  }).join('');
}
function renderReactions(players){
  $('#reaction-controls').style.gridTemplateColumns=players.length<=3?'repeat(3,minmax(0,1fr))':'';
  $('#reaction-controls').innerHTML=players.map(player=>{
    const r=responseInfo(player);
    return `<button class="reaction-control ${r.progress&&!r.done?'is-partial':''} ${r.done?'is-complete':''}" id="react-control-${player.id}" data-player="${player.id}" ${r.enabled?'':'disabled'} aria-label="${esc(player.name)} 반응, ${keys[player.id].toUpperCase()} 키"><span class="control-name">${esc(player.name)}${practice&&player.id>0?' (자동)':''}</span><span class="control-action">${r.text}<kbd>${keys[player.id].toUpperCase()}</kbd></span></button>`;
  }).join('');
}
function renderReader(){
  const phase=state?.phase||'setup',players=state?.players||[],player=players[state?.turn];
  $('#setup-dialog-title').textContent=state?'진행 안내':'탐험대 준비';
  $('#winner-area').innerHTML=phase==='finished'?`<div class="winner-banner"><span class="user-name">${esc(players[state.winner].name)}</span> 승리!<br><span style="font-size:14px;font-weight:600">내 카드가 모두 없어졌어요.</span></div>`:'';
  let content;
  if(!state)content='<span class="spoken">테이블은 모두 펼쳐 두었어요.</span><h2>둘러앉아서<br>시작할까요?</h2><p>각자 앞에 놓인 뒷면 카드 더미를 확인하고, 함께할 이름을 준비해 주세요.</p>';
  else if(phase==='turn')content=`<span class="spoken"><span class="user-name">${esc(player.name)}</span>의 차례</span><h2>“${CARD_TYPES[CHANT[state.chantIndex]].name}!”</h2><p>이름을 외치며 내 뒷면 더미의 맨 위 카드를 공개해요.</p><button class="reader-action" id="reader-flip" data-action="flip">맨 위 카드 공개하기 ↗</button><p class="reader-hint">테이블의 빛나는 개인 더미를 눌러도 같아요.</p>`;
  else if(phase==='finished')content=`<span class="spoken">울릉도 탐험을 마쳤어요.</span><h2>한 판 더<br>떠나볼까요?</h2><p>카드가 먼저 없어졌다면 승리! 가장 늦어 더미를 받았다면 계속해야 해요.</p><button class="reader-action" id="reader-restart" data-action="restart">새 탐험대 준비하기 →</button>`;
  else if(phase==='result')content=`<span class="spoken">가운데 더미를 가져갔어요.</span><h2><span class="user-name">${esc(player.name)}</span><br>다시 출발!</h2><p>받은 카드는 내 비공개 더미 아래에 넣었어요. 외치는 순서는 이어갑니다.</p><button class="reader-action" id="reader-next" data-action="next">다음 차례 준비 →</button>`;
  else content=`<span class="spoken">방금 외친 이름</span><h2>“${CARD_TYPES[state.lastChant].name}!”</h2>${phase==='reaction'&&state.reaction.presses===2?`<div class="reaction-instruction"><strong>${state.lastCard.kind==='gull'?'양팔 두 번<br>퍼덕!':'탁자 두 번<br>똑똑!'}</strong><span>실제 동작 후 내 키나 버튼도 두 번</span></div>`:'<p>카드 그림과 이름을 확인해요.<br>같으면 모두 가운데에 손!</p>'}${phase==='reaction'?'<p class="reaction-wait">모두 반응을 완료하면 이어져요.</p>':'<button class="reader-action" id="reader-next" data-action="next">다음 차례로 →</button>'}`;
  $('#center-copy').innerHTML=content;
  $('#reader-content').innerHTML=state?`<div class="reader-status" id="sidebar-notice">${esc(state.notice)}</div>${practice?'<p class="reader-hint">내 반응 키는 A입니다. 나머지 탐험가는 자동으로 반응해요.</p>':''}<div class="reader-tools"><button id="last-card-open" ${state.lastCard?'':'disabled'}>방금 카드 크게 읽기</button><button id="reader-rules-open">규칙 보기</button></div><details class="reader-adjudication"><summary>실제 동작의 오반응 처리</summary><div>${players.map(p=>`<button data-wrong="${p.id}" ${['reaction','quiet'].includes(phase)?'':'disabled'}>${esc(p.name)} 오반응</button>`).join('')}</div></details><section class="sidebar-rule"><h3>여행 기록</h3><ol class="game-log">${state.log.slice(0,5).map(text=>`<li>${esc(text)}</li>`).join('')}</ol></section>`:`${storageWarning?`<p class="reader-status">${esc(storageWarning)}</p>`:''}${namesForm(setupCount)}<section class="sidebar-rule"><h3>기억할 세 가지</h3><ul><li>그림과 이름이 같으면 반응 한 번.</li><li>갈매기는 양팔 두 번, 배 출항은 탁자 두 번. 동작 후 키도 두 번.</li><li>늦거나 잘못 반응하면 가운데 더미를 모두 가져가요.</li></ul></section>`;
}
function renderRail(){
  const phase=state?.phase||'setup';
  let copy,actions;
  if(!state){copy='<strong>카드 60장, 함께 둘러앉아요.</strong><span>'+setupCount+'명으로 준비되어 있어요.</span>';actions='<button id="setup-open" class="rail-secondary">참가자 설정</button><button id="quick-start" class="rail-primary">이대로 시작 →</button>';}
  else if(phase==='turn'){copy='<strong>“'+CARD_TYPES[CHANT[state.chantIndex]].name+'!”</strong><span class="user-name">'+esc(state.players[state.turn].name)+'의 차례</span>';actions='<button id="progress-open" class="rail-secondary">진행 안내</button><button id="rail-flip" class="rail-primary" data-action="flip">카드 한 장 공개 ↗</button>';}
  else if(phase==='result'){copy='<strong class="user-name">'+esc(state.players[state.turn].name)+'이 더미를 받았어요.</strong><span>다음 이름을 이어서 외쳐요.</span>';actions='<button id="progress-open" class="rail-secondary">진행 안내</button><button id="rail-next" class="rail-primary" data-action="next">다음 차례 →</button>';}
  else if(phase==='finished'){copy='<strong class="user-name">'+esc(state.players[state.winner].name)+' 승리!</strong><span>모두 카드를 내려놓고 한 판 더?</span>';actions='<button id="progress-open" class="rail-secondary">결과 보기</button><button id="rail-restart" class="rail-primary" data-action="restart">새 게임 준비</button>';}
  else{copy='<strong>'+((phase==='reaction'&&state.reaction.presses===2)?state.lastCard.kind==='gull'?'양팔 두 번 퍼덕!':'탁자 두 번 똑똑!':'“'+CARD_TYPES[state.lastChant].name+'!”')+'</strong><span>'+((phase==='reaction')?'반응을 마친 뒤 내 키나 버튼을 눌러요.':'이름과 그림이 다르면 기다려요.')+'</span>';actions='<button id="progress-open" class="rail-secondary">카드와 규칙 보기</button>'+(phase==='quiet'?'<button id="rail-next" class="rail-primary" data-action="next">다음 차례 →</button>':'');}
  $('#turn-rail').innerHTML='<div class="rail-copy">'+copy+'</div><div class="rail-actions">'+actions+'</div>';
}
function openPreparation(){stopBots();dialogReturn=document.activeElement?.id?'#'+document.activeElement.id:null;if(!$('#setup-dialog').open)$('#setup-dialog').showModal();}
function animateCards(before,after){
  if(!before||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let type,from,to,card,count=0;
  const seats=seatPositions(after.players.length);
  if(after.serial>before.serial){type='flip';const seat=seats[before.turn];from={x:seat.deckX,y:seat.deckY};to=CENTER_PILE;card=after.lastCard;}
  else if(before.center.length>0&&after.center.length===0){type='collect';from=CENTER_PILE;const seat=seats[after.turn];to={x:seat.deckX,y:seat.deckY};card=before.center.at(-1);count=before.center.length;}
  if(!type||!card)return;
  const piece=document.createElement('div');piece.className='moving-card';piece.innerHTML=`${type==='collect'?layers(count):''}${cardHTML(card)}${count?`<span class="transfer-count">+${count}</span>`:''}`;$('#movement-layer').append(piece);movingCards.add(piece);
  const target=type==='flip'?$('#center-card-button'):null;if(target)target.classList.add('is-dealing');
  const transform=(p,scale,angle)=>`translate(${p.x-CENTER_PILE.width/2}px,${p.y-CENTER_PILE.height/2}px) scale(${scale}) rotate(${angle}deg)`;
  const animation=piece.animate?.([{transform:transform(from,1,type==='flip'?-7:0),opacity:1},{transform:transform(to,1,type==='flip'?0:7),opacity:type==='flip'?1:.15}],{duration:type==='flip'?370:460,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
  if(type==='collect'){
    const seat=$('#seat-'+after.turn),marker=$('#pickup-'+after.turn);if(marker)marker.textContent='+'+count;seat?.classList.add('receiving');setTimeout(()=>seat?.classList.remove('receiving'),850);
  }
  const clean=()=>{piece.remove();movingCards.delete(piece);target?.classList.remove('is-dealing');};
  if(animation)animation.finished.catch(()=>{}).then(clean);else clean();
}
function clearMotion(){movingCards.forEach(piece=>{piece.getAnimations?.().forEach(animation=>animation.cancel());piece.remove();});movingCards.clear();}
function rulesHTML(){return `<p><b>3–6명, 카드 60장.</b> 한 기기를 가운데 놓고 각자 키 또는 반응 버튼으로 함께해요.</p><h3>한 장씩 공개하기</h3><p>카드는 보지 않고 고르게 나눠요. 자기 차례에 맨 위 카드 한 장을 가운데에 공개하며 <b>오징어 → 호박엿 → 명이나물 → 독도 → 성인봉</b> 순서로 이름을 외칩니다.</p><h3>같으면 반응, 특수는 두 번</h3><ul><li>이름과 그림이 같으면 가운데 더미에 손을 대고, 내 키나 반응 버튼을 한 번 눌러요.</li><li>갈매기는 양팔을 두 번 퍼덕이고, 배 출항은 탁자를 두 번 두드려요. 동작을 마친 뒤 내 키나 버튼도 두 번 누릅니다.</li><li>가장 늦게 끝낸 사람이 가운데 카드 전부를 자기 더미 아래에 넣어요. 그 사람이 다음 카드를 공개합니다.</li></ul><h3>잘못 반응했다면</h3><p>일치하지 않는데 반응하거나 특수 동작을 틀리면 가운데 더미를 가져가요. 화면 밖의 잘못된 동작은 해당 사람의 테이블 위 ‘오반응’ 버튼으로 처리합니다. 동시에 틀렸다면 가장 먼저 잘못 반응한 사람이 가져갑니다.</p><h3>마지막 카드와 승리</h3><p>마지막 카드가 반응할 카드가 아니면 즉시 승리해요. 반응 카드라면 카드가 없어도 모두 행동에 참여합니다. 반응을 마친 뒤에도 카드가 없는 사람이 승리하고, 늦거나 틀려 더미를 받았다면 계속해요.</p><h3>일곱 가지 카드</h3><div class="rules-card-grid">${Object.entries(CARD_TYPES).map(([kind,type])=>`<button data-read-kind="${kind}" aria-label="${type.name} 카드 크게 읽기">${cardHTML({kind})}<span>${type.count}장</span></button>`).join('')}</div><p style="margin-top:25px"><a href="print.html">종이 카드 60장과 규칙서 인쇄 ↗</a></p>`;}
function openRules(){stopBots();dialogReturn=document.activeElement?.id?'#'+document.activeElement.id:null;$('#rules-content').innerHTML=rulesHTML();if($('#setup-dialog').open)$('#setup-dialog').close();$('#rules-dialog').showModal();}
function openCard(kind,back=false){
  if(!back&&!CARD_TYPES[kind])return;
  stopBots();
  const active=document.activeElement;dialogReturn=active?.id?'#'+active.id:null;
  const type=CARD_TYPES[kind]||CARD_TYPES.squid;
  $('#card-dialog-title').textContent=back?'비공개 카드 뒷면':type.name+' 카드';
  const description=back?'개인 더미는 보지 않고 뒷면으로 쌓아요. 자기 차례에 맨 위 카드 한 장만 공개합니다.':type.special?kind==='gull'?'이 카드가 나오면 외친 이름과 상관없이 양팔을 두 번 퍼덕여요. 동작 후 내 키나 반응 버튼도 두 번 누르세요.':'이 카드가 나오면 외친 이름과 상관없이 탁자를 두 번 두드려요. 동작 후 내 키나 반응 버튼도 두 번 누르세요.':'방금 외친 이름이 '+type.name+'라면 모두 반응해요. 이름과 그림이 다르면 손을 기다려 주세요.';
  $('#card-dialog-content').innerHTML=`<div class="read-card">${back?physicalBackHTML():cardHTML({kind:kind||'squid'})}</div><p class="read-card-note"><strong>${back?'다른 사람에게도 비밀':type.special?'정해진 동작을 두 번':'이름과 그림을 비교해요'}</strong>${description}</p>`;
  if($('#rules-dialog').open)$('#rules-dialog').close();
  if($('#setup-dialog').open)$('#setup-dialog').close();
  $('#card-dialog').showModal();
}
function restoreDialogFocus(){const skipResume=skipNextDialogResume;skipNextDialogResume=false;if(document.querySelector('dialog[open]'))return;if(!skipResume&&state?.phase==='reaction')scheduleBots();const target=dialogReturn?$(dialogReturn):null;if(target&&!target.disabled&&(!target.closest('dialog')||target.closest('dialog').open))target.focus({preventScroll:true});else(primaryAction()||$('#reaction-controls button:not(:disabled)')||$('#setup-open')||$('#rules-open')).focus({preventScroll:true});}
function startGame(){
  rememberSetup();practice=setupPractice;
  const names=Array.from({length:setupCount},(_,i)=>setupNames[i]?.trim()||`탐험가 ${i+1}`);
  if(practice){names[0]='나';['바다','하늘','나리','여울','구름'].forEach((name,i)=>{if(i+1<names.length)names[i+1]=name;});}
  stopBots();clearMotion();resumed=false;storageWarning='';state=createGame({names});save();render();if($('#setup-dialog').open)$('#setup-dialog').close();camera.fit();$('#rail-flip')?.focus({preventScroll:true});
}
function newGame(){
  if(state&&state.phase!=='finished'&&!window.confirm('지금 게임을 끝내고 새 탐험대를 준비할까요?'))return;
  stopBots();clearMotion();resumed=false;practice=false;setupPractice=false;state=null;save();render();camera.fit();openPreparation();$('#name-0')?.focus();
}
async function toggleMusic(){const audio=$('#music'),button=$('#music-toggle');if(!audio.paused){audio.pause();button.setAttribute('aria-pressed','false');button.classList.remove('is-music-on');button.textContent='음악 켜기';return;}try{audio.volume=.24;await audio.play();button.setAttribute('aria-pressed','true');button.classList.add('is-music-on');button.textContent='음악 끄기';}catch{announce('음악을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.');}}
function validSavedState(value){
  if(!value||value.version!==1||!Array.isArray(value.players)||value.players.length<3||value.players.length>6||!Array.isArray(value.center))return false;
  const n=value.players.length,validPlayer=number=>Number.isInteger(number)&&number>=0&&number<n;
  if(!validPlayer(value.turn)||!Number.isInteger(value.chantIndex)||value.chantIndex<0||value.chantIndex>=CHANT.length||!Number.isInteger(value.serial)||value.serial<0||!Number.isInteger(value.round)||value.round<0||!Array.isArray(value.log)||value.log.some(text=>typeof text!=='string')||typeof value.notice!=='string')return false;
  if(!['turn','quiet','reaction','result','finished'].includes(value.phase))return false;
  if(value.players.some((p,i)=>!p||p.id!==i||typeof p.name!=='string'||!Array.isArray(p.cards)))return false;
  const cards=[...value.center,...value.players.flatMap(p=>p.cards)];
  if(cards.length!==60||new Set(cards.map(card=>card?.id)).size!==60)return false;
  if(cards.some(card=>!card||!CARD_TYPES[card.kind]||typeof card.id!=='string'||!new RegExp('^'+card.kind+'-([1-9]|10)$').test(card.id)||Number(card.id.split('-').at(-1))>CARD_TYPES[card.kind].count))return false;
  const knownCard=card=>card&&CARD_TYPES[card.kind]&&typeof card.id==='string'&&cards.some(item=>item.id===card.id&&item.kind===card.kind);
  if(value.lastCard!==null&&!knownCard(value.lastCard))return false;
  if(value.lastChant!==null&&!CHANT.includes(value.lastChant))return false;
  if(value.phase==='finished'&&(!validPlayer(value.winner)||value.players[value.winner].cards.length!==0))return false;
  if(value.phase!=='finished'&&value.winner!==null)return false;
  if(['quiet','reaction'].includes(value.phase)&&(!value.center.length||!knownCard(value.lastCard)||!CHANT.includes(value.lastChant)))return false;
  if(value.phase==='turn'&&!value.players[value.turn].cards.length)return false;
  if(value.phase==='reaction'){
    const r=value.reaction;if(!r||![1,2].includes(r.presses)||!Array.isArray(r.progress)||r.progress.length!==n||r.progress.some(v=>!Number.isInteger(v)||v<0||v>r.presses)||!Array.isArray(r.order)||r.order.length>=n||new Set(r.order).size!==r.order.length||r.order.some(id=>!validPlayer(id)||r.progress[id]!==r.presses))return false;
  }
  return true;
}

document.addEventListener('input',event=>{if(!state&&event.target.closest('.name-inputs'))rememberSetup();});
document.addEventListener('change',event=>{if(event.target.id==='player-count'){rememberSetup();setupCount=Number(event.target.value);render();camera.fit();}else if(event.target.id==='practice-mode')setupPractice=event.target.checked;});
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')){button.closest('dialog').close();return;}
  if(button.hasAttribute('data-read-kind')){openCard(button.dataset.readKind);return;}
  if(button.hasAttribute('data-read-back')){openCard('squid',true);return;}
  if(button.id==='setup-open'||button.id==='table-setup-open'||button.id==='progress-open'){openPreparation();return;}
  if(button.id==='start-game'||button.id==='quick-start'){startGame();return;}
  if(button.id==='new-game'||button.dataset.action==='restart'){newGame();return;}
  if(button.id==='rules-open'||button.id==='reader-rules-open'||button.id==='all-cards-open'){openRules();return;}
  if(button.id==='last-card-open'){if(state?.lastCard)openCard(state.lastCard.kind);return;}
  if(button.dataset.action){if(['flip','next'].includes(button.dataset.action)&&button.closest('#setup-dialog')){skipNextDialogResume=true;dialogReturn=null;$('#setup-dialog').close();}act(button.dataset.action);return;}
  if(button.dataset.player!==undefined){act('respond',Number(button.dataset.player));return;}
  if(button.dataset.wrong!==undefined){act('wrong',Number(button.dataset.wrong));if($('#setup-dialog').open)$('#setup-dialog').close();return;}
  if(button.id==='music-toggle')toggleMusic();
});
document.addEventListener('keydown',event=>{
  if(event.repeat||event.altKey||event.metaKey||event.ctrlKey||document.querySelector('dialog[open]')||event.target.closest('input,select,textarea,[contenteditable="true"]'))return;
  const key=event.key.toLowerCase(),player=keys.indexOf(key);
  if(player>=0&&state&&player<state.players.length&&(!practice||player===0)){event.preventDefault();act('respond',player);return;}
  if(event.target.closest('button,a,summary,[role="button"],audio,video'))return;
  if(event.code==='Space'&&state?.phase==='turn'){event.preventDefault();act('flip');}
  if(event.key==='Enter'&&state&&['quiet','result'].includes(state.phase)){event.preventDefault();act('next');}
});
for(const id of ['card-dialog','rules-dialog','setup-dialog'])$('#'+id).addEventListener('close',restoreDialogFocus);
document.addEventListener('visibilitychange',()=>{if(document.hidden){$('#music').pause();$('#music-toggle').setAttribute('aria-pressed','false');$('#music-toggle').classList.remove('is-music-on');$('#music-toggle').textContent='음악 켜기';}});
try{
  const saved=JSON.parse(localStorage.getItem(storeKey)||'null');
  if(saved?.state){if(validSavedState(saved.state)){state=saved.state;practice=!!saved.practice;setupCount=state.players.length;setupNames=state.players.map(p=>p.name);setupPractice=practice;resumed=true;}else storageWarning='저장된 구성에 빠진 내용이 있어 새 탐험대를 준비했어요.';}
}catch{storageWarning='저장된 구성을 읽지 못해 새 탐험대를 준비했어요.';}
render();if(state?.phase==='reaction')scheduleBots();
