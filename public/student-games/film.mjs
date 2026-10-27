const video=document.querySelector('video[data-tabletop-film]');
const tools=document.querySelector('[data-film-tools]');
if(video&&tools){
  const source=video.querySelector('source')?.src||video.src;
  const chapterUrl=new URL('intro.chapters.json',source);
  chapterUrl.search=new URL(source).search;
  try{
    const response=await fetch(chapterUrl);
    if(response.ok){
      const manifest=await response.json();
      const chapters=(manifest.chapters||[]).filter(c=>Number.isFinite(c.time)&&c.time>=0&&typeof c.title==='string');
      if(chapters.length){
        const note=document.createElement('p');note.className='film-note';note.textContent='보고 싶은 장면부터 골라보세요.';
        const nav=document.createElement('nav');nav.className='film-chapters';nav.setAttribute('aria-label','플레이 시연 장면');
        let requestedTime=null;
        const seek=()=>{if(requestedTime!==null){video.currentTime=requestedTime;requestedTime=null;video.play().catch(()=>{});}};
        video.addEventListener('loadedmetadata',seek);
        const clock=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
        for(const chapter of chapters){
          const button=document.createElement('button');button.type='button';
          const time=document.createElement('span');time.textContent=clock(chapter.time);time.setAttribute('aria-hidden','true');
          const label=document.createElement('span');label.textContent=chapter.title;
          button.append(time,label);button.setAttribute('aria-label',`${clock(chapter.time)} ${chapter.title}`);
          button.addEventListener('click',()=>{requestedTime=chapter.time;if(video.readyState>=1)seek();else video.load();});
          nav.append(button);
        }
        const tail=document.createElement('div');tail.className='film-tail';
        const status=document.createElement('span');status.className='film-status';
        const download=document.createElement('a');download.href=source;download.download='';download.textContent='플레이 시연 영상 저장 ↓';
        tail.append(status,download);tools.replaceChildren(note,nav,tail);
        const buttons=[...nav.children];
        function update(){
          let active=0;for(let i=0;i<chapters.length;i++)if(video.currentTime>=chapters[i].time)active=i;
          buttons.forEach((button,i)=>{if(i===active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
          status.textContent=`${clock(video.currentTime)} / ${clock(Number.isFinite(video.duration)?video.duration:manifest.duration)}`;
        }
        video.addEventListener('timeupdate',update);video.addEventListener('loadedmetadata',update);update();
      }
    }
  }catch{/* Native playback stays available if chapter metadata cannot be loaded. */}
}
