"use client";
import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
import { useRouter } from "next/navigation";
import {
  StudentWorkspace,
  type StudentItem,
  type ClassItem,
} from "@/components/dashboard/student-workspace";
import { addStudent, updateStudent, deleteStudent } from "@/app/actions/students";
export function LiveStudents({
  students,
  classes,
  limited,
}: {
  students: StudentItem[];
  classes: ClassItem[];
  limited: boolean;
}) {
  const t = useText();
  const router = useRouter();
  return (
    <StudentWorkspace
      students={students}
      classes={classes}
      limited={limited}
      onSave={async (data, id) => {
        if (id) await updateStudent(id, data);
        else await addStudent(data);
        router.refresh();
      }}
      onDelete={async (id) => {
        await deleteStudent(id);
        router.refresh();
      }}
      detail={(student) => (
        <Link className="dash-button" href={`/dashboard/students/${student.id}`}>
          {t("성적 이력 보기 →")}
        </Link>
      )}
    />
  );
}
