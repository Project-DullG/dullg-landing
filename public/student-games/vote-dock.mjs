const dock=document.querySelector('[data-vote-dock]');
if(dock){
  function reserveSpace(){
    const bottom=parseFloat(getComputedStyle(dock).bottom)||0;
    const height=Math.ceil(dock.getBoundingClientRect().height+bottom+16);
    document.documentElement.style.setProperty('--vote-dock-space',height+'px');
  }
  reserveSpace();
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(reserveSpace).observe(dock);
  window.addEventListener('resize',reserveSpace,{passive:true});
  window.addEventListener('load',reserveSpace,{once:true});
}
for(const link of document.querySelectorAll('[data-vote-jump]')){
  link.addEventListener('click',event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const heading=document.getElementById('gallery-heading');
    if(heading)requestAnimationFrame(()=>heading.focus({preventScroll:true}));
  });
}
