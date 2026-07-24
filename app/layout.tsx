import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DullG | 영어학원 방학특강 4차시 수업팩 — 교사 준비 30분, 학생 결과물 포함",
  description:
    "초6~중1 영어학원을 위한 완성형 4차시 수업팩. 영어 미스터리 프로젝트 수업으로 학생이 참여하고 학부모에게 보여줄 결과물이 남습니다. 파일럿 자료 무료 제공.",
  keywords: ["영어학원", "방학특강", "수업자료", "영어수업팩", "중등영어", "초등영어", "학원특강"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "DullG | 영어학원 방학특강 4차시 수업팩",
    description:
      "교사 준비 30분 이내. 학생은 영어로 사건을 해결하고, 학부모에겐 결과물이 남는 방학특강 수업팩.",
    siteName: "DullG",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
