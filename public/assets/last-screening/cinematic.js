/* Cinematic view: existing raster assets only. Camera motion is not investigation
 * footage. Controls, captions and head silhouettes live in separate safe regions. */
(function(root){'use strict';
 const I=root.OPENING,D=root.STORY;
 let last=null,animations=new Set();
 function stop(){for(const a of animations)a.cancel();animations.clear();}
 function capture(){return {camera:document.querySelector('.opening-camera'),cast:document.querySelector('.opening-cast'),context:last};}
 function html({g,c,auto,img,btn,esc}){
  const f=I.frame(g),ready=g.opening.status==='ready',line=root.MODEL.currentLine(g);
  const speaker=line?.who==='n'?'정해온 · 관찰':D.names[line?.who]||D.people[line?.who]?.name||'정해온';
  const protagonist=!!line&&['n','haeon'].includes(line.who);
  const toolbar=`<header class="opening-toolbar"><span class="opening-series">${g.echo?'지난 사건 열람':ready?'현장 조사':'마지막 상영'}<i aria-hidden="true"></i><span>${esc(f.chapter)}</span></span><nav aria-label="도입 메뉴">${g.echo?btn('사무소로','echo-home','','opening-tool'):''}${btn(c.audioMuted?'소리 켜기':'음소거','audio-mute',`aria-pressed="${c.audioMuted}"`,'opening-tool')}${btn('기록','log','aria-label="대화 기록"','opening-tool')}${btn('저장','save-menu','','opening-tool')}${btn('설정','settings','','opening-tool')}${!ready?btn('도입 건너뛰기','opening-skip','','opening-skip'):''}</nav></header>`;
  const camera=`<div class="opening-camera" data-camera="${f.bg}/${f.layout==='portrait'?'portrait':'wide'}">${img(f.bg,'opening-background','')}<div class="opening-image-shade"></div></div>`;
  const status=`<div class="opening-status"><div id="notificationSlot"></div><div id="storageNotice" class="storage-notice" role="status" hidden></div></div>`;
  if(ready){return `<section class="opening-film opening-ready" data-shot="handoff">${camera}${toolbar}<main class="opening-handoff" id="main" tabindex="-1"><section class="handoff-copy"><span class="opening-kicker">형사 정해온의 수첩</span><h1 id="handoffHeading" tabindex="-1">마지막 대답을<br>찾는다.</h1><p>서도윤은 영사실에서 숨진 채 발견됐다.<br>밤 9시의 안내는 녹음이었다.</p><p>그보다 앞서 대표와 직접 통화했다는 사람이 있다.<br>발견 당시의 상황과 그 통화를 확인하자.</p><div class="handoff-note"><strong>무엇부터 확인할까?</strong><span>한 사람부터 확인해도 되고, 다른 장소를 먼저 둘러봐도 된다.</span></div></section><section class="handoff-choices" aria-label="첫 조사 선택">${[['witness','taeo','발견 당시를 묻는다','영사실 · 정태오'],['call','minjae','마지막 통화를 묻는다','로비 · 이민재']].map(([id,p,title,place])=>`<button class="first-action" type="button" data-act="opening-go" data-id="${id}">${img(D.people[p].asset+'_portrait','portrait',D.people[p].name)}<span><small>${place}</small><strong>${title}</strong></span><b aria-hidden="true">→</b></button>`).join('')}${btn('로비부터 자유롭게 둘러본다','opening-go','data-id="explore"','opening-explore')}<p class="handoff-help">확인한 내용이 충분하다고 느껴지면 <strong>추리 시작</strong>을 누르세요.<br>근거가 부족하면 필요한 곳만 더 조사한 뒤 이어갈 수 있습니다.</p></section></main>${status}</section>`;}
  let insert='';
  if(f.layout==='report')insert=`<aside class="opening-report" aria-label="피해자 인계 내용">${img('doyun_portrait','portrait','서도윤')}<div><span>피해자</span><strong>서도윤</strong><p>극장 대표<br>21:08 영사실에서 발견</p></div></aside>`;
  if(f.layout==='gathering')insert=`<div class="opening-room-memory" aria-hidden="true">${['jisu','minjae','seoa','taeo'].map(p=>img(D.people[p].asset+'_portrait','portrait','')).join('')}</div>`;
  const cast=f.actor?`<div class="opening-cast" data-person="${f.actor}">${img(D.people[f.actor].asset+'_bust','opening-actor',D.people[f.actor].name)}</div>`:'';
  const words=f.heading?`<section class="opening-shot-heading ${f.layout==='portrait'?'cast-name':''}"><span class="opening-kicker">${esc(f.kicker)}</span><h1>${esc(f.heading)}</h1>${f.copy?`<p>${esc(f.copy)}</p>`:''}</section>`:'';
  const caption=`<section class="opening-caption dialogue" data-line-kind="${protagonist?'observation':'speech'}" aria-label="도입 대사"><div class="dialogue-heading"><span class="speaker" id="speaker">${esc(speaker)}</span><span class="opening-sentence-meter" aria-hidden="true">${['arrival_v7','handover_v7','first_question_v7'].map(id=>`<i class="${id===f.scene?'active':''}"></i>`).join('')}</span></div><button type="button" class="line-button" data-act="advance" id="lineButton" aria-label="대사 표시 또는 다음 문장"><span id="lineText" aria-hidden="true"></span><span id="lineAccessible" class="sr-only" aria-live="polite"></span><span class="next-mark" id="nextMark" hidden>▸</span></button><footer class="opening-caption-footer"><span id="lineStatus" ${!c.controlHints?'hidden':''}></span><span class="reading-track" aria-hidden="true"><i id="lineProgress"></i></span><div class="inline-dialogue-controls">${btn(auto?'자동 켜짐':'자동','auto',`aria-pressed="${auto}" aria-label="대사 자동 진행"`,'small')}${btn('다음 →','advance','id="explicitNext"','opening-next')}</div></footer></section>`;
  return `<section class="opening-film opening-scene shot-${f.layout}" data-shot="${f.key}" data-reveal="${!!f.reveal}">${camera}<div class="opening-vignette"></div>${toolbar}<main class="opening-composition" id="main" tabindex="-1"><div class="opening-stage">${words}${insert}${cast}</div>${caption}</main>${status}</section>`;
 }
 function animate(el,frames,time=450){if(!el||!el.animate)return;const a=el.animate(frames,{duration:time,easing:'cubic-bezier(.22,.65,.3,1)',fill:'none'});animations.add(a);a.onfinish=()=>animations.delete(a);a.oncancel=()=>animations.delete(a);}
 function afterRender(g,c,old){
  const on=I.active(g);document.body.classList.toggle('opening-active',on);
  for(const a of [...animations])if(a.effect?.target&&!a.effect.target.isConnected){a.cancel();animations.delete(a);}
  if(!on){last=null;stop();return;}
  const f=I.frame(g),cam=document.querySelector('.opening-camera'),cast=document.querySelector('.opening-cast');
  const motion=!root.PRESENTATION.reduced()&&!document.hidden&&c.sceneEffects!==false;
  document.querySelector('.opening-film').classList.toggle('opening-motion',motion&&!document.body.classList.contains('ui-paused'));
  if(old?.camera&&cam&&old.camera.dataset.camera===cam.dataset.camera)cam.replaceWith(old.camera);
  if(old?.cast&&cast&&old.cast.dataset.person===cast.dataset.person)cast.replaceWith(old.cast);
  const same=old?.context?.key===f.key;
  if(motion&&!same&&!document.body.classList.contains('ui-paused')){
   if(!old?.context||old.context.bg!==f.bg||old.context.layout!==f.layout)animate(document.querySelector('.opening-camera'),[{opacity:.25},{opacity:1}],600);
   if(f.actor!==old?.context?.actor&&f.actor)animate(document.querySelector('.opening-cast'),[{opacity:0,transform:'translateX(10px)'},{opacity:1,transform:'none'}],430);
   if(f.heading!==old?.context?.heading)animate(document.querySelector('.opening-shot-heading,.handoff-copy'),[{opacity:.1},{opacity:1}],460);
   animate(document.querySelector('.opening-caption .speaker'),[{opacity:.45},{opacity:1}],180);
  }
  last=f;
 }
 function suspend(){stop();}
 root.OPENING_VIEW={html,capture,afterRender,suspend};
})(window);
