/* Two-deck HTMLMediaElement mixer: also works without WebAudio/CORS on local files.
 * Async generations, one debounce deadline, and one fade clock; never a third deck.
 * Entire unedited files loop. Loop musicality is NOT certified by this controller.
 */
(function(root){'use strict';
 class BgmMixer{
  constructor({makeAudio=()=>new Audio(),getSrc=k=>root.ASSETS?.[k],now=()=>performance.now(),setTimer=setInterval,clearTimer=clearInterval,onError=()=>{},delayMs=400,fadeMs=2000}={}){
   Object.assign(this,{makeAudio,getSrc,now,onError,delayMs,fadeMs,clearTimer});
   this.slots=[null,null];this.positions={};this.failed=new Set();this.errors=[];this.history=[];
   this.desired=null;this.current=null;this.loading=null;this.fade=null;this.revision=0;this.deadline=0;
   this.unlocked=false;this.suspended=true;this.heldAt=null;this.pauseAt=0;this.output=0;this.target=0;this.ramp=null;this.disposed=false;
   this.starts=0;this.loads=0;this.peakDecks=0;this._timer=setTimer(()=>this.tick(),40);
  }
  request(key){
   key=key||null;if(this.disposed||key===this.desired)return;
   this.desired=key;this.revision++;this.deadline=this.now()+this.delayMs;
   if(this.loading){this.drop(this.loading);this.loading=null;}
  }
  unlock(){
   if(this.disposed)return;const was=this.unlocked;this.unlocked=true;
   for(const k of [...this.failed])if(k.startsWith('blocked:'))this.failed.delete(k);
   if(!was)this.deadline=this.now(); // Current *post-action* scene, not a transient title.
   this.tick();
  }
  setOutput(value,{suspended=false,immediate=false,fadeMs=220}={}){
   if(this.disposed)return;value=Math.max(0,Math.min(1,Number(value)||0));
   const t=this.now(),suspend=!!suspended||!this.unlocked;
   this.sampleOutput(t);
   if(suspend&&!this.suspended){this.heldAt=t;this.pauseAt=t+(immediate?0:150);if(this.loading){this.drop(this.loading);this.loading=null;}}
   if(!suspend&&this.suspended){
    const heldKey=this.fade?.to?.key||this.current?.key;
    if(heldKey&&heldKey!==this.desired){
     // A load/navigation while paused must not briefly resurrect an obsolete cue.
     this.fade=null;for(const s of [...this.slots])this.drop(s);this.current=null;
    }else if(this.fade&&this.heldAt!==null)this.fade.start+=t-this.heldAt;
    this.heldAt=null;this.pauseAt=0;
    for(const s of this.slots)if(s&&s.ready&&s.a.paused)this.resume(s);
   }
   this.suspended=suspend;const target=suspend?0:value;
   if(immediate){this.target=target;this.output=target;this.ramp=null;}
   else if(target!==this.target){this.target=target;this.ramp={start:t,duration:suspend?150:fadeMs,from:this.output,to:target};}
   this.tick();
  }
  sampleOutput(t){if(!this.ramp)return;const r=this.ramp,p=Math.min(1,Math.max(0,(t-r.start)/r.duration));this.output=r.from+(r.to-r.from)*p;if(p===1)this.ramp=null;}
  isAlive(s,gen){return !this.disposed&&this.slots.includes(s)&&s.gen===gen;}
  error(key,message,blocked=false){
   const tag=(blocked?'blocked:':'')+key;if(this.failed.has(tag))return;
   this.failed.add(tag);this.errors.push({key,message});this.onError(key,message,blocked);
  }
  drop(s){
   if(!s)return;
   if(this.fade?.to===s){const keep=this.fade.from;this.fade=null;this.current=keep;if(keep)keep.coeff=1;}
   else if(this.fade?.from===s)this.fade.from=null;
   if(s.ready&&Number.isFinite(s.a.currentTime))this.positions[s.key]=s.a.currentTime;
   s.gen++;s.a.onloadedmetadata=s.a.onerror=s.a.onended=s.a.onwaiting=s.a.onplaying=null;
   s.a.pause();s.a.volume=0;s.a.removeAttribute('src');s.a.load();
   const i=this.slots.indexOf(s);if(i>=0)this.slots[i]=null;
   if(this.current===s)this.current=null;
  }
  load(key){
   if(this.loading||this.fade||this.slots.filter(Boolean).length>=2)return;
   const src=this.getSrc(key);if(!src){this.error(key,'missing asset');this.fadeToSilence();return;}
   if(this.failed.has(key)||this.failed.has('blocked:'+key))return;
   const index=this.slots.findIndex(x=>!x),a=this.makeAudio();
   const s={a,key,index,gen:1,revision:this.revision,coeff:0,ready:false,loadingAt:this.now(),resuming:false,lastTime:0,loops:0};
   this.slots[index]=s;this.loading=s;this.loads++;
   a.preload='auto';a.loop=true;a.volume=0;
   const generation=s.gen;
   a.onloadedmetadata=()=>{if(!this.isAlive(s,generation))return;const p=this.positions[key]||0;try{if(p>0&&Number.isFinite(a.duration)&&p<a.duration-.05)a.currentTime=p;}catch(e){/* position falls back to start, not a fatal error */}};
   a.onerror=()=>{if(!this.isAlive(s,generation))return;this.error(key,'media load/decode error '+(a.error?.code||''));if(this.loading===s)this.loading=null;this.drop(s);if(this.desired===key)this.fadeToSilence();};
   a.src=src;a.load();
   const ok=()=>{
    if(!this.isAlive(s,generation))return;
    if(s.revision!==this.revision||this.desired!==key||this.suspended){if(this.loading===s)this.loading=null;this.drop(s);return;}
    s.ready=true;this.loading=null;this.starts++;
    this.history.push({key,at:this.now()});if(this.history.length>64)this.history.shift();
    this.fade={from:this.current,to:s,start:this.now(),duration:this.current?this.fadeMs:380};
   };
   try{Promise.resolve(a.play()).then(ok,e=>{if(!this.isAlive(s,generation))return;this.error(key,e.name||e.message,e.name==='NotAllowedError');this.loading=null;this.drop(s);if(this.desired===key)this.fadeToSilence();});}
   catch(e){a.onerror();}
  }
  resume(s){
   if(s.resuming||!s.ready)return;const gen=s.gen;s.resuming=true;
   try{Promise.resolve(s.a.play()).then(()=>{if(this.isAlive(s,gen)){s.resuming=false;if(this.suspended&&this.now()>=this.pauseAt)s.a.pause();}},e=>{if(!this.isAlive(s,gen))return;s.resuming=false;this.error(s.key,e.name||e.message,e.name==='NotAllowedError');s.a.pause();});}catch(e){s.resuming=false;this.error(s.key,e.message);}
  }
  fadeToSilence(){if(this.fade||!this.current)return;this.fade={from:this.current,to:null,start:this.now(),duration:400};}
  tick(){
   if(this.disposed)return;const t=this.now();this.sampleOutput(t);
   if(!this.suspended&&this.fade){const f=this.fade,p=Math.min(1,Math.max(0,(t-f.start)/f.duration));if(f.from)f.from.coeff=1-p;if(f.to)f.to.coeff=p;
    if(p===1){if(f.from)this.drop(f.from);this.current=f.to;this.fade=null;}}
   for(const s of this.slots){if(!s)continue;
    s.a.volume=Math.max(0,Math.min(1,this.output*s.coeff));
    if(this.suspended&&t>=this.pauseAt){s.a.volume=0;if(!s.a.paused)s.a.pause();}
    if(s.ready){if(s.lastTime-s.a.currentTime>1)s.loops++;s.lastTime=s.a.currentTime;}
   }
   this.peakDecks=Math.max(this.peakDecks,this.slots.filter(s=>s&&!s.a.paused).length);
   if(this.loading&&t-this.loading.loadingAt>15000){const s=this.loading;this.loading=null;this.error(s.key,'media load timeout');this.drop(s);this.fadeToSilence();}
   if(this.suspended||!this.unlocked||this.fade||this.loading||t<this.deadline)return;
   if(this.current?.key===this.desired){if(this.current.a.paused&&!this.current.resuming&&!this.failed.has('blocked:'+this.desired))this.resume(this.current);return;}
   if(!this.desired||this.failed.has(this.desired)||this.failed.has('blocked:'+this.desired)){this.fadeToSilence();return;}
   this.load(this.desired);
  }
  status(){const a=this.current?.a||this.fade?.to?.a;return {
   music:this.current?.key||this.fade?.to?.key||'',requested:this.desired,playing:this.slots.some(s=>s&&!s.a.paused&&s.coeff>0),readyState:a?.readyState||0,currentTime:a?.currentTime||0,
   unlocked:this.unlocked,suspended:this.suspended,output:this.output,target:this.target,loading:this.loading?.key||null,transition:!!this.fade,
   starts:this.starts,loads:this.loads,maxPlayingDecks:this.peakDecks,positions:{...this.positions},history:this.history.slice(),errors:this.errors.slice(),
   decks:this.slots.filter(Boolean).map(s=>({key:s.key,paused:s.a.paused,volume:s.a.volume,time:s.a.currentTime,duration:Number.isFinite(s.a.duration)?s.a.duration:null,ready:s.ready,coeff:s.coeff,loops:s.loops}))};}
  dispose(){if(this.disposed)return;this.disposed=true;this.clearTimer(this._timer);for(const s of [...this.slots])this.drop(s);this.loading=this.fade=null;}
 }
 root.BgmMixer=BgmMixer;if(typeof module!=='undefined')module.exports=BgmMixer;
})(typeof window!=='undefined'?window:globalThis);
