import kit, { PRINT_SIZES } from './physical-kit.mjs?v=physical-components-20261029-v1';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pieces = Object.fromEntries(kit.pieces.map(piece => [piece.id, piece]));
// Print the same native faces used on the table. Notes become blank writing lines.
const blankNotes = html => html.replace(/<textarea\b([^>]*)rows="(\d+)"([^>]*)><\/textarea>/g, (_, before, rows) => `<div class="mlk-print-writing" style="--writing-rows:${Number(rows)}" aria-label="필기할 빈칸"></div>`);
const frame = (piece, face = 'front', width = PRINT_SIZES[piece.id][0]) => {
  const height = width * piece.height / piece.width;
  const scale = width * 96 / 25.4 / piece.width;
  return `<div class="mlk-print-frame" style="width:${width}mm;height:${height}mm"><div class="mlk-print-face" style="width:${piece.width}px;height:${piece.height}px;transform:scale(${scale})">${blankNotes(piece[face] || piece.front)}</div></div>`;
};
const page = (piece, face = 'front', extra = '') => {
  const [width] = PRINT_SIZES[piece.id], large = width >= 210;
  return `<section class="mlk-print-sheet ${large ? width > 210 ? 'mlk-landscape-sheet' : 'mlk-full-sheet' : 'mlk-cut-sheet'} ${extra}" aria-label="${esc(piece.label)} ${face === 'back' ? '뒷면' : '앞면'}">${!large ? `<p class="mlk-cut-label">${esc(piece.label)} / 실선을 따라 잘라 주세요.</p>` : ''}${frame(piece, face)}</section>`;
};
const fold = piece => `<section class="mlk-print-sheet mlk-landscape-sheet mlk-fold-sheet" aria-label="${esc(piece.label)} 접는 카드"><p class="mlk-fold-instruction">실선 바깥을 자르고 오른쪽 내용을 뒤로 접어 두 면의 등을 맞댑니다. 표지 위, 내용 아래의 양면 카드로 만듭니다. 장소 확인 카드는 다시 반접어 C6 봉투에 넣습니다.</p><div class="mlk-fold-pair">${frame(piece, 'back', 148)}${frame(piece, 'front', 148)}</div><p class="mlk-fold-label">${esc(piece.label)} / 등을 맞댄 양면 카드 / 표지 위, 내용 아래</p></section>`;
const pairedPages = views => Array.from({ length: Math.ceil(views.length / 2) }, (_, index) => `<section class="mlk-print-sheet mlk-landscape-sheet mlk-paired-sheet"><div class="mlk-print-duo">${views.slice(index * 2, index * 2 + 2).map(([piece, face = 'front']) => frame(piece, face)).join('')}</div></section>`).join('');
const hintPages = values => Array.from({ length: Math.ceil(values.length / 2) }, (_, index) => `<section class="mlk-print-sheet mlk-landscape-sheet mlk-hint-folds">${values.slice(index * 2, index * 2 + 2).map(piece => `<div class="mlk-fold-pair" aria-label="${esc(piece.label)} 등을 맞대어 접는 양면 카드, 표지 위 내용 아래">${frame(piece, 'back')}${frame(piece)}</div>`).join('')}</section>`).join('');
const hints = kit.pieces.filter(piece => /-hint-[12]$/.test(piece.id));
const checks = kit.pieces.filter(piece => piece.id.endsWith('-check'));
const docs = kit.pieces.filter(piece => /^[JSTN]-E[123]$/.test(piece.id));
const questions = kit.pieces.filter(piece => piece.id.endsWith('-question'));
const envelopes = kit.pieces.filter(piece => piece.type === 'envelope');

document.querySelector('#print-content').innerHTML = `<section class="mlk-print-sheet mlk-preparation"><span class="mlk-code">준비하는 사람이 먼저 읽기</span><h1>울릉도: 사라진 항해일지</h1><p class="mlk-print-lead">이 인쇄물과 봉투, 말, 필기구만으로 처음부터 끝까지 진행할 수 있습니다.</p><h2>준비물</h2><p>빈 C6 봉투 5개, 공용 말 1개, 가위, 필기구를 준비합니다. 힌트 토큰은 아래 인쇄 조각 6개 또는 동전 6개로 대신할 수 있습니다.</p><h2>자료를 나누어 넣기</h2><ol><li>장소 봉투 4개에 해당 장소의 E1·E2·E3 자료 3장과 질문지, 양면으로 만든 뒤 한 번 더 반접은 장소 확인 카드를 넣습니다. 자료는 반으로 접으면 C6 봉투에 들어갑니다.</li><li>힌트는 장소별 1·2단계 총 8개를 각각 등을 맞대 접어 양면 카드로 만듭니다. 표지를 위로, 내용을 아래로 놓고 봉투 옆에 둡니다.</li><li>F1 최종 확인 카드 5장과 F2 끝맺음, M1 기억지를 접어 최종 봉투에 넣습니다. 게임을 준비할 때 내용을 미리 읽지 않아도 됩니다.</li><li>A4 두 장을 이어 붙인 A3 접이 지도, 규칙서와 규칙지 1·2, R1·R2, 앞뒷면 W1·W2를 펼칩니다. 말은 지도에, 토큰 6개는 한곳에 모읍니다.</li></ol></section><section class="mlk-print-sheet mlk-preparation"><span class="mlk-code">준비하는 사람이 먼저 읽기</span><h1>인쇄와 접기</h1><p>A4 용지, 배율 100%, 배경 그래픽 켜기, 단면 인쇄를 사용합니다. 가로 면은 가로 A4 페이지로 지정되어 있습니다. 지도는 왼쪽·오른쪽 두 페이지를 여백 없이 맞대어 붙이면 A3 크기가 됩니다. 프린터가 여백을 남기면 배경 테두리를 기준으로 잘라 이으세요. 규칙서 표지, 규칙지 1·2와 W1·W2, 질문지의 앞뒷면은 등을 맞대어 붙이거나 나란히 두어도 됩니다. 힌트와 장소 확인 카드는 가운데 점선에서 오른쪽 내용을 뒤로 접어 인쇄하지 않은 두 면의 등을 맞댑니다. 양면 카드가 되면 표지가 위, 내용이 아래로 가게 놓습니다. 장소 확인 카드는 다시 반접어 C6 봉투에 넣습니다.</p><p>봉투 그림은 표지용입니다. 잘라 빈 봉투에 붙이거나 장소 이름만 직접 적어도 됩니다. 인쇄 면을 종이 뒤로 보이게 하지 않으려면 두꺼운 용지나 덧종이를 사용하세요.</p><div class="mlk-calibration">이 선이 실제 100 mm인지 확인하세요.</div><h2>준비 확인</h2><p>장소 자료 12장, 질문지 4장, 장소 확인 카드 4개, 단계 힌트 8개, 최종 확인 카드 5장과 끝맺음 1장, R1·R2, 규칙서와 규칙지 1·2, W1·W2, M1, 지도, 토큰 6개와 공용 말이 있으면 준비가 끝납니다. 규칙서부터 함께 읽습니다.</p><p class="mlk-print-credit">원안 손예령, 한효원. 인물과 사건, 조사 문서는 창작입니다.</p></section>
${pairedPages([[pieces.rulebook], [pieces.rulebook, 'back']])}${page(pieces['rules-setup'])}${page(pieces['rules-setup'], 'back')}${page(pieces['rules-help'])}${page(pieces['rules-help'], 'back')}${[0, 1].map(half => `<section class="mlk-print-sheet mlk-full-sheet mlk-map-half" aria-label="A3 지도 ${half ? '오른쪽' : '왼쪽'} 절반"><div class="mlk-map-half-window"><div style="margin-left:-${half * 210}mm">${frame(pieces.map)}</div></div></section>`).join('')}${pairedPages([[pieces.R1], [pieces.R2]])}${page(pieces.worksheet)}${page(pieces.worksheet, 'back')}${page(pieces['final-worksheet'])}${page(pieces['final-worksheet'], 'back')}${page(pieces.memory)}
${pairedPages(docs.map(piece => [piece]))}${pairedPages(questions.flatMap(piece => [[piece], [piece, 'back']]))}
${Array.from({ length: Math.ceil(envelopes.length / 2) }, (_, index) => `<section class="mlk-print-sheet mlk-envelope-sheet"><h2>빈 봉투에 붙이는 표지</h2>${envelopes.slice(index * 2, index * 2 + 2).map(piece => frame(piece)).join('')}<p>표지를 자르고 같은 장소의 자료를 넣습니다. 최종 봉투는 복원지 W2를 완성한 뒤 엽니다.</p></section>`).join('')}
<section class="mlk-print-sheet mlk-token-sheet"><h2>공용 힌트 토큰 6개</h2><p>원을 따라 오려 주세요. 동전 6개로 대신해도 됩니다.</p><div class="mlk-print-tokens">${kit.pieces.filter(piece => piece.id.startsWith('hint-token-')).map(piece => frame(piece)).join('')}</div><h2>공용 조사 말</h2><p>아래 말을 잘라 판지에 붙이거나 다른 보드게임의 말 1개를 사용합니다. 말은 조사할 장소를 함께 가리키기 위한 구성품입니다.</p>${frame(pieces['shared-pawn'])}<h2>힌트 사용</h2><p>새 단계를 처음 읽을 때만 토큰 하나를 옮깁니다. 같은 단계는 무료로 다시 읽습니다. 6개를 모두 쓴 뒤에도 남은 단계는 무료로 읽고 W1에 무료 도움 횟수만 적습니다.</p></section>
<section class="mlk-print-sheet mlk-secret-divider"><h2>이 뒤는 접어서 가리는 자료입니다.</h2><p>힌트 8개와 장소 확인 카드 4개, 최종 확인 카드 F1 다섯 장과 F2 끝맺음이 이어집니다. 내용을 읽지 않고 접은 뒤 각 봉투와 정해진 자리에 넣으세요.</p><p class="mlk-screen-only"><button type="button" id="show-solutions">준비용 내용 화면에서 펼치기</button></p></section>
<div class="mlk-secret-sheets">${hintPages(hints)}${checks.map(fold).join('')}${pairedPages(['final-answer','final-exhibition','final-cause','final-evidence','final-correction'].map(id => [pieces[id]]))}${page(pieces.epilogue)}</div>`;

const checkbox = document.querySelector('#include-solutions');
checkbox.checked = true;
document.body.classList.add('include-solutions');
checkbox.addEventListener('change', () => document.body.classList.toggle('include-solutions', checkbox.checked));
document.querySelector('#print-button').addEventListener('click', () => window.print());
document.querySelector('#show-solutions').addEventListener('click', event => {
  const shown = document.body.classList.toggle('show-solutions');
  event.currentTarget.textContent = shown ? '준비용 내용 화면에서 접기' : '준비용 내용 화면에서 펼치기';
  if (shown) document.querySelector('.mlk-secret-sheets').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
});
