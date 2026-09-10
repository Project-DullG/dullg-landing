import { useText } from "@/lib/i18n/use-text";
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
  const t = useText();
  return (
    <figure className="dash-preview" aria-hidden="true">
      <div className="dash-preview-window">
        <aside className="dash-preview-side">
          <b>{t("단서영어학원")}</b>
          <span className="is-active">{t("대시보드")}</span>
          <span>{t("학원생")}</span>
          <span>{t("반 관리")}</span>
          <span>{t("성적 입력")}</span>
          <span>{t("성적 리포트")}</span>
        </aside>
        <div className="dash-preview-main">
          <div className="dash-preview-stats">
            {t(
              stats.map(([label, value]) => (
                <div key={label}>
                  <small>{t(label)}</small>
                  <strong>{t(value)}</strong>
                </div>
              )),
            )}
          </div>
          <div className="dash-preview-table">
            <div className="dash-preview-row is-head">
              <span>{t("학생")}</span>
              <span>{t("반")}</span>
              <span>{t("차시")}</span>
              <span>{t("점수")}</span>
              <span>{t("참여")}</span>
            </div>
            {t(
              rows.map((r) => (
                <div className="dash-preview-row" key={r[0]}>
                  {t(r.map((c, i) => <span key={i}>{t(c)}</span>))}
                </div>
              )),
            )}
          </div>
          <div className="dash-preview-bars">
            {t([64, 82, 71, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />))}
          </div>
        </div>
      </div>
      <figcaption>{t("학원 관리 화면 예시 \u00B7 실제 데이터가 아닙니다")}</figcaption>
    </figure>
  );
}
