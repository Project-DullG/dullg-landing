"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const initialStudents = [
  { id: "A01", name: "예시 학생 1", group: "초6 A반", score: 82 },
  { id: "A02", name: "예시 학생 2", group: "초6 A반", score: 76 },
  { id: "A03", name: "예시 학생 3", group: "초6 A반", score: 94 },
  { id: "B01", name: "예시 학생 4", group: "중1 B반", score: 88 },
  { id: "B02", name: "예시 학생 5", group: "중1 B반", score: 72 },
  { id: "B03", name: "예시 학생 6", group: "중1 B반", score: 90 },
];
const groups = ["전체", "초6 A반", "중1 B반"];

export function AcademyDemo() {
  const [students, setStudents] = useState(initialStudents);
  const [group, setGroup] = useState("전체");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [message, setMessage] = useState("");
  const visible = students.filter((student) =>
    (group === "전체" || student.group === group) && student.name.includes(query.trim()),
  );
  const average = visible.length
    ? Math.round(visible.reduce((sum, student) => sum + student.score, 0) / visible.length)
    : null;

  function reset() {
    setStudents(initialStudents);
    setGroup("전체");
    setQuery("");
    setEditing(null);
    setMessage("예시 데이터를 처음 상태로 되돌렸습니다.");
  }

  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.nav} aria-label="체험 페이지 이동">
        <Link href="/">단서공방</Link>
        <Link href="/login">실제 계정으로 로그인 →</Link>
      </nav>
      <header className={styles.header}>
        <span className={styles.badge}>가상 데이터 · 체험 모드</span>
        <h1>학원 관리 체험</h1>
        <p>반을 선택하고 학생의 점수를 바꿔보세요. 아래 요약에도 바로 반영됩니다.</p>
        <p>실제 학생 정보가 아닙니다. 변경 내용은 서버에 저장되지 않으며, 새로고침하면 초기화됩니다.</p>
      </header>
      <section aria-labelledby="demo-students-title">
        <div className={styles.heading}>
          <h2 id="demo-students-title">예시 학원 · 3차시 성적</h2>
          <button type="button" onClick={reset}>체험 초기화</button>
        </div>
        <div className={styles.filters}>
          <label>반 선택
            <select value={group} onChange={(event) => { setGroup(event.target.value); setEditing(null); }}>
              {groups.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>학생 찾기
            <input type="search" value={query} placeholder="예시 학생 이름 검색"
              onChange={(event) => { setQuery(event.target.value); setEditing(null); }} />
          </label>
        </div>
        <dl className={styles.stats}>
          <div><dt>조회한 학생</dt><dd>{visible.length}명</dd></div>
          <div><dt>3차시 평균</dt><dd>{average === null ? "—" : `${average}점`}</dd></div>
          <div><dt>선택한 반</dt><dd>{group}</dd></div>
        </dl>
        <p className={styles.notice} role="status">{message || "점수 변경을 누르면 입력을 체험할 수 있습니다."}</p>
        <ul className={styles.list}>
          {visible.map((student) => (
            <li key={student.id}>
              <div><strong>{student.name}</strong><span>{student.group}</span></div>
              {editing === student.id ? (
                <form className={styles.form} onSubmit={(event) => {
                  event.preventDefault();
                  const nextScore = Number(score);
                  if (score.trim() === "" || !Number.isInteger(nextScore) || nextScore < 0 || nextScore > 100) return;
                  setStudents((current) => current.map((item) =>
                    item.id === student.id ? { ...item, score: nextScore } : item));
                  setEditing(null);
                  setMessage(`${student.name}의 예시 점수를 ${nextScore}점으로 변경했습니다. 실제 저장은 되지 않습니다.`);
                }}>
                  <label>{student.name} 점수
                    <input autoFocus type="number" min="0" max="100" step="1" required
                      value={score} onChange={(event) => setScore(event.target.value)} />
                  </label>
                  <button type="submit">예시에 적용</button>
                  <button type="button" onClick={() => setEditing(null)}>취소</button>
                </form>
              ) : (
                <div className={styles.score}>
                  <b>{student.score}점</b>
                  <button type="button" aria-label={`${student.name} 점수 변경`} onClick={() => {
                    setEditing(student.id); setScore(String(student.score));
                  }}>점수 변경</button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {!visible.length && <p>검색 결과가 없습니다. 다른 이름이나 반을 선택해 주세요.</p>}
      </section>
      <footer className={styles.footer}>
        <p>이 화면에서는 조회와 점수 입력만 체험할 수 있습니다. 실제 학원 관리는 로그인 후 이용합니다.</p>
        <Link href="/login">로그인으로 이동 →</Link>
        <Link href="/academy#tools">학원 관리 기능 소개</Link>
      </footer>
    </main>
  );
}
