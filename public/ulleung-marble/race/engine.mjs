import CONFIG from './rules-config.mjs';
import {EVENTS,ITEMS,BETS,EVENT_BY_ID,ITEM_BY_ID,BET_BY_ID} from './cards.mjs';
export {CONFIG};
export const VERSION=3;
const racerNames=['강치','호박','오징어','괭이갈매기','등대'];
const clone=s=>structuredClone(s),int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
export function randomInt(max){if(!int(max,1,4294967295))throw Error('무작위 범위를 확인하세요.');const a=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
export function shuffle(values,rng=randomInt){const a=[...values];for(let i=a.length-1;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createGame(count=4,{ordered=false}={}){
 if(!int(count,3,6))throw Error('3~6명이 함께합니다.');const deck=a=>ordered?[...a]:shuffle(a);
 return {version:VERSION,phase:'action',players:Array.from({length:count},(_,i)=>({name:`플레이어 ${i+1}`,bets:[],items:[],pending:null})),positions:[0,0,0,0,0],current:0,turn:1,bettingOpen:true,closedAt:null,highWater:0,eventDeck:deck(EVENTS.map(c=>c.id)),eventDiscard:[],itemDeck:deck(ITEMS.map(c=>c.id)),itemDiscard:[],dice:null,assignments:{minus:null,plus:null},mods:{},usedItem:false,triggered:{event:false,item:false},queue:[],active:null,event:null,choice:null,foundFor:null,winners:[],losers:[],history:[],animations:[]};
}
const phases=['action','bet','prepare','assign','event','event-result','choice','found','result','finished'];
function ids(a,lookup){return Array.isArray(a)&&a.every(x=>typeof x==='string'&&lookup[x]);}
export function validState(s){
 try{
 if(!s||s.version!==VERSION||!phases.includes(s.phase)||!Array.isArray(s.players)||!int(s.players.length,3,6)||!int(s.current,0,s.players.length-1)||!int(s.turn,1,100000))return false;
 if(!Array.isArray(s.positions)||s.positions.length!==5||!s.positions.every(n=>int(n,-2,44))||!int(s.highWater,0,44)||s.highWater<Math.max(...s.positions)||typeof s.bettingOpen!=='boolean'||s.bettingOpen!==(s.highWater<20)||(!s.bettingOpen&&!s.closedAt)||s.bettingOpen&&s.closedAt!==null)return false;
 if(!s.players.every((p,i)=>p&&p.name===`플레이어 ${i+1}`&&Array.isArray(p.bets)&&p.bets.length<=4&&p.bets.every(b=>b&&int(b.racer,0,4)&&BET_BY_ID[b.betId])&&new Set(p.bets.map(b=>b.racer)).size===p.bets.length&&new Set(p.bets.map(b=>b.betId)).size===p.bets.length&&ids(p.items,ITEM_BY_ID)&&p.items.length<=3&&(!p.pending||ITEM_BY_ID[p.pending.id]?.target==='opponent'&&int(p.pending.from,0,s.players.length-1)&&p.pending.from!==i)))return false;
 if(!ids(s.eventDeck,EVENT_BY_ID)||!ids(s.eventDiscard,EVENT_BY_ID)||!ids(s.itemDeck,ITEM_BY_ID)||!ids(s.itemDiscard,ITEM_BY_ID))return false;
 const allEvents=[...s.eventDeck,...s.eventDiscard,...(s.event?[s.event.id]:[])],allItems=[...s.itemDeck,...s.itemDiscard,...s.players.flatMap(p=>[...p.items,...(p.pending?[p.pending.id]:[])])];
 if(allEvents.length!==20||new Set(allEvents).size!==20||allItems.length!==20||new Set(allItems).size!==20)return false;
 if(!Array.isArray(s.queue)||s.queue.length>30||s.queue.some(o=>!o||!['move','draw','finish','prepare'].includes(o.kind)||o.kind==='move'&&(!int(o.racer,0,4)||!int(o.delta,-20,20)||typeof o.solo!=='boolean'||typeof o.tile!=='boolean')||o.kind==='draw'&&!int(o.player,0,s.players.length-1)))return false;
 if(!Array.isArray(s.winners)||!Array.isArray(s.losers)||![...s.winners,...s.losers].every(r=>int(r,0,4))||new Set(s.winners).size!==s.winners.length||new Set(s.losers).size!==s.losers.length||(s.phase==='finished')!==(s.winners.length>0)||s.winners.some(r=>s.positions[r]!==44))return false;
 if(s.phase==='finished'&&(s.queue.length||Math.max(...s.positions)!==44))return false;
 if(!Array.isArray(s.history)||s.history.length>250||!s.history.every(h=>h&&typeof h.text==='string'&&h.text.length<600&&int(h.turn,1,100000)))return false;
 if(!Array.isArray(s.animations)||s.animations.length>20||!s.animations.every(m=>m&&Array.isArray(m.group)&&m.group.every(r=>int(r,0,4))&&int(m.from,-2,44)&&int(m.to,-2,44)))return false;
 if(typeof s.usedItem!=='boolean'||!s.triggered||typeof s.triggered.item!=='boolean'||typeof s.triggered.event!=='boolean'||!s.mods||typeof s.mods!=='object')return false;
 if(s.dice!==null&&(!Array.isArray(s.dice.plusFaces)||!Array.isArray(s.dice.minusFaces)||![...s.dice.plusFaces,...s.dice.minusFaces].every(n=>int(n,1,6))||s.dice.plusFaces.length>2||s.dice.minusFaces.length<1||s.dice.minusFaces.length>2||!int(s.dice.plus,0,20)||!int(s.dice.minus,0,8)))return false;
 if(s.phase==='assign'&&!s.dice)return false;
 if(!s.assignments||!['minus','plus'].every(k=>s.assignments[k]===null||s.assignments[k]&&int(s.assignments[k].racer,0,4)&&typeof s.assignments[k].reduce==='boolean'))return false;
 if(s.event&&(!EVENT_BY_ID[s.event.id]||!int(s.event.racer,0,4)||!(s.event.roll===null||int(s.event.roll,1,6))))return false;
 if(['event','event-result'].includes(s.phase)&&!s.event)return false;
 if(s.phase==='event'&&s.event.roll!==null||s.phase==='event-result'&&s.event.roll===null)return false;
 if(s.phase==='found'&&!int(s.foundFor,0,s.players.length-1)||s.phase!=='found'&&s.players.some(p=>p.items.length>2))return false;
 if(s.phase==='choice'&&(!s.choice||!['fork','transfer','gift','rank'].includes(s.choice.type)||!int(s.choice.racer,0,4)||!Array.isArray(s.choice.targets)))return false;
 return true;
 }catch{return false;}
}
function requirePhase(s,...p){if(!validState(s)||!p.includes(s.phase))throw Error('지금은 할 수 없는 행동입니다.');}
function next(s){const n=clone(s);n.animations=[];return n;}
function log(s,text){s.history=[{turn:s.turn,text},...s.history].slice(0,250);}
export function movingGroup(positions,racer,solo=false){return solo||positions[racer]===0?[racer]:positions.map((p,i)=>p===positions[racer]?i:null).filter(i=>i!==null);}
export function cellType(position){return CONFIG.tiles[position]||'normal';}
export function beginAction(state,action){requirePhase(state,'action');const s=next(state);if(action==='bet'){if(!s.bettingOpen)throw Error('베팅이 마감되었습니다.');if(s.players[s.current].bets.length===4)throw Error('베팅 카드 네 장을 모두 냈습니다.');s.phase='bet';}else if(action==='move'){s.phase='prepare';}else throw Error('이동 또는 베팅을 고르세요.');return s;}
export function cancelAction(state){requirePhase(state,'bet','prepare');if(state.usedItem)throw Error('아이템을 사용한 뒤에는 이동을 진행합니다.');const s=next(state);s.phase='action';return s;}
export function placeBet(state,racer,betId){requirePhase(state,'bet');const s=next(state),p=s.players[s.current];if(!s.bettingOpen||!int(racer,0,4)||!BET_BY_ID[betId]||p.bets.some(b=>b.racer===racer||b.betId===betId))throw Error('남은 말 카드와 베팅 카드를 한 장씩 고르세요.');p.bets.push({racer,betId});log(s,`${p.name} · 비공개 베팅 ${p.bets.length}묶음 제출`);s.phase='result';return s;}
export function useItem(state,id,target=null){
 requirePhase(state,'prepare');const s=next(state),p=s.players[s.current],card=ITEM_BY_ID[id];if(!card||!p.items.includes(id)||s.usedItem)throw Error('이번 이동에 사용할 아이템 한 장을 고르세요.');if(p.pending&&!card.mods.clear)throw Error('방해를 적용하거나 여행 계획 변경으로 취소하세요.');
 if(card.mods.clear&&!p.pending)throw Error('내 앞에 취소할 방해가 없습니다.');
 if(card.target!=='self'&&(!int(target,0,s.players.length-1)||target===s.current))throw Error('다른 사람 한 명을 고르세요.');
 if(card.target==='opponent'&&s.players[target].pending)throw Error('그 사람 앞에는 이미 방해 카드가 있습니다.');
 p.items.splice(p.items.indexOf(id),1);s.usedItem=true;
 if(card.target==='opponent'){s.players[target].pending={id,from:s.current};log(s,`${p.name} → ${s.players[target].name} · ${card.title}`);return s;}
 s.itemDiscard.push(id);log(s,`${p.name} · ${card.title} 사용`);
 if(card.mods.clear){s.itemDiscard.push(p.pending.id);p.pending=null;return s;}
 s.mods={...card.mods};if(card.mods.share){s.queue=[{kind:'draw',player:s.current},{kind:'draw',player:target},{kind:'prepare'}];advance(s);}return s;
}
export function requiredRolls(s){const pending=s.players[s.current].pending,mods=pending?{...ITEM_BY_ID[pending.id].mods}:s.mods;return {plus:mods.blockPlus?0:mods.plusRolls||1,minus:mods.minusRolls||1};}
export function rollMovement(state,plusFaces,minusFaces){
 requirePhase(state,'prepare');const s=next(state),p=s.players[s.current],req=requiredRolls(s);if(!Array.isArray(plusFaces)||plusFaces.length!==req.plus||!Array.isArray(minusFaces)||minusFaces.length!==req.minus||![...plusFaces,...minusFaces].every(n=>int(n,1,6)))throw Error('필요한 주사위 수와 눈을 확인하세요.');
 if(p.pending){const pending=p.pending,card=ITEM_BY_ID[pending.id];s.mods={...card.mods,...(card.mods.steerPlus?{plusOwner:pending.from}:{}),...(card.mods.steerMinus?{minusOwner:pending.from}:{})};s.itemDiscard.push(pending.id);p.pending=null;log(s,`${p.name}에게 ${card.title} 적용`);}
 const m=s.mods;let plus=0;if(plusFaces.length){plus=m.plusMode==='sum'?plusFaces.reduce((a,b)=>a+b,0):m.plusMode==='min'?Math.min(...plusFaces):Math.max(...plusFaces);if(m.oddBonus&&plus%2)plus+=m.oddBonus;if(m.lowBonus&&plus<=3)plus+=m.lowBonus;plus=Math.max(0,plus+(m.plusBonus||0));}
 let minus=Math.max(...minusFaces.map(n=>CONFIG.minusFaces[n-1]));if(m.minusDouble)minus*=2;if(m.minusZero)minus=0;
 s.dice={plusFaces:[...plusFaces],minusFaces:[...minusFaces],plus,minus};s.assignments={minus:null,plus:null};log(s,`${p.name} · +${plus} / −${minus}`);s.phase='assign';if(!plus&&!minus){s.queue=[{kind:'finish'}];advance(s);}return s;
}
export function assignmentOwner(s,sign){return sign==='plus'&&s.mods.plusOwner!==undefined?s.mods.plusOwner:sign==='minus'&&s.mods.minusOwner!==undefined?s.mods.minusOwner:s.current;}
export function assignDie(state,sign,racer,{reduce=false}={}){
 requirePhase(state,'assign');if(!['minus','plus'].includes(sign)||!int(racer,0,4)||state.dice[sign]===0||state.assignments[sign]!==null)throw Error('배정할 주사위와 말을 확인하세요.');const other=sign==='plus'?'minus':'plus';if(state.assignments[other]?.racer===racer)throw Error('+와 −는 서로 다른 말에 배정합니다. 같은 무리에 속한 서로 다른 말은 가능합니다.');if(reduce&&!(sign==='plus'&&state.mods.flexPlus))throw Error('이번에는 이동 거리를 줄일 수 없습니다.');
 const s=next(state);s.assignments[sign]={racer,reduce:!!reduce};if(['minus','plus'].every(k=>!s.dice[k]||s.assignments[k])){
 s.queue=[];const minus=s.assignments.minus,plus=s.assignments.plus;
 if(minus){let n=s.dice.minus;if(cellType(s.positions[minus.racer])==='shelter'&&!s.mods.ignoreShelter)n=Math.max(0,n-1);if(n)s.queue.push({kind:'move',racer:minus.racer,delta:-n,solo:!!s.mods.minusSolo,tile:true,source:'−주사위'});}
 if(plus){const n=Math.max(0,s.dice.plus-(plus.reduce?1:0));if(n)s.queue.push({kind:'move',racer:plus.racer,delta:n,solo:!!s.mods.plusSolo,tile:true,source:'+주사위'});}
 s.queue.push({kind:'finish'});advance(s);
 }return s;
}
function closeBet(s,from,to){s.highWater=Math.max(s.highWater,from,to);if(s.bettingOpen&&s.highWater>=20){s.bettingOpen=false;s.closedAt={turn:s.turn,position:Math.max(from,to)};log(s,'베팅 마감 · 중간선을 처음 통과했습니다. 다시 열리지 않습니다.');}}
function finish(s){s.winners=s.positions.map((p,i)=>p===44?i:null).filter(i=>i!==null);const min=Math.min(...s.positions);s.losers=s.winners.length===5?[]:s.positions.map((p,i)=>p===min?i:null).filter(i=>i!==null);s.phase='finished';s.queue=[];s.choice=null;log(s,`독도 도착 · ${s.winners.length}마리 공동 1등`);}
function applyMove(s,op){
 const from=s.positions[op.racer],to=Math.max(-2,Math.min(44,from+op.delta));if(from===to)return;
 const group=movingGroup(s.positions,op.racer,op.solo);for(const id of group)s.positions[id]=to;
 s.active={racer:op.racer,group,from,to,source:op.source};s.animations.push({...s.active});closeBet(s,from,to);log(s,`${op.source} · ${group.map(i=>racerNames[i]).join('·')} ${from} → ${to}`);
 if(to===44){finish(s);return;}
 if(op.tile){const type=cellType(to);
 if(type==='item'&&!s.triggered.item){s.triggered.item=true;s.queue.unshift({kind:'draw',player:s.current});}
 if(type==='event'&&!s.triggered.event){s.triggered.event=true;const id=drawCard(s,'event');if(id){s.event={id,racer:op.racer,roll:null};s.phase='event';log(s,`이벤트 공개 · ${EVENT_BY_ID[id].title}`);}}
 if(type==='fork'){s.choice={type:'fork',racer:op.racer,targets:[]};s.phase='choice';}
 if(type==='transfer'){const targets=s.positions.map((p,i)=>i!==op.racer&&p!==to&&Math.abs(p-to)<=3?i:null).filter(i=>i!==null);if(targets.length){s.choice={type:'transfer',racer:op.racer,targets};s.phase='choice';}else log(s,'환승 · 앞뒤 3칸 안에 다른 무리가 없습니다.');}
 }
}
function drawCard(s,kind){const deck=kind+'Deck',discard=kind+'Discard';if(!s[deck].length&&s[discard].length){s[deck]=shuffle(s[discard]);s[discard]=[];log(s,`${kind==='item'?'아이템':'이벤트'} 버린 카드를 다시 섞었습니다.`);}return s[deck].shift()||null;}
function advance(s){s.phase='resolve';while(s.queue.length&&s.phase==='resolve'){
 const op=s.queue.shift();if(op.kind==='move')applyMove(s,op);
 if(op.kind==='draw'){const id=drawCard(s,'item');if(id){s.players[op.player].items.push(id);s.foundFor=op.player;s.phase='found';log(s,`${s.players[op.player].name} · 아이템 1장 획득`);}else log(s,'아이템 덱과 버린 카드가 모두 비어 있습니다.');}
 if(op.kind==='prepare')s.phase='prepare';
 if(op.kind==='finish')s.phase='result';
 }if(s.phase==='resolve')s.phase='result';}
export function rollEvent(state,face){requirePhase(state,'event');if(!int(face,1,6))throw Error('이벤트 주사위는 1~6입니다.');const s=next(state);s.event.roll=face;s.phase='event-result';log(s,`${EVENT_BY_ID[s.event.id].title} · 주사위 ${face}`);return s;}
export function eventResult(s){return s.event?.roll?EVENT_BY_ID[s.event.id].rows[Math.floor((s.event.roll-1)/2)]:null;}
function effectOperations(s,e,racer){
 const source='이벤트',op=(racer,delta,solo=false)=>({kind:'move',racer,delta,solo,tile:false,source});
 if(e.type==='move'){if(e.n)s.queue.unshift(op(racer,e.n,!!e.solo));}
 else if(e.type==='draw')for(let i=0;i<e.n;i++)s.queue.unshift({kind:'draw',player:s.current});
 else if(e.type==='catch'){const ahead=s.positions.filter(p=>p>s.positions[racer]);if(ahead.length)s.queue.unshift(op(racer,Math.min(e.n,Math.min(...ahead)-s.positions[racer])));else log(s,'앞선 무리가 없어 현재 칸에 머뭅니다.');}
 else if(e.type==='rear'||e.type==='lead'){const value=e.type==='rear'?Math.min(...s.positions):Math.max(...s.positions),targets=s.positions.map((p,i)=>p===value?i:null).filter(i=>i!==null);if(value===0&&targets.length>1){s.choice={type:'rank',racer,targets,n:e.n};s.phase='choice';}else s.queue.unshift(op(targets[0],e.n));}
 else if(e.type==='gift'||e.type==='share'){s.choice={type:'gift',racer,targets:s.players.map((_,i)=>i).filter(i=>i!==s.current),share:e.type==='share'};s.phase='choice';}
}
export function continueEvent(state){requirePhase(state,'event-result');const s=next(state),effect=eventResult(s).effect,racer=s.event.racer;s.eventDiscard.push(s.event.id);s.event=null;s.phase='resolve';effectOperations(s,effect,racer);if(s.phase==='resolve')advance(s);return s;}
export function resolveChoice(state,value){requirePhase(state,'choice');const s=next(state),c=s.choice;s.choice=null;
 if(c.type==='fork'){if(!['solo','group'].includes(value))throw Error('혼자 또는 함께를 고르세요.');s.queue.unshift({kind:'move',racer:c.racer,delta:value==='solo'?2:1,solo:value==='solo',tile:false,source:value==='solo'?'갈림길 · 혼자':'갈림길 · 함께'});}
 if(c.type==='transfer'){if(value!=='pass'&&!c.targets.includes(value))throw Error('합류시킬 무리를 고르세요.');if(value!=='pass')s.queue.unshift({kind:'move',racer:value,delta:s.positions[c.racer]-s.positions[value],solo:false,tile:false,source:'항구 환승'});}
 if(c.type==='rank'){if(!c.targets.includes(value))throw Error('대상 말을 고르세요.');s.queue.unshift({kind:'move',racer:value,delta:c.n,solo:false,tile:false,source:'이벤트'});}
 if(c.type==='gift'){if(!c.targets.includes(value))throw Error('선물을 받을 사람을 고르세요.');s.queue.unshift({kind:'draw',player:value});if(c.share)s.queue.unshift({kind:'draw',player:s.current});}
 advance(s);return s;
}
export function acknowledgeItem(state,discard=null){requirePhase(state,'found');const s=next(state),p=s.players[s.foundFor];if(p.items.length>2){if(!p.items.includes(discard))throw Error('아이템 두 장을 남기고 한 장을 버리세요.');p.items.splice(p.items.indexOf(discard),1);s.itemDiscard.push(discard);}else if(discard!==null)throw Error('지금은 카드를 버리지 않습니다.');s.foundFor=null;advance(s);return s;}
export function nextTurn(state){requirePhase(state,'result');const s=next(state);s.current=(s.current+1)%s.players.length;s.turn++;s.phase='action';s.dice=null;s.assignments={minus:null,plus:null};s.mods={};s.usedItem=false;s.triggered={event:false,item:false};s.active=null;return s;}
export function scores(s){if(s.phase!=='finished')return null;return s.players.map(p=>({name:p.name,bets:p.bets.map(b=>{const card=BET_BY_ID[b.betId],hit=(card.rank==='first'?s.winners:s.losers).includes(b.racer);return {...b,...card,earned:hit?card.points:0};}),total:p.bets.reduce((n,b)=>{const card=BET_BY_ID[b.betId];return n+((card.rank==='first'?s.winners:s.losers).includes(b.racer)?card.points:0);},0)}));}
export function publicState(s){const finished=s.phase==='finished';return {version:s.version,phase:s.phase,current:s.current,turn:s.turn,positions:[...s.positions],bettingOpen:s.bettingOpen,players:s.players.map(p=>({name:p.name,bets:finished?clone(p.bets):p.bets.map(()=>({sealed:true})),itemCount:p.items.length,pending:p.pending?clone(p.pending):null})),eventCount:s.eventDeck.length,itemCount:s.itemDeck.length,event:s.event?clone(s.event):null,dice:s.dice?clone(s.dice):null,winners:[...s.winners],losers:[...s.losers],history:clone(s.history)};}
export function route(from,to){return Array.from({length:Math.abs(to-from)},(_,i)=>from+(i+1)*Math.sign(to-from));}
