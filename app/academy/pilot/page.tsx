import { Kicker, PageFrame } from "@/components/site";
import { FormSection } from "@/components/form-section";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/academy/pilot", { title: "파일럿 안내와 검토팩 요청" });

const pilotChecks = [
  {
    title: "시간",
    body: "설명과 대기만으로 수업이 끝나지 않고 결론과 보고까지 가는지 봅니다.",
  },
  {
    title: "이해",
    body: "영어 카드가 번역 과제가 아니라 실제 추리 근거로 사용되는지 봅니다.",
  },
  {
    title: "참여",
    body: "한두 명에게 진행이 몰리지 않고 여러 학생이 질문과 근거를 내는지 봅니다.",
  },
  {
    title: "교사 부담",
    body: "교사 한 명이 정해진 안내로 진행·정리·회수할 수 있는지 봅니다.",
  },
  {
    title: "결과물",
    body: "학생의 결론과 근거가 연결된 개인·팀 기록이 남는지 봅니다.",
  },
  {
    title: "도입 신호",
    body: "재미 외에도 다음 운영, 가격과 재사용 조건에 대한 논의가 이어지는지 봅니다.",
  },
];

export default function PilotPage() {
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <Kicker>파일럿 준비 · 2026</Kicker>
        <h1>
          우리 학원에 맞는지,
          <br />
          <em>자료부터 천천히 확인해보세요.</em>
        </h1>
        <p>
          현재 영어학원용 수업 시제품의 파일럿을 준비하고 있습니다. 무료
          검토팩을 먼저 살펴본 뒤 학년·인원·운영 시기와 조건을 확인합니다.
        </p>
      </section>

      <section className="pilot-checks shell">
        <div>
          <Kicker>파일럿에서 확인할 것</Kicker>
          <h2>
            효과를 단정하기보다,
            <br />
            <span>실제로 운영되는지 먼저 봅니다.</span>
          </h2>
          <p>
            첫 파일럿은 영어 성적이나 문해력 향상을 증명하는 실험이 아닙니다.
            수업 시제품이 교실에서 작동하는지 진단하는 과정입니다.
          </p>
        </div>
        <div className="pilot-check-grid">
          {pilotChecks.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pilot-section shell">
        <div className="pilot-info">
          <Kicker>PILOT PROCESS</Kicker>
          <ol>
            <li>
              <b>검토팩 확인</b>
              <span>1p 소개서와 샘플 자료를 보내드립니다.</span>
            </li>
            <li>
              <b>운영 상담</b>
              <span>학년, 인원, 수업 시점과 운영 조건을 확인합니다.</span>
            </li>
            <li>
              <b>파일럿 제안</b>
              <span>운영 범위, 지원 내용과 비용 조건을 서면으로 확인합니다.</span>
            </li>
            <li>
              <b>운영과 회고</b>
              <span>합의된 경우 수업을 운영하고 기록을 바탕으로 회고합니다.</span>
            </li>
          </ol>
        </div>
        <FormSection />
      </section>
    </PageFrame>
  );
}
