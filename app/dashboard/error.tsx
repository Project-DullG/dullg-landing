"use client";

import Link from "next/link";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <div className="dash-card" role="alert">
    <h2>화면을 불러오지 못했습니다</h2>
    <p>연결 상태를 확인한 뒤 다시 시도해 주세요. 문제가 계속되면 다시 로그인해 주세요.</p>
    <div className="dash-row"><button className="dash-button" onClick={reset}>다시 시도</button><Link prefetch={false} className="dash-button-secondary" href="/logout">다시 로그인</Link></div>
  </div>;
}
