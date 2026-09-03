"use client";

import { useState } from "react";
import { createAcademy } from "@/app/actions/academy";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("학원명을 입력해주세요."); return; }
    setLoading(true);
    try {
      await createAcademy(name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "학원 생성에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="dash-onboarding">
      <h1>학원 등록</h1>
      <p>학원 관리를 시작하려면 학원명을 입력하세요.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="학원명"
          className="dash-input"
          disabled={loading}
        />
        <button type="submit" className="dash-button" disabled={loading}>
          {loading ? "생성 중..." : "학원 만들기"}
        </button>
        {error && <p className="dash-error">{error}</p>}
      </form>
    </div>
  );
}
