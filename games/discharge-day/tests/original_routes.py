from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time
R=Path(__file__).resolve().parents[1];Q=R/'qa'
routes=json.loads((Q/'logic_test_report.json').read_text())['routes']
report={'environment':'Chromium / exact standalone HTML via page.set_content','method':'All routes activate graphical DOM controls programmatically. Physical pointer activation is tested separately in smoke.py.','routes':[],'errors':[],'external_requests':[],'not_verified':['file:// and localhost navigation: administrator policy blocks them','native localStorage persistence at a file origin','Safari, Firefox, real mobile hardware','human playtesting and voice acting']}
SCRIPT=r'''({route,initial})=>{
 const G=DischargeGame;G.restoreSave(initial);const scenes=new Set(),clues=new Set(),puzzles=new Set(),issues=[];
 const click=s=>{const b=document.querySelector(s);if(!b)throw Error('Missing control: '+s+' at '+G.getState().node);if(b.disabled)throw Error('Disabled control: '+s);b.click();};
 for(const step of route.path){
  const [node,action]=step.split('/');const st=G.getState();if(st.node!==node)throw Error('Wrong node '+st.node+' expected '+node);scenes.add(node);st.clues.forEach(k=>clues.add(k));
  G.finishReading();
  for(const b of document.querySelectorAll('#hit-plane button')){const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,t=document.elementFromPoint(x,y);if(x<0||x>innerWidth||y<0||y>innerHeight||!t||t.closest('button')!==b)issues.push({node,choice:b.dataset.choice});}
  if(action.startsWith('P0')){
   click('#open-device');const p=G.getData().puzzles[action];
   if(action==='P02'){for(const[k,v] of Object.entries(p.answers)){const b=document.querySelector('[data-switch="'+k+'"]');if((b.getAttribute('aria-checked')==='true')!==(v==='on'))b.click();}}
   else if(action==='P04'){click('[data-field="line"][data-value="'+p.answers.line+'"]');const d=document.querySelector('#channel-dial');d.value=p.answers.channel;d.dispatchEvent(new Event('input',{bubbles:true}));}
   else if(action==='P05'){for(const f of p.fields)click('[data-step="'+p.answers[f.id]+'"]');}
   else for(const[k,v]of Object.entries(p.answers))click('[data-field="'+k+'"][data-value="'+v+'"]');
   click('#submit-puzzle');if(document.querySelector('#confirm-modal').open)click('#confirm-yes');if(document.querySelector('#modal').open)throw Error('Puzzle did not finish '+action);puzzles.add(action);
  }else{click('[data-choice="'+action+'"]');if(document.querySelector('#confirm-modal').open)click('#confirm-yes');}
 }
 const s=G.getState();scenes.add(s.node);s.clues.forEach(k=>clues.add(k));G.finishReading();if(document.querySelector('#ending-overlay').hidden)throw Error('Ending not shown');const name=document.querySelector('#end-name').textContent;if(name!==G.getData().meta.ending_names[route.ending])throw Error('Wrong ending '+name);
 return {name:route.name,ending:route.ending,steps:route.steps,passed:true,scenes:[...scenes],clues:[...clues],puzzles:[...puzzles],hit_issues:issues};
}'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);pg=b.new_page(viewport={'width':1440,'height':960});pg.set_default_timeout(10000)
 pg.on('pageerror',lambda e:report['errors'].append(str(e)))
 pg.on('request',lambda r:report['external_requests'].append(r.url) if r.url.startswith(('http:','https:')) else None)
 pg.set_content((R/'index.html').read_text(),wait_until='load');pg.evaluate('DischargeGame.setTestMode()');pg.locator('#new-game').evaluate('(b)=>b.click()');initial=pg.evaluate('DischargeGame.pack()')
 for route in routes:
  t=time.time();res=pg.evaluate(SCRIPT,{'route':route,'initial':initial});res['seconds']=round(time.time()-t,2);report['routes'].append(res);(Q/'graphics_routes_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('PASS',res['name'],res['seconds'],flush=True)
 seen={s for r in report['routes'] for s in r['scenes']};clues={k for r in report['routes'] for k in r['clues']};puzzles={k for r in report['routes'] for k in r['puzzles']}
 report.update({'routes_completed':len(report['routes']),'scenes_visited':len(seen),'clues_acquired':len(clues),'puzzles_exercised':sorted(puzzles),'endings_exercised':sorted({r['ending'] for r in report['routes']}),'hit_issues':[i for r in report['routes'] for i in r.get('hit_issues',[])]})
 (Q/'graphics_routes_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
print(json.dumps({k:v for k,v in report.items() if k!='routes'},ensure_ascii=False,indent=2))
