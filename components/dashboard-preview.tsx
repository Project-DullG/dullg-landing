const stats = [
  ["학원생", "24명"],
  ["반", "4개"],
  ["이번 달 성적 기록", "96건"],
];
const rows = [
  ["김서연", "중1 A반", "3차시", "88점", "상"],
  ["이도윤", "중1 A반", "3차시", "76점", "중"],
  ["박하린", "초6 B반", "2차시", "92점", "상"],
];

export function DashboardPreview() {
  return (
    <figure className="dash-preview" aria-hidden="true">
      <div className="dash-preview-window">
        <aside className="dash-preview-side">
          <b>단서영어학원</b>
          <span className="is-active">대시보드</span>
          <span>학원생</span>
          <span>반 관리</span>
          <span>성적 입력</span>
          <span>성적 리포트</span>
        </aside>
        <div className="dash-preview-main">
          <div className="dash-preview-stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="dash-preview-table">
            <div className="dash-preview-row is-head">
              <span>학생</span>
              <span>반</span>
              <span>차시</span>
              <span>점수</span>
              <span>참여</span>
            </div>
            {rows.map((r) => (
              <div className="dash-preview-row" key={r[0]}>
                {r.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="dash-preview-bars">
            {[64, 82, 71, 90].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
      <figcaption>학원 관리 화면 예시 · 실제 데이터가 아닙니다</figcaption>
    </figure>
  );
}
