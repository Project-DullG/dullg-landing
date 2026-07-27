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
        <Kicker>CURRENT PILOT · 2026</Kicker>
        <h1>
          우리 학원에 맞는지,
          <br />
          <em>자료부터 천천히 확인해보세요.</em>
        </h1>
        <p>
          현재 소수 학원과 파일럿을 진행하고 있습니다. 무료 검토팩을 먼저
          살펴본 뒤, 필요할 때 학년·인원·운영 시기를 함께 맞춥니다.
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
              <b>운영 상담</b>
              <span>학년, 인원, 수업 시점과 운영 조건을 확인합니다.</span>
            </li>
            <li>
              <b>파일럿 운영</b>
              <span>1회차 또는 4회차로 실제 수업을 진행합니다.</span>
            </li>
            <li>
              <b>운영 피드백</b>
              <span>준비시간, 학생 반응, 결과물과 개선점을 함께 검토합니다.</span>
            </li>
          </ol>
        </div>
        <FormSection />
      </section>
    </PageFrame>
  );
}
