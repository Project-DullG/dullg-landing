import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { activityRecords, formatActivityDate, isUpcoming } from "@/lib/activities";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/activity");

export const revalidate = 3600;

export default function ActivityPage() {
  return (
    <PageFrame>
      <section className="activity-hero shell">
        {/* keeps a grid-item box; see SectionHead */}
        <SectionHead
          as="h1"
          className="activity-hero-head"
          kicker="제작·활동 기록"
          title={<>제작·활동 기록</>}
        />
        <p>단서공방이 만든 작품과 진행한 수업을 소개합니다.</p>
      </section>

      <section className="activity-ledger shell" aria-labelledby="activity-ledger-title">
        <div>
          <Kicker>기록</Kicker>
          <h2 id="activity-ledger-title">단서공방의 작업</h2>
        </div>
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

      <section className="activity-disclosure">
        <div className="shell">
          <SectionHead
            kicker="교육·협업 문의"
            title="함께 진행할 수업이 있나요?"
            lead="수업 대상, 주제와 희망 일정을 알려주세요."
          />
          <Link className={styles.contact} href="/contact">
            교육·협업 문의하기 →
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
