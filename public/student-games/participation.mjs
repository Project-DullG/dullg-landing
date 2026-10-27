const GAME_NAMES=Object.freeze({
  'island-snap':'오징어 호박엿 명이나물 독도 성인봉',
  'missing-log':'울릉도: 사라진 항해일지',
  'island-market':'섬마을 장터'
});
const GAME_IDS=Object.keys(GAME_NAMES);
const API='/api/student-games/gallery';
const validGame=value=>GAME_IDS.includes(value);
const countFormat=new Intl.NumberFormat('ko-KR');
export function loginURL(gameId){
  const pick=validGame(gameId)?gameId:GAME_IDS[0];
  return '/login?next='+encodeURIComponent('/student-games/index.html?participate=1&pick='+pick);
}
function cleanCheer(value){
  if(!value||typeof value.id!=='string'||typeof value.nickname!=='string'||typeof value.body!=='string'||typeof value.createdAt!=='string'||typeof value.updatedAt!=='string')return null;
  return {id:value.id,nickname:value.nickname,body:value.body,createdAt:value.createdAt,updatedAt:value.updatedAt,isMine:value.isMine===true};
}
export function validateSnapshot(value){
  if(!value||typeof value.signedIn!=='boolean'||!Number.isSafeInteger(value.totalVotes)||value.totalVotes<0)throw new Error('집계 응답을 확인하지 못했습니다.');
  if(value.myVote!==null&&!validGame(value.myVote))throw new Error('내 투표 응답을 확인하지 못했습니다.');
  if(value.signedIn&&(typeof value.accountKey!=='string'||!value.accountKey))throw new Error('로그인 상태를 확인하지 못했습니다.');
  const counts={},cheers={},mine={};
  for(const id of GAME_IDS){
    const count=value.counts?.[id];
    if(!Number.isSafeInteger(count)||count<0||!Array.isArray(value.cheers?.[id]))throw new Error('집계 응답을 확인하지 못했습니다.');
    counts[id]=count;
    cheers[id]=value.cheers[id].map(cleanCheer).filter(Boolean).slice(0,6);
    mine[id]=value.signedIn?cleanCheer(value.mine?.[id]):null;
  }
  const total=GAME_IDS.reduce((sum,id)=>sum+counts[id],0);
  if(!Number.isSafeInteger(total)||total!==value.totalVotes)throw new Error('집계 합계를 확인하지 못했습니다.');
  return {counts,totalVotes:value.totalVotes,myVote:value.signedIn?value.myVote:null,signedIn:value.signedIn,accountKey:value.signedIn?value.accountKey:null,cheers,mine};
}
class ApiError extends Error{
  constructor(message,status=0,retryAfter=0){super(message);this.status=status;this.retryAfter=retryAfter;}
}

export function initParticipation({document:doc=globalThis.document,window:win=globalThis.window,fetch:fetcher=globalThis.fetch}={}){
  const root=doc?.getElementById('vote');
  if(!root)return null;
  const el=id=>doc.getElementById(id);
  const voteButtons=[...doc.querySelectorAll('[data-vote-game]')];
  const countNodes=[...doc.querySelectorAll('[data-vote-count]')];
  const query=new URLSearchParams(win.location.search);
  const selected=validGame(query.get('pick'))?query.get('pick'):GAME_IDS[0];
  const state={snapshot:null,status:'loading',busy:false,reading:false,unknown:false,selected,drafts:new Map(),deleteArmed:false,notice:'실제 투표와 응원을 불러오고 있습니다.',error:false,lastRead:0,cooldownUntil:0};
  let readController=null,readVersion=0,cooldownTimer=null,destroyed=false;
  const ui={total:el('gallery-total'),account:el('gallery-account-state'),login:el('gallery-login'),logout:el('gallery-logout'),voteState:el('gallery-vote-state'),notice:el('participation-notice'),retry:el('participation-retry'),select:el('cheer-game'),list:el('cheer-list'),signin:el('cheer-signin-note'),form:el('cheer-form'),formTitle:el('cheer-form-title'),nickname:el('cheer-nickname'),body:el('cheer-body'),counter:el('cheer-body-count'),submit:el('cheer-submit'),delete:el('cheer-delete'),confirm:el('cheer-delete-confirm'),yes:el('cheer-delete-yes'),no:el('cheer-delete-no')};
  ui.select.value=selected;
  function draftFor(id){
    if(!state.drafts.has(id))state.drafts.set(id,{nickname:'',body:'',dirty:false});
    return state.drafts.get(id);
  }
  function setNotice(text,error=false){state.notice=text;state.error=error;ui.notice.textContent=text;ui.notice.parentElement.dataset.error=String(error);}
  function clearPersonal(){
    for(const draft of state.drafts.values())draft.dirty=true;
    if(state.snapshot)state.snapshot={...state.snapshot,signedIn:false,accountKey:null,myVote:null,mine:Object.fromEntries(GAME_IDS.map(id=>[id,null])),cheers:Object.fromEntries(GAME_IDS.map(id=>[id,state.snapshot.cheers[id].map(item=>({...item,isMine:false}))]))};
    state.deleteArmed=false;
  }
  function applySnapshot(snapshot){
    const previous=state.snapshot?.accountKey;
    if(previous&&previous!==snapshot.accountKey){
      for(const draft of state.drafts.values())draft.dirty=true;
      state.deleteArmed=false;
      setNotice('로그인 계정이 바뀌었습니다. 내 선택과 응원을 확인한 뒤 다시 참여해 주세요.');
    }
    state.snapshot=snapshot;state.status='ready';state.unknown=false;state.lastRead=Date.now();
  }
  function make(tag,className,text){const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function shortDate(value){
    const date=new Date(value);
    if(!Number.isFinite(date.getTime()))return '';
    return new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
  }
  function renderCheers(){
    const snapshot=state.snapshot;
    ui.list.setAttribute('aria-busy',String(state.reading||!snapshot&&state.status==='loading'));
    ui.list.replaceChildren();
    if(!snapshot){ui.list.append(make('p','cheer-empty',state.status==='error'?'응원을 불러오지 못했습니다. 다시 불러오기를 눌러 주세요.':'응원을 불러오는 중입니다.'));return;}
    const items=snapshot.cheers[state.selected];
    if(!items.length){ui.list.append(make('p','cheer-empty','아직 공개된 응원이 없습니다. 이 작품의 첫 응원을 남겨보세요.'));return;}
    for(const item of items){
      const article=make('article','cheer-item');
      const head=make('div','cheer-item-head');
      const name=make('h5','',item.nickname);
      if(snapshot.signedIn&&item.isMine)name.append(make('span','cheer-mine','내 응원'));
      const time=make('time','',shortDate(item.updatedAt));time.dateTime=item.updatedAt;
      head.append(name,time);
      article.append(head,make('p','cheer-item-body',item.body));
      ui.list.append(article);
    }
  }
  function renderEditor(){
    const snapshot=state.snapshot;
    const signedIn=snapshot?.signedIn===true;
    const own=signedIn?snapshot.mine[state.selected]:null;
    const draft=draftFor(state.selected);
    if(!draft.dirty){draft.nickname=own?.nickname??'';draft.body=own?.body??'';}
    if(ui.nickname.value!==draft.nickname)ui.nickname.value=draft.nickname;
    if(ui.body.value!==draft.body)ui.body.value=draft.body;
    ui.form.hidden=!signedIn;
    ui.signin.hidden=signedIn;
    ui.signin.textContent=snapshot?'응원은 로그인 후 남길 수 있습니다. 공개된 응원은 누구나 읽을 수 있어요.':'참여 상태를 확인한 뒤 응원을 남길 수 있습니다.';
    ui.formTitle.textContent=own?'내 응원 수정하기':'내 응원 남기기';
    ui.submit.textContent=state.busy?'처리 중':own?'응원 수정하기':'응원 남기기';
    ui.counter.textContent=Array.from(draft.body).length+' / 140자';
    const unavailable=state.busy||state.reading||state.status!=='ready'||state.unknown;
    ui.nickname.disabled=state.busy;ui.body.disabled=state.busy;
    ui.submit.disabled=unavailable||Date.now()<state.cooldownUntil;
    ui.delete.hidden=!own;ui.delete.disabled=unavailable;
    ui.confirm.hidden=!state.deleteArmed||!own;
    ui.yes.disabled=unavailable;ui.no.disabled=state.busy;
    ui.select.disabled=state.busy;
  }
  function render(){
    const snapshot=state.snapshot;
    for(const node of countNodes){
      const id=node.dataset.voteCount;
      node.textContent=snapshot?countFormat.format(snapshot.counts[id]):'—';
      const label=doc.querySelector('[data-count-label="'+id+'"]');
      label?.setAttribute('aria-label',snapshot?GAME_NAMES[id]+' '+countFormat.format(snapshot.counts[id])+'표':'득표 수를 불러오는 중');
    }
    for(const button of voteButtons){
      const id=button.dataset.voteGame,chosen=snapshot?.myVote===id;
      button.setAttribute('aria-pressed',String(chosen));
      button.disabled=state.busy||state.reading||state.status!=='ready'||state.unknown||!snapshot;
      button.textContent=!snapshot?(state.status==='error'?'불러오기 필요':'불러오는 중'):!snapshot.signedIn?'로그인하고 투표':chosen?'내가 선택한 작품':snapshot.myVote?'이 작품으로 변경':'이 작품에 투표';
      button.setAttribute('aria-label',GAME_NAMES[id]+', '+button.textContent);
    }
    ui.total.textContent=snapshot?'모인 마음 '+countFormat.format(snapshot.totalVotes)+'표':state.status==='error'?'집계를 불러오지 못했습니다':'집계를 불러오는 중';
    ui.account.textContent=!snapshot?'참여 상태를 확인하고 있습니다.':snapshot.signedIn?'로그인한 계정으로 참여하고 있습니다.':'로그인하면 투표와 응원을 남길 수 있습니다.';
    ui.login.href=loginURL(state.selected);ui.login.hidden=!snapshot||snapshot.signedIn;
    ui.logout.hidden=!snapshot?.signedIn;
    ui.voteState.textContent=!snapshot?'':snapshot.myVote?'내가 선택한 작품: '+GAME_NAMES[snapshot.myVote]:snapshot.signedIn?'아직 선택한 작품이 없습니다. 위의 포스터에서 한 작품을 골라주세요.':'위 포스터에서 실제 투표 현황을 볼 수 있습니다.';
    ui.retry.hidden=state.status!=='error'&&!state.unknown;
    ui.retry.disabled=state.busy||state.reading;
    setNotice(state.notice,state.error);
    renderCheers();renderEditor();
  }
  async function request(method,body,signal){
    const controller=new AbortController();
    const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
    const timeout=win.setTimeout(()=>controller.abort(),method==='POST'?15000:12000);
    try{
      const response=await fetcher(API,{method,credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
      let data;try{data=await response.json();}catch{throw new ApiError('응답을 확인하지 못했습니다.',response.ok?0:response.status);}
      if(!response.ok)throw new ApiError(typeof data.error==='string'?data.error:'요청을 처리하지 못했습니다.',response.status,Number(response.headers.get('Retry-After'))||0);
      return {snapshot:validateSnapshot(data),notice:typeof data.notice==='string'?data.notice:''};
    }finally{win.clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
  }
  async function refresh({silent=false,afterWrite=false}={}){
    if(destroyed||state.busy&&!afterWrite)return false;
    readController?.abort();readController=new AbortController();
    const version=++readVersion;
    state.reading=true;
    if(!silent)setNotice(state.snapshot?'최신 집계와 응원을 확인하고 있습니다.':'실제 투표와 응원을 불러오고 있습니다.');
    render();
    try{
      const result=await request('GET',null,readController.signal);
      if(version!==readVersion||destroyed)return false;
      const previousAccount=state.snapshot?.accountKey;
      applySnapshot(result.snapshot);
      if(!previousAccount||previousAccount===result.snapshot.accountKey){
        if(!silent&&!afterWrite)setNotice('집계와 응원을 불러왔습니다.');
      }
      return true;
    }catch(error){
      if(version!==readVersion||destroyed)return false;
      state.status='error';
      if(error.status===401||error.status===409)clearPersonal();
      setNotice(afterWrite?'요청 처리 결과를 아직 확인하지 못했습니다. 다시 불러와 내 선택과 응원을 확인해 주세요.':'집계와 응원을 불러오지 못했습니다. 작품 소개와 게임은 계속 이용할 수 있습니다.',true);
      return false;
    }finally{
      if(version===readVersion){state.reading=false;render();}
    }
  }
  function cooldown(seconds){
    if(seconds<=0)return;
    state.cooldownUntil=Date.now()+Math.min(seconds,300)*1000;
    win.clearTimeout(cooldownTimer);
    cooldownTimer=win.setTimeout(()=>{state.cooldownUntil=0;renderEditor();},Math.min(seconds,300)*1000+20);
  }
  async function write(action,gameId,fields={}){
    const snapshot=state.snapshot;
    if(state.busy||state.reading||state.status!=='ready'||state.unknown||!snapshot?.signedIn)return;
    readVersion++;readController?.abort();state.reading=false;
    state.busy=true;state.deleteArmed=false;
    setNotice(action==='vote'?'내 선택을 저장하고 있습니다.':action==='cheer'?'응원을 저장하고 있습니다.':'내 응원을 삭제하고 있습니다.');render();
    const body={action,gameId,accountKey:snapshot.accountKey,...fields};
    try{
      const result=await request('POST',body);
      if(action==='cheer'||action==='delete-cheer'){
        const draft=draftFor(gameId);draft.dirty=false;
        if(action==='delete-cheer'){draft.nickname='';draft.body='';}
      }
      applySnapshot(result.snapshot);
      setNotice(result.notice||(action==='vote'?'내 선택을 저장했습니다.':action==='cheer'?'응원을 저장했습니다.':'내 응원을 삭제했습니다.'));
    }catch(error){
      if(error.status===401||error.status===409){
        clearPersonal();state.status='loading';
        setNotice('로그인 상태가 바뀌었습니다. 최신 상태를 확인하고 있습니다.');render();
        const ok=await refresh({silent:true,afterWrite:true});
        if(ok)setNotice('로그인 상태를 다시 확인했습니다. 내 선택과 응원을 확인한 뒤 다시 눌러 주세요.',true);
      }else if(error.status>=400&&error.status<500){
        if(error.status===429)cooldown(error.retryAfter);
        setNotice(error.message,true);
      }else{
        state.unknown=true;
        setNotice('응답이 늦어 처리 결과를 다시 확인하고 있습니다. 잠시 기다려 주세요.');render();
        const ok=await refresh({silent:true,afterWrite:true});
        if(ok){
          const current=state.snapshot;
          const sameAccount=current.accountKey===body.accountKey;
          const own=current.mine[gameId];
          const confirmed=sameAccount&&(action==='vote'?current.myVote===gameId:action==='delete-cheer'?!own:own?.nickname===fields.nickname&&own?.body===fields.body);
          if(confirmed){
            if(action==='cheer'||action==='delete-cheer')draftFor(gameId).dirty=false;
            setNotice(action==='vote'?'내 선택이 저장된 것을 확인했습니다.':action==='cheer'?'응원이 저장된 것을 확인했습니다.':'내 응원이 삭제된 것을 확인했습니다.');
          }else setNotice('최신 상태를 다시 불러왔습니다. 내 선택과 응원을 확인한 뒤 다시 참여해 주세요.',true);
        }
      }
    }finally{state.busy=false;render();}
  }
  for(const button of voteButtons)button.addEventListener('click',()=>{
    const id=button.dataset.voteGame;
    if(!state.snapshot||state.busy||state.reading)return;
    state.selected=id;ui.select.value=id;state.deleteArmed=false;render();
    if(!state.snapshot.signedIn){win.location.assign(loginURL(id));return;}
    if(state.snapshot.myVote===id){setNotice('이미 이 작품을 선택했습니다. 다른 작품을 누르면 표가 옮겨갑니다.');return;}
    void write('vote',id);
  });
  ui.select.addEventListener('change',()=>{state.selected=validGame(ui.select.value)?ui.select.value:GAME_IDS[0];state.deleteArmed=false;render();});
  function saveDraft(){const draft=draftFor(state.selected);draft.nickname=ui.nickname.value;draft.body=ui.body.value;draft.dirty=true;ui.counter.textContent=Array.from(draft.body).length+' / 140자';}
  ui.nickname.addEventListener('input',saveDraft);ui.body.addEventListener('input',saveDraft);
  ui.form.addEventListener('submit',event=>{
    event.preventDefault();saveDraft();
    const draft=draftFor(state.selected),nickname=draft.nickname.normalize('NFKC').replace(/\s+/gu,' ').trim(),body=draft.body.normalize('NFKC').replace(/\s+/gu,' ').trim();
    if(!nickname||Array.from(nickname).length>20){setNotice('공개할 닉네임을 1~20자로 적어 주세요.',true);ui.nickname.focus();return;}
    if(!/^[\p{L}\p{N}_ .-]+$/u.test(nickname)){setNotice('닉네임에는 글자, 숫자, 공백, 밑줄, 마침표와 하이픈을 쓸 수 있습니다.',true);ui.nickname.focus();return;}
    if(!body||Array.from(body).length>140){setNotice('응원을 1~140자로 적어 주세요.',true);ui.body.focus();return;}
    if(Date.now()<state.cooldownUntil)return;
    void write('cheer',state.selected,{nickname,body});
  });
  ui.delete.addEventListener('click',()=>{state.deleteArmed=true;renderEditor();ui.yes.focus();});
  ui.no.addEventListener('click',()=>{state.deleteArmed=false;renderEditor();ui.delete.focus();});
  ui.yes.addEventListener('click',()=>void write('delete-cheer',state.selected));
  ui.retry.addEventListener('click',()=>void refresh());
  const onFocus=()=>{if(Date.now()-state.lastRead>1500&&!state.busy&&!state.reading)void refresh({silent:true});};
  const onPageShow=event=>{if(event.persisted)onFocus();};
  win.addEventListener('focus',onFocus);win.addEventListener('pageshow',onPageShow);
  render();
  void refresh().then(ok=>{
    if(query.get('participate')!=='1')return;
    const target=voteButtons.find(button=>button.dataset.voteGame===selected);
    if(target){target.closest('.gallery-entry')?.setAttribute('data-returned','true');win.requestAnimationFrame(()=>{target.scrollIntoView({block:'center',behavior:'auto'});target.focus({preventScroll:true});});}
    if(ok)setNotice(state.snapshot.signedIn?'작품을 확인한 뒤 투표 버튼을 눌러 주세요.':'로그인하면 선택한 작품에 투표하고 응원을 남길 수 있습니다.');
  });
  return {refresh,getState:()=>state,destroy(){destroyed=true;readVersion++;readController?.abort();win.clearTimeout(cooldownTimer);win.removeEventListener('focus',onFocus);win.removeEventListener('pageshow',onPageShow);}};
}
if(typeof document!=='undefined')initParticipation();
