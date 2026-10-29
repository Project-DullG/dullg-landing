// Static physical edition of the v0.2 components. No game engine or turn state is loaded.
import { ingredientArt, dishArt, crest, materialNames } from './art.mjs?v=deep-review-20261027';
import { scenePresentation, bankCoinPose } from './scene-presentation.mjs?v=premium-20261029-v1';
export const MATERIALS = [
  {
    "id": "squid",
    "cardId": "R01",
    "name": "오징어",
    "color": "#b45443"
  },
  {
    "id": "greens",
    "cardId": "R02",
    "name": "명이나물",
    "color": "#638467"
  },
  {
    "id": "mussel",
    "cardId": "R03",
    "name": "홍합",
    "color": "#465969"
  },
  {
    "id": "potato",
    "cardId": "R04",
    "name": "감자",
    "color": "#b98c48"
  },
  {
    "id": "shrimp",
    "cardId": "R05",
    "name": "새우",
    "color": "#d27c61"
  },
  {
    "id": "rice",
    "cardId": "R06",
    "name": "쌀",
    "color": "#9c9477"
  }
];
export const RECIPES = [
  {
    "id": "D01",
    "name": "오징어볶음",
    "needs": {
      "squid": 1
    },
    "base": 4,
    "tags": [
      "single",
      "seafood"
    ]
  },
  {
    "id": "D02",
    "name": "명이나물장아찌",
    "needs": {
      "greens": 1
    },
    "base": 4,
    "tags": [
      "single",
      "vegetable"
    ]
  },
  {
    "id": "D03",
    "name": "명이나물무침",
    "needs": {
      "greens": 1
    },
    "base": 4,
    "tags": [
      "single",
      "vegetable"
    ]
  },
  {
    "id": "D04",
    "name": "감자전",
    "needs": {
      "potato": 1
    },
    "base": 4,
    "tags": [
      "single",
      "vegetable"
    ]
  },
  {
    "id": "D05",
    "name": "감자조림",
    "needs": {
      "potato": 1
    },
    "base": 4,
    "tags": [
      "single",
      "vegetable"
    ]
  },
  {
    "id": "D06",
    "name": "홍합탕",
    "needs": {
      "mussel": 1
    },
    "base": 4,
    "tags": [
      "single",
      "seafood"
    ]
  },
  {
    "id": "D07",
    "name": "새우소금구이",
    "needs": {
      "shrimp": 1
    },
    "base": 4,
    "tags": [
      "single",
      "seafood"
    ]
  },
  {
    "id": "D08",
    "name": "오징어덮밥",
    "needs": {
      "squid": 1,
      "rice": 1
    },
    "base": 7,
    "tags": [
      "rice",
      "seafood"
    ]
  },
  {
    "id": "D09",
    "name": "홍합밥",
    "needs": {
      "mussel": 1,
      "rice": 1
    },
    "base": 7,
    "tags": [
      "rice",
      "seafood"
    ]
  },
  {
    "id": "D10",
    "name": "새우볶음밥",
    "needs": {
      "shrimp": 1,
      "rice": 1
    },
    "base": 7,
    "tags": [
      "rice",
      "seafood"
    ]
  },
  {
    "id": "D11",
    "name": "명이나물 쌈밥",
    "needs": {
      "greens": 1,
      "rice": 1
    },
    "base": 7,
    "tags": [
      "rice",
      "vegetable"
    ]
  },
  {
    "id": "D12",
    "name": "해물볶음밥",
    "needs": {
      "squid": 1,
      "shrimp": 1,
      "rice": 1
    },
    "base": 11,
    "tags": [
      "rice",
      "seafood"
    ]
  }
];
export const NEWS = [
  {
    "id": "E01",
    "name": "간편 먹거리 인기",
    "effect": "재료 1장짜리 요리 판매가 +1냥",
    "description": "재료 1장짜리 요리 판매가 +1냥"
  },
  {
    "id": "E02",
    "name": "단체 손님 방문",
    "effect": "재료 2장 이상 요리 판매가 +2냥",
    "description": "재료 2장 이상 요리 판매가 +2냥"
  },
  {
    "id": "E03",
    "name": "든든한 밥 한 끼",
    "effect": "쌀이 들어간 요리 판매가 +1냥",
    "description": "쌀이 들어간 요리 판매가 +1냥"
  },
  {
    "id": "E04",
    "name": "넉넉한 장터",
    "effect": "1냥을 내면 수집을 1장 추가해 최대 3장",
    "description": "수집 기본 2장은 무료. 3장을 한 번에 가져오려면 1냥을 냅니다."
  },
  {
    "id": "E05",
    "name": "재료 도매 장날",
    "effect": "재료 판매가 장당 3냥, 최대 2장",
    "description": "재료 그대로 판매하는 행동만 장당 3냥. 최대 2장입니다."
  },
  {
    "id": "E06",
    "name": "장터 축제",
    "effect": "모든 요리 판매가 +1냥",
    "description": "모든 요리 판매가 +1냥"
  }
];
export const GOALS = [
  {
    "id": "G01",
    "name": "메뉴 개척자",
    "description": "서로 다른 음식 3종 판매",
    "reward": 5
  },
  {
    "id": "G02",
    "name": "든든한 밥집",
    "description": "서로 다른 밥 음식 2종 판매",
    "reward": 5
  },
  {
    "id": "G03",
    "name": "해물 전문점",
    "description": "해물 음식 누적 3회 판매",
    "reward": 5
  },
  {
    "id": "G04",
    "name": "채소 맛집",
    "description": "서로 다른 채소 음식 3종 판매",
    "reward": 5
  },
  {
    "id": "G05",
    "name": "큰 주문 해결사",
    "description": "재료 2장 이상 요리 누적 2회 판매",
    "reward": 5
  },
  {
    "id": "G06",
    "name": "성실한 장사꾼",
    "description": "요리 누적 4회 판매",
    "reward": 5
  }
];

export const CARD_WIDTH=156, CARD_HEIGHT=156*88/58;
export const COIN_COUNTS={1:120,5:100,10:80};
const count=values=>Object.values(values).reduce((sum,value)=>sum+value,0);
const categories=recipe=>[recipe.tags.includes('rice')?'밥 요리':'단품',recipe.tags.includes('seafood')?'해물':'채소'].join(' / ');
const needs=recipe=>Object.entries(recipe.needs).map(([id,amount])=>`<span>${materialNames[id]} <b>${amount}장</b></span>`).join('');
export function cardBack(kind){return `<div class="mk-card-back"><img src="/student-games/island-market/assets/card-back-physical-v1.webp" width="928" height="1408" alt=""><div class="mk-back-name"><b>섬마을 장터</b><span>${kind}</span></div></div>`;}
export function materialFace(material,copy=1){return `<article class="mk-card mk-material"><header><span>재료 카드</span><small>${material.cardId} / ${copy}</small></header><h2>${material.name}</h2>${ingredientArt(material.id)}<footer><p>그대로 팔 때 <strong>2<small>냥</small></strong></p><span>최종 정산은 장당 1냥</span></footer></article>`;}
export function recipeFace(recipe){return `<article class="mk-card mk-recipe"><header><span>오늘의 주문</span><small>${recipe.id}</small></header><h2>${recipe.name}</h2>${dishArt(recipe)}<div class="mk-recipe-needs">${needs(recipe)}</div><footer><p>기본 <strong>${recipe.base}<small>냥</small></strong></p><span>${categories(recipe)}</span></footer><small class="mk-price-note">판매가 = 기본가 + 소식</small></article>`;}
const newsEffects={E01:'재료 1장짜리<br>요리 <strong>+1냥</strong>',E02:'재료 2장 이상<br>요리 <strong>+2냥</strong>',E03:'쌀이 들어간<br>요리 <strong>+1냥</strong>',E04:'수집 최대 3장<br><strong>3장은 1냥</strong><small>2장까지는 무료</small>',E05:'재료 판매<br><strong>장당 3냥</strong><small>한 번에 최대 2장</small>',E06:'모든 요리<br><strong>+1냥</strong>'};
export function newsFace(news){return `<article class="mk-card mk-news"><header><span>장터 소식</span><small>${news.id}</small></header><h2>${news.name}</h2><div class="mk-news-effect">${newsEffects[news.id]}</div><footer><b>이번 장날에만 적용</b><p>거래와 최종 재고 정산에는 적용하지 않습니다.</p></footer></article>`;}
export function goalFace(goal){return `<article class="mk-card mk-goal"><header><span>선착순 목표</span><small>${goal.id}</small></header><h2>${goal.name}</h2><div class="mk-goal-reward">5<small>냥</small></div><p class="mk-goal-condition">${goal.description}</p><footer><b>요리 판매 직후 최초 달성</b><p>목표마다 한 가게<br>가게마다 한 번만</p></footer></article>`;}
export function goalBack(goal){return `<article class="mk-card mk-goal mk-completed"><header><span>달성한 가게가 보관</span><small>${goal.id}</small></header><h2>${goal.name}</h2><div class="mk-goal-reward">완료</div><p>보상 5냥은 이미 받았습니다.</p><footer><b>목표를 다시 보충하지 않습니다.</b><p>마지막 정산에 보상을 또 더하지 마세요.</p></footer></article>`;}
export function reservationFace(player,used=false){return `<article class="mk-card mk-reservation ${used?'is-used':''}"><header><span>가게 ${player}</span><small>한 판에 한 번</small></header><h2>주문 예약권</h2><div class="mk-reservation-mark">${player}</div><div class="mk-reservation-instruction">${used?'<strong class="mk-used-mark">사용 완료</strong><p>이 판에서는 다시<br>사용할 수 없습니다.</p>':'<p>자기 차례 마지막에<br>공개 주문 위에 놓습니다.</p>'}</div><footer>${used?'<b>지난 예약을 회수한 뒤<br>이 면으로 보관합니다.</b>':'<b>다음 내 주행동 뒤 회수</b><p>10번째 장날에는<br>새 예약을 할 수 없습니다.</p>'}</footer></article>`;}
export function flowFace(player,back=false){return `<article class="mk-card mk-flow"><header><span>가게 ${player} 참고</span><small>${back?'마무리':'주행동'}</small></header><h2>${back?'차례 마무리':'주행동 1회'}</h2>${back?'<ol><li><b>목표:</b><span>처음 달성한 하나로 5냥.</span></li><li><b>예약:</b><span>지난 것은 회수. 새 예약은 선택.</span></li><li><b>다음 가게:</b><span>차례말과 미사용 거래 표식을 건넵니다.</span></li></ol>':'<dl><div><dt>수집</dt><dd>1~2장 무료<br>한 번에 선택</dd></div><div><dt>재료<br>판매</dt><dd>1~2장 판매<br>장당 2냥</dd></div><div><dt>요리<br>판매</dt><dd>재료 내고<br>기본가 + 소식</dd></div><div><dt>패스</dt><dd>자원 그대로</dd></div></dl>'}</article>`;}
export function roundReference(back=false){return `<article class="mk-card mk-flow"><header><span>함께 보는 참고</span><small>${back?'정산':'장날 끝'}</small></header><h2>${back?'열 번의 장사 끝':'모두 장사했다면'}</h2>${back?'<ol><li><b>10장날 끝:</b><span>정리 없이 종료합니다.</span></li><li><b>현금 + 재료 장수.</b><span>목표 보상은 중복하지 않습니다.</span></li><li><b>최고 금액 승리.</b><span>같으면 공동 승리입니다.</span></li></ol>':'<ol><li><b>재료:</b><span>오래된 2장 정리와 보충.</span></li><li><b>요리 0회:</b><span>오래된 미예약 주문 1장 교체.</span></li><li><b>예고 → 현재.</b><span>새 예고, 선공과 장날 말 +1.</span></li></ol>'}</article>`;}
export function tradeReference(back=false){return `<article class="mk-card mk-flow"><header><span>직접 합의하는 거래</span><small>${back?'응답':'제안'}</small></header><h2>${back?'동의하면 교환':'주행동 전에 한 번'}</h2>${back?'<ol><li><b>응답 전</b><span>다음 행동은 금지입니다.</span></li><li><b>길어지면 30까지 셉니다.</b><span>끝나면 거절.</span></li><li><b>수락은 동시 교환.</b><span>거절도 기회 사용.</span></li></ol>':'<ol><li><b>상대는 한 가게.</b><span>양쪽 모두 돈이나 재료.</span></li><li><b>교환 뒤:</b><span>재료 10장 이하, 돈 0냥 이상.</span></li><li><b>주문, 예약권, 미래 약속</b><span>거래는 불가.</span></li></ol>'}</article>`;}

export function getCardInventory(){
 return [
  ...MATERIALS.flatMap(material=>Array.from({length:20},(_,index)=>({id:`material-${material.id}-${index+1}`,label:`${material.name} ${index+1}번`,category:'material',material:material.id,front:materialFace(material,index+1),back:cardBack('재료 카드')}))),
  ...RECIPES.map(recipe=>({id:`order-${recipe.id}`,label:`${recipe.name} 주문`,category:'order',recipe:recipe.id,front:recipeFace(recipe),back:cardBack('요리 주문')})),
  ...NEWS.flatMap(news=>Array.from({length:2},(_,index)=>({id:`news-${news.id}-${index+1}`,label:`${news.name} ${index+1}번`,category:'news',news:news.id,front:newsFace(news),back:cardBack('장터 소식')}))),
  ...GOALS.map(goal=>({id:`goal-${goal.id}`,label:`${goal.name} 목표`,category:'goal',goal:goal.id,front:goalFace(goal),back:cardBack('가게 목표')})),
  ...Array.from({length:4},(_,index)=>({id:`reservation-${index+1}`,label:`가게 ${index+1} 예약권`,category:'reservation',player:index+1,front:reservationFace(index+1),back:reservationFace(index+1,true)}))
 ];
}
export function coinFace(value){return `<span class="mk-coin mk-coin-${value}"><span class="mk-coin-ring"></span><strong>${value}</strong><small>냥</small></span>`;}
export function matFace(player,{half=null}={}){
 const slots=half===null?Array.from({length:10},(_,index)=>index+1):Array.from({length:5},(_,index)=>half*5+index+1);
 return `<article class="mk-player-mat ${half===null?'':'mk-mat-half'}"><header><b>가게 ${player}</b><span>재료는 언제나 10장 이하</span><small>${half===null?'한 칸에 재료 한 장씩 놓습니다.':(half===0?'첫째 쪽 1~5칸':'둘째 쪽 6~10칸')+' / 두 쪽을 함께 사용합니다.'}</small></header><div class="mk-inventory-slots">${slots.map(slot=>`<div><span>${slot}</span></div>`).join('')}</div><footer>거래를 마친 뒤에도 10장 이하를 지킵니다. 돈과 재료, 판매 기록은 모두 공개합니다.</footer></article>`;
}
export function ledgerFace(player){return `<article class="mk-ledger"><header><small>가게 ${player}의 공개 기록</small><h2>판매 장부</h2><p>팔 때마다 해당 칸의 누적 횟수를 직접 고쳐 씁니다.</p></header><table><thead><tr><th>요리와 분류</th><th>누적 판매</th></tr></thead><tbody>${RECIPES.map(recipe=>`<tr><td><b>${recipe.id} ${recipe.name}</b><small>${categories(recipe)} / 재료 ${count(recipe.needs)}장</small></td><td><textarea rows="1" data-note="market-p${player}-sales-${recipe.id}" aria-label="가게 ${player} ${recipe.name} 누적 판매 횟수" placeholder="0"></textarea></td></tr>`).join('')}</tbody></table><div class="mk-ledger-notes"><label>달성한 목표<textarea rows="1" data-note="market-p${player}-goal" aria-label="가게 ${player} 달성한 목표"></textarea></label><label>마지막 정산<textarea rows="1" data-note="market-p${player}-final" aria-label="가게 ${player} 마지막 현금과 재고 정산"></textarea></label></div><footer>현금 + 남은 재료 장수 = 최종 돈<br>목표 보상을 다시 더하지 않습니다.</footer></article>`;}
export function roundTrackFace(half=null){return `<article class="mk-round-track"><header><b>열 번의 장날</b><span>차례말이 선공 가게로 돌아오면 한 장날이 끝납니다.</span></header><ol>${Array.from({length:half===null?10:5},(_,index)=>{const round=index+1+(half===null?0:half*5);return `<li><b>${round}</b><small>${round===10?'즉시 정산':'장날'}</small></li>`;}).join('')}</ol><footer>10장날은 정리 없이 즉시 정산합니다. 그전에는 선공을 한 자리 옮기고 다음 소식을 공개합니다.</footer></article>`;}
export const RULE_PAGES=[
 {title:'장터를 여는 순서',body:'<p>3~4명이 권장되며 2명도 가능합니다. 열 번의 장날 동안 가장 많은 돈을 남기세요. 이 판은 기본 4가게를 준비해 두었습니다.</p><ol><li>각 가게에 5냥과 예약권 1장을 줍니다.</li><li><b>쌀을 1장씩 따로 줍니다.</b> 나머지 5종 재료만 섞어 각 가게에 무작위 2장씩 줍니다.</li><li>남은 재료를 모두 합쳐 섞습니다. 재료 6장과 주문 4장을 공개합니다.</li><li>목표 6장 중 3장을 무작위로 공개합니다. 나머지는 이번 판에 쓰지 않습니다.</li></ol>'},
 {title:'소식과 자리 준비',body:'<p>소식 12장을 섞고 10장만 이번 판에 사용합니다. 현재 소식과 다음 예고를 한 장씩 공개합니다. 나머지 8장은 이후 소식 더미로, 빠진 2장은 이번 판 미사용 더미로 둡니다.</p><p>첫 선공은 무작위로 정합니다. 선공 표식과 차례말을 그 가게에 놓고 장날 말을 1에 둡니다.</p><p>공개 재료와 주문은 <b>왼쪽부터 오래된 순서</b>입니다. 2줄일 때는 윗줄 왼쪽부터 읽고 아랫줄로 이어집니다. 카드를 가져가면 남은 카드를 앞으로 당기고 새 카드는 맨 뒤에 놓습니다.</p>'},
 {title:'한 차례에 하는 일',body:'<ol><li>이웃 한 가게에 거래를 제안할지 선택합니다. 공식 제안은 최대 한 번이며 거절돼도 사용한 것입니다.</li><li><b>주행동을 정확히 하나</b> 합니다. 수집, 재료 판매, 요리 판매, 패스 중 하나입니다.</li><li>요리를 팔았다면 목표를 확인하고 판매 장부에 누적 횟수를 적습니다.</li><li>지난 자기 예약은 어떤 주행동을 했든 끝납니다. 주문에서 자기 예약권을 회수해 사용 완료 면으로 둡니다.</li><li>아직 예약권을 쓰지 않았다면 새 예약을 선택할 수 있습니다. 차례말을 다음 가게에 넘깁니다.</li></ol>'},
 {title:'네 가지 주행동',body:'<p><b>수집.</b> 공개 재료 1~2장을 무료로 가져옵니다. 먼저 한 번에 고른 뒤 맨 뒤부터 보충합니다. 소식 E04일 때만 1냥으로 세 번째 재료까지 고를 수 있습니다.</p><p><b>재료 판매.</b> 내 재료 1~2장을 사용 더미로 내고 장당 2냥을 은행에서 받습니다. E05이면 장당 3냥입니다.</p><p><b>요리 판매.</b> 공개 주문 하나의 재료를 모두 사용 더미에 내고 기본 판매가에 현재 소식만 더한 돈을 받습니다. 주문도 사용 더미에 내고 새 주문을 맨 뒤에 놓습니다.</p><p><b>패스.</b> 자원을 바꾸지 않고 주행동을 마칩니다. 재료는 언제나 10장 이하입니다.</p>'},
 {title:'이웃과 하는 거래',body:'<p>현재 차례 가게가 상대 한 곳에 공식 제안을 합니다. <b>양쪽 모두 지금 가진 돈이나 재료</b>를 내야 합니다. 주문과 예약권, 미래 약속은 거래할 수 없습니다. 같은 자원의 같은 수량만 바꾸는 거래도 하지 않습니다.</p><p>상대가 수락하거나 거절하기 전에는 다음 행동을 하지 않습니다. 수락하면 동시에 교환하고, 교환 뒤에도 돈은 0냥 이상이며 재료는 10장 이하인지 함께 확인합니다.</p><p><b>수동판 운영:</b> 서로 짧게 협의합니다. 협의가 길어지면 다른 참가자가 30까지 소리 내어 셉니다. 끝날 때까지 수락하지 않으면 거절입니다. 휴대폰이나 웹 타이머는 필요하지 않습니다.</p>'},
 {title:'예약권 한 장의 약속',body:'<p>가게마다 한 판에 한 번입니다. 자기 차례 마지막에 미예약 공개 주문 한 장 위에 자기 예약권을 놓습니다. 예약한 가게만 그 주문을 팔 수 있습니다.</p><p>다음 자기 주행동이 끝나면 예약은 해제됩니다. 다른 행동을 했어도 해제되며 예약권을 회수해 사용 완료 면으로 둡니다.</p><p>10번째 장날에는 새 예약을 할 수 없습니다. 다른 가게가 예약한 주문을 빼앗거나 예약권을 거래할 수 없습니다.</p><p>예약이 걸린 주문은 장날 종료 시 오래된 주문 정리에서도 제외됩니다.</p>'},
 {title:'목표는 판매 직후에',body:'<p>요리를 판 직후 그 판매로 처음 충족한 목표를 확인합니다. 해당하는 공개 미선점 목표가 여럿이면 <b>하나만</b> 골라 5냥을 받고 목표 카드를 가져옵니다.</p><p>목표마다 한 가게, 가게마다 한 번만 받습니다. 가져간 목표 자리는 보충하지 않습니다. 이전 판매 때 이미 충족했던 목표를 나중에 선택하지 않습니다.</p><p>서로 다른 요리 수와 누적 판매 횟수는 다릅니다. 장부의 요리 ID와 밥/해물/채소 분류, 필요한 재료 수를 함께 확인하세요. 같은 요리 두 번은 서로 다른 두 종류가 아닙니다.</p>'},
 {title:'장날을 마치는 순서',body:'<p>선공 가게부터 모두 한 차례씩 장사하면 장날이 끝납니다. 열 번째가 아니라면 다음 순서로 정리합니다.</p><ol><li>가장 오래된 공개 재료 2장을 사용 더미로 보내고 남은 카드를 당긴 뒤 보충합니다.</li><li>이번 장날에 요리를 아무도 팔지 않았다면 가장 오래된 <b>미예약 주문</b> 한 장도 정리하고 보충합니다.</li><li>현재 소식은 사용 더미로, 예고는 현재 자리로 옮깁니다. 다음 예고 한 장을 공개합니다.</li><li>선공 표식을 한 자리 옮기고 차례말도 그곳에 둡니다. 장날 말을 한 칸 옮깁니다.</li></ol>'},
 {title:'더미와 표식 다루기',body:'<p>재료와 주문의 공급 더미가 비면 해당 사용 더미를 섞어 새 공급 더미로 만듭니다. 소식은 이번 판에 고른 10장만 씁니다.</p><p>요리를 한 번이라도 판 장날에는 요리 판매 표식을 판매 있음 면으로 둡니다. 새 장날에는 판매 없음 면으로 돌립니다. 거래 기회 표식도 다음 차례 시작에 미사용으로 돌립니다.</p><p>카드와 동전은 실제 물건처럼 이동합니다. 겹쳐 두거나 뒤집고, 장부에는 직접 적습니다. 자동 계산과 행동 판정은 없습니다.</p>'},
 {title:'열 번째 장날과 승리',body:'<p>열 번째 장날에 마지막 가게가 자기 차례를 마치면 <b>공개 재료나 주문을 정리하지 않고 즉시 종료</b>합니다.</p><p>각 가게는 남은 재료 한 장마다 1냥을 현금에 딱 한 번 더합니다. 목표 보상과 요리 판매 대금은 이미 받은 돈에 포함됐으므로 다시 더하지 않습니다.</p><p>가장 많은 돈을 남긴 가게가 이깁니다. 같으면 공동 승리입니다. 마지막 금액은 가게 장부에 직접 기록합니다.</p>'},
 {title:'은행과 공개 정보',body:'<p>은행에는 1냥 120개, 5냥 100개, 10냥 80개가 있습니다. 총 1,420냥이며 처음 나누는 20냥도 여기에 포함됩니다.</p><p>동전 앞면의 금액대로 셉니다. 잔돈이 필요하면 같은 금액으로 은행과 바꿉니다. 특정 동전이 부족하면 큰 동전으로 교환합니다.</p><p>은행이 모자랄 때에는 은행 확인증에 지급 금액과 가게 이름을 적고 동전과 같은 돈으로 셉니다. 확인증을 다시 동전으로 바꿀 때는 사용 완료로 표시해 두 번 세지 않습니다.</p><p>돈, 재료, 판매 기록은 언제나 모두 공개합니다.</p>'},
 {title:'2~3가게로 할 때',body:'<p>쓰지 않는 가게의 재료 3장과 5냥을 공급 더미와 은행으로 돌립니다. 재료 더미를 다시 섞고, 공개 재료 6장도 함께 섞어 다시 여섯 장을 펼칩니다.</p><p>쓰지 않는 개인 매트와 예약권, 장부와 참고 카드는 옆으로 치웁니다. 나머지 규칙과 장날 수는 같습니다. 사용 중인 가게들만 돌아가며 선공을 옮깁니다.</p><p>원안 카드 154장: 재료 120장, 주문 12장, 소식 12장, 목표 6장, 예약권 4장입니다. 동전과 매트, 장부, 참고 카드는 수동 플레이를 돕는 추가 구성품입니다.</p><p>기획 이신우, 정순혁 / 원안 v0.2</p>'}
];
export function rulePageFace(index){const page=RULE_PAGES[index];return `<article class="mk-rule-page"><header><small>섬마을 장터 규칙서 ${String(index+1).padStart(2,'0')} / 12</small><h2>${page.title}</h2></header><div>${page.body}</div><footer>기획 이신우, 정순혁 / 원안 v0.2와 수동판 운영 보완</footer></article>`;}
function ruleCover(){return `<article class="mk-rule-cover"><small>이신우, 정순혁 기획</small><h2>섬마을<br>장터</h2><div>${crest}</div><b>직접 펼치고 장사하는 규칙서</b><p>돈을 세고, 재료를 옮기고,<br>서로 합의하며 열 번의 장사를 합니다.</p><span>규칙서 12쪽 / 원안 카드 154장</span></article>`;}
function randomFor(seed){let value=Number(seed)||1;return()=>{value|=0;value=value+0x6d2b79f5|0;let t=Math.imul(value^value>>>15,1|value);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffled(items,random){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
export const PLAYER_MATS=[{x:50,y:180},{x:2090,y:180},{x:50,y:1420},{x:2090,y:1420}];
const piece=(id,label,type,x,y,width,height,front,extra={})=>({id,label,type,x,y,width,height,front,...extra});
const cardPiece=(card,x,y,extra={})=>piece(card.id,card.label,'card',x,y,CARD_WIDTH,CARD_HEIGHT,card.front,{back:card.back,backLabel:({material:'재료 카드 뒷면',order:'요리 주문 뒷면',news:'장터 소식 뒷면',goal:'가게 목표 뒷면'})[card.category]||card.label,...extra});
export function buildMarketKit(seed=20261029){
 const random=randomFor(seed),cards=getCardInventory(),pieces=[],pick=category=>cards.filter(card=>card.category===category);
 const materialCards=pick('material'),nonRice=shuffled(materialCards.filter(card=>card.material!=='rice'),random),rice=materialCards.filter(card=>card.material==='rice');
 const dealt=new Set();
 PLAYER_MATS.forEach((mat,index)=>{
  const player=index+1;pieces.push(piece(`mat-${player}`,`가게 ${player} 10칸 재료 매트`,'board',mat.x,mat.y,860,620,matFace(player),{locked:true}));
  const hand=[rice[index],nonRice.pop(),nonRice.pop()];
  hand.forEach((card,slot)=>{dealt.add(card.id);pieces.push(cardPiece(card,mat.x+28+slot*162,mat.y+84,{angle:[-1.5,1,-.7][slot]}));});
  const reservation=pick('reservation')[index];pieces.push(cardPiece(reservation,mat.x+690,mat.y+625,{angle:4}));
  pieces.push(piece(`flow-${player}`,`가게 ${player} 차례 참고 카드`,'card',mat.x+508,mat.y+625,CARD_WIDTH,CARD_HEIGHT,flowFace(player),{back:flowFace(player,true),angle:-3}));
  pieces.push(piece(`ledger-${player}`,`가게 ${player} 판매 장부`,'book',mat.x+35,mat.y+625,420,594,ledgerFace(player),{angle:-1,back:`<article class="mk-ledger-back"><h2>가게 ${player} 판매 장부</h2><p>앞면에 요리별 누적 판매 횟수를 직접 적습니다.</p><b>종류와 누적 횟수를 구분합니다.</b></article>`}));
 });
 const remaining=shuffled(materialCards.filter(card=>!dealt.has(card.id)),random),market=remaining.splice(0,6);
 market.forEach((card,index)=>pieces.push(cardPiece(card,1090+(index%3)*250,1050+Math.floor(index/3)*280,{angle:[-.8,.6,-.4,.7,-.6,.5][index]})));
 remaining.forEach(card=>pieces.push(cardPiece(card,760,1070,{pile:'material-deck',faceDown:true})));
 const orders=shuffled(pick('order'),random);orders.splice(0,4).forEach((card,index)=>pieces.push(cardPiece(card,1090+index*220,1740,{angle:index%2?.7:-.6})));orders.forEach(card=>pieces.push(cardPiece(card,2580,1065,{pile:'order-deck',faceDown:true})));
 const news=shuffled(pick('news'),random);const unusedNews=news.splice(10);pieces.push(cardPiece(news.shift(),1120,350));pieces.push(cardPiece(news.shift(),1370,350));news.forEach(card=>pieces.push(cardPiece(card,1710,350,{pile:'news-deck',faceDown:true})));unusedNews.forEach(card=>pieces.push(cardPiece(card,1160,2350,{pile:'not-in-play',faceDown:true,hidden:true,angle:90})));
 const goals=shuffled(pick('goal'),random);goals.splice(0,3).forEach((card,index)=>pieces.push(cardPiece(card,1090+index*250,700)));goals.forEach(card=>pieces.push(cardPiece(card,1160,2350,{pile:'not-in-play',faceDown:true,hidden:true,angle:90})));
 pieces.push(piece('unused-envelope','이번 판 미사용 소식과 목표 봉투','envelope',1050,2340,400,220,'<article class="mk-unused-envelope"><b>이번 판 미사용</b><p>소식 2장과 목표 3장</p><small>이번 판에는 섞어 넣지 않습니다.</small></article>',{contains:[...unusedNews,...goals].map(card=>card.id)}));
 pieces.push(piece('round-track','1~10 장날 트랙','board',1020,45,960,190,roundTrackFace(),{locked:true}));
 pieces.push(piece('round-marker','현재 장날 말','token',1065,160,36,36,'<span class="mk-round-marker">장날</span>'));
 const starter=Math.floor(random()*4),start=PLAYER_MATS[starter];
 pieces.push(piece('first-player','선공 표식','token',start.x+590,start.y-100,78,78,'<span class="mk-wood-marker"><b>선공</b></span>'));
 pieces.push(piece('turn-pawn','현재 차례말','token',start.x+700,start.y-112,92,92,'<span class="mk-turn-pawn"><b>차례</b></span>'));
 pieces.push(piece('trade-opportunity','이번 차례 거래 기회','token',start.x+810,start.y-100,74,74,'<span class="mk-trade-marker"><b>거래<br>미사용</b></span>',{back:'<span class="mk-trade-marker is-used"><b>거래<br>사용함</b></span>'}));
 pieces.push(piece('round-cooked','이번 장날 요리 판매 여부','token',1790,670,112,112,'<span class="mk-cooked-marker"><b>이번 장날<br>요리 판매<br>없음</b></span>',{back:'<span class="mk-cooked-marker is-sold"><b>이번 장날<br>요리 판매<br>있음</b></span>'}));
 pieces.push(piece('round-reference','장날 정리와 최종 정산 참고 카드','card',1090,2010,CARD_WIDTH,CARD_HEIGHT,roundReference(),{back:roundReference(true)}));
 pieces.push(piece('trade-reference','거래 합의 참고 카드','card',1320,2010,CARD_WIDTH,CARD_HEIGHT,tradeReference(),{back:tradeReference(true)}));
 for(const [amountText,total]of Object.entries(COIN_COUNTS)){
  const amount=Number(amountText),diameter=amount===1?52:amount===5?62:72;
  for(let index=0;index<total;index++){
   const bankPose=bankCoinPose(amount,index);
   let x=bankPose?.x,y=bankPose?.y;
   if(amount===1&&index<20){const player=Math.floor(index/5),coin=index%5,mat=PLAYER_MATS[player];x=mat.x+90+coin*40;y=mat.y-93;}
   pieces.push(piece(`coin-${amount}-${index+1}`,`${amount}냥 동전`,'token',x,y,diameter,diameter,coinFace(amount),{back:coinFace(amount),...(bankPose?{pile:bankPose.pile,angle:bankPose.angle}:{})}));
  }
 }
 pieces.push(piece('bank-slip','은행 확인증','paper',1460,2350,235,150,'<article class="mk-bank-slip"><b>은행 확인증</b><label>가게와 금액<textarea data-note="market-bank-slip" aria-label="은행 확인증 가게 이름과 금액"></textarea></label><small>동전으로 바꾸면 사용 완료로 표시합니다.</small></article>'));
 for(let index=0;index<6;index++)pieces.push(piece(`rule-page-${index+1}`,`규칙서 ${index*2+1}~${index*2+2}쪽`,'paper',1710,2010,420,594,rulePageFace(index*2),{back:rulePageFace(index*2+1),pile:'rulebook'}));
 pieces.push(piece('rule-cover','섬마을 장터 규칙서 표지','book',1710,2010,420,594,ruleCover(),{back:'<article class="mk-rule-page"><header><small>섬마을 장터 규칙서</small><h2>차례</h2></header><div><ol>'+RULE_PAGES.map(page=>'<li>'+page.title+'</li>').join('')+'</ol></div><footer>책장을 앞면과 뒷면으로 차례대로 읽습니다.</footer></article>',pile:'rulebook'}));
 return {id:'island-market-physical-v1',title:'섬마을 장터',subtitle:'기획 이신우, 정순혁 / 카드와 돈을 직접 옮기는 4가게 장터',scene:scenePresentation,size:{width:3000,height:2670},pieces,zones:[
  {id:'public-cloth',label:'공용 장터',x:1010,y:270,width:990,height:2000,className:'mk-public-zone',html:'<div class="mk-public-cloth"><b class="mk-public-news-label">현재 소식 <span>다음 예고</span><span>이후 소식 더미</span></b><b class="mk-public-goal-label">이번 판의 선착순 목표 3장</b><b class="mk-public-material-label">재료 장터 <small>1 → 2 → 3<br>4 → 5 → 6　오래된 순서</small></b><b class="mk-public-order-label">오늘의 주문 <small>왼쪽이 가장 오래된 주문입니다.</small></b></div>'},
  {id:'bank',label:'공용 은행',x:1090,y:595,width:830,height:95,html:'<div class="mk-bank-strip"><b>공용<br>은행</b><span>1냥</span><span>5냥</span><span>10냥</span></div>'},
  {id:'material-supply',label:'재료 공급',x:736,y:1030,width:215,height:35},
  {id:'material-discard',label:'사용한 재료',x:558,y:1070,width:180,height:265,html:'<div class="mk-used-well"><b>사용한<br>재료</b><small>공급이 비면<br>섞어 재사용</small></div>'},
  {id:'order-supply',label:'주문 공급',x:2570,y:1025,width:205,height:35},
  {id:'order-discard',label:'사용한 주문',x:2770,y:1065,width:180,height:265,html:'<div class="mk-used-well"><b>사용한<br>주문</b><small>공급이 비면<br>섞어 재사용</small></div>'},
  {id:'news-discard',label:'지난 장날 소식',x:1710,y:1030,width:180,height:265,html:'<div class="mk-used-well"><b>지난 장날<br>소식</b><small>이번 판에는<br>다시 쓰지 않음</small></div>'}
 ]};
}
const kit=buildMarketKit();
export default kit;
