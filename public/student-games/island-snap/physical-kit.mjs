import scenePresentation from './scene-presentation.mjs?v=premium-20261029-v1';
// Printed components only. No gameplay engine, turn state, bots, or adjudication.
export const CARD_SIZE={width:157.5,height:220,mmWidth:63,mmHeight:88};
export const CARD_TYPES={
  squid:{name:'오징어',count:10,color:'#c76046'},
  candy:{name:'호박엿',count:10,color:'#b57c2b'},
  leaves:{name:'명이나물',count:10,color:'#46745c'},
  dokdo:{name:'독도',count:10,color:'#346f8a'},
  mountain:{name:'성인봉',count:10,color:'#5d7254'},
  gull:{name:'갈매기',count:5,color:'#77739b',special:true},
  boat:{name:'배 출항',count:5,color:'#2b6a7a',special:true},
};
export const CHANT=['오징어','호박엿','명이나물','독도','성인봉'];
export const SEATS=[{x:80,y:150},{x:1120,y:150},{x:600,y:1000},{x:600,y:150},{x:80,y:1000},{x:1120,y:1000}];
const art=kind=>`<img src="/student-games/shared-art/${kind}.webp" width="768" height="768" alt="" draggable="false">`;
export function cardHTML(kind,{back=false}={}){
  if(back)return `<div class="snapkit-card snapkit-back"><img class="snapkit-back-print" src="/student-games/island-snap/assets/card-back-physical-v1.webp" width="1008" height="1408" alt="" draggable="false"><strong>울릉도<br>탐험대</strong></div>`;
  const type=CARD_TYPES[kind];if(!type)throw new Error('알 수 없는 인쇄 카드');
  const action=kind==='gull'?'<strong>양팔 두 번 퍼덕!</strong><span>이름과 상관없이</span>':kind==='boat'?'<strong>탁자 두 번 똑똑!</strong><span>이름과 상관없이</span>':'<span>외친 이름과 같으면</span><strong>가운데에 손!</strong>';
  return `<article class="snapkit-card ${type.special?'snapkit-special':''}" style="--snapkit-accent:${type.color}"><h3>${type.name}</h3><div class="snapkit-card-art">${art(kind)}</div><div class="snapkit-card-action">${action}</div></article>`;
}
export function makeCards(){return Object.entries(CARD_TYPES).flatMap(([kind,type])=>Array.from({length:type.count},(_,i)=>({id:`snap-card-${kind}-${i+1}`,kind,copy:i+1})));}
export function chantHTML(){return `<div class="snapkit-chant"><span class="snapkit-chant-label">차례로 외쳐요</span><div>${CHANT.map((word,i)=>`<strong>${word}${i<4?'<i aria-hidden="true">→</i>':''}</strong>`).join('')}<b aria-hidden="true">↻</b></div></div>`;}
export function seatHTML(number){return `<div class="snapkit-seat"><div class="snapkit-seat-heading"><b>${number}</b><textarea data-note="snap-seat-name-${number}" aria-label="${number}번 탐험가 이름" rows="1" maxlength="20">탐험가 ${number}</textarea></div><div class="snapkit-deck-outline"><span>내 뒷면 카드</span></div><div class="snapkit-response-rest"><b>${number}</b><span>내 반응 토큰</span></div><p>받은 카드는<br>내 더미 아래에 넣어요.</p></div>`;}
export function responseHTML(number,{back=false}={}){return `<div class="snapkit-response-token ${back?'snapkit-token-complete':''}"><strong>${number}</strong><span>${back?'완료':'손!'}</span></div>`;}
export function tokenGuideHTML(){return `<article class="snapkit-token-guide"><h3>더미를 받을 사람 표시</h3><p>손 대기나 특수 동작 두 번을 가장 늦게 마친 사람을 함께 확인해요. 그 사람이 토큰을 가운데 놓아 표시하고 카드 전부를 받습니다.</p><p>받은 더미 위에 내 더미를 통째로 올리면, 받은 카드가 맨 아래가 됩니다.</p></article>`;}
export function ruleHTML(page=1){
  if(page===1)return `<article class="snapkit-rule-page"><header><span>함께 읽는 규칙서 1 / 2</span><h2>오징어 호박엿<br>명이나물 독도 성인봉</h2><p>기획 박성은, 서우림 / 3–6명</p></header><section><h3>1. 섞어서 골고루 나눠요</h3><p>60장을 섞어 인원수대로 나눠요. 3명은 20장, 4명은 15장, 5명은 12장, 6명은 10장씩입니다. 내 카드는 보지 않고 뒷면으로 쌓아요. 인원수만큼 자리판과 반응 토큰을 꺼내요. 가장 최근에 바다를 본 사람이 먼저 시작합니다.</p></section><section><h3>2. 이름을 외치며 한 장 공개</h3><p>차례대로 자기 더미 맨 위 한 장을 가운데에 공개하면서 외쳐요.</p><p class="snapkit-rule-chant">오징어 → 호박엿 → 명이나물<br>→ 독도 → 성인봉 → 다시 오징어</p><p>가운데 더미를 누가 가져가도, 외치는 순서는 처음으로 돌아가지 않고 계속 이어집니다.</p></section><section><h3>3. 같으면 다 같이 반응!</h3><p>말한 이름과 카드 그림이 같으면 모두 가운데 더미에 손을 대요. 다르면 아무 행동도 하지 않고 다음 사람이 공개합니다.</p></section><footer>뒤집어서 특수 카드와 마지막 한 장 규칙을 읽어 주세요.</footer></article>`;
  return `<article class="snapkit-rule-page"><header><span>함께 읽는 규칙서 2 / 2</span><h2>특수 카드는 두 번.<br>마지막 한 장까지!</h2></header><section><h3>4. 특수 카드라면</h3><p><b>갈매기:</b> 양팔을 두 번 퍼덕여요.<br><b>배 출항:</b> 탁자를 두 번 두드려요.</p><p>외친 이름과 상관없이 모두 행동합니다. 두 번째 동작까지 가장 늦게 끝낸 사람이 가운데 더미 전체를 받습니다.</p></section><section><h3>5. 늦거나 잘못 반응했다면</h3><p>가장 늦게 반응을 끝낸 사람이 가운데 카드 전부를 자기 더미 아래에 넣어요. 받은 사람이 다음 카드를 공개합니다. 일치하지 않는데 반응하거나 특수 동작을 틀려도 그 사람이 더미를 받아요. 동시에 틀렸다면 먼저 잘못 반응한 사람이 받습니다.</p></section><section><h3>6. 마지막 카드와 승리</h3><p>마지막 카드가 반응할 카드가 아니면 바로 승리해요. 반응 카드라면 <b>카드가 없어도 전원이 참여</b>합니다. 반응을 마친 뒤에도 카드가 없는 사람이 승리해요.</p><p>가장 늦거나 틀려서 더미를 받았다면 계속합니다. 마지막 카드를 냈다는 이유로 반응을 빠지면 안 돼요.</p></section><footer>카드 60장: 일반 다섯 종류 각 10장, 특수 두 종류 각 5장.</footer></article>`;
}
function storageHTML(){return `<div class="snapkit-storage"><span>4–6명이 함께할 때</span><h3>여분 자리 보관함</h3><p>자리판 3개와 반응 토큰 3개</p><b>열어서 꺼내요</b></div>`;}
function boxCoverHTML(){return `<div class="snapkit-storage snapkit-game-box"><img src="/student-games/island-snap/assets/hero.webp" width="1536" height="1024" alt="" draggable="false"><div class="snapkit-box-cover-type"><span>다섯 이름 순발력 카드게임</span><h3>오징어 호박엿<br>명이나물 독도 성인봉</h3><p>기획 박성은, 서우림</p><div><b>카드 60장</b><b>3–6명</b></div></div></div>`;}
function prepareOrder(cards){let seed=0x20261029;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};const result=cards.map(card=>({...card}));for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
const back=cardHTML('squid',{back:true});
const pieces=[];
for(let i=0;i<6;i++){
  const seat=SEATS[i],hidden=i>=3;
  pieces.push({id:`snap-seat-${i+1}`,label:`${i+1}번 탐험가 자리판`,type:'board',x:seat.x,y:seat.y,width:325,height:350,front:seatHTML(i+1),hidden});
  pieces.push({id:`snap-response-${i+1}`,label:`${i+1}번 반응 토큰`,type:'token',x:seat.x+223,y:seat.y+171,width:76,height:76,angle:[-3,2,4,-2,3,-4][i],front:responseHTML(i+1),back:responseHTML(i+1,{back:true}),hidden});
}
prepareOrder(makeCards()).forEach((card,index)=>{const player=Math.floor(index/20),seat=SEATS[player];pieces.push({id:card.id,label:`${CARD_TYPES[card.kind].name} 여행 카드`,backLabel:'탐험카드 뒷면',type:'card',x:seat.x+24,y:seat.y+80,width:CARD_SIZE.width,height:CARD_SIZE.height,angle:[-2,2,1.5][player],faceDown:true,front:cardHTML(card.kind),back,pile:`snap-hand-${player+1}`});});
pieces.push({id:'snap-chant-strip',label:'다섯 이름 외침 순서띠',type:'board',x:535,y:510,width:470,height:80,angle:-1,front:chantHTML()});
pieces.push({id:'snap-call-marker',label:'외칠 이름 표시 토큰',type:'token',x:563,y:585,width:30,height:30,front:'<span class="snapkit-call-marker" aria-hidden="true">▲</span>'});
pieces.push({id:'snap-rulebook',label:'게임 규칙서, 앞뒷면 두 쪽',type:'book',x:1600,y:80,width:525,height:742.5,angle:-1.2,front:ruleHTML(1),back:ruleHTML(2)});
pieces.push({id:'snap-token-guide',label:'반응 토큰 사용 안내',type:'paper',x:1600,y:850,width:470,height:245,angle:1,front:tokenGuideHTML()});
pieces.push({id:'snap-spare-box',label:'여분 참가자 자리와 토큰 보관함',type:'envelope',x:1600,y:1100,width:525,height:340,angle:-1.5,front:boxCoverHTML(),back:storageHTML(),contains:['snap-seat-4','snap-response-4','snap-seat-5','snap-response-5','snap-seat-6','snap-response-6']});
export const kit={
  id:'island-snap-physical-v1',
  scene:scenePresentation,
  title:'오징어 호박엿 명이나물 독도 성인봉',
  subtitle:'기획 박성은, 서우림 / 카드 60장을 직접 넘기고 함께 반응하는 3–6인 카드게임',
  size:{width:2200,height:1450},pieces,
  zones:[{id:'snap-public-zone',label:'가운데 공개 공간',x:430,y:630,width:680,height:310,className:'snapkit-public-zone',html:'<div class="snapkit-center-cloth"><strong>가운데 더미</strong><span>한 장씩 공개하고, 늦은 사람이 전부 받아요.</span></div>'}],
};
export default kit;
