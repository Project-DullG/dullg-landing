import {slides} from './pitch-data.mjs';

const viewer = document.querySelector('[data-pitch-viewer]');
if (viewer) {
  const image = viewer.querySelector('[data-pitch-image]');
  const title = viewer.querySelector('[data-pitch-title]');
  const count = viewer.querySelector('[data-pitch-count]');
  const copy = document.querySelector('[data-pitch-text]');
  const pages = viewer.querySelector('[data-pitch-pages]');
  const previous = viewer.querySelector('[data-pitch-prev]');
  const next = viewer.querySelector('[data-pitch-next]');
  const full = viewer.querySelector('[data-pitch-fullscreen]');
  const base = new URL('../../ulleung-marble/assets/v07/pitch/20260929/', import.meta.url);
  let current = 0;
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index + 1).padStart(2, '0');
    button.setAttribute('aria-label', `${index + 1}장: ${slide.title}${index >= 10 ? ' (참고)' : ''}`);
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => show(index));
    pages.append(button);
    return button;
  });
  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[current];
    image.src = new URL(`slide-${String(current + 1).padStart(2, '0')}.webp`, base).href;
    image.alt = `${current + 1}. ${slide.title}`;
    title.textContent = slide.title;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length} · ${current < 10 ? '본편' : '참고'}`;
    copy.textContent = slide.script;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  viewer.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1}[event.key];
    if (target === undefined) return;
    event.preventDefault();
    show(target);
    if (pages.contains(document.activeElement)) buttons[current].focus({preventScroll: true});
  });
  viewer.querySelector('[data-pitch-controls]').hidden = false;
  // A dialog works in mobile and embedded browsers without a fullscreen permission.
  const dialog = document.createElement('dialog');
  dialog.className = 'pitch-dialog';
  dialog.setAttribute('aria-label', '울릉마블 피치덱 크게 보기');
  document.body.append(dialog);
  const anchor = document.createComment('pitch-viewer');
  full.hidden = false;
  full.textContent = '크게 보기 ↗';
  full.addEventListener('click', () => {
    if (dialog.open) { dialog.close(); return; }
    viewer.before(anchor);
    dialog.append(viewer);
    document.body.classList.add('pitch-open');
    full.textContent = '닫기 ×';
    dialog.showModal();
    full.focus();
  });
  dialog.addEventListener('close', () => {
    anchor.replaceWith(viewer);
    document.body.classList.remove('pitch-open');
    full.textContent = '크게 보기 ↗';
    full.focus({preventScroll: true});
  });
}
