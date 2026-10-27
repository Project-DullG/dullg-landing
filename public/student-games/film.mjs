const video = document.querySelector('video[data-tabletop-film]');
const tools = document.querySelector('[data-film-tools]');

if (video && tools) {
  const source = video.querySelector('source')?.src || video.src;
  const chapterUrl = new URL('intro.chapters.json', source);
  chapterUrl.search = new URL(source).search;
  const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  const feedback = document.createElement('p');
  feedback.className = 'film-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute('aria-atomic', 'true');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'film-retry';
  retry.textContent = '다시 재생';
  retry.hidden = true;
  tools.append(feedback, retry);

  let requestedTime = null;
  let playbackRequest = 0;
  let pending = false;
  let loadingTimer;
  function report(message, canRetry = false) {
    feedback.textContent = message;
    retry.hidden = !canRetry;
  }
  function stopLoadingTimer() { clearTimeout(loadingTimer); }
  function seek() {
    if (requestedTime === null || video.readyState < 1) return;
    try {
      video.currentTime = Number.isFinite(video.duration)
        ? Math.min(requestedTime, Math.max(0, video.duration - .05))
        : requestedTime;
      requestedTime = null;
    } catch {
      report('장면을 이동하지 못했습니다. 영상의 재생 막대를 사용해 주세요.', true);
    }
  }
  function requestPlayback(time) {
    const request = ++playbackRequest;
    requestedTime = time;
    pending = true;
    report('선택한 장면을 불러오는 중입니다.');
    stopLoadingTimer();
    loadingTimer = setTimeout(() => {
      if (request === playbackRequest && pending) {
        report('불러오는 데 시간이 걸립니다. 잠시 뒤 다시 재생해 주세요.', true);
      }
    }, 8000);
    if (video.error || video.readyState === 0) video.load();
    seek();
    // Request playback in the user's click event, even while metadata loads.
    // loadedmetadata only applies the pending seek; it never resumes a paused video.
    try {
      Promise.resolve(video.play()).catch(error => {
        if (request !== playbackRequest) return;
        pending = false;
        stopLoadingTimer();
        if (error?.name === 'AbortError') { report(''); return; }
        report(error?.name === 'NotAllowedError'
          ? '장면은 준비됐습니다. 재생을 한 번 더 눌러주세요.'
          : '영상을 재생하지 못했습니다. 다시 재생해 주세요.', true);
      });
    } catch {
      pending = false;
      stopLoadingTimer();
      report('영상을 재생하지 못했습니다. 다시 재생해 주세요.', true);
    }
  }
  retry.addEventListener('click', () => requestPlayback(requestedTime ?? video.currentTime));
  video.addEventListener('loadedmetadata', seek);
  video.addEventListener('playing', () => {
    pending = false;
    stopLoadingTimer();
    report('');
  });
  video.addEventListener('error', () => {
    pending = false;
    stopLoadingTimer();
    report('영상을 불러오지 못했습니다. 다시 재생해 주세요.', true);
  });
  video.addEventListener('stalled', () => {
    if (pending || !video.paused) report('영상을 불러오는 중입니다. 연결이 느리면 다시 재생해 주세요.', true);
  });

  try {
    const response = await fetch(chapterUrl);
    if (!response.ok) throw new Error('Chapter metadata unavailable');
    const manifest = await response.json();
    const chapters = (manifest.chapters || []).filter(chapter => Number.isFinite(chapter.time) && chapter.time >= 0 && typeof chapter.title === 'string');
    if (!chapters.length) throw new Error('No chapters');
    const note = document.createElement('p');
    note.className = 'film-note';
    note.textContent = '보고 싶은 장면부터 골라보세요.';
    const nav = document.createElement('nav');
    nav.className = 'film-chapters';
    nav.setAttribute('aria-label', '플레이 시연 장면');
    for (const chapter of chapters) {
      const button = document.createElement('button');
      button.type = 'button';
      const time = document.createElement('span');
      time.textContent = clock(chapter.time);
      time.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.textContent = chapter.title;
      button.append(time, label);
      button.setAttribute('aria-label', `${clock(chapter.time)} ${chapter.title} 재생`);
      button.addEventListener('click', () => requestPlayback(chapter.time));
      nav.append(button);
    }
    const tail = document.createElement('div');
    tail.className = 'film-tail';
    const status = document.createElement('span');
    status.className = 'film-status';
    const download = document.createElement('a');
    download.href = source;
    download.download = '';
    download.textContent = '플레이 시연 영상 저장 ↓';
    tail.append(status, download);
    tools.replaceChildren(note, nav, tail, feedback, retry);
    const buttons = [...nav.children];
    function update() {
      let active = 0;
      for (let i = 0; i < chapters.length; i++) if (video.currentTime >= chapters[i].time) active = i;
      buttons.forEach((button, i) => {
        if (i === active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      status.textContent = `${clock(video.currentTime)} / ${clock(Number.isFinite(video.duration) ? video.duration : manifest.duration)}`;
    }
    video.addEventListener('timeupdate', update);
    video.addEventListener('loadedmetadata', update);
    update();
  } catch {
    if (!feedback.textContent) report('장면 목록을 불러오지 못했습니다. 영상의 재생 막대를 사용해 주세요.');
  }
}
