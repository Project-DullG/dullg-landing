/* v0.5 presentation only. No progress, evidence, answer or save mutations. */
(function(root){
'use strict';
const reduceQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let config={},previous=null,modalKey=null,paused=false,lastBeat=null;
const slated=new Set();
const tracked=new Set(),events=[];
function record(type,detail){events.push({type,detail,at:Math.round(performance.now())});if(events.length>160)events.shift();}
function reduced(){return !!config.reduced||reduceQuery.matches;}
function active(){return !reduced()&&!document.hidden;}
function animate(el,frames,options,kind='ui'){
 prune();
 if(!el||!active()||config.sceneEffects===false||!el.animate)return null;
 const a=el.animate(frames,{duration:240,easing:'cubic-bezier(.2,.7,.2,1)',fill:'none',...options});
 const entry={a,el,kind};tracked.add(entry);
 const dispose=()=>{tracked.delete(entry);};a.addEventListener('finish',dispose,{once:true});a.addEventListener('cancel',dispose,{once:true});
 return a;
}
function cancelAll(){for(const {a} of tracked)a.cancel();tracked.clear();document.querySelectorAll('.scene-ghost').forEach(e=>e.remove());}
function configure(c){
 config={...c};
 document.body.classList.toggle('motion-off',!active());
 document.body.classList.toggle('atmosphere-on',active()&&c.atmosphere!==false);
 document.body.classList.toggle('character-motion',active()&&c.characterMotion!==false);
 document.body.classList.toggle('ink-effects',active()&&c.textEffects!==false);
 document.body.classList.toggle('impact-off',c.impactEffects===false);
 if(!active()||config.sceneEffects===false)cancelAll();
}
function suspend(value){paused=value;document.body.classList.toggle('ui-paused',value);if(value){for(const x of [...tracked])if(!['modal','result'].includes(x.kind)){x.a.cancel();tracked.delete(x);}}}
reduceQuery.addEventListener?.('change',()=>configure(config));
function prune(){for(const item of tracked)if(!item.el.isConnected){item.a.cancel();tracked.delete(item);}}
function placeGhost(oldSource,world){
 if(!active()||!world||!oldSource)return;
 world.querySelectorAll('.scene-ghost').forEach(e=>e.remove());
 const im=document.createElement('img');im.className='scene-ghost';im.alt='';im.setAttribute('aria-hidden','true');im.src=oldSource;world.append(im);
 const a=animate(im,[{opacity:1},{opacity:0}],{duration:420},'background');
 if(a){a.onfinish=()=>im.remove();a.oncancel=()=>im.remove();}else im.remove();
}
function render(ctx){
 prune();const old=previous;previous={...ctx};
 applyDirection(ctx);
 if(paused)return;
 const scopeChanged=!old||old.scope!==ctx.scope;
 const locationChanged=!!old&&(old.location!==ctx.location||old.phase!==ctx.phase);
 const actorChanged=!old||old.actor!==ctx.actor||locationChanged;
 const sceneChanged=!!ctx.scene&&old?.scene!==ctx.scene;
 if(ctx.scope==='title'){
  if(scopeChanged){
   const title=document.querySelector('.title-content');
   animate(document.querySelector('.title-art-stage'),[{opacity:.25},{opacity:1}],{duration:640},'title');
   animate(title,[{opacity:.25,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:420},'title');
   record('title',null);
  }
  return;
 }
 if(locationChanged){
  // Key art belongs to the title only; never superimpose its wordmark/cast onto a live investigation.
  if(old.scope!=='title')placeGhost(old.bg,document.querySelector('#world'));
  else animate(document.querySelector('.scene'),[{opacity:.4},{opacity:1}],{duration:300},'background');
  record('location',ctx.location);
 }
 if(scopeChanged){
  const cards=[...document.querySelectorAll('.evidence-card,.profile-card,.map-card')].slice(0,8);
  cards.forEach((card,i)=>animate(card,[{opacity:.2,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:240,delay:i*20},'card'));
  const workspace=document.querySelector('.workspace');animate(workspace,[{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:210},'workspace');
 }
 if(actorChanged&&ctx.actor){
  const visual=document.querySelector('.actor-visual');
  animate(visual,[{opacity:0,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:340},'actor');record('actor',ctx.actor);
 }
 if(old?.speaker!==ctx.speaker){animate(document.querySelector('.speaker'),[{opacity:.4},{opacity:1}],{duration:200},'speaker');}
 if(old?.chapter!==ctx.chapter){animate(document.querySelector('.chapter-num'),[{opacity:.4},{opacity:1}],{duration:470},'chapter');record('chapter',ctx.chapter);}
 if(locationChanged||sceneChanged||scopeChanged){
  const cue=document.querySelector('#sceneCue');
  if(cue){animate(cue,[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:360},'cue');}
 }
 if(ctx.ending&&old?.ending!==ctx.ending){
  animate(document.querySelector('.end-note'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:800},'ending');record('ending',ctx.ending);
 }
}
function applyDirection(ctx){
 const scene=document.querySelector('.scene'),cue=ctx.directed;
 if(scene){scene.classList.toggle('directed-scene',!!cue&&config.impactEffects!==false);scene.dataset.tone=ctx.revealed&&cue?cue.tone:'normal';}
 // A slate uses an empty centre only. It never covers a face or an input.
 if(ctx.slate&&!slated.has(ctx.slate.id)&&active()&&config.sceneEffects!==false&&config.impactEffects!==false&&!paused){
  const stage=document.querySelector('.actor-stage');
  if(stage&&!stage.querySelector('.actor-visual')){
   slated.add(ctx.slate.id);const slate=document.createElement('div');slate.className='scene-slate';slate.setAttribute('aria-hidden','true');
   const small=document.createElement('small'),title=document.createElement('strong');small.textContent=ctx.slate.kicker;title.textContent=ctx.slate.title;slate.append(small,title);stage.prepend(slate);
   const a=animate(slate,[{opacity:0,transform:'translateY(6px)',offset:0},{opacity:1,transform:'none',offset:.15},{opacity:1,offset:.8},{opacity:0,offset:1}],{duration:2600},'chapter');
   if(a){a.onfinish=()=>slate.remove();a.oncancel=()=>slate.remove();}else slate.remove();
  }
 }
 const end=document.querySelector('.end-note');
 if(ctx.ending&&end&&!end.querySelector('.closure-backdrop')){end.classList.add('closure-card');const im=document.createElement('img');im.className='closure-backdrop';im.alt='';im.setAttribute('aria-hidden','true');im.src=root.ASSETS[ctx.ending==='A'?'auditorium':'rooftop'];end.prepend(im);}
}
function beat(cue){
 if(!cue||cue.tone==='normal'||paused||!active()||config.impactEffects===false||lastBeat===cue.key)return;
 lastBeat=cue.key;const scene=document.querySelector('.scene'),dialogue=document.querySelector('.dialogue');if(!scene||!dialogue)return;
 scene.dataset.tone=cue.tone;dialogue.dataset.emphasis='true';
 animate(dialogue,[{borderTopColor:'#b8d4db'},{borderTopColor:'#6c98a6'}],{duration:700},'beat');
 record('authored-beat',cue.key);
}
function modal(kind,id){
 const key=kind?kind+':'+(id||''):null;
 if(key!==modalKey&&key){
  animate(document.querySelector('#overlay .modal'),[{opacity:.35,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:190},'modal');record('modal',key);
 }
 modalKey=key;
}
function result(ok){
 const box=document.querySelector('#overlay .feedback');if(!box)return;
 box.dataset.verdict=ok?'accepted':'review';
 const line=document.createElement('span');line.className='result-trace';line.setAttribute('aria-hidden','true');box.prepend(line);
 animate(line,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:ok?480:250},'result');
 animate(box,[{opacity:.45},{opacity:1}],{duration:240},'result');if(ok&&config.impactEffects!==false){document.querySelectorAll('.insight-source').forEach((el,i)=>animate(el,[{opacity:.2,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:360,delay:Math.min(i*75,300)},'result'));animate(document.querySelector('.insight-conclusion'),[{opacity:.3},{opacity:1}],{duration:520},'result');}record('result',ok?'accepted':'review');
}
function notice(){const el=document.querySelector('#notifications .toast');animate(el,[{opacity:0,transform:'translateX(8px)'},{opacity:1,transform:'none'}],{duration:200},'notice');record('notice',null);}
function readingMarkup(el,text,shown){
 // Word wrappers reserve the final line breaks before typing starts.
 // Hidden glyphs are aria-hidden; a separate live region gets the completed line.
 el.replaceChildren();const glyphs=[];
 for(const token of text.split(/(\s+)/u).filter(Boolean)){
  const group=document.createElement('span');group.className=/^\s+$/u.test(token)?'type-space':'type-word';
  if(Array.from(token).length>20)group.classList.add('long-token');
  for(const char of Array.from(token)){
   const g=document.createElement('span');g.className='type-glyph'+(glyphs.length<shown?' is-visible':'');g.textContent=char;group.append(g);glyphs.push(g);
  }
  el.append(group);
 }
 return {el,glyphs,count:shown};
}
function reveal(run,count,immediate=false){
 for(let i=run.count;i<Math.min(count,run.glyphs.length);i++){
  const g=run.glyphs[i];g.classList.add('is-visible');
  if(!immediate&&active()&&config.textEffects!==false)g.classList.add('ink-arrive');
 }
 run.count=Math.min(count,run.glyphs.length);
}
function pauseFor(char){
 if(config.punctuationPause===false||config.instant)return 0;
 if(/[.!?。？！]/u.test(char))return 180;
 if(/[,，:;]/u.test(char))return 80;
 if(/[…”」]/u.test(char))return 110;
 return 0;
}
function reset(){cancelAll();previous=null;lastBeat=null;slated.clear();modalKey=null;}
function stats(){return {reduced:reduced(),active:active(),paused,tracked:tracked.size,transients:[...tracked].filter(x=>x.el.isConnected).length,events:events.map(e=>({...e}))};}
root.PRESENTATION={reset,beat,configure,suspend,render,modal,result,notice,readingMarkup,reveal,pauseFor,active,reduced,stats,cancelAll};
})(window);
