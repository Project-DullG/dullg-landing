"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  return academyId;
}

export async function addClass(name: string) {
  if (!name.trim()) throw new Error("반 이름을 입력해주세요.");
  const academyId = await getAcademyId();

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .add({
      name,
      createdAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/classes");
}

export async function updateClass(classId: string, name: string) {
  if (!name.trim()) throw new Error("반 이름을 입력해주세요.");
  const academyId = await getAcademyId();

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .doc(classId)
    .update({ name });

  revalidatePath("/dashboard/classes");
}

export async function deleteClass(classId: string) {
  const academyId = await getAcademyId();

  // Check no students assigned
  const students = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .where("classId", "==", classId)
    .limit(1)
    .get();

  if (!students.empty) throw new Error("학생이 배정된 반은 삭제할 수 없습니다.");

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("classes")
    .doc(classId)
    .delete();

  revalidatePath("/dashboard/classes");
}
