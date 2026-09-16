/* 0.8 authored presentation cues. No keyword-based truth/lie detection.
 * These are ID + exact-line guards; an edited line drops its cue safely.
 * No direction cue mutates game state, gates input or asserts unacquired facts.
 */
(function(root){'use strict';
 const D=root.STORY;
 const cueDefs=[
  ['arrival_v7',0,'10월 18일 밤 9시 26분.', 'arrival','형사 정해온.'],
  ['first_question_v7',2,'그건 녹음입니다.', 'contrast','그건 녹음입니다.'],
  ['conclusion_v7_visit',7,'올라갔어요.', 'admission','올라갔어요.'],
  ['conclusion_v7_grip',8,'서도윤을 그걸로 때렸습니까?', 'question',''],
  ['conclusion_v7_grip',9,'네.', 'silence','네.'],
  ['conclusion_v7_after',3,'안 했어요.', 'silence','안 했어요.'],
  ['conclusion_v7_call',2,'아뇨. 번호도 안 눌렀어요.', 'silence','번호도 안 눌렀어요.'],
  ['conclusion_v7_papers',7,'알아요. 종이 가져간다고 계좌가 없어지는 건 아니잖아요.', 'admission','당장 그 종이가 넘어가는 것만'],
  ['conclusion_v7_stairs',3,'네. 방송 때문에 신고를 안 한 게 아니에요.', 'admission','이미 안 하고 나왔어요.'],
  ['conclusion_v7_close',5,'네. 서도윤이 갚지 않은 빚도 남습니다.', 'aftermath','빚도 남습니다.']
 ];
 const cues=new Map();
 for(const [ref,index,guard,tone,phrase] of cueDefs){
  const line=D.scenes[ref]?.lines[index];
  if(line?.text.startsWith(guard))cues.set(ref+'/'+index,{ref,index,tone,phrase,guard,who:line.who});
 }
 function resolve(g,u,aux){
  if(!g||aux||u.mode!=='talk'||g.dialogue?.kind!=='scene'||g.dialogue.remote)return null;
  const d=g.dialogue,scene=D.scenes[d.ref],line=scene?.lines[d.index];if(!line)return null;
  const cue=cues.get(d.ref+'/'+d.index),safe=cue&&line.text.startsWith(cue.guard)?cue:null;
  return {key:d.ref+'/'+d.index,section:scene.section||'',scene:d.ref,opening:!!scene.opening,interview:!!scene.interview,
   tone:safe?.tone||((d.ref.startsWith('ending')||g.phase==='epilogue')?'aftermath':'normal'),phrase:safe?.phrase||'',speech:line.who!=='n'};
 }
 const chapters={
  arrival_v7:['10월 18일 · 21:26','마지막 관객이 떠난 뒤'],
  handover_v7:['모서리 극장 · 로비','남아 있던 사람들'],
  first_question_v7:['사건의 시작','마지막으로 들은 목소리'],
  followup_open:['며칠 뒤','다시 확인할 시간'],
  followup:['며칠 뒤','다시 확인할 시간'],
  conclusion_v7_open:['마지막 면담','장부를 들고 올라간 사람']
 };
 function chapter(g,u){
  if(!g||u.mode!=='talk'||g.dialogue?.kind!=='scene')return null;
  const d=g.dialogue,c=chapters[d.ref];return c?{id:d.ref,kicker:c[0],title:c[1]}:null;
 }
 function accepted(g,id,proofs){
  const d=D.deductions.find(x=>x.id===id);
  if(!d||!g.solved.includes(id))return null;
  const ids=[...new Set(proofs||[])].filter(e=>g.evidence.includes(e)&&d.proof.includes(e));
  const headlines={broadcast:'들린 시간과 말한 시간',lens:'번호표와 각인이 가리킨 것',payments:'같은 합계, 다른 수취인',signatures:'같은 서명, 다른 문서',visit:'장부가 남긴 이동의 흔적'};
  return {title:d.name,headline:headlines[id]||d.name,text:d.result,sources:ids};
 }
 root.DIRECTION={resolve,chapter,accepted,cues:[...cues.values()]};
 if(typeof module!=='undefined')module.exports=root.DIRECTION;
})(typeof window!=='undefined'?window:globalThis);
