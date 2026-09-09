import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";
import { PageIntro } from "@/components/page-intro";

export const metadata = pageMetadata("/contact", {
  description: "단서공방에 궁금한 것이 있으면 편하게 연락주세요. 영업일 1~2일 내 답변합니다.",
});

export default function ContactPage() {
  return (
    <PageFrame>
      <PageIntro
        title="작품·교육·협업 문의"
        description="작품 제작, 교육 의뢰, 수업 자료에 관해 이메일로 문의해 주세요."
      />

      {/* ── MAIN CONTACT ── */}
      <section className="contact-main shell">
        <div className="contact-email-block">
          <Kicker>공식 이메일</Kicker>
          <a className="contact-email-link" href={emailHref}>
            {BRAND.email}
          </a>
          <p>이메일 제목에 문의 유형과 이름을 간단히 적어주시면 더 빠르게 확인할 수 있습니다.</p>
          <p className="contact-response">{BRAND.responseTime}</p>
          <Link className="text-link" href="/academy/pilot">
            영어 수업팩 검토 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <div className="contact-what-to-include">
          <h2>이메일에 적어주세요</h2>
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
