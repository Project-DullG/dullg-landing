"use client";

import { useState } from "react";
import { addStudent, updateStudent } from "@/app/actions/students";
import type { StudentData } from "@/lib/validators";

type Props = {
  classes: { id: string; name: string }[];
  student?: { id: string } & StudentData;
  onDone?: () => void;
};

export function StudentForm({ classes, student, onDone }: Props) {
  const [name, setName] = useState(student?.name || "");
  const [grade, setGrade] = useState(student?.grade?.toString() || "");
  const [parentContact, setParentContact] = useState(student?.parentContact || "");
  const [classId, setClassId] = useState(student?.classId || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data: StudentData = {
      name: name.trim(),
      grade: parseInt(grade, 10),
      parentContact: parentContact.trim(),
      classId,
    };

    try {
      if (student) {
        await updateStudent(student.id, data);
      } else {
        await addStudent(data);
      }
      onDone?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dash-card">
      <h2>{student ? "학원생 수정" : "학원생 등록"}</h2>
      <input className="dash-input" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="dash-input" placeholder="학년 (1~12)" type="number" min={1} max={12} value={grade} onChange={(e) => setGrade(e.target.value)} required />
      <input className="dash-input" placeholder="학부모 연락처" value={parentContact} onChange={(e) => setParentContact(e.target.value)} required />
      <select className="dash-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="">반 선택 (선택사항)</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" className="dash-button" disabled={loading}>
        {loading ? "저장 중..." : student ? "수정" : "등록"}
      </button>
      {error && <p className="dash-error">{error}</p>}
    </form>
  );
}
