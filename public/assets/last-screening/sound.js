/* One sound controller: independent music / ambience / effects / TTS channels.
 * BGM policy is pure (bgm.js); playback and output protection live here.
 * Browser TTS is never presented as the original evidence recording.
 */
(function(root){'use strict';
 let ctx=null,unlocked=false,settings={...root.STORAGE.defaults},place='title',phase='night',decision={key:null,paused:false};
 let ambientNodes=[],ambientMaster=null,ambientKey='',lastError='',muted=false,paused=false;
 let speechToken=0,speechKey='',speechKind=null,speechPending=false,speechStarted=false,speechDeadline=0,duckUntil=0;
 const reported=new Set();
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0)),now=()=>performance.now();
 function warn(key,message){
  lastError=message;if(reported.has(key))return;reported.add(key);
  root.dispatchEvent(new CustomEvent('game-audio-warning',{detail:{message}}));
 }
 const mixer=new root.BgmMixer({onError:(key,error,blocked)=>warn('music:'+key+(blocked?':blocked':''),blocked?'음악 재생이 차단되었습니다. 소리 켜기를 눌러 다시 시도해 주세요.':'일부 배경 음악을 읽지 못했습니다. 해당 곡 없이 게임을 계속할 수 있습니다.')});
 function context(){
  if(!ctx){const Constructor=root.AudioContext||root.webkitAudioContext;if(!Constructor)throw Error('AudioContext unsupported');ctx=new Constructor();}
  return ctx;
 }
 function resumeContext(){try{const c=context();if(c.state==='suspended')c.resume().catch(()=>warn('context','효과음·환경음을 활성화하지 못했습니다. 음악과 게임 진행은 별도로 유지됩니다.'));}catch(e){warn('context','이 기기에서는 효과음·환경음을 활성화할 수 없습니다.');}}
 function stopAmbient(){for(const n of ambientNodes){try{n.stop?.();}catch(e){}try{n.disconnect?.();}catch(e){}}ambientNodes=[];ambientMaster=null;ambientKey='';}
 function ambient(){
  if(!unlocked||place==='title'){stopAmbient();return;}
  const key=place;
  if(key!==ambientKey){stopAmbient();ambientKey=key;
   if(!settings.ambientVolume||paused||muted)return;
   try{const c=context();ambientMaster=c.createGain();ambientMaster.gain.value=0;ambientMaster.connect(c.destination);ambientNodes.push(ambientMaster);
    for(const [f,amp] of (place==='projection'?[[82,.8],[164,.14]]:[[98,.22],[196,.08]])){
     const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=amp;o.connect(g).connect(ambientMaster);o.start();ambientNodes.push(o,g);
    }
   }catch(e){warn('ambient','환경음을 재생하지 못했습니다. 화면과 전사로 계속 진행할 수 있습니다.');stopAmbient();return;}
  }
  // Recreate after a previously zero-volume/paused entry, not on every line.
  if(!ambientMaster&&!paused&&!muted&&settings.ambientVolume){ambientKey='';ambient();return;}
  if(ambientMaster){const t=ctx.currentTime,target=paused||muted||speechKind==='evidence'?0:clamp(settings.ambientVolume)*.035;
   ambientMaster.gain.cancelScheduledValues(t);
   if(speechKind==='evidence'||muted)ambientMaster.gain.setValueAtTime(target,t);
   else ambientMaster.gain.setTargetAtTime(target,t,.05);
  }
 }
 function factor(){return speechKind==='evidence'?0:((speechKind==='dialogue'||now()<duckUntil)?0.3:1);}
 function updateOutput(){
  const f=factor(),fullMute=!!settings.audioMuted;
  muted=fullMute||!!(settings.unfocusedMute&&document.hidden);paused=!!decision.paused||!!(settings.unfocusedMute&&document.hidden);
  const suspend=paused||fullMute||!settings.musicVolume;
  mixer.setOutput(clamp(settings.musicVolume)*f,{suspended:suspend,immediate:fullMute||!settings.musicVolume||f===0,fadeMs:f<1?150:480});
  ambient();
 }
 function sync(nextPlace,nextPhase,c,resolved){
  place=nextPlace;phase=nextPhase;settings={...settings,...c};
  decision=resolved||{key:place==='title'?'bgm_01_title':(['epilogue','finished'].includes(phase)?'music_return':'bgm_02_investigation'),paused:false};
  mixer.request(decision.key);
  const stop=decision.paused||settings.audioMuted||(settings.unfocusedMute&&document.hidden);
  if(stop&&(speechKind||speechPending))stopSpeech();
  updateOutput();
 }
 function unlock(){unlocked=true;resumeContext();mixer.unlock();updateOutput();}
 function hasKoreanVoice(){try{return (root.speechSynthesis?.getVoices()||[]).some(v=>/^ko/i.test(v.lang));}catch(e){return false;}}
 function clearSpeech(token,immediate=false){
  if(token!==speechToken)return;
  const old=speechKind;speechKind=null;speechPending=false;speechStarted=false;speechKey='';speechDeadline=0;
  if(old==='dialogue')duckUntil=immediate?0:now()+400;
  else if(old==='evidence')duckUntil=0;
  updateOutput();
 }
 function stopSpeech(){
  const old=speechKind;speechToken++;speechKey='';speechKind=null;speechPending=false;speechStarted=false;speechDeadline=0;
  if(old==='dialogue')duckUntil=now()+400;else if(old==='evidence')duckUntil=0;
  try{root.speechSynthesis?.cancel();}catch(e){}updateOutput();
 }
 function speak(text,{enabled=false,rate=1,key='',volume=.8,channel='dialogue'}={}){
  if(!enabled||!text||muted||paused||!unlocked||volume<=0||!hasKoreanVoice())return false;
  if(key&&key===speechKey&&(speechPending||speechStarted))return true;
  stopSpeech();const token=++speechToken; speechKind=channel==='evidence'?'evidence':'dialogue';speechKey=key;speechPending=true;speechDeadline=now()+8000;
  updateOutput(); // Protect evidence speech immediately, independent of BGM debounce.
  try{
   const u=new root.SpeechSynthesisUtterance(String(text));u.lang='ko-KR';u.voice=root.speechSynthesis.getVoices().find(v=>/^ko/i.test(v.lang));u.rate=Math.min(1.2,Math.max(.8,rate));u.volume=clamp(volume);
   u.onstart=()=>{if(token!==speechToken)return;speechPending=false;speechStarted=true;speechDeadline=now()+Math.max(15000,String(text).length*600);updateOutput();};
   u.onend=()=>clearSpeech(token);u.onerror=e=>{if(token!==speechToken)return;clearSpeech(token,true);if(!['canceled','interrupted'].includes(e.error))warn('speech','읽어주기가 중단되었습니다. 전사를 직접 읽을 수 있습니다.');};
   root.speechSynthesis.speak(u);return true;
  }catch(e){clearSpeech(token,true);warn('speech','읽어주기를 시작하지 못했습니다. 전사를 직접 읽을 수 있습니다.');return false;}
 }
 // Non-diegetic UI cues. They never stand in for a forensic/scene sound.
 let lastCue=null;
 function play(kind,volume){
  if(!unlocked||muted||paused||volume<=0)return;
  try{
   const c=context();if(c.state!=='running')return;const t=c.currentTime;
   const recipes={click:{notes:[490],wave:'triangle',gain:.018,length:.065,step:0},evidence:{notes:[392,588],wave:'sine',gain:.042,length:.27,step:.07},solve:{notes:[220,330,440],wave:'triangle',gain:.027,length:.48,step:.055},page:{notes:[],gain:0,length:.12,step:0}};
   const r=recipes[kind]||recipes.click;lastCue={kind,at:Math.round(now())};
   r.notes.forEach((f,i)=>{const at=t+i*r.step,o=c.createOscillator(),g=c.createGain();o.type=r.wave;o.frequency.value=f;
    g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(clamp(volume)*r.gain,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+r.length);
    o.connect(g).connect(c.destination);o.start(at);o.stop(at+r.length+.02);o.onended=()=>{o.disconnect();g.disconnect();};
   });
   if(['evidence','page'].includes(kind)&&c.createBuffer){
    const length=.12,buf=c.createBuffer(1,Math.ceil(c.sampleRate*length),c.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
    const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=buf;f.type='bandpass';f.frequency.value=1600;f.Q.value=.65;g.gain.value=clamp(volume)*.035;
    n.connect(f).connect(g).connect(c.destination);n.start(t);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};
   }
  }catch(e){warn('sfx','일부 효과음을 재생하지 못했습니다. 게임 진행에는 영향이 없습니다.');}
 }

 const timer=setInterval(()=>{
  if(speechDeadline&&now()>speechDeadline){stopSpeech();warn('speech-timeout','읽어주기가 응답하지 않아 중지했습니다. 전사로 확인해 주세요.');}
  if(duckUntil&&now()>=duckUntil){duckUntil=0;updateOutput();}
 },80);
 root.SOUND={unlock,sync,play,speak,stopSpeech,stopAmbient,hasKoreanVoice,
  speaking:()=>speechPending||speechStarted||!!root.speechSynthesis?.speaking,
  status:()=>({...mixer.status(),ambientNodes:ambientNodes.length,ambientGain:ambientMaster?.gain.value||0,koreanVoice:hasKoreanVoice(),error:lastError,lastCue,muted,paused,speechKind,speechPending,duckFactor:factor(),contextState:ctx?.state||'locked'}),
  dispose(){clearInterval(timer);stopSpeech();stopAmbient();mixer.dispose();ctx?.close?.();}
 };
 root.addEventListener('pagehide',()=>{decision={...decision,paused:true};stopSpeech();updateOutput();});
})(window);
