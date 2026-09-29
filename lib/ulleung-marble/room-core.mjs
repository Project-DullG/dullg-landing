import {Game, validState, effectText} from '../../public/ulleung-marble/tabletop/v07/engine.mjs';
import {characterCourse} from '../../public/ulleung-marble/tabletop/v07/character-courses.mjs';

export class RoomError extends Error {
  constructor(message, status=400){super(message);this.status=status;}
}
const fail=(message,status)=>{throw new RoomError(message,status);};
export const nickname=value=>{
  if(typeof value!=='string')fail('닉네임을 입력해 주세요.');
  const name=value.trim().replace(/[\u0000-\u001f\u007f]/g,'');
  if(name.length<1||name.length>16)fail('닉네임은 1~16자로 입력해 주세요.');
  return name;
};
export function newRoom(code, member, now=Date.now()){
  return {version:1,code,revision:1,host:member.id,members:[{...member,name:nickname(member.name),character:0,arrival:'cruise',ready:false}],game:null,createdAt:now,updatedAt:now,seen:[]};
}
export function joinRoom(room,member,now=Date.now()){
  if(room.members.some(m=>m.id===member.id))return room;
  if(room.game)fail('이미 출발한 방입니다. 이전에 참가한 브라우저에서 이어서 접속해 주세요.',409);
  if(room.members.length>=8)fail('여행자 8명이 모두 모였습니다.',409);
  if(!room.members.length)room.host=member.id;
  const used=room.members.map(m=>m.character);
  room.members.push({...member,name:nickname(member.name),character:Array.from({length:8},(_,i)=>i).find(i=>!used.includes(i)),arrival:'cruise',ready:false});
  room.revision++;room.updatedAt=now;return room;
}
export function actRoom(data, room, actor, command, now=Date.now(), random=Math.random){
  const member=room.members.find(m=>m.id===actor);
  if(!member)fail('이 방에 참가한 여행자가 아닙니다.',403);
  if(typeof command.requestId!=='string'||command.requestId.length<8||command.requestId.length>80)fail('요청 번호가 올바르지 않습니다.');
  const requestKey=actor+':'+command.requestId;
  if(room.seen.includes(requestKey))return room;
  if(command.revision!==room.revision)fail('다른 여행자의 변경을 먼저 반영했습니다. 화면을 확인한 뒤 다시 선택해 주세요.',409);
  const {type,value}=command;
  if(!room.game){
    if(type==='configure'){
      if(!Number.isInteger(value?.character)||!data.characters[value.character]||!['cruise','fast'].includes(value.arrival))fail('여행자와 출발 항구를 확인해 주세요.');
      if(room.members.some(m=>m.id!==actor&&m.character===value.character))fail('다른 사람이 고른 여행자입니다.',409);
      member.character=value.character;member.arrival=value.arrival;member.ready=false;
    }else if(type==='ready')member.ready=!!value;
    else if(type==='leave'){
      room.members=room.members.filter(m=>m.id!==actor);
      if(room.host===actor)room.host=room.members[0]?.id||null;
    }else if(type==='remove'){
      if(room.host!==actor||value===actor)fail('방장만 대기 중인 다른 여행자를 내보낼 수 있습니다.',403);
      room.members=room.members.filter(m=>m.id!==value);
    }else if(type==='start'){
      if(room.host!==actor)fail('방장만 여행을 시작할 수 있습니다.',403);
      if(room.members.length<4||room.members.some(m=>!m.ready))fail('4~8명이 모여 모두 준비를 마치면 출발합니다.');
      const g=new Game(data,null,random);
      g.start(room.members.map(m=>({character:m.character,meeple:m.character,arrival:m.arrival})));
      room.game=g.s;
    }else fail('대기실에서 할 수 없는 동작입니다.');
  }else{
    const g=new Game(data,room.game,random), current=room.members[g.s.turn];
    if(g.s.stage==='end')fail('여행이 끝났습니다. 새 방에서 다시 만나요.');
    const reader=room.members[(g.s.turn+1)%room.members.length];
    if(actor!==current.id&&!(type==='listen'&&actor===reader.id))fail('지금은 다른 여행자의 차례입니다.',403);
    switch(type){
      case 'direction':g.setDirection(value);break;
      case 'roll':if(typeof value!=='boolean')fail('이동 방법을 확인해 주세요.');g.roll(value);break;
      case 'move':if(typeof value!=='string')fail('목적지를 확인해 주세요.');g.move(value);break;
      case 'draw':g.draw();break;
      case 'listen':g.listen();break;
      case 'choose':if(![0,1].includes(value))fail('A 또는 B를 선택해 주세요.');g.choose(value);break;
      case 'putCard':g.putCard();break;
      case 'fallback':g.fallback(value);break;
      case 'endTurn':g.endTurn();break;
      default:fail('지원하지 않는 동작입니다.');
    }
    if(!validState(data,g.s))fail('게임 상태를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.',500);
    room.game=g.s;
  }
  room.seen=[...room.seen,requestKey].slice(-80);room.revision++;room.updatedAt=now;
  return room;
}
// Only the server holds shuffled deck order, pending random values and credentials.
export function roomView(data,room,actor){
  const me=room.members.findIndex(m=>m.id===actor);
  if(me<0)fail('방을 나왔거나 참가 정보가 만료되었습니다.',403);
  const view={code:room.code,revision:room.revision,host:room.host,me:actor,seat:me,updatedAt:room.updatedAt,members:room.members.map(({id,name,character,arrival,ready})=>({id,name,character,arrival,ready}))};
  if(!room.game)return {...view,game:null};
  const g=new Game(data,room.game),s=g.s;
  const my=s.players[me],ch=data.characters[my.character];
  return {...view,game:{stage:s.stage,round:s.round,turn:s.turn,lastPath:s.lastPath||[],dice:s.dice,steps:s.steps,taxi:s.taxi,notice:s.notice,log:s.log.slice(0,30),encounter:s.encounter,selection:s.selection,applied:s.applied||null,effectDie:s.effectDie||null,
    players:s.players.map(p=>({id:p.id,character:p.character,meeple:p.meeple,budget:p.budget,node:p.node,arrival:p.arrival,direction:p.direction,progress:p.progress,lapRegions:p.lapRegions,lapsCompleted:p.lapsCompleted,visited:p.visited,cards:p.cards,pending:p.pending,first:p.first})),
    decks:Object.fromEntries(Object.entries(s.decks).map(([k,v])=>[k,v.length])),supplies:Object.fromEntries(Object.entries(s.supplies).map(([k,v])=>[k,v.length])),
    destinations:me===s.turn?g.paths().filter((p,i,a)=>a.findIndex(x=>x.node===p.node)===i):[],
    options:g.entry?.options.map(o=>({allowed:g.optionAllowed(o),effect:effectText(g.effective(o.effect))}))||[],
    course:characterCourse(data,my.character,my.course).route,
    goals:ch.goals.map(goal=>({...goal,done:g.goal(my,goal)})),
    scores:s.stage==='end'?g.scores():null}};
}
