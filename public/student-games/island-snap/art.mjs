import {CARD_TYPES} from './engine.mjs';
export const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function illustration(kind){
  if(!Object.hasOwn(CARD_TYPES,kind)) throw new Error('알 수 없는 카드 그림');
  return `<img class="card-art" src="/student-games/shared-art/${kind}.webp" width="768" height="768" alt="" style="object-fit:contain">`;
}
export function cardHTML(card,{back=false}={}){if(back)return `<div class="snap-card card-back"><span>울릉도 탐험대</span>${illustration('gull')}<strong>오징어 호박엿<br>명이나물 독도 성인봉</strong></div>`;const t=CARD_TYPES[card.kind];return `<article class="snap-card ${t.special?'special-card':''}" style="--card-color:${t.color}"><span class="card-type">${t.special?'특수 카드':'여행 카드'}</span>${illustration(card.kind)}<h3>${t.name}</h3>${t.special?`<p>${card.kind==='gull'?'양팔을 두 번 퍼덕!':'탁자를 두 번 똑똑!'}</p>`:''}</article>`;}
