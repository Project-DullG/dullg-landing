import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { activityRecords, formatActivityDate, isUpcoming } from "@/lib/activities";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/activity");

export const revalidate = 3600;

export default function ActivityPage() {
  return (
    <PageFrame>
      <PageIntro
        title="활동 기록"
        description="교육 현장과 텀블벅 펀딩, 수상 기록을 날짜순으로 정리했습니다."
      >
        <Link href="/about#team-history">팀 소개와 입주 이력 →</Link>
      </PageIntro>

      <section className={`shell ${styles.ledger}`} aria-label="날짜별 활동 목록">
        <div className="activity-ledger-list">
          {activityRecords.map((record) => {
            const upcoming = isUpcoming(record);
            const content = (
              <>
                {record.image && (
                  <Image
                    src={record.image.src}
                    alt={record.image.alt}
                    width={1448}
                    height={1086}
                    sizes="(max-width: 760px) 100vw, 280px"
                  />
                )}
                <div className={styles.copy}>
                  <span className={styles.meta}>
                    <time dateTime={record.date.split("/")[0]}>{formatActivityDate(record)}</time>
                    <span>{upcoming ? `${record.type} · 예정` : record.type}</span>
                  </span>
                  <strong>{record.title}</strong>
                  <p>{record.body}</p>
                  <span className={styles.action}>
                    {record.image
                      ? "활동 내용과 사진 보기"
                      : record.type === "펀딩"
                        ? "텀블벅 기록 보기"
                        : record.type === "수상"
                          ? "대학 공식 수상 기록 보기"
                          : "수업팩 살펴보기"}
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
                {content}
              </a>
            ) : (
              <Link href={record.href} key={`${record.date}-${record.title}`} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      <section className={`shell ${styles.inquiry}`} aria-label="교육·협업 문의">
        <p>교육을 의뢰하려면 수업 대상, 주제와 희망 일정을 알려주세요.</p>
        <Link className={styles.contact} href="/contact">
          교육·협업 문의하기 →
        </Link>
      </section>
    </PageFrame>
  );
}
