/* 0.11 — Authored opening direction using the existing story's stable line IDs.
 * Three scenes, their evidence grants, speaker IDs and canonical sequence stay
 * intact. Presentation is resumable; skipping does not mark unseen lines read.
 */
(function(root){'use strict';
 const M=root.MODEL,D=root.STORY;
 const refs=['arrival_v7','handover_v7','first_question_v7'];
 const edits=[
  ['arrival_v7',0,'10월 18일 밤 9시 26분. 나는 모서리 극장 앞에서 차를 세웠다. 형사 정해온. 영사실에서 사람이 숨진 채 발견됐다는 신고를 받고 왔다.','10월 18일, 밤 9시 26분. 나는 모서리 극장 앞에 차를 세웠다. 영사실에서 사람이 숨진 채 발견됐다는 신고였다.'],
  ['arrival_v7',1,'피해자는 극장 대표 서도윤. 머리 옆에 금속 손잡이가 떨어져 있었다고 했다. 사고인지, 누군가 그를 때린 것인지 현장을 확인해야 했다.','이름은 서도윤. 이 극장의 대표다. 머리 옆에 금속 손잡이가 떨어져 있었다고 했다.'],
  ['arrival_v7',2,'오늘은 이 극장의 마지막 영업일이었다. 마지막 영화는 8시 30분에 끝났고, 관객들은 모두 나간 뒤였다.','오늘이 마지막 영업일. 여덟 시 반에 마지막 영화가 끝났고, 관객은 모두 돌아갔다.'],
  ['arrival_v7',3,'정 형사님, 박은채입니다. 신고 뒤 현장에 도착했습니다. 영사실은 보존했고, 남아 있던 분들은 안에서 기다리고 있습니다.','정해온 형사님이시죠? 박은채입니다. 신고 뒤 도착했습니다. 현장은 보존했고, 관계자들은 로비에 있습니다.'],
  ['handover_v7',0,'영화가 끝난 뒤에도 네 분이 여기 남아 있던 이유를 듣겠습니다.','다들 무슨 일로 남아 계셨습니까?'],
  ['first_question_v7',5,'알겠습니다. 먼저 발견하신 영사실부터 보겠습니다. 그다음 통화가 담긴 영상을 확인하죠.','발견 당시 상황과 그 통화, 둘 다 확인하겠습니다.'],
  ['first_question_v7',6,'서도윤이 쓰러진 이유를 밝히려면 마지막으로 살아 있던 때와 그 뒤의 행동을 알아야 했다. 나는 영사실로 향했다.','마지막으로 살아 있던 때부터 좁혀 보자. 나는 수첩을 펴고, 첫 질문을 적었다.']
 ];
 for(const [ref,i,before,after] of edits){const l=D.scenes[ref]?.lines[i];if(l?.text!==before)throw Error('Opening text baseline mismatch: '+ref+'/'+i);l.text=after;}
 function inStory(s){return s?.dialogue?.kind==='scene'&&refs.includes(s.dialogue.ref);}
 function active(s){return !!s?.opening&&s.opening.version===1&&['playing','ready'].includes(s.opening.status);}
 function begin(s){if(s.guideVersion!==1||!inStory(s)||s.dialogue.ref!==refs[0]||s.dialogue.index!==0)throw Error('새 도입을 시작할 수 없습니다.');s.opening={version:1,status:'playing',skipped:false};s.reasoning.briefed=true;return s;}
 function observe(s){if(s?.opening?.status==='playing'&&!inStory(s)){if(!refs.every(id=>s.scenesRead.includes(id)))throw Error('도입 연결을 확인할 수 없습니다.');s.opening.status='ready';}}
 function skip(s){
  if(!active(s)||s.opening.status!=='playing')return false;
  const read=s.readLines.slice(),log=s.log.slice();let steps=0;
  while(inStory(s)&&steps++<40)M.advance(s);
  if(inStory(s))throw Error('도입을 마무리하지 못했습니다.');
  // Completing the essential handover is not the same as reading every line.
  s.readLines=read;s.log=log;s.opening.skipped=true;observe(s);return true;
 }
 const destinations={witness:{location:'projection',person:'taeo',topic:'t_discovery'},call:{location:'lobby',person:'minjae',topic:'m_original'},explore:{location:'lobby',person:null,topic:null}};
 function dismiss(s,choice){if(!active(s)||s.opening.status!=='ready'||!destinations[choice])throw Error('먼저 사건 인계를 마쳐 주세요.');s.opening.status='complete';s.reasoning.introSeen=true;return {...destinations[choice]};}
 function validate(s){
  if(s.opening===undefined)return s;
  const x=s.opening;
  if(!x||x.version!==1||!['playing','ready','complete'].includes(x.status)||typeof x.skipped!=='boolean'||s.guideVersion!==1||s.loopVersion!==1||!s.reasoning.briefed)throw Error('도입 저장 정보가 손상되었습니다.');
  if(x.status==='playing'&&(!inStory(s)||s.phase!=='night'||s.caseClosed||s.reasoning.status!=='investigation'||x.skipped))throw Error('도입의 읽던 위치가 일치하지 않습니다.');
  if(x.status!=='playing'&&!refs.every(id=>s.scenesRead.includes(id)))throw Error('사건 인계 기록이 누락되었습니다.');
  if(x.status==='ready'&&(s.dialogue||s.phase!=='night'||s.reasoning.status!=='investigation'))throw Error('첫 조사 선택 상태가 일치하지 않습니다.');
  if(x.status==='complete'&&inStory(s))throw Error('완료된 도입의 위치가 일치하지 않습니다.');
  return s;
 }
 const priorValidate=M.validate;
 M.validate=function(s){
  for(const l of s?.log||[])for(const [r,i,before,after] of edits)if(l.id==='scene/'+r+'/'+i&&l.who===D.scenes[r].lines[i].who&&l.text===before)l.text=after;
  priorValidate(s);return validate(s);
 };
 const people={eunchae:['현장 인계','신고 뒤 도착한 경찰관'],jisu:['남아 있던 사람','직원 정산을 마치던 회계 담당'],minjae:['남아 있던 사람','예정된 거래를 마치러 온 인수 기사'],seoa:['남아 있던 사람','직원 영상을 준비한 편집자'],taeo:['최초 발견자','극장의 영사기사']};
 function frame(s){
  if(!active(s))return null;
  if(s.opening.status==='ready')return {key:'handoff',chapter:'첫 조사',bg:'lobby',layout:'handoff',heading:'마지막 대답을 찾는다',kicker:'사건 인계 완료',copy:'서도윤은 영사실에서 숨진 채 발견됐다. 밤 9시의 안내는 녹음이었다. 직접 대화한 기록은 따로 있다.',actor:null,scene:'handoff',index:0,total:1,music:'bgm_02_investigation'};
  const q=s.dialogue,ref=q.ref,i=q.index,line=M.currentLine(s);
  const chapter=ref==='arrival_v7'?'극장에 도착하다':ref==='handover_v7'?'남아 있던 사람들':'마지막으로 들은 목소리';
  let f={key:ref+'/'+i,scene:ref,index:i,total:D.scenes[ref].lines.length,chapter,bg:'lobby',layout:'portrait',actor:null,kicker:'모서리 극장 · 로비',heading:'',copy:'',music:'bgm_04_interview',mix:1};
  if(ref==='arrival_v7'&&i===0)return {...f,bg:'lobby',layout:'arrival',kicker:'10월 18일 · 모서리 극장',heading:'21:26',copy:'폐관일 밤, 한 건의 사망 신고.',music:'bgm_02_investigation'};
  if(ref==='arrival_v7'&&i===1)return {...f,bg:root.ASSETS?.echo_scene?'echo_scene':'projection',layout:'report',kicker:'신고로 전해진 내용',heading:'서도윤',copy:'극장 대표 · 영사실에서 발견',music:'bgm_02_investigation'};
  if(ref==='arrival_v7'&&i===2)return {...f,bg:'auditorium',layout:'empty',kicker:'마지막 영업일',heading:'관객은 모두 떠났다',copy:'마지막 정규 상영 종료 · 20:30',music:'bgm_02_investigation'};
  if(ref==='arrival_v7'&&i===7)return {...f,layout:'threshold',kicker:'10월 18일 · 21:26',heading:'모서리 극장',copy:'로비에 남아 있던 사람들을 만났다.'};
  if(ref==='handover_v7'&&i===0)return {...f,layout:'gathering',kicker:'현장 인계',heading:'끝내지 못한 일들',copy:''};
  if(ref==='handover_v7'&&i===8)return {...f,layout:'gathering',kicker:'폐관 뒤 남은 일',heading:'정산. 인수. 상영.',copy:''};
  if(ref==='first_question_v7'&&i===6)return {...f,layout:'threshold',kicker:'첫 번째 질문',heading:'마지막으로 대답한 때',copy:''};
  let actor=D.people[line.who]?line.who:null;
  if(!actor){const prev=D.scenes[ref].lines.slice(0,i).reverse().find(l=>D.people[l.who]);actor=prev?.who||null;}
  if(actor){const p=D.people[actor];f.actor=actor;f.kicker=people[actor]?.[0]||'현장 인계';f.heading=p.name;f.copy=people[actor]?.[1]||p.role;}
  else {f.layout='gathering';f.heading=ref==='first_question_v7'?'마지막으로 들은 목소리':'남아 있던 사람들';}
  // The recording is disclosed by Taeo, never staged as a late twist or a lie cue.
  if(ref==='first_question_v7'&&i===2){f.mix=.58;f.reveal=true;}
  return f;
 }
 function audio(s){const f=frame(s);return f?{key:f.music,gain:f.mix??1}:null;}
 root.OPENING={refs,edits,inStory,active,begin,observe,skip,dismiss,validate,frame,audio,destinations};
 if(typeof module!=='undefined')module.exports=root.OPENING;
})(typeof window!=='undefined'?window:globalThis);
