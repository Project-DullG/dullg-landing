import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";
import { PageIntro } from "@/components/page-intro";
export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/contact", {
      description: "단서공방에 궁금한 것이 있으면 편하게 연락주세요. 영업일 1~2일 내 답변합니다.",
    }),
  );
}
export default function ContactPage() {
  const t = useText();
  return (
    <PageFrame>
      <PageIntro
        title={t("작품\u00B7교육\u00B7협업 문의")}
        description="작품 제작, 교육 의뢰, 수업 자료에 관해 이메일로 문의해 주세요."
      />

      {/* ── MAIN CONTACT ── */}
      <section className="contact-main shell">
        <div className="contact-email-block">
          <Kicker>{t("공식 이메일")}</Kicker>
          <a className="contact-email-link" href={emailHref}>
            {t(BRAND.email)}
          </a>
          <p>
            {t("제목에는 ‘교육 문의’ 또는 ‘작품 제작 문의’처럼 문의할 내용을 적어주세요.")}
          </p>
          <p className="contact-response">{t(BRAND.responseTime)}</p>
          <Link className="text-link" href="/academy/pilot">
            {t("영어 수업팩 검토 요청")}
            <ArrowRight size={17} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <div className="contact-what-to-include">
          <h2>{t("이메일에 적어주세요")}</h2>
          <ul className="contact-items">
            <li>
              <b>{t("문의 유형")}</b>
              <span>{t("작품, 협업, 교육 또는 자료")}</span>
            </li>
            <li>
              <b>{t("이름 또는 기관명")}</b>
              <span>{t("답변받을 분의 이름과 소속")}</span>
            </li>
            <li>
              <b>{t("희망 일정")}</b>
              <span>{t("정해지지 않았다면 생략해도 됩니다")}</span>
            </li>
            <li>
              <b>{t("문의 내용")}</b>
              <span>{t("교육은 대상·인원·주제를, 제작 의뢰는 필요한 결과물을 적어주세요. 아직 정하지 않은 항목은 생략해도 됩니다.")}</span>
            </li>
          </ul>
        </div>
      </section>
    </PageFrame>
  );
}
