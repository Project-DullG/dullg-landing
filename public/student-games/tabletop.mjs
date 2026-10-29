/**
 * A camera for real DOM game components. It never reads or changes game state.
 *
 * Import mountTabletop from the shared tabletop module in the parent directory.
 * const camera = mountTabletop({ viewport, world, controls, width: 1360, height: 920 });
 *
 * Put controls/readers outside the transformed world. Buttons, links and form
 * controls retain their normal behaviour. Mark any other clickable component
 * with data-tabletop-no-pan. Camera keys work only on the viewport itself.
 */

const mounted = new WeakMap();
let cameraId = 0;
const NO_PAN = 'button,a,input,textarea,select,option,label,summary,details,audio,video,iframe,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="slider"],[role="textbox"],[role="checkbox"],[role="radio"],[data-tabletop-no-pan],[data-tabletop-interactive],[data-no-pan],[data-draggable]';
const NO_ZOOM = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),dialog,[data-tabletop-scroll],[data-tabletop-no-zoom]';
const positive = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const element = (value, doc) => typeof value === 'string' ? doc.querySelector(value) : value;

/** Mount once, then call fit() only for an explicit return to the whole table. */
export function mountTabletop(options = {}) {
  const doc = options.viewport?.ownerDocument || globalThis.document;
  if (!doc) throw new TypeError('A tabletop camera needs a document.');
  const viewport = element(options.viewport, doc);
  if (!viewport) throw new TypeError('A tabletop viewport is required.');
  if (mounted.has(viewport)) return mounted.get(viewport);
  const world = element(options.world, doc) || viewport.querySelector('[data-tabletop-world],.tabletop-world');
  if (!world || !viewport.contains(world)) throw new TypeError('The tabletop world must be inside its viewport.');
  const controls = element(options.controls, doc) || null;
  if (controls && world.contains(controls)) throw new TypeError('Tabletop controls must stay outside the world.');
  const win = doc.defaultView || globalThis.window;
  const padding = Math.max(0, Number(options.padding ?? 24) || 0);
  let width = positive(options.width ?? world.dataset.width, 1360);
  let height = positive(options.height ?? world.dataset.height, 920);
  let size = { width: 0, height: 0 };
  let state = { x: 0, y: 0, scale: 1, fitScale: 1, mode: 'fit' };
  let ready = false;
  let destroyed = false;
  let gesture = null;
  let suppressedUntil = 0;
  let resizeFrame = 0;
  let announceTimer = 0;
  let expanded = false;
  let fullscreenPending = false;
  let expandedSnapshot = null;
  let expandedBridges = [];
  const pointers = new Map();
  const cleanups = [];
  const generated = [];
  const original = {
    tabIndex: viewport.getAttribute('tabindex'),
    role: viewport.getAttribute('role'),
    label: viewport.getAttribute('aria-label'),
    describedBy: viewport.getAttribute('aria-describedby'),
    shortcuts: viewport.getAttribute('aria-keyshortcuts'),
    worldTransform: world.style.transform,
    worldWidth: world.style.width,
    worldHeight: world.style.height,
  };

  viewport.classList.add('tabletop-viewport');
  world.classList.add('tabletop-world');
  viewport.dataset.tabletopViewport = '';
  world.dataset.tabletopWorld = '';
  if (!viewport.hasAttribute('tabindex')) viewport.tabIndex = 0;
  if (!viewport.hasAttribute('role')) viewport.setAttribute('role', 'region');
  if (!viewport.hasAttribute('aria-label')) viewport.setAttribute('aria-label', '게임 테이블');
  viewport.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight + - 0 Home');

  const help = doc.createElement('p');
  help.id = `tabletop-help-${++cameraId}`;
  help.className = 'tabletop-sr-only';
  help.textContent = '빈 자리를 드래그하면 이동합니다. 휠이나 두 손가락으로 확대와 축소를 할 수 있습니다. 테이블에 초점을 맞춘 뒤 방향키로 이동하고, 더하기와 빼기 키로 확대와 축소, 0 또는 Home 키로 전체를 볼 수 있습니다. 카드를 누르면 각 게임의 상세 보기가 열립니다.';
  viewport.insertAdjacentElement('afterend', help);
  generated.push(help);
  viewport.setAttribute('aria-describedby', [original.describedBy, help.id].filter(Boolean).join(' '));

  const status = doc.createElement('span');
  status.className = 'tabletop-sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  help.insertAdjacentElement('afterend', status);
  generated.push(status);

  if (controls) {
    controls.classList.add('tabletop-controls');
    if (!controls.children.length) {
      controls.innerHTML = '<div class="tabletop-control-buttons" role="group" aria-label="테이블 보기"><button type="button" data-tabletop-action="fit">전체보기</button><button type="button" data-tabletop-action="zoom-in" aria-label="테이블 확대"><span aria-hidden="true">＋</span> 확대</button><button type="button" data-tabletop-action="zoom-out" aria-label="테이블 축소"><span aria-hidden="true">−</span> 축소</button><button type="button" data-tabletop-action="fullscreen">전체화면</button><output class="tabletop-scale" data-tabletop-scale aria-label="전체보기 기준 확대 비율"></output></div><p class="tabletop-instructions">빈 자리를 드래그하여 이동하고, 휠로 확대하세요.</p>';
    }
  }
  const fullscreenTarget = element(options.fullscreenTarget, doc)
    || viewport.closest('.tabletop-shell')
    || (controls && viewport.parentElement?.contains(controls) ? viewport.parentElement : viewport);
  // Keep native document-wide targets, but use a component container for the
  // CSS fallback so fixing <html> cannot change dialog/page-tool positioning.
  const isExpandedContainer = target => target && target !== doc.documentElement && target !== doc.body
    && target.contains(viewport) && (!controls || target.contains(controls));
  let expandedTarget = isExpandedContainer(fullscreenTarget) ? fullscreenTarget : viewport.parentElement;
  while (expandedTarget && !isExpandedContainer(expandedTarget)) expandedTarget = expandedTarget.parentElement;
  expandedTarget ||= viewport.parentElement || viewport;
  const fullscreenButtons = controls ? [...controls.querySelectorAll('[data-tabletop-action="fullscreen"]')] : [];
  if (options.fullscreen === false) fullscreenButtons.forEach(button => { button.hidden = true; });

  function updateFullscreenButtons() {
    const native = doc.fullscreenElement === fullscreenTarget;
    fullscreenButtons.forEach(button => {
      button.textContent = expanded ? '화면 채우기 닫기' : native ? '전체화면 닫기' : '전체화면';
      button.setAttribute('aria-pressed', String(expanded || native));
    });
  }

  function on(target, type, callback, config) {
    target.addEventListener(type, callback, config);
    cleanups.push(() => target.removeEventListener(type, callback, config));
  }

  function writeDimensions() {
    world.style.width = `${width}px`;
    world.style.height = `${height}px`;
    world.style.setProperty('--tabletop-width', `${width}px`);
    world.style.setProperty('--tabletop-height', `${height}px`);
    world.dataset.width = String(width);
    world.dataset.height = String(height);
  }

  function limits() {
    return { min: state.fitScale * positive(options.minFitRatio, .65), max: Math.max(state.fitScale, positive(options.maxScale, 2.6)) };
  }

  function fitScale() {
    return Math.max(.0001, Math.min(Math.max(1, size.width - padding * 2) / width, Math.max(1, size.height - padding * 2) / height));
  }

  function boundAxis(position, content, available) {
    if (content <= available - padding * 2) return (available - content) / 2;
    return clamp(position, available - content - padding, padding);
  }

  function bound() {
    state.x = boundAxis(state.x, width * state.scale, size.width);
    state.y = boundAxis(state.y, height * state.scale, size.height);
  }

  function announce() {
    win.clearTimeout(announceTimer);
    announceTimer = win.setTimeout(() => {
      if (!destroyed) status.textContent = `${state.mode === 'fit' ? '전체 테이블' : '테이블 보기'}, 확대 비율 ${Math.round(state.scale / state.fitScale * 100)}퍼센트`;
    }, 240);
  }

  function paint(notify = true) {
    if (!ready || destroyed) return;
    bound();
    world.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.scale})`;
    world.style.setProperty('--tabletop-scale', String(state.scale));
    world.style.setProperty('--tabletop-inverse-scale', String(1 / state.scale));
    viewport.dataset.tabletopMode = state.mode;
    if (controls) {
      const { min, max } = limits();
      controls.querySelectorAll('[data-tabletop-scale]').forEach(output => { output.textContent = `${Math.round(state.scale / state.fitScale * 100)}%`; });
      controls.querySelectorAll('[data-tabletop-action="zoom-in"]').forEach(button => { button.disabled = state.scale >= max - .0001; });
      controls.querySelectorAll('[data-tabletop-action="zoom-out"]').forEach(button => { button.disabled = state.scale <= min + .0001; });
      controls.querySelectorAll('[data-tabletop-action="fit"]').forEach(button => { button.setAttribute('aria-pressed', String(state.mode === 'fit')); });
    }
    if (notify) {
      viewport.dispatchEvent(new win.CustomEvent('tabletopchange', { detail: getState() }));
      options.onChange?.(getState());
      announce();
    }
  }

  function measure() {
    if (destroyed) return;
    const next = { width: viewport.clientWidth, height: viewport.clientHeight };
    if (!next.width || !next.height) return;
    if (ready && next.width === size.width && next.height === size.height) return;
    const center = ready ? { x: (size.width / 2 - state.x) / state.scale, y: (size.height / 2 - state.y) / state.scale } : null;
    size = next;
    state.fitScale = fitScale();
    if (!ready || state.mode === 'fit') {
      state.scale = state.fitScale;
      state.x = (size.width - width * state.scale) / 2;
      state.y = (size.height - height * state.scale) / 2;
    } else {
      const { min, max } = limits();
      state.scale = clamp(state.scale, min, max);
      state.x = size.width / 2 - center.x * state.scale;
      state.y = size.height / 2 - center.y * state.scale;
    }
    ready = true;
    paint();
  }

  function scheduleMeasure() {
    win.cancelAnimationFrame(resizeFrame);
    resizeFrame = win.requestAnimationFrame(measure);
  }

  function fit() {
    if (destroyed) return;
    stopGesture();
    state.mode = 'fit';
    if (!ready) measure();
    if (!ready) return;
    state.fitScale = fitScale();
    state.scale = state.fitScale;
    state.x = (size.width - width * state.scale) / 2;
    state.y = (size.height - height * state.scale) / 2;
    paint();
  }

  function zoomTo(scale, point = { x: size.width / 2, y: size.height / 2 }) {
    if (!ready || destroyed) return;
    const { min, max } = limits();
    const next = clamp(scale, min, max);
    if (Math.abs(next - state.scale) < .000001) return;
    const anchor = { x: (point.x - state.x) / state.scale, y: (point.y - state.y) / state.scale };
    state.mode = 'manual';
    state.scale = next;
    state.x = point.x - anchor.x * state.scale;
    state.y = point.y - anchor.y * state.scale;
    paint();
  }

  function localPoint(event) {
    const rect = viewport.getBoundingClientRect();
    return { x: event.clientX - rect.left - viewport.clientLeft, y: event.clientY - rect.top - viewport.clientTop };
  }

  function stopGesture() {
    gesture = null;
    viewport.classList.remove('tabletop-panning');
    for (const id of pointers.keys()) {
      try { if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id); } catch { /* A cancelled pointer may already be gone. */ }
    }
    pointers.clear();
  }

  function startPan(pointer) {
    gesture = { kind: 'pan', id: pointer.id, start: pointer, x: state.x, y: state.y, moved: false };
  }

  function startPinch() {
    const [a, b] = pointers.values();
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    gesture = { kind: 'pinch', distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), scale: state.scale, anchor: { x: (center.x - state.x) / state.scale, y: (center.y - state.y) / state.scale }, moved: true };
    viewport.classList.add('tabletop-panning');
  }

  on(viewport, 'pointerdown', event => {
    if (!ready || event.button !== 0 || event.target.closest(NO_PAN)) return;
    const point = { ...localPoint(event), id: event.pointerId };
    pointers.set(event.pointerId, point);
    try { viewport.setPointerCapture(event.pointerId); } catch { /* Capture is optional for synthetic events. */ }
    if (pointers.size >= 2) startPinch();
    else {
      startPan(point);
      viewport.focus({ preventScroll: true });
    }
  });

  on(viewport, 'pointermove', event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, { ...localPoint(event), id: event.pointerId });
    if (gesture.kind === 'pinch') {
      if (pointers.size < 2) return;
      const [a, b] = pointers.values();
      const { min, max } = limits();
      state.scale = clamp(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, min, max);
      state.x = (a.x + b.x) / 2 - gesture.anchor.x * state.scale;
      state.y = (a.y + b.y) / 2 - gesture.anchor.y * state.scale;
    } else {
      if (event.pointerId !== gesture.id) return;
      const point = pointers.get(event.pointerId);
      const dx = point.x - gesture.start.x;
      const dy = point.y - gesture.start.y;
      if (!gesture.moved && Math.hypot(dx, dy) < 5) return;
      gesture.moved = true;
      state.x = gesture.x + dx;
      state.y = gesture.y + dy;
      viewport.classList.add('tabletop-panning');
    }
    state.mode = 'manual';
    event.preventDefault();
    paint();
  });

  function endPointer(event) {
    if (!pointers.has(event.pointerId)) return;
    const moved = gesture?.moved;
    pointers.delete(event.pointerId);
    if (moved) suppressedUntil = Date.now() + 350;
    gesture = null;
    viewport.classList.remove('tabletop-panning');
    try { if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId); } catch { /* Nothing to release after a cancellation. */ }
    if (pointers.size === 1) startPan(pointers.values().next().value);
    else if (pointers.size > 1) startPinch();
  }
  on(viewport, 'pointerup', endPointer);
  on(viewport, 'pointercancel', endPointer);
  on(viewport, 'lostpointercapture', endPointer);
  on(win, 'blur', stopGesture);
  on(doc, 'visibilitychange', () => { if (doc.hidden) stopGesture(); });
  on(viewport, 'click', event => {
    if (event.detail !== 0 && Date.now() < suppressedUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  on(viewport, 'wheel', event => {
    if (!ready || event.target.closest(NO_ZOOM) || !event.deltaY) return;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.height : 1);
    event.preventDefault();
    zoomTo(state.scale * Math.exp(clamp(-delta * .0018, -.6, .6)), localPoint(event));
  }, { passive: false });

  on(viewport, 'keydown', event => {
    if (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey || doc.querySelector('dialog[open]')) return;
    const key = event.key.toLowerCase();
    if (!['arrowleft', 'arrowright', 'arrowup', 'arrowdown', '+', '=', '-', '_', '0', 'home', 'f'].includes(key)) return;
    event.preventDefault();
    event.stopPropagation();
    if (key === '0' || key === 'home' || key === 'f') return fit();
    if (key === '+' || key === '=') return zoomTo(state.scale * 1.25);
    if (key === '-' || key === '_') return zoomTo(state.scale / 1.25);
    const step = event.shiftKey ? 160 : 64;
    state.mode = 'manual';
    state.x += key === 'arrowleft' ? step : key === 'arrowright' ? -step : 0;
    state.y += key === 'arrowup' ? step : key === 'arrowdown' ? -step : 0;
    paint();
  });

  // Tab navigation should move the camera, rather than leave a focused card
  // outside the viewport or create an untracked native overflow scroll.
  on(viewport, 'focusin', event => {
    if (!ready || event.target === viewport || !world.contains(event.target)) return;
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    const target = event.target.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    const left = target.left - bounds.left - viewport.clientLeft;
    const top = target.top - bounds.top - viewport.clientTop;
    const inset = Math.max(12, padding);
    const shift = (start, length, available) => length > available - inset * 2
      ? available / 2 - start - length / 2
      : start < inset ? inset - start : start + length > available - inset ? available - inset - start - length : 0;
    const dx = shift(left, target.width, size.width);
    const dy = shift(top, target.height, size.height);
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    state.mode = 'manual';
    state.x += dx;
    state.y += dy;
    paint();
  });

  function closeExpanded({ restoreFocus = true } = {}) {
    if (!expanded) return;
    expanded = false;
    expandedTarget.classList.remove('tabletop-expanded');
    expandedBridges.forEach(node => node.classList.remove('tabletop-expanded-bridge'));
    expandedBridges = [];
    const snapshot = expandedSnapshot;
    expandedSnapshot = null;
    if (snapshot) {
      if (snapshot.overflow) doc.body.style.setProperty('overflow', snapshot.overflow, snapshot.priority);
      else doc.body.style.removeProperty('overflow');
      if (Number.isFinite(snapshot.scrollX) && Number.isFinite(snapshot.scrollY)) win.scrollTo?.(snapshot.scrollX, snapshot.scrollY);
    }
    updateFullscreenButtons();
    if (!destroyed) {
      scheduleMeasure();
      paint();
      if (restoreFocus) {
        const focus = snapshot?.focus?.isConnected ? snapshot.focus : fullscreenButtons[0] || viewport;
        focus.focus({ preventScroll: true });
      }
      status.textContent = '화면 채우기를 닫았습니다.';
    }
  }

  function openExpanded() {
    if (destroyed || expanded || options.fullscreen === false) return;
    stopGesture();
    expandedSnapshot = {
      overflow: doc.body.style.getPropertyValue('overflow'),
      priority: doc.body.style.getPropertyPriority('overflow'),
      focus: doc.activeElement,
      scrollX: win.scrollX,
      scrollY: win.scrollY,
    };
    expanded = true;
    doc.body.style.setProperty('overflow', 'hidden');
    expandedTarget.classList.add('tabletop-expanded');
    for (let node = viewport.parentElement; node && node !== expandedTarget; node = node.parentElement) {
      if (!node.classList.contains('tabletop-expanded-bridge')) {
        node.classList.add('tabletop-expanded-bridge');
        expandedBridges.push(node);
      }
    }
    updateFullscreenButtons();
    scheduleMeasure();
    paint();
    status.textContent = '테이블을 화면 가득 펼쳤습니다. 화면 채우기 닫기 버튼이나 Escape 키로 돌아갈 수 있습니다.';
  }

  async function toggleFullscreen() {
    if (destroyed || options.fullscreen === false || fullscreenPending) return;
    if (expanded) return closeExpanded();
    fullscreenPending = true;
    try {
      if (doc.fullscreenElement) await doc.exitFullscreen();
      else if (typeof fullscreenTarget.requestFullscreen === 'function' && doc.fullscreenEnabled !== false) {
        await fullscreenTarget.requestFullscreen();
        if (doc.fullscreenElement !== fullscreenTarget) openExpanded();
      } else openExpanded();
    } catch {
      openExpanded();
    } finally {
      fullscreenPending = false;
      if (!destroyed) updateFullscreenButtons();
    }
  }
  if (controls) on(controls, 'click', event => {
    const button = event.target.closest('[data-tabletop-action]');
    if (!button || !controls.contains(button) || button.disabled) return;
    const action = button.dataset.tabletopAction;
    if (!['fit', 'zoom-in', 'zoom-out', 'fullscreen'].includes(action)) return;
    event.preventDefault();
    if (action === 'fit') fit();
    if (action === 'zoom-in') zoomTo(state.scale * 1.25);
    if (action === 'zoom-out') zoomTo(state.scale / 1.25);
    if (action === 'fullscreen') toggleFullscreen();
  });
  on(doc, 'fullscreenchange', () => {
    updateFullscreenButtons();
    scheduleMeasure();
  });
  on(doc, 'keydown', event => {
    if (event.key !== 'Escape' || !expanded || doc.querySelector('dialog[open]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeExpanded();
  }, true);
  on(win, 'resize', scheduleMeasure);
  const Observer = win.ResizeObserver || globalThis.ResizeObserver;
  const observer = Observer ? new Observer(scheduleMeasure) : null;
  observer?.observe(viewport);

  /** Reveal a world-coordinate rectangle or one of the world's DOM children. */
  function reveal(target, config = {}) {
    if (!ready || destroyed) return;
    let rect = target;
    if (target?.getBoundingClientRect) {
      if (!world.contains(target)) return;
      const visual = target.getBoundingClientRect();
      const origin = world.getBoundingClientRect();
      rect = { x: (visual.left - origin.left) / state.scale, y: (visual.top - origin.top) / state.scale, width: visual.width / state.scale, height: visual.height / state.scale };
    }
    if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return;
    stopGesture();
    const inset = Math.max(0, Number(config.padding ?? padding) || 0);
    const { min, max } = limits();
    state.mode = 'manual';
    state.scale = clamp(Math.min(Math.max(1, size.width - inset * 2) / rect.width, Math.max(1, size.height - inset * 2) / rect.height), min, max);
    state.x = size.width / 2 - (rect.x + rect.width / 2) * state.scale;
    state.y = size.height / 2 - (rect.y + rect.height / 2) * state.scale;
    paint();
  }

  function setSize(nextWidth, nextHeight) {
    if (destroyed) return;
    width = positive(nextWidth, width);
    height = positive(nextHeight, height);
    writeDimensions();
    state.fitScale = fitScale();
    if (state.mode === 'fit') fit();
    else {
      const { min, max } = limits();
      state.scale = clamp(state.scale, min, max);
      paint();
    }
  }

  function getState() {
    return { ...state, width, height, viewportWidth: size.width, viewportHeight: size.height, expanded, fullscreen: doc.fullscreenElement === fullscreenTarget };
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    closeExpanded({ restoreFocus: false });
    stopGesture();
    observer?.disconnect();
    cleanups.forEach(cleanup => cleanup());
    win.cancelAnimationFrame(resizeFrame);
    win.clearTimeout(announceTimer);
    generated.forEach(node => node.remove());
    world.style.transform = original.worldTransform;
    world.style.width = original.worldWidth;
    world.style.height = original.worldHeight;
    for (const [attribute, value] of Object.entries({ tabindex: original.tabIndex, role: original.role, 'aria-label': original.label, 'aria-describedby': original.describedBy, 'aria-keyshortcuts': original.shortcuts })) {
      if (value === null) viewport.removeAttribute(attribute);
      else viewport.setAttribute(attribute, value);
    }
    delete viewport.dataset.tabletopMode;
    mounted.delete(viewport);
  }

  const api = { fit, zoomIn: () => zoomTo(state.scale * 1.25), zoomOut: () => zoomTo(state.scale / 1.25), zoomTo, reveal, setSize, toggleFullscreen, refresh: scheduleMeasure, getState, destroy };
  mounted.set(viewport, api);
  writeDimensions();
  updateFullscreenButtons();
  measure();
  scheduleMeasure();
  return api;
}

/** Optional explicit mounting for pages that use data attributes throughout. */
export function mountTabletops(scope = document) {
  return [...scope.querySelectorAll('[data-tabletop-viewport]')].map(viewport => mountTabletop({
    viewport,
    world: viewport.querySelector('[data-tabletop-world]'),
    controls: viewport.closest('.tabletop-shell')?.querySelector('[data-tabletop-controls]'),
  }));
}
