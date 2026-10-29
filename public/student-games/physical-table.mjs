import { mountTabletop } from './tabletop.mjs?v=tabletop3d-20261029-v1';
import { createPhysicalTableState } from './physical-state.mjs?v=exhibition-ux-20261029-v3';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const touchEditing = target => target.closest('textarea,input,select,a,[contenteditable="true"]');

/** A shared pair of hands: move, turn, stack and read physical objects. */
export function mountPhysicalTable(kit, host = document.querySelector('#physical-table-app')) {
  if (!host) throw new TypeError('탁자를 펼칠 자리가 필요합니다.');
  const key = `student-physical-objects:${kit.id}:v1`;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(key)); } catch { /* New table if browser storage is unavailable. */ }
  const model = createPhysicalTableState(kit, saved);
  const introHref = new URL('index.html',document.baseURI).href;
  const printHref = new URL('print.html',document.baseURI).href;
  const gameSlug = kit.id.split('-physical')[0];
  const voteHref = `/student-games/index.html?participate=1&pick=${encodeURIComponent(gameSlug)}#vote`;
  document.body.classList.add('physical-table-page', `physical-${kit.id}`);
  document.title = `${kit.title} — 구성품 테이블`;
  host.innerHTML = `<a class="skip" href="#physical-viewport">탁자로 바로 가기</a>
    <div class="physical-shell tabletop-shell">
      <header class="physical-header"><a class="physical-brand" href="/student-games/index.html" aria-label="학생 보드게임 모음"><img src="/assets/brand/twisdom-horizontal-black.svg" width="110" height="28" alt="Twisdom"></a><div class="physical-heading"><h1>${esc(kit.title)}</h1><p class="physical-subtitle">${esc(kit.subtitle || '')}</p></div><nav aria-label="작품 메뉴"><a href="${esc(introHref)}">작품 소개</a><a href="${esc(printHref)}">구성품 인쇄</a><button type="button" data-hand="help">조작 안내</button><a class="physical-vote-link" href="${esc(voteHref)}">투표하기</a></nav></header>
      <main class="physical-main"><div class="physical-camera" id="physical-camera"></div><p id="physical-scene-status" class="physical-scene-status" role="status" aria-live="polite" aria-atomic="true">입체 탁자를 준비 중입니다. 구성품은 바로 다룰 수 있어요.</p><div id="physical-viewport" class="tabletop-viewport" aria-label="${esc(kit.title)} 구성품 탁자. 구성품을 끌어 옮기고 두 번 누르면 크게 읽습니다."><div id="physical-world" class="tabletop-world"></div></div></main>
      <footer class="physical-hand-tools"><div class="physical-selected-label" id="physical-selection" aria-live="polite">카드를 두 번 눌러 크게 읽어 보세요.</div><div class="physical-tool-buttons" role="group" aria-label="선택한 구성품 다루기"><button type="button" data-hand="flip" aria-keyshortcuts="F" disabled>뒤집기 <kbd>F</kbd></button><button type="button" data-hand="rotate-left" aria-keyshortcuts="Shift+R" aria-label="왼쪽으로 15도 회전" disabled>↶</button><button type="button" data-hand="rotate-right" aria-keyshortcuts="R" aria-label="오른쪽으로 15도 회전" disabled>↷</button><button type="button" data-hand="pile" aria-pressed="false" disabled>더미째 이동</button><button type="button" data-hand="shuffle" disabled>더미 섞기</button><button type="button" data-hand="spread" disabled>나란히 놓기</button><button type="button" data-hand="open" disabled>봉투 펼치기</button><button type="button" data-hand="inspect" disabled>크게 읽기</button><button type="button" data-hand="undo" disabled>되돌리기</button><button type="button" data-hand="reset">처음 배치</button></div></footer><p class="physical-hint">카드 한 장 끌기 / Shift로 더미째 끌기 / F 뒤집기 / R 회전 / 두 번 눌러 크게 읽기</p>
      <p class="physical-live tabletop-sr-only" id="physical-live" role="status" aria-live="polite"></p>
      <dialog id="physical-inspection" aria-labelledby="physical-inspection-title"><header class="physical-inspection-head"><h2 id="physical-inspection-title"></h2><div><button type="button" data-inspection="flip">뒤집기</button><button type="button" data-inspection="close" autofocus>탁자로 돌아가기</button></div></header><div class="physical-inspection-body"></div></dialog>
      <dialog id="physical-help" aria-labelledby="physical-help-title"><header class="physical-inspection-head"><h2 id="physical-help-title">손으로 다루는 법</h2><button type="button" data-help-close autofocus>탁자로 돌아가기</button></header><div class="physical-help-copy"><p>테이블의 카드, 종이, 말과 동전을 직접 옮겨 진행합니다. 게임 준비와 차례, 끝내는 방법은 탁자 위 <strong>규칙서</strong>에 적혀 있습니다.</p><dl><dt>한 장 가져오기</dt><dd>더미 맨 위 카드를 끌어 빈 곳에 놓습니다.</dd><dt>더미 옮기기</dt><dd>Shift를 누른 채 끌거나, 구성품을 고르고 ‘더미째 이동’을 켭니다.</dd><dt>카드 포개기</dt><dd>같은 크기 카드 위에 중심을 맞춰 놓으면 한 더미가 됩니다.</dd><dt>뒤집고 읽기</dt><dd>구성품을 고르고 F로 뒤집습니다. 두 번 누르거나 ‘크게 읽기’로 같은 면을 확대합니다. 반대 면은 직접 뒤집기 전까지 열리지 않습니다.</dd><dt>봉투와 기록지</dt><dd>봉투를 고르고 ‘봉투 펼치기’로 내용물을 꺼냅니다. 종이의 빈칸을 눌러 기록할 수 있습니다.</dd><dt>자리와 시점</dt><dd>선택한 물건은 방향키로 옮기고, R로 돌립니다. 빈 탁자를 끌면 시점이 움직입니다. 전체보기는 물건의 위치를 바꾸지 않습니다. 입체 보기에서는 오른쪽 버튼으로 빈 탁자를 끌어 각도를 바꿉니다.</dd></dl><p>구성품의 위치와 필기는 이 브라우저에 보관됩니다. ‘되돌리기’는 물건을 직전 상태로, ‘처음 배치’는 모든 구성품을 준비 위치로 돌려놓습니다.</p></div></dialog>
      <dialog id="physical-reset" aria-labelledby="physical-reset-title"><header class="physical-inspection-head"><h2 id="physical-reset-title">구성품을 처음 자리로 돌릴까요?</h2></header><div class="physical-help-copy"><p>탁자의 배치와 필기를 처음 상태로 돌려 새로 준비합니다.</p><div class="physical-confirm-buttons"><button type="button" data-reset="cancel" autofocus>계속 두기</button><button type="button" data-reset="confirm">처음 자리로</button></div></div></dialog>
    </div>`;
  const shell = host.querySelector('.physical-shell');
  const world = host.querySelector('#physical-world');
  const viewport = host.querySelector('#physical-viewport');
  const toolbar = host.querySelector('.physical-tool-buttons');
  const inspection = host.querySelector('#physical-inspection');
  const inspectionBody = inspection.querySelector('.physical-inspection-body');
  const helpDialog = host.querySelector('#physical-help'), resetDialog = host.querySelector('#physical-reset');
  const sceneStatus = host.querySelector('#physical-scene-status');
  const dialogReturnFocus = new Map();
  const buttons = Object.fromEntries([...toolbar.querySelectorAll('[data-hand]')].map(b => [b.dataset.hand,b]));
  const nodes = new Map();
  let selected = null, pileMode = false, dragging = null, suppressClick = false, camera, inspectId = null, scene = null, destroyed = false, sceneState = null;
  const cleanups = [];
  const on = (node, event, fn, options) => { node.addEventListener(event, fn, options); cleanups.push(() => node.removeEventListener(event, fn, options)); };
  const announce = text => { host.querySelector('#physical-live').textContent = text; };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(model.snapshot())); } catch { announce('저장 공간이 부족합니다. 이 탭에서는 계속 진행할 수 있습니다.'); } };
  const visibleLabel = id => model.get(id).faceDown ? (model.spec(id).backLabel || (model.spec(id).type === 'card' ? '뒤집어 놓은 카드' : `${model.spec(id).label} 뒷면`)) : model.spec(id).label;
  const countLabel = (id,count) => `${count}${model.spec(id).type === 'token' ? '개' : '장'}`;

  for (const zone of kit.zones || []) {
    const el = document.createElement('div'); el.className = `physical-zone ${zone.className || ''}`;
    Object.assign(el.style, { left:`${zone.x}px`, top:`${zone.y}px`, width:`${zone.width}px`, height:`${zone.height}px` });
    el.innerHTML = zone.html || `<span>${esc(zone.label)}</span>`; world.append(el);
  }
  for (const p of kit.pieces) {
    const el = document.createElement('div'); el.className = 'physical-piece'; el.dataset.piece = p.id; el.dataset.type = p.type || 'card'; el.dataset.draggable = '';
    el.setAttribute('role',p.front.includes('data-note=') ? 'group' : 'button'); el.tabIndex = 0;
    el.setAttribute('aria-keyshortcuts','F R Shift+R ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown Enter Space');
    Object.assign(el.style, { width:`${p.width}px`, height:`${p.height}px` });
    el.style.setProperty('--physical-piece-width',`${p.width}px`); el.style.setProperty('--physical-piece-height',`${p.height}px`); el.style.setProperty('--physical-aspect',String(p.width/p.height));
    el.innerHTML = `<div class="physical-face physical-front">${p.front}</div>${p.back ? `<div class="physical-face physical-back">${p.back}</div>` : ''}<span class="physical-pile-count" aria-hidden="true"></span>`;
    el.querySelectorAll('img').forEach(img => { img.draggable = false; });
    el.querySelectorAll('textarea[data-note],input[data-note]').forEach(input => { input.classList.add('physical-inline-note'); if(!input.hasAttribute('maxlength'))input.maxLength=16000; });
    nodes.set(p.id, el); world.append(el);
  }

  function saveNotes(event) {
    const field = event.target.closest('[data-note]');
    if (!field || !field.matches('input,textarea')) return;
    model.note(field.dataset.note, field.value); save();
    // The enlarged sheet and its original are the same writable piece of paper.
    host.querySelectorAll('textarea[data-note],input[data-note]').forEach(other => { if (other !== field && other.dataset.note === field.dataset.note) other.value = field.value; });
    scene?.sync();
  }
  on(host,'input',saveNotes);

  function updateTools() {
    const p = selected && model.spec(selected), s = selected && model.get(selected), count = s ? model.members(selected).length : 0;
    host.querySelector('.physical-hand-tools').classList.toggle('is-empty',!p);
    host.querySelector('#physical-selection').textContent = p ? `${visibleLabel(selected)}${count > 1 ? ` · ${countLabel(selected,count)} 더미` : ''}` : '카드를 두 번 눌러 크게 읽어 보세요.';
    buttons.flip.disabled = !p?.back; buttons['rotate-left'].disabled = buttons['rotate-right'].disabled = !p || p.locked;
    buttons.pile.disabled = count < 2; buttons.pile.setAttribute('aria-pressed',String(pileMode));
    buttons.shuffle.disabled = buttons.spread.disabled = count < 2;
    buttons.open.disabled = !p?.contains?.length; buttons.open.hidden = !p?.contains?.length;
    if (p?.contains?.length) { const closed=p.contains.some(id=>model.get(id).hidden),book=p.type==='book',box=p.label.includes('보관함');buttons.open.textContent=closed?(book?'규칙서 펼치기':box?'보관함 열기':'봉투 펼치기'):(book?'규칙서 접기':box?'보관함에 넣기':'봉투에 넣기'); }
    buttons.inspect.disabled = !p; buttons.undo.disabled = !model.canUndo();
  }

  function paint() {
    const focused = document.activeElement;
    const focusedPiece = focused?.closest?.('.physical-piece');
    const focusedId = focusedPiece && world.contains(focusedPiece) ? focusedPiece.dataset.piece : null;
    const notes = model.snapshot().notes;
    if (selected) selected = model.members(selected).at(-1) || null;
    if (!selected) pileMode = false;
    for (const p of kit.pieces) {
      const s = model.get(p.id), el = nodes.get(p.id), ids = model.members(p.id), top = ids.at(-1), index = ids.indexOf(p.id);
      const offset = ids.length > 1 ? Math.min(index,7) * .65 : 0;
      el.classList.toggle('is-hidden',s.hidden); el.classList.toggle('is-selected',selected === p.id); el.classList.toggle('is-locked',Boolean(p.locked));
      el.classList.toggle('is-under',ids.length > 1 && top !== p.id); el.classList.toggle('is-top',ids.length > 1 && top === p.id); el.classList.toggle('is-face-down',s.faceDown);
      el.setAttribute('aria-hidden',String(s.hidden || ids.length > 1 && top !== p.id));
      el.style.left = `${s.x + offset * (s.x+p.width/2<kit.size.width/2 ? 1 : -1)}px`; el.style.top = `${s.y + offset * (s.y+p.height/2<kit.size.height/2 ? 1 : -1)}px`; el.style.transform = `rotate(${s.angle}deg)`; el.style.zIndex = String(s.z);
      el.setAttribute('aria-label',visibleLabel(p.id) + (ids.length > 1 ? ` ${countLabel(p.id,ids.length)} 더미` : ''));
      el.setAttribute('aria-pressed',String(selected === p.id)); el.tabIndex = s.hidden || ids.length > 1 && top !== p.id ? -1 : 0;
      el.querySelector('.physical-front').hidden = s.faceDown;
      if (p.back) el.querySelector('.physical-back').hidden = !s.faceDown;
      const badge = el.querySelector('.physical-pile-count'); badge.hidden = ids.length < 2 || top !== p.id; badge.textContent = ids.length > 1 ? countLabel(p.id,ids.length) : '';
      el.querySelectorAll('textarea[data-note],input[data-note]').forEach(input => { const value = Object.hasOwn(notes,input.dataset.note)?notes[input.dataset.note]:input.defaultValue; if (document.activeElement !== input) input.value = value;input.tabIndex=viewport.classList.contains('physical-scene-ready') || camera?.getState().scale<.85?-1:0; });
    }
    updateTools();
    scene?.sync();
    // A shuffle or whole-pile turn may put the focused card underneath another.
    // Keep keyboard operations on the same visible top object as the selection.
    if (focusedId && model.members(focusedId).at(-1) !== focusedId) focusPiece(model.members(focusedId).at(-1) || selected);
    else if (focused && toolbar.contains(focused) && focused.disabled) focusPiece();
  }

  function focusPiece(id = selected) {
    const top = id && model.members(id).at(-1);
    if (top && nodes.has(top)) nodes.get(top).focus({preventScroll:true});
    else viewport.focus({preventScroll:true});
  }
  function restoreTableFocus(preferred) {
    if (destroyed || document.querySelector('dialog[open]')) return;
    if (preferred?.isConnected && !preferred.disabled && !preferred.closest('[hidden],[inert],[aria-hidden="true"],dialog:not([open])')) {
      const piece = preferred.closest('.physical-piece');
      if (!piece || !world.contains(piece)) { preferred.focus({preventScroll:true}); return; }
      if (touchEditing(preferred) && (viewport.classList.contains('physical-scene-ready') || camera?.getState().scale<.85)) { focusPiece(piece.dataset.piece); return; }
      if (model.members(piece.dataset.piece).at(-1) === piece.dataset.piece) { preferred.focus({preventScroll:true}); return; }
      focusPiece(model.members(piece.dataset.piece).at(-1) || selected); return;
    }
    focusPiece();
  }
  function openDialog(dialog) {
    const open = document.querySelector('dialog[open]');
    if (destroyed || open && open !== dialog) return false;
    if (dialog.open) return true;
    dialogReturnFocus.set(dialog,document.activeElement);
    dialog.showModal();
    return true;
  }
  function closeDialog(dialog) { if (dialog.open) dialog.close(); }
  for (const dialog of [inspection,helpDialog,resetDialog]) on(dialog,'close',() => {
    const preferred = dialogReturnFocus.get(dialog); dialogReturnFocus.delete(dialog);
    if (dialog === inspection) { inspectId = null; inspectionBody.replaceChildren(); }
    restoreTableFocus(preferred);
  });
  function select(id, focus = false) {
    if (id && model.get(id)?.hidden) return;
    if (id) id = model.members(id).at(-1) || null;
    if (selected !== id) pileMode = false;
    selected = id; paint();
    if (focus && id) focusPiece(id);
  }
  const change = (fn, message) => { const changed = fn(); if (changed !== false) { paint(); save(); if (message) announce(message); } return changed; };

  function renderInspection() {
    if (!inspectId) return;
    const p = model.spec(inspectId), original = nodes.get(inspectId);
    inspection.querySelector('h2').textContent = visibleLabel(inspectId);
    const flip = inspection.querySelector('[data-inspection="flip"]'); flip.hidden = !p.back; flip.textContent = '뒤집기';
    const available = Math.max(220, Math.min(760, window.innerWidth - 76));
    // A whole printed sheet on a phone would reduce its real body text to 7px.
    // Keep paper legible and let the same reader pan over the sheet instead.
    const scale = Math.max(p.width >= 250 ? 1 : .1, Math.min(Math.max(1,360 / p.width), available / p.width));
    const stage = document.createElement('div'); stage.className = 'physical-inspection-stage'; stage.style.width = `${p.width*scale}px`; stage.style.height = `${p.height*scale}px`;
    const clone = original.cloneNode(true); clone.className = 'physical-piece physical-inspection-copy'; clone.removeAttribute('id'); clone.removeAttribute('role'); clone.removeAttribute('tabindex'); clone.removeAttribute('aria-pressed'); clone.removeAttribute('aria-keyshortcuts');
    clone.removeAttribute('aria-hidden'); clone.style.setProperty('--inspection-scale',String(scale)); clone.style.left = '0'; clone.style.top = '0'; clone.style.zIndex = 'auto'; clone.style.transform = `scale(${scale})`;
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id')); clone.querySelector('.physical-pile-count')?.remove();
    const notes=model.snapshot().notes;
    clone.querySelectorAll('textarea[data-note],input[data-note]').forEach(input => {
      const source=[...original.querySelectorAll('[data-note]')].find(field=>field.dataset.note===input.dataset.note);
      input.value = Object.hasOwn(notes,input.dataset.note)?notes[input.dataset.note]:(source?.value ?? input.defaultValue);input.tabIndex=0;
      // Handwriting stays comfortable on phones without scaling the printed sheet.
      input.style.fontSize=`${Math.max(16,parseFloat(source ? getComputedStyle(source).fontSize : 16)||16)}px`;
    });
    stage.append(clone); inspectionBody.replaceChildren(stage);
  }
  function inspect(id) {
    if (!id || model.get(id)?.hidden || model.members(id).at(-1)!==id || document.querySelector('dialog[open]') && !inspection.open) return;
    inspectId = id; select(id); renderInspection(); openDialog(inspection);
  }
  function closeInspection() { closeDialog(inspection); }
  on(inspection,'click',e => {
    if (e.target.closest('[data-inspection="close"]')) closeInspection();
    if (e.target.closest('[data-inspection="flip"]') && inspectId) { change(() => model.flip(inspectId)); renderInspection(); }
  });

  function run(action) {
    if (document.querySelector('dialog[open]')) return;
    const id = selected;
    if (action === 'help') return openDialog(helpDialog);
    if (action === 'reset') return openDialog(resetDialog);
    if (action === 'undo') { change(() => model.undo(),'직전 배치로 되돌렸습니다.'); if (selected && model.get(selected).hidden) select(null); return; }
    if (!id) return;
    if (action === 'inspect') return inspect(id);
    if (action === 'pile') { pileMode = !pileMode; updateTools(); return; }
    if (action === 'flip') return change(() => model.flip(id,pileMode),'구성품을 뒤집었습니다.');
    if (action === 'rotate-left' || action === 'rotate-right') return change(() => model.rotate(id,action === 'rotate-left' ? -15 : 15,pileMode));
    if (action === 'shuffle') { change(() => model.shuffle(id),'더미를 섞었습니다.'); select(model.members(id).at(-1)); return; }
    if (action === 'spread') return change(() => model.spread(id),'카드를 나란히 놓았습니다.');
    if (action === 'open') { const p=model.spec(id); if (!p.contains?.length) return; const close = !p.contains.some(child => model.get(child).hidden), name=p.type==='book'?'규칙서':p.label.includes('보관함')?'보관함':'봉투'; return change(() => model.container(id,close),close ? `${name} 안에 구성품을 넣었습니다.` : `${name}의 구성품을 탁자에 꺼냈습니다.`); }
  }
  on(host,'click',event => { const button = event.target.closest('[data-hand]'); if (button && !button.disabled) run(button.dataset.hand); });
  on(host.querySelector('[data-help-close]'),'click',() => closeDialog(helpDialog));
  on(host.querySelector('[data-reset="cancel"]'),'click',() => closeDialog(resetDialog));
  on(host.querySelector('[data-reset="confirm"]'),'click',() => { model.reset(); selected = null; pileMode = false; paint(); save(); camera.fit(); closeDialog(resetDialog); announce('구성품을 처음 자리로 돌렸습니다.'); });

  on(world,'pointerdown',event => {
    const el = event.target.closest('.physical-piece');
    if (!el || event.button !== 0) return;
    if (touchEditing(event.target)) { if(camera.getState().scale<.85){event.preventDefault();event.stopPropagation();}return; }
    const id = el.dataset.piece;
    if (!model.get(id) || model.get(id).hidden) return;
    const group = (event.shiftKey || pileMode) && selected === id;
    if (selected !== id) select(id);
    if (!model.isMovable(id)) return;
    event.preventDefault(); event.stopPropagation();
    const start = camera.getState(); dragging = { id, pointer:event.pointerId, x:event.clientX, y:event.clientY, scale:start.scale, group:event.shiftKey || group, dx:0,dy:0,moved:false };
    try { el.setPointerCapture(event.pointerId); } catch { /* Pointer capture not supported. */ }
    el.focus({preventScroll:true});
  });
  on(world,'pointermove',event => {
    if (!dragging || event.pointerId !== dragging.pointer) return;
    const dx = (event.clientX-dragging.x)/dragging.scale, dy = (event.clientY-dragging.y)/dragging.scale;
    if (!dragging.moved && Math.hypot(event.clientX-dragging.x,event.clientY-dragging.y) < 5) return;
    event.preventDefault(); dragging.moved = true; dragging.dx = dx; dragging.dy = dy;
    const ids = dragging.group ? model.members(dragging.id) : [dragging.id];
    for (const id of ids) { const p = model.get(id), el = nodes.get(id); el.classList.add('is-dragging'); el.style.left = `${p.x+dx}px`; el.style.top = `${p.y+dy}px`; el.style.zIndex = '1000001'; }
  });
  // Pointer picking keeps the object under the hand; keyboard focus may reveal it.
  on(world,'focusin',event=>{if(dragging)event.stopPropagation();});
  // DOM and 3D hands commit exactly the same physical move and optional stack.
  function commitMove(id, dx, dy, wholePile = false) {
    if (!model.isMovable(id) || ![dx,dy].every(Number.isFinite)) return false;
    const moved = wholePile ? model.members(id) : [id];
    const changed = model.batch(() => {
      model.move(id,dx,dy,wholePile);
      const p = model.get(id), spec = model.spec(id);
      const target = kit.pieces.filter(other => other.id !== id && !moved.includes(other.id) && other.type === spec.type && !model.get(other.id).hidden && model.members(other.id).at(-1) === other.id && Math.abs(other.width-spec.width)<1 && Math.abs(other.height-spec.height)<1).sort((a,b)=>model.get(b.id).z-model.get(a.id).z).find(other => { const s=model.get(other.id); return Math.abs(s.x-p.x)<28 && Math.abs(s.y-p.y)<28; });
      if (['card','token'].includes(spec.type) && target) model.stack(moved,target.id);
    });
    if (changed) { save(); announce(`${visibleLabel(id)} 구성품을 옮겼습니다.`); }
    paint();
    return changed;
  }
  function finishDrag(event, cancelled = false) {
    if (!dragging || event.pointerId !== dragging.pointer) return;
    const d = dragging; dragging = null;
    if (d.moved && !cancelled) { commitMove(d.id,d.dx,d.dy,d.group); suppressClick = true; }
    nodes.forEach(node => node.classList.remove('is-dragging')); paint();
  }
  on(world,'pointerup',event => finishDrag(event));
  on(world,'pointercancel',event => finishDrag(event,true));
  on(world,'lostpointercapture',event => finishDrag(event,true));
  on(world,'click',event => {
    if (touchEditing(event.target)) { if(camera.getState().scale<.85){event.preventDefault();const id=event.target.closest('.physical-piece')?.dataset.piece;if(id)inspect(id);}return; }
    if (suppressClick) { suppressClick = false; event.preventDefault(); return; }
    const el = event.target.closest('.physical-piece');
    if (el) { const id=el.dataset.piece; if (selected!==id) select(id); } else select(null);
  });
  on(world,'dblclick',event => { if (!touchEditing(event.target)) { const el=event.target.closest('.physical-piece'); if (el) inspect(el.dataset.piece); } });
  function handlePieceKey(event) {
    if (touchEditing(event.target) || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || document.querySelector('dialog[open]')) return;
    const piece = event.target.closest('.physical-piece'), fromPiece = piece && world.contains(piece);
    const fromTools = toolbar.contains(event.target) && event.target.closest('button[data-hand]');
    if (!fromPiece && !fromTools) return;
    const key = event.key.toLowerCase();
    // Native Enter/Space continue to activate the focused toolbar button.
    if (fromTools && !['f','r'].includes(key)) return;
    if (!['f','r','enter',' ','arrowleft','arrowright','arrowup','arrowdown'].includes(key)) return;
    const rawId = fromPiece ? piece.dataset.piece : selected;
    const id = rawId && model.members(rawId).at(-1);
    if (!id) return;
    event.preventDefault(); event.stopPropagation(); if (selected!==id) select(id);
    if (fromPiece && rawId!==id) focusPiece(id);
    if (key==='f') run('flip'); else if (key==='r') run(event.shiftKey?'rotate-left':'rotate-right'); else if (key==='enter') inspect(id); else if (key===' ') updateTools();
    else { const step=event.shiftKey?40:10; change(()=>model.move(id,key==='arrowleft'?-step:key==='arrowright'?step:0,key==='arrowup'?-step:key==='arrowdown'?step:0,pileMode)); }
  }
  on(host,'keydown',handlePieceKey);
  on(window,'resize',() => { if (inspection.open) renderInspection(); });
  camera = mountTabletop({ viewport,world,controls:host.querySelector('#physical-camera'),width:kit.size.width,height:kit.size.height,fullscreenTarget:shell,padding:24 });
  const helpId=viewport.getAttribute('aria-describedby')?.split(' ').at(-1);
  if(helpId)document.getElementById(helpId).textContent='빈 탁자를 끌면 시점이 움직입니다. 구성품을 끌어 옮기고, F로 뒤집고 R로 회전합니다. 두 번 누르거나 Enter로 같은 면을 크게 읽습니다. 축소된 기록지의 빈칸을 누르면 그 종이를 들어서 기록합니다.';
  let fieldAccessSmall=null;
  on(viewport,'tabletopchange',()=>{
    const small=viewport.classList.contains('physical-scene-ready') || camera.getState().scale<.85;
    if(small===fieldAccessSmall)return;
    fieldAccessSmall=small;
    world.querySelectorAll('textarea[data-note],input[data-note]').forEach(input=>{input.tabIndex=small?-1:0;});
  });
  on(viewport,'click',event=>{if(event.target===viewport)select(null);});
  paint();
  function setSceneState(state) {
    if (destroyed || sceneState === state) return;
    sceneState = state; shell.dataset.sceneState = state; viewport.dataset.sceneState = state; sceneStatus.dataset.sceneState = state;
    sceneStatus.textContent = state === 'ready' ? '입체 탁자가 준비됐습니다.' : state === 'fallback' ? '기본 탁자로 표시합니다. 구성품 조작과 기록은 계속 사용할 수 있어요.' : '입체 탁자를 준비 중입니다. 구성품은 바로 다룰 수 있어요.';
  }
  const sceneFallback = () => {
    const failed = scene; scene = null; failed?.destroy();
    if (destroyed) return;
    const instructions=host.querySelector('.tabletop-instructions');
    if(instructions)instructions.textContent='빈 자리를 드래그하여 이동하고, 휠로 확대하세요.';
    paint(); setSceneState('fallback');
  };
  setSceneState('loading');
  const ready = (async () => {
    try {
      const { mountPhysicalScene } = await import('./physical-scene.mjs?v=exhibition-ux-20261029-v3');
      if (destroyed) return false;
      const mounted = mountPhysicalScene({ viewport, world, kit, model, camera, onSelect:id=>{ select(id,true); if (!id) viewport.focus({preventScroll:true}); }, onMove:commitMove, onInspect:inspect, getSelection:()=>selected, getPileMode:()=>pileMode, onError:sceneFallback });
      scene = mounted;
      await mounted.ready;
      if (destroyed) { mounted.destroy(); return false; }
      if (scene !== mounted || !viewport.classList.contains('physical-scene-ready')) return false;
      paint(); setSceneState('ready');
      const instructions=host.querySelector('.tabletop-instructions');
      if(instructions)instructions.textContent='빈 자리 끌기 / 휠로 확대 / 오른쪽 드래그로 시점 회전';
      return true;
    } catch { sceneFallback(); return false; }
  })();
  return { camera, ready, destroy() { if (destroyed) return; destroyed = true; for (const dialog of [inspection,helpDialog,resetDialog]) closeDialog(dialog); scene?.destroy(); scene = null; camera.destroy(); cleanups.forEach(fn=>fn()); } };
}

export default mountPhysicalTable;
