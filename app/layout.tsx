import type { Metadata } from "next";
import { DM_Mono, Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const notoSansKR = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  preload: false,
  variable: "--font-noto-sans",
  display: "swap",
});
const notoSerifKR = Noto_Serif_KR({
  weight: ["500", "600"],
  preload: false,
  variable: "--font-noto-serif",
  display: "swap",
});
const playfair = Playfair_Display({
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠", template: "%s | 단서공방" },
  description:
    "단서공방이 만든 머더미스터리 작품과 제작 기록, 영어 미스터리 수업팩과 학원 운영 도구를 소개합니다.",
  keywords: [
    "단서공방",
    "ProjectDullG",
    "머더미스터리",
    "추리 콘텐츠",
    "영어 미스터리 수업팩",
    "학원 관리",
  ],
  openGraph: { type: "website", locale: "ko_KR", siteName: "단서공방" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${dmMono.variable} ${notoSansKR.variable} ${notoSerifKR.variable} ${playfair.variable}`;
  return (
    <html lang="ko" className={fontVars} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 바로가기
        </a>
        {children}
      </body>
    </html>
  );
}
