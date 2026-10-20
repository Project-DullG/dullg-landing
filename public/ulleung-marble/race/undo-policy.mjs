const same = (before, after) => JSON.stringify(before) === JSON.stringify(after);

function unchangedExcept(before, after, omitted) {
  const keep = state => Object.fromEntries(Object.entries(state).filter(([key]) => !omitted.includes(key)));
  return same(keep(before), keep(after));
}

/** Only undo choices that have revealed no new game information. */
export function canUndoTransition(before, after) {
  try {
    if (!before || !after || before.phase === 'finished' || after.phase === 'finished') return false;
    const openingAction = before.phase === 'action' && ['bet', 'prepare'].includes(after.phase);
    const cancellingAction = ['bet', 'prepare'].includes(before.phase) && after.phase === 'action';
    if (openingAction || cancellingAction) {
      return before.usedItem === false && after.usedItem === false && unchangedExcept(before, after, ['phase']);
    }

    if (before.phase !== 'assign' || after.phase !== 'assign') return false;
    if (!before.assignments || !after.assignments || !before.dice || !after.dice) return false;
    if (before.assignments.minus !== null || before.assignments.plus !== null) return false;
    const assigned = ['minus', 'plus'].filter(sign => after.assignments[sign] !== null);
    if (assigned.length !== 1) return false;
    const sign = assigned[0];
    const assignment = after.assignments[sign];
    if (!assignment || !Number.isInteger(assignment.racer) || assignment.racer < 0 || assignment.racer > 4 || typeof assignment.reduce !== 'boolean') return false;
    if (!(before.dice[sign] > 0) || assignment.reduce && !(sign === 'plus' && before.mods?.flexPlus)) return false;
    return unchangedExcept(before, after, ['assignments']);
  } catch {
    return false;
  }
}
