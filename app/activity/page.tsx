import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { activityRecords, formatActivityDate, isUpcoming } from "@/lib/activities";

export const metadata: Metadata = {
  title: "제작·활동 기록 · 단서공방",
  description: "단서공방이 공개한 작품, 펀딩과 교육 활동을 날짜순으로 기록합니다.",
};

export const revalidate = 3600;

export default function ActivityPage() {
  return <PageFrame>
    <section className="activity-hero shell">
      <div><Kicker>제작·활동 기록</Kicker><h1>완성한 일과<br /><em>진행 중인 일을 기록합니다.</em></h1></div>
      <p>작품 공개, 펀딩과 교육 활동을 날짜순으로 정리합니다. 예정된 일은 완료된 결과와 구분해 표시합니다.</p>
    </section>

    <section className="activity-ledger shell" aria-labelledby="activity-ledger-title">
      <div><Kicker>기록</Kicker><h2 id="activity-ledger-title">단서공방의 작업</h2></div>
      <div className="activity-ledger-list">
        {activityRecords.map(record => {
          const upcoming = isUpcoming(record);
          const content = (
            <>
              <time dateTime={record.date.split("/")[0]}>{formatActivityDate(record)}</time>
              <span>{upcoming ? `${record.type} · 예정` : record.type}</span>
              <strong>{record.title}</strong>
              <p>{record.body}</p>
              <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
            </>
          );
          const className = upcoming ? "is-upcoming" : undefined;
          return record.href.startsWith("http")
            ? <a href={record.href} key={`${record.date}-${record.title}`} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
            : <Link href={record.href} key={`${record.date}-${record.title}`} className={className}>{content}</Link>;
        })}
      </div>
    </section>

    <section className="activity-disclosure">
      <div className="shell">
        <Kicker>기록 기준</Kicker><h2>확인된 내용만 공개합니다.</h2>
        <p>출시한 작품과 종료된 펀딩은 공식 기록을 기준으로 작성합니다. 교육 수업팩과 예정된 활동은 현재 상태를 함께 표시합니다.</p>
      </div>
    </section>
  </PageFrame>;
}
