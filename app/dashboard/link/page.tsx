"use client";

import { useState } from "react";
import { linkStudentAction, logoutAction } from "@/app/actions/auth";

export default function LinkStudentPage() {
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
      <h1>학원생 계정 연결</h1>
      <p>원장님이 알려준 학원 코드와 등록된 본인 이름을 입력하세요.</p>
      <form onSubmit={handleSubmit}>
        <input
          className="dash-input"
          placeholder="학원 코드"
          value={academyId}
          onChange={(e) => setAcademyId(e.target.value)}
          required
        />
        <input
          className="dash-input"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="dash-button" disabled={loading}>
          {loading ? "연결 중..." : "계정 연결"}
        </button>
        {error && <p className="dash-error">{error}</p>}
      </form>
      <form action={logoutAction} className="dash-onboarding-footer">
        <span>원장님이신가요? 권한 부여 후 다시 로그인하세요.</span>
        <button type="submit" className="dash-text-button">
          로그아웃
        </button>
      </form>
    </div>
  );
}
