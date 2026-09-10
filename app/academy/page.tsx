import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { DashboardPreview } from "@/components/dashboard-preview";
import { PageFrame } from "@/components/site";
import { educationFacts, episodeFullTitle, episodeTitle } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import styles from "./overview.module.css";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/academy", { title: "영어 미스터리 수업팩" }));
}
const pathways = [
  {
    title: "4차시 수업 흐름",
    body: "사건 읽기부터 팀 사건보고서 작성까지",
    href: "/academy/curriculum",
  },
  {
    title: "수업 자료 미리보기",
    body: "학생용 카드·워크북·교사용 진행안",
    href: "/academy/sample",
  },
  { title: "수업용 에피소드", body: "첫 사건의 배경과 등장인물", href: "/episode" },
  { title: "파일럿 운영 안내", body: "진행 절차·운영 조건·검토팩 요청", href: "/academy/pilot" },
];
const tools = [
  ["학원생과 반", "학생 정보를 등록하고 반에 배정합니다."],
  ["성적과 참여도", "시험·차시별 점수, 참여도와 메모를 남깁니다."],
  ["리포트", "반별·기간별 성적을 비교합니다."],
  ["학생 본인 조회", "연결된 학생은 자기 성적을 확인합니다."],
];
export default function AcademyPage() {
  const t = useText();
  return (
    <PageFrame>
      <section className={`shell ${styles.hero}`} aria-labelledby="academy-title">
        <div>
          <p className={styles.status}>{t("파일럿 준비 중")}</p>
          <h1 id="academy-title">{t("영어 미스터리 수업팩")}</h1>
          <p className={styles.lead}>
            {t(
              "학생마다 다른 영어 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 사건보고서로 정리합니다.",
            )}
          </p>
          <p className={styles.notice}>
            {t(
              "현재 공개한 자료는 수업용 시제품입니다. 진행 시간과 학생 결과물은 파일럿 수업에서 확인할 예정입니다.",
            )}
          </p>
          <div className={styles.actions}>
            <Link className="button button-dark" href="/academy/sample">
              {t("자료 미리보기")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/academy/pilot">{t("파일럿 안내 →")}</Link>
          </div>
        </div>
        <figure className={styles.cover}>
          <Image
            src="/assets/dullg/rulebook-cover.png"
            width={944}
            height={1330}
            alt={t(`${episodeFullTitle} 규칙서 표지`)}
            sizes="(max-width: 760px) 220px, 280px"
            priority
          />
          <figcaption>
            {t(episodeTitle)}
            {t("\u00B7 수업용 규칙서")}
          </figcaption>
        </figure>
      </section>
      <section className={`shell ${styles.facts}`} aria-label={t("수업팩 운영 조건")}>
        {t(
          educationFacts.map(([value, label]) => (
            <div key={value}>
              <b>{t(value)}</b>
              <span>{t(label)}</span>
            </div>
          )),
        )}
      </section>
      <section className={`shell ${styles.details}`} aria-labelledby="academy-details-title">
        <h2 id="academy-details-title">{t("수업팩 상세 안내")}</h2>
        <div className={styles.paths}>
          {t(
            pathways.map((item) => (
              <Link href={item.href} key={item.href}>
                <div>
                  <h3>{t(item.title)}</h3>
                  <p>{t(item.body)}</p>
                </div>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            )),
          )}
        </div>
      </section>
      <section className={styles.tools} id="tools" aria-labelledby="academy-tools-title">
        <div className={`shell ${styles.toolsGrid}`}>
          <div>
            <p className={styles.label}>{t("학원 관리 도구")}</p>
            <h2 id="academy-tools-title">{t("학원생\u00B7반\u00B7성적 관리")}</h2>
            <p className={styles.lead}>
              {t(
                "학생 등록부터 성적 조회까지 예시 화면에서 살펴보세요. 체험 화면은 가상 학생 데이터를 사용합니다.",
              )}
            </p>
            <dl className={styles.toolList}>
              {t(
                tools.map(([title, body]) => (
                  <div key={title}>
                    <dt>{t(title)}</dt>
                    <dd>{t(body)}</dd>
                  </div>
                )),
              )}
            </dl>
            <div className={styles.actions}>
              <Link className="button button-dark" href="/demo">
                {t("학원 관리 체험")}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/login">{t("학원 관리 로그인 →")}</Link>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>
    </PageFrame>
  );
}
