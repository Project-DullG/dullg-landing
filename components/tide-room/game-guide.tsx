import { Search, MessageCircle, Files, Compass } from "lucide-react";

export function GameGuide() {
  return (
    <div className="game-guide">
      <section className="guide-case">
        <h3>실종된 엘리엇을 찾아서</h3>
        <p>
          1894년 9월 14일, 벨로우항. 관측소에서 일하던 엘리엇 베일이 돌아오기로 한 날짜를 넘겼다. 딸
          클라라는 그의 행방을 알아봐 달라며 탐정인 나를 찾아왔다.
        </p>
        <p>관측소를 조사하고 사람들의 말을 확인해, 엘리엇에게 무슨 일이 생겼는지 알아내야 한다.</p>
      </section>
      <h3>조사 방법</h3>
      <ol className="guide-steps">
        <li>
          <Search aria-hidden="true" />
          <div>
            <strong>현장을 살핀다</strong>
            <p>
              장면에 표시된 물건 이름을 누른다. 찾기 어려우면 ‘조사할 곳’을 열어 목록에서 고른다.
              확인한 자료는 아래 ‘단서함’에 모인다.
            </p>
          </div>
        </li>
        <li>
          <MessageCircle aria-hidden="true" />
          <div>
            <strong>사람에게 묻는다</strong>
            <p>인물 그림이나 이름을 눌러 대화한다. 대사를 읽은 뒤 궁금한 질문을 고른다.</p>
          </div>
        </li>
        <li>
          <Files aria-hidden="true" />
          <div>
            <strong>자료를 비교하고 보여 준다</strong>
            <p>
              단서함에서 자료를 누르면 본문이 열린다. 자료 아래 ‘고르기’를 누른 뒤 같은 장소의
              인물을 누르면 그 자료에 관해 물을 수 있다. 두 개를 골랐을 때는 ‘선택한 두 자료 비교’로
              나란히 볼 수 있다.
            </p>
          </div>
        </li>
        <li>
          <Compass aria-hidden="true" />
          <div>
            <strong>다음 장소로 이동한다</strong>
            <p>
              장면 양옆의 화살표로 이동한다. 무엇을 해야 할지 막히면 ‘힌트’를, 확인한 내용을 다시
              읽으려면 ‘수첩’을 연다.
            </p>
          </div>
        </li>
      </ol>
      <section className="guide-reading">
        <h3>대화 읽기</h3>
        <p>
          ‘다음’으로 이어 읽고 ‘앞 내용’으로 돌아간다. ‘지난 대화’에서는 읽은 내용을 다시 볼 수
          있다.
        </p>
        <p>
          시간제한은 없다. 자료를 잘못 보여 줘도 없어지지 않으며, 퍼즐도 다시 시도할 수 있다. 소리를
          꺼도 조사에 필요한 내용은 글로 확인할 수 있다.
        </p>
      </section>
      <details>
        <summary>소재 안내</summary>
        <p>실종과 익사에 관한 묘사가 나온다.</p>
      </details>
    </div>
  );
}
