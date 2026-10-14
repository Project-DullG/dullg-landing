"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateStudent, type StudentData } from "@/lib/validators";

async function getAcademyId(): Promise<string> {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");
  const academyId = session.academyId as string;
  if (!academyId) throw new Error("학원이 등록되지 않았습니다.");
  const academy = await getAdminDb().collection("academies").doc(academyId).get();
  if (!academy.exists || academy.data()?.ownerId !== session.uid)
    throw new Error("권한이 없습니다.");
  return academyId;
}

export async function addStudent(data: StudentData) {
  // Contact verification and account linkage can only be set by registration.
  const editable = {
    name: data.name,
    grade: data.grade,
    parentContact: data.parentContact,
    classId: data.classId,
  };
  const error = validateStudent(editable);
  if (error) throw new Error(error);

  const academyId = await getAcademyId();

  await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .add({
      ...editable,
      userId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidatePath("/dashboard/students");
}

export async function updateStudent(studentId: string, data: StudentData) {
  const academyId = await getAcademyId();
  const studentRef = getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId);
  const existing = await studentRef.get();
  if (!existing.exists) throw new Error("학생을 찾을 수 없습니다.");
  const editable = {
    name: data.name,
    grade: data.grade,
    parentContact: data.parentContact,
    classId: data.classId,
  };
  const verifiedPhone = existing.data()?.phoneNumber;
  const error = validateStudent({
    ...editable,
    phoneNumber: typeof verifiedPhone === "string" ? verifiedPhone : undefined,
  });
  if (error) throw new Error(error);
  await studentRef.update({
    ...editable,
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/dashboard/students");
  revalidatePath(`/dashboard/students/${studentId}`);
}

export async function deleteStudent(studentId: string) {
  const academyId = await getAcademyId();
  const studentRef = getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId);

  // Delete related grades
  const grades = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .where("studentId", "==", studentId)
    .get();

  const batch = getAdminDb().batch();
  grades.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(studentRef);
  await batch.commit();

  revalidatePath("/dashboard/students");
}
