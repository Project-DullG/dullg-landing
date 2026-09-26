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
    const explanation=choice===0?'피로 1장을 반납했습니다. 다음 이동에는 주사위 2개를 굴려, 더 먼 목적지를 노릴 수 있습니다.':'체험이 2장으로 늘어 1점을 얻었습니다. 대신 피로가 3장이 되어, 이 상태로 끝나면 피로로 6점이 깎입니다.';
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
  import('./product-components.mjs?v=20260923j').then(m=>m.showComponents()).catch(()=>{
   document.querySelectorAll('[data-component-model]').forEach(host=>{host.textContent='눌러서 구성품 자세히 보기 ↗';});
  });
 },{rootMargin:'500px'});if(gallery)observer.observe(gallery);
}

// Inspect a component without losing the visitor's place in the product story.
if(typeof document!=='undefined'){
 const dialog=document.createElement('dialog');dialog.className='product-inspection';
 dialog.setAttribute('aria-labelledby','inspection-title');
 dialog.innerHTML='<header><h2 id="inspection-title">구성품 살펴보기</h2><button type="button" class="inspection-close" aria-label="구성품 닫기">닫기 ×</button></header><iframe title="구성품 자세히 보기"></iframe>';
 document.body.append(dialog);
 const frame=dialog.querySelector('iframe');let originLink=null;
 const close=()=>{if(dialog.open)dialog.close();};
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  const url=new URL(link.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('/ulleung-marble/tabletop/components.html'))return;
  event.preventDefault();originLink=link;url.searchParams.set('embedded','1');frame.src=url.href;dialog.showModal();document.body.classList.add('inspection-open');dialog.querySelector('button').focus();
 });
 dialog.querySelector('button').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('inspection-open');frame.removeAttribute('src');originLink?.focus({preventScroll:true});});
 window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='ulleung-close-inspection')close();});
}
