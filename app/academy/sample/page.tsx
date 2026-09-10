import { useText } from "@/lib/i18n/use-text";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { localizeMetadata } from "@/lib/i18n/server";
import Image from "next/image";
import { ArrowButton, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { episodeTitle } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/academy/sample", { title: "수업 자료 미리보기" }));
}
export default function SamplePage() {
  const t = useText();
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <SectionHead
          as="h1"
          kicker={
            <>
              {t("수업용 시제품 \u00B7")}
              {t(episodeTitle)}
            </>
          }
          title={t(
            <>
              {t("어떤 자료를 받고,")}
              <br />
              <em>{t("어떻게 쓰는지 살펴보세요.")}</em>
            </>,
          )}
          lead="첫 영어 수업 제품의 골든 샘플로 검토 중인 단서 카드와 교사용 진행안입니다. 정식 제공본은 파일럿 결과에 따라 조정될 수 있습니다."
        />
      </section>

      <div className="shell">
        <SourceLanguageNote />
      </div>
      <section className="sample-grid shell">
        <article className="sample-card sample-clue">
          <Image
            src="/assets/dullg/card-cover-1.png"
            alt={t("윤지원 단서 카드 표지")}
            width={408}
            height={650}
            sizes="(max-width: 760px) 100vw, 33vw"
          />
          <div>
            <span className="sample-label">ITEM CARD / 01</span>
            <h2>
              {t("학생이 처음 받는")}
              <br />
              <em>{t("단서 카드")}</em>
            </h2>
          </div>
        </article>
        <article className="sample-card sample-workbook">
          <Image
            src="/assets/dullg/card-body-1.png"
            alt={t("실제 단서 카드 내용")}
            width={408}
            height={650}
            sizes="(max-width: 760px) 100vw, 33vw"
          />
          <div>
            <span className="sample-label">EVIDENCE / READ</span>
            <h2>
              {t("읽고 비교하는")}
              <br />
              <em>{t("실제 단서")}</em>
            </h2>
          </div>
        </article>
        <article className="sample-card sample-report">
          <Image
            src="/assets/dullg/pre-survey.png"
            alt={t("게임 전 설문지 — 학생 배포용 A4 한 장")}
            width={714}
            height={1011}
            sizes="(max-width: 760px) 100vw, 33vw"
          />
          <div>
            <span className="sample-label">TEACHER / PRE-SURVEY</span>
            <h2>
              {t("수업 전에 나눠 주는")}
              <br />
              <em>{t("게임 전 설문지")}</em>
            </h2>
          </div>
        </article>
      </section>

      <section className="sample-gallery shell">
        <div>
          <SectionHead
            kicker="실제 제작 자료"
            title={t(
              <>
                {t("수업에서 사용하는")}
                <br />
                <span>{t("사건 자료와 규칙서.")}</span>
              </>,
            )}
            lead="연출 이미지 대신 현재 제작된 시제품을 그대로 보여드립니다."
          />
        </div>
        <div className="gallery-images">
          <figure>
            <Image
              src="/assets/dullg/case-intro.png"
              alt={t(`${episodeTitle} 규칙서의 사건 도입 페이지`)}
              width={944}
              height={1330}
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <figcaption>{t("규칙서 \u00B7 사건 도입")}</figcaption>
          </figure>
          <figure>
            <Image
              src="/assets/dullg/timeline-yoon.png"
              alt={t("윤지원의 영어 타임라인과 공개 정보 페이지")}
              width={944}
              height={1330}
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <figcaption>{t("규칙서 \u00B7 인물 타임라인")}</figcaption>
          </figure>
          <figure>
            <Image
              src="/assets/dullg/rulebook-flow.png"
              alt={t("한 라운드의 진행 흐름 다섯 단계")}
              width={944}
              height={1330}
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <figcaption>{t("규칙서 \u00B7 진행 흐름")}</figcaption>
          </figure>
          <figure>
            <Image
              src="/assets/dullg/rulebook-map-detailed.png"
              alt={t("학원 3층 평면도와 범례")}
              width={944}
              height={1330}
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <figcaption>{t("규칙서 \u00B7 3층 평면도")}</figcaption>
          </figure>
        </div>
      </section>

      <section className="sample-bottom shell">
        <div>
          <SectionHead
            kicker="무료 검토팩 구성"
            title={t(
              <>
                {t("도입 전에 확인할")}
                <br />
                <span>{t("핵심 자료.")}</span>
              </>,
            )}
          />
        </div>
        <ul>
          <li>{t("원장 검토팩 1p")}</li>
          <li>{t("4차시 커리큘럼")}</li>
          <li>{t("1회차 학생용 단서 카드")}</li>
          <li>{t("교사용 진행안 샘플")}</li>
          <li>{t("수업 운영 체크리스트")}</li>
        </ul>
        <ArrowButton>{t("무료 검토팩 요청")}</ArrowButton>
      </section>
    </PageFrame>
  );
}
