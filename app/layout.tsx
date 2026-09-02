import type { Metadata } from "next";
import {
  DM_Mono,
  DM_Sans,
  Noto_Sans_KR,
  Noto_Serif_KR,
  Playfair_Display,
} from "next/font/google";
import { SITE_URL } from "../lib/site";
import "./globals.css";
import "./activity.css";
import "./work-detail.css";

const dmMono = DM_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono", display: "swap" });
const dmSans = DM_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" });
const notoSansKR = Noto_Sans_KR({ weight: ["400", "500", "600", "700", "800"], preload: false, variable: "--font-noto-sans", display: "swap" });
const notoSerifKR = Noto_Serif_KR({ weight: ["500", "600"], preload: false, variable: "--font-noto-serif", display: "swap" });
const playfair = Playfair_Display({ weight: ["500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠",
  description:
    "단서공방(ProjectDullG)이 만든 머더미스터리 작품과 제작 기록, 준비 중인 영어 미스터리 수업팩을 소개합니다.",
  keywords: ["단서공방", "ProjectDullG", "머더미스터리", "추리 콘텐츠", "영어 미스터리 수업팩"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠",
    description:
      "단서공방의 머더미스터리 작품, 제작 기록과 영어 미스터리 수업팩을 소개합니다.",
    siteName: "단서공방 ProjectDullG",
    images: [
      {
        url: "/og.webp",
        width: 1731,
        height: 909,
        alt: "단서공방 머더미스터리 작품과 영어 수업 자료",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠",
    description:
      "단서공방의 머더미스터리 작품, 제작 기록과 영어 미스터리 수업팩.",
    images: ["/og.webp"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${dmMono.variable} ${dmSans.variable} ${notoSansKR.variable} ${notoSerifKR.variable} ${playfair.variable}`;
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
