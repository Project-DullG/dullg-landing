const video = document.querySelector('video[data-tabletop-film]');
const tools = document.querySelector('[data-film-tools]');

if (video && tools) {
  const source = video.querySelector('source')?.src || video.src;
  const chapterUrl = new URL('intro.chapters.json', source);
  chapterUrl.search = new URL(source).search;
  const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  // Keep native media controls available; the invitation only covers the untouched poster.
  const frame = document.createElement('div');
  frame.className = 'film-screen';
  video.before(frame);
  frame.append(video);
  const invitation = document.createElement('button');
  invitation.type = 'button';
  invitation.className = 'film-invitation';
  const playMark = document.createElement('span');
  playMark.className = 'film-play-mark';
  playMark.setAttribute('aria-hidden', 'true');
  const playCopy = document.createElement('span');
  const playTitle = document.createElement('strong');
  playTitle.textContent = '영상으로 둘러보기';
  const playDetail = document.createElement('span');
  playDetail.className = 'film-invitation-detail';
  playDetail.textContent = '구성품부터 한 판의 흐름까지';
  playCopy.append(playTitle, playDetail);
  invitation.append(playMark, playCopy);
  frame.append(invitation);
  invitation.addEventListener('click', () => requestPlayback(0));
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
    invitation.hidden = true;
    if (document.activeElement === invitation) video.focus({preventScroll: true});
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
    invitation.hidden = true;
  });
  video.addEventListener('ended', () => {
    pending = false;
    stopLoadingTimer();
    playTitle.textContent = '처음부터 다시 보기';
    invitation.hidden = false;
    report('');
  });
  video.addEventListener('pause', () => {
    // A native pause cancels the loading announcement without resuming playback later.
    pending = false;
    stopLoadingTimer();
    if (!video.error) report('');
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
    const chapters = (manifest.chapters || []).filter(chapter => Number.isFinite(chapter.time) && chapter.time >= 0 && typeof chapter.title === 'string').sort((a, b) => a.time - b.time);
    if (!chapters.length) throw new Error('No chapters');
    const note = document.createElement('p');
    note.className = 'film-note';
    note.textContent = '궁금한 장면부터 보세요';
    const nav = document.createElement('nav');
    nav.className = 'film-chapters';
    nav.setAttribute('aria-label', '플레이 시연 장면');
    for (const chapter of chapters) {
      const button = document.createElement('button');
      button.type = 'button';
      if (typeof chapter.thumbnail === 'string') {
        const thumbnailUrl = new URL(chapter.thumbnail, chapterUrl);
        // Only the same origin's generated stills are used in the public player.
        if (thumbnailUrl.origin === chapterUrl.origin) {
          thumbnailUrl.search = chapterUrl.search;
          const still = document.createElement('img');
          still.src = thumbnailUrl.href;
          still.alt = '';
          still.width = 480;
          still.height = 270;
          still.loading = 'lazy';
          still.decoding = 'async';
          still.addEventListener('error', () => { still.remove(); button.classList.remove('has-still'); }, {once: true});
          button.classList.add('has-still');
          button.append(still);
        }
      }
      const caption = document.createElement('span');
      caption.className = 'film-chapter-caption';
      const time = document.createElement('span');
      time.className = 'film-chapter-time';
      time.textContent = clock(chapter.time);
      time.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'film-chapter-title';
      label.textContent = chapter.title;
      caption.append(time, label);
      button.append(caption);
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
      const duration = Number.isFinite(video.duration) ? video.duration : manifest.duration;
      let active = 0;
      for (let i = 0; i < chapters.length; i++) if (video.currentTime >= chapters[i].time) active = i;
      buttons.forEach((button, i) => {
        if (i === active) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
        const end = chapters[i + 1]?.time ?? duration;
        const progress = end > chapters[i].time ? Math.max(0, Math.min(1, (video.currentTime - chapters[i].time) / (end - chapters[i].time))) : 0;
        button.style.setProperty('--chapter-progress', `${progress * 100}%`);
      });
      status.textContent = `${clock(video.currentTime)} / ${clock(duration)}`;
      playDetail.textContent = `${clock(duration)} 영상으로 배우는 게임 방법`;
    }
    video.addEventListener('timeupdate', update);
    video.addEventListener('loadedmetadata', update);
    update();
  } catch {
    if (!feedback.textContent) report('장면 목록을 불러오지 못했습니다. 영상의 재생 막대를 사용해 주세요.');
  }
}
