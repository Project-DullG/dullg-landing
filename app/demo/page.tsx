import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { AcademyDemo } from "./academy-demo";
export async function generateMetadata() {
  return localizeMetadata({
    title: "학원 관리 체험",
    description:
      "가상 학생 데이터로 반별 조회와 성적 입력을 체험합니다. 실제 데이터는 저장하지 않습니다.",
    robots: { index: false, follow: true },
  });
}
export default function DemoPage() {
  const t = useText();
  return <AcademyDemo />;
}
