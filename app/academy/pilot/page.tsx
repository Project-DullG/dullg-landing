import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";
import { FormSection } from "@/components/form-section";

export const metadata: Metadata = {
  title: "Pilot · DullG",
  description: "파일럿 문의하기. 학원 일정과 인원에 맞게 DullG 파일럿 수업을 함께 조율합니다.",
};

export default function PilotPage() {
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <Kicker>LIMITED PILOT · 2026</Kicker>
        <h1>
          우리 학원에 맞는지,
          <br />
          <em>작게 먼저</em> 확인해보세요.
        </h1>
        <p>
          현재 2~3곳을 대상으로 유료 파일럿을 진행합니다. 검토팩을 확인한 뒤
          15분 상담을 통해 학년·인원·운영 시기를 함께 맞춥니다.
        </p>
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
              <b>15분 상담</b>
              <span>학년, 인원, 수업 시점과 운영 조건을 확인합니다.</span>
            </li>
            <li>
              <b>유료 파일럿</b>
              <span>1회차 또는 4회차로 실제 수업을 진행합니다.</span>
            </li>
            <li>
              <b>운영 피드백</b>
              <span>준비시간, 결과물, 재구매 의향을 함께 검토합니다.</span>
            </li>
          </ol>
        </div>
        <FormSection />
      </section>
    </PageFrame>
  );
}
