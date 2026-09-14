/* Pure story state transitions. No network, timers, eval, or hidden moral score. */
(function (root) {
  'use strict';
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function condition(c, s) {
    if (c === undefined || c === null) return true;
    if (typeof c === 'boolean') return c;
    if (typeof c === 'string') return s.flags.includes(c);
    if (c.all) return c.all.every(x => condition(x, s));
    if (c.any) return c.any.some(x => condition(x, s));
    if (Object.prototype.hasOwnProperty.call(c, 'not')) return !condition(c.not, s);
    throw new Error('Unknown condition: ' + JSON.stringify(c));
  }
  function effects(s, e) {
    for (const f of (e.unset || [])) s.flags = s.flags.filter(x => x !== f);
    for (const f of (e.set || [])) if (!s.flags.includes(f)) {
      if (f==='patient_started') s.recovery_started_day=s.day;
      s.flags.push(f);
    }
  }
  function expand(t, s) {
    const d = new Date(Date.UTC(2089, 8, 13 + s.day));
    const remaining=Math.max(0,(Number.isInteger(s.recovery_started_day)?s.recovery_started_day:s.day)+3-s.day);
    return t.replaceAll('{{recovery_remaining}}',String(remaining)).replaceAll('{{today}}', `${d.getUTCFullYear()}년 ${d.getUTCMonth()+1}월 ${d.getUTCDate()}일`);
  }
  function enter(data, current, node) {
    if (!data.scenes[node]) throw new Error('Missing scene: ' + node);
    const s = clone(current), scene = data.scenes[node];
    s.node = node;
    // Text is evaluated against knowledge on arrival; first-visit effects apply afterwards.
    s.view = scene.blocks.filter(b => condition(b.when, s)).map(b => expand(b.text, s));
    if (!s.visited.includes(node)) {
      s.visited.push(node);
      if (scene.advance_until && Number.isInteger(s[scene.advance_until.state_key])) {
        s.day=Math.max(s.day,s[scene.advance_until.state_key]+scene.advance_until.duration_days);
      } else s.day += scene.advance_days || 0;
    }
    const conditionalEffects=(scene.conditional_set || []).filter(item=>condition(item.when,s));
    effects(s, scene);
    for (const item of conditionalEffects) effects(s, {set:item.flags,unset:item.unset});
    for (const id of scene.clues) if (!s.clues.includes(id)) s.clues.push(id);
    return s;
  }
  function start(data) {
    return enter(data, {node:'', flags:[], clues:[], visited:[], day:0, view:[]}, data.meta.start);
  }
  function choices(data, s) {
    return data.scenes[s.node].choices.filter(c => condition(c.when,s))
      .map(c => ({...c, label:expand(c.label,s),enabled:condition(c.requires,s)}));
  }
  function choose(data, s, id, confirmed=false) {
    const c = choices(data,s).find(x => x.id === id);
    if (!c || !c.enabled) throw new Error('Choice unavailable: ' + s.node + '/' + id);
    if (c.confirm && !confirmed) throw new Error('Confirmation required');
    const n = clone(s); effects(n,c); return enter(data,n,c.to);
  }
  function puzzle(data, s) {
    const p = data.puzzles[data.scenes[s.node].puzzle];
    if (!p || (p.hide_when && condition(p.hide_when,s))) return null;
    return {...p, enabled:condition(p.requires,s)};
  }
  function solve(data, s, answers, confirmed=false) {
    const p = puzzle(data,s);
    if (!p || !p.enabled) throw new Error('Puzzle unavailable');
    if (p.confirm && !confirmed) throw new Error('Confirmation required');
    const ok = p.fields.every(f => Object.prototype.hasOwnProperty.call(answers,f.id)
      && String(answers[f.id]) === String(p.answers[f.id]));
    if (!ok) return {ok:false, state:clone(s), feedback:p.failure};
    const n=clone(s); effects(n,p);
    return {ok:true, state:enter(data,n,p.success), feedback:''};
  }
  function validateSave(data, p) {
    if (!p || p.id!==data.meta.id || p.version!==data.meta.version || !p.state) throw new Error('이 작품의 현재 버전 저장 파일이 아닙니다.');
    const validateState = (s) => {
      if (!s || !data.scenes[s.node] || !['flags','clues','visited','view'].every(k=>Array.isArray(s[k]))) throw new Error('저장 상태의 형식이 올바르지 않습니다.');
      if (!s.clues.every(k=>typeof k==='string'&&data.clues[k]) || !s.visited.every(k=>typeof k==='string'&&data.scenes[k])) throw new Error('저장 파일에 없는 장면 또는 단서가 있습니다.');
      if (s.recovery_started_day!==undefined && (!Number.isInteger(s.recovery_started_day)||s.recovery_started_day<0||s.recovery_started_day>s.day)) throw new Error('회복 시작 시각이 올바르지 않습니다.');
      if (!s.flags.every(k=>typeof k==='string') || !s.view.every(k=>typeof k==='string') || !Number.isInteger(s.day) || s.day<0 || s.day>30) throw new Error('저장 상태의 값이 올바르지 않습니다.');
    };
    validateState(p.state);
    if (p.history !== undefined) {
      if (!Array.isArray(p.history)) throw new Error('되돌리기 기록의 형식이 올바르지 않습니다.');
      p.history.forEach(validateState);
    }
    if (p.transcript !== undefined && (!Array.isArray(p.transcript) || !p.transcript.every(x=>x&&typeof x.title==='string'&&typeof x.text==='string'&&typeof x.action==='string'))) throw new Error('읽기 기록의 형식이 올바르지 않습니다.');
    if (p.unlocked !== undefined && (!Array.isArray(p.unlocked) || !p.unlocked.every(x=>data.meta.ending_names[x]))) throw new Error('엔딩 목록의 형식이 올바르지 않습니다.');
    return clone(p);
  }
  const api={clone,condition,effects,enter,start,choices,choose,puzzle,solve,validateSave};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.DischargeLogic=api;
})(typeof globalThis!=='undefined'?globalThis:this);
