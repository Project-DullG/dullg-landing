/* Presentation only. Authored response decisions are owned by REACTIONS/MODEL. */
(function(root){'use strict';
 const kindLabel={question:'질문',press:'추궁',response:'답변',evidence:'자료 제시',followup:'추가 질문'};
 function flow(g,R){const f=R.flow(g);if(!f)return'';const m=f.mode;const items=[['listen','듣기',m==='reply'||m==='followup'||m==='followup-reply'],['choose',f.reverse?'답하기':'묻기',['choice','reply'].includes(m)],['follow','추가 확인',['followup','followup-reply'].includes(m)]];return `<ol class="reaction-flow" aria-label="대화 진행">${items.map(([id,label,on],i)=>`<li class="${on?'active':''} ${i===0||(['reply','followup','followup-reply'].includes(m)&&i<2)?'done':''}"><span>${i+1}</span>${label}</li>`).join('')}</ol>`;}
 function optionButton(o,n,g,R,esc,btn){
  const count=o.kind==='evidence'?R.interactable(g).length:0;
  const label=o.kind==='evidence'?`자료 제시${count?` · ${count}개`:''}`:o.label;
  const badge=kindLabel[o.style]||kindLabel[o.kind]||'';
  return btn(`<span class="reaction-kind">${esc(badge)}</span><span class="reaction-label">${esc(label)}</span>${o.seen?'<small>전에 들은 답변</small>':''}`,'reaction-choice',`data-id="${o.id}" id="react-${n.id}-${o.id}"`,'reaction-option reaction-'+(o.style||'question')+(o.kind==='evidence'?' evidence-emphasis':'')+(o.kind==='continue'?' continue-response':''));
 }
 function panel({g,esc,btn,phone=false}){
  const R=root.REACTIONS,n=R.node(g);if(!n)return '';
  const f=R.flow(g),m=f?.mode;
  if(!R.pending(g))return `<aside class="questions reaction-aside"><div class="reaction-heading"><span>면담</span><h2>${esc(root.STORY.people[n.npc].name)}의 답변</h2></div>${flow(g,R)}${presentedContext(g,R,esc,btn)}<p class="help-text">${esc(root.MODEL.topic(n.topic).label)}</p>${btn('이 대화 기록','topic-log',`data-id="${n.topic}"`,'small')}${R.notes(g,n.npc).length?btn('더 들은 말','reaction-notes',`data-id="${n.npc}"`,'small'):''}</aside>`;
  const follow=m==='followup',title=follow?'무엇을 더 확인할까?':n.question?'어떻게 답할까?':'어떻게 물을까?',eyebrow=follow?'답변에서 이어 묻기':n.question?'상대의 질문':'내가 할 말';
  const options=R.options(g);
  return `<${phone?'section':'aside'} class="questions reaction-aside ${phone?'phone-reactions':''}" aria-label="대화 중 선택"><div class="reaction-heading"><span>${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>${flow(g,R)}${presentedContext(g,R,esc,btn)}<div class="reaction-options question-list" data-scroll="reaction-${n.id}">${options.map(o=>optionButton(o,n,g,R,esc,btn)).join('')||'<p class="empty">지금 이어서 물을 내용이 없습니다.</p>'}</div><p class="reaction-foot">${btn(follow?'추가 질문 없이 대화 계속 →':'나머지 설명 듣기 →','reaction-choice','data-id="continue"','plain small continue-response')}${btn('기록 보기','reaction-records','','plain small')}</p></${phone?'section':'aside'}>`;
 }
 function notes({g,npc,esc,btn}){
  const notes=root.REACTIONS.notes(g,npc);
  return notes.length?`<section class="reaction-notes"><p class="help-text">상대가 직접 한 말입니다. 사실 여부는 다른 기록과 함께 확인하세요.</p>${notes.map(n=>`<article class="reaction-note"><span class="tag">${esc(root.STORY.people[n.npc].name)}의 진술</span><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p><small>${n.phase==='night'?'사건 당일':'후속 면담'} · ${n.location==='phone'?'전화':esc(root.STORY.places[n.location]?.name||'')}</small><div class="row wrap">${btn('해당 대화 읽기','topic-log',`data-id="${n.topic}"`,'small')}${n.evidence?btn('제시한 원문','evidence',`data-id="${n.evidence}"`,'small'):''}</div></article>`).join('')}</section>`:'<p class="empty">더 물어보고 들은 말은 이곳에 남습니다.</p>';
 }
 function presentedContext(g,R,esc,btn){
  const a=g.dialogue?.reaction,id=a?.evidence;
  if(!id||!g.evidence.includes(id)||!root.STORY.evidence[id])return'';
  const e=root.STORY.evidence[id];
  return `<div class="reaction-presented"><span>제시한 자료</span><strong>${esc(e.name)}</strong>${btn('원문','evidence',`data-id="${id}"`,'plain small')}</div>`;
 }
 function library({g,data,esc,btn}){
  const R=root.REACTIONS,n=R.node(g),allowed=R.interactable(g),selected=allowed.includes(data.evidence)?data.evidence:null,term=(data.search||'').trim();
  const ids=allowed.filter(id=>!term||(root.STORY.evidence[id].name+' '+root.STORY.evidence[id].source+' '+root.STORY.evidence[id].place).includes(term));
  const topic=root.MODEL.topic(n.topic),question=n.question||topic.label;
  const search=allowed.length>=4?`<label class="sr-only" for="reactionSearch">제시 가능한 자료 검색</label><input id="reactionSearch" data-reaction-search maxlength="160" placeholder="자료 제목·출처 검색" value="${esc(data.search||'')}">`:'';
  const cards=ids.map(id=>{const e=root.STORY.evidence[id],viewed=g.viewed.includes(id),on=id===selected;
   return `<article class="reaction-source ${on?'selected':''}" data-source-id="${id}"><div class="reaction-source-head"><div><span class="tag">${esc(e.type)}</span><h3>${esc(e.name)}</h3></div><span class="source-read-state ${viewed?'read':'unread'}">${viewed?'✓ 원문 확인':'원문 미확인'}</span></div><p class="reaction-source-meta">${esc(e.source)} · ${esc(e.place)}</p><div class="row wrap">${btn(viewed?'원문 다시 읽기':'원문 읽기','evidence',`data-id="${id}" id="reaction-read-${id}"`,'small')}${btn(on?'✓ 제시할 자료':'이 자료 선택','reaction-source-select',`data-id="${id}" id="reaction-select-${id}" aria-pressed="${on}"`,on?'small selected':'small')}</div></article>`;
  }).join('')||'<p class="empty">검색 조건에 맞는 자료가 없습니다.</p>';
  let detail='<div class="reaction-empty-selection"><strong>제시할 자료를 고르세요.</strong><p>현재 질문에 실제로 반응이 연결된 보유 자료만 왼쪽에 표시됩니다.</p></div>';
  if(selected){const e=root.STORY.evidence[selected],viewed=g.viewed.includes(selected);detail=`<article class="reaction-selected-source"><span class="eyebrow">제시 전 확인</span><h3>${esc(e.name)}</h3><p class="reaction-source-meta">${esc(e.source)}<br>확인 장소 · ${esc(e.place)}</p>${viewed?`<div class="reaction-known-facts"><h4>이미 확인한 내용</h4>${e.facts.slice(0,2).map(f=>`<p>${esc(f)}</p>`).join('')}</div>`:`<div class="reaction-unread-warning"><strong>원문을 아직 열어보지 않았습니다.</strong><p>바로 제시할 수도 있지만, 먼저 읽으면 무엇을 묻는지 정하기 쉽습니다.</p></div>`}<div class="reaction-selected-actions">${btn(viewed?'원문 다시 읽기':'먼저 원문 읽기','evidence',`data-id="${selected}" id="reaction-selected-read"`,'secondary')}${btn('이 자료를 제시한다','reaction-submit',`id="reactionSubmitMain" aria-label="${esc(e.name)} 제시"`,'primary')}</div></article>`;}
  return `<div class="reaction-library-v020"><header class="reaction-evidence-context"><span>지금 확인하는 말</span><h3>${esc(question)}</h3><p>${esc(root.STORY.people[n.npc].name)}에게 지금 설명을 요구할 수 있는 자료만 골라 두었습니다.</p></header><div class="reaction-library-grid"><section class="reaction-source-browser"><div class="reaction-browser-head"><h3>제시 가능한 자료 <span>${allowed.length}</span></h3>${search}</div><div class="reaction-source-list" data-scroll="reaction-sources">${cards}</div></section><aside class="reaction-selection-pane" aria-live="polite">${detail}</aside></div></div>`;
 }

 root.REACTION_VIEW={panel,notes,library};
})(typeof window!=='undefined'?window:globalThis);
