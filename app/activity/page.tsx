import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import Image from "next/image";
import styles from "./page.module.css";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { activityRecords, formatActivityDate, isUpcoming } from "@/lib/activities";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/activity"));
}
export const revalidate = 3600;
export default function ActivityPage() {
  const t = useText();
  return (
    <PageFrame>
      <PageIntro
        title={t("활동 기록")}
        description="작품을 전시하고 수업을 진행한 현장을 사진과 글로 남깁니다. 펀딩과 수상 소식도 함께 전합니다."
      >
        <Link href="/about#team-history">{t("팀 소개와 입주 이력 →")}</Link>
      </PageIntro>

      <section className={`shell ${styles.ledger}`} aria-label={t("날짜별 활동 목록")}>
        <div className="activity-ledger-list">
          {t(
            activityRecords.map((record) => {
              const upcoming = isUpcoming(record);
              const content = (
                <>
                  {t(
                    record.image && (
                      <Image
                        src={record.image.src}
                        alt={t(record.image.alt)}
                        width={1448}
                        height={1086}
                        sizes="(max-width: 760px) 100vw, 280px"
                      />
                    ),
                  )}
                  <div className={styles.copy}>
                    <span className={styles.meta}>
                      <time dateTime={record.date.split("/")[0]}>
                        {t(formatActivityDate(record))}
                      </time>
                      <span>{t(upcoming ? `${record.type} · 예정` : record.type)}</span>
                    </span>
                    <h2>{t(record.title)}</h2>
                    <p>{t(record.body)}</p>
                    <span className={styles.action}>
                      {t(
                        record.image
                          ? "활동 내용과 사진 보기"
                          : record.type === "펀딩"
                            ? "텀블벅 기록 보기"
                            : record.type === "수상"
                              ? "대학 공식 수상 기록 보기"
                              : "수업팩 살펴보기",
                      )}
                      <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                    </span>
                  </div>
                </>
              );
              const className = `${styles.row} ${record.image ? styles.withImage : ""} ${upcoming ? "is-upcoming" : ""}`;
              return record.href.startsWith("http") ? (
                <a
                  href={record.href}
                  key={`${record.date}-${record.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {t(content)}
                </a>
              ) : (
                <Link
                  href={record.href}
                  key={`${record.date}-${record.title}`}
                  className={className}
                >
                  {t(content)}
                </Link>
              );
            }),
          )}
        </div>
      </section>

      <section className={`shell ${styles.inquiry}`} aria-label={t("교육\u00B7협업 문의")}>
        <p>{t("교육을 의뢰하려면 수업 대상, 주제와 희망 일정을 알려주세요.")}</p>
        <Link className={styles.contact} href="/contact">
          {t("교육\u00B7협업 문의하기 →")}
        </Link>
      </section>
    </PageFrame>
  );
}
