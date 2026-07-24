import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "Contact · DullG",
  description: "DullG에 궁금한 것이 있으면 편하게 연락주세요. 영업일 1~2일 내 답변합니다.",
};

const faqs = [
  {
    q: "샘플 자료는 유료인가요?",
    a: "파일럿 기간에는 검토팩과 샘플 자료를 무료로 보내드립니다. 파일럿 이후 구매 의무도 없습니다.",
  },
  {
    q: "수업 경험이 적은 선생님도 운영할 수 있나요?",
    a: "네. 교사용 진행안에 전체 대본과 단계별 힌트가 포함되어 있어, 처음 수업을 운영하는 선생님도 부담 없이 진행할 수 있습니다.",
  },
  {
    q: "일정과 인원을 먼저 확정해야 연락할 수 있나요?",
    a: "아닙니다. 아직 미정이어도 괜찮습니다. 어떤 상황인지 간단히 적어주시면 함께 맞춰보겠습니다.",
  },
  {
    q: "카카오톡 채널이나 전화 문의도 가능한가요?",
    a: "현재는 이메일로만 운영하고 있습니다. 빠르게 확인하고 답변드리겠습니다.",
  },
];

export default function ContactPage() {
  return (
    <PageFrame>
      {/* ── HERO ── */}
      <section className="inner-hero shell">
        <Kicker>CONTACT</Kicker>
        <h1>
          궁금한 건
          <br />
          <em>편하게 물어보세요.</em>
        </h1>
        <p>
          파일럿 참여, 자료 검토, 수업 운영 방식 등 어떤 내용이든 괜찮습니다.
          영업일 1~2일 내 답변드립니다.
        </p>
      </section>

      {/* ── MAIN CONTACT ── */}
      <section className="contact-main shell">
        <div className="contact-email-block">
          <Kicker>DIRECT EMAIL</Kicker>
          <a className="contact-email-link" href="mailto:hello@dullg.com">
            hello@dullg.com
          </a>
          <p>
            이메일 제목에 학원명과 문의 내용을 간단히 적어주시면 더 빠르게
            확인할 수 있습니다.
          </p>
        </div>

        <div className="contact-what-to-include">
          <Kicker>WHAT TO INCLUDE</Kicker>
          <h2>
            이런 내용을
            <br />
            <span>적어주시면 됩니다.</span>
          </h2>
          <ul className="contact-items">
            <li>
              <b>학원 또는 기관 이름</b>
              <span>학원명 또는 공부방 이름</span>
            </li>
            <li>
              <b>대상 학생</b>
              <span>학년, 예상 인원</span>
            </li>
            <li>
              <b>운영 시기</b>
              <span>방학 일정 또는 특강 예정 시기 (미정도 OK)</span>
            </li>
            <li>
              <b>문의 내용</b>
              <span>샘플 요청, 파일럿 문의, 가격 확인 등</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="contact-faq shell">
        <Kicker>QUICK ANSWERS</Kicker>
        <h2>
          자주 묻는 것들
        </h2>
        <div className="contact-qa-list">
          {faqs.map((item) => (
            <div className="contact-qa" key={item.q}>
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
