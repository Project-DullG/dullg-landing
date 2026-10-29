import marketKit, {MATERIALS, RECIPES, CARD_WIDTH, CARD_HEIGHT, recipeFace, materialFace, reservationFace, coinFace} from './physical-kit.mjs?v=premium-20261029-v1';

const fittedFaces = new Set();
const scaleFace = node => {
  const width = Number(node.dataset.faceWidth);
  if (width > 0 && node.clientWidth > 0) node.style.setProperty('--intro-face-scale', String(node.clientWidth / width));
};
const faceObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => entries.forEach(entry => scaleFace(entry.target))) : null;
function fitFaces(root = document) {
  for (const old of fittedFaces) if (!old.isConnected) { faceObserver?.unobserve(old); fittedFaces.delete(old); }
  for (const node of root.querySelectorAll('.intro-physical-card')) {
    scaleFace(node);
    if (!fittedFaces.has(node)) { fittedFaces.add(node); faceObserver?.observe(node); }
  }
}
window.addEventListener('resize', () => fitFaces());
const escIntro = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function nativeFace(html, width, height, preview = null) {
  // Paper and text can paint immediately while the artwork decodes independently.
  html = html.replace(/<img\b/g, '<img loading="lazy" decoding="async"');
  return `<div class="intro-physical-card" data-face-width="${width}" style="aspect-ratio:${width}/${height}"><div class="intro-face-original" style="width:${width}px;height:${height}px">${html}</div>${preview ? `<button type="button" class="intro-card-open" data-intro-card="${escIntro(preview.id)}" aria-label="${escIntro(preview.label)} 크게 보기" aria-haspopup="dialog" aria-controls="component-preview"><span>크게 보기</span></button>` : ''}</div>`;
}
function setupPreview(render, title) {
  const dialog = document.querySelector('#component-preview');
  let opener = null;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-intro-card]');
    if (!button || !dialog || dialog.open) return;
    opener = button;
    const id = button.dataset.introCard;
    dialog.querySelector('#component-preview-title').textContent = title(id);
    dialog.querySelector('.intro-preview-body').innerHTML = render(id);
    dialog.showModal(); fitFaces(dialog);
    dialog.querySelector('[data-preview-close]').focus({preventScroll:true});
  });
  dialog?.querySelector('[data-preview-close]').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
}

const recipeById=Object.fromEntries(RECIPES.map(recipe=>[recipe.id,recipe]));
const recipeCard=(recipe, preview=false)=>nativeFace(recipeFace(recipe),CARD_WIDTH,CARD_HEIGHT,preview?{id:recipe.id,label:recipe.name+' 주문 카드'}:null);
const materialCard=(material,preview=false)=>nativeFace(materialFace(material),CARD_WIDTH,CARD_HEIGHT,preview?{id:material.id,label:material.name+' 재료 카드'}:null);
const $=s=>document.querySelector(s);
const eagerFace = html => html.replaceAll('loading="lazy"', 'loading="eager" fetchpriority="high"');
$('#hero-order-main').innerHTML=eagerFace(recipeCard(recipeById.D08,true));
$('#hero-material').innerHTML=eagerFace(materialCard(MATERIALS.find(m=>m.id==='squid'),true));
$('#hero-rice').innerHTML=eagerFace(materialCard(MATERIALS.find(m=>m.id==='rice'),true));
$('#hero-coins').innerHTML=[5,1,1].map(value=>{const coin=marketKit.pieces.find(piece=>piece.id===`coin-${value}-1`);return `<div class="pub-payment-coin pub-payment-coin-${value}">${nativeFace(coinFace(value),coin.width,coin.height)}</div>`;}).join('');
const book=marketKit.pieces.find(piece=>piece.id==='rule-cover');
$('#paper-rulebook').innerHTML=nativeFace(book.front,book.width,book.height);
$('#hero-reservation').innerHTML=nativeFace(reservationFace(1),CARD_WIDTH,CARD_HEIGHT,{id:'reservation-1',label:'주문 예약권'});
$('#ingredient-gallery').innerHTML=MATERIALS.map(m=>`<div class="mp-shelf-material">${materialCard(m,true)}<p class="intro-material-count">종류마다 20장</p></div>`).join('');
$('#featured-recipes').innerHTML=['D01','D04','D11','D12'].map(id=>recipeCard(recipeById[id],true)).join('');
$('#recipe-gallery').innerHTML=RECIPES.map(r=>recipeCard(r,true)).join('');
$('#print-preview-card').innerHTML=recipeCard(recipeById.D04);
$('#demo-recipe').innerHTML=recipeCard(recipeById.D01);
$('#demo-ingredient').innerHTML=materialCard(MATERIALS.find(m=>m.id==='squid'));
let selected=false,sold=false;
function renderDemo(){
 $('#demo-ingredient').setAttribute('aria-pressed',String(selected));
 $('#demo-ingredient').disabled=sold;
 $('#demo-ingredient').classList.toggle('is-paid',sold);
 $('#demo-recipe').classList.toggle('is-ready',selected&&!sold);
 $('#demo-recipe').classList.toggle('is-sold',sold);
 $('#demo-cash').textContent=sold?'9':'5';
 $('#demo-stock').textContent=sold?'오징어 0장, 재료 지불 완료':'오징어 1장 보유';
 $('#demo-sell').disabled=!selected||sold;
 $('#demo-sell').textContent=sold?'판매 완료':selected?'오징어볶음 팔고 4냥 받기':'오징어를 먼저 고르세요';
 $('#demo-reset').hidden=!sold;
 $('#demo-status').textContent=sold?'5냥 + 판매 대금 4냥 = 9냥. 이번 주행동이 끝났습니다.':selected?'재료가 준비됐습니다. 주문을 판매해보세요.':'먼저, 내 오징어 카드를 눌러보세요.';
}
$('#demo-ingredient').addEventListener('click',()=>{if(!sold){selected=!selected;renderDemo();}});
$('#demo-sell').addEventListener('click',()=>{if(selected&&!sold){sold=true;renderDemo();$('#demo-reset').focus({preventScroll:true});}});
$('#demo-reset').addEventListener('click',()=>{selected=false;sold=false;renderDemo();$('#demo-ingredient').focus({preventScroll:true});});
renderDemo();

setupPreview(id => id==='reservation-1' ? nativeFace(reservationFace(1),CARD_WIDTH,CARD_HEIGHT) : recipeById[id] ? recipeCard(recipeById[id]) : materialCard(MATERIALS.find(m=>m.id===id)), id => id==='reservation-1' ? '주문 예약권' : recipeById[id]?.name || MATERIALS.find(m=>m.id===id)?.name || '카드');
fitFaces();
