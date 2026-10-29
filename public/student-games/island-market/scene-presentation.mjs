// Physical presentation only. Faces, money values, rules and manual actions stay in the kit.
// A 156-unit card is 58 mm wide in the native faces and every print sheet.
export const WORLD_PER_MM = 156 / 58;

export const BANK_STACK_LAYOUT = {
  1: { stacks: 10, coinsPerStack: 10, startX: 1136, startY: 620, stepX: 58 },
  5: { stacks: 10, coinsPerStack: 10, startX: 1305, startY: 965, stepX: 70 },
  10: { stacks: 8, coinsPerStack: 10, startX: 1360, startY: 1610, stepX: 80 },
};
const stackAngles = [-2.4, 2.1, -2.8, 3.2, -2.1, 2.6, -3.1, 2.3, -2.6, 3.0];

/** An initial location, never a rule or account calculation. The first twenty 1-nyang coins stay dealt. */
export function bankCoinPose(value, serialIndex) {
  const layout = BANK_STACK_LAYOUT[value];
  const bankIndex = serialIndex - (value === 1 ? 20 : 0);
  if (!layout || bankIndex < 0) return null;
  const stack = Math.floor(bankIndex / layout.coinsPerStack);
  if (stack >= layout.stacks) throw new RangeError('Unknown physical bank coin.');
  return {
    x: layout.startX + stack * layout.stepX,
    y: layout.startY,
    pile: `bank-${value}-${String(stack + 1).padStart(2, '0')}`,
    angle: stackAngles[stack],
  };
}

const coinOverrides = {};
for (const [value, total, edgeColor] of [[1, 120, '#bc9349'], [5, 100, '#b38a3e'], [10, 80, '#9d7532']]) {
  for (let serial = 1; serial <= total; serial++) {
    coinOverrides[`coin-${value}-${serial}`] = {
      shape: 'cylinder', depthMm: 1.5, edgeColor, metalness: .08, roughness: .82,
    };
  }
}

export const scenePresentation = {
  worldPerMm: WORLD_PER_MM,
  surfaces: { feltContrast: .4, feltBumpMm: .03, feltPreserveColor: true },
  depthMm: {
    card: .35,
    board: 2,
    book: 1.5,
    paper: .15,
    envelope: .2,
    token: 1.5,
  },
  materials: {
    cloth: '#365a4b',
    wood: '#705034',
    paper: '#fff5df',
    cardEdge: '#dfd2b4',
    token: { color: '#bf974d', metalness: .08, roughness: .82 },
  },
  roughnessByType: {
    card: .86,
    board: .86,
    book: .84,
    paper: .94,
    envelope: .95,
    token: .82,
  },
  // New banks are real ten-coin stacks. The renderer caps a legacy hundred-coin
  // pile visually without changing saved IDs, membership, money or placement.
  coinStackMax: 10,
  // Card supply may contain 102 cards: 35.7 mm at .35 mm each. Do not flatten it
  // with the currency height limit; allow the whole card inventory to be stacked.
  stackMaxHeightMm: 60,
  hiddenZones: ['bank'],
  // These are fixed wooden holders, not interactive accounts or new game pieces.
  // They sit in existing gaps; no card, news, goal or shop needs to move.
  trays: [
    { id: 'bank-one-tray', x: 1120, y: 607, width: 608, height: 79, label: '공용 은행 1냥', color: '#8b714e', rimWidthMm: 1.5, rimHeightMm: 2.2 },
    { id: 'bank-five-tray', x: 1290, y: 952, width: 725, height: 90, label: '공용 은행 5냥', color: '#8b714e', rimWidthMm: 1.5, rimHeightMm: 2.2 },
    { id: 'bank-ten-tray', x: 1344, y: 1595, width: 664, height: 102, label: '공용 은행 10냥', color: '#8b714e', rimWidthMm: 1.5, rimHeightMm: 2.2 },
  ],
  pieceOverrides: {
    ...coinOverrides,
    'first-player': { shape: 'cylinder', depthMm: 4, edgeColor: '#506843', metalness: 0, roughness: .72 },
    'turn-pawn': { shape: 'cylinder', depthMm: 5.5, edgeColor: '#a4563e', metalness: 0, roughness: .72 },
    'round-marker': { shape: 'cylinder', depthMm: 3, edgeColor: '#934b36', metalness: 0, roughness: .72 },
    'trade-opportunity': { shape: 'cylinder', depthMm: 3, edgeColor: '#b29e6d', metalness: 0, roughness: .74 },
    'round-cooked': { shape: 'cylinder', depthMm: 3.5, edgeColor: '#7b885e', metalness: 0, roughness: .74 },
    'round-track': { depthMm: 2, edgeColor: '#c5b489', roughness: .87 },
    'rule-cover': { shape: 'box', depthMm: 1.5, edgeColor: '#284e3d', roughness: .84 },
    'unused-envelope': { shape: 'box', depthMm: 2.2, edgeColor: '#c0a173', roughness: .95 },
    ...Object.fromEntries(Array.from({ length: 4 }, (_, index) => [
      `ledger-${index + 1}`, { shape: 'box', depthMm: 1.5, edgeColor: '#506951', roughness: .86 },
    ])),
    ...Object.fromEntries(Array.from({ length: 4 }, (_, index) => [
      `mat-${index + 1}`, { depthMm: 2, edgeColor: '#9cae83', roughness: .9 },
    ])),
  },
};

export default scenePresentation;
