"use client";

import { useState } from "react";
import { addClass, updateClass, deleteClass } from "@/app/actions/classes";

type ClassItem = { id: string; name: string };

export function ClassManager({
  classes,
  classCounts,
}: {
  classes: ClassItem[];
  classCounts: Record<string, number>;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addClass(newName.trim());
      setNewName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "반 추가에 실패했습니다.");
    }
  }

  async function handleUpdate(classId: string) {
    setError(null);
    try {
      await updateClass(classId, editName.trim());
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    }
  }

  async function handleDelete(classId: string) {
    setError(null);
    try {
      await deleteClass(classId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <>
      <form onSubmit={handleAdd} className="dash-card">
        <h2>새 반 추가</h2>
        <div className="dash-row">
          <input className="dash-input" placeholder="반 이름" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <button type="submit" className="dash-button">추가</button>
        </div>
      </form>

      {error && <p className="dash-error">{error}</p>}

      <table className="dash-table" style={{ marginTop: 16 }}>
        <thead>
          <tr><th>반 이름</th><th>학생 수</th><th></th></tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input className="dash-input" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginBottom: 0 }} />
                ) : c.name}
              </td>
              <td>{classCounts[c.id] || 0}명</td>
              <td className="dash-table-actions">
                {editingId === c.id ? (
                  <>
                    <button type="button" onClick={() => handleUpdate(c.id)}>저장</button>
                    <button type="button" onClick={() => setEditingId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setEditingId(c.id); setEditName(c.name); }}>수정</button>
                    <button type="button" onClick={() => handleDelete(c.id)}>삭제</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr><td colSpan={3} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>등록된 반이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
