import { applyAquariumTheme } from "./catalog/fishing/growth";
import { createHash } from "node:crypto";
import { applyRepeat, type RepeatAction } from "./catalog/speaking/repeat";
import { collectionRecords } from "./catalog/fishing/collection";
import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { emptyState, type FishingState } from "./catalog/fishing/model";
import { applyCompletion, type Completion } from "./catalog/fishing/rules";
import { buildStudySnapshot, studySelection } from "./catalog/view";

export class StudyInputError extends Error {}

function seeded(state: FishingState, uid: string): FishingState {
  return {
    ...state,
    collectionSeed: createHash("sha256")
      .update(`speaking-fish-v1:${uid}`)
      .digest("hex")
      .slice(0, 16),
  };
}

function record(uid: string) {
  // UID is supplied only by the verified server session.
  return getAdminDb().collection("speakingProgress").doc(uid);
}
export async function readProgress(uid: string): Promise<FishingState> {
  const snapshot = await record(uid).get();
  if (!snapshot.exists) return seeded(emptyState(), uid);
  const data = snapshot.data();
  if (
    data?.version !== 1 ||
    !Array.isArray(data.state?.events) ||
    !Array.isArray(data.state?.quizzes)
  )
    throw new Error("저장된 학습 기록을 확인하지 못했습니다.");
  return seeded(data.state as FishingState, uid);
}
export async function studySnapshot(uid: string, input: Record<string, unknown> = {}) {
  const state = await readProgress(uid);
  return buildStudySnapshot(state, studySelection(state, input));
}
export async function completeStudy(uid: string, input: Completion) {
  const db = getAdminDb(),
    ref = record(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const stored = doc.data();
    if (doc.exists && stored?.version !== 1) throw new Error("학습 기록 버전을 확인하세요.");
    const state = seeded((stored?.state || emptyState()) as FishingState, uid);
    let result;
    try {
      result = applyCompletion(state, input);
    } catch (error) {
      throw new StudyInputError(
        error instanceof Error ? error.message : "완료할 단계를 확인하세요.",
      );
    }
    if (!result.duplicate)
      tx.set(ref, { version: 1, state: result.state, updatedAt: new Date().toISOString() });
    return result;
  });
}
export async function featureFish(uid: string, fish: number, catchId?: string) {
  const db = getAdminDb(),
    ref = record(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const stored = doc.data();
    if (doc.exists && stored?.version !== 1) throw new Error("학습 기록 버전을 확인하세요.");
    const state = seeded((stored?.state || emptyState()) as FishingState, uid);
    if (!Number.isInteger(fish) || !collectionRecords(state).some((item) => item.fish === fish))
      throw new StudyInputError("잡은 물고기 중에서 선택하세요.");
    const selected = collectionRecords(state)
      .filter((c) => c.fish === fish)
      .sort((a, b) => b.length - a.length);
    const specimen = catchId === undefined ? selected[0] : selected.find((c) => c.id === catchId);
    if (!specimen) throw new StudyInputError("보유한 물고기 중에서 선택하세요.");
    const next = { ...state, featured: fish, featuredCatchId: specimen.id };
    tx.set(ref, { version: 1, state: next, updatedAt: new Date().toISOString() });
    return next;
  });
}

export async function updateRepeat(uid: string, input: RepeatAction) {
  const db = getAdminDb(),
    ref = record(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref),
      stored = doc.data();
    if (doc.exists && stored?.version !== 1) throw new Error("학습 기록 버전을 확인하세요.");
    const state = seeded((stored?.state || emptyState()) as FishingState, uid);
    let result;
    try {
      result = applyRepeat(state, input);
    } catch (error) {
      throw new StudyInputError(error instanceof Error ? error.message : "연습 요청을 확인하세요.");
    }
    if (!result.duplicate)
      tx.set(ref, { version: 1, state: result.state, updatedAt: new Date().toISOString() });
    return result;
  });
}

export async function decorateAquarium(uid: string, theme: unknown) {
  const db = getAdminDb(),
    ref = record(uid);
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref),
      stored = doc.data();
    if (doc.exists && stored?.version !== 1) throw new Error("학습 기록 버전을 확인하세요.");
    const state = seeded((stored?.state || emptyState()) as FishingState, uid);
    let next;
    try {
      next = applyAquariumTheme(state, theme);
    } catch {
      throw new StudyInputError("열린 수조 중에서 선택하세요.");
    }
    tx.set(ref, { version: 1, state: next, updatedAt: new Date().toISOString() });
    return next;
  });
}
