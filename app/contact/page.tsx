import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "문의 · 단서공방",
  description: "단서공방에 궁금한 것이 있으면 편하게 연락주세요. 영업일 1~2일 내 답변합니다.",
};

export default function ContactPage() {
  return (
    <PageFrame>
      {/* ── HERO ── */}
      <section className="inner-hero shell">
        <Kicker>문의</Kicker>
        <h1>
          궁금한 건
          <br />
          <em>편하게 물어보세요.</em>
        </h1>
        <p>
          작품과 협업, 교육 운영과 자료에 관한 문의를 받고 있습니다.
          영업일 1~2일 내 답변드립니다.
        </p>
      </section>

      {/* ── MAIN CONTACT ── */}
      <section className="contact-main shell">
        <div className="contact-email-block">
          <Kicker>공식 이메일</Kicker>
          <a className="contact-email-link" href="mailto:cluedullg@gmail.com">
            cluedullg@gmail.com
          </a>
          <p>
            이메일 제목에 문의 유형과 이름을 간단히 적어주시면 더 빠르게
            확인할 수 있습니다.
          </p>
        </div>

        <div className="contact-what-to-include">
          <Kicker>문의할 때 알려주세요</Kicker>
          <h2>
            이런 내용을
            <br />
            <span>적어주시면 됩니다.</span>
          </h2>
          <ul className="contact-items">
            <li>
              <b>문의 유형</b>
              <span>작품, 협업, 교육 또는 자료</span>
            </li>
            <li>
              <b>이름 또는 기관명</b>
              <span>답변받을 분의 이름과 소속</span>
            </li>
            <li>
              <b>희망 일정</b>
              <span>정해지지 않았다면 생략해도 됩니다</span>
            </li>
            <li>
              <b>문의 내용</b>
              <span>확인이 필요한 내용을 구체적으로 적어주세요</span>
            </li>
          </ul>
        </div>
      </section>

    </PageFrame>
  );
}
