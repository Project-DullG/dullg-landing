// Millimetres. One scale is shared by every physical piece in the tabletop.
export const PX_PER_MM=2.5;
export const SPECS={board:[720,420],book:[128,182],encounter:[58,90],course:[58,90],record:[58,90],meeple:[24,30,8],cube:[8,8,8],die:[20,20,20],box:[380,240,70],ordinarySpace:[20,20],landmark:[24,24]};
export const mm=n=>n*PX_PER_MM;
export const SPEC_ROWS=[['지도판','720 × 420 mm','가로형 · 접었을 때 360 × 210 mm'],['여행자북·규칙서','128 × 182 mm','B6 · 각 8쪽'],['모든 카드','58 × 90 mm','조우 50 · 코스 24 · 기록 156 · 달인 3'],['미플','높이 30 · 최대 폭 24 · 두께 8 mm','8개 · 모양별 폭은 다름'],['예산 큐브','8 × 8 × 8 mm','8개 · 플레이어 색'],['주사위','20 × 20 × 20 mm','2개 · 1–6 눈'],['상자','380 × 240 × 70 mm','수납 검토용 제안 규격'],['이동 칸','일반 20 × 20 · 주요 장소 Ø24 mm','23개 네모 · 7개 원형']];
