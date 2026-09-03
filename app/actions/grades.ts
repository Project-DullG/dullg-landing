"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateGrade, type GradeData } from "@/lib/validators";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  return academyId;
}

export async function addGrade(data: GradeData) {
  const error = validateGrade(data);
  if (error) throw new Error(error);

  const academyId = await getAcademyId();

  // Get student's userId for security rules
  const studentDoc = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(data.studentId)
    .get();

  if (!studentDoc.exists) throw new Error("학생을 찾을 수 없습니다.");
  const userId = studentDoc.data()?.userId || null;

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .add({
      ...data,
      userId,
      date: data.date,
      createdAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/grades");
  revalidatePath(`/dashboard/students/${data.studentId}`);
}

export async function deleteGrade(gradeId: string) {
  const academyId = await getAcademyId();

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .doc(gradeId)
    .delete();

  revalidatePath("/dashboard/grades");
}
