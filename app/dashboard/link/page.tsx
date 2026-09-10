"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import { linkStudentAction, logoutAction } from "@/app/actions/auth";
export default function LinkStudentPage() {
  const t = useText();
  const [academyId, setAcademyId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await linkStudentAction(academyId.trim(), name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "연결에 실패했습니다.");
      setLoading(false);
    }
  }
  return (
    <div className="dash-onboarding">
      <h1>{t("학원생 계정 연결")}</h1>
      <p>{t("원장님이 알려준 학원 코드와 등록된 본인 이름을 입력하세요.")}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="link-academy">{t("학원 코드")}</label>
        <input
          id="link-academy"
          className="dash-input"
          placeholder={t("학원 코드")}
          value={academyId}
          onChange={(e) => setAcademyId(e.target.value)}
          required
        />
        <label htmlFor="link-name">{t("등록된 학생 이름")}</label>
        <input
          id="link-name"
          className="dash-input"
          placeholder={t("이름")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="dash-button" disabled={loading}>
          {t(loading ? "연결 중..." : "계정 연결")}
        </button>
        {t(
          error && (
            <p role="alert" className="dash-error">
              {t(error)}
            </p>
          ),
        )}
      </form>
      <form action={logoutAction} className="dash-onboarding-footer">
        <span>{t("원장님이신가요? 권한 부여 후 다시 로그인하세요.")}</span>
        <button type="submit" className="dash-text-button">
          {t("로그아웃")}
        </button>
      </form>
    </div>
  );
}
