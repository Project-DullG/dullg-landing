import {Game} from './engine.mjs';
import {TRAVELER_COVERS} from './traveler-cover.mjs';
import {characterCourse} from './character-courses.mjs';
import {mountJourneyDemo,mountFoodCompetition} from './product-demo.mjs?v=20260929a';

// The example runs the real rules in memory; it never accesses the saved game.
export function makeChoiceExample(data){
  const game=new Game(data,null,()=>.5);
  game.start(data.characters.slice(0,4).map((c,i)=>({character:c.id,meeple:i,arrival:'cruise'})));
  game.s.round=3;game.s.stage='choose';game.p.node='seongin';game.p.budget=12;
  game.take(game.p,'fatigue',2);game.take(game.p,'activity',1);
  game.s.encounter='blue-07';game.s.decks.blue=game.s.decks.blue.filter(id=>id!=='blue-07');
  return game;
}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function init(){
 const response=await fetch('/ulleung-marble/tabletop/v07/data.json');if(!response.ok)throw Error('Game content could not be loaded');
 const data=await response.json();mountJourneyDemo(data);mountFoodCompetition(data);
 const tabs=document.querySelector('#traveler-tabs'),preview=document.querySelector('#traveler-preview');
 const styles=['내 코스 완주','일주와 귀항','여유 있는 산행','맛집과 여행비','풍경 수집','산길과 체험','알뜰한 여행','해안 일주'];
 function showTraveler(c){
  const cover=TRAVELER_COVERS[c.id],course=characterCourse(data,c),e=escapeHTML;
  for(const button of tabs.children)button.setAttribute('aria-pressed',String(Number(button.dataset.traveler)===c.id));
  preview.innerHTML=`<div class="traveler-book"><img src="/ulleung-marble/assets/v07/book-cover-${c.id}.svg" alt="${e(c.name)} 여행자북 표지" loading="lazy"><span>여행자북 · B6 8쪽</span></div><div class="traveler-story"><p class="eyebrow">${e(c.name)} · ${e(c.age)}세 · ${e(c.job)}</p><h3>${e(cover.heading)}</h3><blockquote>${e(cover.intro)}</blockquote><div class="traveler-goals"><h4>이번 여행에서 이루고 싶은 것</h4>${c.goals.map(g=>`<p><span>+3점</span>${e(g.text)}</p>`).join('')}</div><div class="traveler-course"><h4>나의 여행 코스 <small>세 곳 모두 도착하면 8점</small></h4><div>${course.stops.map(s=>`<a href="/ulleung-marble/tabletop/components.html#board&course=${course.route.id}">${e(s.node.name)} ↗</a>`).join('')}</div><p>방문 순서는 자유입니다. 목표를 보고 길을 골라보세요.</p></div><a class="text-link" href="/ulleung-marble/tabletop/components.html#sheets&character=${c.id}">${e(c.name)}의 여행자북 펼치기 →</a></div>`;
 }
 data.characters.forEach(c=>{
  const button=document.createElement('button');button.dataset.traveler=c.id;
  button.innerHTML=`<img src="/ulleung-marble/assets/v07/portraits/traveler-${c.id}.jpg" alt="" loading="lazy"><span><b>${escapeHTML(c.name)}</b><small>${styles[c.id]}</small></span>`;
  button.setAttribute('aria-pressed',String(c.id===0));button.addEventListener('click',()=>showTraveler(c));tabs.append(button);
 });showTraveler(data.characters[0]);
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
      await video.play();video.currentTime=Number(button.dataset.seek);video.scrollIntoView({block:'start',behavior:'auto'});
    }catch{video.focus();}
  }));
  init().catch(()=>{document.querySelector('#journey-demo').innerHTML='<p class="demo-loading">체험을 불러오지 못했습니다. 새로고침하거나 <a href="/ulleung-marble/tabletop/components.html#cards">실제 카드를 살펴보세요.</a></p>';});
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
