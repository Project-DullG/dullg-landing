import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import { ActivityPhotoGallery } from "@/components/activity-photo-gallery";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { ulleungPresentation } from "@/lib/presentations";
export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/activity/ulleung-high-living-lab", {
      description: "2026년 9월 5일 울릉고 리빙랩 특강과 공개 수업 자료를 안내합니다.",
    }),
  );
}
export default function UlleungHighLivingLabPage() {
  const t = useText();
  return (
    <PageFrame>
      <article className="activity-case">
        <header className="activity-case-hero shell">
          <div>
            <Kicker>{t("교육 활동 \u00B7 2026년 9월 5일")}</Kicker>
            <h1>
              {t("울릉고")}
              <br />
              <em>{t("리빙랩 특강")}</em>
            </h1>
          </div>
          <div>
            <p>
              {t(
                "울릉도에서 해보고 싶은 일을 나누고, 게임 체험과 AI 실습을 거쳐 한 줄 기획안을 작성하는 수업 자료입니다.",
              )}
            </p>
            <dl>
              <div>
                <dt>{t("기관")}</dt>
                <dd>{t("울릉고등학교")}</dd>
              </div>
              <div>
                <dt>{t("일정")}</dt>
                <dd>{t("2026년 9월 5일")}</dd>
              </div>
              <div>
                <dt>{t("자료")}</dt>
                <dd>
                  {t("웹 열람 \u00B7 PDF \u00B7")}
                  {t(ulleungPresentation.slides.length)}
                  {t("쪽")}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="activity-case-material">
          <div className="shell">
            <div>
              <Kicker>{t("공개 자료")}</Kicker>
              <h2>{t("수업 발표자료")}</h2>
              <p>
                {t(
                  "발표자료를 다운로드 없이 웹에서 바로 볼 수 있습니다. 이 자료는 울릉군 생태관광 AI 교육과 별개의 수업 자료입니다.",
                )}
              </p>
            </div>
            <div>
              <Link href={ulleungPresentation.href}>
                <span>
                  <small>
                    {t(ulleungPresentation.slides.length)}
                    {t("쪽 \u00B7")}
                    {t(ulleungPresentation.updatedAt)}
                    {t("보강")}
                  </small>
                  <strong>{t("발표자료 웹에서 보기 →")}</strong>
                </span>
              </Link>
              <a href={ulleungPresentation.pdf} download>
                <span>
                  <strong>{t("PDF 다운로드")}</strong>
                </span>
                <DownloadSimple size={22} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <div className="shell">
          <ActivityPhotoGallery
            photos={[
              {
                src: "/assets/activities/ulleung-high-2026-09-05-class.jpg",
                alt: "울릉고 교실에서 AI 활용 지역 콘텐츠 제작 수업을 준비하는 모습",
                caption: "AI 활용 지역 콘텐츠 제작 프로젝트 수업 현장",
              },
              {
                src: "/assets/activities/ulleung-high-2026-09-05-workshop.jpg",
                alt: "울릉고 학생들이 모둠별로 머더미스터리 활동을 진행하는 모습",
                caption: "모둠별 게임 체험과 콘텐츠 기획 활동",
              },
            ]}
          />
        </div>

        <nav className="activity-case-nav shell" aria-label={t("활동 기록 이동")}>
          <Link href="/activity">
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
            {t("제작\u00B7활동 기록으로 돌아가기")}
          </Link>
          <Link href="/materials">{t("수강생 자료실 보기")}</Link>
        </nav>
      </article>
    </PageFrame>
  );
}
