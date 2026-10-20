import CONFIG from './rules-config.mjs';

const signs = ['minus', 'plus'];
const unresolvedTiles = new Set(['event', 'item', 'fork', 'transfer']);
const integerIn = (value, minimum, maximum) => Number.isInteger(value) && value >= minimum && value <= maximum;

/**
 * Preview only public, already rolled movement. No cards are drawn and no tile
 * choices or random outcomes are resolved. A minus assignment can be previewed
 * before plus is selected; plus always waits for a required minus assignment.
 *
 * `positions` in the result is the position after the returned moves, never a
 * prediction of an unresolved tile's outcome. `complete` means that no direct
 * movement remains to be chosen or resolved (a finish ends movement immediately).
 */
export function previewMovement({ positions, dice, assignments = {}, mods = {} }) {
  if (!Array.isArray(positions) || positions.length !== 5 || !positions.every(position => integerIn(position, CONFIG.minimum, CONFIG.finish))) {
    throw new TypeError('미리보기에 사용할 다섯 말의 위치를 확인하세요.');
  }
  if (!dice || !integerIn(dice.plus, 0, 20) || !integerIn(dice.minus, 0, 8)) {
    throw new TypeError('미리보기에는 공개된 주사위 결과가 필요합니다.');
  }

  const projected = [...positions];
  const moves = [];
  const missingAssignments = signs.filter(sign => dice[sign] > 0 && !assignments[sign]);
  for (const sign of signs) {
    const assignment = assignments[sign];
    if (!assignment) continue;
    if (!integerIn(assignment.racer, 0, 4) || assignment.reduce && !(sign === 'plus' && mods.flexPlus)) {
      throw new TypeError('미리보기의 주사위 배정을 확인하세요.');
    }
  }
  if (assignments.minus && assignments.plus && assignments.minus.racer === assignments.plus.racer) {
    throw new TypeError('+와 −는 서로 다른 말에 배정합니다.');
  }

  const result = (stopReason = null, stoppedAt = null) => ({
    moves,
    positions: projected,
    complete: stopReason === null || stopReason === 'finish',
    stopReason,
    stoppedAt,
    missingAssignments,
  });

  for (const sign of signs) {
    if (!dice[sign]) continue;
    const assignment = assignments[sign];
    if (!assignment) return result('awaiting-assignment');

    let amount = dice[sign];
    if (sign === 'minus' && CONFIG.tiles[projected[assignment.racer]] === 'shelter' && !mods.ignoreShelter) {
      amount = Math.max(0, amount - 1);
    }
    if (sign === 'plus' && assignment.reduce) amount = Math.max(0, amount - 1);
    if (!amount) continue;

    const racer = assignment.racer;
    const from = projected[racer];
    const requestedDelta = sign === 'minus' ? -amount : amount;
    const to = Math.max(CONFIG.minimum, Math.min(CONFIG.finish, from + requestedDelta));
    if (from === to) continue;
    const solo = !!mods[sign + 'Solo'];
    const group = solo || from === 0 ? [racer] : projected.flatMap((position, index) => position === from ? [index] : []);
    for (const member of group) projected[member] = to;
    moves.push({ sign, racer, group, from, to, delta: to - from, requestedDelta, solo });

    if (to === CONFIG.finish) return result('finish', { sign, position: to, type: 'finish' });
    const type = CONFIG.tiles[to] || 'normal';
    if (unresolvedTiles.has(type)) return result('tile', { sign, position: to, type });
  }

  return result();
}
