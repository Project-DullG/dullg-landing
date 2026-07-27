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

const dmMono = DM_Mono({ weight: "400", subsets: ["latin"], variable: "--font-mono", display: "swap" });
const dmSans = DM_Sans({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" });
const notoSansKR = Noto_Sans_KR({ weight: ["400", "500", "600", "700", "800"], preload: false, variable: "--font-noto-sans", display: "swap" });
const notoSerifKR = Noto_Serif_KR({ weight: ["500", "600"], preload: false, variable: "--font-noto-serif", display: "swap" });
const playfair = Playfair_Display({ weight: ["500", "600"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DullG | 영어학원 방학특강 4차시 수업팩 — 첫 수업 준비 30분 목표",
  description:
    "초6~중1 영어학원을 위한 완성형 4차시 수업팩. 영어 미스터리 프로젝트 수업으로 학생이 참여하고, 학부모에게 보여줄 결과물이 남습니다. 무료 샘플 제공.",
  keywords: ["영어학원", "방학특강", "수업자료", "영어수업팩", "중등영어", "초등영어", "학원특강"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "DullG | 영어학원 방학특강 4차시 수업팩",
    description:
      "첫 수업 준비 30분 이내를 목표로 설계했습니다. 학생은 영어로 사건을 해결하고, 학부모에게 보여줄 결과물이 남습니다.",
    siteName: "DullG",
    images: [
      {
        url: "/assets/dullg/classroom-case.png",
        alt: "DullG 영어 미스터리 수업이 시작되는 교실",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DullG | 영어학원 방학특강 4차시 수업팩",
    description:
      "영어 단서를 읽고 토론하며 사건보고서로 마무리하는 초6~중1 4차시 수업팩.",
    images: ["/assets/dullg/classroom-case.png"],
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
