"use client";
import { useState } from "react";
import Link from "next/link";
import { StudentWorkspace, type StudentItem } from "@/components/dashboard/student-workspace";
import { ScoreChart } from "@/components/dashboard/score-chart";
import styles from "./page.module.css";

const classes = [
  { id: "a", name: "초6 A반" },
  { id: "b", name: "중1 B반" },
];
const initialStudents: StudentItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `example-${i + 1}`,
  name: `예시 학생 ${i + 1}`,
  grade: i < 4 ? 6 : 7,
  classId: i === 7 ? "" : i < 4 ? "a" : "b",
  parentContact: "010-****-0000",
}));
type RecordItem = { studentId: string; session: number; score: number };
const initialRecords: RecordItem[] = initialStudents.flatMap((student, i) =>
  [1, 2, 3].map((session) => ({
    studentId: student.id,
    session,
    score: 65 + ((i * 7 + session * 5) % 31),
  })),
);

export function AcademyDemo() {
  const [students, setStudents] = useState(initialStudents);
  const [records, setRecords] = useState(initialRecords);
  const [version, setVersion] = useState(0);
  const [resetting, setResetting] = useState(false);
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          단서공방
        </Link>
        <span>예시 학원</span>
        <nav aria-label="체험 메뉴">
          <a href="#main-content" aria-current="page">
            학생 관리
          </a>
          <Link href="/academy#tools">기능 소개 ↗</Link>
        </nav>
        <p>실제 계정에서는 반 관리와 성적 리포트도 이용할 수 있습니다.</p>
        <Link href="/login">실제 계정으로 로그인 →</Link>
      </aside>
      <main id="main-content" className={styles.main}>
        <div className={styles.banner}>
          <div>
            <strong>가상 데이터 · 체험 모드</strong>
            <p>
              서버에 저장되지 않으며 새로고침하면 초기화됩니다. 실제 개인정보는 입력하지 마세요.
            </p>
          </div>
          <button onClick={() => setResetting(true)}>체험 초기화</button>
        </div>
        {resetting && (
          <div className={styles.banner} role="group" aria-label="체험 초기화 확인">
            <p>추가·수정한 예시 학생과 점수를 모두 초기화할까요?</p>
            <button
              onClick={() => {
                setStudents(initialStudents);
                setRecords(initialRecords);
                setVersion((value) => value + 1);
                setResetting(false);
              }}
            >
              초기화 확인
            </button>
            <button onClick={() => setResetting(false)}>취소</button>
          </div>
        )}
        <StudentWorkspace
          key={version}
          demo
          students={students}
          classes={classes}
          onSave={async (data, id) => {
            setStudents((items) =>
              id
                ? items.map((item) => (item.id === id ? { ...item, ...data } : item))
                : [{ ...data, id: crypto.randomUUID() }, ...items],
            );
          }}
          onDelete={async (id) => {
            setStudents((items) => items.filter((item) => item.id !== id));
            setRecords((items) => items.filter((item) => item.studentId !== id));
          }}
          detail={(student) => (
            <DemoGrades
              key={student.id}
              records={records.filter((item) => item.studentId === student.id)}
              onSave={(session, score) =>
                setRecords((items) => [
                  ...items.filter(
                    (item) => item.studentId !== student.id || item.session !== session,
                  ),
                  { studentId: student.id, session, score },
                ])
              }
            />
          )}
        />
      </main>
    </div>
  );
}

function DemoGrades({
  records,
  onSave,
}: {
  records: RecordItem[];
  onSave: (session: number, score: number) => void;
}) {
  const [message, setMessage] = useState("");
  return (
    <section className={styles.grades} aria-label="학생별 예시 성적">
      <ScoreChart
        scores={[1, 2, 3, 4].map((session) => ({
          label: `${session}차시`,
          score: records.find((item) => item.session === session)?.score ?? null,
        }))}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const score = Number(data.get("score"));
          const session = Number(data.get("session"));
          if (!Number.isInteger(score) || score < 0 || score > 100) return;
          onSave(session, score);
          setMessage(`${session}차시 예시 점수를 ${score}점으로 반영했습니다.`);
        }}
      >
        <label>
          차시
          <select name="session">
            {[1, 2, 3, 4].map((session) => (
              <option key={session} value={session}>
                {session}차시
              </option>
            ))}
          </select>
        </label>
        <label>
          점수 (0~100)
          <input name="score" type="number" min="0" max="100" step="1" required />
        </label>
        <button type="submit">점수 반영</button>
      </form>
      <p>같은 차시를 입력하면 기존 예시 점수가 변경됩니다.</p>
      <p role="status">{message}</p>
    </section>
  );
}
