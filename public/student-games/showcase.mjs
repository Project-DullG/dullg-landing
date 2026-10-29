const tabs=[...document.querySelectorAll('[data-preview-game]')];
const tablist=document.querySelector('.preview-tabs');
if(tablist&&tabs.length===3){
  const panels=tabs.map(tab=>document.getElementById(tab.dataset.previewGame));
  if(panels.every(Boolean)){
    function selectPreview(index,{focus=false}={}){
      tabs.forEach((tab,i)=>{
        const active=i===index;
        tab.setAttribute('aria-selected',String(active));
        tab.tabIndex=active?0:-1;
        panels[i].hidden=!active;
      });
      if(focus)tabs[index].focus();
    }
    panels.forEach((panel,i)=>{
      panel.setAttribute('role','tabpanel');
      panel.setAttribute('aria-labelledby',tabs[i].id);
      panel.tabIndex=0;
    });
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>selectPreview(index));
      tab.addEventListener('keydown',event=>{
        if(event.altKey||event.ctrlKey||event.metaKey)return;
        let next;
        if(event.key==='ArrowRight')next=(index+1)%tabs.length;
        else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
        else if(event.key==='Home')next=0;
        else if(event.key==='End')next=tabs.length-1;
        else return;
        event.preventDefault();selectPreview(next,{focus:true});
      });
    });
    const hash=location.hash.slice(1);
    const requested=tabs.some(tab=>tab.dataset.previewGame===hash)?hash:new URLSearchParams(location.search).get('pick');
    const initial=tabs.findIndex(tab=>tab.dataset.previewGame===requested);
    selectPreview(initial<0?0:initial);
    tablist.hidden=false;
    window.addEventListener('hashchange',()=>{
      const index=tabs.findIndex(tab=>tab.dataset.previewGame===location.hash.slice(1));
      if(index>=0)selectPreview(index);
    });
  }
}
