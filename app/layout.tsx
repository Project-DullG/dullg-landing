import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morrow — 좋은 일은 선명함에서 시작됩니다",
  description: "팀의 생각을 정리하고 중요한 일에 집중하도록 돕는 업무 공간, Morrow.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
