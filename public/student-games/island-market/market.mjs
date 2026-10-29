import{MATERIALS,RECIPES,NEWS,GOALS,createGame,act,price,canCook,totals}from'./engine.mjs';
import{ingredientArt,materialNames,crest}from './art.mjs?v=deep-review-20261027';import{esc,recipeCard,materialCard,recipeById,needsText}from './cards.mjs?v=deep-review-20261027';
import{mountTabletop}from '../tabletop.mjs?v=physical-table-v2-20261029';
import{physicalNews,physicalGoals,physicalShops,physicalPiles}from './tabletop-pieces.mjs?v=physical-table-v2-20261029';
const $=s=>document.querySelector(s),key='twisdom-island-market-v02';let state,mode='collect',selected=[],chosen=null,sale={},toastTimer,timer,reader=null,readerTrigger=null,returnReaderFocus=true;const byId=(xs,id)=>xs.find(x=>x.id===id);const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
const username=name=>'<span class="username">'+esc(name)+'</span>';
const canReserveOrder=id=>state.phase==='after'&&state.round<10&&!state.players[state.current].reservationUsed&&state.orders.includes(id)&&state.reservations[id]===undefined;
function isRenderableSavedMarket(saved){
 const integer=value=>Number.isInteger(value)&&value>=0,playerId=id=>integer(id)&&id<saved.players.length;
 const validIds=(values,items)=>Array.isArray(values)&&values.every(id=>items.some(item=>item.id===id));
 const bundle=value=>value&&integer(value.cash)&&value.materials&&MATERIALS.every(material=>integer(value.materials[material.id]??0));
 if(saved?.rules!=='island-market-v0.2'||!Array.isArray(saved.players)||saved.players.length<2||saved.players.length>4||!integer(saved.version)||!integer(saved.rng))return false;
 if(!['action','trade','goal','after','finished'].includes(saved.phase)||!playerId(saved.current)||!playerId(saved.starter)||!Number.isInteger(saved.round)||saved.round<1||saved.round>10||!integer(saved.turn)||saved.turn<1||!integer(saved.turnInRound)||(saved.phase==='finished'?saved.turnInRound>saved.players.length:saved.turnInRound>=saved.players.length))return false;
 if(!saved.players.every((player,index)=>player&&player.id===index&&typeof player.name==='string'&&integer(player.cash)&&typeof player.reservationUsed==='boolean'&&player.materials&&MATERIALS.every(material=>integer(player.materials[material.id]))&&player.sales&&Object.entries(player.sales).every(([id,amount])=>recipeById[id]&&integer(amount))&&(!player.goal||GOALS.some(goal=>goal.id===player.goal))))return false;
 if(!validIds(saved.market,MATERIALS)||!validIds(saved.materialDeck,MATERIALS)||!validIds(saved.materialDiscard,MATERIALS)||!validIds(saved.orders,RECIPES)||!validIds(saved.orderDeck,RECIPES)||!validIds(saved.orderDiscard,RECIPES)||!validIds(saved.news,NEWS)||saved.news.length!==10||!validIds(saved.goals,GOALS)||!validIds(saved.goalChoices,GOALS))return false;
 if(saved.market.length!==6||saved.orders.length!==4||saved.goals.length!==3)return false;
 if(!saved.reservations||!saved.goalOwners||!Object.entries(saved.reservations).every(([id,owner])=>saved.orders.includes(id)&&playerId(owner))||!Object.entries(saved.goalOwners).every(([id,owner])=>saved.goals.includes(id)&&playerId(owner))||!Array.isArray(saved.log)||!saved.log.every(line=>typeof line==='string'))return false;
 if(saved.phase==='goal'&&!saved.goalChoices.length)return false;
 if(saved.phase==='trade'&&(!saved.trade||!playerId(saved.trade.from)||!playerId(saved.trade.to)||typeof saved.trade.id!=='string'||!Number.isFinite(saved.trade.expiresAt)||!bundle(saved.trade.give)||!bundle(saved.trade.receive)))return false;
 return true;
}
let invalidSave=false;
try{const stored=localStorage.getItem(key);if(stored){const saved=JSON.parse(stored);if(isRenderableSavedMarket(saved))state=saved;else invalidSave=true;}}catch{invalidSave=true;}
let restored=!!state;if(!state)state=createGame({players:4,seed:Date.now()});
const camera=mountTabletop({viewport:'#market-viewport',world:'#market-world',controls:'#market-camera-controls',width:2280,height:1660,fullscreenTarget:'#market-play-surface'});
function notice(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
function persist(){try{localStorage.setItem(key,JSON.stringify(state));$('#save-status').textContent='저장됨, 한 기기로 교대';}catch{$('#save-status').textContent='저장 공간을 확인해 주세요';}}
function safeFocus(target,{scroll=false}={}){const el=typeof target==='string'?$(target):target;if(!el||el.disabled)return;if(!el.matches('button,input,select,a[href],summary')&&!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');if(scroll)el.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});el.focus({preventScroll:true});}
function focusNextAction(){
 if(state.phase==='trade'){safeFocus('#trade-title');return;}
 if(state.phase==='goal'||state.phase==='finished'){openAction();return;}
 safeFocus('#dock-confirm');
}
function showActionError(message){notice(message);const inline=$('#trade-error');if($('#trade-dialog').open&&inline){inline.textContent=message;inline.hidden=false;safeFocus(inline,{scroll:true});}}
function dispatch(action){try{state=act(state,action);closeReader(false);if($('#action-dialog').open)$('#action-dialog').close();selected=[];chosen=null;sale={};persist();render({restoreFocus:false});if(state.phase==='trade')showTradeResponse();else if($('#trade-dialog').open)$('#trade-dialog').close();if(action.type==='expireTrade')notice('30초가 지나 거래를 자동 거절했습니다. 주행동을 선택해 주세요.');focusNextAction();return true;}catch(e){showActionError(e.message);return false;}}
function render({restoreFocus=true}={}){
 const focused=document.activeElement;
 const focusSelector=focused?.id?'#'+focused.id:focused?.dataset?.guideMode?'[data-guide-mode="'+focused.dataset.guideMode+'"]':focused?.dataset?.market!==undefined?'[data-market="'+focused.dataset.market+'"]':focused?.dataset?.mode?'[data-mode="'+focused.dataset.mode+'"]':focused?.dataset?.order?'[data-order="'+focused.dataset.order+'"]':null;
 $('#brand-art').innerHTML=crest;
 $('#round-strip').innerHTML=physicalNews(state);
 $('#market').innerHTML=state.market.map((id,index)=>materialCard(id,index,{selected:selected.includes(index)}).replace(' aria-pressed=', ' aria-haspopup="dialog" aria-pressed=')).join('');
 $('#orders').innerHTML=state.orders.map(id=>{
  const recipe=recipeById[id],owner=state.reservations[id],eligible=state.phase==='action'?canCook(state,id):canReserveOrder(id);
  return recipeCard(recipe,{button:true,cost:price(state,recipe),className:`${eligible?'cookable':''} ${chosen===id?'order-selection':''}`,attrs:`data-order="${id}" aria-haspopup="dialog" aria-pressed="${chosen===id}" aria-label="${recipe.name}, ${needsText(recipe)}, 판매가 ${price(state,recipe)}냥${owner!==undefined?', '+esc(state.players[owner].name)+' 예약':''}, 크게 보기"`,extra:owner!==undefined?`<div class="order-reservation">${username(state.players[owner].name)} 예약</div>`:''});
 }).join('');
 $('#goals').innerHTML=physicalGoals(state);
 $('#shops').innerHTML=physicalShops(state);
 $('#supply-piles').innerHTML=physicalPiles(state);
 renderPanel();renderTableGuidance();
 $('#history').innerHTML=state.log.slice(-7).reverse().map(text=>`<li>${esc(text)}</li>`).join('');
 if(reader&&$('#card-reader').open)renderReader();
 if(state.phase==='trade')startTimer();else clearInterval(timer);
 if(restoreFocus&&focusSelector)document.querySelector(focusSelector)?.focus({preventScroll:true});
}
function header(label,title,desc){return `<header class="turn-head"><small>${label}</small><h1>${title}</h1><p>${desc}</p></header>`;}
function renderPanel(){const p=state.players[state.current];let html=header(`ROUND ${state.round} / ${state.turnInRound+1}번째 가게`,`${username(p.name)}의 차례`,state.phase==='action'?'선택 거래 1회 → 주행동 1회 → 예약 또는 마치기':'처리한 주행동은 되돌릴 수 없습니다.');
if(state.phase==='finished'){const rows=totals(state);html=header('열 번의 장사가 끝났습니다',`${rows.filter(x=>x.winner).map(x=>username(x.name)).join(', ')} 승리`,'남은 재료는 장당 1냥으로 한 번만 정산했습니다.');html+=`<div class="turn-body"><h2>가게별 최종 돈</h2><table class="score-table"><thead><tr><th>가게</th><th>현금</th><th>재고</th><th>최종</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.winner?'winner':''}"><td>${username(r.name)}</td><td>${state.settlement?.find(x=>x.player===r.id)?.cash??r.cash-r.inventory}</td><td>+${r.inventory}</td><td><strong>${r.total}</strong>냥</td></tr>`).join('')}</tbody></table><p>목표 보상과 판매 대금은 현금에 이미 포함되어 있습니다. 동률이면 공동 승리합니다.</p><button class="button primary" data-action="new">새 장터 열기</button><a class="button outline" href="index.html">게임 소개로</a></div>`;$('#action-panel').innerHTML=html;return;}
html+='<div class="turn-body">';
if(state.phase==='trade')html+=`<h2>${username(state.players[state.trade.to].name)}의 응답을 기다립니다.</h2><p>공식 거래 제안은 이번 차례에 한 번뿐입니다. 30초 안에 수락하거나 거절해 주세요.</p><button class="button outline" data-action="trade-response">거래 내용과 응답 보기</button>`;
else if(state.phase==='goal')html+=`<h2>가게 목표를 달성했습니다!</h2><p>이번 판매로 처음 달성한 목표 중 하나를 골라 5냥을 받습니다. 가게마다 보상은 한 번입니다.</p>${state.goalChoices.map(id=>{const g=byId(GOALS,id);return `<button class="button primary" data-goal="${id}">${g.name}, 5냥 받기</button>`;}).join('')}`;
else if(state.phase==='after'){const canReserve=!p.reservationUsed&&state.round<10;html+=`<h2>이번 장사를 마쳤습니다.</h2><p>${canReserve?'예약은 선택입니다. 공개 주문 한 장을 누르면 다음 내 행동이 끝날 때까지 확보합니다.':'다음 가게에 차례를 넘겨주세요.'}</p>${canReserve?`<div class="selection-note">${canReserveOrder(chosen)?`${recipeById[chosen].name} 예약 선택`:'예약할 주문을 테이블에서 고르세요.'}</div><button class="button outline" data-action="reserve" ${canReserveOrder(chosen)?'':'disabled'}>예약권으로 이 주문 확보</button>`:`<div class="selection-note">${state.round===10?'마지막 라운드에는 새 예약을 할 수 없습니다.':'이 가게의 예약권은 이미 사용했습니다.'}</div>`}<button class="button primary" data-action="end">${state.round===10&&state.turnInRound===state.players.length-1?'장사 마치고 최종 정산':'다음 가게로 넘기기'} →</button>`;}
else{html+=`<div class="trade-first"><h2>먼저, 이웃과 흥정할까요?</h2><button class="button" data-action="trade" ${state.tradeUsed?'disabled':''}>${state.tradeUsed?'이번 차례 거래 기회 사용':'거래 제안하기'}</button><p>양쪽 모두 재료 또는 돈을 내야 합니다. 거래 없이 바로 행동해도 됩니다.</p></div><h2>주행동 하나를 고르세요.</h2><div class="turn-tabs">${[['collect','재료 수집'],['sell','재료 판매'],['cook','요리 판매']].map(([id,n])=>`<button data-mode="${id}" aria-pressed="${mode===id}">${n}</button>`).join('')}</div>`;
if(mode==='collect'){const max=state.news[state.round-1]==='E04'?3:2;html+=`<p>장터의 재료를 1~${max}장 누르세요. ${max===3?'기본 2장은 무료, 3장은 1냥입니다.':'최대 2장까지 무료입니다.'} 현재 보관 ${sum(p.materials)} / 10장.</p><div class="selection-note">${selected.length?selected.map(i=>materialNames[state.market[i]]).join(', ')+' 선택':'아직 고른 재료가 없습니다.'}</div><button class="button primary" data-action="collect" ${selectionSummary().ready?'':'disabled'}>${selected.length?'재료 '+selected.length+'장 가져오기':'재료를 먼저 고르세요'}${selected.length===3?' (1냥)':''}</button>`;}
if(mode==='sell'){html+=`<p>보유 재료 중 최대 2장을 팝니다. 이번 가격은 장당 ${state.news[state.round-1]==='E05'?3:2}냥입니다.</p><div class="sale-grid">${MATERIALS.map(m=>`<div class="sale-item">${ingredientArt(m.id)}<label for="sale-${m.id}">${m.name} (${p.materials[m.id]}장)</label><input id="sale-${m.id}" data-sale="${m.id}" type="number" min="0" max="${Math.min(2,p.materials[m.id])}" value="${sale[m.id]||0}" inputmode="numeric" ${p.materials[m.id]===0?'disabled':''}></div>`).join('')}</div><button class="button primary" data-action="sell" ${selectionSummary().ready?'':'disabled'}>선택한 재료 판매</button>`;}
if(mode==='cook'){const r=recipeById[chosen];html+=`<p>공개 주문을 눌러 확인하세요. 내 재료로 만들 수 있는 주문은 초록 테두리로 표시됩니다.</p><div class="selection-note">${r?`<b>${r.name}</b><br>${needsText(r)}<br>이번 판매가 ${price(state,r)}냥`: '테이블에서 요리 주문을 골라주세요.'}</div><button class="button primary" data-action="cook" ${r&&canCook(state,r.id)?'':'disabled'}>이 요리 판매하기</button>`;}
html+='<div class="action-divider">또는</div><button class="button outline" data-action="pass">이번 차례 패스</button>';}
html+='</div>';$('#action-panel').innerHTML=html;}

function selectionSummary(){
 const p=state.players[state.current],max=state.news[state.round-1]==='E04'?3:2;
 if(state.phase==='finished')return{stage:'최종 정산 완료',summary:'열 번의 장사를 마쳤습니다.',detail:'가게별 최종 돈을 확인하세요.',label:'최종 장부 보기',jump:'action-panel',ready:true};
 if(state.phase==='trade')return{stage:'거래 응답',summary:state.players[state.trade.to].name+'의 응답을 기다립니다.',detail:'거래 내용을 확인하고 수락 또는 거절하세요.',label:'거래 응답 보기',action:'trade-response',ready:true};
 if(state.phase==='goal')return{stage:'목표 보상',summary:'달성한 목표 하나를 골라주세요.',detail:'목표를 선택하면 5냥을 받습니다.',label:'목표 선택으로',jump:'action-panel',ready:true};
 if(state.phase==='after'){
  const reserve=canReserveOrder(chosen);
  return{stage:'차례 마무리',summary:reserve?recipeById[chosen].name+' 예약 선택':'이번 주행동을 마쳤습니다.',detail:reserve?'예약권을 사용한 뒤 다음 가게로 넘길 수 있습니다.':!p.reservationUsed&&state.round<10?'주문 예약은 선택입니다. 바로 넘겨도 됩니다.':'다음 가게에 차례를 넘겨주세요.',label:reserve?'이 주문 예약':state.round===10&&state.turnInRound===state.players.length-1?'최종 정산하기':'다음 가게로',action:reserve?'reserve':'end',ready:true};
 }
 if(mode==='sell'){
  const count=sum(sale),valid=MATERIALS.every(m=>Number.isInteger(sale[m.id]||0)&&(sale[m.id]||0)>=0&&(sale[m.id]||0)<=p.materials[m.id]),gain=count*(state.news[state.round-1]==='E05'?3:2);
  return{stage:'주행동 / 재료 판매',summary:count?count+'장 선택, 판매 대금 '+gain+'냥':'판매할 보유 재료를 고르세요.',detail:'보유 재료 1~2장을 판매할 수 있습니다.',label:count?count+'장 판매하기':'판매 수량 선택',action:'sell',ready:valid&&count>=1&&count<=2,jumpEmpty:'action-panel'};
 }
 if(mode==='cook'){
  const r=recipeById[chosen],ready=!!r&&canCook(state,r.id);
  return{stage:'주행동 / 요리 판매',summary:r?r.name+', 판매가 '+price(state,r)+'냥':'오늘의 주문에서 요리를 고르세요.',detail:r?(ready?needsText(r)+' 사용':needsText(r)+' 필요, 내 재료와 예약을 확인하세요.'):'초록 테두리는 지금 만들 수 있는 주문입니다.',label:r?'이 요리 판매':'주문을 먼저 선택',action:'cook',ready};
 }
 const cost=selected.length===3?1:0,capacity=sum(p.materials),ready=selected.length>0&&selected.length<=max&&capacity+selected.length<=10&&p.cash>=cost;
 return{stage:'주행동 / 재료 수집',summary:selected.length?selected.length+' / '+max+'장 선택, '+(cost?cost+'냥 지불':'무료'):'재료를 1~'+max+'장 골라주세요.',detail:selected.length?(capacity+selected.length>10?'보관 한도 10장을 넘습니다. 선택을 줄여주세요.':p.cash<cost?'추가 수집에 필요한 1냥이 없습니다.':selected.map(i=>materialNames[state.market[i]]).join(', ')):'현재 보관 '+capacity+' / 10장, 두 장까지 무료',label:selected.length?selected.length+'장 가져오기':'재료를 먼저 선택',action:'collect',ready};
}
function renderTableGuidance(){
 const player=state.players[state.current],choice=selectionSummary();
 $('#session-summary').innerHTML='<b>현재 '+state.players.length+'가게</b><span>'+(restored?'저장한 장사 이어가는 중':'한 기기로 함께 보는 공개 장터')+'</span>';
 const heading='<div class="guide-heading"><small>장날 '+state.round+' / 10</small><h1>'+(state.phase==='finished'?'장터 마감':username(player.name)+'의 차례')+'</h1></div>';
 const modes=state.phase==='action'?'<div class="guide-modes" aria-label="이번 주행동">'+[['collect','재료 수집'],['sell','재료 판매'],['cook','요리 판매']].map(([id,name])=>'<button data-guide-mode="'+id+'" aria-pressed="'+(mode===id)+'">'+name+'</button>').join('')+'</div>':'';
 const action=choice.jump?'data-ui-jump="'+choice.jump+'"':'data-action="'+choice.action+'"';
 const browse=state.phase==='after'||mode==='cook'?'orders':mode==='sell'?'shop':'market';
 const modeName=state.phase==='action'?{collect:'수집',sell:'재료 판매',cook:'요리 판매'}[mode]:state.phase==='after'?'마무리':state.phase==='goal'?'목표 보상':state.phase==='trade'?'거래 응답':'정산';
 $('#market-action-dock').innerHTML='<div class="dock-context">'+heading+modes+'</div><div class="dock-copy"><strong aria-live="polite">'+esc(choice.summary)+'</strong><span>'+esc(choice.detail)+'</span></div><div class="dock-buttons"><button class="dock-mode-picker" data-ui-jump="action-panel" aria-label="현재 '+modeName+', 행동 선택 열기">'+modeName+' <span aria-hidden="true">⌄</span></button><button class="button outline dock-browse" data-read-zone="'+browse+'">'+(browse==='orders'?'주문 보기':browse==='shop'?'내 가게':'재료 보기')+'</button><button id="dock-confirm" class="button primary" '+action+' '+(choice.ready?'':'disabled')+'>'+choice.label+'</button><button class="dock-more" data-ui-jump="action-panel">거래와 행동</button></div>';
}
function openAction(){
 closeReader(false);
 if(!$('#action-dialog').open)$('#action-dialog').showModal();
 const target=state.phase==='goal'?$('#action-panel [data-goal]'):mode==='sell'&&state.phase==='action'?$('#action-panel [data-sale]:not(:disabled)'):$('#action-panel h1');
 safeFocus(target||'#action-panel');
}
function jumpToAction(id){
 if(id==='action-panel'){openAction();return;}
 const target=$('#'+id);if(target){camera.reveal(target,{padding:64});safeFocus(target);}
}

function readerFocusSelector(trigger){
 if(!trigger)return '#dock-confirm';
 if(trigger.id)return '#'+trigger.id;
 for(const key of ['market','order','shop','news','inspectGoal','deck','readZone'])if(trigger.dataset[key]!==undefined){const attribute=key.replace(/[A-Z]/g,char=>'-'+char.toLowerCase());return '[data-'+attribute+'="'+trigger.dataset[key]+'"]';}
 return '#dock-confirm';
}
function openReader(kind,id,trigger){
 reader={kind,id};readerTrigger=readerFocusSelector(trigger);returnReaderFocus=true;
 if(kind==='order'&&state.orders.includes(id)){
  chosen=id;
  if(state.phase==='action'){mode='cook';selected=[];sale={};}
  render({restoreFocus:false});
 }
 renderReader();
 if(!$('#card-reader').open)$('#card-reader').showModal();
 safeFocus('#reader-title');
}
function closeReader(restore=true){
 returnReaderFocus=restore;
 if($('#card-reader').open)$('#card-reader').close();
 reader=null;
}
function readerPager(kind,index,length){return '<nav class="reader-pager" aria-label="앞뒤 카드"><button data-reader-step="-1" data-reader-kind="'+kind+'" aria-label="이전 카드">← 이전</button><span>'+(index+1)+' / '+length+'</span><button data-reader-step="1" data-reader-kind="'+kind+'" aria-label="다음 카드">다음 →</button></nav>';}
function renderReader(){
 if(!reader)return;
 let html='',title='구성품 크게 보기';
 if(reader.kind==='material'){
  const index=Number(reader.id),id=state.market[index],material=byId(MATERIALS,id);if(!material)return;
  const picked=selected.includes(index),choice=selectionSummary(),max=state.news[state.round-1]==='E04'?3:2,collectReady=state.phase==='action'&&mode==='collect'&&choice.ready;
  title=material.name+' 재료 카드';
  html='<div class="reader-layout"><article class="reader-material"><small>재료 카드 '+material.cardId+'</small>'+ingredientArt(id)+'<h3>'+material.name+'</h3><span>공개 재료 '+(index+1)+'</span></article><section class="reader-copy"><p class="reader-eyebrow">가운데 장터에서 가져오기</p><h3>'+material.name+'</h3><p>공개 재료를 최대 '+max+'장까지 골라 한 번에 가져옵니다. '+(max===3?'세 번째 재료를 가져오려면 1냥을 냅니다.':'두 장까지 무료입니다.')+'</p><p class="reader-selection" role="status"><strong>'+selected.length+'장 선택</strong><span>'+(selected.length?esc(selected.map(i=>materialNames[state.market[i]]).join(', ')):'아직 고른 재료가 없습니다.')+'</span></p><p class="reader-limit">현재 내 재료 '+sum(state.players[state.current].materials)+' / 10장'+(selected.length?' → 가져온 뒤 '+(sum(state.players[state.current].materials)+selected.length)+'장':'')+'</p><div class="reader-actions"><button id="reader-pick" class="button '+(picked?'outline':'primary')+'" data-reader-pick="'+index+'" aria-pressed="'+picked+'" '+(state.phase==='action'?'':'disabled')+'>'+(picked?'이 재료 선택 취소':'이 재료 선택')+'</button><button class="button primary" data-action="collect" '+(collectReady?'':'disabled')+'>'+selected.length+'장 가져오기'+(selected.length===3?' (1냥)':'')+'</button></div><p class="reader-hint">'+(state.phase==='action'?(selected.length?esc(mode==='collect'?choice.detail:'재료를 선택하면 수집으로 바뀝니다.'):'다음 카드도 살펴보며 필요한 재료를 고르세요.'):'지금은 재료를 가져오는 단계가 아닙니다. 카드 내용만 살펴볼 수 있습니다.')+'</p></section></div>'+readerPager('material',index,state.market.length);
 }
 if(reader.kind==='order'){
  const recipe=recipeById[reader.id];if(!recipe)return;const owner=state.reservations[recipe.id],cook=state.phase==='action'&&canCook(state,recipe.id),reserve=canReserveOrder(recipe.id);
  title=recipe.name+' 주문 카드';
  html='<div class="reader-layout"><div class="reader-order">'+recipeCard(recipe,{cost:price(state,recipe)})+'</div><section class="reader-copy"><p class="reader-eyebrow">재료를 내고 요리 판매하기</p><h3>'+recipe.name+'</h3><dl class="reader-recipe-needs">'+Object.entries(recipe.needs).map(([id,amount])=>'<div><dt>'+materialNames[id]+'</dt><dd>필요 '+amount+'장 <span>내 가게 '+state.players[state.current].materials[id]+'장</span></dd></div>').join('')+'</dl><p class="reader-price">이번 판매가 <strong>'+price(state,recipe)+'<small>냥</small></strong></p>'+(owner!==undefined?'<p class="reader-reservation">'+username(state.players[owner].name)+'의 예약 주문입니다. 다음 자기 주행동이 끝나면 예약이 해제됩니다.</p>':'')+'<div class="reader-actions">'+(state.phase==='action'?'<button class="button primary" data-action="cook" '+(cook?'':'disabled')+'>이 요리 팔고 '+price(state,recipe)+'냥 받기</button>':state.phase==='after'?'<button class="button primary" data-action="reserve" '+(reserve?'':'disabled')+'>예약권으로 이 주문 확보</button>':'')+'</div><p class="reader-hint">'+(state.phase==='action'?(cook?'필요한 재료를 내고 이번 주행동을 마칩니다.':owner!==undefined&&owner!==state.current?'다른 가게가 예약한 주문은 팔 수 없습니다.':'필요한 재료가 부족합니다. 내 가게의 재료를 확인하세요.'):state.phase==='after'?(reserve?'예약은 선택입니다. 가게마다 한 판에 한 번 사용합니다.':'지금은 이 주문을 예약할 수 없습니다.'):'주문과 필요한 재료를 살펴볼 수 있습니다.')+'</p></section></div>'+readerPager('order',state.orders.indexOf(recipe.id),state.orders.length);
 }
 if(reader.kind==='shop'){
  const player=state.players[Number(reader.id)];if(!player)return;title=player.name+'의 가게';const reservation=Object.entries(state.reservations).find(([,owner])=>owner===player.id);
  html='<div class="reader-shop-heading"><div><p class="reader-eyebrow">모두에게 공개된 가게 장부</p><h3 class="username">'+esc(player.name)+'</h3></div><p class="reader-cash"><span>현금</span><strong>'+player.cash+'<small>냥</small></strong></p></div><div class="reader-stock-grid">'+MATERIALS.map(material=>'<article>'+ingredientArt(material.id)+'<h4>'+material.name+'</h4><strong>'+player.materials[material.id]+'<small>장</small></strong></article>').join('')+'</div><div class="reader-shop-facts"><p>보관한 재료 <strong>'+sum(player.materials)+' / 10장</strong></p><p>예약권 <strong>'+(reservation?recipeById[reservation[0]].name+' 예약 중':player.reservationUsed?'사용 완료':'보유 중')+'</strong></p><p>가게 목표 <strong>'+(player.goal?byId(GOALS,player.goal).name+' 달성':'아직 달성 전')+'</strong></p></div><section class="reader-sales"><h4>판매한 요리 '+sum(player.sales)+'회</h4><ul>'+Object.entries(player.sales).map(([id,amount])=>'<li><span>'+recipeById[id].name+'</span><b>'+amount+'회</b></li>').join('')+(Object.keys(player.sales).length?'':'<li>아직 판매한 요리가 없습니다.</li>')+'</ul></section>'+(player.id===state.current&&state.phase==='action'?'<div class="reader-actions"><button class="button primary" data-reader-sell>보유 재료 판매하기</button><button class="button outline" data-action="trade" '+(state.tradeUsed?'disabled':'')+'>이웃과 거래 제안</button></div>':'')+readerPager('shop',player.id,state.players.length);
 }
 if(reader.kind==='news'){
  const next=reader.id==='next',news=byId(NEWS,state.news[state.round-(next?0:1)]);if(!news)return;title=next?'다음 장날의 소식':'현재 장터 소식';
  html='<article class="reader-notice"><p class="reader-eyebrow">'+title+' / '+news.id+'</p><h3>'+news.name+'</h3><p class="notice-effect">'+news.effect+'</p>'+(news.description!==news.effect?'<p>'+news.description+'</p>':'')+'<small>'+(next?'다음 라운드가 시작되면 이 소식으로 바뀝니다.':'이번 라운드의 모든 가게에 적용됩니다. 요리의 표시 판매가는 이 소식을 이미 반영합니다.')+'</small></article>';
 }
 if(reader.kind==='goal'){
  const goal=byId(GOALS,reader.id);if(!goal)return;const owner=state.goalOwners[goal.id],eligible=state.phase==='goal'&&state.goalChoices.includes(goal.id);title=goal.name+' 목표 카드';
  html='<article class="reader-notice reader-goal"><span class="reader-goal-seal" aria-hidden="true">5냥</span><p class="reader-eyebrow">선착순 가게 목표 / '+goal.id+'</p><h3>'+goal.name+'</h3><p class="notice-effect">'+goal.description+'</p><p>'+(owner!==undefined?username(state.players[owner].name)+'에서 달성했습니다.':'요리를 판매한 직후, 이 조건을 처음 달성하면 5냥을 받습니다. 목표마다 한 가게, 가게마다 한 번만 받을 수 있습니다.')+'</p>'+(eligible?'<div class="reader-actions"><button class="button primary" data-goal="'+goal.id+'">이 목표를 골라 5냥 받기</button></div>':'')+'</article>';
 }
 if(reader.kind==='deck'){
  const material=reader.id==='material',deck=material?state.materialDeck:state.orderDeck,discard=material?state.materialDiscard:state.orderDiscard;title=material?'재료 카드 더미':'주문 카드 더미';
  html='<article class="reader-notice"><p class="reader-eyebrow">공용 카드 더미</p><h3>'+title+'</h3><div class="reader-deck-count"><p>남은 더미 <strong>'+deck.length+'장</strong></p><p>사용한 카드 <strong>'+discard.length+'장</strong></p></div><p>공개된 카드를 가져가거나 주문을 판매하면 여기에서 새 카드를 보충합니다. 남은 카드의 앞면과 순서는 공개하지 않습니다.</p>'+(material?'<p>더미가 비면 사용한 재료를 섞어 새 더미로 만듭니다.</p>':'<p>라운드에 요리를 한 번도 팔지 않았다면 예약되지 않은 가장 오래된 주문도 바꿉니다.</p>')+'</article>';
 }
 $('#reader-title').textContent=title;$('#reader-body').innerHTML=html;
}

function setupNames(){const n=+$('#player-count').value;$('#name-inputs').innerHTML=Array.from({length:n},(_,i)=>`<div><label for="name-${i}">${i+1}번 가게 이름</label><input id="name-${i}" type="text" maxlength="16" value="${esc(state.players[i]?.name||['바다 가게','초록 가게','노을 가게','달빛 가게'][i])}" required></div>`).join('');}
function setup(){closeReader(false);if($('#action-dialog').open)$('#action-dialog').close();$('#player-count').value=state.players.length;setupNames();$('#setup').showModal();}
function showInfo(title,body){closeReader(false);if($('#action-dialog').open)$('#action-dialog').close();$('#info-title').textContent=title;$('#info-body').innerHTML=body;$('#info').showModal();}
function rules(){showInfo('섬마을 장터 게임 방법',`<div class="rules-copy"><p>3–4명이 권장되며 2명도 가능합니다. 10라운드 동안 가장 많은 돈을 남기세요. 모든 가게의 재료, 돈, 판매 기록은 공개됩니다.</p><h3>한 차례의 순서</h3><p>거래 제안 최대 1회 → 주행동 1회 → 목표 보상 → 기존 예약 해제 → 새 예약 선택 → 다음 가게. 공식 제안은 거절되어도 소모됩니다.</p><h3>네 가지 주행동</h3><ul><li>수집: 공개 재료 최대 2장 무료. 한 번에 고른 뒤 보충합니다.</li><li>재료 판매: 가진 재료 1–2장, 장당 2냥.</li><li>요리 판매: 공개 주문 한 장의 재료를 모두 내고 표시된 돈을 받습니다.</li><li>패스: 자원을 바꾸지 않고 마칩니다.</li></ul><p>보관 한도는 언제나 10장. 소식 E04는 1냥으로 세 번째 재료 수집, E05는 원재료 장당 3냥입니다. 다른 소식은 해당 요리 판매가에 반영됩니다.</p><h3>거래</h3><p>현재 가게가 상대 한 명에게 제안합니다. 양쪽 모두 현재 소유한 돈이나 재료를 내야 하며, 30초 내 상대가 수락해야 동시에 교환됩니다. 같은 자원을 같은 수량 바꾸는 무변화 거래는 할 수 없습니다.</p><h3>예약</h3><p>가게마다 한 판에 한 번, 자기 차례 끝에 주문 한 장을 예약합니다. 다음 자기 주행동이 끝나면 예약이 해제됩니다. 남의 예약 주문은 팔 수 없습니다. 10라운드에는 새 예약이 불가합니다.</p><h3>소식과 선착순 목표</h3><p>소식은 라운드마다 하나만 적용됩니다. 다음 소식은 미리 공개됩니다. 목표는 요리 판매 직후 처음 달성했을 때 하나를 골라 5냥. 목표마다 한 가게, 가게마다 한 번만 받습니다.</p><h3>라운드와 정산</h3><p>전원이 장사하면 오래된 재료 2장을 정리합니다. 그 라운드에 요리를 아무도 팔지 않았다면 예약되지 않은 가장 오래된 주문 하나도 바꿉니다. 선공은 한 자리 이동합니다. 10라운드 종료 후 남은 재료를 장당 1냥으로 더하며 동률이면 공동 승리합니다.</p><p>기획 이신우, 정순혁<br>기획서 v0.2 기준<br><a href="print.html">전체 카드와 기록지 보기 →</a></p></div>`);}
function tradeForm(){const p=state.players[state.current];$('#trade-title').textContent='이웃 가게와 흥정';$('#trade-body').innerHTML=`<div id="trade-error" class="dialog-error" role="alert" tabindex="-1" hidden></div><form id="trade-form"><p>말로 먼저 흥정하고 공식 제안을 보내세요. 양쪽이 무언가를 내야 합니다. 보내면 수락 여부와 무관하게 이번 기회를 씁니다.</p><label for="trade-to">제안받을 가게</label><select id="trade-to">${state.players.filter(x=>x.id!==p.id).map(x=>`<option value="${x.id}">${esc(x.name)} (${x.cash}냥)</option>`).join('')}</select><div class="trade-columns">${[['give','내가 건네기'],['receive','상대에게 받기']].map(([side,label])=>`<section><h3>${label}</h3><label for="${side}-cash">돈 (냥)</label><input type="number" id="${side}-cash" min="0" max="999" value="${side==='receive'?2:0}" inputmode="numeric"><div class="trade-materials">${MATERIALS.map((m,i)=>`<div><label for="${side}-${m.id}">${m.name}</label><input type="number" id="${side}-${m.id}" min="0" max="10" value="${side==='give'&&i===MATERIALS.findIndex(x=>p.materials[x.id]>0)?1:0}" inputmode="numeric"></div>`).join('')}</div></section>`).join('')}</div><div class="dialog-actions"><button type="button" class="button outline" data-close="trade-dialog">더 흥정하기</button><button type="submit" class="button primary">공식 제안 보내기</button></div></form>`;$('#trade-dialog').showModal();}
function tradeText(bundle){return[...(bundle.cash?[bundle.cash+'냥']:[]),...Object.entries(bundle.materials).filter(([,n])=>n>0).map(([id,n])=>materialNames[id]+' '+n+'장')].join('<br>')||'없음';}
function showTradeResponse(){const t=state.trade;if(!t)return;$('#trade-title').innerHTML=username(state.players[t.to].name)+'의 거래 응답';$('#trade-body').innerHTML=`<div id="trade-error" class="dialog-error" role="alert" tabindex="-1" hidden></div><p><b>${username(state.players[t.to].name)}</b>이 내용을 확인한 뒤 선택해 주세요. 같은 화면을 함께 보며 결정해도 좋습니다.</p><div class="trade-review"><section><h3>${username(state.players[t.from].name)}에서 건넵니다</h3><p>${tradeText(t.give)}</p></section><section><h3>${username(state.players[t.to].name)}에서 건넵니다</h3><p>${tradeText(t.receive)}</p></section></div><p class="trade-timer" id="trade-countdown">30초 안에 응답해 주세요.</p><div class="dialog-actions"><button class="button outline" data-action="reject">거래 거절</button><button class="button primary" data-action="accept">이 조건으로 수락</button></div>`;if(!$('#trade-dialog').open)$('#trade-dialog').showModal();startTimer();}
function startTimer(){clearInterval(timer);timer=setInterval(()=>{if(!state.trade)return clearInterval(timer);const left=Math.max(0,Math.ceil((state.trade.expiresAt-Date.now())/1000));if($('#trade-countdown'))$('#trade-countdown').textContent=`응답까지 ${left}초, 지나면 자동 거절됩니다.`;if(!left)dispatch({type:'expireTrade',now:Date.now()});},250);}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;
 if(button.dataset.tabletopAction)return;
 if(button.dataset.close){if(button.dataset.close==='card-reader')closeReader();else $('#'+button.dataset.close).close();return;}
 if(button.dataset.uiJump){jumpToAction(button.dataset.uiJump);return;}
 if(button.dataset.readZone){
  if(button.dataset.readZone==='market')openReader('material',selected[0]??0,button);
  if(button.dataset.readZone==='orders')openReader('order',state.orders.includes(chosen)?chosen:state.orders.find(id=>canCook(state,id))||state.orders[0],button);
  if(button.dataset.readZone==='shop')openReader('shop',state.current,button);
  return;
 }
 if(button.dataset.market!==undefined){openReader('material',Number(button.dataset.market),button);return;}
 if(button.dataset.order){openReader('order',button.dataset.order,button);return;}
 if(button.dataset.shop!==undefined){openReader('shop',Number(button.dataset.shop),button);return;}
 if(button.dataset.news){openReader('news',button.dataset.news,button);return;}
 if(button.dataset.inspectGoal){openReader('goal',button.dataset.inspectGoal,button);return;}
 if(button.dataset.deck){openReader('deck',button.dataset.deck,button);return;}
 if(button.dataset.readerStep){
  if(!reader)return;const kind=reader.kind,items=kind==='material'?state.market.map((_,index)=>index):kind==='order'?state.orders:state.players.map(player=>player.id),index=items.indexOf(reader.id),next=items[(index+Number(button.dataset.readerStep)+items.length)%items.length];
  reader={kind,id:next};
  if(kind==='order'){chosen=next;if(state.phase==='action'){mode='cook';selected=[];sale={};}}
  render({restoreFocus:false});safeFocus('#reader-title');return;
 }
 if(button.dataset.readerPick!==undefined){
  if(state.phase!=='action')return;const index=Number(button.dataset.readerPick),max=state.news[state.round-1]==='E04'?3:2;
  if(mode!=='collect'){mode='collect';selected=[];chosen=null;sale={};}
  if(selected.includes(index))selected=selected.filter(item=>item!==index);
  else if(selected.length<max)selected.push(index);
  else{notice('한 번에 최대 '+max+'장까지 고를 수 있습니다.');return;}
  render({restoreFocus:false});safeFocus('#reader-pick');return;
 }
 if(button.hasAttribute('data-reader-sell')){mode='sell';selected=[];chosen=null;sale={};render({restoreFocus:false});openAction();return;}
 if(button.dataset.guideMode||button.dataset.mode){mode=button.dataset.guideMode||button.dataset.mode;selected=[];chosen=null;sale={};render();if(mode==='sell'&&button.dataset.guideMode)openAction();return;}
 if(button.dataset.goal){dispatch({type:'claimGoal',goal:button.dataset.goal});return;}
 const action=button.dataset.action;
 if(action==='collect')dispatch({type:'collect',indices:selected});
 if(action==='sell')dispatch({type:'sell',materials:sale});
 if(action==='cook')dispatch({type:'cook',order:chosen});
 if(action==='pass')dispatch({type:'pass'});
 if(action==='end')dispatch({type:'end'});
 if(action==='reserve')dispatch({type:'reserve',order:chosen});
 if(action==='trade'){
  if(state.phase!=='action'||state.tradeUsed){notice('지금은 새 거래를 제안할 수 없습니다.');return;}
  closeReader(false);if($('#action-dialog').open)$('#action-dialog').close();tradeForm();
 }
 if(action==='trade-response')showTradeResponse();
 if(action==='accept'||action==='reject'){
  if(state.phase!=='trade'||!state.trade){notice('이 거래는 이미 마감됐습니다.');return;}
  dispatch({type:action,id:state.trade.id,player:state.trade.to,now:Date.now()});
 }
 if(action==='new')setup();
});
document.addEventListener('input',e=>{if(e.target.dataset.sale){sale[e.target.dataset.sale]=+e.target.value;renderTableGuidance();const confirm=$('#action-panel [data-action="sell"]');if(confirm)confirm.disabled=!selectionSummary().ready;}});$('#player-count').onchange=setupNames;$('#new-game').onclick=setup;$('#rules-open').onclick=rules;
$('#setup-form').onsubmit=e=>{e.preventDefault();restored=false;state=createGame({players:Array.from({length:+$('#player-count').value},(_,i)=>$('#name-'+i).value.trim()||`가게 ${i+1}`),seed:Date.now()});mode='collect';selected=[];chosen=null;sale={};persist();render();$('#setup').close();camera.fit();safeFocus('[data-guide-mode="collect"]');notice(`${state.players[state.current].name}부터 장사를 시작합니다.`);};
document.addEventListener('submit',e=>{if(e.target.id!=='trade-form')return;e.preventDefault();const bundle=side=>({cash:+$('#'+side+'-cash').value,materials:Object.fromEntries(MATERIALS.map(m=>[m.id,+$('#'+side+'-'+m.id).value]))});dispatch({type:'offer',to:+$('#trade-to').value,give:bundle('give'),receive:bundle('receive'),now:Date.now()});});
$('#music-toggle').onclick=async()=>{const audio=$('#music');if(audio.paused){try{audio.volume=.22;await audio.play();$('#music-toggle').textContent='음악 켜짐';$('#music-toggle').setAttribute('aria-pressed','true');}catch{notice('음악 파일을 아직 불러올 수 없습니다. 잠시 후 다시 눌러주세요.');}}else{audio.pause();$('#music-toggle').textContent='음악 꺼짐';$('#music-toggle').setAttribute('aria-pressed','false');}};
$('#card-reader').addEventListener('close',()=>{reader=null;if(returnReaderFocus)safeFocus(readerTrigger||'#dock-confirm');});
$('#action-dialog').addEventListener('close',()=>{if(!document.querySelector('dialog[open]')&&document.activeElement===document.body)safeFocus('#dock-confirm');});
window.addEventListener('pagehide',persist);render();if(state.phase==='trade'){if(Date.now()>=state.trade.expiresAt)dispatch({type:'expireTrade',now:Date.now()});else showTradeResponse();}if(!restored)persist();if(invalidSave)notice('저장한 장터를 읽지 못해 새 장터를 펼쳤습니다.');

// Let the camera room follow the real rail height when text size or names change.
const actionDock=$('#market-action-dock');
const syncDockHeight=()=>document.documentElement.style.setProperty('--market-dock-height',Math.ceil(actionDock.getBoundingClientRect().height)+'px');
new ResizeObserver(syncDockHeight).observe(actionDock);window.addEventListener('resize',syncDockHeight);syncDockHeight();
