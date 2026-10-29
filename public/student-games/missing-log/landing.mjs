import kit, { PUBLIC_DOCUMENTS } from './physical-kit.mjs?v=premium-20261029-v1';

// The same two public documents appear here and inside the physical kit.
for (const record of document.querySelectorAll('[data-public-document]')) {
  const doc = PUBLIC_DOCUMENTS.find(item => item.id === record.dataset.publicDocument);
  if (!doc) continue;
  record.querySelector('[data-public-type]').textContent = doc.type;
  record.querySelector('h2').textContent = doc.title;
  record.querySelector('.ml-public-body').replaceChildren(...doc.body.split('\n').map(line => {
    const paragraph = document.createElement('p'); paragraph.textContent = line; return paragraph;
  }));
}

const publicPieceIds = new Set(['rulebook','jeodong-envelope']);
const publicPieces = [...document.querySelectorAll('[data-native-public-piece]')];
function fitPublicPiece(host) {
  const piece = kit.pieces.find(item => item.id === host.dataset.nativePublicPiece);
  if (piece && host.clientWidth > 0) host.style.setProperty('--public-piece-scale', String(host.clientWidth / piece.width));
}
for (const host of publicPieces) {
  const id = host.dataset.nativePublicPiece;
  if (!publicPieceIds.has(id)) continue;
  const piece = kit.pieces.find(item => item.id === id);
  host.style.aspectRatio = piece.width + '/' + piece.height;
  host.innerHTML = '<div class="pub-native-original" style="width:'+piece.width+'px;height:'+piece.height+'px">'+piece.front.replace(/<img\b/g,'<img loading="eager" fetchpriority="high" decoding="async"')+'</div>';
  fitPublicPiece(host);
}
if (typeof ResizeObserver === 'function') {
  const observer = new ResizeObserver(entries => entries.forEach(entry => fitPublicPiece(entry.target)));
  publicPieces.forEach(host => observer.observe(host));
}
window.addEventListener('resize', () => publicPieces.forEach(fitPublicPiece));

const training = document.querySelector('.ml-training-desk');
const feedback = document.querySelector('#training-feedback');
const trainingButtons = [...document.querySelectorAll('[data-training-answer]')];
for (const button of trainingButtons) {
  button.addEventListener('click', () => {
    const correct = button.dataset.trainingAnswer === 'date';
    for (const option of trainingButtons) option.setAttribute('aria-pressed', String(option === button));
    training?.classList.toggle('is-correct', correct);
    training?.classList.toggle('needs-review', !correct);
    if (feedback) feedback.innerHTML = correct
      ? '<strong>맞아요. 여행 날짜는 6일차입니다.</strong> 표찰의 2번은 전시장에서 읽는 자리예요. <a href="table.html">이제 실제 봉투 열어 보기 →</a>'
      : '<strong>표찰에는 “전시칸 번호”라고 적혀 있습니다.</strong> 원고에 적힌 날짜를 다시 찾아볼까요?';
  });
}

const sceneData = [
  {position:'0% 0%',alt:'조사 테이블에서 네 장소의 봉투를 여는 세 사람',label:'첫 번째 장면',caption:'테이블에 봉투를 펼칩니다.'},
  {position:'50% 0%',alt:'저동항에서 촛대바위 자료를 함께 읽는 세 사람',label:'두 번째 장면',caption:'저동에서 여행자의 글과 전설을 나누어 읽습니다.'},
  {position:'100% 0%',alt:'삼선암 풍경 앞에서 자료의 숫자를 비교하는 사람들',label:'세 번째 장면',caption:'같은 글에 붙은 서로 다른 숫자를 살펴봅니다.'},
  {position:'0% 100%',alt:'태하 황토굴 앞에서 조사 카드를 대조하는 사람들',label:'네 번째 장면',caption:'안내문을 만들던 작업의 흔적을 찾습니다.'},
  {position:'50% 100%',alt:'나리분지에서 지도를 펼쳐 근거를 모으는 사람들',label:'다섯 번째 장면',caption:'네 장소의 자료에서 찾은 근거를 모읍니다.'},
  {position:'100% 100%',alt:'조사 테이블에서 사진과 기록을 정리하는 사람들',label:'여섯 번째 장면',caption:'안내문을 고친 뒤 다음 여행을 이야기합니다.'},
];
const image = document.querySelector('#comic-image');
const caption = document.querySelector('#comic-caption');
for (const button of document.querySelectorAll('[data-scene]')) {
  button.setAttribute('aria-controls', 'comic-image comic-caption');
  button.addEventListener('click', () => {
    const scene = sceneData[Number(button.dataset.scene)];
    if (!scene) return;
    for (const option of document.querySelectorAll('[data-scene]')) {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    }
    if (image) { image.style.backgroundPosition = scene.position; image.setAttribute('aria-label', scene.alt); }
    if (caption) { caption.querySelector('span').textContent = scene.label; caption.querySelector('strong').textContent = scene.caption; }
  });
}
