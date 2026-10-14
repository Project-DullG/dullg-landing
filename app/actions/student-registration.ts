"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import {
  saveStudentProfile,
  requestAcademyMembership,
  leaveAcademyMembership,
  reviewAcademyApplication,
  type StudentProfileInput,
  type ApplicationDecision,
  type ApplicationResult,
  type MutationResult,
  type StudentRegistrationDependencies,
  type StudentRegistrationTransaction,
} from "@/lib/student-registration";

function dependencies(): StudentRegistrationDependencies {
  const db = getAdminDb();
  const auth = getAdminAuth();
  const profileRef = (uid: string) => db.collection("studentProfiles").doc(uid);
  const applicationRef = (academyId: string, uid: string) =>
    db.collection("academies").doc(academyId).collection("studentApplications").doc(uid);
  const membershipRef = (uid: string, academyId: string) =>
    profileRef(uid).collection("memberships").doc(academyId);
  const studentRef = (academyId: string, uid: string) =>
    db.collection("academies").doc(academyId).collection("students").doc(uid);
  return {
    async getIdentity(uid) {
      const user = await auth.getUser(uid);
      if (user.disabled) throw new Error("계정 정보를 확인해 주세요.");
      return {
        uid: user.uid,
        role: user.customClaims?.role,
        academyId: user.customClaims?.academyId,
        studentId: user.customClaims?.studentId,
        googleLinked: user.providerData.some((provider) => provider.providerId === "google.com"),
        email: user.email ?? null,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber ?? null,
      };
    },
    async transaction(work) {
      return db.runTransaction(async (transaction) => {
        const read = async (ref: ReturnType<typeof profileRef>) => {
          const snapshot = await transaction.get(ref);
          return snapshot.exists ? (snapshot.data() ?? {}) : null;
        };
        const save = (ref: ReturnType<typeof profileRef>, data: object, exists: boolean) => {
          if (exists) transaction.update(ref, { ...data, updatedAt: FieldValue.serverTimestamp() });
          else
            transaction.create(ref, {
              ...data,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
        };
        const adapter: StudentRegistrationTransaction = {
          getProfile: (uid) => read(profileRef(uid)),
          getAcademy: (academyId) => read(db.collection("academies").doc(academyId)),
          getApplication: (academyId, uid) => read(applicationRef(academyId, uid)),
          getMembership: (uid, academyId) => read(membershipRef(uid, academyId)),
          getStudent: (academyId, uid) => read(studentRef(academyId, uid)),
          saveProfile: (uid, profile, exists) => save(profileRef(uid), profile, exists),
          saveApplication: (academyId, uid, application, exists) =>
            save(applicationRef(academyId, uid), application, exists),
          saveMembership: (uid, academyId, application, exists) =>
            save(membershipRef(uid, academyId), application, exists),
          createStudent: (academyId, uid, student) =>
            save(studentRef(academyId, uid), student, false),
          updateStudentStatus: (academyId, uid, status) => {
            transaction.update(studentRef(academyId, uid), {
              status,
              updatedAt: FieldValue.serverTimestamp(),
            });
          },
        };
        return work(adapter);
      });
    },
  };
}
async function requiredSession() {
  const session = await verifySession();
  if (!session) throw new Error("로그인이 필요합니다.");
  return session;
}
function refreshRegistration() {
  for (const path of [
    "/dashboard/register",
    "/dashboard/my",
    "/dashboard/students",
    "/en/dashboard/register",
    "/en/dashboard/my",
    "/en/dashboard/students",
  ])
    revalidatePath(path);
}

export async function saveStudentProfileAction(
  input: StudentProfileInput,
): Promise<MutationResult> {
  const session = await requiredSession();
  const result = await saveStudentProfile(input, session.uid, dependencies());
  refreshRegistration();
  return result;
}
export async function requestAcademyAction(academyId: string): Promise<ApplicationResult> {
  const session = await requiredSession();
  const result = await requestAcademyMembership(academyId, session.uid, dependencies());
  refreshRegistration();
  return result;
}
export async function leaveAcademyAction(academyId: string): Promise<ApplicationResult> {
  const session = await requiredSession();
  const result = await leaveAcademyMembership(academyId, session.uid, dependencies());
  refreshRegistration();
  return result;
}
export async function reviewStudentApplicationAction(
  studentUid: string,
  decision: ApplicationDecision,
): Promise<ApplicationResult> {
  const session = await requiredSession();
  const result = await reviewAcademyApplication(
    studentUid,
    decision,
    session.uid,
    session.academyId,
    dependencies(),
  );
  refreshRegistration();
  return result;
}
