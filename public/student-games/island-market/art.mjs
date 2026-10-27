export const materialNames={squid:'오징어',greens:'명이나물',mussel:'홍합',potato:'감자',shrimp:'새우',rice:'쌀'};
export const materialColors={squid:'#cc6350',greens:'#648267',mussel:'#405a67',potato:'#c59a47',shrimp:'#d77c53',rice:'#9b8c6b'};
export function ingredientArt(id,cls=''){
  const key=id==='greens'?'leaves':id;
  if(!Object.hasOwn(materialNames,id))throw new Error('알 수 없는 재료 그림');
  return `<img class="food-art ${cls}" src="/student-games/shared-art/${key}.webp" width="768" height="768" alt="" style="object-fit:contain">`;
}
export function dishArt(recipe){
  const id=typeof recipe==='string'?recipe:recipe.id;
  if(!/^D(0[1-9]|1[0-2])$/.test(id))throw new Error('알 수 없는 요리 그림');
  return `<img class="dish-art" src="/student-games/shared-art/${id}.webp" width="768" height="768" alt="" style="object-fit:contain">`;
}
export const crest=`<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M13 35Q16 48 30 50Q46 47 49 35Z" fill="currentColor"/><path d="M8 32H52M20 9Q12 20 22 26M32 7Q24 18 34 24M43 12Q36 19 43 25" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M24 52H37" stroke="currentColor" stroke-width="3"/></svg>`;
