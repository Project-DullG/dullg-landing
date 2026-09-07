"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAcademy } from "@/app/actions/academy";

export function SettingsForm({
  academyId,
  currentName,
}: {
  academyId: string;
  currentName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await updateAcademy(academyId, name.trim());
      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>학원 정보</h2>
      <label
        htmlFor="academy-name"
        style={{ fontSize: 13, color: "rgba(21,37,30,0.6)", marginBottom: 4, display: "block" }}
      >
        학원명
      </label>
      <input
        id="academy-name"
        className="dash-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : "저장"}
      </button>
      {success && <p role="status" className="dash-success">학원 이름을 저장했습니다.</p>}
      {error && <p role="alert" className="dash-error">{error}</p>}
    </form>
  );
}
