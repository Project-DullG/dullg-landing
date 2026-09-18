/* 0.36–0.39 consolidation patch.
 * 0.36: simultaneous, non-random commission inbox.
 * 0.37: post-case messages arrive as world continuity, not paid clues.
 * 0.38: first personal-case thread for Haeon.
 * 0.39: one obvious next action and less hub/menu repetition.
 */
(function(root){'use strict';
 const E=root.ECHO,C=root.CONTENT015,V=root.CONTENT015_VIEW,S=root.SHORT_CASES,EV=root.ECHO_VIEW,D=root.STORY;
 if(!E||!C||!V||!S||!EV||!D)return;
 D.release='0.39.0';
 if(root.CONTENT015_DATA)root.CONTENT015_DATA.release='0.50.0';

 // 0.37 — receiving a follow-up is basic world continuity. The old paid feature
 // remains only as a convenient collected archive of optional after-stories.
 const after=(root.ECHO_DATA?.skills||[]).find(k=>k.id==='aftertone');
 if(after){after.name='후속 기록 모아보기';after.description='이미 도착한 후속 연락과 사건 뒤의 짧은 기록을 한 화면에서 다시 모아 본다. 실제 연락을 받는 것 자체에는 포인트가 필요하지 않다.';}
 D.names.chaerin='이채린';

 // New authored office nodes do not change the theater case facts.
 root.ECHO_DATA.nodes.spare_key_reply={id:'spare_key_reply',title:'두 번째 열쇠 · 이틀 뒤',bg:'echo_desk',voice:'현재 · 받은 메시지',lines:[
  {who:'n',text:'이틀 뒤, 두 번째 열쇠 의뢰인 이채린에게서 짧은 메시지가 왔다.'},
  {who:'chaerin',text:'관리실 보관함 B-12에서 제 우편물도 찾았어요. 서랍을 누가 열었는지 이제 알겠어요.'},
  {who:'chaerin',text:'전 세입자에게는 괜히 의심해서 미안했다고 연락했습니다. 기록을 먼저 봤어야 했네요.'},
  {who:'haeon',text:'확인된 경위만 종결 기록에 덧붙이겠습니다. 추측했던 부분까지 사실처럼 남기지는 않겠습니다.'},
  {who:'n',text:'메시지를 짧은 의뢰 파일의 마지막 장에 붙여 두었다.'}
 ],effect:'hub'};
 root.ECHO_DATA.nodes.meta038={id:'meta038',title:'발신인 없는 봉투',bg:'echo_desk',lines:[
  {who:'n',text:'짧은 의뢰 기록을 정리하다 사건함 사이에서 낡은 봉투 하나가 떨어졌다.'},
  {who:'n',text:'봉투에는 내 이름만 적혀 있었다. 발신인도, 우편 소인도 없었다.'},
  {who:'n',text:'안에는 형사 시절 종결된 사건 기록 한 장의 복사본이 들어 있었다. 사건번호 일부는 검게 지워져 있었다.'},
  {who:'n',text:'종결 처리 시각과 마지막 현장 기록 사이, 설명 없이 비어 있는 시간이 표시돼 있었다.'},
  {who:'haeon',text:'이 표시를 내가 했던가.'},
  {who:'n',text:'봉투 뒷면에는 내가 예전 수첩에서만 쓰던 두 글자가 적혀 있었다. 잔향.'},
  {who:'n',text:'지금 가진 자료만으로는 누가 보냈는지, 왜 이 기록을 다시 꺼냈는지 알 수 없다. 봉투는 개인 사건함에 따로 넣었다.'}
 ],effect:'hub'};

 const metaAvailable=s=>!!s?.echo?.settled&&(!!C.mini(s)?.complete||!!S.state(s,'spare_key')?.complete);
 const oldInspect=E.inspect;
 E.inspect=function(s,id){if(id==='meta038'){if(!metaAvailable(s))throw Error('아직 확인할 개인 기록이 없습니다.');E.start(s,'meta038');return;}return oldInspect(s,id);};

 const oldCorrespondence=C.correspondence;
 C.correspondence=function(s,id){if(id==='chaerin'){if(!S.state(s,'spare_key')?.complete)throw Error('아직 도착하지 않은 연락입니다.');E.start(s,'spare_key_reply');return;}return oldCorrespondence(s,id);};

 function hasReadNode(g,node){return (g.echo?.read||[]).some(id=>id.startsWith(node+'/'));}
 function followups(g){
  const l=C.mini(g),sc=S.state(g,'spare_key'),x=g.echo,out=[];
  if(x?.reported)out.push({id:'seoa',node:'report015_reply',name:'윤서아',case:'마지막 상영'});
  if(l?.complete)out.push({id:'yujin',node:'letter015_reply',name:'차유진',case:'늦게 도착한 초대'});
  if(sc?.complete)out.push({id:'chaerin',node:'spare_key_reply',name:'이채린',case:'두 번째 열쇠'});
  return out.map(v=>({...v,read:hasReadNode(g,v.node)}));
 }
 function statusLetter(g){const q=C.mini(g);return q?.complete?'완료':q?.accepted?'진행 중':'대기';}
 function statusSpare(g){const q=S.state(g,'spare_key');return q?.complete?'완료':q?.accepted?'진행 중':'대기';}
 function commissionInbox(ctx){const {g,btn}=ctx,l=C.mini(g),sc=S.state(g,'spare_key');if(!g.echo?.settled)return '';
  const ls=statusLetter(g),ss=statusSpare(g),active=[ls,ss].filter(x=>x==='진행 중').length,pending=[ls,ss].filter(x=>x==='대기').length;
  const subtitle=active?`진행 중 ${active}건 · 나머지는 그대로 보관됩니다.`:pending===2?'두 의뢰가 함께 들어와 있습니다. 먼저 보고 싶은 것을 고르세요.':pending?'아직 시작하지 않은 의뢰가 남아 있습니다.':'현재 들어온 짧은 의뢰를 모두 정리했습니다.';
  const card=(kind,title,desc,status,button)=>`<article class="commission-choice-v039" data-status="${status}"><div><small>${kind} · ${status}</small><strong>${title}</strong><p>${desc}</p></div>${button}</article>`;
  return `<section class="commission-inbox-v039"><header><div><span class="eyebrow">의뢰함 · 직접 선택</span><h3>들어온 의뢰</h3></div><p>${subtitle}</p></header><div class="commission-choice-grid-v039">${card('전화 기록','늦게 도착한 초대','도착일과 실제 전달일을 기록으로 구분한다.',ls,btn(l.complete?'기록 보기':l.accepted?'이어가기':'이 의뢰부터 확인','echo-page','data-id="letter015"',l.accepted&&!l.complete?'primary':'secondary'))}${card('생활 기록','두 번째 열쇠','열쇠 반납·잠금 교체·출입 기록을 맞춘다.',ss,btn(sc.complete?'기록 보기':sc.accepted?'이어가기':'이 의뢰부터 확인','shortcase-open','data-id="spare_key"',sc.accepted&&!sc.complete?'primary':'secondary'))}</div></section>`;
 }
 function nextAction(ctx){const {g,btn}=ctx,x=g.echo,l=C.mini(g),sc=S.state(g,'spare_key');if(!x?.settled)return '';
  const fs=followups(g),unread=fs.filter(v=>!v.read),metaUnread=metaAvailable(g)&&!hasReadNode(g,'meta038');let title,copy,button;
  if(l?.accepted&&!l.complete){title='늦게 도착한 초대를 이어서 확인';copy='읽은 기록과 해결한 질문은 그대로 남아 있습니다.';button=btn('의뢰 이어가기 →','echo-page','data-id="letter015"','primary');}
  else if(sc?.accepted&&!sc.complete){title='두 번째 열쇠를 이어서 확인';copy='현재까지 읽은 기록과 추리 결과를 유지한 채 돌아갑니다.';button=btn('의뢰 이어가기 →','shortcase-open','data-id="spare_key"','primary');}
  else if(unread.length){title=`새 후속 연락 ${unread.length}건`;copy=`${unread.map(v=>v.name).join(' · ')}에게서 사건 뒤 연락이 도착했습니다.`;button=btn('연락 확인 →','echo-page','data-id="correspondence015"','primary');}
  else if(metaUnread){title='사건함 사이에서 발견한 낡은 봉투';copy='현재 의뢰와 별개인 정해온 개인 기록입니다. 정답이나 새 사건 단서를 자동으로 주지는 않습니다.';button=btn('봉투 확인 →','echo-inspect','data-id="meta038"','primary');}
  else {title='다음에 확인할 의뢰를 고른다';copy='짧은 의뢰는 무작위로 정해지지 않습니다. 들어온 의뢰 중 원하는 순서로 시작할 수 있습니다.';button=btn('의뢰함 보기 →','echo-page','data-id="cases"','primary');}
  return `<section class="rhythm-strip-v039"><div><span class="eyebrow">지금 이어갈 일</span><h3>${title}</h3><p>${copy}</p></div>${button}</section>`;
 }
 function followupStrip(ctx){const {g,btn}=ctx,fs=followups(g);if(!fs.length)return '';const unread=fs.filter(v=>!v.read).length;return `<section class="followup-strip-v039"><div><span class="eyebrow">사건 뒤의 시간<span class="followup-count-v039">${unread}</span></span><h3>${unread?'읽지 않은 후속 연락이 있습니다.':'도착한 후속 연락을 다시 볼 수 있습니다.'}</h3><p>${fs.map(v=>`${v.name} · ${v.case}`).join(' / ')}</p></div>${btn(unread?'새 연락 확인':'후속 연락 열기','echo-page','data-id="correspondence015"','secondary')}</section>`;}
 function metaStrip(ctx){const {g,btn}=ctx;if(!metaAvailable(g))return '';const read=hasReadNode(g,'meta038');return `<section class="meta-thread-v039"><div><span class="meta-clue-tag-v039">정해온 개인 기록</span><h3>발신인 없는 봉투</h3><p>${read?'형사 시절 종결 기록의 일부가 왜 다시 사무소에 왔는지 아직 알 수 없다.':'짧은 의뢰를 정리하던 중, 현재 사건들과 별개인 오래된 기록이 발견됐다.'}</p></div>${btn(read?'다시 읽기':'확인하기','echo-inspect','data-id="meta038"',read?'secondary':'primary')}</section>`;}

 const oldContentPage=V.page;
 V.page=function(ctx){const r=oldContentPage(ctx);if(!r)return r;const g=ctx.g;if(g.echo?.view==='correspondence015'&&S.state(g,'spare_key')?.complete){
   const read=hasReadNode(g,'spare_key_reply');const extra=`<article class="${read?'followup-read-v039':'followup-new-v039'}"><span class="letter-seal">C</span><span class="eyebrow">두 번째 열쇠</span><h3>이채린의 메시지</h3><p>관리실 보관함을 확인한 뒤 도착한 짧은 연락이다.</p>${ctx.btn(read?'다시 읽기':'새 메시지 읽기','correspondence015-read','data-id="chaerin"','secondary')}</article>`;
   r.content=r.content.replace('</div></section>',extra+'</div></section>');
  }return r;};

 const oldView=EV.html;
 EV.html=function(ctx){let raw=oldView(ctx),g=ctx.g,x=g.echo;if(!x)return raw;
  raw=raw.replace(/>의뢰 목록</g,'>의뢰함<');
  if(x.view==='hub'&&x.settled){
   raw=raw.replace('class="echo-shell echo-workspace-shell"','class="echo-shell echo-workspace-shell v039-settled"');
   const insert=nextAction(ctx)+commissionInbox(ctx)+followupStrip(ctx)+metaStrip(ctx);
   raw=raw.replace('<section class="echo-hub-actions">','<section class="echo-hub-actions">'+insert);
  }
  if(x.view==='cases'&&x.settled){
   raw=raw.replace('<div class="echo-case-library">','<div class="echo-case-library"><div class="case-inbox-note-v039"><b>의뢰는 무작위로 배정되지 않습니다.</b> 현재 들어온 짧은 의뢰를 확인한 뒤, 원하는 순서로 시작할 수 있습니다. 하나를 먼저 골라도 다른 의뢰는 사라지지 않습니다.</div>');
  }
  return raw;
 };
 root.RELEASE039={metaAvailable,followups,hasReadNode};
})(typeof window!=='undefined'?window:globalThis);
