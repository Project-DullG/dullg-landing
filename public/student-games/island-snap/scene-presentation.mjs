// Presentation only: no card faces, game state, or adjudication.
// All dimensions convert from the native kit at exactly 2.5 world units per mm.
export const scenePresentation = {
  worldPerMm: 2.5,
  depthMm: { card: .32, board: 2, token: 3, book: .4, paper: .15, envelope: 2 },
  surfaces: { feltContrast: .78, feltBumpMm: .06 },
  materials: {
    cloth: '#234f59',
    wood: '#966440',
    paper: '#fff8e9',
    cardEdge: '#e5d9bd',
    token: { color: '#c6a36d', metalness: 0, roughness: .72 },
  },
  pieceOverrides: {
    'snap-spare-box': { shape: 'box', depthMm: 35, edgeColor: '#174d5e', color: '#fff3d9' },
    'snap-chant-strip': { depthMm: 1.2, edgeColor: '#d0be8a' },
    'snap-call-marker': { shape: 'cylinder', depthMm: 3, edgeColor: '#a47c3f', color: '#d9b16c' },
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [
      `snap-response-${i + 1}`,
      { shape: 'cylinder', depthMm: 3, edgeColor: '#967b4d', color: '#c6a36d' },
    ])),
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [
      `snap-seat-${i + 1}`,
      { depthMm: 2, edgeColor: '#234f59', color: '#234f59' },
    ])),
  },
};
export default scenePresentation;
