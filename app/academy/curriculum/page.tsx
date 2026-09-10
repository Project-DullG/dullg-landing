import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowButton, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { curriculum } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/academy/curriculum"));
}
export default function CurriculumPage() {
  const t = useText();
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <SectionHead
          as="h1"
          kicker="하나의 사건, 네 번의 수업"
          title={t(
            <>
              {t("사건을 따라 읽고,")}
              <br />
              <em>{t("판단을 남기는 네 장면.")}</em>
            </>,
          )}
          lead="한 번의 이야기 안에서 읽기·질문·토론·쓰기가 이어집니다. 학생은 매 차시 작은 기록을 남기고, 마지막에는 자신의 근거로 사건을 설명합니다."
        />
      </section>

      <section className="curriculum-detail shell">
        {t(
          curriculum.map((item, index) => (
            <article key={item.session} className="detail-row">
              <div className="detail-index">
                {t(item.session)}
                <span>0{t(index + 1)} / 04</span>
              </div>
              <div>
                <span className="mini-label">{t(item.label)}</span>
                <h2>{t(item.title)}</h2>
                <p>{t(item.body)}</p>
                <div className="output-pill">
                  {t("학생 결과물&nbsp; \u00B7 &nbsp;")}
                  {t(item.output)}
                </div>
              </div>
              <div className={`detail-art detail-art-${index + 1}`}>
                <span>
                  {t(
                    index === 0
                      ? "READ"
                      : index === 1
                        ? "CONNECT"
                        : index === 2
                          ? "COMPARE"
                          : "REPORT",
                  )}
                </span>
              </div>
            </article>
          )),
        )}
      </section>

      <section className="note-section shell">
        <SectionHead
          kicker="실제 운영을 위한 구성"
          title={t(
            <>
              {t("교사는 진행에 집중하고,")}
              <br />
              <span>{t("학생은 장면을 완성합니다.")}</span>
            </>,
          )}
          lead="조별 자리 배치, 출력물, 필기구만 있으면 시작할 수 있도록 교사용 진행안과 체크리스트를 함께 제공합니다."
        />
        <ArrowButton>{t("무료 검토팩 요청")}</ArrowButton>
      </section>
    </PageFrame>
  );
}
