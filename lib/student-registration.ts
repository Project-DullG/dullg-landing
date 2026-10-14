export type StudentProfileInput = { name: string };
export type ApplicationStatus = "pending" | "approved" | "rejected" | "left";
export type ApplicationDecision = "approve" | "reject";
export type StudentIdentity = {
  uid: string;
  role?: unknown;
  academyId?: unknown;
  studentId?: unknown;
  googleLinked: boolean;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
};
export type StudentProfile = {
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  emailVerified: true;
  phoneVerified: true;
};
export type StudentApplication = Pick<
  StudentProfile,
  "userId" | "name" | "email" | "phoneNumber"
> & {
  academyId: string;
  status: ApplicationStatus;
};
export type ApprovedStudent = Pick<StudentProfile, "userId" | "name" | "email" | "phoneNumber"> & {
  grade: null;
  classId: "";
  status: "active";
};
export type MutationResult = { success: true };
export type ApplicationResult = MutationResult & { status: ApplicationStatus };
type Document = Record<string, unknown>;

export interface StudentRegistrationTransaction {
  getProfile(uid: string): Promise<Document | null>;
  getAcademy(academyId: string): Promise<Document | null>;
  getApplication(academyId: string, uid: string): Promise<Document | null>;
  getMembership(uid: string, academyId: string): Promise<Document | null>;
  getStudent(academyId: string, uid: string): Promise<Document | null>;
  saveProfile(uid: string, profile: StudentProfile, exists: boolean): void;
  saveApplication(
    academyId: string,
    uid: string,
    application: StudentApplication,
    exists: boolean,
  ): void;
  saveMembership(
    uid: string,
    academyId: string,
    application: StudentApplication,
    exists: boolean,
  ): void;
  createStudent(academyId: string, uid: string, student: ApprovedStudent): void;
  updateStudentStatus(academyId: string, uid: string, status: "active" | "inactive"): void;
}
export interface StudentRegistrationDependencies {
  getIdentity(uid: string): Promise<StudentIdentity>;
  transaction<T>(work: (tx: StudentRegistrationTransaction) => Promise<T>): Promise<T>;
}

const INVALID_ACCOUNT = "계정 정보를 확인해 주세요.";
const INVALID_MEMBERSHIP = "학원 신청 정보를 확인할 수 없습니다. 학원에 문의해 주세요.";
const STUDENT_ONLY = "학생 계정으로만 등록할 수 있습니다. 원장·교사 계정은 사용할 수 없습니다.";
const VERIFICATION_REQUIRED = "본인 이메일과 휴대전화 인증을 완료해 주세요.";
const PROFILE_REQUIRED = "본인 인증 후 학생 정보를 먼저 저장해 주세요.";
const STATUSES: ApplicationStatus[] = ["pending", "approved", "rejected", "left"];

export function isRegistrationDocumentId(value: unknown): value is string {
  return (
    typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value) && !/^__.*__$/.test(value)
  );
}
function requireUid(uid: unknown): asserts uid is string {
  if (!isRegistrationDocumentId(uid)) throw new Error(INVALID_ACCOUNT);
}
function requireAcademyId(value: unknown): string {
  if (typeof value !== "string") throw new Error("학원 코드를 확인해 주세요.");
  const academyId = value.trim();
  if (!isRegistrationDocumentId(academyId)) throw new Error("학원 코드를 확인해 주세요.");
  return academyId;
}
function requireStudentRole(identity: StudentIdentity) {
  if (identity.role !== undefined && identity.role !== null && identity.role !== "student")
    throw new Error(STUDENT_ONLY);
}
async function identityFor(uid: string, deps: StudentRegistrationDependencies) {
  requireUid(uid);
  const identity = await deps.getIdentity(uid);
  if (identity.uid !== uid) throw new Error(INVALID_ACCOUNT);
  return identity;
}
function verifiedContact(identity: StudentIdentity): { email: string; phoneNumber: string } {
  requireStudentRole(identity);
  if (
    !identity.googleLinked ||
    !identity.emailVerified ||
    typeof identity.email !== "string" ||
    !identity.email.trim() ||
    identity.email.length > 254 ||
    /[\s\u0000-\u001f\u007f]/.test(identity.email) ||
    typeof identity.phoneNumber !== "string" ||
    !/^\+[1-9]\d{7,14}$/.test(identity.phoneNumber)
  )
    throw new Error(VERIFICATION_REQUIRED);
  return { email: identity.email, phoneNumber: identity.phoneNumber };
}
export function validateStudentProfile(input: unknown): StudentProfileInput {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("등록 정보를 확인해 주세요.");
  const fields = input as Document;
  if (
    Object.keys(fields).length !== 1 ||
    !Object.hasOwn(fields, "name") ||
    typeof fields.name !== "string"
  )
    throw new Error("등록 정보를 확인해 주세요.");
  const name = fields.name.trim();
  if (!name || name.length > 50 || /[\u0000-\u001f\u007f]/.test(name))
    throw new Error("이름을 확인해 주세요.");
  return { name };
}
function requireProfile(
  profile: Document | null,
  uid: string,
  identity: StudentIdentity,
): StudentProfile {
  const contact = verifiedContact(identity);
  if (
    !profile ||
    profile.userId !== uid ||
    profile.emailVerified !== true ||
    profile.phoneVerified !== true ||
    profile.email !== contact.email ||
    profile.phoneNumber !== contact.phoneNumber ||
    typeof profile.name !== "string"
  )
    throw new Error(PROFILE_REQUIRED);
  return {
    userId: uid,
    ...validateStudentProfile({ name: profile.name }),
    ...contact,
    emailVerified: true,
    phoneVerified: true,
  };
}
function readApplication(
  value: Document | null,
  uid: string,
  academyId: string,
): StudentApplication | null {
  if (!value) return null;
  if (
    value.userId !== uid ||
    value.academyId !== academyId ||
    !STATUSES.includes(value.status as ApplicationStatus) ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.phoneNumber !== "string"
  )
    throw new Error(INVALID_MEMBERSHIP);
  return value as StudentApplication;
}
function matchingApplication(
  canonical: Document | null,
  mirror: Document | null,
  uid: string,
  academyId: string,
) {
  const application = readApplication(canonical, uid, academyId);
  const membership = readApplication(mirror, uid, academyId);
  if (
    !!application !== !!membership ||
    (application && membership && application.status !== membership.status)
  )
    throw new Error(INVALID_MEMBERSHIP);
  return application;
}
function writeApplication(
  tx: StudentRegistrationTransaction,
  application: StudentApplication,
  exists: boolean,
) {
  tx.saveApplication(application.academyId, application.userId, application, exists);
  tx.saveMembership(application.userId, application.academyId, application, exists);
}
function requireOwnStudent(student: Document | null, uid: string) {
  if (student && student.userId !== uid) throw new Error(INVALID_MEMBERSHIP);
}

/** Canonical approval and an active owned record are both required to read grades. */
export function studentMembershipCanRead(
  uid: string,
  academyId: string,
  application: unknown,
  student: unknown,
): boolean {
  if (!isRegistrationDocumentId(uid) || !isRegistrationDocumentId(academyId)) return false;
  if (!application || typeof application !== "object" || !student || typeof student !== "object")
    return false;
  const record = application as Document;
  const enrolled = student as Document;
  return (
    record.userId === uid &&
    record.academyId === academyId &&
    record.status === "approved" &&
    enrolled.userId === uid &&
    enrolled.status === "active"
  );
}

export async function saveStudentProfile(
  input: unknown,
  uid: string,
  deps: StudentRegistrationDependencies,
): Promise<MutationResult> {
  const details = validateStudentProfile(input);
  const identity = await identityFor(uid, deps);
  const contact = verifiedContact(identity);
  const profile: StudentProfile = {
    userId: uid,
    ...details,
    ...contact,
    emailVerified: true,
    phoneVerified: true,
  };
  await deps.transaction(async (tx) => {
    const existing = await tx.getProfile(uid);
    if (existing && existing.userId !== uid) throw new Error(INVALID_ACCOUNT);
    if (!existing || Object.entries(profile).some(([key, value]) => existing[key] !== value))
      tx.saveProfile(uid, profile, !!existing);
  });
  return { success: true };
}

export async function requestAcademyMembership(
  academy: unknown,
  uid: string,
  deps: StudentRegistrationDependencies,
): Promise<ApplicationResult> {
  const academyId = requireAcademyId(academy);
  const identity = await identityFor(uid, deps);
  verifiedContact(identity);
  return deps.transaction(async (tx) => {
    const profile = requireProfile(await tx.getProfile(uid), uid, identity);
    const academyDoc = await tx.getAcademy(academyId);
    if (!academyDoc) throw new Error("학원 코드를 확인해 주세요. 등록된 학원을 찾을 수 없습니다.");
    if (academyDoc.ownerId === uid) throw new Error(STUDENT_ONLY);
    const application = matchingApplication(
      await tx.getApplication(academyId, uid),
      await tx.getMembership(uid, academyId),
      uid,
      academyId,
    );
    if (application?.status === "pending" || application?.status === "approved")
      return { success: true, status: application.status };
    writeApplication(
      tx,
      {
        userId: uid,
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        academyId,
        status: "pending",
      },
      !!application,
    );
    return { success: true, status: "pending" };
  });
}

export async function leaveAcademyMembership(
  academy: unknown,
  uid: string,
  deps: StudentRegistrationDependencies,
): Promise<ApplicationResult> {
  const academyId = requireAcademyId(academy);
  const identity = await identityFor(uid, deps);
  return deps.transaction(async (tx) => {
    const application = matchingApplication(
      await tx.getApplication(academyId, uid),
      await tx.getMembership(uid, academyId),
      uid,
      academyId,
    );
    if (!application) {
      // Older linked accounts use a teacher-created student ID. Leave that
      // owned record inactive and establish a canonical revocation so stale
      // token claims cannot keep granting access.
      if (
        identity.role === "student" &&
        identity.academyId === academyId &&
        isRegistrationDocumentId(identity.studentId)
      ) {
        const legacy = await tx.getStudent(academyId, identity.studentId);
        requireOwnStudent(legacy, uid);
        if (legacy) {
          const snapshot: StudentApplication = {
            userId: uid,
            academyId,
            status: "left",
            name: typeof legacy.name === "string" ? legacy.name : "학생",
            email: identity.email ?? (typeof legacy.email === "string" ? legacy.email : ""),
            phoneNumber:
              identity.phoneNumber ??
              (typeof legacy.phoneNumber === "string" ? legacy.phoneNumber : ""),
          };
          writeApplication(tx, snapshot, false);
          if (legacy.status !== "inactive")
            tx.updateStudentStatus(academyId, identity.studentId, "inactive");
        }
      }
      return { success: true, status: "left" };
    }
    const student = await tx.getStudent(academyId, uid);
    requireOwnStudent(student, uid);
    if (application.status !== "left")
      writeApplication(tx, { ...application, status: "left" }, true);
    if (student && student.status !== "inactive")
      tx.updateStudentStatus(academyId, uid, "inactive");
    return { success: true, status: "left" };
  });
}

export async function reviewAcademyApplication(
  studentUid: unknown,
  decision: unknown,
  ownerUid: string,
  academy: unknown,
  deps: StudentRegistrationDependencies,
): Promise<ApplicationResult> {
  requireUid(studentUid);
  const academyId = requireAcademyId(academy);
  if (decision !== "approve" && decision !== "reject")
    throw new Error("승인 또는 거절을 선택해 주세요.");
  const owner = await identityFor(ownerUid, deps);
  if (owner.role !== "owner" || owner.academyId !== academyId || studentUid === ownerUid)
    throw new Error("학원 관리 권한이 없습니다.");
  const identity = decision === "approve" ? await identityFor(studentUid, deps) : null;
  if (identity) verifiedContact(identity);
  return deps.transaction(async (tx) => {
    const academyDoc = await tx.getAcademy(academyId);
    if (!academyDoc || academyDoc.ownerId !== ownerUid)
      throw new Error("학원 관리 권한이 없습니다.");
    const application = matchingApplication(
      await tx.getApplication(academyId, studentUid),
      await tx.getMembership(studentUid, academyId),
      studentUid,
      academyId,
    );
    if (!application) throw new Error("대기 중인 학원 신청을 찾을 수 없습니다.");
    const student = await tx.getStudent(academyId, studentUid);
    requireOwnStudent(student, studentUid);
    const desired = decision === "approve" ? "approved" : "rejected";
    if (application.status === desired) {
      if (desired === "approved" && (!student || student.status !== "active"))
        throw new Error(INVALID_MEMBERSHIP);
      return { success: true, status: desired };
    }
    if (application.status !== "pending") throw new Error("대기 중인 신청만 처리할 수 있습니다.");
    const profile = identity
      ? requireProfile(await tx.getProfile(studentUid), studentUid, identity)
      : null;
    writeApplication(tx, { ...application, status: desired }, true);
    if (profile) {
      if (student) tx.updateStudentStatus(academyId, studentUid, "active");
      else
        tx.createStudent(academyId, studentUid, {
          userId: studentUid,
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          grade: null,
          classId: "",
          status: "active",
        });
    } else if (student && student.status !== "inactive")
      tx.updateStudentStatus(academyId, studentUid, "inactive");
    return { success: true, status: desired };
  });
}
