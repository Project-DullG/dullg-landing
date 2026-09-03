"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function createAcademy(name: string) {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");

  const ref = await adminDb.collection("academies").add({
    name,
    ownerId: session.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Set academyId in custom claims
  await adminAuth.setCustomUserClaims(session.uid, {
    ...((await adminAuth.getUser(session.uid)).customClaims || {}),
    academyId: ref.id,
  });

  redirect("/dashboard");
}

export async function updateAcademy(academyId: string, name: string) {
  const session = await verifySession();
  if (!session || session.role !== "owner") throw new Error("권한이 없습니다.");

  const doc = await adminDb.collection("academies").doc(academyId).get();
  if (!doc.exists || doc.data()?.ownerId !== session.uid) throw new Error("권한이 없습니다.");

  await adminDb.collection("academies").doc(academyId).update({
    name,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
