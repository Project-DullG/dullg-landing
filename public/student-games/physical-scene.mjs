/** A physical presentation of the manual table. This module owns no game rules. */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rad = degrees => degrees * Math.PI / 180;
const relative = (path, base) => new URL(path, base).href;

/** Camera mapping is independent of piece state and can be checked without GL. */
export function computeSceneView(state, width, height, aspect, tilt = rad(29), azimuth = 0, framing = {}) {
  const tangent = Math.tan(rad(32) / 2);
  const sinA = Math.sin(azimuth), cosA = Math.cos(azimuth), sinT = Math.sin(tilt), cosT = Math.cos(tilt);
  const margin = framing.margin ?? 75, depth = framing.depth ?? 80, padding = framing.padding ?? .05;
  const corners = [];
  for (const x of [-width / 2 - margin, width / 2 + margin]) for (const z of [-height / 2 - margin, height / 2 + margin]) for (const y of [-depth - .5, 0]) {
    corners.push({ across: cosA * x - sinA * z, up: -sinA * cosT * x + sinT * y - cosA * cosT * z, toward: sinA * sinT * x + cosT * y + cosA * sinT * z });
  }
  // Translate the optical centre in the camera's own plane. Unlike aiming at
  // the XY midpoint, this centres the perspective bounds of the actual rim.
  function centredAxis(distance, axis) {
    let shift = 0, low, high;
    for (let attempt = 0; attempt < 5; attempt++) {
      let min = Infinity, max = -Infinity;
      for (const corner of corners) {
        const value = (corner[axis] - shift) / (distance - corner.toward);
        if (value < min) { min = value; low = corner; }
        if (value > max) { max = value; high = corner; }
      }
      shift = (low[axis] * (distance - high.toward) + high[axis] * (distance - low.toward)) / (2 * distance - low.toward - high.toward);
    }
    const values = corners.map(corner => (corner[axis] - shift) / (distance - corner.toward));
    return { shift, span: Math.max(...values) - Math.min(...values) };
  }
  let low = Math.max(1, ...corners.map(corner => corner.toward + 1));
  let high = Math.max(low * 2, width / Math.max(.05, aspect) * 4, height * 4);
  const limit = 2 / (1 + padding);
  for (let attempt = 0; attempt < 30; attempt++) {
    const distance = (low + high) / 2;
    if (centredAxis(distance, 'across').span / (tangent * Math.max(.05, aspect)) <= limit && centredAxis(distance, 'up').span / tangent <= limit) high = distance;
    else low = distance;
  }
  const distance = high;
  const offsetX = centredAxis(distance, 'across').shift, offsetY = centredAxis(distance, 'up').shift;
  const zoom = Math.max(.1, state.scale / Math.max(.0001, state.fitScale));
  const x = (state.viewportWidth / 2 - state.x) / state.scale + (cosA * offsetX - sinA * cosT * offsetY) / zoom;
  const y = sinT * offsetY / zoom;
  const z = (state.viewportHeight / 2 - state.y) / state.scale + (-sinA * offsetX - cosA * cosT * offsetY) / zoom;
  const d = distance / zoom;
  return { target: { x, y, z }, position: { x: x + sinA * sinT * d, y: y + cosT * d, z: z + cosA * sinT * d }, distance: d };
}

/** Wrap ink without dropping Korean characters or user-entered newlines. */
export function wrapInkLines(context, text, width) {
  const lines = [];
  for (const paragraph of String(text).replace(/\r/g, '').split('\n')) {
    let line = '';
    for (const char of Array.from(paragraph)) {
      if (line && context.measureText(line + char).width > width) { lines.push(line); line = char; }
      else line += char;
    }
    lines.push(line);
  }
  return lines;
}

export function mountPhysicalScene(options) {
  const { viewport, world, kit, model, camera, onSelect = () => {}, onMove = () => {}, onInspect = () => {}, getSelection = () => null, getPileMode = () => false, onReady } = options;
  if (!viewport || !world || !kit || !model || !camera) throw new TypeError('A viewport, world, kit, model and camera are required.');
  const doc = viewport.ownerDocument;
  const win = doc.defaultView;
  const debug = new URLSearchParams(win.location?.search || '').has('scene-debug');
  const instructions = viewport.parentElement?.querySelector?.('.tabletop-instructions')
    || viewport.closest?.('.physical-shell')?.querySelector?.('.tabletop-instructions') || null;
  const originalInstructions = instructions?.textContent;
  const config = kit.scene || kit.presentation || {};
  const perMm = Number(config.worldPerMm) || 2.5;
  const slug = config.slug || kit.id.split('-physical')[0];
  const atlasUrl = relative(config.atlas || `./${slug}/assets/tabletop3d/atlas.json`, import.meta.url);
  const resources = new Set();
  const cleanups = [];
  const objects = new Map();
  const geometryCache = new Map();
  const outlineCache = new Map();
  const faceMaterials = new Map();
  const noteMaterials = new Map();
  const atlasImages = new Map();
  const atlasTextures = new Map();
  const loadingPages = new Map();
  const picks = [];
  let activePicks = [];
  const touches = new Map();
  const originalNoteTabs = new Map();
  let THREE, renderer, scene, view, raycaster, pointer, tablePlane, atlas;
  let selectionOutline, selectionOuter, selectionInner, focusId = null;
  let initialized = false, destroyed = false, scheduled = 0, gesture = null;
  let size = { width: 0, height: 0 }, tilt = rad(29), azimuth = 0;
  let lastTap = null, lastFrame = 0, lastHover = -Infinity, dirtyShadows = true;
  let pendingFocus = null, revealingFocus = false, selectingFocus = false;
  let resolveReady, rejectReady, settled = false;
  const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  // Consumers can await/rethrow ready; an unmounted view never makes a rejection
  // escape before the caller has had a chance to install its fallback handler.
  ready.catch(() => {});
  const canvas = doc.createElement('canvas');
  canvas.className = 'physical-scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;opacity:0;pointer-events:none;';
  viewport.append(canvas);
  if (!doc.querySelector('link[data-physical-scene-style]')) {
    const stylesheet = doc.createElement('link');
    stylesheet.rel = 'stylesheet'; stylesheet.href = relative('./physical-scene.css?v=exhibition-ux-20261029-v3', import.meta.url);
    stylesheet.dataset.physicalSceneStyle = ''; doc.head.append(stylesheet);
  }
  const originalOpacity = world.style.opacity;
  const originalPointerEvents = world.style.pointerEvents;
  const own = resource => { if (destroyed) resource.dispose?.(); else resources.add(resource); return resource; };
  const on = (node, type, fn, settings) => { node.addEventListener(type, fn, settings); cleanups.push(() => node.removeEventListener(type, fn, settings)); };
  const reduced = () => win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const defaults = { card: .32, paper: .15, book: 1.5, board: 2.2, envelope: 1.3, token: 2.8 };
  const typeConfig = p => ({ ...(config.defaults?.[p.type] || {}), ...(config.pieces?.[p.id] || {}), ...(config.pieceOverrides?.[p.id] || {}) });
  const thickness = p => Math.max(.2, (Number(typeConfig(p).depthMm ?? config.depthPerId?.[p.id] ?? config.depthMm?.[p.type] ?? config.defaults?.[p.type]?.depthMm ?? defaults[p.type] ?? .4)) * perMm);
  const materialColor = (name, fallback) => {
    const value = config.materials?.[name] ?? (name === 'cloth' ? config.theme?.felt : config.theme?.[name]);
    return typeof value === 'string' ? value : value?.color || fallback;
  };
  const surfaceTint = (name, fallback, hasMap) => {
    const color = new THREE.Color(materialColor(name, fallback));
    return hasMap ? color.lerp(new THREE.Color('#ffffff'), .8) : color;
  };
  const entries = () => atlas.entries || atlas.faces || atlas;
  const entryFor = (id, side) => entries()[`${id}:${side}`];

  function invalidate() {
    if (destroyed || !initialized || scheduled) return;
    scheduled = win.requestAnimationFrame(render);
  }

  function roundedShape(width, height, radius) {
    const x = -width / 2, y = -height / 2, r = Math.max(.01, Math.min(radius, width / 2, height / 2));
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y); shape.lineTo(x + width - r, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r); shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  function geometry(width, height, depth, radius, kind = 'body') {
    const key = [width, height, depth, radius, kind].join('/');
    if (geometryCache.has(key)) return geometryCache.get(key);
    let result;
    if (kind === 'coin') {
      result = new THREE.CylinderGeometry(width / 2, width / 2, depth, 40, 1, false);
      result.rotateX(Math.PI / 2);
      if (height !== width) result.scale(1, height / width, 1);
    } else if (kind === 'circle') {
      result = new THREE.CircleGeometry(width / 2, 40);
      if (height !== width) result.scale(1, height / width, 1);
    } else if (kind === 'face') {
      result = new THREE.ShapeGeometry(roundedShape(width, height, radius), 8);
      const positions = result.attributes.position, uv = result.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, positions.getX(i) / width + .5, positions.getY(i) / height + .5);
    } else {
      const bevel = Math.min(.6, depth * .22, radius * .22);
      result = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), { depth: Math.max(.05, depth - bevel * 2), bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 6 });
      result.translate(0, 0, -Math.max(.05, depth - bevel * 2) / 2);
    }
    own(result); geometryCache.set(key, result); return result;
  }

  function plainMaterial(color, roughness = .9, metalness = 0) {
    return own(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  }

  function atlasView(entry) {
    const source = atlasTextures.get(entry.image);
    if (!source) throw new Error(`Atlas image is missing: ${entry.image}`);
    const texture = own(source.clone());
    texture.offset.set((entry.x + .5) / source.image.width, 1 - (entry.y + entry.height - .5) / source.image.height);
    texture.repeat.set((entry.width - 1) / source.image.width, (entry.height - 1) / source.image.height);
    texture.needsUpdate = true;
    return texture;
  }

  function inkTexture(entry, notes) {
    const source = atlasImages.get(entry.image);
    const sheet = doc.createElement('canvas'); sheet.width = entry.width; sheet.height = entry.height;
    const context = sheet.getContext('2d');
    context.drawImage(source, entry.x, entry.y, entry.width, entry.height, 0, 0, entry.width, entry.height);
    for (const note of entry.notes || []) {
      const text = Object.hasOwn(notes, note.key) ? notes[note.key] : note.defaultValue || '';
      if (!text) continue;
      const padding = typeof note.padding === 'number' ? { left: note.padding, top: note.padding, right: note.padding } : note.padding || {};
      const left = note.x + (padding.left || 0), top = note.y + (padding.top || 0);
      const width = Math.max(1, note.width - (padding.left || 0) - (padding.right || 0));
      context.save(); context.beginPath(); context.rect(note.x, note.y, note.width, note.height); context.clip();
      context.fillStyle = note.color || '#27434a';
      context.font = `${note.fontWeight || 400} ${note.fontSize || 14 * (entry.scale || 1)}px ${note.fontFamily || 'Pretendard, sans-serif'}`;
      context.textBaseline = 'top'; context.textAlign = note.align || 'left';
      const x = context.textAlign === 'right' ? left + width : context.textAlign === 'center' ? left + width / 2 : left;
      const lineHeight = note.lineHeight || (note.fontSize || 14) * 1.65;
      wrapInkLines(context, text, width).forEach((line, index) => context.fillText(line, x, top + index * lineHeight));
      context.restore();
    }
    const texture = own(new THREE.CanvasTexture(sheet));
    texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function faceMaterial(p, side, notes, allowLoad = true) {
    const entry = entryFor(p.id, side);
    if (!entry) return stock;
    if (!atlasTextures.has(entry.image)) {
      if (allowLoad) loadAtlasPage(entry.image).catch(fail);
      return stock;
    }
    const props = typeConfig(p);
    const signature = entry.notes?.length ? JSON.stringify(entry.notes.map(note => [note.key, Object.hasOwn(notes, note.key) ? notes[note.key] : note.defaultValue || ''])) : '';
    const key = `${entry.hash || `${entry.image}/${entry.x}/${entry.y}/${entry.width}/${entry.height}`}/${p.type}/${props.roughness ?? ''}`;
    const cache = signature ? noteMaterials : faceMaterials;
    const cacheKey = signature ? `${p.id}:${side}` : key;
    const existing = cache.get(cacheKey);
    if (existing && (!signature || existing.signature === signature)) return existing.material;
    const map = signature ? inkTexture(entry, notes) : atlasView(entry);
    const material = own(new THREE.MeshStandardMaterial({ map, color: '#ffffff', roughness: props.roughness ?? config.roughnessByType?.[p.type] ?? .86, metalness: p.type === 'token' ? Math.min(.3, props.metalness ?? config.materials?.token?.metalness ?? .2) : 0, transparent: p.type === 'zone', alphaTest: p.type === 'zone' ? .025 : 0, depthWrite: p.type !== 'zone', polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    if (signature && existing) { existing.material.map?.dispose(); resources.delete(existing.material.map); existing.material.dispose(); resources.delete(existing.material); }
    cache.set(cacheKey, { material, signature }); return material;
  }

  let stock;
  function createPiece(p) {
    const props = typeConfig(p), depth = thickness(p), radius = p.type === 'card' ? Math.min(p.width, p.height) * .035 : p.type === 'board' ? 4 : 1.2;
    const shape = props.shape || (p.type === 'token' ? 'cylinder' : 'card');
    const root = new THREE.Group(); root.userData.id = p.id;
    const flat = new THREE.Group(); flat.rotation.x = -Math.PI / 2; root.add(flat);
    const flip = new THREE.Group(); flat.add(flip);
    const color = props.edgeColor || (p.type === 'token' ? config.materials?.token?.color || '#b89954' : materialColor('cardEdge', '#d8d0bc'));
    const edge = plainMaterial(color, props.roughness ?? config.roughnessByType?.[p.type] ?? (p.type === 'token' ? .46 : .87), props.metalness ?? (p.type === 'token' ? config.materials?.token?.metalness ?? .32 : 0));
    let body, front = null, back = null;
    if (shape === 'pawn') {
      flat.rotation.x = 0;
      const height = depth, radius = p.width * .43;
      const profile = [[0,0],[radius*.9,0],[radius,height*.08],[radius*.85,height*.18],[radius*.57,height*.28],[radius*.38,height*.62],[radius*.58,height*.76],[radius*.52,height*.94],[radius*.28,height],[0,height]];
      const pawnGeometry = own(new THREE.LatheGeometry(profile.map(([x,y]) => new THREE.Vector2(x,y)), 32));
      body = new THREE.Mesh(pawnGeometry, plainMaterial(props.color || '#2d7175', props.roughness ?? .6, props.metalness ?? .02)); flip.add(body);
    } else {
      body = new THREE.Mesh(geometry(p.width, p.height, depth, radius, shape === 'cylinder' ? 'coin' : 'body'), [stock, edge]);
      if (shape === 'cylinder') body.material = edge;
      flip.add(body);
      const faceGeometry = geometry(p.width, p.height, 0, radius, shape === 'cylinder' ? 'circle' : 'face');
      front = new THREE.Mesh(faceGeometry, stock); front.position.z = depth / 2 + .3; flip.add(front);
      back = new THREE.Mesh(faceGeometry, stock); back.position.z = -depth / 2 - .3; back.rotation.y = Math.PI; flip.add(back);
      if (shape === 'box') {
        const lidEdge = new THREE.Mesh(geometry(p.width * 1.002, p.height * 1.002, Math.min(depth * .15, 8), radius), edge);
        lidEdge.position.z = depth / 2 - Math.min(depth * .15, 8) / 2 - .1; flip.add(lidEdge);
      }
      for (const crease of props.creases || []) {
        const vertical = crease.axis === 'x';
        const lineGeometry = own(new THREE.PlaneGeometry(vertical ? (crease.widthMm || .3) * perMm : p.width, vertical ? p.height : (crease.widthMm || .3) * perMm));
        const line = new THREE.Mesh(lineGeometry, own(new THREE.MeshBasicMaterial({ color: crease.color || '#6c6a57', transparent: true, opacity: crease.opacity ?? .14, depthWrite: false })));
        line.position.set(vertical ? (Number(crease.at ?? .5) - .5) * p.width : 0, vertical ? 0 : (.5 - Number(crease.at ?? .5)) * p.height, depth / 2 + .36); flip.add(line);
      }
    }
    body.castShadow = true; body.receiveShadow = true;
    if (front) front.receiveShadow = true;
    if (back) back.receiveShadow = true;
    root.traverse(node => { if (node.isMesh) { node.userData.id = p.id; picks.push(node); } });
    scene.add(root);
    const record = { p, root, flat, flip, front, back, depth, shape, baseY: 0, target: null, initialized: false, pickable: false };
    objects.set(p.id, record); return record;
  }

  function updateCamera() {
    if (!renderer || !size.width || !size.height) return;
    const pose = computeSceneView(camera.getState(), kit.size.width, kit.size.height, size.width / size.height, tilt, azimuth, { depth: 32 * perMm });
    view.aspect = size.width / size.height;
    view.near = Math.max(1, pose.distance / 100);
    view.far = Math.max(pose.distance * 2, pose.distance + Math.max(kit.size.width, kit.size.height) * 2);
    view.position.set(pose.position.x, pose.position.y, pose.position.z);
    view.lookAt(pose.target.x, pose.target.y, pose.target.z); view.updateProjectionMatrix(); view.updateMatrixWorld();
  }

  function resize() {
    if (!renderer || destroyed) return;
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (!width || !height) return;
    if (width !== size.width || height !== size.height) { size = { width, height }; renderer.setSize(width, height, false); }
    updateCamera(); invalidate();
  }

  function chosenId() {
    const focused = objects.get(focusId);
    return focused?.pickable && focused.root.visible ? focusId : getSelection();
  }

  function updateOutline() {
    if (!selectionOutline) return;
    const record = objects.get(chosenId());
    selectionOutline.visible = Boolean(record?.pickable && record.root.visible);
    if (!selectionOutline.visible) return;
    const centre = record.root.position.clone(), projected = centre.clone().project(view);
    const x = centre.clone().add(new THREE.Vector3(1, 0, 0)).project(view);
    const z = centre.clone().add(new THREE.Vector3(0, 0, 1)).project(view);
    const pixels = Math.max(.01, Math.min(Math.hypot((x.x - projected.x) * size.width / 2, (x.y - projected.y) * size.height / 2), Math.hypot((z.x - projected.x) * size.width / 2, (z.y - projected.y) * size.height / 2)));
    const unit = Number((1 / pixels).toPrecision(2));
    const key = `${record.shape}/${record.p.width}/${record.p.height}/${unit}`;
    if (!outlineCache.has(key)) {
      const round = ['cylinder', 'pawn'].includes(record.shape);
      const width = record.shape === 'pawn' ? record.p.width * .86 : record.p.width;
      const height = record.shape === 'pawn' ? record.p.width * .86 : record.p.height;
      const radius = record.p.type === 'card' ? Math.min(width, height) * .035 : record.p.type === 'board' ? 4 : 1.2;
      const ring = (outer, inner) => {
        const shape = round ? new THREE.Shape() : roundedShape(width + outer * 2, height + outer * 2, radius + outer);
        const hole = new THREE.Path();
        if (round) {
          shape.absellipse(0, 0, width / 2 + outer, height / 2 + outer, 0, Math.PI * 2, false);
          hole.absellipse(0, 0, width / 2 + inner, height / 2 + inner, 0, Math.PI * 2, true);
        } else {
          hole.setFromPoints(roundedShape(width + inner * 2, height + inner * 2, radius + inner).getPoints(48).reverse());
        }
        shape.holes.push(hole);
        return own(new THREE.ShapeGeometry(shape, 12));
      };
      outlineCache.set(key, { outer: ring(2.8 * unit, .4 * unit), inner: ring(2.25 * unit, .75 * unit) });
    }
    const geometry = outlineCache.get(key);
    selectionOuter.geometry = geometry.outer; selectionInner.geometry = geometry.inner;
    selectionOutline.position.copy(record.root.position);
    selectionOutline.position.y += record.shape === 'pawn' ? .3 : record.depth / 2 + .42;
    selectionOutline.rotation.y = record.root.rotation.y;
    // Zoom gestures can visit many fractional scales; retain only a small set
    // of reusable rings rather than keeping every intermediate GPU buffer.
    while (outlineCache.size > 32) {
      const oldest = outlineCache.keys().next().value;
      if (oldest === key) break;
      const previous = outlineCache.get(oldest);
      previous.outer.dispose(); previous.inner.dispose(); resources.delete(previous.outer); resources.delete(previous.inner); outlineCache.delete(oldest);
    }
  }

  // Use the shared camera API to preserve its limits, toolbar and resize mode.
  // A viewport-sized rectangle with zero padding changes only the camera pose.
  function setCameraPose(scale, x, y) {
    if (typeof camera.reveal !== 'function') return;
    const state = camera.getState();
    camera.reveal({ x: -x / scale, y: -y / scale, width: state.viewportWidth / scale, height: state.viewportHeight / scale }, { padding: 0 });
    updateCamera();
  }

  function projectedBounds(record) {
    record.root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(record.root);
    const bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(view);
      if (![p.x, p.y, p.z].every(Number.isFinite)) return null;
      const px = (p.x + 1) * size.width / 2, py = (1 - p.y) * size.height / 2;
      bounds.left = Math.min(bounds.left, px); bounds.right = Math.max(bounds.right, px);
      bounds.top = Math.min(bounds.top, py); bounds.bottom = Math.max(bounds.bottom, py);
    }
    return bounds;
  }

  function revealFocus(id) {
    const record = objects.get(id);
    if (revealingFocus || gesture || !record?.pickable || !record.root.visible || typeof camera.reveal !== 'function') return;
    revealingFocus = true;
    const metrics = debug ? { id, attempts: 0, fallback: false, clamped: false } : null;
    try {
      const inset = 22, viewportRect = canvas.getBoundingClientRect();
      const tools = viewport.closest?.('.physical-shell')?.querySelector?.('.physical-tool-buttons')?.getBoundingClientRect();
      const covered = tools && tools.top < viewportRect.bottom && tools.bottom > viewportRect.top && tools.width > size.width / 2
        ? Math.max(0, viewportRect.bottom - tools.top + 8) : 0;
      const safe = { left: inset, right: size.width - inset, top: inset, bottom: size.height - Math.max(inset, Math.min(covered, size.height * .45)) };
      if (metrics) metrics.safe = safe;
      const inside = bounds => bounds && bounds.left >= safe.left - 1 && bounds.right <= safe.right + 1 && bounds.top >= safe.top - 1 && bounds.bottom <= safe.bottom + 1;
      let bounds = projectedBounds(record);
      if (!bounds) return;
      const fit = Math.min(1, (safe.right - safe.left) / Math.max(1, bounds.right - bounds.left), (safe.bottom - safe.top) / Math.max(1, bounds.bottom - bounds.top));
      if (fit < .98 && typeof camera.zoomTo === 'function') { camera.zoomTo(camera.getState().scale * fit * .97); updateCamera(); }
      for (let attempt = 0; attempt < 3; attempt++) {
        if (metrics) metrics.attempts++;
        bounds = projectedBounds(record);
        if (!bounds) break;
        const shift = (low, high, min, max) => high - low > max - min ? (min + max - low - high) / 2 : low < min ? min - low : high > max ? max - high : 0;
        const dx = shift(bounds.left, bounds.right, safe.left, safe.right), dy = shift(bounds.top, bounds.bottom, safe.top, safe.bottom);
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) break;
        const center = { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 };
        const from = point({ clientX: viewportRect.left + center.x, clientY: viewportRect.top + center.y }, record.root.position.y);
        const to = point({ clientX: viewportRect.left + center.x + dx, clientY: viewportRect.top + center.y + dy }, record.root.position.y);
        if (!from || !to) break;
        const state = camera.getState();
        const x = state.x - (from.x - to.x) * state.scale, y = state.y - (from.z - to.z) * state.scale;
        setCameraPose(state.scale, x, y);
        const actual = camera.getState();
        if (metrics && (Math.abs(actual.x - x) > 1 || Math.abs(actual.y - y) > 1)) metrics.clamped = true;
      }
      bounds = projectedBounds(record);
      if (!inside(bounds)) {
        if (metrics) metrics.fallback = true;
        const centre = () => {
          const state = camera.getState();
          setCameraPose(state.scale, state.viewportWidth / 2 - record.root.position.x * state.scale, state.viewportHeight / 2 - record.root.position.z * state.scale);
          return projectedBounds(record);
        };
        bounds = centre();
        // The common camera deliberately bounds panning to the 2D table. A
        // perspective near-edge sheet can exceed that bound even though it is
        // smaller than the viewport. Prefer a little less zoom to a clipped
        // keyboard target; pointer taps never enter this path.
        for (let attempt = 0; !inside(bounds) && attempt < 9 && typeof camera.zoomTo === 'function'; attempt++) {
          const before = camera.getState().scale;
          camera.zoomTo(before * .86); updateCamera();
          bounds = centre();
          if (metrics) metrics.attempts++;
          if (Math.abs(camera.getState().scale - before) < .00001) break;
        }
      }
      if (metrics) { metrics.bounds = bounds; metrics.inside = Boolean(inside(bounds)); metrics.scale = camera.getState().scale; }
    } finally {
      revealingFocus = false;
      if (metrics) canvas.dataset.focusMetrics = JSON.stringify(metrics);
    }
  }

  function sync({ immediate = false } = {}) {
    if (!initialized || destroyed) return;
    const notes = model.snapshot().notes || {};
    lockNoteTabs();
    // A player mat is a real supporting board. Its cards must sit on its top,
    // not intersect it merely because both share the same logical XY plane.
    const supports = [];
    const supportHeight = (p, state) => {
      let bottom = 1.84;
      const x = state.x + p.width / 2, z = state.y + p.height / 2;
      for (const surface of supports) {
        if (surface.z >= state.z) continue;
        const dx = x - surface.x, dz = z - surface.y, c = Math.cos(surface.angle), s = Math.sin(surface.angle);
        const localX = c * dx + s * dz, localY = -s * dx + c * dz;
        if (Math.abs(localX) <= surface.width / 2 && Math.abs(localY) <= surface.height / 2) bottom = Math.max(bottom, surface.top);
      }
      return bottom + .08;
    };
    for (const record of [...objects.values()].filter(record => record.p.type === 'board' && !model.get(record.p.id).hidden).sort((a, b) => model.get(a.p.id).z - model.get(b.p.id).z)) {
      const state = model.get(record.p.id), p = record.p;
      supports.push({ x: state.x + p.width / 2, y: state.y + p.height / 2, width: p.width, height: p.height, angle: rad(state.angle), top: supportHeight(p, state) + record.depth + .3, z: state.z });
    }
    for (const record of objects.values()) {
      const { p, root, front, back, depth } = record, state = model.get(p.id), ids = model.members(p.id);
      root.visible = !state.hidden;
      record.pickable = !state.hidden && (!ids.length || ids.at(-1) === p.id);
      if (state.hidden) continue;
      const index = Math.max(0, ids.indexOf(p.id));
      const stackLimit = p.type === 'token' && config.coinStackMax
        ? Math.min(Number(config.stackMaxHeightMm || 36) * perMm, Number(config.coinStackMax) * depth)
        : Number(config.stackMaxHeightMm || 36) * perMm;
      const step = ids.length > 1 ? Math.min(depth, stackLimit / ids.length) : depth;
      const bottom = supportHeight(p, state) + index * step;
      const y = bottom + (record.shape === 'pawn' ? 0 : depth / 2);
      record.baseY = y;
      const offset = ids.length > 1 ? Math.min(index, 7) * .25 : 0;
      record.target = { x: state.x + p.width / 2 + offset, y, z: state.y + p.height / 2 + offset, angle: -rad(state.angle), flip: state.faceDown ? Math.PI : 0 };
      if (immediate || !record.initialized || reduced()) {
        root.position.set(record.target.x, y, record.target.z); root.rotation.y = record.target.angle; record.flip.rotation.y = record.target.flip;
        record.initialized = true;
      }
      const isTop = record.pickable;
      if (front) { front.visible = isTop; if (isTop) front.material = faceMaterial(p, 'front', notes, !state.faceDown); }
      if (back) { back.visible = isTop; if (isTop) back.material = faceMaterial(p, 'back', notes, state.faceDown); }
    }
    activePicks = picks.filter(mesh => { const record = objects.get(mesh.userData.id); return record?.pickable && record.root.visible && mesh.visible; });
    updateOutline();
    dirtyShadows = true; invalidate();
  }

  function render(time) {
    scheduled = 0;
    if (destroyed || !initialized) return;
    let moving = false;
    const step = reduced() ? 1 : 1 - Math.exp(-Math.min(48, time - (lastFrame || time - 16)) / 50);
    lastFrame = time;
    for (const record of objects.values()) {
      if (!record.root.visible || !record.target || gesture?.ids?.includes(record.p.id)) continue;
      const target = record.target;
      const amount = Math.abs(record.root.position.x - target.x) + Math.abs(record.root.position.y - target.y) + Math.abs(record.root.position.z - target.z) + Math.abs(record.root.rotation.y - target.angle) + Math.abs(record.flip.rotation.y - target.flip);
      if (amount > .02) {
        record.root.position.lerp(new THREE.Vector3(target.x, target.y, target.z), step);
        record.root.rotation.y += (target.angle - record.root.rotation.y) * step;
        record.flip.rotation.y += (target.flip - record.flip.rotation.y) * step;
        moving = true;
      } else {
        record.root.position.set(target.x, target.y, target.z); record.root.rotation.y = target.angle; record.flip.rotation.y = target.flip;
      }
    }
    if (pendingFocus && !gesture) { const id = pendingFocus; pendingFocus = null; revealFocus(id); }
    updateOutline();
    renderer.shadowMap.needsUpdate = dirtyShadows || moving || Boolean(gesture); dirtyShadows = false;
    try { renderer.render(scene, view); writeMetrics(); } catch (error) { fail(error); return; }
    if (moving) invalidate();
  }

  function writeMetrics() {
    if (!debug) return;
    let meshes = 0, invalid = 0;
    scene.traverse(node => { if (node.isMesh) { meshes++; if (!node.position.toArray().every(Number.isFinite)) invalid++; } });
    canvas.dataset.renderMetrics = JSON.stringify({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, lines: renderer.info.render.lines, meshes, objects: objects.size, visible: [...objects.values()].filter(record => record.root.visible).length, invalid, camera: view.position.toArray().map(n => Math.round(n)), near: view.near, far: view.far, programs: renderer.info.programs.length, shaderErrors: renderer.info.programs.filter(program => program.diagnostics?.runnable === false).length, atlasPages: atlasImages.size, gpuTextures: renderer.info.memory?.textures ?? null });
    canvas.dataset.pieceMetrics = JSON.stringify([...objects.values()].filter(record => ['worksheet', 'final-worksheet', 'R1', 'R2', 'shared-pawn', 'map'].includes(record.p.id)).map(record => ({ id: record.p.id, visible: record.root.visible, shape: record.shape, depth: record.depth, position: record.root.position.toArray(), target: record.target, flip: record.flip.rotation.y, projected: record.root.position.clone().project(view).toArray(), front: record.front ? { visible: record.front.visible, map: Boolean(record.front.material.map), image: entryFor(record.p.id, 'front')?.image } : null, back: record.back ? { visible: record.back.visible, map: Boolean(record.back.material.map) } : null })));
  }

  function point(event, planeY = 0) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, view);
    tablePlane.constant = -planeY;
    return raycaster.ray.intersectPlane(tablePlane, new THREE.Vector3());
  }

  function pick(event) {
    if (!initialized) return null;
    point(event);
    const intersections = raycaster.intersectObjects(activePicks, false);
    return intersections.map(hit => objects.get(hit.object.userData.id)).find(record => record?.pickable && record.root.visible) || null;
  }

  function stop(event, finish = false) {
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const active = gesture; gesture = null;
    canvas.classList.remove('is-dragging', 'is-orbiting');
    try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch { /* The browser may have cancelled this pointer. */ }
    if (active.kind === 'piece') {
      event.stopPropagation();
      if (finish && active.moved) onMove(active.id, active.dx, active.dy, active.whole);
      else if (finish && event.pointerType === 'touch' && !active.moved) {
        const now = Date.now();
        if (lastTap?.id === active.id && now - lastTap.time < 360) { onInspect(active.id); lastTap = null; }
        else lastTap = { id: active.id, time: now };
      }
      sync();
    }
    invalidate();
  }

  function capture(id) {
    try { canvas.setPointerCapture(id); } catch { /* A browser may end a pointer before capture. */ }
  }

  function startPiece(event, record) {
    const planeY = record.root.position.y + (record.shape === 'pawn' ? 0 : record.depth / 2);
    const start = point(event, planeY);
    if (!start) return;
    const whole = Boolean(event.shiftKey || getSelection() === record.p.id && getPileMode());
    const ids = whole ? model.members(record.p.id) : [record.p.id];
    gesture = { kind: 'piece', id: record.p.id, ids, pointer: event.pointerId, planeY, start, clientX: event.clientX, clientY: event.clientY, whole, moved: false, dx: 0, dy: 0, locked: Boolean(record.p.locked), positions: new Map(ids.map(id => [id, objects.get(id).root.position.clone()])) };
    capture(event.pointerId); onSelect(record.p.id);
  }

  function startTouchPan(touch) {
    gesture = { kind: 'touch-pan', pointer: touch.id, x: touch.x, y: touch.y, camera: { ...camera.getState() }, moved: false };
  }

  function startPinch() {
    // A second finger changes the intention from moving a card to moving the
    // view. Discard the uncommitted lift; never turn it into an accidental drop.
    gesture = null; lastTap = null;
    canvas.classList.remove('is-dragging', 'is-orbiting'); sync();
    const [a, b] = touches.values(), state = camera.getState(), rect = canvas.getBoundingClientRect();
    const x = (a.x + b.x) / 2 - rect.left, y = (a.y + b.y) / 2 - rect.top;
    gesture = { kind: 'pinch', distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), scale: state.scale, anchorX: (x - state.x) / state.scale, anchorY: (y - state.y) / state.scale };
  }

  function endTouch(event, finish) {
    if (!touches.has(event.pointerId)) return;
    event.preventDefault(); event.stopPropagation();
    touches.delete(event.pointerId);
    if (gesture?.kind === 'piece') stop(event, finish);
    else { gesture = null; canvas.classList.remove('is-dragging', 'is-orbiting'); }
    try { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); } catch { /* Already cancelled. */ }
    if (touches.size >= 2) startPinch();
    else if (touches.size === 1) startTouchPan(touches.values().next().value);
    invalidate();
  }

  function cancelPointers() {
    if (gesture?.pointer != null) stop({ pointerId: gesture.pointer, stopPropagation() {} });
    gesture = null; lastTap = null;
    for (const id of touches.keys()) {
      try { if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id); } catch { /* The pointer may already be gone. */ }
    }
    touches.clear(); canvas.classList.remove('is-dragging', 'is-orbiting'); sync();
  }

  function bindPointers() {
    on(canvas, 'pointerdown', event => {
      if (!initialized || destroyed) return;
      pendingFocus = null;
      if (event.pointerType === 'touch') {
        event.preventDefault(); event.stopPropagation();
        touches.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
        capture(event.pointerId);
        if (touches.size >= 2) { startPinch(); return; }
        const record = pick(event);
        if (record) startPiece(event, record);
        else { onSelect(null); startTouchPan(touches.get(event.pointerId)); }
        return;
      }
      if (gesture) return;
      if (event.button === 2) {
        gesture = { kind: 'orbit', pointer: event.pointerId, x: event.clientX, y: event.clientY, tilt, azimuth };
        event.preventDefault(); event.stopPropagation(); capture(event.pointerId); canvas.classList.add('is-orbiting'); return;
      }
      if (event.button !== 0) return;
      const record = pick(event);
      if (!record) { onSelect(null); return; } // Empty table keeps viewport pan/zoom.
      event.preventDefault(); event.stopPropagation(); startPiece(event, record);
    });
    on(canvas, 'pointermove', event => {
      if (touches.has(event.pointerId)) {
        touches.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
        event.preventDefault(); event.stopPropagation();
        if (gesture?.kind === 'pinch') {
          const [a, b] = touches.values(), rect = canvas.getBoundingClientRect();
          if (!a || !b) return;
          camera.zoomTo?.(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance);
          const scale = camera.getState().scale;
          setCameraPose(scale, (a.x + b.x) / 2 - rect.left - gesture.anchorX * scale, (a.y + b.y) / 2 - rect.top - gesture.anchorY * scale);
          invalidate(); return;
        }
        if (gesture?.kind === 'touch-pan') {
          const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
          if (!gesture.moved && Math.hypot(dx, dy) < 5) return;
          gesture.moved = true; setCameraPose(gesture.camera.scale, gesture.camera.x + dx, gesture.camera.y + dy);
          invalidate(); return;
        }
      }
      if (!gesture || gesture.pointer !== event.pointerId) {
        const now = event.timeStamp ?? Date.now();
        if (!gesture && event.pointerType !== 'touch' && now - lastHover >= 40) { lastHover = now; canvas.classList.toggle('is-over-piece', Boolean(pick(event))); }
        return;
      }
      event.preventDefault(); event.stopPropagation();
      if (gesture.kind === 'orbit') {
        azimuth = gesture.azimuth - (event.clientX - gesture.x) * .004;
        tilt = clamp(gesture.tilt + (event.clientY - gesture.y) * .003, rad(12), rad(53));
        updateCamera(); invalidate(); return;
      }
      if (gesture.locked || !gesture.moved && Math.hypot(event.clientX - gesture.clientX, event.clientY - gesture.clientY) < 5) return;
      const current = point(event, gesture.planeY); if (!current) return;
      gesture.moved = true; gesture.dx = current.x - gesture.start.x; gesture.dy = current.z - gesture.start.z;
      for (const id of gesture.ids) {
        const record = objects.get(id), start = gesture.positions.get(id);
        record.root.position.set(start.x + gesture.dx, start.y + 13 * perMm, start.z + gesture.dy);
      }
      canvas.classList.add('is-dragging'); dirtyShadows = true; invalidate();
    });
    on(canvas, 'pointerup', event => touches.has(event.pointerId) ? endTouch(event, true) : stop(event, true));
    on(canvas, 'pointercancel', event => touches.has(event.pointerId) ? endTouch(event, false) : stop(event));
    on(canvas, 'lostpointercapture', event => touches.has(event.pointerId) ? endTouch(event, false) : stop(event));
    on(canvas, 'dblclick', event => { const record = pick(event); if (record) { event.preventDefault(); event.stopPropagation(); onInspect(record.p.id); } });
    on(canvas, 'contextmenu', event => event.preventDefault());
    on(viewport, 'focusin', event => {
      focusId = event.target.closest('[data-piece]')?.dataset.piece || null;
      if (focusId && !gesture && !selectingFocus && getSelection() !== focusId && objects.get(focusId)?.pickable) {
        selectingFocus = true;
        try { onSelect(focusId); } finally { selectingFocus = false; }
      }
      pendingFocus = gesture ? null : focusId;
      sync();
    });
    on(viewport, 'focusout', event => { if (!event.relatedTarget?.closest?.('[data-piece]')) { focusId = null; pendingFocus = null; sync(); } });
    on(viewport, 'tabletopchange', () => { lockNoteTabs(); updateCamera(); invalidate(); });
    on(win, 'blur', cancelPointers);
    on(doc, 'visibilitychange', () => { if (doc.hidden) cancelPointers(); });
    on(win, 'keydown', event => { if (event.key === 'Escape' && gesture) cancelPointers(); }, true);
    on(canvas, 'webglcontextlost', event => { event.preventDefault(); fail(new Error('WebGL context was lost.')); });
    const resizeObserver = new win.ResizeObserver(resize); resizeObserver.observe(viewport); cleanups.push(() => resizeObserver.disconnect());
  }

  async function image(url) {
    const result = new win.Image(); result.decoding = 'async'; result.src = url;
    await result.decode(); return result;
  }

  function loadAtlasPage(file) {
    if (loadingPages.has(file)) return loadingPages.get(file);
    const request = (async () => {
      const picture = await image(relative(file, atlasUrl));
      if (destroyed) return;
      atlasImages.set(file, picture);
      const texture = own(new THREE.Texture(picture)); texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); atlasTextures.set(file, texture);
      if (initialized) sync();
    })();
    loadingPages.set(file, request);
    return request;
  }

  function lockNoteTabs() {
    world.querySelectorAll('input[data-note],textarea[data-note]').forEach(field => {
      if (!originalNoteTabs.has(field)) originalNoteTabs.set(field, field.getAttribute('tabindex'));
      field.tabIndex = -1;
    });
  }

  async function loadSurface(path, contrast = 1) {
    const picture = await image(relative(path, import.meta.url));
    let surface = picture;
    if (contrast !== 1) {
      surface = doc.createElement('canvas'); surface.width = picture.width; surface.height = picture.height;
      const context = surface.getContext('2d'); context.filter = `contrast(${contrast})`; context.drawImage(picture, 0, 0);
    }
    const texture = own(new THREE.Texture(surface)); texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return texture;
  }

  async function createEnvironment() {
    const { width, height } = kit.size;
    scene.background = new THREE.Color('#263937');
    scene.add(new THREE.HemisphereLight('#fff8e8', '#687770', 1.75));
    const key = new THREE.DirectionalLight('#fff5e3', 2.4);
    key.position.set(-width * .25, Math.max(width, height) * 1.25, height * .08);
    key.target.position.set(width / 2, 0, height / 2); scene.add(key, key.target);
    key.castShadow = true;
    const extent = Math.max(width, height) * .82;
    Object.assign(key.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent, near: 10, far: Math.max(width, height) * 4 });
    key.shadow.mapSize.set(2048, 2048); key.shadow.normalBias = .75; key.shadow.bias = -.00004; key.shadow.radius = 4;
    const fill = new THREE.DirectionalLight('#d9e5e3', .7); fill.position.set(width * 1.3, height, height); scene.add(fill);
    const [woodMap, clothMap] = await Promise.all([loadSurface('./scene-assets/walnut-albedo-v1.webp').catch(() => null), loadSurface('./scene-assets/felt-albedo-v1.webp', .86).catch(() => null)]);
    if (destroyed) return;
    const wood = own(new THREE.MeshStandardMaterial({ color: '#664b38', roughness: .82, metalness: 0 }));
    const table = new THREE.Mesh(geometry(width + 150, height + 150, 32 * perMm, 35), wood);
    table.rotation.x = -Math.PI / 2; table.position.set(width / 2, -16 * perMm - .5, height / 2); table.receiveShadow = true; table.castShadow = false; scene.add(table);
    const woodTop = new THREE.Mesh(geometry(width + 150, height + 150, 0, 35, 'face'), own(new THREE.MeshStandardMaterial({ color: surfaceTint('wood', '#92735b', woodMap), map: woodMap, roughness: .82, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })));
    woodTop.rotation.x = -Math.PI / 2; woodTop.position.set(width / 2, -.35, height / 2); woodTop.receiveShadow = true; scene.add(woodTop);
    const clothMaterial = own(new THREE.MeshStandardMaterial({ color: materialColor('cloth', '#77928b'), roughness: .98, metalness: 0 }));
    const cloth = new THREE.Mesh(geometry(width * .965, height * .96, 1.6, 23), clothMaterial);
    cloth.rotation.x = -Math.PI / 2; cloth.position.set(width / 2, .8, height / 2); cloth.receiveShadow = true; scene.add(cloth);
    const clothTop = new THREE.Mesh(geometry(width * .965, height * .96, 0, 23, 'face'), own(new THREE.MeshStandardMaterial({ color: surfaceTint('cloth', '#315b5b', clothMap), map: clothMap, roughness: .98, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })));
    clothTop.rotation.x = -Math.PI / 2; clothTop.position.set(width / 2, 1.8, height / 2); clothTop.receiveShadow = true; scene.add(clothTop);
    // The cloth's sewn border is geometry, not a bright painted UI frame.
    const seamPoints = roundedShape(width * .965 - 12, height * .96 - 12, 20).getPoints(64).map(p => new THREE.Vector3(p.x + width / 2, 1.83, -p.y + height / 2));
    const seam = new THREE.LineLoop(own(new THREE.BufferGeometry().setFromPoints(seamPoints)), own(new THREE.LineBasicMaterial({ color: '#c1c3a7', transparent: true, opacity: .24 }))); scene.add(seam);
    for (const tray of config.trays || []) {
      const material = plainMaterial(tray.color || '#7b6047', .88);
      const depth = Number(tray.rimHeightMm || 2) * perMm;
      const rim = Math.max(2, Number(tray.rimWidthMm || 1.5) * perMm);
      const floor = new THREE.Mesh(geometry(tray.width, tray.height, 1.5, 5), material);
      floor.rotation.x = -Math.PI / 2; floor.position.set(tray.x + tray.width / 2, .9, tray.y + tray.height / 2); floor.receiveShadow = true; scene.add(floor);
      for (const [x, z, w, h] of [[tray.x + tray.width / 2, tray.y, tray.width, rim], [tray.x + tray.width / 2, tray.y + tray.height, tray.width, rim], [tray.x, tray.y + tray.height / 2, rim, tray.height], [tray.x + tray.width, tray.y + tray.height / 2, rim, tray.height]]) {
        const rail = new THREE.Mesh(geometry(w, h, depth, Math.min(2, rim / 2)), material);
        rail.rotation.x = -Math.PI / 2; rail.position.set(x, 1.6 + depth / 2, z); rail.castShadow = true; rail.receiveShadow = true; scene.add(rail);
      }
    }
    for (const [index, zone] of (kit.zones || []).entries()) {
      const id = zone.id || index;
      if (config.hiddenZones?.includes(id) || config.hiddenZones?.includes(String(id))) continue;
      const entry = entryFor(`zone:${id}`, 'front');
      if (!entry) continue;
      const surface = new THREE.Mesh(geometry(zone.width, zone.height, 0, 1, 'face'), faceMaterial({ id: `zone:${id}`, type: 'zone' }, 'front', {}));
      surface.rotation.x = -Math.PI / 2; surface.position.set(zone.x + zone.width / 2, 1.84, zone.y + zone.height / 2); scene.add(surface);
    }
  }

  async function initialize() {
    try {
      THREE = await import('./vendor/three.module.js');
      if (destroyed) return;
      const response = await win.fetch(atlasUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`The printed component atlas is not ready (${response.status}).`);
      atlas = await response.json();
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 1.8));
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
      scene = new THREE.Scene(); view = new THREE.PerspectiveCamera(32, 1, 1, 50000);
      raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2(); tablePlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      // Decode only the visible top faces. A closed envelope or an unturned
      // card never needs its other atlas page in memory until it is handled.
      const files = new Set();
      for (const p of kit.pieces) {
        const state = model.get(p.id);
        if (state.hidden || model.members(p.id).at(-1) !== p.id || typeConfig(p).shape === 'pawn') continue;
        const entry = entryFor(p.id, state.faceDown ? 'back' : 'front');
        if (entry) files.add(entry.image);
      }
      for (const [index, zone] of (kit.zones || []).entries()) {
        const id = zone.id || index;
        if (config.hiddenZones?.includes(id) || config.hiddenZones?.includes(String(id))) continue;
        const entry = entryFor(`zone:${id}`, 'front'); if (entry) files.add(entry.image);
      }
      await Promise.all([...files].map(loadAtlasPage));
      await doc.fonts?.ready;
      if (destroyed) return;
      stock = plainMaterial(materialColor('paper', '#f0eadb'), .92);
      await createEnvironment();
      if (destroyed) return;
      kit.pieces.forEach(createPiece);
      selectionOutline = new THREE.Group(); selectionOutline.renderOrder = 20; selectionOutline.visible = false;
      selectionOuter = new THREE.Mesh(own(new THREE.BufferGeometry()), own(new THREE.MeshBasicMaterial({ color: '#233b37', transparent: true, opacity: .96, depthTest: false, depthWrite: false, toneMapped: false })));
      selectionInner = new THREE.Mesh(own(new THREE.BufferGeometry()), own(new THREE.MeshBasicMaterial({ color: '#efbd61', transparent: true, opacity: .98, depthTest: false, depthWrite: false, toneMapped: false })));
      selectionOuter.rotation.x = selectionInner.rotation.x = -Math.PI / 2;
      selectionOuter.renderOrder = 20; selectionInner.renderOrder = 21;
      selectionOutline.add(selectionOuter, selectionInner); scene.add(selectionOutline);
      initialized = true; bindPointers(); resize(); sync({ immediate: true });
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, view); writeMetrics();
      canvas.style.opacity = '1'; canvas.style.pointerEvents = 'auto';
      lockNoteTabs();
      world.style.opacity = '0'; world.style.pointerEvents = 'none'; viewport.classList.add('physical-scene-ready');
      if (instructions) instructions.textContent = '빈 곳 드래그로 이동, 휠로 확대, 오른쪽 드래그로 시점 회전';
      settled = true; resolveReady(api); onReady?.(api);
    } catch (error) { fail(error); }
  }

  function fail(error) {
    if (destroyed) return;
    if (!settled) { settled = true; rejectReady(error); }
    destroy(); options.onError?.(error);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true; initialized = false;
    win.cancelAnimationFrame(scheduled); cleanups.forEach(fn => fn());
    world.style.opacity = originalOpacity; world.style.pointerEvents = originalPointerEvents;
    originalNoteTabs.forEach((value, field) => { if (value === null) field.removeAttribute('tabindex'); else field.setAttribute('tabindex', value); });
    viewport.classList.remove('physical-scene-ready'); canvas.remove();
    if (instructions) instructions.textContent = originalInstructions;
    resources.forEach(resource => resource.dispose?.()); resources.clear();
    scene?.traverse(node => { node.shadow?.map?.dispose(); node.shadow?.mapPass?.dispose(); });
    scene?.clear(); objects.clear(); picks.length = 0; activePicks = []; touches.clear(); geometryCache.clear(); outlineCache.clear(); faceMaterials.clear(); noteMaterials.clear(); atlasImages.clear(); atlasTextures.clear(); loadingPages.clear(); originalNoteTabs.clear();
    renderer?.renderLists?.dispose(); renderer?.dispose();
    if (!settled) { settled = true; rejectReady(new Error('The physical scene was unmounted.')); }
  }

  const api = { sync, destroy, ready, get canvas() { return canvas; }, get renderer() { return renderer; } };
  initialize();
  return api;
}

export default mountPhysicalScene;
