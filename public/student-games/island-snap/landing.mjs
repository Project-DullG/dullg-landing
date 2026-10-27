import {cardHTML} from './art.mjs?v=quality-final-20261027';

const $=selector=>document.querySelector(selector);
$('#cover-cards').innerHTML=['squid','candy','leaves'].map(kind=>`<div>${cardHTML({kind})}</div>`).join('');
$('#basic-cards').innerHTML=['squid','candy','leaves','dokdo','mountain'].map(kind=>`<div class="shelf-card">${cardHTML({kind})}<p class="shelf-count"><b>10</b>장</p></div>`).join('');
$('#gull-card').innerHTML=cardHTML({kind:'gull'});
$('#boat-card').innerHTML=cardHTML({kind:'boat'});
$('#final-card').innerHTML=cardHTML({kind:'squid'});

const lessons=[
  {said:'오징어',kind:'squid',answer:'hand',success:'맞아요! 오징어라고 외쳤고, 오징어 그림이니 가운데에 손!',context:'첫 번째 카드예요. 외친 이름과 그림을 비교해요.'},
  {said:'호박엿',kind:'leaves',answer:'wait',success:'잘 기다렸어요. 호박엿이라고 했지만 그림은 명이나물이니, 아무 행동도 하지 않아요.',context:'두 번째 카드예요. 이름은 호박엿, 그림은 무엇일까요?'},
  {said:'명이나물',kind:'gull',answer:'flap',success:'퍼덕, 퍼덕! 갈매기는 외친 이름과 상관없이 양팔을 두 번 퍼덕여요.',context:'마지막은 특수 카드! 이름이 달라도 정해진 행동을 해요.'}
];
let current=0,completed=false,flaps=0;
function renderLesson(){
  $('#lesson-cards').innerHTML=lessons.map((lesson,i)=>`<li class="lesson-card ${i===current?'is-active':i<current?'is-done':''}" ${i!==current?'aria-hidden="true"':''}><p class="lesson-call">“${lesson.said}!”</p>${cardHTML({kind:lesson.kind})}<span class="lesson-card-status">${i<current?'잘했어요':i===current?`${i+1}번째 카드`:'다음에 공개할 카드'}</span></li>`).join('');
  $('#lesson-progress').innerHTML=lessons.map((_,i)=>`${i?'<i aria-hidden="true"></i>':''}<span class="${i===current?'is-current':i<current?'is-done':''}" ${i===current?'aria-current="step"':''}>${i+1}</span>`).join('');
  $('#lesson-context').textContent=lessons[current].context;
  $('#lesson-question').textContent=current===2?'갈매기가 나왔어요. 어떤 행동을 할까요?':'이름과 그림이 같나요?';
  $('#lesson-feedback').textContent='정답을 골라 보세요. 여기서는 틀려도 괜찮아요.';
  $('#lesson-next').hidden=true;
  $('#lesson-choices').querySelectorAll('button').forEach(button=>button.disabled=false);
}
$('#lesson-choices').addEventListener('click',event=>{
  const button=event.target.closest('button[data-answer]');
  if(!button||completed)return;
  const lesson=lessons[current],answer=button.dataset.answer;
  if(answer!==lesson.answer){
    flaps=0;
    $('#lesson-feedback').textContent=current===2?'갈매기는 특수 카드예요. 외친 이름 대신 양팔을 두 번 퍼덕여 보세요.':current===1?'그림은 명이나물이에요. 외친 호박엿과 다르니 손을 기다려 주세요.':'그림도 오징어예요! 외친 이름과 같을 때는 가운데에 손을 대요.';
    return;
  }
  if(answer==='flap'&&++flaps<2){$('#lesson-feedback').textContent='퍼덕, 한 번! ‘양팔을 퍼덕!’을 한 번 더 눌러요.';return;}
  completed=true;
  $('#lesson-feedback').textContent=lesson.success;
  $('#lesson-choices').querySelectorAll('button').forEach(choice=>choice.disabled=true);
  $('#lesson-next').textContent=current===2?'한 번 더 해보기 ↻':'다음 카드 →';
  $('#lesson-next').hidden=false;
});
$('#lesson-next').addEventListener('click',()=>{
  current=(current+1)%lessons.length;completed=false;flaps=0;renderLesson();
  $('#lesson-choices').querySelector('button').focus({preventScroll:true});
});
renderLesson();

const rhythmTimers=new Map();
document.querySelectorAll('[data-rhythm]').forEach(button=>button.addEventListener('click',()=>{
  const scene=button.closest('.special-scene');
  if(rhythmTimers.has(scene))return;
  scene.classList.add('is-demonstrating','beat-one');
  button.disabled=true;
  const second=setTimeout(()=>{scene.classList.remove('beat-one');scene.classList.add('beat-two');},560);
  const finish=setTimeout(()=>{scene.classList.remove('is-demonstrating','beat-one','beat-two');button.disabled=false;rhythmTimers.delete(scene);},1150);
  rhythmTimers.set(scene,[second,finish]);
}));
