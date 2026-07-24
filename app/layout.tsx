import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DullG — Story, Evidence, Judgment",
  description: "이야기 속 증거를 읽고 자신의 판단을 설명하는 경험을 수업·게임·리포트로 연결하는 콘텐츠 플랫폼.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
