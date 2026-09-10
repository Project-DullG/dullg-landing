"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGrade } from "@/app/actions/grades";
import type { GradeData } from "@/lib/validators";
type Props = {
  students: {
    id: string;
    name: string;
  }[];
};
export function GradeForm({ students }: Props) {
  const t = useText();
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
      <h2>{t("새 성적 기록")}</h2>

      <div className="dash-row" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={type === "dullg" ? "dash-button" : "dash-button-secondary"}
          onClick={() => setType("dullg")}
          aria-pressed={type === "dullg"}
        >
          {t("미스터리 수업")}
        </button>
        <button
          type="button"
          className={type === "exam" ? "dash-button" : "dash-button-secondary"}
          onClick={() => setType("exam")}
          aria-pressed={type === "exam"}
        >
          {t("일반 시험")}
        </button>
      </div>

      <label htmlFor="grade-student">{t("학생")}</label>
      <select
        id="grade-student"
        className="dash-select"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
      >
        <option value="">{t("학생 선택")}</option>
        {t(
          students.map((s) => (
            <option key={s.id} value={s.id}>
              {t(s.name)}
            </option>
          )),
        )}
      </select>

      {t(
        type === "dullg" ? (
          <>
            <label htmlFor="grade-session">{t("수업 차시")}</label>
            <select
              id="grade-session"
              className="dash-select"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            >
              <option value="1">{t("1차시")}</option>
              <option value="2">{t("2차시")}</option>
              <option value="3">{t("3차시")}</option>
              <option value="4">{t("4차시")}</option>
            </select>
            <label htmlFor="grade-score">{t("점수 (100점 만점)")}</label>
            <input
              id="grade-score"
              className="dash-input"
              placeholder={t("점수 (0~100)")}
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
            <label htmlFor="grade-participation">{t("수업 참여도")}</label>
            <select
              id="grade-participation"
              className="dash-select"
              value={participation}
              onChange={(e) => setParticipation(e.target.value as "상" | "중" | "하")}
            >
              <option value="상">{t("참여도: 상")}</option>
              <option value="중">{t("참여도: 중")}</option>
              <option value="하">{t("참여도: 하")}</option>
            </select>
            <label htmlFor="grade-note">{t("메모 (선택)")}</label>
            <input
              id="grade-note"
              className="dash-input"
              placeholder={t("메모 (선택)")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        ) : (
          <>
            <label htmlFor="grade-subject">{t("과목")}</label>
            <input
              id="grade-subject"
              className="dash-input"
              placeholder={t("과목명")}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <label htmlFor="grade-exam">{t("시험 이름")}</label>
            <input
              id="grade-exam"
              className="dash-input"
              placeholder={t("시험명 (예: 중간고사)")}
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
            />
            <div className="dash-row">
              <label>
                {t("받은 점수")}
                <input
                  className="dash-input"
                  placeholder={t("점수")}
                  type="number"
                  min={0}
                  max={Number(totalScore) || undefined}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </label>
              <label>
                {t("시험 만점")}
                <input
                  className="dash-input"
                  placeholder={t("만점")}
                  type="number"
                  min={1}
                  value={totalScore}
                  onChange={(e) => setTotalScore(e.target.value)}
                  required
                />
              </label>
            </div>
          </>
        ),
      )}

      <label htmlFor="grade-date">{t("평가일")}</label>
      <input
        id="grade-date"
        className="dash-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <button type="submit" className="dash-button" disabled={loading}>
        {t(loading ? "저장 중..." : "성적 입력")}
      </button>

      {t(
        error && (
          <p role="alert" className="dash-error">
            {t(error)}
          </p>
        ),
      )}
      {t(
        success && (
          <p role="status" className="dash-success">
            {t("성적을 저장했습니다. 다음 기록을 입력할 수 있습니다.")}
          </p>
        ),
      )}
    </form>
  );
}
