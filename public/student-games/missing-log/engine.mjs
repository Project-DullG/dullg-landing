import { LOCATIONS, LOCATION_BY_ID, FINAL_CAUSES, FINAL_EVIDENCE, FINAL_CORRECTIONS, SOLUTION } from './content.mjs?v=deep-review-20261027';

export const VERSION = 1;
const ids = LOCATIONS.map(location => location.id);
const clone = value => structuredClone(value);
const uniqueList = (values, allowed, maximum = allowed.length) => Array.isArray(values) && values.length <= maximum && new Set(values).size === values.length && values.every(value => allowed.includes(value));
const equalOrder = (actual, expected) => actual.length === expected.length && actual.every((value, index) => value === expected[index]);
const equalSet = (actual, expected) => actual.length === expected.length && actual.every(value => expected.includes(value));

export function createGame(playerCount = 2) {
  if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 4) throw new Error('2–4명이 함께 조사합니다.');
  return { version: VERSION, phase: 'investigation', playerCount, visited: [], answers: {}, hints: Object.fromEntries(ids.map(id => [id, 0])), hintTokens: 6, freeHints: 0, finalAnswer: { travelOrder: [], exhibitionOrder: [], causeId: null, evidenceIds: [], correctionId: null }, finalAttempts: 0, finalFeedback: null, outcome: null };
}

export function validState(state) {
  try {
    if (!state || state.version !== VERSION || !['investigation', 'finished'].includes(state.phase) || !Number.isInteger(state.playerCount) || state.playerCount < 2 || state.playerCount > 4 || !uniqueList(state.visited, ids)) return false;
    if (!state.answers || typeof state.answers !== 'object' || Object.keys(state.answers).some(id => !ids.includes(id))) return false;
    for (const [id, answer] of Object.entries(state.answers)) {
      if (!state.visited.includes(id) || !answer || !LOCATION_BY_ID[id].question.options.some(option => option.id === answer.answerId) || typeof answer.correct !== 'boolean' || answer.correct !== (answer.answerId === LOCATION_BY_ID[id].question.answerId) || !Number.isInteger(answer.attempts) || answer.attempts < 1 || answer.attempts > 10000) return false;
    }
    if (!state.hints || Object.keys(state.hints).length !== ids.length || ids.some(id => !Number.isInteger(state.hints[id]) || state.hints[id] < 0 || state.hints[id] > LOCATION_BY_ID[id].hints.length || state.hints[id] > 0 && !state.visited.includes(id))) return false;
    const usedHints = Object.values(state.hints).reduce((sum, count) => sum + count, 0);
    if (state.hintTokens !== Math.max(0, 6 - usedHints) || state.freeHints !== Math.max(0, usedHints - 6)) return false;
    const final = state.finalAnswer;
    if (!final || !uniqueList(final.travelOrder, ids) || !uniqueList(final.exhibitionOrder, ids) || !uniqueList(final.evidenceIds, FINAL_EVIDENCE.map(option => option.id)) || !(final.causeId === null || FINAL_CAUSES.some(option => option.id === final.causeId)) || !(final.correctionId === null || FINAL_CORRECTIONS.some(option => option.id === final.correctionId))) return false;
    if (!Number.isInteger(state.finalAttempts) || state.finalAttempts < 0 || state.finalAttempts > 10000 || ![null, 'independent', 'reviewed'].includes(state.outcome)) return false;
    if (state.finalAttempts === 0 && state.finalFeedback !== null || state.finalAttempts > 0 && (!state.finalFeedback || typeof state.finalFeedback.correct !== 'boolean' || !state.finalFeedback.checks || ['travelOrder', 'exhibitionOrder', 'cause', 'evidence', 'correction'].some(key => typeof state.finalFeedback.checks[key] !== 'boolean') || typeof state.finalFeedback.message !== 'string')) return false;
    if (state.phase === 'investigation' && state.finalFeedback?.correct) return false;
    if ((state.phase === 'finished') !== (state.outcome !== null)) return false;
    if (state.phase === 'finished' && (!state.finalFeedback?.correct || !canSubmitFinalUnchecked(state) || !Object.values(checkFinal(state.finalAnswer)).every(Boolean) || state.outcome !== (state.finalAttempts === 1 ? 'independent' : 'reviewed'))) return false;
    return true;
  } catch { return false; }
}

function playable(state) {
  if (!validState(state) || state.phase !== 'investigation') throw new Error('진행 중인 조사에서만 할 수 있습니다.');
}
function locationExists(id) { if (!LOCATION_BY_ID[id]) throw new Error('조사할 장소를 확인해 주세요.'); }

export function visitLocation(state, id) {
  playable(state); locationExists(id);
  const next = clone(state);
  if (!next.visited.includes(id)) next.visited.push(id);
  return next;
}

export function answerLocation(state, id, answerId) {
  playable(state); locationExists(id);
  if (!state.visited.includes(id)) throw new Error('장소 자료를 먼저 펼쳐 주세요.');
  const question = LOCATION_BY_ID[id].question;
  if (!question.options.some(option => option.id === answerId)) throw new Error('답 하나를 골라 주세요.');
  const next = clone(state);
  next.answers[id] = { answerId, correct: answerId === question.answerId, attempts: (next.answers[id]?.attempts || 0) + 1 };
  return next;
}

export function useHint(state, id) {
  playable(state); locationExists(id);
  if (!state.visited.includes(id)) throw new Error('장소 자료를 먼저 펼쳐 주세요.');
  if (state.hints[id] >= LOCATION_BY_ID[id].hints.length) throw new Error('이 장소의 힌트를 모두 확인했습니다.');
  const next = clone(state);
  next.hints[id]++;
  if (next.hintTokens > 0) next.hintTokens--; else next.freeHints++;
  return next;
}

export function setFinalAnswer(state, field, value) {
  playable(state);
  const next = clone(state);
  if (['travelOrder', 'exhibitionOrder'].includes(field)) {
    if (!uniqueList(value, ids)) throw new Error('각 장소는 순서에 한 번씩 놓아 주세요.');
    next.finalAnswer[field] = [...value];
  } else if (field === 'evidenceIds') {
    if (!uniqueList(value, FINAL_EVIDENCE.map(option => option.id))) throw new Error('자료에 있는 근거를 골라 주세요.');
    next.finalAnswer.evidenceIds = [...value];
  } else if (field === 'causeId') {
    if (!(value === null || FINAL_CAUSES.some(option => option.id === value))) throw new Error('오류 원인을 골라 주세요.');
    next.finalAnswer.causeId = value;
  } else if (field === 'correctionId') {
    if (!(value === null || FINAL_CORRECTIONS.some(option => option.id === value))) throw new Error('수정할 안내문을 골라 주세요.');
    next.finalAnswer.correctionId = value;
  } else throw new Error('복원할 항목을 확인해 주세요.');
  return next;
}

function canSubmitFinalUnchecked(state) { return ids.every(id => state.answers[id]?.correct); }
export function canSubmitFinal(state) { return validState(state) && state.phase === 'investigation' && canSubmitFinalUnchecked(state); }
function checkFinal(answer) {
  return { travelOrder: equalOrder(answer.travelOrder, SOLUTION.travelOrder), exhibitionOrder: equalOrder(answer.exhibitionOrder, SOLUTION.exhibitionOrder), cause: answer.causeId === SOLUTION.causeId, evidence: equalSet(answer.evidenceIds, SOLUTION.evidenceIds), correction: answer.correctionId === SOLUTION.correctionId };
}

export function submitFinal(state) {
  playable(state);
  if (!canSubmitFinalUnchecked(state)) throw new Error('네 장소의 질문을 먼저 마쳐 주세요.');
  if (state.finalAnswer.travelOrder.length !== 4 || state.finalAnswer.exhibitionOrder.length !== 4 || !state.finalAnswer.causeId || !state.finalAnswer.correctionId || !state.finalAnswer.evidenceIds.length) throw new Error('두 순서와 오류 원인, 근거, 수정 안내문을 모두 골라 주세요.');
  const next = clone(state), checks = checkFinal(next.finalAnswer), correct = Object.values(checks).every(Boolean);
  next.finalAttempts++;
  next.finalFeedback = { correct, checks, message: correct ? '두 순서와 안내문의 오류가 모두 복원됐습니다.' : '다시 확인할 항목이 있습니다. 자료와 해설을 대조한 뒤 고쳐 제출하세요.' };
  if (correct) { next.phase = 'finished'; next.outcome = next.finalAttempts === 1 ? 'independent' : 'reviewed'; }
  return next;
}

export function restartGame(state) { return createGame(validState(state) ? state.playerCount : 2); }
