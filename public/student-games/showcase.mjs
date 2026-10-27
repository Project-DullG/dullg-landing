import {cardHTML} from './island-snap/art.mjs?v=quality-final-20261027';
import {recipeCard,recipeById} from './island-market/cards.mjs?v=quality-final-20261027';
import {ingredientArt} from './island-market/art.mjs?v=quality-final-20261027';
const snap=document.getElementById('snap-display');
if(snap) snap.innerHTML=['candy','squid','gull'].map(kind=>cardHTML({kind})).join('');
const market=document.getElementById('market-display');
if(market) market.innerHTML=recipeCard(recipeById.D08)+`<div class="market-chips">${[['squid','오징어'],['rice','쌀']].map(([id,name])=>`<div class="material-preview">${ingredientArt(id)}<b>${name}</b></div>`).join('')}</div>`;
