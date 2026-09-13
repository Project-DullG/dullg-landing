"use client";
import { has, npcPlace, type State } from "./engine";
import { places } from "./content";
import { objective } from "./presentation";
export function caseNotes(s: State) {
  const notes = [
    {
      source: "엘리엇의 편지",
      text: "9월 13일까지 항구로 돌아온다고 약속했다. 약속한 날짜가 지났지만 돌아오지 않았고 연락도 없다.",
    },
  ];
  if (has(s, "departure"))
    notes.push({
      source: "출항장부",
      text: "엘리엇이 떠났다는 저녁의 출항 기록을 찾지 못했다. 장부만으로 실제 출항 여부를 단정할 수는 없다.",
    });
  if (has(s, "log"))
    notes.push({
      source: "관측일지",
      text: "엘리엇의 석실 입장과 뒤이은 폐쇄가 기록돼 있다. 밖으로 돌아온 기록과 현장 흔적도 확인해야 한다.",
    });
  if (has(s, "closure"))
    notes.push({
      source: "마라의 말",
      text: "엘리엇이 안에 있을 때 덮개를 닫았고, 닫은 뒤에도 그와 대화했다고 말했다. 현재 상태는 직접 확인해야 한다.",
    });
  if (has(s, "echo"))
    notes.push({
      source: "직접 들은 소리",
      text: "같은 말과 기침이 같은 순서로 반복된다. 목소리가 들린다는 사실만으로 지금 사람이 말하고 있다고 판단할 수 없다.",
    });
  if (has(s, "response"))
    notes.push({
      source: "등불 시험과 새 질문",
      text: "서로 다르게 보낸 두 신호와 새 질문에 맞춰 답이 달라졌다. 지금 응답하는 상대가 있다. 얼굴을 보기 전에는 엘리엇인지 확정하지 않는다.",
    });
  if (has(s, "rescue"))
    notes.push({
      source: "귀환 뒤 확인",
      text: "데려온 사람의 얼굴과 몸, 소지품을 살피고 클라라의 확인을 대조했다. 실종자 엘리엇이 돌아왔다.",
    });
  return notes;
}
export function caseQuestions(s: State): string[] {
  if (has(s, "rescue"))
    return [
      "누가 어떤 행동을 했고, 그 결과 엘리엇에게 무슨 일이 생겼는가?",
      "이 장치를 남겨 두면 같은 일이 다시 일어날 수 있는가?",
    ];
  if (has(s, "response"))
    return [
      "응답하는 사람은 엘리엇인가?",
      "물이 들어오지 않게 통로를 열고 부상자를 데려올 방법은 무엇인가?",
    ];
  if (has(s, "closure"))
    return [
      "들리는 목소리는 지금 하는 말인가, 남아 있는 소리인가?",
      "편지에 적힌 석실로 안전하게 갈 수 있는가?",
    ];
  return [
    "엘리엇은 정말 배를 타고 섬을 떠났는가?",
    "마지막으로 한 작업은 무엇이며, 누가 함께 있었는가?",
  ];
}
export function CaseBrief({ state, recap = false }: { state: State; recap?: boolean }) {
  return (
    <div className="case-brief">
      <p>
        <strong>클라라 베일의 의뢰</strong>
        <br />
        클라라가 아버지 엘리엇의 행방을 찾아 달라고 의뢰했다. 관측소 사람들의 말과 문서, 현장 흔적을
        대조해 그에게 무슨 일이 생겼는지 알아낸다.
      </p>
      {!recap && (
        <section className="case-next">
          <small>지금 확인할 일</small>
          <p>{objective(state)}</p>
        </section>
      )}
      {!recap && (
        <section>
          <h3>풀어야 할 질문</h3>
          <ul>
            {caseQuestions(state).map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      )}
      <h3>자료와 증언</h3>
      <ol>
        {caseNotes(state).map((n) => (
          <li key={n.source}>
            <span className="case-source">
              {n.source === "마라의 말"
                ? "인물의 증언 · 별도 확인 필요"
                : ["직접 들은 소리", "등불 시험과 새 질문", "귀환 뒤 확인"].includes(n.source)
                  ? "현장에서 직접 확인"
                  : "문서에 적힌 내용"}
            </span>
            <strong>{n.source}</strong>
            <p>{n.text}</p>
          </li>
        ))}
      </ol>
      {!recap && (
        <>
          <h3>관측소의 사람들</h3>
          <dl>
            <dt>클라라 베일 · 엘리엇의 딸</dt>
            <dd>
              {places[npcPlace(state, "clara") || "records"].title}에 있다. 아버지가 쓰던 도면을
              확인한다.
            </dd>
            <dt>마라 퀸 · 기계 담당</dt>
            <dd>
              {places[npcPlace(state, "mara") || "observatory"].title}에 있다. 관측소의 기계
              담당이다.
            </dd>
            <dt>요나 리드 · 뱃사공</dt>
            <dd>{places[npcPlace(state, "jonah") || "pier"].title}에 있다. 배와 밧줄을 다룬다.</dd>
          </dl>
          <p className="tide-small">
            구조 준비를 맡긴 인물은 관측실로 이동한다. 지금 같은 장소에 있는 사람은 현장 화면에
            표시된다.
          </p>
          <h3>할 수 있는 일</h3>
          <p>
            물건을 누르면 흔적이나 문서를 살펴볼 수 있다. 확인한 자료는 단서함에 모인다. 자료 두
            개를 골라 비교하거나, 자료를 고른 뒤 같은 장소의 인물을 눌러 질문한다.
          </p>
        </>
      )}
    </div>
  );
}
