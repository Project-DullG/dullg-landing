"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGrade } from "@/app/actions/grades";
import type { GradeData } from "@/lib/validators";

type Props = {
  students: { id: string; name: string }[];
};

export function GradeForm({ students }: Props) {
  const router = useRouter();
  const [type, setType] = useState<"dullg" | "exam">("dullg");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("1");
  const [score, setScore] = useState("");
  const [participation, setParticipation] = useState<"상" | "중" | "하">("중");
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [totalScore, setTotalScore] = useState("100");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const data: GradeData =
      type === "dullg"
        ? {
            type: "dullg",
            studentId,
            session: parseInt(session, 10),
            score: parseFloat(score),
            participation,
            note,
            date: new Date(date),
          }
        : {
            type: "exam",
            studentId,
            subject,
            examName,
            score: parseFloat(score),
            totalScore: parseFloat(totalScore),
            date: new Date(date),
          };

    try {
      await addGrade(data);
      setSuccess(true);
      setScore("");
      setNote("");
      setSubject("");
      setExamName("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "성적 입력에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>성적 입력</h2>

      <div className="dash-row" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={type === "dullg" ? "dash-button" : "dash-button-secondary"}
          onClick={() => setType("dullg")}
        >
          DullG 수업
        </button>
        <button
          type="button"
          className={type === "exam" ? "dash-button" : "dash-button-secondary"}
          onClick={() => setType("exam")}
        >
          일반 시험
        </button>
      </div>

      <select
        className="dash-select"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
      >
        <option value="">학생 선택</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {type === "dullg" ? (
        <>
          <select
            className="dash-select"
            value={session}
            onChange={(e) => setSession(e.target.value)}
          >
            <option value="1">1차시</option>
            <option value="2">2차시</option>
            <option value="3">3차시</option>
            <option value="4">4차시</option>
          </select>
          <input
            className="dash-input"
            placeholder="점수 (0~100)"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
          <select
            className="dash-select"
            value={participation}
            onChange={(e) => setParticipation(e.target.value as "상" | "중" | "하")}
          >
            <option value="상">참여도: 상</option>
            <option value="중">참여도: 중</option>
            <option value="하">참여도: 하</option>
          </select>
          <input
            className="dash-input"
            placeholder="메모 (선택)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </>
      ) : (
        <>
          <input
            className="dash-input"
            placeholder="과목명"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="시험명 (예: 중간고사)"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />
          <div className="dash-row">
            <input
              className="dash-input"
              placeholder="점수"
              type="number"
              min={0}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
            <input
              className="dash-input"
              placeholder="만점"
              type="number"
              min={1}
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <input
        className="dash-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : "성적 입력"}
      </button>

      {error && <p className="dash-error">{error}</p>}
      {success && (
        <p style={{ color: "green", fontSize: 13, marginTop: 8 }}>성적이 저장되었습니다.</p>
      )}
    </form>
  );
}
