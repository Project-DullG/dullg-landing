import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DullG — 영어를 읽고, 추리하고, 설명하는 수업",
  description: "초등 영어 학원을 위한 미스터리 프로젝트 수업. 단서를 읽고, 토론하고, 자신의 판단을 보고서로 남깁니다.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
