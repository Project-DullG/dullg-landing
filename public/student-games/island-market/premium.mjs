// Deep links from the exhibition still open the selected, optional exhibit.
function revealLinkedExhibit() {
  let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id) return;
  const target = document.getElementById(id); if (!target) return;
  let details = target.closest('details'); let opened = false;
  while (details) { if (!details.open) { details.open = true; opened = true; } details = details.parentElement?.closest('details'); }
  if (opened) requestAnimationFrame(() => target.scrollIntoView({block:'start',behavior:'auto'}));
}
revealLinkedExhibit();
window.addEventListener('hashchange', revealLinkedExhibit);
