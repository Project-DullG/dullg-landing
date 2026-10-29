import scenePresentation from './scene-presentation.mjs?v=tabletop3d-20261029-v1';
import { LOCATIONS, LOCATION_BY_ID, ROLES, SOLUTION, ENDING } from './content.mjs?v=deep-review-20261027';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const names = ids => ids.map(id => LOCATION_BY_ID[id].shortName).join(' → ');
const paragraphs = value => String(value).split('\n').map(line => `<p>${esc(line)}</p>`).join('');
const note = (key, label, rows = 2) => `<label class="mlk-writing"><span>${esc(label)}</span><textarea data-note="${esc(key)}" aria-label="${esc(label)}" rows="${rows}" spellcheck="false"></textarea></label>`;
const sheet = (code, title, body, classes = '') => `<article class="mlk-paper ${classes}"><header><span class="mlk-code">${esc(code)}</span><h2>${esc(title)}</h2></header><div class="mlk-paper-body">${body}</div></article>`;
const cover = (code, title, instruction, classes = '') => `<article class="mlk-cover ${classes}"><span class="mlk-code">${esc(code)}</span><div class="mlk-cover-mark" aria-hidden="true"></div><h2>${esc(title)}</h2><p>${esc(instruction)}</p><span class="mlk-cover-foot">울릉도: 사라진 항해일지</span></article>`;

export const PUBLIC_DOCUMENTS = [
  { id: 'R1', type: '접수한 제보', title: '첫날의 장소가 다릅니다.', body: '“첫날 하람을 만난 곳은 저동이었어요. 원고를 다시 봐 주세요.”\n전시 준비실에 도착한 메모입니다. 원본 항해일지 대신 네 장소의 원고 복사본이 남아 있습니다.' },
  { id: 'R2', type: '임시 안내문', title: '아직 확인하지 않은 방문 순서', body: '삼선암 → 저동 → 태하 → 나리분지\n“기록자 하람이 방문한 순서입니다.”\n인쇄하기 전, 이 안내문의 순서와 설명이 맞는지 확인해야 합니다.' },
];

export const MANUAL_FRONT = `<article class="mlk-book-cover"><img src="assets/hero.webp" alt="밤바다와 사라진 항해일지의 기록" draggable="false"><div><span>울릉고 손예령, 한효원</span><h2>울릉도<br>사라진 항해일지</h2><p>협력 기록 미스터리</p><strong>조사 안내</strong><small>안쪽 규칙지 2장, 앞뒷면 4쪽</small></div></article>`;
export const MANUAL_BACK = sheet('규칙서 / 차례', '조사하는 차례', `<ol class="mlk-flow"><li><b>준비</b><span>안쪽 규칙지와 R1·R2를 읽습니다.</span></li><li><b>조사</b><span>장소 봉투의 자료 세 장을 나눠 읽습니다.</span></li><li><b>기록과 확인</b><span>답과 근거를 W1에 쓰고 그 장소의 확인 카드와 비교합니다.</span></li><li><b>최종 복원</b><span>네 장소를 마치면 W2 앞뒷면을 채우고 최종 봉투를 엽니다.</span></li></ol><small>준비와 도움 규칙은 안쪽 두 장을 앞뒷면까지 읽어 주세요.</small>`, 'mlk-book-back');
const rulesSetup = sheet('규칙지 1 / 앞면', '조사를 시작하기 전에', `<h3>우리에게 온 제보</h3><p>내일 열릴 여행 전시의 원본 항해일지가 사라졌습니다. 임시 안내문의 방문 순서가 첫날을 기억하는 사람의 말과 다릅니다. 네 장소의 복사본으로 여행과 전시의 순서를 각각 복원하세요.</p><h3>준비할 구성품</h3><p>장소 봉투 4개, 최종 봉투 1개, 지도, 규칙지 2장, R1·R2, W1·W2와 M1, 공용 말 1개와 힌트 토큰 6개입니다. 종이로 할 때는 필기구도 준비합니다.</p><ol><li>지도와 공용 자료, W1·W2를 펼치고 지도 위에 말을 놓습니다.</li><li>장소 봉투마다 E1·E2·E3 세 장, 질문지, 내용을 가린 확인 카드를 넣고 닫습니다.</li><li>힌트는 장소별 1단계가 위에 오도록 두 장씩 포갭니다. 내용 면은 아래로 둡니다.</li><li>F1 확인 카드 5장과 F2, M1은 내용을 가려 최종 봉투에 넣습니다. 토큰 6개를 모으고 R1·R2를 읽습니다.</li></ol><p class="mlk-callout">A5 자료는 반접어 C6에 넣습니다. 카드는 두 면 등을 맞대 접어 양면으로 만듭니다. 표지는 위, 내용은 아래로 놓습니다. 확인 카드는 다시 반접어 C6에 넣습니다.</p>`, 'mlk-rule-leaf');
const rulesInvestigation = sheet('규칙지 1 / 뒷면', '한 장소를 조사하는 방법', `<ol class="mlk-rule-steps"><li>함께 장소를 정하고 공용 말을 옮깁니다. 네 봉투는 어느 순서로 열어도 됩니다.</li><li>봉투 안의 자료 3장을 나눠 읽습니다. W1에 날짜, 전시칸, 표제와 근거 자료 번호를 적습니다.</li><li>질문지를 읽고 팀의 답과 근거를 W1에 씁니다. 막히면 해당 장소의 힌트를 사용합니다.</li><li>답을 정한 뒤 그 장소의 확인 카드만 뒤집어 비교합니다. 다르면 자료를 다시 읽고 고칩니다.</li><li>자료가 답을 뒷받침하면 W1에 확인 내용을 남깁니다. 역할을 바꾸어 다음 장소를 고릅니다.</li></ol><h3>역할 나누기</h3>${ROLES.map(role => `<p><b>${esc(role.name)}</b> — ${esc(role.text)}</p>`).join('')}<p>2명은 두 역할씩, 3명은 한 사람이 기록과 설명을 함께 맡습니다. 장소를 바꿀 때 역할도 한 칸씩 교대합니다.</p><p class="mlk-callout">이미 본 자료는 언제든 다시 읽습니다. 오답 벌점이나 탈락은 없습니다.</p>`, 'mlk-rule-leaf');
const rulesHelp = sheet('규칙지 2 / 앞면', '도움이 필요할 때', `<h3>힌트는 한 단계씩</h3><ol><li>막힌 장소의 1단계만 뒤집습니다. 더 필요하면 2단계를 읽습니다. 위 카드를 옮기면 아래 단계가 나옵니다.</li><li>새 단계를 처음 읽을 때 토큰 하나를 사용한 자리로 옮기고 W1에 장소와 단계를 적습니다.</li><li>6개를 모두 썼다면 남은 힌트도 무료로 읽고 무료 도움 횟수를 적습니다.</li></ol><p>같은 힌트를 다시 읽거나 확인 카드를 비교할 때는 토큰을 더 쓰지 않습니다.</p><h3>장소의 답 확인하기</h3><p>팀의 답과 근거를 먼저 적은 뒤 그 장소의 확인 카드만 읽습니다. 같은 뜻이면 맞는 답입니다. 표현이나 맞춤법 차이로 틀렸다고 하지 않습니다.</p><p>답이 다르면 원문을 다시 읽고 W1에 고친 내용과 자료 번호를 적습니다. 모든 팀이 네 장소의 질문을 확인하고 끝까지 복원합니다.</p><h3>자료를 정리할 때</h3><p>꺼낸 자료는 그대로 두거나 봉투에 다시 넣어도 됩니다. 순서가 섞여도 자료 번호 앞의 J·S·T·N으로 장소를 찾을 수 있습니다.</p>`, 'mlk-rule-leaf');
const rulesFinish = sheet('규칙지 2 / 뒷면', '복원을 마치는 방법', `<ol class="mlk-rule-steps"><li>네 장소의 질문과 근거를 모두 확인한 뒤 W2 앞뒷면을 작성합니다.</li><li>실제 방문 순서와 전시 순서, 안내문의 오류 원인, 근거 세 가지, 수정 안내문을 팀의 말로 적습니다.</li><li>완성한 답을 소리 내어 읽은 뒤 최종 봉투를 엽니다. F1과 다섯 항목을 직접 비교합니다.</li><li>처음 쓴 답을 남기고, 빠지거나 다른 내용은 자료와 해설로 고칩니다. W2에 확인 횟수와 결과를 적습니다.</li><li>F2를 읽고 각자 가 보고 싶은 장소와 기억에 남은 내용을 한 가지씩 나눕니다.</li></ol><h3>복원 결과</h3><p><b>독립 복원</b> — 처음 완성한 답의 다섯 항목이 모두 해설과 같은 뜻입니다.</p><p><b>재검토 복원</b> — 빠지거나 다른 항목을 고쳐 모두 완성했습니다.</p><p class="mlk-callout">뜻이 같으면 맞는 답입니다. 힌트 사용은 결과와 따로 기록합니다. 개인 승자나 탈락자는 없습니다. 함께 기록을 되찾으면 게임을 마칩니다.</p><footer>원안 손예령, 한효원. 사건과 인물, 조사 문서는 창작입니다.</footer>`, 'mlk-rule-leaf');

const mapHTML = `<article class="mlk-map"><header><span class="mlk-code">B1 / A3 접이 조사 지도</span><h2>네 장소에 남은 기록</h2></header><div class="mlk-map-picture"><img src="assets/investigation-map.webp" alt="울릉도 산과 해안선을 그린 조사 지도" draggable="false"><span class="mlk-map-pin mlk-pin-jeodong">저동 촛대바위</span><span class="mlk-map-pin mlk-pin-samseonam">북면 삼선암</span><span class="mlk-map-pin mlk-pin-taeha">태하 황토굴</span><span class="mlk-map-pin mlk-pin-nari">나리분지</span></div><p>공용 말을 옮겨 조사할 봉투를 고릅니다. 방문 순서는 자유입니다.</p><small>그림은 조사 장소의 방향을 짚는 개념 지도입니다. 실제 거리나 이동 경로를 나타내지 않습니다.</small></article>`;

const ledgerFace = (locations, back = false) => sheet(`W1 / 공동 기록지 ${back ? '뒷면' : '앞면'}`, '날짜와 번호, 답과 근거', `<p class="mlk-subtitle">자료를 대조하며 빈칸을 채우세요. ${back ? '저동과 삼선암은 앞면에 적습니다.' : '태하와 나리분지는 뒷면에 적습니다.'}</p><div class="mlk-ledger">${locations.map(location => `<section><h3>${esc(location.name)}</h3>${note(`${location.id}-facts`, '여행 날짜 / 전시칸 / 표제', 1)}${note(`${location.id}-answer`, '장소 질문의 답과 근거 자료', 3)}${note(`${location.id}-check`, '확인 카드와 비교한 내용 / 수정한 점', 2)}</section>`).join('')}</div>${back ? '<p class="mlk-callout">네 장소의 답과 근거를 확인했으면 W2를 펼쳐 팀의 복원안을 적습니다. 정답 확인은 최종 봉투를 열어 직접 비교합니다.</p>' : `<div class="mlk-hint-record">${note('hint-record', '힌트 기록: 장소와 단계 / 쓴 토큰 수(0–6) / 무료 도움 횟수', 1)}</div>`}`, 'mlk-worksheet mlk-ledger-sheet');
const finalWorksheetHTML = sheet('W2 / 최종 복원지 앞면', '우리가 복원한 여행', `<p class="mlk-subtitle">네 장소의 질문과 근거를 확인한 뒤 작성합니다. 두 순서에는 네 장소를 한 번씩 적으세요. 근거와 수정 안내문은 뒷면에 적습니다.</p>${note('final-travel', '1. 실제 방문 순서: 첫날 → 마지막 날', 2)}${note('final-exhibition', '2. 전시장에서 읽는 순서: 입구 → 끝', 2)}${note('final-cause', '3. 안내문의 오류 원인: 무엇을 어디로 옮겼나요?', 3)}<p class="mlk-callout">아직 최종 확인 봉투를 열지 않습니다. 뒷면의 근거 세 가지와 수정 안내문도 완성하세요.</p>`, 'mlk-worksheet mlk-final-worksheet');
const finalWorksheetBack = sheet('W2 / 최종 복원지 뒷면', '근거를 들어 안내문 고치기', `${note('final-evidence', '4. 근거 세 가지: 자료 번호와 확인한 내용', 4)}${note('final-correction', '5. 관람객에게 줄 수정 안내문', 4)}<p class="mlk-callout">앞뒷면을 모두 적은 뒤 최종 확인 봉투를 엽니다. 처음 쓴 답을 지우기 전에 비교하고, 수정한 부분을 따로 표시하세요.</p>${note('final-result', '최종 확인 횟수 / 독립 복원 또는 재검토 복원', 1)}`, 'mlk-worksheet mlk-final-worksheet');

const envelopeHTML = (location, final = false) => `<article class="mlk-envelope ${final ? 'mlk-final-envelope' : ''}"><div class="mlk-envelope-label"><span>${final ? '모든 기록을 복원한 뒤' : '장소 조사 봉투'}</span><h2>${esc(final ? '최종 확인' : location.name)}</h2><p>${final ? 'F1 확인 카드 5장 / F2 끝맺음' : '원고와 편집 자료 3장\n질문지와 접어 둔 확인 카드'}</p></div></article>`;
const questionHTML = location => sheet(`${location.id.toUpperCase()}-Q / 장소 질문`, location.name, `<h3>${esc(location.question.prompt)}</h3><ol class="mlk-lettered-options" type="A">${location.question.options.map(option => `<li>${esc(option.text)}</li>`).join('')}</ol><p class="mlk-callout">답과 근거를 W1에 적은 뒤 확인 카드를 뒤집으세요.</p>`, 'mlk-question');
const answerHTML = location => sheet(`${location.id.toUpperCase()}-A / 장소 확인`, location.name, `<h3>자료가 뒷받침하는 답</h3><p class="mlk-check-answer">${esc(location.question.options.find(option => option.id === location.question.answerId).text)}</p><h3>근거</h3><p>${esc(location.question.explanation)}</p><small>같은 뜻이면 맞는 답입니다. 고친 내용은 W1에 남깁니다.</small>`, 'mlk-check');

const pieces = [
  { id: 'map', label: 'A3 접이 조사 지도', type: 'board', x: 510, y: 300, width: 840, height: 594, front: mapHTML },
  { id: 'rulebook', label: '규칙서: 준비와 진행', type: 'book', x: 70, y: 50, width: 296, height: 420, contains: ['rules-setup', 'rules-help'], front: MANUAL_FRONT, back: MANUAL_BACK },
  { id: 'rules-setup', label: '규칙지 1: 준비와 조사', type: 'paper', x: 530, y: 300, width: 420, height: 594, hidden: true, front: rulesSetup, back: rulesInvestigation },
  { id: 'rules-help', label: '규칙지 2: 도움과 완료', type: 'paper', x: 990, y: 300, width: 420, height: 594, hidden: true, front: rulesHelp, back: rulesFinish },
  ...PUBLIC_DOCUMENTS.map((doc, index) => ({ id: doc.id, label: `${doc.id} ${doc.type}`, type: 'paper', x: 40 + index * 330, y: 1040, width: 296, height: 420, angle: index ? 1 : -1, front: sheet(`${doc.id} / ${doc.type}`, doc.title, paragraphs(doc.body), 'mlk-public-document') })),
  { id: 'worksheet', label: 'W1 공동 기록지', type: 'paper', x: 1710, y: 50, width: 420, height: 594, front: ledgerFace(LOCATIONS.slice(0, 2)), back: ledgerFace(LOCATIONS.slice(2), true) },
  { id: 'final-worksheet', label: 'W2 최종 복원지', type: 'paper', x: 1710, y: 830, width: 420, height: 594, front: finalWorksheetHTML, back: finalWorksheetBack },
  { id: 'shared-pawn', label: '공용 조사 말', type: 'token', x: 910, y: 630, width: 38, height: 48, front: '<div class="mlk-pawn" aria-label="공용 조사 말"><i></i></div>' },
  ...Array.from({ length: 6 }, (_, index) => ({ id: `hint-token-${index + 1}`, label: `공용 힌트 토큰 ${index + 1}`, type: 'token', x: 1490 + (index % 3) * 66, y: 270 + Math.floor(index / 3) * 66, width: 58, height: 58, front: '<div class="mlk-token"><span>힌트</span></div>', back: '<div class="mlk-token mlk-token-used"><span>사용</span></div>' })),
];

LOCATIONS.forEach(location => {
  const positions = { jeodong: [1130, 1050, 760, 980], samseonam: [1040, 40, 1380, 50], taeha: [100, 500, 130, 780], nari: [700, 40, 380, 50] };
  const [x, y, hintX, hintY] = positions[location.id];
  const children = [...location.documents.map(doc => doc.id), `${location.id}-question`, `${location.id}-check`];
  pieces.push({ id: `${location.id}-envelope`, label: `${location.name} 봉투`, type: 'envelope', x, y, width: 324, height: 228, contains: children, front: envelopeHTML(location), back: envelopeHTML(location) });
  location.documents.forEach((doc, documentIndex) => pieces.push({ id: doc.id, label: `${doc.id} ${doc.type}`, type: 'paper', x: 530 + documentIndex * 305, y: 310, width: 296, height: 420, hidden: true, front: sheet(`${doc.id} / ${doc.type}`, doc.title, paragraphs(doc.body), 'mlk-evidence'), back: cover(doc.id, location.name, '원고와 편집 자료') }));
  pieces.push({ id: `${location.id}-question`, label: `${location.name} 질문지`, type: 'card', x: 700, y: 800, width: 296, height: 420, hidden: true, front: questionHTML(location), back: sheet('장소 소개', location.name, `<p>${esc(location.intro)}</p><p class="mlk-callout">자료 세 장을 읽고 질문지 앞면을 확인하세요. 팀의 답과 근거는 W1에 적습니다.</p>`) });
  pieces.push({ id: `${location.id}-check`, label: `${location.name} 확인 카드`, type: 'card', x: 1040, y: 800, width: 296, height: 420, hidden: true, faceDown: true, backLabel: `${location.name} 확인 카드`, front: answerHTML(location), back: cover('장소 확인', location.name, '팀의 답과 근거를 W1에 적은 뒤 뒤집으세요.', 'mlk-sealed') });
  [1, 0].forEach(hintIndex => { const hint = location.hints[hintIndex]; pieces.push({ id: `${location.id}-hint-${hintIndex + 1}`, label: `${location.name} ${hintIndex + 1}단계 힌트`, type: 'card', x: hintX, y: hintY, width: 296, height: 210, pile: `${location.id}-hints`, faceDown: true, backLabel: `${location.name} ${hintIndex + 1}단계 힌트`, front: sheet(`도움 ${hintIndex + 1}단계 / ${location.name}`, hint.title, `<p>${esc(hint.text)}</p><small>처음 읽는 단계면 토큰 1개를 옮깁니다. 토큰이 없으면 무료 도움으로 기록합니다. 다시 읽기는 무료입니다.</small>`, 'mlk-hint'), back: cover(`도움 ${hintIndex + 1}단계`, location.name, hintIndex === 0 ? '막히면 토큰 1개를 옮기고 뒤집으세요.' : '1단계를 읽고도 필요할 때 뒤집으세요.', 'mlk-hint-cover') }); });
});

const finalCard = (id, number, title, body, index) => ({ id, label: `F1-${number} 최종 확인 카드`, backLabel: `봉인된 최종 확인 카드 ${number}`, type: 'card', x: 530 + (index % 3) * 305, y: 310 + Math.floor(index / 3) * 450, width: 296, height: 420, hidden: true, faceDown: true, front: sheet(`F1-${number} / 최종 확인`, title, body, 'mlk-final-check'), back: cover(`F1-${number} / 최종 확인`, '복원안을 다 썼나요?', 'W2 앞뒷면을 완성한 뒤 뒤집어 비교하세요.', 'mlk-sealed') });
pieces.push(
  { id: 'memory', label: 'M1 여행 기억지', type: 'paper', x: 530, y: 500, width: 420, height: 594, hidden: true, front: sheet('M1 / 복원을 마친 뒤', '다음에는 어디에 가 볼까요?', `<p>${esc(ENDING.memoryPrompt)}</p>${note('travel-memory', '기억에 남은 장소와 그곳에 가고 싶은 이유', 5)}<small>인원수만큼 종이에 따로 적어도 됩니다. 점수로 매기지 않고 서로 소개합니다.</small>`, 'mlk-memory') },
  { id: 'final-envelope', label: '최종 확인 봉투', type: 'envelope', x: 1370, y: 620, width: 324, height: 228, contains: ['final-answer', 'final-exhibition', 'final-cause', 'final-evidence', 'final-correction', 'epilogue', 'memory'], front: envelopeHTML(null, true), back: envelopeHTML(null, true) },
  finalCard('final-answer', 1, '실제 방문 순서', `<p class="mlk-order">${esc(names(SOLUTION.travelOrder))}</p><p>${esc(SOLUTION.explanation[0])}</p>`, 0),
  finalCard('final-exhibition', 2, '전시장에서 읽는 순서', `<p class="mlk-order">${esc(names(SOLUTION.exhibitionOrder))}</p><p>${esc(SOLUTION.explanation[1])}</p>`, 1),
  finalCard('final-cause', 3, '안내문의 오류 원인', `<p>${esc(SOLUTION.explanation[2])}</p>`, 2),
  finalCard('final-evidence', 4, '근거 세 가지', `<ol><li>네 장소 E1 원고의 여행 날짜와 전후 장소</li><li>S-E2 배치표의 전시칸 번호와 장소</li><li>S-E3 전달지와 T-E3 복사 작업 이력</li></ol><p class="mlk-callout">여행 날짜, 전시 배열, 숫자를 옮긴 작업을 뒷받침하는 세 묶음이 필요합니다.</p>`, 3),
  finalCard('final-correction', 5, '안내문을 고치는 방법', `<p>실제 방문 순서를 바로잡고, 기존 배열은 전시 순서라고 따로 표시합니다. 원고 날짜는 바꾸지 않습니다.</p><h3>다섯 항목을 비교한 뒤</h3><p class="mlk-callout">모두 같은 뜻이면 독립 복원입니다. 빠지거나 다른 항목을 고쳐 완성하면 재검토 복원입니다. 첫 답을 남기고 W2에 확인 횟수와 결과를 적습니다. 힌트 사용은 따로 기록합니다.</p>`, 4),
  { id: 'epilogue', label: 'F2 끝맺음', type: 'paper', x: 780, y: 420, width: 420, height: 594, hidden: true, faceDown: true, backLabel: '봉인된 끝맺음 카드', front: sheet('F2 / 복원을 마친 뒤', ENDING.title, `<h3>수정한 안내문</h3><p class="mlk-corrected-notice">${esc(SOLUTION.correctedNotice)}</p>${ENDING.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<p class="mlk-callout">기록을 되찾았습니다. M1 여행 기억지를 읽고 가 보고 싶은 장소를 서로 소개하세요. 개인 승자나 탈락자는 없습니다.</p>`, 'mlk-epilogue'), back: cover('F2 / 끝맺음', '기록을 되찾은 뒤', 'F1 확인 카드 다섯 장을 대조하고 복원안을 완성한 뒤 함께 읽으세요.', 'mlk-sealed') },
);

// Small rotations belong to the initial physical arrangement, never to a printed face.
const initialPresentationAngles = {
  map: -0.65, rulebook: -1.8, R1: -3, R2: 2.4,
  worksheet: 1.1, 'final-worksheet': -1.4,
  'jeodong-envelope': 2.3, 'samseonam-envelope': 1.2,
  'taeha-envelope': -2.8, 'nari-envelope': -1.7, 'final-envelope': -1.3,
  'jeodong-hint-1': 1.2, 'jeodong-hint-2': 1.2,
  'samseonam-hint-1': -1.5, 'samseonam-hint-2': -1.5,
  'taeha-hint-1': -1.2, 'taeha-hint-2': -1.2,
  'nari-hint-1': 1.1, 'nari-hint-2': 1.1,
};
for (const piece of pieces) if (Object.hasOwn(initialPresentationAngles, piece.id)) piece.angle = initialPresentationAngles[piece.id];

export const PRINT_SIZES = Object.fromEntries(pieces.map(piece => [piece.id, piece.id === 'map' ? [420, 297] : piece.id === 'shared-pawn' ? [19, 24] : piece.type === 'token' ? [29, 29] : piece.type === 'envelope' ? [162, 114] : piece.width === 594 ? [297, 210] : piece.width === 420 ? [210, 297] : piece.height === 210 ? [148, 105] : [148, 210]]));

const kit = {
  id: 'missing-log-physical-v1', scene: scenePresentation, title: '울릉도: 사라진 항해일지', subtitle: '손예령, 한효원의 협력 기록 미스터리',
  size: { width: 2200, height: 1500 }, pieces,
  zones: [
    { id: 'spent-hints', label: '사용한 힌트 토큰', x: 1475, y: 455, width: 210, height: 125, html: '<span class="mlk-zone-label">사용한 힌트 토큰</span>', className: 'mlk-spent-zone' },
  ],
};
export default kit;
