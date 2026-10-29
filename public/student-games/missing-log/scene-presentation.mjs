// Geometry uses the same 2 px/mm scale as the physical kit and its print sheets.
// These settings change surfaces and volume only; the printed faces stay intact.
export const scenePresentation = {
  worldPerMm: 2,
  surfaces: { feltContrast: .75, feltBumpMm: .08 },
  depthMm: {
    card: 0.32,
    paper: 0.15,
    board: 2,
    book: 1.5,
    envelope: 2.6,
    token: 3,
  },
  materials: {
    cloth: '#193e44',
    wood: '#654632',
    paper: '#f1ecdd',
    cardEdge: '#e8e2d3',
    token: { color: '#b89b59', metalness: 0.18, roughness: 0.52 },
  },
  roughnessByType: {
    card: 0.82,
    paper: 0.93,
    board: 0.84,
    book: 0.74,
    envelope: 0.96,
    token: 0.52,
  },
  pieceOverrides: {
    map: {
      shape: 'box',
      depthMm: 2,
      edgeColor: '#183b49',
      roughness: 0.84,
      // Constant x=.5, running the full y dimension: the existing central fold.
      creases: [{ axis: 'x', at: 0.5, widthMm: 0.35, depthMm: 0.12, color: '#1d3d43', opacity: 0.2 }],
    },
    rulebook: { shape: 'box', depthMm: 1.5, edgeColor: '#173640', roughness: 0.74 },
    'rules-setup': { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    'rules-help': { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    R1: { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    R2: { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    worksheet: { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    'final-worksheet': { depthMm: 0.15, edgeColor: '#eee7d6', roughness: 0.93 },
    'jeodong-envelope': { shape: 'box', depthMm: 2.6, edgeColor: '#b49768', roughness: 0.96 },
    'samseonam-envelope': { shape: 'box', depthMm: 2.6, edgeColor: '#b49768', roughness: 0.96 },
    'taeha-envelope': { shape: 'box', depthMm: 2.6, edgeColor: '#b49768', roughness: 0.96 },
    'nari-envelope': { shape: 'box', depthMm: 2.6, edgeColor: '#b49768', roughness: 0.96 },
    'final-envelope': { shape: 'box', depthMm: 3, edgeColor: '#173f55', roughness: 0.9 },
    'shared-pawn': { shape: 'pawn', depthMm: 24, color: '#28747a', edgeColor: '#174a55', metalness: 0.02, roughness: 0.6 },
  },
};

export default scenePresentation;
