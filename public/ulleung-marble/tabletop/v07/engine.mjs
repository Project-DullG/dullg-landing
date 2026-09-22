export const TAXI_COST=1;
export const TYPES=['scenery','activity','food','fatigue','lap'];
export const LABELS={scenery:'풍경',activity:'체험',food:'미식',fatigue:'피로',lap:'일주'};
export const LEADER_POINTS={scenery:3,activity:5,food:8};
export const TIED_LEADER_POINTS={scenery:2,activity:3,food:4};
export function optionCondition(data,o){
 const parts=[];
 if(o.requiredNodes?.length)parts.push(o.requiredNodes.map(id=>data.nodes.find(n=>n.id===id).name).join('·')+'에서만');
 if(o.requiredNodes?.length&&o.effect.cost)parts.push('예산 '+o.effect.cost+'만원 이상');
 if(o.maxFatigue<4)parts.push('피로 '+o.maxFatigue+'장 이하');
 return parts.join(' · ');
}
export function rng(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=Math.imul(n^n>>>15,1|n);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export function shuffle(items,r=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export class Game{
 constructor(data,state=null,random=Math.random){this.data=data;this.s=state;this.random=random;this.nodes=Object.fromEntries(data.nodes.map(n=>[n.id,n]));}
 get p(){return this.s.players[this.s.turn];}
 need(stage){if(![].concat(stage).includes(this.s.stage))throw Error('지금은 이 동작을 할 수 없습니다.');}
 start(config){
  if(config.length<4||config.length>8)throw Error('4~8명을 선택하세요.');
 for(const key of ['character','meeple','course'])if(new Set(config.map(p=>p[key])).size!==config.length)throw Error('여행자와 미플, 코스는 서로 다르게 골라야 합니다.');
  for(const c of config)if(!this.data.characters[c.character]||c.meeple<0||c.meeple>7||!this.data.routes.some(r=>r.id===c.course)||!['cruise','fast'].includes(c.arrival))throw Error('여행 준비 정보를 확인하세요.');
  this.s={version:11,stage:'mode',round:1,turn:0,players:config.map((c,i)=>({...c,id:i,budget:50,node:c.arrival==='cruise'?'sadong':'dodong',start:c.arrival==='cruise'?'sadong':'dodong',direction:0,progress:0,lapRegions:[],lapsCompleted:0,first:true,visited:[],cards:Object.fromEntries(TYPES.map(t=>[t,[]])),pending:null,ended:false})),decks:{},discards:{},supplies:{},dice:[],steps:0,taxi:false,encounter:null,selection:null,notice:'',log:[],awards:null};
  for(const r of this.data.regions){this.s.decks[r.id]=shuffle(this.data.encounters.filter(c=>c.region===r.id).map(c=>c.id),this.random);this.s.discards[r.id]=[];}
  for(const t of TYPES)this.s.supplies[t]=shuffle(Array.from({length:this.data.stock[t]},(_,i)=>`${t}-${String(i%this.data.information[t].length+1).padStart(2,'0')}@${i}`),this.random);
  for(const p of this.s.players)if(p.arrival==='fast')this.take(p,'fatigue',1);
  this.log('여행을 시작했습니다.');return this.s;
 }
 log(text){this.s.notice=text;this.s.log.unshift({round:this.s.round,player:this.s.turn,text});this.s.log=this.s.log.slice(0,200);}
 take(p,type,n){if(this.s.supplies[type].length<n)throw Error(`${LABELS[type]} 공급 카드가 부족합니다.`);for(let i=0;i<n;i++)p.cards[type].push(this.s.supplies[type].pop());}
 recover(p,n=1){for(let i=0;i<n&&p.cards.fatigue.length;i++)this.s.supplies.fatigue.push(p.cards.fatigue.pop());}
 throwDice(n=1){return Array.from({length:n},()=>1+Math.floor(this.random()*6));}
 setDirection(d){this.need('mode');if(this.p.progress!==0||![-1,1].includes(d))throw Error('일주를 시작할 때 방향을 정합니다.');this.p.direction=d;}
 roll(taxi=false){
  this.need('mode');const p=this.p;
  if(!p.direction)p.direction=1;
  if(taxi&&(p.budget<TAXI_COST||!this.data.loop.includes(p.node)))throw Error('택시는 해안루프에서 예산 1만원이 있어야 이용할 수 있습니다.');
  const n=taxi||(p.first&&p.arrival==='fast')||p.pending?.kind==='die'?2:1;
  this.s.dice=this.throwDice(n);this.s.steps=this.s.dice.reduce((a,b)=>a+b,0);this.s.taxi=taxi;
  if(n===1&&p.pending?.kind==='step')this.s.steps=Math.min(6,this.s.steps+1);
  if(p.pending){this.discardId(p.pending.card);p.pending=null;}
  if(taxi)p.budget-=TAXI_COST;
  p.first=false;this.s.stage='move';this.log(`${taxi?'택시로 ':''}${this.s.steps}칸 안에서 이동합니다.`);return this.s.dice;
 }
 paths(){
  if(!['move','bonusmove'].includes(this.s.stage))return[];
  const p=this.p,loop=this.data.loop,all=[];const limit=this.s.steps,taxi=this.s.taxi;
  const walk=(at,path)=>{
   if(path.length){
    const lapRegions=[...new Set([...p.lapRegions,this.nodes[at].region])];
    const lap=p.lapsCompleted===0&&this.data.regions.every(r=>lapRegions.includes(r.id))&&this.data.ports.includes(at);
    all.push({node:at,path:[...path],progress:lapRegions.length,lap,lapRegions});
    if(path.length===limit)return;
   }
   const index=loop.indexOf(at);let adjacent=[];
   if(index>=0)adjacent.push(loop[(index+(p.direction||1)+loop.length)%loop.length]);
   if(!taxi)for(const[a,b]of this.data.branches){if(a===at)adjacent.push(b);if(b===at)adjacent.push(a);}
   for(const to of adjacent){
    if(path.includes(to)||to===p.node)continue;
    walk(to,[...path,to]);
   }
  };
  walk(p.node,[]);return all;
 }
 move(to){
  this.need(['move','bonusmove']);const route=this.paths().filter(r=>r.node===to).sort((a,b)=>a.path.length-b.path.length)[0];if(!route)throw Error('이번 주사위로 갈 수 없는 장소입니다.');
  const p=this.p,extra=this.s.stage==='bonusmove';p.node=to;p.progress=route.progress;p.lapRegions=route.lapRegions;
  if(!p.visited.includes(to))p.visited.push(to);
  const lapAvailable=this.s.supplies.lap.length>0;
  if(route.lap){if(lapAvailable)this.take(p,'lap',1);p.lapsCompleted=1;}
  this.s.lastPath=route.path;this.s.stage=extra?'result':'draw';
  this.log(`${this.nodes[to].name} 도착${route.lap?lapAvailable?' · 일주 카드 +1장 획득 (7점)':' · 일주 완료 · 일주 카드 4장 소진으로 추가 지급 없음':''}${extra?' · 추가 조우 없이 차례를 마칩니다.':''}`);
  return route;
 }
 get encounter(){return this.data.encounters.find(c=>c.id===this.s.encounter);}
 get entry(){return this.encounter?.entries.find(e=>(e.applies||[e.node]).includes(this.p.node));}
 effective(e){
  const out={...e};
  if(out.fatigue<0&&!this.p.cards.fatigue.length){delete out.fatigue;out.activity=(out.activity||0)+1;}
  if(out.bonus&&this.s.round===7){delete out.bonus;out.activity=(out.activity||0)+1;}
  return out;
 }
 optionAllowed(option){
  const p=this.p;if(option.requiredNodes&&!option.requiredNodes.includes(p.node))return false;if(p.cards.fatigue.length>option.maxFatigue)return false;
  const outcomes=option.effect.roll?Object.values(option.effect.roll):[option.effect];
  return outcomes.every(e=>{e=this.effective(e);return (e.cost||0)<=p.budget&&p.cards.fatigue.length+(e.fatigue>0?e.fatigue:0)<=4&&TYPES.every(t=>!(e[t]>0)||this.s.supplies[t].length>=e[t]);});
 }
 discardId(id){const c=this.data.encounters.find(c=>c.id===id);if(c&&!this.s.discards[c.region].includes(id))this.s.discards[c.region].push(id);}
 draw(){
  this.need('draw');const region=this.nodes[this.p.node].region;
  for(let i=0;i<10;i++){
   if(!this.s.decks[region].length){this.s.decks[region]=shuffle(this.s.discards[region],this.random);this.s.discards[region]=[];}
   if(!this.s.decks[region].length)break;
   this.s.encounter=this.s.decks[region].pop();
   if(this.entry.options.some(o=>this.optionAllowed(o))){this.s.stage='guide';this.log('오른쪽 플레이어가 상황과 A/B의 비용·효과를 모두 읽습니다.');return;}
   this.discardId(this.s.encounter);this.s.encounter=null;
  }
  this.s.stage='fallback';this.log('선택 가능한 조우가 없습니다. 쉬거나 남은 여행기록 한 장을 받습니다.');
 }
 fallback(type){
  this.need('fallback');if(type==='rest'&&this.p.cards.fatigue.length)this.recover(this.p);else if(['scenery','activity','food'].includes(type)&&this.s.supplies[type].length)this.take(this.p,type,1);else if(type==='pass'&&!this.p.cards.fatigue.length&&!['scenery','activity','food'].some(t=>this.s.supplies[t].length)){}else throw Error('남은 카드 또는 휴식을 선택하세요.');this.s.stage='result';this.log('공통 대체 행동을 마쳤습니다.');
 }
 listen(){this.need('guide');this.s.stage='choose';}
 choose(index){
  this.need('choose');const o=this.entry.options[index];if(!o||!this.optionAllowed(o))throw Error('현재 예산·피로·공급 수량으로 고를 수 없습니다.');
  let e=o.effect;this.s.effectDie=null;if(e.roll){this.s.effectDie=this.throwDice()[0];e=e.roll[Math.ceil(this.s.effectDie/2)];}
  e=this.effective(e);const p=this.p;p.budget-=e.cost||0;
  for(const t of TYPES)if(e[t]>0)this.take(p,t,e[t]);
  if(e.fatigue<0)this.recover(p,-e.fatigue);
  this.s.selection=index;this.s.applied=e;
  if(e.bonus)p.pending={kind:e.bonus,card:this.s.encounter};
  if(e.immediate){this.s.dice=this.throwDice();this.s.steps=this.s.dice[0];this.s.taxi=true;this.s.afterCard='bonusmove';if(!p.direction)p.direction=1;}
  else this.s.afterCard='result';
  this.s.stage='resolve';this.log(`${index?'B':'A'}를 골랐습니다. 카드에 인쇄된 결과를 확인합니다.`);return e;
 }
 putCard(){this.need('resolve');if(!this.p.pending)this.discardId(this.s.encounter);this.s.encounter=null;this.s.stage=this.s.afterCard;this.log(this.s.stage==='bonusmove'?'추가 주사위만큼 해안루프를 이동합니다.':'카드와 예산을 적용했습니다. 차례를 마칩니다.');}
 endTurn(){
  this.need('result');this.s.encounter=null;this.s.selection=null;this.s.applied=null;
  this.s.turn++;
  if(this.s.turn===this.s.players.length){this.s.turn=0;this.s.round++;}
  if(this.s.round>7){this.finish();return;}
  this.s.stage='mode';this.s.dice=[];this.s.steps=0;this.log(`${this.data.characters[this.p.character].name}의 차례입니다.`);
 }
 goal(p,g){
  const c=this.data.routes.find(r=>r.id===p.course);
  if(g.type==='regions')return new Set(p.visited.map(n=>this.nodes[n].region)).size>=g.amount;
  if(g.type==='course')return c.nodes.every(n=>p.visited.includes(n));
  if(g.type==='laps')return p.cards.lap.length>=g.amount;
  if(g.type==='port')return this.data.ports.includes(p.node);
  if(g.type==='fatigue')return p.cards.fatigue.length<=g.amount;
  if(g.type==='budget')return p.budget>=g.amount;
  return p.cards[g.type].length>=g.amount;
 }
 scores(){
  const ps=this.s.players,leaders={};
  for(const t of ['scenery','activity','food']){const max=Math.max(...ps.map(p=>p.cards[t].length));leaders[t]=max>0?ps.filter(p=>p.cards[t].length===max).map(p=>p.id):[];}
  return ps.map(p=>{
   const ch=this.data.characters[p.character],course=this.data.routes.find(c=>c.id===p.course),count=course.nodes.filter(n=>p.visited.includes(n)).length;
   const detail={records:p.cards.scenery.length+Math.floor(p.cards.activity.length/2)+Math.floor(p.cards.food.length/3),goals:ch.goals.filter(g=>this.goal(p,g)).length*3,course:[0,2,4,8][count],leaders:Object.entries(leaders).reduce((n,[type,list])=>n+(list.includes(p.id)?list.length===1?LEADER_POINTS[type]:TIED_LEADER_POINTS[type]:0),0),lap:p.cards.lap.length*7,budget:Math.floor(p.budget/5),fatigue:-[0,1,3,6,10][p.cards.fatigue.length],port:this.data.ports.includes(p.node)?3:0};
   return {id:p.id,name:ch.name,detail,total:Object.values(detail).reduce((a,b)=>a+b,0),leaderTypes:Object.keys(leaders).filter(t=>leaders[t].includes(p.id)&&leaders[t].length===1),lapAward:false};
  });
 }
 finish(){this.s.stage='end';this.s.round=Math.min(this.s.round,7);this.s.awards=this.scores();this.log('모든 여행자의 여행을 마쳤습니다.');}
}
export function effectText(e){
 if(e.roll)return Object.entries(e.roll).map(([n,v])=>`${Number(n)*2-1}–${Number(n)*2}: ${effectText(v)}`).join(' / ');
 return [e.cost?`예산 ${e.cost}만원 지출`:'',e.scenery?`풍경 +${e.scenery}장 획득`:'',e.activity?`체험 +${e.activity}장 획득`:'',e.food?`미식 +${e.food}장 획득`:'',e.fatigue?`피로 ${e.fatigue>0?'+':'−'}${Math.abs(e.fatigue)}장 ${e.fatigue>0?'추가':'반납'}`:'',e.bonus==='step'?'다음 일반 이동 +1 (최대 6)':'',e.bonus==='die'?'다음 이동 주사위 2개':'',e.immediate?'지금 주사위 1개로 추가 이동':'',e.dokdo?'독도 왕복 후 같은 항구로 귀항':''].filter(Boolean).join(' · ');
}

export function restoreState(data,s){
 if(validState(data,s))return s;
 if(!s||![8,9,10].includes(s.version))return null;
 const restored=JSON.parse(JSON.stringify(s));
 restored.version=11;
 if([8,9].includes(s.version)){
  for(const p of restored.players||[]){
   p.lapRegions=[...new Set((p.visited||[]).map(id=>data.nodes.find(n=>n.id===id)?.region).filter(Boolean))];
   p.progress=p.lapRegions.length;p.lapsCompleted=p.lapsCompleted??p.cards?.lap?.length??0;delete p.coastEdges;
  }
 }
 const resumeBudgetEnd=s.stage==='end'&&s.players?.every(p=>p.ended&&p.budget===0)&&(s.round<7||s.turn<s.players.length-1);
 for(const p of restored.players||[])p.ended=false;
 const oldStock={...data,stock:{...data.stock,lap:24}};
 if(!validState(data,restored)&&!validState(oldStock,restored))return null;
 const earned=restored.players.reduce((sum,p)=>sum+p.cards.lap.length,0);
 if(earned>data.stock.lap)return null;
 restored.supplies.lap=earned===data.stock.lap?[]:restored.supplies.lap.slice(-(data.stock.lap-earned));
 if(resumeBudgetEnd){restored.stage='result';restored.awards=null;new Game(data,restored).endTurn();}
 else if(restored.stage==='end')restored.awards=new Game(data,restored).scores();
 return validState(data,restored)?restored:null;
}
export function validState(data,s){
 try{
 if(!s||s.version!==11||!['mode','move','bonusmove','draw','guide','choose','resolve','fallback','result','end'].includes(s.stage)||s.players.length<4||s.players.length>8||!Number.isInteger(s.turn)||s.turn<0||s.turn>=s.players.length||!Number.isInteger(s.round)||s.round<1||s.round>7)return false;
 if(s.players.some(p=>p.ended))return false;
 for(const p of s.players)if(!Array.isArray(p.lapRegions)||new Set(p.lapRegions).size!==p.lapRegions.length||p.lapRegions.some(id=>!data.regions.some(r=>r.id===id))||p.progress!==p.lapRegions.length||!Number.isInteger(p.lapsCompleted)||p.lapsCompleted<0||p.lapsCompleted>1||p.cards.lap.length>1)return false;
 for(const key of ['character','meeple','course'])if(new Set(s.players.map(p=>p[key])).size!==s.players.length)return false;
 for(const p of s.players){if(!data.characters[p.character]||!Number.isInteger(p.meeple)||p.meeple<0||p.meeple>7||!data.routes.some(r=>r.id===p.course)||!data.nodes.some(n=>n.id===p.node)||!data.ports.includes(p.start)||!['cruise','fast'].includes(p.arrival)||!Number.isInteger(p.budget)||p.budget<0||p.budget>50||p.cards.fatigue.length>4||!p.visited.every(n=>data.nodes.some(x=>x.id===n)))return false;}
 for(const t of TYPES){const ids=[...s.supplies[t],...s.players.flatMap(p=>p.cards[t])];if(ids.length!==data.stock[t]||new Set(ids).size!==ids.length||ids.some(id=>!new RegExp(`^${t}-\\d{2}@\\d+$`).test(id)))return false;}
 const encounters=[...Object.values(s.decks).flat(),...Object.values(s.discards).flat(),...s.players.map(p=>p.pending?.card).filter(Boolean)];if(s.encounter&&!encounters.includes(s.encounter))encounters.push(s.encounter);if(encounters.length!==50||new Set(encounters).size!==50||encounters.some(id=>!data.encounters.some(c=>c.id===id)))return false;
 if(['guide','choose','resolve'].includes(s.stage)&&!data.encounters.find(c=>c.id===s.encounter)?.entries.some(e=>(e.applies||[e.node]).includes(s.players[s.turn].node)))return false;
 return true;
 }catch{return false;}
}
