// ── Types ──────────────────────────────────────────────────

export type StudentData = {
  name: string;
  grade: number;
  parentContact: string;
  classId: string;
};

export type DullgGradeData = {
  type: "dullg";
  studentId: string;
  session: number;
  score: number;
  participation: "상" | "중" | "하";
  note: string;
  date: Date;
};

export type ExamGradeData = {
  type: "exam";
  studentId: string;
  subject: string;
  examName: string;
  score: number;
  totalScore: number;
  date: Date;
};

export type GradeData = DullgGradeData | ExamGradeData;

// ── Validators ─────────────────────────────────────────────

export function validateStudent(data: StudentData): string | null {
  if (!data.name.trim()) return "이름을 입력해주세요.";
  if (!Number.isInteger(data.grade) || data.grade < 1 || data.grade > 12)
    return "학년은 1~12 사이 정수여야 합니다.";
  if (!data.parentContact.trim()) return "학부모 연락처를 입력해주세요.";
  return null;
}

export function validateGrade(data: GradeData): string | null {
  if (data.type === "dullg") {
    if (!Number.isInteger(data.session) || data.session < 1 || data.session > 4)
      return "차시는 1~4 사이 정수여야 합니다.";
    if (data.score < 0 || data.score > 100) return "점수는 0~100 사이여야 합니다.";
    if (!["상", "중", "하"].includes(data.participation))
      return "참여도는 상/중/하 중 하나여야 합니다.";
  } else {
    if (!data.subject.trim()) return "과목명을 입력해주세요.";
    if (!data.examName.trim()) return "시험명을 입력해주세요.";
    if (data.score < 0) return "점수는 0 이상이어야 합니다.";
    if (data.totalScore <= 0) return "만점은 0보다 커야 합니다.";
  }
  return null;
}
