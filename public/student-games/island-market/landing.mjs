import{MATERIALS,RECIPES}from'./engine.mjs';
import{ingredientArt}from './art.mjs?v=deep-review-20261027';
import{recipeCard,recipeById}from './cards.mjs?v=deep-review-20261027';
const $=s=>document.querySelector(s);
$('#hero-order-main').innerHTML=recipeCard(recipeById.D12);
$('#hero-order-back').innerHTML=recipeCard(recipeById.D11);
$('#hero-material').innerHTML=`<div class="mp-real-material">${ingredientArt('squid')}<b>오징어</b><small>요리의 재료 1장</small></div>`;
$('#ingredient-gallery').innerHTML=MATERIALS.map(m=>`<div class="mp-shelf-material"><div class="mp-real-material">${ingredientArt(m.id)}<b>${m.name}</b><small>재료 카드 20장</small></div></div>`).join('');
$('#featured-recipes').innerHTML=['D01','D04','D11','D12'].map(id=>recipeCard(recipeById[id])).join('');
$('#recipe-gallery').innerHTML=RECIPES.map(r=>recipeCard(r)).join('');
$('#print-preview-card').innerHTML=recipeCard(recipeById.D08);
$('#demo-recipe').innerHTML=recipeCard(recipeById.D01);
$('#demo-ingredient').innerHTML=`${ingredientArt('squid')}<b>오징어</b><small>1장 선택하기</small>`;
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

$('#overview-market').innerHTML=MATERIALS.map(m=>`<div class="mp-real-material">${ingredientArt(m.id)}<b>${m.name}</b><small>재료 카드</small></div>`).join('');
$('#overview-orders').innerHTML=['D01','D04','D08','D11'].map(id=>recipeCard(recipeById[id])).join('');
$('#overview-shops').innerHTML=[['바다 가게','쌀 1, 오징어 1, 명이나물 1'],['초록 가게','쌀 1, 감자 1, 홍합 1'],['노을 가게','쌀 1, 새우 1, 감자 1'],['달빛 가게','쌀 1, 명이나물 1, 홍합 1']].map(([name,stock])=>`<div class="mp-overview-shop"><div><strong>${name}</strong><b>5냥</b></div><p>${stock}</p></div>`).join('');
