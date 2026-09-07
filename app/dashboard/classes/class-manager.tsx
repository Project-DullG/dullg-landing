"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addClass, updateClass, deleteClass } from "@/app/actions/classes";

type ClassItem = { id: string; name: string };

export function ClassManager({
  classes,
  classCounts,
}: {
  classes: ClassItem[];
  classCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await addClass(newName.trim());
      setNewName("");
      setMessage("새 반을 추가했습니다.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "반 추가에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(classId: string) {
    setError(null);
    setBusy(true);
    try {
      await updateClass(classId, editName.trim());
      setEditingId(null);
      setMessage("반 이름을 수정했습니다.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(classId: string) {
    setError(null);
    setBusy(true);
    try {
      await deleteClass(classId);
      setDeleteId(null);
      setMessage("반을 삭제했습니다.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="dash-fieldset" disabled={busy}>
      <form onSubmit={handleAdd} className="dash-card">
        <h2>새 반 추가</h2>
        <div className="dash-row">
          <input
            aria-label="새 반 이름"
            className="dash-input"
            placeholder="반 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="dash-button">
            추가
          </button>
        </div>
      </form>

      <p role="status" className="dash-success">{busy ? "처리 중입니다…" : message}</p>
      {error && <p role="alert" className="dash-error">{error}</p>}
      <p className="dash-description">학생이 배정된 반은 삭제할 수 없습니다. 학생 관리에서 반을 먼저 변경해 주세요.</p>

      <table className="dash-table" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>반 이름</th>
            <th>학생 수</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input
                    aria-label={`${c.name} 새 이름`}
                    className="dash-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                ) : (
                  c.name
                )}
              </td>
              <td>{classCounts[c.id] || 0}명</td>
              <td className="dash-table-actions">
                {editingId === c.id ? (
                  <>
                    <button type="button" onClick={() => handleUpdate(c.id)}>
                      저장
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                      }}
                    >
                      수정
                    </button>
                    <button type="button" disabled={(classCounts[c.id] || 0) > 0} onClick={() => setDeleteId(c.id)}>
                      삭제
                    </button>
                  </>
                )}
                {deleteId === c.id && <div role="group" aria-label="반 삭제 확인"><p>{c.name} 반을 삭제할까요?</p><button type="button" onClick={() => handleDelete(c.id)}>삭제 확인</button><button type="button" onClick={() => setDeleteId(null)}>취소</button></div>}
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>
                등록된 반이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </fieldset>
  );
}
