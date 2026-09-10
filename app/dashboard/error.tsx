"use client";
import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
export default function DashboardError({ reset }: { reset: () => void }) {
  const t = useText();
  return (
    <div className="dash-card" role="alert">
      <h2>{t("화면을 불러오지 못했습니다")}</h2>
      <p>{t("연결 상태를 확인한 뒤 다시 시도해 주세요. 문제가 계속되면 다시 로그인해 주세요.")}</p>
      <div className="dash-row">
        <button className="dash-button" onClick={reset}>
          {t("다시 시도")}
        </button>
        <Link prefetch={false} className="dash-button-secondary" href="/logout">
          {t("다시 로그인")}
        </Link>
      </div>
    </div>
  );
}
