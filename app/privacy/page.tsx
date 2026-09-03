import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";

export const metadata = pageMetadata("/privacy", {
  description: "단서공방 검토팩 요청 및 파일럿 문의 과정에서 처리하는 개인정보 안내입니다.",
});

const sections = [
  {
    title: "1. 수집하는 개인정보",
    body: (
      <>
        <p>샘플 자료 요청과 파일럿 문의를 처리하기 위해 다음 정보를 받습니다.</p>
        <ul>
          <li>필수: 기관명, 연락처(휴대전화 또는 이메일), 관심 유형, 개인정보 수집·이용 동의</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 이용 목적",
    body: (
      <ul>
        <li>요청한 샘플 자료 발송</li>
        <li>파일럿 운영 문의 확인과 일정 안내</li>
        <li>문의 응대와 중복 요청 확인</li>
      </ul>
    ),
  },
  {
    title: "3. 보유 기간과 파기",
    body: (
      <p>
        수집한 정보는 요청 처리일로부터 최대 1년간 보관한 뒤 지체 없이 삭제합니다. 다만 관련 법령에
        따라 보존이 필요한 경우에는 해당 기간만큼 분리해 보관할 수 있습니다. 동의를 철회하면 보존
        의무가 없는 정보는 지체 없이 삭제합니다.
      </p>
    ),
  },
  {
    title: "4. 전송 과정에서 이용하는 서비스",
    body: (
      <p>
        신청 내용은 이메일 전달을 위해 FormSubmit 서비스를 통해 전송되며, 웹사이트는 Vercel을 통해
        제공됩니다. 이 과정에서 서비스 운영을 위한 서버를 경유할 수 있습니다. 단서공방은 신청 정보를
        판매하거나 광고 목적으로 제3자에게 제공하지 않습니다.
      </p>
    ),
  },
  {
    title: "5. 동의 거부와 이용자 권리",
    body: (
      <p>
        개인정보 수집·이용에 동의하지 않을 수 있습니다. 다만 필수 정보 제공에 동의하지 않으면 웹
        양식을 통한 자료 발송이 어렵습니다. 열람, 정정, 삭제, 처리 정지 또는 동의 철회를 원하면 아래
        이메일로 요청할 수 있습니다.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PageFrame>
      <section className="privacy-hero shell">
        <Kicker>개인정보 처리 안내</Kicker>
        <h1>
          개인정보를 필요한 만큼만 받고,
          <br />
          <em>요청한 목적에만 사용합니다.</em>
        </h1>
        <p>
          이 안내는 단서공방 샘플 자료 요청 및 파일럿 문의 과정에서 처리하는 개인정보에 적용됩니다.
        </p>
      </section>

      <section className="privacy-content shell" aria-label="개인정보 처리 안내">
        <div className="privacy-summary">
          <strong>시행일</strong>
          <span>2026년 7월 26일</span>
          <strong>최근 수정</strong>
          <span>2026년 9월 3일</span>
          <strong>문의</strong>
          <a href={emailHref}>{BRAND.email}</a>
        </div>

        <div className="privacy-sections">
          {sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              {section.body}
            </article>
          ))}

          <article>
            <h2>6. 문의 및 요청</h2>
            <p>
              개인정보 관련 요청은 <a href={emailHref}>{BRAND.email}</a>으로 보내주세요. 확인 후
              가능한 범위에서 신속하게 안내하겠습니다.
            </p>
          </article>
        </div>

        <div className="privacy-actions">
          <Link className="button button-dark" href="/academy/pilot">
            검토팩 요청으로 돌아가기
          </Link>
          <Link href="/contact">일반 문의 보기</Link>
        </div>
      </section>
    </PageFrame>
  );
}
