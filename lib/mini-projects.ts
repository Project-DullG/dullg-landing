export type MiniGameId = "block-stack" | "bumper-room" | "lane-shift";
export const miniProjects: {
  slug: MiniGameId;
  title: string;
  genre: string;
  description: string;
  controls: string[];
  rules: string;
  implementation: string;
  color: string;
  updates: string[];
}[] = [
  {
    slug: "block-stack",
    title: "블록 정리",
    genre: "블록 퍼즐",
    description: "떨어지는 블록을 회전해 가로줄을 채웁니다.",
    controls: [
      "← → 블록 이동",
      "↑ 블록 회전",
      "↓ 한 칸 내리기",
      "Space 바닥까지 내리기",
      "C 블록 보관·교체",
    ],
    rules:
      "가로줄을 채우면 점수를 얻습니다. 5줄을 지울 때마다 속도가 올라가며, 새 블록을 놓을 공간이 없으면 끝납니다.",
    implementation:
      "블록을 회전하고 줄을 지우는 퍼즐입니다. 다음 블록과 착지 위치를 미리 보여주고, 블록 하나를 보관해 순서를 바꿀 수 있게 만들었습니다.",
    color: "#588fc5",
    updates: ["입체 타일과 줄 삭제 효과 적용", "블록 보관 및 착지 후 위치 조정 추가"],
  },
  {
    slug: "bumper-room",
    title: "범퍼 룸",
    genre: "핀볼",
    description: "두 플리퍼로 공을 받아 올리고 세 범퍼를 맞힙니다.",
    controls: ["Space 공 발사", "← 또는 A 왼쪽 플리퍼", "→ 또는 D 오른쪽 플리퍼"],
    rules:
      "범퍼를 맞히면 100점, 세 범퍼를 모두 맞히면 500점을 추가로 얻습니다. 공은 세 개입니다. 공을 잃으면 발사 버튼으로 다음 공을 발사하세요. 플리퍼는 누를 때 올라가고 손을 떼면 내려갑니다.",
    implementation: "공과 벽·범퍼·플리퍼의 충돌, 중력과 공 발사 동작을 구현했습니다.",
    color: "#ddad5c",
    updates: ["공 발사 궤적과 플리퍼 충돌 조정", "세 범퍼 적중 보너스와 타격 효과 추가"],
  },
  {
    slug: "lane-shift",
    title: "세 칸 피하기",
    genre: "장애물 피하기",
    description: "세 차선을 오가며 앞에서 오는 자동차를 피합니다.",
    controls: ["← 또는 A 왼쪽 길로 이동", "→ 또는 D 오른쪽 길로 이동"],
    rules:
      "차량을 한 대 통과할 때마다 10점을 얻습니다. 시간이 지날수록 속도가 올라가며, 한 번 부딪히면 끝납니다. 옆 차선으로 이동하는 중에도 충돌할 수 있습니다.",
    implementation:
      "차선 이동과 차량 생성, 속도 조절을 구현했습니다. 자동차가 차선 사이를 이동할 때도 실제 위치에 맞춰 충돌을 판정합니다.",
    color: "#70b9a0",
    updates: ["자동차·가로수 에셋과 움직이는 도로 적용", "차선 이동 애니메이션과 충돌 범위 조정"],
  },
];

export const getMiniProject = (slug: string) =>
  miniProjects.find((project) => project.slug === slug);
