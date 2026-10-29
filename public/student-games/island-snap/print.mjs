import {makeCards,cardHTML,ruleHTML,chantHTML,seatHTML,responseHTML,tokenGuideHTML} from './physical-kit.mjs?v=physical-components-20261029-v1';
const cards=makeCards(),pageCount=Math.ceil(cards.length/9),html=[];
const blankBack=label=>`<section class="print-sheet print-backs snapkit-blank-back" aria-label="${label} 빈 뒷면">&nbsp;</section>`;
const footer=(label,page)=>`<div class="sheet-footer"><span>기획 박성은, 서우림 / ${label}</span><span>${page}</span></div>`;
for(let page=0;page<pageCount;page++){
  const slots=Array.from({length:9},(_,i)=>cards[page*9+i]||null);
  html.push(`<section class="print-sheet" aria-label="카드 앞면 ${page+1}쪽">${slots.map(card=>card?`<div class="print-card">${cardHTML(card.kind)}</div>`:'<div></div>').join('')}${footer('앞면',`${page+1} / ${pageCount}`)}</section>`);
  const backs=[];for(let row=0;row<3;row++)backs.push(...slots.slice(row*3,row*3+3).reverse());
  html.push(`<section class="print-sheet print-backs" aria-label="카드 뒷면 ${page+1}쪽">${backs.map(card=>card?`<div class="print-card">${cardHTML('squid',{back:true})}</div>`:'<div></div>').join('')}${footer('뒷면',`${page+1} / ${pageCount}`)}</section>`);
}
for(let page=1;page<=2;page++)html.push(`<section class="print-sheet snapkit-rule-sheet" aria-label="규칙서 ${page}쪽"><div class="snapkit-print-original" style="width:525px;height:742.5px">${ruleHTML(page)}</div></section>`);
html.push(`<section class="print-sheet snapkit-accessory-sheet" aria-label="외침 순서띠와 반응 토큰"><h2>외침 순서띠와 반응 토큰</h2><p>순서띠와 토큰을 잘라 사용하세요. 세 명이라면 1–3번을, 여섯 명이라면 모두 꺼내요. 작은 삼각 표시는 지금 외칠 이름을 표시할 때 사용합니다.</p><div class="snapkit-print-band"><div class="snapkit-print-original" style="width:470px;height:80px">${chantHTML()}</div></div><div class="snapkit-print-token-row">${Array.from({length:6},(_,i)=>`<div class="snapkit-print-token"><div class="snapkit-print-original" style="width:76px;height:76px">${responseHTML(i+1)}</div></div>`).join('')}<div class="snapkit-print-call"><span class="snapkit-call-marker" aria-label="외침 표시">▲</span></div></div><div class="snapkit-print-guide"><div class="snapkit-print-original" style="width:470px;height:245px">${tokenGuideHTML()}</div></div><p class="snapkit-print-cut-note">토큰 뒷면은 비워 두어도 됩니다. 실제 반응 동작과 마무리 판단은 함께 확인해요.</p></section>`);
html.push(blankBack('외침 순서띠와 반응 토큰'));
for(let page=0;page<3;page++){html.push(`<section class="print-sheet snapkit-seat-sheet" aria-label="탐험가 자리판 ${page*2+1}번과 ${page*2+2}번">${[page*2+1,page*2+2].map(number=>`<div class="snapkit-print-seat"><div class="snapkit-print-original" style="width:325px;height:350px">${seatHTML(number)}</div></div>`).join('')}</section>`);html.push(blankBack(`탐험가 자리판 ${page*2+1}번과 ${page*2+2}번`));}
document.querySelector('#print-sheets').innerHTML=html.join('');
document.querySelector('#print-button').onclick=()=>window.print();
document.querySelector('#with-backs').onchange=event=>document.body.classList.toggle('show-backs',event.target.checked);
