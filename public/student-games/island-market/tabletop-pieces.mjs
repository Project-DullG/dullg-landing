import { MATERIALS, NEWS, GOALS } from './engine.mjs';
import { ingredientArt } from './art.mjs?v=deep-review-20261027';
import { esc } from './cards.mjs?v=deep-review-20261027';

const count = values => Object.values(values).reduce((total, value) => total + value, 0);
const coins = amount => '<span class="coin-stack" aria-hidden="true">'+Array.from({length:Math.min(12,amount)},(_,index)=>'<i style="--coin-x:'+((index%5)*21+(Math.floor(index/5)%2)*9)+'px;--coin-y:'+(Math.floor(index/5)*13+(index%3)*4)+'px;--coin-turn:'+((index%4)*17)+'deg"></i>').join('')+'</span>';

export function physicalNews(state) {
  const current = NEWS.find(item => item.id === state.news[state.round - 1]);
  const next = NEWS.find(item => item.id === state.news[state.round]);
  return `<div class="round-marker"><small>장날</small><b>${state.round}</b><span>열 번의 장사</span></div>` +
    `<button class="news-piece current-news" data-news="current"><small>지금 적용하는 소식</small><b>${current.name}</b><p>${current.effect}</p><span>${current.id}</span></button>` +
    (next ? `<button class="news-piece next-news" data-news="next"><small>다음 장날의 소식</small><b>${next.name}</b><p>${next.effect}</p><span>${next.id}</span></button>` :
      `<div class="news-piece closed-news"><small>마지막 장날</small><b>${state.phase === 'finished' ? '장터 마감' : '이번 장사가 끝나면'}</b><p>${state.phase === 'finished' ? '재고 정산을 마쳤습니다.' : '남은 재료를 정산합니다.'}</p></div>`);
}

export function physicalGoals(state) {
  return state.goals.map(id => {
    const goal = GOALS.find(item => item.id === id);
    const owner = state.goalOwners[id];
    const eligible = state.phase === 'goal' && state.goalChoices.includes(id);
    return `<button class="goal-piece ${owner !== undefined ? 'is-claimed' : ''} ${eligible ? 'is-eligible' : ''}" data-inspect-goal="${id}"><span class="goal-seal" aria-hidden="true">5<small>냥</small></span><div><b>${goal.name}</b><p>${goal.description}</p><small>${owner !== undefined ? esc(state.players[owner].name) + ' 달성' : '선착순 목표'}</small></div></button>`;
  }).join('');
}

export function physicalShops(state) {
  return state.players.map((player, index) => {
    const current = index === state.current && state.phase !== 'finished';
    const reservation = Object.entries(state.reservations).find(([, owner]) => owner === index);
    const owned = MATERIALS.filter(material => player.materials[material.id] > 0);
    return `<article class="player-mat ${current ? 'is-current' : ''}" data-seat="${index}" data-owned-count="${owned.length}" aria-label="${esc(player.name)}의 공개 가게">
      <div class="shop-topline"><button class="shop-nameplate" data-shop="${index}"><span class="seat-number">0${index + 1}</span><span><b class="username">${esc(player.name)}</b><small>${current ? '지금 장사하는 가게' : index === state.starter ? '이번 장날 선공' : '공개 가게 장부'}</small></span></button><button class="cash-pile" data-shop="${index}" aria-label="${esc(player.name)}, 현금 ${player.cash}냥">${coins(player.cash)}<strong>${player.cash}<small>냥</small></strong></button></div>
      <div class="physical-stock">${owned.map((material, slot) => `<button class="stock-piece has-stock" data-shop="${index}" data-stock="${material.id}" style="--hand-column:${slot % 3};--hand-row:${Math.floor(slot / 3)};--hand-angle:${[-5, 2, -2, 4, -3, 3][slot]}deg" aria-label="${esc(player.name)}, ${material.name} ${player.materials[material.id]}장">${ingredientArt(material.id)}<b>${material.name}</b><span class="stock-count">${player.materials[material.id]}<small>장</small></span></button>`).join('')}</div>
      <div class="shop-bottomline"><button class="ledger-cover" data-shop="${index}"><small>공개 기록</small><b>가게 장부</b><span>재료 ${count(player.materials)} / 10장</span><span>요리 ${count(player.sales)}회</span><i aria-hidden="true"></i></button><button class="reservation-piece ${player.reservationUsed ? 'is-used' : ''}" data-shop="${index}"><b>예약권</b><span>${reservation ? '주문 예약 중' : player.reservationUsed ? '사용 완료' : '한 번 사용'}</span></button></div>
    </article>`;
  }).join('');
}

export function physicalPiles(state) {
  return `<button class="deck-piece material-deck" data-deck="material"><span class="deck-illustration" aria-hidden="true">${ingredientArt('squid')}</span><b>재료 더미</b><strong>${state.materialDeck.length}<small>장</small></strong><span>눌러 더미 확인</span></button><button class="deck-piece order-deck" data-deck="order"><span class="deck-illustration" aria-hidden="true">${ingredientArt('rice')}</span><b>주문 더미</b><strong>${state.orderDeck.length}<small>장</small></strong><span>눌러 더미 확인</span></button><div class="discard-tray"><b>사용한 카드</b><p>재료 ${state.materialDiscard.length}장</p><p>주문 ${state.orderDiscard.length}장</p></div>`;
}
