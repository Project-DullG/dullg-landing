import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { ScoreChart } from "@/components/dashboard/score-chart";
import Link from "@/components/i18n/link";
import {
  StudentConnections,
  type MembershipItem,
} from "@/components/dashboard/student-connections";
import {
  isRegistrationDocumentId,
  studentMembershipCanRead,
  type ApplicationStatus,
} from "@/lib/student-registration";
import { loginPath } from "@/lib/auth-navigation";
export default async function MyGradesPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string | string[]; academy?: string | string[] }>;
}) {
  const t = await getText();
  const session = await verifySession();
  if (!session) return localizedRedirect(loginPath("/dashboard/my"));
  if (session.role && session.role !== "student") return localizedRedirect("/dashboard");
  const query = await searchParams;
  const requestedAcademyId = isRegistrationDocumentId(query.academy) ? query.academy : "";
  const db = getAdminDb();
  const profileRef = db.collection("studentProfiles").doc(session.uid);
  const [profileDoc, membershipDocs] = await Promise.all([
    profileRef.get(),
    profileRef.collection("memberships").get(),
  ]);
  const ownProfile = profileDoc.data();
  const profile = ownProfile?.userId === session.uid ? ownProfile : undefined;
  const statuses: ApplicationStatus[] = ["pending", "approved", "rejected", "left"];
  const memberships: MembershipItem[] = [];
  for (const doc of membershipDocs.docs) {
    const data = doc.data();
    if (
      data.userId !== session.uid ||
      data.academyId !== doc.id ||
      !isRegistrationDocumentId(doc.id)
    )
      continue;
    const application = (
      await db
        .collection("academies")
        .doc(doc.id)
        .collection("studentApplications")
        .doc(session.uid)
        .get()
    ).data();
    if (
      !application ||
      application.userId !== session.uid ||
      !statuses.includes(application.status)
    )
      continue;
    const academy = (await db.collection("academies").doc(doc.id).get()).data();
    memberships.push({
      academyId: doc.id,
      academyName: String(academy?.name ?? t("학원")),
      status: application.status,
    });
  }
  const legacyAcademy = isRegistrationDocumentId(session.academyId) ? session.academyId : "";
  const legacyStudentId = isRegistrationDocumentId(session.studentId) ? session.studentId : "";
  if (
    session.role === "student" &&
    legacyAcademy &&
    legacyStudentId &&
    !memberships.some((m) => m.academyId === legacyAcademy)
  ) {
    const academyRef = db.collection("academies").doc(legacyAcademy);
    const application = (
      await academyRef.collection("studentApplications").doc(session.uid).get()
    ).data();
    if (!application) {
      const legacy = (await academyRef.collection("students").doc(legacyStudentId).get()).data();
      if (
        legacy?.userId === session.uid &&
        (legacy.status === undefined || legacy.status === "active")
      ) {
        memberships.push({
          academyId: legacyAcademy,
          academyName: String((await academyRef.get()).data()?.name ?? t("학원")),
          status: "approved",
          legacy: true,
        });
      }
    }
  }
  const selectedAcademy = requestedAcademyId || (legacyStudentId ? legacyAcademy : "");
  let student: Record<string, unknown> | undefined;
  let gradesSnap: Awaited<ReturnType<ReturnType<typeof db.collection>["get"]>> | undefined;
  if (selectedAcademy) {
    const academyRef = db.collection("academies").doc(selectedAcademy);
    const application = (
      await academyRef.collection("studentApplications").doc(session.uid).get()
    ).data();
    const legacyAllowed =
      !application &&
      selectedAcademy === legacyAcademy &&
      session.role === "student" &&
      !!legacyStudentId;
    if (
      (application?.userId === session.uid && application.status === "approved") ||
      legacyAllowed
    ) {
      const studentId = application ? session.uid : legacyStudentId;
      const candidate = (await academyRef.collection("students").doc(studentId).get()).data();
      const allowed = application
        ? studentMembershipCanRead(session.uid, selectedAcademy, application, candidate ?? null)
        : candidate?.userId === session.uid &&
          (candidate.status === undefined || candidate.status === "active");
      if (allowed) {
        student = candidate;
        gradesSnap = await academyRef
          .collection("grades")
          .where("studentId", "==", studentId)
          .orderBy("date", "desc")
          .limit(50)
          .get();
      }
    }
  }
  const registered = query.registered === "1" && !!profile;
  const profileReady =
    !!profile && profile.emailVerified === true && profile.phoneVerified === true;
  const account = (
    <>
      <h1 className="dash-page-title">{t("내 추리노트와 학원")}</h1>
      {registered && (
        <p role="status" className="dash-success">
          {t("학생 정보 등록이 완료되었습니다.")}
        </p>
      )}
      <section className="dash-card">
        <h2>{t("추리노트")}</h2>
        <p>{t("작성한 페이지를 사진으로 저장하고, 언제든 이어서 등록할 수 있습니다.")}</p>
        <Link className="dash-button" href="/dashboard/notebook">
          {t("추리노트 사진 등록")}
        </Link>
      </section>
      <StudentConnections
        memberships={memberships}
        profileReady={profileReady}
        requestedAcademyId={requestedAcademyId}
      />
    </>
  );
  if (!student || !gradesSnap) return <div>{account}</div>;
  const verifiedGrades = gradesSnap;
  const grades = gradesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const dullgGrades = grades.filter((g: Record<string, unknown>) => g.type === "dullg");
  const examGrades = grades.filter((g: Record<string, unknown>) => g.type === "exam");
  return (
    <div>
      {account}
      <h2 className="dash-page-title">
        {t(String(student?.name ?? ""))}
        {t("님의 성적")}
      </h2>
      <div className="dash-card">
        <ScoreChart
          scores={[1, 2, 3, 4].map((session) => {
            const record = verifiedGrades.docs
              .find((doc) => doc.data().type === "dullg" && doc.data().session === session)
              ?.data();
            return {
              label: `${session}차시`,
              score: record && Number.isFinite(record.score) ? Number(record.score) : null,
            };
          })}
        />
        <p className="dash-description">{t("최근 50건 중 차시별 최신 점수입니다.")}</p>
      </div>

      <div className="dash-card">
        <h2>{t("미스터리 수업 성적")}</h2>
        {t(
          dullgGrades.length === 0 ? (
            <p>{t("아직 미스터리 수업 성적이 없습니다.")}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("차시")}</th>
                  <th>{t("점수")}</th>
                  <th>{t("참여도")}</th>
                  <th>{t("메모")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  dullgGrades.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string}>
                      <td>
                        {t(g.session as number)}
                        {t("차시")}
                      </td>
                      <td>
                        {t(g.score as number)}
                        {t("점")}
                      </td>
                      <td>{t(g.participation as string)}</td>
                      <td>{t((g.note as string) || "-")}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ),
        )}
      </div>

      <div className="dash-card">
        <h2>{t("일반 시험 성적")}</h2>
        {t(
          examGrades.length === 0 ? (
            <p style={{ color: "rgba(21,37,30,0.4)" }}>{t("시험 성적 기록이 없습니다.")}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("과목")}</th>
                  <th>{t("시험")}</th>
                  <th>{t("점수")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  examGrades.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string}>
                      <td>{t(g.subject as string)}</td>
                      <td>{t(g.examName as string)}</td>
                      <td>
                        {t(g.score as number)}/{t(g.totalScore as number)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ),
        )}
      </div>
    </div>
  );
}
