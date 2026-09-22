import {Game} from './engine.mjs';
import {TRAVELER_COVERS} from './traveler-cover.mjs';

// The example runs the real rules in memory; it never accesses the saved game.
export function makeChoiceExample(data){
  const game=new Game(data,null,()=>.5);
  game.start(data.characters.slice(0,4).map((c,i)=>({character:c.id,meeple:i,arrival:'cruise'})));
  game.s.round=3;game.s.stage='choose';game.p.node='seongin';game.p.budget=12;
  game.take(game.p,'fatigue',2);game.take(game.p,'activity',1);
  game.s.encounter='blue-07';game.s.decks.blue=game.s.decks.blue.filter(id=>id!=='blue-07');
  return game;
}
async function init(){
  const response=await fetch('/ulleung-marble/tabletop/v07/data.json');if(!response.ok)throw Error('Game content could not be loaded');
  const data=await response.json(),stats=document.querySelector('#example-stats'),result=document.querySelector('#example-result');
  const choices=[...document.querySelectorAll('[data-choice]')];
  function renderStats(p){stats.innerHTML=[['남은 예산',p.budget,'만원'],['피로',p.cards.fatigue.length,'장'],['체험',p.cards.activity.length,'장']].map(([label,value,unit])=>`<span>${label}<strong>${value}<small>${unit}</small></strong></span>`).join('');}
  function reset(){renderStats(makeChoiceExample(data).p);choices.forEach(b=>b.setAttribute('aria-pressed','false'));result.innerHTML='<b>어느 쪽을 고르시겠어요?</b><p>쉬면 다음 이동을 준비하고, 걸으면 체험 한 장을 더 모읍니다.</p>';}
  choices.forEach(button=>button.addEventListener('click',()=>{
    const game=makeChoiceExample(data),choice=Number(button.dataset.choice);game.choose(choice);renderStats(game.p);
    choices.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const explanation=choice===0?'피로가 2장에서 1장으로 줄어, 현재 피로 기준 감점이 −3점에서 −1점으로 줄었습니다. 다음 이동에는 주사위 2개를 굴립니다.':'체험이 2장이 되어 여행기록 1점이 생겼습니다. 피로는 3장으로 늘어, 현재 피로 기준 감점도 −3점에서 −6점으로 커졌습니다.';
    result.innerHTML=`<b>${choice===0?'A':'B'} · ${game.entry.options[choice].outcome}</b><p>${explanation}</p>`;
  }));document.querySelector('#reset-example').addEventListener('click',reset);reset();
  const tabs=document.querySelector('#traveler-tabs'),preview=document.querySelector('#traveler-preview');
  data.characters.forEach(c=>{const button=document.createElement('button');button.textContent=c.name;button.setAttribute('aria-pressed',String(c.id===0));button.addEventListener('click',()=>{for(const item of tabs.children)item.setAttribute('aria-pressed',String(item===button));preview.querySelector('img').src=`/ulleung-marble/assets/v07/book-cover-${c.id}.svg`;preview.querySelector('img').alt=`${c.name} 여행자북 표지`;preview.querySelector('.traveler-caption').innerHTML=`<span>여행자 ${String(c.id+1).padStart(2,'0')}</span><h3>${c.name}</h3><p>${TRAVELER_COVERS[c.id].heading}</p>`;});tabs.append(button);});
}
if(typeof document!=='undefined'){
  const video=document.querySelector('#intro-film');
  document.querySelectorAll('[data-seek]').forEach(button=>button.addEventListener('click',async()=>{
    try{
      if(video.readyState<1)await new Promise((resolve,reject)=>{
        const clear=()=>{video.removeEventListener('loadedmetadata',loaded);video.removeEventListener('error',failed);};
        const loaded=()=>{clear();resolve();},failed=()=>{clear();reject(Error('Video unavailable'));};
        video.addEventListener('loadedmetadata',loaded);video.addEventListener('error',failed);video.load();
      });
      // Some native players reset an unloaded video's time when playback starts.
      await video.play();video.currentTime=Number(button.dataset.seek);video.scrollIntoView({block:'start',behavior:'smooth'});
    }catch{video.focus();}
  }));
  init().catch(()=>{document.querySelector('#example-result').textContent='카드 내용을 불러오지 못했습니다. 페이지를 새로고침해주세요.';document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);});
}

if(typeof document!=='undefined'){
 const gallery=document.querySelector('#inside');
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();
  import('./product-components.mjs?v=3').then(m=>m.showComponents()).catch(()=>{
   document.querySelectorAll('[data-component-model]').forEach(host=>{host.textContent='눌러서 구성품 자세히 보기 ↗';});
  });
 },{rootMargin:'500px'});if(gallery)observer.observe(gallery);
}
