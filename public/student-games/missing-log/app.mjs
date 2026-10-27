import { LOCATIONS, LOCATION_BY_ID, INTRO, RULES, ROLES, FINAL_CAUSES, FINAL_EVIDENCE, FINAL_CORRECTIONS, SOLUTION, ENDING } from './content.mjs?v=deep-review-20261027';
import { createGame, validState, visitLocation, answerLocation, useHint, setFinalAnswer, submitFinal, canSubmitFinal } from './engine.mjs';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const storageKey = 'student-missing-log-v1';
let state, selectedLocation = null, pendingAnswers = {}, noticeTimer, resumed = false;
const names = ids => ids.map(id => LOCATION_BY_ID[id].shortName).join(' → ');
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function initialOrders(value) {
  if (value.phase === 'finished') return value;
  for (const field of ['travelOrder', 'exhibitionOrder']) if (value.finalAnswer[field].length !== 4) value = setFinalAnswer(value, field, LOCATIONS.map(location => location.id));
  return value;
}
try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  resumed = validState(stored?.state);
  state = initialOrders(resumed ? stored.state : createGame(2));
  if (state.visited.includes(stored?.selectedLocation)) selectedLocation = stored.selectedLocation;
} catch { state = initialOrders(createGame(2)); }
selectedLocation ||= state.visited.at(-1) || null;

function notice(message) {
  const element = $('#notice');
  element.textContent = message; element.hidden = false;
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { element.hidden = true; }, 5000);
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ state, selectedLocation })); $('#save-status').textContent = resumed ? '저장한 조사 이어가기, 변경 사항 자동 저장' : '이 기기에 진행을 자동 저장합니다.'; }
  catch { $('#save-status').textContent = '저장할 수 없습니다. 이 창을 유지해 주세요.'; }
}
function update(action, { all = true } = {}) {
  try {
    const next = action(state);
    if (!validState(next)) throw new Error('진행 상태를 확인할 수 없습니다. 다시 시도해 주세요.');
    state = next; save(); if (all) render();
    return true;
  } catch (error) { notice(error.message); return false; }
}
function docHTML(doc) {
  return `<article class="evidence-document"><div class="document-meta"><span>${esc(doc.id)} / ${esc(doc.type)}</span><span>조사 자료</span></div><h3>${esc(doc.title)}</h3><div class="document-body">${esc(doc.body)}</div></article>`;
}
function roleText() {
  const shift = Math.max(0, state.visited.length - 1) % state.playerCount;
  const roles = state.playerCount === 2 ? ['읽기와 대조', '기록과 설명'] : state.playerCount === 3 ? ['읽기', '기록과 설명', '대조'] : ROLES.map(role => role.name);
  return roles.map((role, index) => `참가자 ${(index + shift) % state.playerCount + 1}: ${role}`).join(', ');
}
function renderMap() {
  $('#map-locations').innerHTML = LOCATIONS.map(location => `<button class="map-location ${location.id} ${selectedLocation === location.id ? 'active' : ''} ${state.answers[location.id]?.correct ? 'confirmed' : ''}" data-visit="${location.id}" aria-pressed="${selectedLocation === location.id}" aria-label="${esc(location.name)} 봉투 ${state.answers[location.id]?.correct ? '확인 완료' : state.visited.includes(location.id) ? '다시 읽기' : '열기'}">${esc(location.shortName)}<small>${state.answers[location.id]?.correct ? '확인 완료' : state.visited.includes(location.id) ? '자료 펼침' : '봉투 열기'}</small></button>`).join('');
  $('#site-progress').textContent = `${LOCATIONS.filter(location => state.answers[location.id]?.correct).length} / 4 확인`;
  $('#investigation-ledger').innerHTML = LOCATIONS.map(location => `<div class="ledger-row"><b>${esc(location.name)}</b><span class="${state.answers[location.id]?.correct ? 'confirmed-label' : ''}">${state.answers[location.id]?.correct ? '질문 확인 완료' : state.visited.includes(location.id) ? '조사 중' : '아직 닫힌 봉투'}</span></div>`).join('');
  $('#hint-count').textContent = state.hintTokens;
  $('#hint-note').textContent = state.hintTokens ? '개' : `개, 무료 도움 ${state.freeHints}회`;
  $('#team-roles').textContent = roleText() + '. 장소가 바뀌면 역할을 교대합니다.';
  $('#player-count').value = state.playerCount;
  $('#player-count').disabled = state.visited.length > 0;
  $('#player-count').title = state.visited.length ? '인원 변경은 새 조사에서 할 수 있습니다.' : '';
  $('#team-state').textContent = '현재 ' + state.playerCount + '명 ' + (state.phase === 'finished' ? '복원 완료' : state.visited.length ? '조사 중' : '준비 중');
  const confirmed = LOCATIONS.filter(location => state.answers[location.id]?.correct).length;
  $('#desk-route-status').textContent = state.phase === 'finished' ? '복원을 마쳤습니다.' : selectedLocation ? LOCATION_BY_ID[selectedLocation].shortName + ' 자료 펼침, 질문 ' + confirmed + ' / 4 확인' : '원하는 장소의 봉투부터 열어 주세요.';
  $('#question-jump').disabled = !selectedLocation;
  $('#restoration-jump').href = state.phase === 'finished' ? '#ending' : '#restoration';
  $('#restoration-jump').textContent = state.phase === 'finished' ? '복원 결과' : '복원 답안';
}
function renderLocation() {
  const target = $('#location-content');
  if (!selectedLocation) {
    const publicDocuments = [
      { id: 'R1', type: '접수한 제보', title: '첫날의 장소가 다릅니다.', body: '“첫날 하람을 만난 곳은 저동이었어요. 원고를 다시 봐 주세요.”\n전시 준비실에 도착한 메모입니다. 원본 항해일지 대신 네 장소의 원고 복사본이 남아 있습니다.' },
      { id: 'R2', type: '임시 안내문', title: '아직 확인하지 않은 방문 순서', body: '삼선암 → 저동 → 태하 → 나리분지\n“기록자 하람이 방문한 순서입니다.”\n인쇄하기 전, 이 안내문의 순서와 설명이 맞는지 확인해야 합니다.' },
      { id: 'W1', type: '공동 복원판', title: '날짜, 표제, 번호와 작업 기록', body: '네 봉투의 자료를 나누어 읽고 날짜와 번호가 무엇을 뜻하는지 적어 보세요. 답을 정할 때는 자료 번호와 근거 문장을 함께 짚습니다.\n어느 봉투부터 열어도 됩니다. 이미 본 자료는 자유롭게 다시 읽습니다.' },
    ];
    target.innerHTML = `<div class="location-heading"><span class="file-label">공개 기록 / 조사 준비</span><h2>접수된 기록이 놓여 있습니다.</h2><p>인원을 고르고 네 봉투 중 원하는 곳을 열어 주세요. 조사 자료는 봉투를 고르면 이 자리에 펼쳐집니다.</p></div><div class="documents-grid">${publicDocuments.map(docHTML).join('')}</div>`;
    return;
  }
  const location = LOCATION_BY_ID[selectedLocation], answer = state.answers[location.id], hintCount = state.hints[location.id], finished = state.phase === 'finished';
  const checkedAnswer = pendingAnswers[location.id] || answer?.answerId;
  target.innerHTML = `<div class="location-heading"><span class="file-label">장소 봉투 / ${esc(location.theme)}</span><h2>${esc(location.name)}</h2><p>${esc(location.intro)}</p></div><div class="documents-grid">${location.documents.map(docHTML).join('')}</div><form class="site-question" id="site-question" data-location="${location.id}"><p class="eyebrow">Q / 함께 답하기</p><h3 id="site-question-title">${esc(location.question.prompt)}</h3><div class="option-list" role="group" aria-labelledby="site-question-title">${location.question.options.map(option => `<label class="choice-option"><input type="radio" name="site-answer" value="${option.id}" ${checkedAnswer === option.id ? 'checked' : ''} ${answer?.correct || finished ? 'disabled' : ''}><span>${esc(option.text)}</span></label>`).join('')}</div><div class="question-actions"><button class="button brass" type="submit" ${answer?.correct || finished ? 'disabled' : ''}>${answer?.correct ? '질문 확인 완료' : '답 확인하기'}</button><button class="hint-button" type="button" data-hint="${location.id}" ${hintCount >= location.hints.length || finished ? 'disabled' : ''}>${hintCount >= location.hints.length ? '힌트 모두 펼침' : state.hintTokens ? `힌트 ${hintCount + 1}단계 (토큰 1개)` : `무료 도움 ${hintCount + 1}단계`}</button></div>${answer ? `<div class="question-feedback ${answer.correct ? 'correct' : ''}" role="status" tabindex="-1"><b>${answer.correct ? '자료와 맞는 답입니다.' : '자료를 한 번 더 대조해 주세요.'}</b>${answer.correct ? esc(location.question.explanation) : '오답 벌점은 없습니다. 다른 봉투도 살펴본 뒤 다시 답해도 됩니다.'}</div>` : ''}</form>${location.hints.slice(0, hintCount).map((hint, index) => `<section class="hint-sheet" tabindex="-1"><h4>도움 ${index + 1} / ${esc(hint.title)}</h4><p>${esc(hint.text)}</p></section>`).join('')}`;
}
function orderHTML(field, label) {
  const disabled = state.phase === 'finished';
  return `<section class="final-section"><h3>${label}</h3><p>위와 아래 버튼으로 각 장소의 순서를 바꾸세요. 처음 배치는 정답을 뜻하지 않습니다.</p><ol class="order-list">${state.finalAnswer[field].map((id, index) => `<li><span class="order-number">${index + 1}</span><span>${esc(LOCATION_BY_ID[id].name)}</span><span class="order-controls"><button type="button" data-order="${field}" data-index="${index}" data-direction="-1" aria-label="${esc(LOCATION_BY_ID[id].shortName)} 순서 위로" ${disabled || index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-order="${field}" data-index="${index}" data-direction="1" aria-label="${esc(LOCATION_BY_ID[id].shortName)} 순서 아래로" ${disabled || index === 3 ? 'disabled' : ''}>↓</button></span></li>`).join('')}</ol></section>`;
}
function finalOptions(field, options, multiple = false) {
  const selected = state.finalAnswer[field], disabled = state.phase === 'finished';
  return `<div class="option-list">${options.map(option => `<label class="choice-option"><input data-final-field="${field}" type="${multiple ? 'checkbox' : 'radio'}" name="${field}" value="${option.id}" ${multiple ? selected.includes(option.id) ? 'checked' : '' : selected === option.id ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${esc(option.text)}</span></label>`).join('')}</div>`;
}
function explanationHTML() {
  return `${SOLUTION.explanation.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}<h3>수정한 안내문</h3><p>${esc(SOLUTION.correctedNotice)}</p>`;
}
function renderFinal() {
  const ready = canSubmitFinal(state), finished = state.phase === 'finished';
  $('#final-lock').textContent = finished ? '복원을 마쳤습니다.' : ready ? '네 봉투의 질문을 확인했습니다. 팀의 최종 답안을 제출하세요.' : '네 장소의 질문을 확인한 뒤 제출할 수 있습니다.';
  const feedbackLabels = { travelOrder: '실제 방문 순서', exhibitionOrder: '전시 순서', cause: '오류 원인', evidence: '근거 세 가지', correction: '수정 안내문' };
  $('#final-content').innerHTML = `<form id="final-form" class="restoration-form">${orderHTML('travelOrder', '1. 하람이 실제로 방문한 순서')}${orderHTML('exhibitionOrder', '2. 전시장 입구에서부터 읽는 순서')}<section class="final-section wide"><h3>3. 안내문의 순서가 잘못된 이유</h3><p>자료에 남은 작업 과정으로 설명할 수 있는 원인을 고르세요.</p>${finalOptions('causeId', FINAL_CAUSES)}</section><section class="final-section wide"><h3>4. 복원에 사용할 근거 세 가지</h3><p>여행 날짜와 전시 배열, 숫자를 옮긴 작업을 확인할 근거를 정확히 3개 고르세요.</p>${finalOptions('evidenceIds', FINAL_EVIDENCE, true)}</section><section class="final-section wide"><h3>5. 안내문은 어떻게 고칠까요?</h3><p>원고와 전시 자료를 함께 보존하는 수정안을 고르세요.</p>${finalOptions('correctionId', FINAL_CORRECTIONS)}</section><div class="final-submit-row"><button class="button brass" type="submit" ${!ready || finished ? 'disabled' : ''}>${finished ? '최종 복원 완료' : state.finalAttempts ? '수정한 복원안 제출' : '팀의 복원안 제출'}</button><p>첫 제출에서 맞으면 독립 복원으로 마칩니다.<br>고쳐 완성하면 재검토 복원입니다. 힌트 사용은 따로 기록합니다.</p></div>${state.finalFeedback && !finished ? `<div class="final-feedback" role="status" tabindex="-1"><h3>기록을 다시 맞춰 볼까요?</h3><p>${esc(state.finalFeedback.message)}</p><ul>${Object.entries(state.finalFeedback.checks).map(([key, correct]) => `<li>${feedbackLabels[key]}: ${correct ? '확인됨' : '다시 확인'}</li>`).join('')}</ul><details class="solution-detail"><summary>재검토 해설 펼치기</summary>${explanationHTML()}</details></div>` : ''}</form>`;
}
function renderEnding() {
  const target = $('#ending'); target.hidden = state.phase !== 'finished'; if (target.hidden) return;
  target.innerHTML = `<p class="eyebrow">F2 / 조사 완료</p><h2>${state.outcome === 'independent' ? '독립 복원' : '재검토 복원'}</h2><p><b>${esc(ENDING.title)}</b></p>${ENDING.paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}<div class="ending-facts"><span>${state.playerCount}명 공동 조사</span><span>최종 제출 ${state.finalAttempts}회</span><span>힌트 ${6 - state.hintTokens}개, 무료 도움 ${state.freeHints}회</span></div><details class="solution-detail"><summary>근거와 최종 해설 펼치기</summary>${explanationHTML()}</details><section class="memory-prompt"><h3>M1 / 나의 여행 기억</h3><p>${esc(ENDING.memoryPrompt)}</p><label for="travel-memory" class="file-label">가 보고 싶은 장소와 기억에 남은 한 가지</label><textarea id="travel-memory" placeholder="예: 가 보고 싶은 곳과 그 이유를 함께 적어 주세요."></textarea><p class="note-line">이 칸은 점수를 매기지 않습니다. 적은 이야기를 팀원과 나누어 보세요.</p></section><div class="dialog-actions"><a class="button brass" href="/student-games/index.html">다른 학생 작품 보기 →</a><button class="button subtle" data-open="restart-dialog">새 조사 시작</button></div>`;
  try { $('#travel-memory').value = localStorage.getItem(storageKey + '-memory') || ''; } catch {}
}
function render() { renderMap(); renderLocation(); renderFinal(); renderEnding(); }

$('#rules-content').innerHTML = `<p><b>${esc(INTRO.title)}</b><br>2–4명이 한 기기를 함께 사용합니다. 목표 시간은 30–50분입니다.</p><h3>조사 순서</h3><ol>${RULES.map(rule => `<li>${esc(rule)}</li>`).join('')}</ol><h3>역할 나누기</h3>${ROLES.map(role => `<p><b>${esc(role.name)}</b> — ${esc(role.text)}</p>`).join('')}<h3>종료와 기록</h3><p>모두 함께 복원을 마칩니다. 개인 점수나 탈락은 없으며, 힌트를 다 써도 끝까지 진행합니다. 답안의 근거는 화면에서 읽는 조사 자료 안에 있습니다.</p><p>${esc(INTRO.disclaimer)}</p><p>원안 기획: 손예령, 한효원<br>학생 원안을 바탕으로 누락된 조사 자료와 질문, 허용 답안과 디지털 진행을 보완했습니다.</p>`;
$('#rules-open').addEventListener('click', () => $('#rules-dialog').showModal());
$('#restart-open').addEventListener('click', () => $('#restart-dialog').showModal());
$('#restart-confirm').addEventListener('click', () => {
  resumed = false; state = initialOrders(createGame(state.playerCount)); selectedLocation = null; pendingAnswers = {};
  try { localStorage.removeItem(storageKey + '-memory'); } catch {}
  $('#restart-dialog').close(); save(); render(); window.scrollTo({ top: 0, behavior: scrollBehavior() }); notice('새 봉투와 힌트 토큰 6개를 준비했습니다.');
});
$('#player-count').addEventListener('change', event => {
  if (state.visited.length) { event.target.value = state.playerCount; return; }
  state = initialOrders(createGame(Number(event.target.value))); save(); renderMap();
});
$('#music-toggle').addEventListener('click', async () => {
  const music = $('#music'), button = $('#music-toggle');
  if (!music.paused) { music.pause(); button.textContent = '음악 켜기'; button.setAttribute('aria-pressed', 'false'); return; }
  try { music.volume = .28; await music.play(); button.textContent = '음악 끄기'; button.setAttribute('aria-pressed', 'true'); }
  catch { notice('음악 파일을 아직 재생할 수 없습니다. 게임은 그대로 진행할 수 있습니다.'); }
});
document.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.deskJump) { const target = $('#' + button.dataset.deskJump); if (target) { target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); target.querySelector('input:not(:disabled),button:not(:disabled)')?.focus({ preventScroll: true }); } return; }
  if (button.dataset.close) { $('#' + button.dataset.close).close(); return; }
  if (button.dataset.open) { $('#' + button.dataset.open).showModal(); return; }
  if (button.dataset.visit) {
    const id = button.dataset.visit;
    if (state.phase !== 'finished' && !update(value => visitLocation(value, id), { all: false })) return;
    selectedLocation = id; save(); render();
    if (window.matchMedia('(max-width: 800px)').matches) $('#investigation').scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    $('#investigation').focus({ preventScroll: true }); return;
  }
  if (button.dataset.hint) { if (update(value => useHint(value, button.dataset.hint))) { const hint = document.querySelector('.hint-sheet:last-child'); hint?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' }); hint?.focus({ preventScroll: true }); } return; }
  if (button.dataset.order) {
    const field = button.dataset.order, index = Number(button.dataset.index), direction = Number(button.dataset.direction), next = index + direction, order = [...state.finalAnswer[field]];
    if (next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    if (update(value => setFinalAnswer(value, field, order), { all: false })) {
      renderFinal();
      const focusTarget = $(`[data-order="${field}"][data-index="${next}"][data-direction="${direction}"]`);
      (focusTarget?.disabled ? $(`[data-order="${field}"][data-index="${next}"][data-direction="${-direction}"]`) : focusTarget)?.focus();
    }
  }
});
document.addEventListener('change', event => {
  const element = event.target;
  if (element.name === 'site-answer') { pendingAnswers[selectedLocation] = element.value; return; }
  if (element.dataset.finalField) {
    const field = element.dataset.finalField;
    const value = field === 'evidenceIds' ? [...document.querySelectorAll('[data-final-field="evidenceIds"]:checked')].map(input => input.value) : element.value;
    update(current => setFinalAnswer(current, field, value), { all: false });
  }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'site-question') {
    event.preventDefault(); const id = event.target.dataset.location, answer = new FormData(event.target).get('site-answer');
    if (!answer) { notice('함께 의논한 답 하나를 골라 주세요.'); return; }
    if (update(value => answerLocation(value, id, answer))) {
      const feedback = $('.question-feedback'); feedback?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' }); feedback?.focus({ preventScroll: true });
      if (state.answers[id]?.correct && canSubmitFinal(state)) notice('네 장소를 모두 확인했습니다. 아래 복원 답안을 완성해 주세요.');
    }
  }
  if (event.target.id === 'final-form') {
    event.preventDefault();
    if (state.finalAnswer.evidenceIds.length !== 3) { notice('근거를 정확히 3개 골라 주세요.'); return; }
    if (update(submitFinal)) {
      if (state.phase === 'finished') { $('#ending').scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); $('#ending').focus({ preventScroll: true }); }
      else { $('.final-feedback')?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' }); $('.final-feedback')?.focus({ preventScroll: true }); }
    }
  }
});
document.addEventListener('input', event => { if (event.target.id === 'travel-memory') try { localStorage.setItem(storageKey + '-memory', event.target.value); } catch {} });
render(); save();
