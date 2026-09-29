import {Game, effectText} from './engine.mjs';

// A self-contained sample turn. It never reads or writes a saved game.
export const DEMO_STOPS = [
 {id:'nari',card:'green-05',label:'분지에서 한 끼',hint:'1칸 · 내 코스의 목적지'},
 {id:'seongin',card:'blue-07',label:'산길에서 잠깐 휴식',hint:'2칸 · 내 코스의 목적지'},
 {id:'gwanum',card:'green-01',label:'북쪽 바다를 보러',hint:'3칸 · 풍경과 체험'}
];
export function createJourneyDemo(data){
 const game=new Game(data,null,()=>.4);
 game.start([2,0,1,3].map((character,meeple)=>({character,meeple,arrival:'cruise'})));
 game.s.round=3;game.p.node='cheonbu';game.p.first=false;game.p.direction=1;
 game.p.visited=['sadong','cheonbu'];game.p.lapRegions=['orange','green'];game.p.progress=2;
 game.p.budget=12;game.take(game.p,'fatigue',2);game.take(game.p,'activity',1);
 return game;
}
export function arriveInDemo(game,node){
 const stop=DEMO_STOPS.find(s=>s.id===node);if(!stop)throw Error('체험 목적지를 골라주세요.');
 game.move(node);
 const region=game.nodes[node].region;
 game.s.decks[region]=game.s.decks[region].filter(id=>id!==stop.card);
 game.s.decks[region].push(stop.card);game.draw();game.listen();
 return stop;
}
export function foodCompetition(data,extra=0){
 if(!Number.isInteger(extra)||extra<0||extra>2)throw Error('미식 비교는 0~2장입니다.');
 const game=new Game(data,null,()=>.4);
 game.start([0,1,2,3].map((character,meeple)=>({character,meeple,arrival:'cruise'})));
 [5+extra,6,2,1].forEach((n,i)=>game.take(game.s.players[i],'food',n));
 const scores=game.scores();
 return [0,1].map(i=>({cards:game.s.players[i].cards.food.length,points:scores[i].detail.leaders}));
}
export function demoRoutePoints(data,path){
 let from='cheonbu',points=[];
 for(const to of path){const edge=data.geography.edges.find(e=>e.from===from&&e.to===to||e.to===from&&e.from===to);if(!edge)throw Error('연결되지 않은 여행 경로');points.push(...(edge.from===from?edge.points:[...edge.points].reverse()));from=to;}
 return points;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountJourneyDemo(data){
 const host=document.querySelector('#journey-demo');if(!host)return;
 let game=createJourneyDemo(data),phase='ready',stop=null,choice=null;
 const nodes=Object.fromEntries(data.nodes.map(n=>[n.id,n]));
 const routeText=()=>['천부',...(game.s.lastPath||[]).map(id=>nodes[id].name)].join(' → ');
 function map(){
  const path=demoRoutePoints(data,game.s.lastPath||[]).map(p=>p.join(',')).join(' ');
  return `<div class="demo-map"><svg viewBox="420 72 570 540" role="img" aria-label="천부에서 나리분지와 성인봉, 해안을 따라 관음도로 이어지는 실제 게임판"><image href="/ulleung-marble/assets/v07/board-map.svg?v=20260929e" width="1400" height="1050"/>${stop?`<polyline points="${path}" fill="none" stroke="#ffbb53" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`:''}${['cheonbu',...DEMO_STOPS.map(s=>s.id)].map(id=>`<circle cx="${nodes[id].x}" cy="${nodes[id].y}" r="35" fill="none" stroke="${game.p.node===id?'#fdb854':'#fff'}" stroke-width="${game.p.node===id?7:3}"/>`).join('')}<g transform="translate(${nodes[game.p.node].x} ${nodes[game.p.node].y-32})"><path d="M-13 0V-28L0-43L13-28V0Z" fill="#f3af43" stroke="#254d57" stroke-width="3"/><circle cy="-25" r="4" fill="#fff8e5"/></g></svg><span class="demo-location">${stop?'도착':'현재 위치'} · ${nodes[game.p.node].name}</span></div>`;
 }
 function render(){
  const p=game.p,stage=phase==='ready'?0:phase==='move'?1:phase==='choose'?2:3;
  const course=data.routes.find(r=>r.id===p.course),count=course.nodes.filter(n=>p.visited.includes(n)).length;
  const stats=[['예산',p.budget,'만원'],['피로',p.cards.fatigue.length,'장'],['풍경',p.cards.scenery.length,'장'],['체험',p.cards.activity.length,'장'],['미식',p.cards.food.length,'장']];
  let panel='';
  if(phase==='ready')panel=`<p class="demo-kicker">김수진의 세 번째 차례</p><h3>천부까지 왔어요.<br>이번에는 어디로 갈까요?</h3><p>내 코스는 <b>성인봉·나리분지·저동항</b>.<br>피로도 줄여야 하니, 갈 곳을 잘 골라야겠죠.</p><button class="button dark demo-roll" data-demo="roll"><svg class="demo-die" aria-hidden="true" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="6" fill="#fff8e6"/><g fill="#176275"><circle cx="9" cy="9" r="2.5"/><circle cx="16" cy="16" r="2.5"/><circle cx="23" cy="23" r="2.5"/></g></svg> 주사위 굴려보기</button><p class="demo-footnote">설정 없이 해보는 한 차례 체험입니다.<br>길을 비교할 수 있도록 주사위는 3이 나옵니다.</p>`;
  if(phase==='move')panel=`<p class="demo-kicker">주사위 3 · 세 칸 안에서 이동</p><h3>끝까지 가도,<br>한 칸만 가도 좋아요.</h3><p>이번 체험에서 고를 수 있는 목적지 세 곳입니다.</p><div class="demo-destinations">${DEMO_STOPS.map(s=>`<button data-destination="${s.id}"><span><b>${nodes[s.id].name}</b><small>${s.label}</small></span><em>${s.hint}</em><i aria-hidden="true">→</i></button>`).join('')}</div>`;
  if(phase==='choose')panel=`<p class="demo-kicker">${nodes[p.node].name}에서 만난 카드</p><h3>${esc(game.encounter.title)}</h3><p>${esc(game.entry.scenario)}</p><div class="demo-options">${game.entry.options.map((o,i)=>`<button data-demo-choice="${i}"><span class="choice-letter">${i?'B':'A'}</span><span><b>${esc(o.label)}</b><small>${esc(effectText(o.effect))}</small></span></button>`).join('')}</div><p class="demo-footnote">체험에서는 이 카드를 만납니다. 실제 게임에서는 도착한 권역의 카드를 섞어 뽑아요.</p>`;
  if(phase==='result'){
   const effect=game.s.applied,o=game.entry.options[choice];
   const detail=effect.bonus==='die'?'다리를 쉬었으니 다음 이동에는 주사위 두 개. 더 멀리 갈 기회를 준비했어요.':effect.food?'음식을 맛본 만큼 미식 기록이 늘었어요. 이제 다른 사람의 미식 카드도 눈에 들어오겠죠.':effect.fatigue>0?'체험은 늘었지만 피로도 쌓였어요. 다음 여행에서는 쉴 기회를 찾는 편이 좋겠어요.':effect.scenery?'풍경 한 장을 남겼어요. 많이 걷는 것만이 여행의 전부는 아니니까요.':'주변을 걸으며 체험을 모았어요. 두 장마다 1점이고, 가장 많이 모으면 달인 점수도 노릴 수 있어요.';
   panel=`<p class="demo-kicker">선택한 뒤 달라진 여행</p><h3>${esc(o.outcome)}</h3><div class="demo-receipt">${esc(effectText(effect))}</div><p>${detail}</p>${count?`<p class="demo-course">나의 코스 <b>${count}/3곳</b> 도착 · 현재 코스 점수 <b>${[0,2,4,8][count]}점</b></p>`:''}<div class="demo-next"><button class="button dark" data-demo="reset">다른 길도 가보기 ↺</button><a class="text-link" href="#rivals">친구와 경쟁하면? ↓</a></div>`;
  }
  host.innerHTML=`<div class="demo-topline"><span>한 차례 미리 해보기</span><ol aria-label="체험 진행 단계">${['주사위','목적지','카드 선택','여행 결과'].map((s,i)=>`<li${stage===i?' aria-current="step"':''} class="${i<stage?'done':''}"><b>${i+1}</b>${s}</li>`).join('')}</ol></div><div class="demo-body"><div class="demo-board-area">${map()}<p class="demo-route">${stop?routeText():'해안으로 갈까요, 산길로 들어갈까요?'}</p><div class="demo-stats" aria-label="현재 여행 기록">${stats.map(([l,v,u])=>`<div><small>${l}</small><b>${v}<em>${u}</em></b></div>`).join('')}</div></div><div class="demo-panel" tabindex="-1" aria-live="polite" aria-atomic="true">${panel}</div></div>`;
 }
 host.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!host.contains(button))return;
  if(button.dataset.demo==='roll'){game.roll();phase='move';}
  else if(button.dataset.destination){stop=arriveInDemo(game,button.dataset.destination);phase='choose';}
  else if(button.dataset.demoChoice!==undefined){choice=Number(button.dataset.demoChoice);game.choose(choice);phase='result';}
  else if(button.dataset.demo==='reset'){game=createJourneyDemo(data);phase='ready';stop=null;choice=null;}
  else return;
  render();host.querySelector('.demo-panel').focus({preventScroll:true});
 });render();
}
export function mountFoodCompetition(data){
 const host=document.querySelector('#food-competition');if(!host)return;
 let extra=0;
 const render=()=>{
  const [me,friend]=foodCompetition(data,extra);
  host.innerHTML=`<div class="rival-score"><div><span>나</span><strong>${me.cards}<small>장</small></strong><div class="food-marks" aria-hidden="true">${'<i></i>'.repeat(me.cards)}</div><b>달인 +${me.points}점</b></div><span class="rival-vs">vs</span><div><span>친구</span><strong>${friend.cards}<small>장</small></strong><div class="food-marks" aria-hidden="true">${'<i></i>'.repeat(friend.cards)}</div><b>달인 +${friend.points}점</b></div></div><p class="rival-result" aria-live="polite">${extra===0?'한 장 차이로 친구가 미식 달인 8점을 앞두고 있어요.':extra===1?'6장으로 동률! 지금 끝나면 두 사람 모두 공동 달인 4점이에요.':'7장으로 역전! 지금 끝나면 나만 미식 달인 8점을 받아요.'}</p><button class="rival-add" data-food="${extra===2?'reset':'add'}">${extra===2?'처음 수량으로 다시 비교 ↺':'내 미식 카드 한 장 더하기 +'}</button><small class="rival-note">지금 게임이 끝난다고 가정한 예시 · 다른 두 사람은 2장·1장 보유</small>`;
 };host.addEventListener('click',event=>{const b=event.target.closest('[data-food]');if(!b)return;extra=b.dataset.food==='reset'?0:extra+1;render();host.querySelector('button').focus({preventScroll:true});});render();
}
