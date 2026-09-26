import { startupExamples } from "@/lib/startup-examples";

export function StartupExamples({ en }: { en: boolean }) {
  const lang = en ? 1 : 0;
  const fields = [
    ["customer", "고객", "Customer"], ["problem", "해결할 문제", "Problem"],
    ["offer", "제공할 상품·서비스", "Offer"], ["revenue", "수익 방식 가정", "Possible revenue model"],
    ["trial", "처음 시험할 방법", "First test"], ["check", "확인할 사항", "Checks"],
  ] as const;
  return <section id="examples">
    <h2>{en ? `${startupExamples.length} ideas to compare and adapt` : `비교하며 살펴보는 아이디어 예시 ${startupExamples.length}가지`}</h2>
    <p>{en ? "These are fictional classroom proposals, not existing businesses, verified demand or successful applications. The track labels are for comparison, not official classifications. Open an idea that interests you and change it to fit a problem you have actually observed." : "아래는 수업용으로 만든 제안입니다. 실제 운영 사업·검증된 수요·선정 사례가 아니며, 분야 구분도 이해를 돕기 위한 검토 방향입니다. 관심 있는 항목을 펼쳐보고 직접 관찰한 문제에 맞게 바꿔보세요."}</p>
    {(["general", "local"] as const).map(track => <div key={track}>
      <h3>{track === "general" ? (en ? "General/technology examples" : "일반·기술 분야를 검토할 예시") : (en ? "Local examples" : "로컬 분야를 검토할 예시")}</h3>
      {startupExamples.filter(item => item.track === track).map(item => <details key={item.id} id={item.id} data-idea={item.id} open={item.id === "ulleung-magazine"}>
        <summary>{item.title[lang]}</summary>
        <dl>{fields.map(([key, ko, english]) => <div key={key}><dt>{en ? english : ko}</dt><dd>{item[key][lang]}</dd></div>)}</dl>
      </details>)}
    </div>)}
    <h3>{en ? "The same subject can lead to different businesses" : "같은 관광 아이디어라도 사업 내용에 따라 달라집니다"}</h3>
    <p>{en ? "A booking tool usable by guides in many regions points toward a general/technology discussion. A paid walk built around Ulleungdo residents’ stories points toward a local discussion. Tourism alone does not decide the track: compare the offer, the buyer and the role of regional resources." : "여러 지역의 해설사가 쓸 수 있는 예약 관리 도구라면 일반·기술 분야를, 울릉도 주민의 이야기를 중심으로 판매하는 걷기 체험이라면 로컬 분야를 검토할 수 있습니다. ‘관광’이라는 주제만 보지 말고 상품·구매자·지역 자원의 역할을 비교하세요."}</p>
    <h3>{en ? "Turn an example into your own idea" : "예시를 내 아이디어로 바꿔보세요"}</h3>
    <p>{en ? "Choose one example, replace the customer with someone you can meet, and describe a real inconvenience you have observed. Keep unverified demand, prices and partner agreements as open questions." : "한 가지를 고른 뒤 고객을 직접 만나볼 수 있는 사람으로 바꾸고, 실제로 본 불편을 적어보세요. 확인하지 않은 수요·가격·협력 관계는 정해진 사실로 쓰지 않습니다."}</p>
    <pre>{en ? "I am interested in [example]. The problem I actually observed is [problem], and a person I can ask is [customer]. Adapt the offer to this situation. Separate what I observed from assumptions, suggest three interview questions and one small test I can do this week. Do not invent results or agreements." : "[예시 이름]에 관심이 있어. 내가 실제로 본 불편은 [불편]이고, 물어볼 수 있는 사람은 [고객]이야. 이 상황에 맞게 상품을 바꿔줘. 관찰한 사실과 가정을 구분하고, 고객에게 물어볼 질문 3개와 이번 주에 할 작은 시험 1개를 제안해줘. 성과나 협력 관계는 만들어내지 마."}</pre>
  </section>;
}
