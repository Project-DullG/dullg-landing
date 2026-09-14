'use strict';
const fs=require('fs'), path=require('path'), assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const D=JSON.parse(fs.readFileSync(path.join(root,'src/game_data.json'),'utf8'));
const L=require('../src/logic.js');
const visits=new Set(), found=new Set(), endings=new Set(), transitions=new Set();
const reports=[], snapshots={};
let assertions=0;
function check(b,m){assert.ok(b,m);assertions++;}
function eq(a,b,m){assert.deepEqual(a,b,m);assertions++;}
function throws(fn,m){assert.throws(fn,undefined,m);assertions++;}
class Run {
 constructor(name){this.name=name;this.s=L.start(D);this.steps=[];this.mark();}
 mark(){visits.add(this.s.node);this.s.clues.forEach(x=>found.add(x));const e=D.scenes[this.s.node].ending;if(e)endings.add(e);}
 c(id){const from=this.s.node;this.s=L.choose(D,this.s,id,true);this.steps.push(`${from}/${id}`);transitions.add(`${from}/${id}`);this.mark();return this;}
 p(){const from=this.s.node,p=L.puzzle(D,this.s);check(p&&p.enabled,`Puzzle ready at ${from}`);this.s=L.solve(D,this.s,p.answers,true).state;this.steps.push(`${from}/${p.id}`);transitions.add(`${from}/${p.id}`);this.mark();return this;}
 has(f){return this.s.flags.includes(f);}
 shot(n){snapshots[n]={id:D.meta.id,version:D.meta.version,state:L.clone(this.s),history:[],notes:'',transcript:[],unlocked:[]};return this;}
 end(e){eq(D.scenes[this.s.node].ending,e,this.name);reports.push({name:this.name,ending:e,steps:this.steps.length,day:this.s.day,clues:this.s.clues.length,path:this.steps});return this;}
}
function base(r){r.c('begin').c('belong').c('back').c('call').c('back').c('screen').c('back').c('door').p().c('continue').c('power').p().c('continue');return r;}
function records(r){r.c('records').c('medical').c('transfer').c('box').p().c('note').c('back').c('map').c('back');return r;}
function filter(r){r.c('plant').c('history').c('back').c('filter').c('install').c('back');return r;}
function preparePatient(r){r.c('patient').c('chart').c('prep').p();return r;}
function exit(r){r.c('exit').c('airlock').p();return r;}
function radio(r){r.c('antenna').c('radio').p().c('more');return r;}
function routeFromContact(r){r.c('route').p().c('back');return r;}
function handoffFromAfter(r,wait=true){r.c('comms').c('contact').c('care').c('agree');r.c(wait?'wait':'later');if(wait)r.c('after');return r;}
// Static ID integrity and graph reachability, not a semantic proof.
for(const [id,s]of Object.entries(D.scenes)){
 eq(s.id,id,'scene ID');check(s.blocks.length>0,`${id} has text`);
 const ids=new Set();for(const c of s.choices){check(!ids.has(c.id),'unique choice');ids.add(c.id);check(!!D.scenes[c.to],`target ${c.to}`);}
 for(const k of s.clues)check(!!D.clues[k],`clue ${k}`);
 if(s.puzzle)check(!!D.puzzles[s.puzzle],`puzzle ${s.puzzle}`);
 if(s.ending)check(!!D.meta.ending_names[s.ending],`ending ${s.ending}`);
}
for(const p of Object.values(D.puzzles)){
 check(!!D.scenes[p.success],'puzzle success target');eq(p.hints.length,3,'3 hints');
 for(const f of p.fields)check(f.options.some(o=>o.value===p.answers[f.id]),'answer in allowed options');
}
for(const c of Object.values(D.clues)){check(c.carrier.length>0&&c.text.length>0,'concrete clue');check(c.source_bundle.length>0&&c.truth_ids.length>0,'provenance');}
let queue=[D.meta.start],staticReach=new Set(queue);while(queue.length){const id=queue.shift(),s=D.scenes[id];const next=s.choices.map(c=>c.to);if(s.puzzle)next.push(D.puzzles[s.puzzle].success);for(const n of next)if(!staticReach.has(n)){staticReach.add(n);queue.push(n);}}
eq(staticReach.size,Object.keys(D.scenes).length,'all scenes structurally reachable');
// Wrong answers are non-destructive, and unopened doors cannot be traversed via disabled choices.
let r=new Run('negative checks');r.c('begin');throws(()=>L.choose(D,r.s,'hall',true),'door gate');r.c('door');const before=L.clone(r.s),bad=L.solve(D,r.s,{action:'test'},true);eq(bad.ok,false,'wrong answer');eq(bad.state,before,'wrong answer keeps state');r.shot('first_puzzle');
r=base(new Run('unprepared patient'));r.c('patient').c('chart').c('prep');check(!L.puzzle(D,r.s).enabled,'no filter cannot wake');throws(()=>L.solve(D,r.s,{kit:'restore'},true),'reject unprepared wake');r.shot('locked_recovery');
// Minimal independent route to an ending. No family or radio dependency.
r=exit(base(new Run('minimal solo without contact')));r.c('survey').c('route').p().c('back').c('decide');r.shot('decision_minimal');check(!L.choices(D,r.s).find(c=>c.id==='e2').enabled,'cannot accompany sleeper');r.c('e5').c('confirm').end('E5');r.shot('ending_e5');
// Actual handoff, not merely a promise, permits orderly solo departure.
r=radio(exit(records(base(new Run('handoff solo departure')))));r.c('history').c('back');routeFromContact(r);handoffFromAfter(r,false);r.c('decide');check(!L.choices(D,r.s).find(c=>c.id==='e1').enabled,'promise is not receipt');check(!L.choices(D,r.s).find(c=>c.id==='e4').enabled,'promise is not staffed shelter');r.c('return').c('delivery').c('after').c('decide').c('e1').end('E1');r.shot('ending_e1');
// Optional family branch receives the actual original documents before its ending.
r=radio(exit(records(base(new Run('family archive alone')))));r.c('family').c('route').p().c('back').c('visit').c('index').c('life').c('leave').c('return');handoffFromAfter(r);r.c('decide').c('e3').end('E3');r.shot('ending_e3');
// Early wake leads to two people witnessing the exterior and a negotiated plan.
r=preparePatient(filter(records(base(new Run('early wake and shared exit')))));r.c('wait').c('together');check(r.has('early_wake'),'early branch');eq(r.s.day,3,'72 hour passage');r.c('join');exit(r);check(r.has('witnessed_world'),'companion witnesses exterior');r.c('survey').c('route').p().c('back').c('people').c('talk').c('plan').c('agree').c('decide').c('e2').end('E2');r.shot('ending_e2');
// Late wake can be told the truth, rather than get facts from an omniscient narrator.
r=base(new Run('late wake truthful'));filter(r);exit(r).c('return').c('patient').c('chart').c('prep').p().c('wait').c('tell').c('full').c('together').c('rest').c('post').c('route').p().c('back').c('people').c('talk').c('plan').c('agree').c('decide').c('e2').end('E2');
// Concealment has a separate confrontation and repair, not a hidden moral score.
r=base(new Run('conceal then repair'));filter(r);exit(r).c('return').c('patient').c('chart').c('prep').p().c('later').c('post').c('finish_recovery').c('tell').c('delay').c('look');r.shot('confrontation');r.c('respect').c('route').p().c('back').c('people').c('talk');check(!L.choices(D,r.s).find(c=>c.id==='plan').enabled,'unrepaired concealment blocks plan');check(!L.choices(D,r.s).find(c=>c.id==='join').enabled,'unrepaired concealment blocks immediate following');r.c('check').c('repair').c('next').c('plan').c('agree').c('decide').c('e2').end('E2');
// Retelling truth does not retrospectively delete the earlier misleading statement.
r=base(new Run('confession route from full account'));filter(r);exit(r).c('return').c('patient').c('chart').c('prep').p().c('wait').c('tell').c('delay').c('leave').c('people').c('talk').c('tell').c('full');check(r.has('concealed'),'past statement retained');check(L.choices(D,r.s).some(c=>c.id==='repair'),'repair remains reachable');r.c('repair').c('next').c('back').c('post').c('route').p().c('back').c('decide').c('e5').c('confirm').end('E5');
// A real staffed rotation with asleep patient: the epilogue completes recovery.
r=radio(exit(filter(base(new Run('shelter rotation')))));routeFromContact(r);handoffFromAfter(r);r.c('decide').c('e4').end('E4');r.shot('ending_e4');
// The family route can also carry a previously negotiated companion.
r=preparePatient(filter(records(base(new Run('family archive together')))));r.c('wait').c('together').c('join');radio(exit(r));r.c('family').c('route').p().c('back').c('people').c('talk').c('plan').c('agree').c('visit').c('index').c('close').c('return').c('decide').c('e3').end('E3');
// An early exit after a visit agreement does not silently turn into completed handoff.
r=radio(exit(base(new Run('leave before agreed visit'))));routeFromContact(r);handoffFromAfter(r,false);r.c('decide').c('e5');check(!r.has('handoff_done'),'visit promise still distinct');r.c('confirm').end('E5');
// Early awakening alone does not grant knowledge of a later exterior visit.
r=preparePatient(filter(base(new Run('early wake stays inside'))));r.c('wait').c('together').c('rest');exit(r);check(!r.has('disclosed'),'outside knowledge not telepathic');r.c('survey').c('route').p().c('back').c('people').c('talk');check(!L.choices(D,r.s).find(c=>c.id==='plan').enabled,'must tell new exterior facts');r.c('tell').c('full').c('together').c('plan').c('agree').c('decide').c('e2').end('E2');
// One night spent receiving the crew is part of the same 72-hour recovery.
r=preparePatient(filter(base(new Run('overlapping recovery and crew wait'))));r.c('later');radio(exit(r));routeFromContact(r);handoffFromAfter(r);eq(r.s.day,1,'crew wait elapsed');r.c('finish_recovery');eq(r.s.day,3,'only two recovery days remain, not three extra');r.c('tell').c('full').c('space').c('decide').c('e4').end('E4');
// Day progression, clue collection, saves and redraws are idempotent.
const saved=snapshots.ending_e4;const copy=L.validateSave(D,saved);eq(copy,saved,'save roundtrip');const repeat=L.enter(D,saved.state,'HANDOFF_ARRIVE');eq(repeat.day,saved.state.day,'revisit no extra day');eq(new Set(repeat.clues).size,repeat.clues.length,'no duplicate clues');
throws(()=>L.validateSave(D,{...saved,version:'0'}),'version rejection');throws(()=>L.validateSave(D,{...saved,history:[{node:'NOPE'}]}),'reject malformed undo history');throws(()=>L.validateSave(D,{...saved,unlocked:'bad'}),'reject malformed ending list');
eq([...endings].sort(),['E1','E2','E3','E4','E5'],'all endings exercised');
const report={game_version:D.meta.version,scope:'Static references, explicit scripted route execution, negative state tests; not independent reading or human playtest.',assertions,scene_count:Object.keys(D.scenes).length,statically_reachable:staticReach.size,dynamically_visited:visits.size,unvisited_scenes:Object.keys(D.scenes).filter(x=>!visits.has(x)),clues_total:Object.keys(D.clues).length,clues_acquired:found.size,missing_clues:Object.keys(D.clues).filter(x=>!found.has(x)),puzzle_count:Object.keys(D.puzzles).length,endings_exercised:[...endings].sort(),transitions_exercised:transitions.size,routes:reports};
fs.writeFileSync(path.join(root,'qa/logic_test_report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(root,'tests/browser_states.json'),JSON.stringify(snapshots,null,2));console.log(JSON.stringify({...report,routes:reports.map(({path,...rest})=>rest)},null,2));
