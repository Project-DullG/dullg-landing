import { Search, Hand, MoveHorizontal, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "./ui";
export const investigationControls = [
  {
    title: "자료 읽기",
    text: "출항장부처럼 이름이 표시된 물건을 누른다. 발견한 자료는 단서함에서 다시 읽을 수 있다.",
    icon: Search,
  },
  {
    title: "인물에게 보여 주기",
    text: "단서함의 ‘고르기’를 누르고, 같은 장소에 있는 인물을 누른다. 자료는 두 개까지 함께 보여 줄 수 있다.",
    icon: Hand,
  },
  {
    title: "다른 장소로 이동하기",
    text: "방 가장자리의 화살표를 누른다. 배경이 잘 보이지 않으면 ‘조사할 곳’에서 물건을 찾을 수 있다.",
    icon: MoveHorizontal,
  },
];
export function InvestigationTutorial({
  onStart,
  onPrevious,
}: {
  onStart: () => void;
  onPrevious: () => void;
}) {
  return (
    <section className="investigation-tutorial" aria-labelledby="investigation-tutorial-title">
      <header>
        <span>조작 안내</span>
        <h2 id="investigation-tutorial-title">이렇게 조사해요</h2>
        <p>먼저 부두에 놓인 출항장부를 살펴보세요.</p>
      </header>
      <ol>
        {investigationControls.map(({ title, text, icon: Icon }, i) => (
          <li key={title}>
            <div className="tutorial-symbol">
              <Icon aria-hidden="true" />
            </div>
            <div>
              <h3>
                <small>{i + 1}</small>
                {title}
              </h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="tutorial-actions">
        <Button onClick={onPrevious}>
          <ArrowLeft />앞 장면
        </Button>
        <Button className="tide-primary" onClick={onStart}>
          조사 시작
          <ArrowRight />
        </Button>
      </div>
      <small className="tutorial-reminder">
        조작 방법은 위쪽의 ‘게임 안내’에서 다시 볼 수 있어요.
      </small>
    </section>
  );
}
